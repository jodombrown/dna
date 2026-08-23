import { describe, it, expect } from 'vitest';
import { cropOutputSize, isCroppableImage } from '@/lib/utils/cropImage';
import {
  MIN_ASPECT_RATIO,
  MAX_ASPECT_RATIO,
  MIN_SHORT_EDGE,
} from '@/utils/validateImageDimensions';

/** The tolerance validateImageDimensions applies at both ends of the window. */
const RATIO_TOLERANCE = 0.005;

const PRESETS = [
  { name: 'Portrait 4:5', aspect: 4 / 5 },
  { name: 'Square 1:1', aspect: 1 },
  { name: 'Landscape 16:9', aspect: 16 / 9 },
];

const file = (type: string) => new File(['x'], 'photo', { type });

describe('cropOutputSize', () => {
  it('emits whole pixels', () => {
    const size = cropOutputSize({ width: 1234.56, height: 694.44 }, 16 / 9);
    expect(Number.isInteger(size.width)).toBe(true);
    expect(Number.isInteger(size.height)).toBe(true);
  });

  it('never emits a zero dimension', () => {
    for (const { aspect } of PRESETS) {
      const size = cropOutputSize({ width: 0, height: 0 }, aspect);
      expect(size.width).toBeGreaterThanOrEqual(1);
      expect(size.height).toBeGreaterThanOrEqual(1);
    }
  });

  /**
   * The reason this helper exists. Landscape is 16:9, which IS the guardrail's
   * ceiling — rounding the short edge the other way puts the smallest legal
   * 16:9 crop at 1.7822, inside the tolerance by six ten-thousandths.
   */
  it('keeps every crop at or above the floor inside the guardrail window', () => {
    for (const { name, aspect } of PRESETS) {
      // Every crop from the smallest legal one up through a full-frame capture,
      // at fractional widths — the crop box arrives as device pixels, not whole ones.
      for (let long = MIN_SHORT_EDGE; long <= 4000; long += 1) {
        for (const fraction of [0, 0.25, 0.5, 0.75]) {
          const area =
            aspect >= 1
              ? { width: long + fraction, height: (long + fraction) / aspect }
              : { width: (long + fraction) * aspect, height: long + fraction };
          const size = cropOutputSize(area, aspect);
          if (Math.min(size.width, size.height) < MIN_SHORT_EDGE) continue;

          const ratio = size.width / size.height;
          expect(
            ratio >= MIN_ASPECT_RATIO - RATIO_TOLERANCE &&
              ratio <= MAX_ASPECT_RATIO + RATIO_TOLERANCE,
            `${name} at ${size.width}x${size.height} ratio ${ratio}`,
          ).toBe(true);
        }
      }
    }
  });

  /**
   * The directional invariant `cropOutputSize` actually provides, and the one
   * the window test above cannot see: rounding always moves the emitted ratio
   * TOWARD 1:1, never further out. Rounding to nearest instead stays inside the
   * window across this range too — by six ten-thousandths at the tightest
   * point. This is the assertion that fails if anyone restores it.
   */
  it('rounds toward the centre of the window, never away from it', () => {
    for (const { name, aspect } of PRESETS) {
      for (let long = MIN_SHORT_EDGE; long <= 4000; long += 1) {
        for (const fraction of [0, 0.25, 0.49, 0.5, 0.75]) {
          const area =
            aspect >= 1
              ? { width: long + fraction, height: (long + fraction) / aspect }
              : { width: (long + fraction) * aspect, height: long + fraction };
          const { width, height } = cropOutputSize(area, aspect);
          const ratio = width / height;
          if (aspect >= 1) {
            expect(ratio, `${name} at ${width}x${height}`).toBeLessThanOrEqual(aspect);
          } else {
            expect(ratio, `${name} at ${width}x${height}`).toBeGreaterThanOrEqual(aspect);
          }
        }
      }
    }
  });

  it('lands within a pixel of the requested shape', () => {
    for (const { aspect } of PRESETS) {
      for (const long of [356, 400, 1080, 1920, 3999]) {
        const area =
          aspect >= 1
            ? { width: long, height: long / aspect }
            : { width: long * aspect, height: long };
        const size = cropOutputSize(area, aspect);
        const exact = aspect >= 1 ? size.width / aspect : size.height * aspect;
        const actual = aspect >= 1 ? size.height : size.width;
        expect(Math.abs(actual - exact)).toBeLessThan(1);
      }
    }
  });

  it('emits an exact square for the 1:1 preset', () => {
    const size = cropOutputSize({ width: 640.4, height: 639.7 }, 1);
    expect(size.width).toBe(size.height);
  });
});

describe('isCroppableImage', () => {
  it('accepts the still raster formats the composer re-encodes', () => {
    for (const type of ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']) {
      expect(isCroppableImage(file(type))).toBe(true);
    }
  });

  // A canvas crop reads one frame. Offering it for a GIF would silently drop
  // the animation, so those files skip the dialog entirely.
  it('refuses animated and non-image formats', () => {
    for (const type of ['image/gif', 'image/heic', 'video/mp4', 'application/pdf', '']) {
      expect(isCroppableImage(file(type))).toBe(false);
    }
  });
});
