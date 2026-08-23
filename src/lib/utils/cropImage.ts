export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number }
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) throw new Error('No canvas context');

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Canvas empty'));
    }, 'image/png');
  });
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

/* ------------------------------------------------------------------------- *
 * Composer crop step
 *
 * `getCroppedImg` above serves the avatar/banner surfaces: it emits a PNG Blob
 * at whatever pixel size the crop box happened to land on. The composer needs
 * two things it does not give.
 *
 *   1. A File, not a Blob, and one whose MIME type and extension still describe
 *      the bytes — the upload path names the stored object from the file's
 *      extension (uploadMedia "the stored extension follows the ARTEFACT"), and
 *      re-encoding a 20MB JPEG as PNG would multiply what we then ask the
 *      member to upload.
 *   2. An output whose ratio is EXACTLY the preset the member chose. The crop
 *      box arrives as fractional device pixels; rounding each side
 *      independently can push a 16:9 crop past the upload guardrail's own 16:9
 *      ceiling, and a deliberately-cropped image being rejected for its aspect
 *      is precisely the loop this step exists to end.
 * ------------------------------------------------------------------------- */

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** MIME types the composer will offer a crop for. */
export const CROPPABLE_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

/**
 * Animated formats are deliberately absent: a canvas crop reads one frame, so
 * cropping a GIF would silently discard its animation. Those files skip the
 * dialog and travel the pre-existing path untouched.
 */
export const isCroppableImage = (file: File): boolean =>
  CROPPABLE_IMAGE_TYPES.includes(file.type);

const EXTENSION_FOR_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

/** Lossless in, lossless out. Everything else re-encodes as JPEG. */
const outputTypeFor = (sourceType: string): string => {
  if (sourceType === 'image/png') return 'image/png';
  if (sourceType === 'image/webp') return 'image/webp';
  return 'image/jpeg';
};

const withExtensionFor = (name: string, type: string): string => {
  const base = (name || 'image').replace(/\.[^.]+$/, '') || 'image';
  return `${base}.${EXTENSION_FOR_TYPE[type] ?? 'jpg'}`;
};

/**
 * Output pixel dimensions for a crop, snapped to an exact aspect ratio.
 *
 * The long edge is rounded to the nearest pixel and the short edge is derived
 * from it and rounded UP. Rounding up always moves the emitted ratio toward
 * 1:1 — away from BOTH ends of the 9:16..16:9 window `validateImageDimensions`
 * enforces — so a crop taken at a preset sitting exactly on that boundary
 * (Landscape is 16:9, the ceiling itself) can never round outside it.
 *
 * Rounding the short edge to nearest instead would put a 356px-wide 16:9 crop
 * at 1.7822, inside the guardrail's 0.005 tolerance by six ten-thousandths.
 * That is not a margin, it is a coincidence.
 */
export function cropOutputSize(
  area: { width: number; height: number },
  aspect: number,
): { width: number; height: number } {
  if (aspect >= 1) {
    const width = Math.max(1, Math.round(area.width));
    return { width, height: Math.max(1, Math.ceil(width / aspect)) };
  }
  const height = Math.max(1, Math.round(area.height));
  return { width: Math.max(1, Math.ceil(height * aspect)), height };
}

/**
 * Extracts `area` from `imageSrc` at exactly `aspect` and returns it as a File
 * carrying `source`'s name and a MIME type that matches the bytes.
 *
 * The result is handed to the caller's existing pipeline in the same position
 * the picked file used to occupy — validateImageDimensions, then
 * compressAndTinify, then uploadMedia — so nothing downstream learns that a
 * crop happened.
 */
export async function cropImageToFile(
  imageSrc: string,
  area: CropArea,
  aspect: number,
  source: File,
): Promise<File> {
  const image = await createImage(imageSrc);
  const { width, height } = cropOutputSize(area, aspect);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No canvas context');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(image, area.x, area.y, area.width, area.height, 0, 0, width, height);

  const preferredType = outputTypeFor(source.type);
  const encode = (type: string): Promise<Blob | null> =>
    new Promise((resolve) =>
      canvas.toBlob(resolve, type, type === 'image/png' ? undefined : 0.92),
    );

  // Safari shipped canvas WebP encoding late enough that a null here is a real
  // possibility on older iOS; JPEG is the universal floor. The returned File's
  // type and extension follow whichever actually encoded.
  let type = preferredType;
  let blob = await encode(type);
  if ((!blob || blob.size === 0) && type !== 'image/jpeg') {
    type = 'image/jpeg';
    blob = await encode(type);
  }
  if (!blob || blob.size === 0) throw new Error('Canvas empty');

  return new File([blob], withExtensionFor(source.name, type), {
    type,
    lastModified: Date.now(),
  });
}
