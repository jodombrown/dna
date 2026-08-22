import { describe, it, expect, afterEach, vi } from 'vitest';
import {
  validateImageDimensions,
  MIN_SHORT_EDGE,
} from '@/utils/validateImageDimensions';

const file = () => new File(['x'], 'photo.jpg', { type: 'image/jpeg' });

/** jsdom ships no createImageBitmap, so the decode path is stubbed per case. */
function stubDecode(dimensions: { width: number; height: number } | null) {
  vi.stubGlobal(
    'createImageBitmap',
    vi.fn(async () => {
      if (!dimensions) throw new Error('decode failed');
      return { ...dimensions, close: vi.fn() };
    })
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('validateImageDimensions', () => {
  it('accepts a square image', async () => {
    stubDecode({ width: 1000, height: 1000 });
    const result = await validateImageDimensions(file());
    expect(result.ok).toBe(true);
  });

  it('accepts exactly 16:9 and exactly 9:16', async () => {
    stubDecode({ width: 1920, height: 1080 });
    expect((await validateImageDimensions(file())).ok).toBe(true);

    stubDecode({ width: 1080, height: 1920 });
    expect((await validateImageDimensions(file())).ok).toBe(true);
  });

  it('accepts a ratio a pixel off an exact 16:9 crop', async () => {
    stubDecode({ width: 1920, height: 1081 });
    expect((await validateImageDimensions(file())).ok).toBe(true);
  });

  it('rejects a panorama as too wide', async () => {
    stubDecode({ width: 4000, height: 800 });
    const result = await validateImageDimensions(file());
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('too-wide');
    expect(result.title).toBe('Image too wide');
  });

  it('rejects a tall phone screenshot as too tall', async () => {
    stubDecode({ width: 1179, height: 2556 });
    const result = await validateImageDimensions(file());
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('too-tall');
    expect(result.title).toBe('Image too tall');
  });

  it('rejects an image under the short-edge floor', async () => {
    stubDecode({ width: 240, height: MIN_SHORT_EDGE - 1 });
    const result = await validateImageDimensions(file());
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('too-small');
    expect(result.description).toContain(`${MIN_SHORT_EDGE}px`);
  });

  it('checks the size floor before the ratio, so a tiny thumbnail reads as too small', async () => {
    stubDecode({ width: 320, height: 40 });
    const result = await validateImageDimensions(file());
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('too-small');
  });

  it('fails open when the file cannot be decoded', async () => {
    stubDecode(null);
    vi.stubGlobal('URL', { createObjectURL: undefined, revokeObjectURL: vi.fn() });
    const result = await validateImageDimensions(file());
    expect(result.ok).toBe(true);
  });
});
