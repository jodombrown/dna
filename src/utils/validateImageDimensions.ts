/**
 * Aspect-ratio and minimum-size guardrail for image uploads.
 *
 * Runs before compression so we reject on the file the user actually picked,
 * not on a re-encoded derivative. Decoding is best-effort: if the browser
 * cannot read the bitmap we let the upload through rather than blocking a
 * valid file, and the downstream upload surfaces any real failure.
 */

/** Portrait limit: 9:16. Anything taller is rejected. */
export const MIN_ASPECT_RATIO = 9 / 16;

/** Landscape limit: 16:9. Anything wider is rejected. */
export const MAX_ASPECT_RATIO = 16 / 9;

/** Shortest edge, in pixels, below which an image is too small to be usable. */
export const MIN_SHORT_EDGE = 200;

/**
 * Slack for images that are a pixel or two off an exact 16:9 / 9:16 crop
 * (e.g. 1920x1081). Wide enough to absorb rounding, far too small to admit a
 * genuinely out-of-range ratio.
 */
const RATIO_TOLERANCE = 0.005;

export type ImageDimensionRejection = 'too-tall' | 'too-wide' | 'too-small';

/**
 * Flat rather than a discriminated union: this project compiles with
 * `strict: false`, so TypeScript cannot narrow a union on an `ok: true` /
 * `ok: false` literal and every call site would have to cast.
 * `reason`, `title` and `description` are present exactly when `ok` is false.
 */
export interface ImageDimensionResult {
  ok: boolean;
  width: number;
  height: number;
  ratio: number;
  reason?: ImageDimensionRejection;
  /** Toast title, matching the existing upload rejection copy. */
  title?: string;
  /** Toast description, matching the existing upload rejection copy. */
  description?: string;
}

interface Dimensions {
  width: number;
  height: number;
}

/**
 * Reads intrinsic pixel dimensions. Prefers createImageBitmap and falls back
 * to an <img> decode for browsers that refuse the file type (Safari + some
 * animated formats). Returns null when neither path yields dimensions.
 */
async function readDimensions(file: File): Promise<Dimensions | null> {
  if (typeof createImageBitmap === 'function') {
    const bitmap = await createImageBitmap(file).catch(() => null);
    if (bitmap) {
      const { width, height } = bitmap;
      bitmap.close?.();
      if (width > 0 && height > 0) return { width, height };
    }
  }

  if (typeof Image !== 'function' || typeof URL?.createObjectURL !== 'function') {
    return null;
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    return await new Promise<Dimensions | null>((resolve) => {
      const img = new Image();
      img.onload = () => {
        const { naturalWidth, naturalHeight } = img;
        resolve(naturalWidth > 0 && naturalHeight > 0 ? { width: naturalWidth, height: naturalHeight } : null);
      };
      img.onerror = () => resolve(null);
      img.src = objectUrl;
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

/**
 * Validates that an image sits between 9:16 and 16:9 and clears the minimum
 * short-edge floor. Non-images and undecodable files pass through as ok.
 */
export async function validateImageDimensions(file: File): Promise<ImageDimensionResult> {
  const dimensions = await readDimensions(file);

  // Undecodable: fail open so this guardrail never blocks an otherwise valid upload.
  if (!dimensions) return { ok: true, width: 0, height: 0, ratio: 0 };

  const { width, height } = dimensions;
  const ratio = width / height;
  const shortEdge = Math.min(width, height);

  if (shortEdge < MIN_SHORT_EDGE) {
    return {
      ok: false,
      reason: 'too-small',
      width,
      height,
      ratio,
      title: 'Image too small',
      description: `This image is ${width}x${height}. Please upload one at least ${MIN_SHORT_EDGE}px on its shortest side.`,
    };
  }

  if (ratio < MIN_ASPECT_RATIO - RATIO_TOLERANCE) {
    return {
      ok: false,
      reason: 'too-tall',
      width,
      height,
      ratio,
      title: 'Image too tall',
      description: 'Please upload an image no taller than 9:16.',
    };
  }

  if (ratio > MAX_ASPECT_RATIO + RATIO_TOLERANCE) {
    return {
      ok: false,
      reason: 'too-wide',
      width,
      height,
      ratio,
      title: 'Image too wide',
      description: 'Please upload an image no wider than 16:9.',
    };
  }

  return { ok: true, width, height, ratio };
}
