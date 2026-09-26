import { useEffect, useRef } from 'react';

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Accessible modal behaviour: moves focus into the dialog, traps Tab inside it,
 * closes on Escape, and restores focus to the triggering element on close.
 */
export function useDialogA11y<T extends HTMLElement>(isOpen: boolean, onClose: () => void, options: { closeOnEscape?: boolean } = {}) {
  const ref = useRef<T>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const closeOnEscape = options.closeOnEscape ?? true;

  useEffect(() => {
    if (!isOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const node = ref.current;

    const focusFirst = () => {
      if (!node) return;
      const autofocus = node.querySelector<HTMLElement>('[data-autofocus]');
      const first = autofocus || node.querySelector<HTMLElement>(FOCUSABLE);
      (first || node).focus();
    };
    const t = window.setTimeout(focusFirst, 30);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape) {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab' || !node) return;
      const items = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null);
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener('keydown', onKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [isOpen, closeOnEscape]);

  return ref;
}
