import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { ImageCropDialog } from '../ImageCropDialog';

/**
 * These cover the one property the crop step must never lose: it is OPTIONAL.
 * The cropping itself is canvas work jsdom cannot do, and is covered by
 * cropOutputSize's tests; what is asserted here is that both ways out of the
 * dialog exist and that "Use as-is" returns the member's file untouched.
 */

beforeAll(() => {
  // jsdom implements neither, and react-easy-crop mounts an <img> from the
  // object URL on render.
  if (!URL.createObjectURL) {
    URL.createObjectURL = vi.fn(() => 'blob:crop-test');
    URL.revokeObjectURL = vi.fn();
  }
});

afterEach(cleanup);

const pickedFile = () => new File(['bytes'], 'harmattan.jpg', { type: 'image/jpeg' });

describe('ImageCropDialog', () => {
  it('stays closed until a file is picked', () => {
    render(<ImageCropDialog file={null} onComplete={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('offers all three presets and both exits once open', () => {
    render(<ImageCropDialog file={pickedFile()} onComplete={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    for (const label of [/portrait/i, /square/i, /landscape/i]) {
      expect(screen.getByRole('radio', { name: label })).toBeInTheDocument();
    }
    expect(screen.getByRole('button', { name: /use as-is/i })).toBeEnabled();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeEnabled();
  });

  it('hands back the original file, byte-for-byte, on Use as-is', () => {
    const file = pickedFile();
    const onComplete = vi.fn();
    render(<ImageCropDialog file={file} onComplete={onComplete} onCancel={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /use as-is/i }));

    expect(onComplete).toHaveBeenCalledTimes(1);
    // Identity, not equivalence: the skip path must not re-encode.
    expect(onComplete.mock.calls[0][0]).toBe(file);
  });

  it('abandons the file on Cancel', () => {
    const onComplete = vi.fn();
    const onCancel = vi.fn();
    render(<ImageCropDialog file={pickedFile()} onComplete={onComplete} onCancel={onCancel} />);

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onComplete).not.toHaveBeenCalled();
  });

  // No crop area is reported until the cropper measures itself, which jsdom's
  // zero-sized layout never does — so this doubles as the guard against
  // confirming a crop that was never framed.
  it('does not offer to confirm a crop it has no measurements for', () => {
    render(<ImageCropDialog file={pickedFile()} onComplete={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByRole('button', { name: /use this crop/i })).toBeDisabled();
  });
});
