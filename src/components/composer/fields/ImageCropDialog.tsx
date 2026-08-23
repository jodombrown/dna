import { useCallback, useEffect, useState } from 'react';
import Cropper, { Area, MediaSize } from 'react-easy-crop';
import { Loader2, Move, ZoomIn, ZoomOut } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cropImageToFile, cropOutputSize } from '@/lib/utils/cropImage';
import { MIN_SHORT_EDGE } from '@/utils/validateImageDimensions';

/**
 * Composer crop step.
 *
 * Sits between "member picked a file" and the upload pipeline, in place of
 * nothing — before this the first thing a member heard about their photo's
 * shape was a rejection toast from `validateImageDimensions`, after they had
 * already committed to the file. This is the surface where that shape is
 * decided instead of adjudicated.
 *
 * Two rules shape everything below.
 *
 * It is OPTIONAL. "Use as-is" is present on every render, including while the
 * crop is failing, and hands the ORIGINAL file straight back. A member who
 * does not want this step is not made to pay for it existing.
 *
 * What it emits always passes. The three presets sit inside the 9:16..16:9
 * window the guardrail enforces, `cropOutputSize` pins the emitted ratio to
 * the preset exactly, and the confirm action refuses to hand forward a crop
 * under the `MIN_SHORT_EDGE` floor. A member who deliberately framed an image
 * should never then be told it is the wrong shape.
 */

type AspectKey = 'portrait' | 'square' | 'landscape';

interface AspectPreset {
  key: AspectKey;
  label: string;
  /** Shown in the readout, not on the button — three ratios do not fit at 360px. */
  ratioLabel: string;
  ratio: number;
}

/**
 * Portrait and Square sit well inside the guardrail's window. Landscape IS its
 * ceiling — 16:9 exactly — which is why `cropOutputSize` rounds the way it does.
 */
const ASPECT_PRESETS: AspectPreset[] = [
  { key: 'portrait', label: 'Portrait', ratioLabel: '4:5', ratio: 4 / 5 },
  { key: 'square', label: 'Square', ratioLabel: '1:1', ratio: 1 },
  { key: 'landscape', label: 'Landscape', ratioLabel: '16:9', ratio: 16 / 9 },
];

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;

/**
 * The largest short edge any crop at `aspect` can take from a WxH image — the
 * zoomed-all-the-way-out case. Below the floor, that preset cannot produce a
 * usable image from this file no matter where the member drags, so the button
 * is disabled rather than left to fail at the end.
 */
function largestCropShortEdge(width: number, height: number, aspect: number): number {
  const cropWidth = width / height > aspect ? height * aspect : width;
  return Math.min(cropWidth, cropWidth / aspect);
}

interface ImageCropDialogProps {
  /** The picked file. Non-null opens the dialog; null closes it. */
  file: File | null;
  /**
   * Receives the file to upload — the cropped derivative on confirm, or `file`
   * itself, byte-for-byte, on "Use as-is".
   */
  onComplete: (file: File) => void;
  /** Dismissed without choosing. The picked file is abandoned. */
  onCancel: () => void;
}

export function ImageCropDialog({ file, onComplete, onCancel }: ImageCropDialogProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [aspectKey, setAspectKey] = useState<AspectKey>('square');
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [mediaSize, setMediaSize] = useState<MediaSize | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [cropError, setCropError] = useState<string | null>(null);

  // An object URL, not a FileReader data URL: these files run to 25MB and a
  // base64 string of one costs a third again in memory for no benefit.
  useEffect(() => {
    setAspectKey('square');
    setCrop({ x: 0, y: 0 });
    setZoom(MIN_ZOOM);
    setCroppedAreaPixels(null);
    setMediaSize(null);
    setIsCropping(false);
    setCropError(null);

    if (!file) {
      setImageSrc(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setImageSrc(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const preset = ASPECT_PRESETS.find((p) => p.key === aspectKey) ?? ASPECT_PRESETS[1];
  const aspect = preset.ratio;

  const isPresetAvailable = useCallback(
    (candidate: AspectPreset) =>
      !mediaSize ||
      largestCropShortEdge(mediaSize.naturalWidth, mediaSize.naturalHeight, candidate.ratio) >=
        MIN_SHORT_EDGE,
    [mediaSize],
  );

  // Open on the preset nearest the image's own shape, so the default framing
  // throws away the least. Distance is measured in log space — 2:1 is as far
  // from 1:1 as 1:2 is, which a plain difference gets wrong.
  const handleMediaLoaded = useCallback((media: MediaSize) => {
    setMediaSize(media);
    const sourceRatio = media.naturalWidth / media.naturalHeight;
    const usable = ASPECT_PRESETS.filter(
      (p) => largestCropShortEdge(media.naturalWidth, media.naturalHeight, p.ratio) >= MIN_SHORT_EDGE,
    );
    const pool = usable.length > 0 ? usable : ASPECT_PRESETS;
    const nearest = pool.reduce((best, p) =>
      Math.abs(Math.log(p.ratio / sourceRatio)) < Math.abs(Math.log(best.ratio / sourceRatio))
        ? p
        : best,
    );
    setAspectKey(nearest.key);
  }, []);

  const handleCropComplete = useCallback((_area: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const output = croppedAreaPixels ? cropOutputSize(croppedAreaPixels, aspect) : null;
  const isBelowFloor = !!output && Math.min(output.width, output.height) < MIN_SHORT_EDGE;
  const canConfirm = !!output && !isBelowFloor && !isCropping;

  const handleConfirm = async () => {
    if (!file || !imageSrc || !croppedAreaPixels) return;
    setIsCropping(true);
    setCropError(null);
    try {
      onComplete(await cropImageToFile(imageSrc, croppedAreaPixels, aspect, file));
    } catch (error) {
      console.error('[ImageCropDialog] crop failed:', error);
      // Never a dead end: the original is still one button away.
      setCropError("We couldn't crop that image. Use it as-is, or choose another.");
    } finally {
      setIsCropping(false);
    }
  };

  return (
    <Dialog open={!!file} onOpenChange={(open) => { if (!open) onCancel(); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Crop image</DialogTitle>
          <DialogDescription>
            Choose a shape and frame it, or use the photo exactly as it is.
          </DialogDescription>
        </DialogHeader>

        <div className="relative h-64 overflow-hidden rounded-lg bg-muted sm:h-80">
          {imageSrc && (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              minZoom={MIN_ZOOM}
              maxZoom={MAX_ZOOM}
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={handleCropComplete}
              onMediaLoaded={handleMediaLoaded}
            />
          )}
        </div>

        <ToggleGroup
          type="single"
          variant="outline"
          value={aspectKey}
          // Radix clears a single-select group when the active item is pressed
          // again. There is no "no shape" state here, so an empty value is
          // ignored rather than allowed to blank the cropper.
          onValueChange={(value) => { if (value) setAspectKey(value as AspectKey); }}
          aria-label="Crop shape"
          className="w-full gap-2"
        >
          {ASPECT_PRESETS.map((option) => (
            <ToggleGroupItem
              key={option.key}
              value={option.key}
              disabled={!isPresetAvailable(option)}
              aria-label={`${option.label}, ${option.ratioLabel}`}
              className="flex-1"
            >
              {option.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        <div className="flex items-center gap-3">
          <ZoomOut className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <Slider
            value={[zoom]}
            min={MIN_ZOOM}
            max={MAX_ZOOM}
            step={0.1}
            onValueChange={([value]) => setZoom(value)}
            aria-label="Zoom"
            className="flex-1"
          />
          <ZoomIn className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        </div>

        {/* One line carrying three things at once: how to work the cropper, what
            shape is active, and the exact pixels it will emit. The readout is
            also where the floor is reported, so a member never learns about it
            from a rejection after the fact. */}
        <div className="space-y-1">
          <p className="flex items-center gap-2 text-meta text-muted-foreground">
            <Move className="h-4 w-4 shrink-0" aria-hidden="true" />
            Drag to reposition. Pinch or scroll to zoom.
          </p>
          {cropError ? (
            <p className="text-meta text-destructive" role="alert">{cropError}</p>
          ) : isBelowFloor ? (
            <p className="text-meta text-destructive" role="alert">
              Zoom out — this crop is {output.width} × {output.height}, under the{' '}
              {MIN_SHORT_EDGE}px minimum on its shortest side.
            </p>
          ) : (
            <p className="text-meta text-muted-foreground">
              {preset.label} · {preset.ratioLabel}
              {output ? ` · ${output.width} × ${output.height}` : ''}
            </p>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isCropping}>
            Cancel
          </Button>
          {/* Always available, on every path. The founder's point is deliberate
              manual control, which is not control if the step is a gate. */}
          <Button
            type="button"
            variant="secondary"
            onClick={() => file && onComplete(file)}
            disabled={isCropping}
          >
            Use as-is
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={!canConfirm}>
            {isCropping ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Cropping
              </>
            ) : (
              'Use this crop'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
