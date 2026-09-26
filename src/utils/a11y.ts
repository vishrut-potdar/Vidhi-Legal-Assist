import type React from 'react';

/**
 * Keyboard activation for non-button elements that handle onClick (cards, accordion headers).
 * Enter / Space trigger the element's click handler. Key presses that originate from a nested
 * button or input are ignored so they don't fire twice.
 */
export function activateOnKey(e: React.KeyboardEvent<HTMLElement>) {
  if (e.target !== e.currentTarget) return;
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    e.currentTarget.click();
  }
}
