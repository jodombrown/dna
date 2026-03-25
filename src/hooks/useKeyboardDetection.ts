/**
 * useKeyboardDetection - Detects software keyboard open/close on mobile
 * 
 * Adds 'keyboard-open' class to document body when the viewport shrinks
 * significantly (keyboard appears). Used to hide bottom nav during typing.
 */

import { useEffect } from 'react';

export function useKeyboardDetection() {
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const KEYBOARD_THRESHOLD = 150; // px reduction = keyboard open

    const handleResize = () => {
      const heightDiff = window.innerHeight - viewport.height;
      if (heightDiff > KEYBOARD_THRESHOLD) {
        document.body.classList.add('keyboard-open');
      } else {
        document.body.classList.remove('keyboard-open');
      }
    };

    viewport.addEventListener('resize', handleResize);
    viewport.addEventListener('scroll', handleResize);

    return () => {
      viewport.removeEventListener('resize', handleResize);
      viewport.removeEventListener('scroll', handleResize);
      document.body.classList.remove('keyboard-open');
    };
  }, []);
}
