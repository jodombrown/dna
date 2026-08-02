import { supabase } from "@/integrations/supabase/client";
import { compressAndTinify } from "@/lib/compressImage";

export type MediaClass = 'image' | 'video' | 'document';
export type Surface = 'post' | 'event' | 'story' | 'profile';

// The media matrix. A file is classified by its own MIME type against these
// three lists — the class is derived, never passed in, so a caller cannot
// mislabel a video as an image to sneak past a cap. Exported so the security
// suite can assert the live storage buckets' allowed_mime_types have not
// drifted from this one source of truth (a bucket edited by hand in the
// dashboard must fail CI).
export const IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/heif',
];

export const VIDEO_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/webm',
  'video/x-m4v',
  'video/x-msvideo',
  'video/x-matroska',
];

export const DOC_TYPES = [
  'application/pdf',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
  'text/plain',
];

const CAPS: Record<MediaClass, number> = {
  image: 25 * 1024 * 1024,
  video: 500 * 1024 * 1024,
  document: 100 * 1024 * 1024,
};

// The accept matrix. Pickers consume this instead of restating the type lists —
// one source of truth so a picker can never drift from what uploadMedia accepts.
// profile is image-only on purpose: an avatar field that accepts a PDF is a bug,
// not generosity (BD303).
export const ACCEPT: Record<Surface, string> = {
  post:    [...IMAGE_TYPES, ...VIDEO_TYPES, ...DOC_TYPES].join(','),
  event:   [...IMAGE_TYPES, ...VIDEO_TYPES, ...DOC_TYPES].join(','),
  story:   [...IMAGE_TYPES, ...VIDEO_TYPES, ...DOC_TYPES].join(','),
  profile: IMAGE_TYPES.join(','),
};

const classify = (type: string): MediaClass | null => {
  if (IMAGE_TYPES.includes(type)) return 'image';
  if (VIDEO_TYPES.includes(type)) return 'video';
  if (DOC_TYPES.includes(type)) return 'document';
  return null;
};

// The formats only Safari can render. They stay in IMAGE_TYPES and ACCEPT so the
// picker never rejects a member for shooting in their iPhone's default format
// (BD312 §1) — but the bytes that land must be universally decodable, so we
// convert them here before anything else touches the file.
const HEIC_TYPES = ['image/heic', 'image/heif'];

// BD312: HEIC/HEIF decode in Safari (and every iOS browser, all WebKit) but not
// in Chrome or Firefox. A member uploads from their iPhone, sees the image on
// their own screen, and ships a broken image to everyone on a non-Safari
// browser. The old code SKIPPED this file (canvas mangles HEIC) and stored it
// as-is; that silent unconverted upload is the bug.
//
// The decode is the browser's, not ours: createImageBitmap() decodes HEIC on
// WebKit — which is exactly the device the member uploads from — and throws on
// engines that cannot. On a successful decode we re-encode through a canvas to
// image/jpeg, which renders everywhere. On a throw we do NOT fall through to
// storing the raw HEIC (that is the current, broken behaviour and is worse than
// a clear message): we refuse with an actionable error. The member keeps their
// original file; only the stored artefact changes.
const convertHeicToJpeg = async (file: File): Promise<File> => {
  const refusal = new Error(
    "This photo is in Apple's HEIC format, which this browser can't convert. " +
      'Open it on your iPhone, or re-save it as JPEG, and it will upload.',
  );

  if (typeof createImageBitmap !== 'function') throw refusal;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw refusal;
  }

  try {
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw refusal;
    ctx.drawImage(bitmap, 0, 0);

    const blob: Blob | null = await new Promise((res) =>
      canvas.toBlob(res, 'image/jpeg', 0.92),
    );
    if (!blob || blob.size === 0) throw refusal;

    const base = (file.name || 'photo').replace(/\.[^.]+$/, '') || 'photo';
    return new File([blob], `${base}.jpg`, { type: 'image/jpeg', lastModified: Date.now() });
  } finally {
    bitmap.close();
  }
};

// Intrinsic pixel dimensions of the STORED artefact, read client-side. Returns
// null whenever the class has no meaningful raster size (documents) or the read
// fails for any reason — a null size never blocks the upload, it only means the
// media_assets row carries null width/height/aspect. There is no invented
// fallback size: a wrong number is worse than an honest null, because a card
// would reserve a box that does not match the image that arrives.
const readIntrinsicSize = async (
  file: File,
  mediaClass: MediaClass,
): Promise<{ width: number; height: number } | null> => {
  // image: createImageBitmap is already proven available here (convertHeicToJpeg
  // uses it), so we lean on the browser's own decoder. close() the bitmap in a
  // finally so the decoded frame is released whether we read it or throw.
  if (mediaClass === 'image') {
    if (typeof createImageBitmap !== 'function') return null;
    let bitmap: ImageBitmap | null = null;
    try {
      bitmap = await createImageBitmap(file);
      return { width: bitmap.width, height: bitmap.height };
    } catch {
      return null;
    } finally {
      bitmap?.close();
    }
  }

  // video: a detached <video> reads intrinsic dimensions from metadata alone —
  // preload='metadata' means we never fetch the whole file. Cap the wait at 10s
  // so a stalled decode can never hang the upload, and revoke the object URL in a
  // finally regardless of how the promise settles.
  if (mediaClass === 'video') {
    const objectUrl = URL.createObjectURL(file);
    try {
      return await new Promise<{ width: number; height: number } | null>((resolve) => {
        let settled = false;
        const finish = (result: { width: number; height: number } | null) => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          resolve(result);
        };
        const timer = setTimeout(() => finish(null), 10_000);
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () =>
          finish({ width: video.videoWidth, height: video.videoHeight });
        video.onerror = () => finish(null);
        video.src = objectUrl;
      });
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }

  // document: nothing to read.
  return null;
};

export type UploadedMedia = {
  url: string;
  assetId: string;
  mediaClass: MediaClass;
  width: number | null;
  height: number | null;
  aspect: number | null;
};

export const uploadMedia = async (file: File, surface: Surface): Promise<UploadedMedia> => {
  // a. Classify by the file's own MIME type. No match means we don't accept it.
  const mediaClass = classify(file.type);
  if (!mediaClass) {
    throw new Error(`We can't accept ${file.type || 'that file type'} here yet.`);
  }

  // b. Session gate. Derive the storage folder from the live session, never from
  // a caller argument. RLS keys the path on auth.uid(); trusting a passed-in id
  // lets a stale/mismatched value write under someone else's prefix (or fail RLS
  // in a way indistinguishable from auth loss).
  //
  // PROACTIVE: getSession() still returns a session whose access token has
  // expired — building the path from it sends a dead token, storage treats the
  // request as anon, and RLS denies with a raw 42501 the member should never
  // see. A token within 60s of expiry is treated as already dead: the upload
  // can outlive it. This is not sufficient on its own — the check depends on the
  // device clock, which drifts, and cannot see a token invalidated for any
  // reason other than expiry — so the upload below is also guarded reactively.
  const { data: s } = await supabase.auth.getSession();
  let session = s.session;

  const expiresAt = session?.expires_at ? session.expires_at * 1000 : 0;
  if (session && expiresAt - Date.now() < 60_000) {
    const { data: r, error: refreshErr } = await supabase.auth.refreshSession();
    session = refreshErr ? null : r.session;
  }

  const uid = session?.user?.id;
  if (!uid) {
    throw new Error('Your session has expired. Sign back in and this will upload.');
  }

  // d. HEIC/HEIF FIRST: re-encode to JPEG before anything else, so every step
  // below (compression, the size gate, the stored object) works on a format that
  // renders in every browser. convertHeicToJpeg throws a clear, actionable error
  // rather than let an unrenderable HEIC through — see its comment (BD312 §2).
  let uploadFile = file;
  if (mediaClass === 'image' && HEIC_TYPES.includes(file.type)) {
    uploadFile = await convertHeicToJpeg(file);
  }

  // Compress only real, canvas-safe images. GIF is left alone (canvas flattens
  // animation); HEIC no longer reaches here as HEIC — it is JPEG by now. If
  // compression throws we KEEP the current uploadFile: reverting to `file` would
  // put the raw HEIC back, undoing the conversion above.
  if (mediaClass === 'image' && uploadFile.type !== 'image/gif') {
    try {
      uploadFile = await compressAndTinify(uploadFile, { maxDimension: 1920, maxSizeBytes: 5 * 1024 * 1024 });
    } catch {
      /* keep the converted (or original) uploadFile — never revert to raw HEIC */
    }
  }

  // c. Size gate: AFTER compression for images, BEFORE upload for video and
  // documents. Name the real numbers so the message is actionable (BD305).
  const cap = CAPS[mediaClass];
  if (uploadFile.size > cap) {
    const Class = mediaClass.charAt(0).toUpperCase() + mediaClass.slice(1);
    throw new Error(
      `That file is ${Math.round(uploadFile.size / 1048576)} MB. ${Class} files go up to ${Math.round(cap / 1048576)} MB here.`,
    );
  }

  // Sanitize filename to avoid storage InvalidKey errors (remove diacritics/spaces)
  const normalize = (str: string) =>
    str
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '') // strip diacritics
      .replace(/[^a-zA-Z0-9._-]/g, '-') // allow alnum, dot, underscore, hyphen
      .replace(/-+/g, '-')
      .replace(/^[-.]+|[-.]+$/g, '');

  const origName = file.name || 'upload';
  const parts = origName.split('.');
  const origExt = parts.length > 1 ? parts.pop()!.toLowerCase() : '';
  const base = normalize(parts.join('.')) || 'file';
  // The stored extension follows the ARTEFACT, not the original name. A HEIC/HEIF
  // converted to JPEG must land as .jpg so the stored object is unambiguously the
  // thing that renders (BD312 §3); every other class keeps its own extension. The
  // member's original base name is preserved either way.
  const converted = HEIC_TYPES.includes(file.type) && uploadFile.type === 'image/jpeg';
  const ext = converted ? 'jpg' : origExt;
  // e. safeExt spans every class in the matrix: images, video and documents.
  const safeExt = [
    'jpg','jpeg','png','webp','gif','heic','heif',
    'mp4','webm','mov','m4v','avi','mkv',
    'pdf','ppt','pptx','doc','docx','xls','xlsx','csv','txt',
  ].includes(ext) ? ext : 'bin';
  const safeName = `${base}.${safeExt}`;

  // Read intrinsic dimensions from the STORED artefact (uploadFile), never the
  // original `file`. compressAndTinify resizes images to maxDimension 1920, so a
  // size read from `file` would describe bytes that were never stored and the
  // Phase 3 card would reserve a box that does not match the image that arrives.
  // The stored artefact is the subject.
  const size = await readIntrinsicSize(uploadFile, mediaClass);
  const width = size?.width ?? null;
  const height = size?.height ?? null;
  const aspect = size ? Number((size.width / size.height).toFixed(4)) : null;

  // f. Path is scoped by uid and surface.
  const filePath = `${uid}/${surface}/${Date.now()}-${safeName}`;

  // g. One public bucket for all four surfaces in this pass.
  const bucket = 'dna-media-public';

  // REACTIVE: the proactive check can still be beaten — a clock skewed slow, or
  // a token revoked server-side before expiry. If the storage request comes back
  // as an auth failure, refresh once and retry the SAME upload to the SAME path
  // exactly once. Never loop.
  const isAuthFailure = (e: unknown) => {
    const msg = (e as { message?: string })?.message?.toLowerCase() ?? '';
    const status = (e as { statusCode?: string | number })?.statusCode;
    return String(status) === '401'
      || msg.includes('jwt')
      || msg.includes('unauthorized')
      || msg.includes('row-level security');
  };

  const attemptUpload = () => supabase.storage.from(bucket).upload(filePath, uploadFile, {
    cacheControl: '3600',
    upsert: true,
    contentType: uploadFile.type || file.type || undefined,
  });

  let { error } = await attemptUpload();

  if (error && isAuthFailure(error)) {
    const originalError = error;
    const { data: r, error: refreshErr } = await supabase.auth.refreshSession();
    if (refreshErr || !r.session) {
      throw new Error('Your session has expired. Sign back in and this will upload.');
    }
    // The path is keyed to the original uid; a different member now would write
    // to the wrong prefix. Refuse rather than silently mis-file.
    if (r.session.user.id !== uid) {
      throw new Error('Your session changed. Sign back in and this will upload.');
    }
    ({ error } = await attemptUpload());
    // Retry once only. If it still fails, surface the original error.
    if (error) error = originalError;
  }

  // h. Keep the existing failure log unchanged.
  if (error) {
    console.error('[uploadMedia] upload FAILED bucket=%s path=%s uid=%s tokenLen=%s error=%o',
      bucket, filePath, uid, session?.access_token?.length ?? 0, error);
    throw error;
  }

  const { data: publicUrl } = supabase.storage.from(bucket).getPublicUrl(filePath);

  // Dual-write: record a media_assets row alongside the stored object. Legacy URL
  // columns are untouched — nothing migrates, nothing drops.
  //
  // Plain insert, never upsert: filePath already carries Date.now() so there is no
  // conflict to resolve, and BD307 established that upsert applies the SELECT
  // policy. focal_x / focal_y are deliberately omitted: they carry DB defaults
  // (0.500 / 0.420) and a client that restates a default is a second place for it
  // to drift.
  const { data: asset, error: insertError } = await supabase
    .from('media_assets')
    .insert({
      owner_id: uid,
      bucket,
      path: filePath,
      class: mediaClass,
      mime_type: uploadFile.type || file.type,
      byte_size: uploadFile.size,
      width,
      height,
      aspect,
    })
    .select('id')
    .single();

  // A failed insert AFTER a successful upload orphans one storage object, which
  // media_assets itself makes findable later — a deliberate, recoverable cost. A
  // SWALLOWED insert failure instead produces a stored object with no framing that
  // looks correct until a card renders wrong, which is how this repo arrived at 25
  // bare URL columns. So we log in the same shape as the upload-failure log above,
  // then throw — never return the URL anyway.
  if (insertError || !asset) {
    console.error('[uploadMedia] media_assets insert FAILED bucket=%s path=%s uid=%s error=%o',
      bucket, filePath, uid, insertError);
    throw insertError ?? new Error('media_assets insert returned no row');
  }

  return {
    url: publicUrl.publicUrl,
    assetId: asset.id,
    mediaClass,
    width,
    height,
    aspect,
  };
};
