import { useEffect, type MutableRefObject } from 'react';
import { BackHandler, Platform } from 'react-native';

interface UseDismissOptions {
  visible: boolean;
  onDismiss: () => void;
  isAnimating?: MutableRefObject<boolean>;
  handleEscape?: boolean;
  handleBackButton?: boolean;
}

/**
 * Custom hook for handling dismissal of overlays, modals, sidebars, etc.
 * Handles Escape key (web), Android hardware back button, and respects animation state.
 *
 * @example
 * ```tsx
 * const isAnimating = useRef(false);
 * useDismiss({
 *   visible: isOpen,
 *   onDismiss: handleClose,
 *   isAnimating,
 * });
 * ```
 */
export function useDismiss({
  visible,
  onDismiss,
  isAnimating,
  handleEscape = true,
  handleBackButton = true,
}: UseDismissOptions) {
  useEffect(() => {
    if (!visible || !handleBackButton || Platform.OS !== 'android') return;

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (visible && (!isAnimating || !isAnimating.current)) {
        onDismiss();
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [visible, onDismiss, isAnimating, handleBackButton]);

  useEffect(() => {
    if (!visible || !handleEscape || Platform.OS !== 'web') return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && (!isAnimating || !isAnimating.current)) {
        onDismiss();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [visible, onDismiss, isAnimating, handleEscape]);
}
