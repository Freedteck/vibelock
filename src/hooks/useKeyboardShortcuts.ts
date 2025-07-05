import { useEffect } from 'react';

interface KeyboardShortcuts {
  onPlayPause?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onVolumeUp?: () => void;
  onVolumeDown?: () => void;
  onMute?: () => void;
  onSearch?: () => void;
}

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcuts) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const { key, ctrlKey, metaKey, shiftKey } = e;
      const isModifierPressed = ctrlKey || metaKey;

      switch (key) {
        case ' ':
          e.preventDefault();
          shortcuts.onPlayPause?.();
          break;
        case 'ArrowRight':
          if (shiftKey) {
            e.preventDefault();
            shortcuts.onNext?.();
          }
          break;
        case 'ArrowLeft':
          if (shiftKey) {
            e.preventDefault();
            shortcuts.onPrevious?.();
          }
          break;
        case 'ArrowUp':
          if (shiftKey) {
            e.preventDefault();
            shortcuts.onVolumeUp?.();
          }
          break;
        case 'ArrowDown':
          if (shiftKey) {
            e.preventDefault();
            shortcuts.onVolumeDown?.();
          }
          break;
        case 'm':
          if (isModifierPressed) {
            e.preventDefault();
            shortcuts.onMute?.();
          }
          break;
        case 'k':
          if (isModifierPressed) {
            e.preventDefault();
            shortcuts.onSearch?.();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};