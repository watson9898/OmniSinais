import React, { useRef, useCallback, MouseEvent, TouchEvent } from 'react';

export interface DoubleActionOptions {
  onSingleClick?: () => void;
  onDoubleClick: () => void;
  delayMs?: number;
}

/**
 * Creates double-click (mouse) and double-tap (touchscreen) event handlers
 * with smooth fallback and preventing double triggers.
 */
export function useDoubleAction({
  onSingleClick,
  onDoubleClick,
  delayMs = 300,
}: DoubleActionOptions) {
  const lastTouchTimeRef = useRef<number>(0);
  const singleClickTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isTouchRef = useRef<boolean>(false);

  const handleClick = useCallback(
    (e: MouseEvent) => {
      // If triggered by touch shortly after onTouchEnd, ignore to prevent duplicate click handling
      if (isTouchRef.current) {
        isTouchRef.current = false;
        return;
      }

      if (!onSingleClick) {
        return;
      }

      // If we only have onDoubleClick, single click does nothing or triggers onSingleClick
      if (singleClickTimerRef.current) {
        clearTimeout(singleClickTimerRef.current);
        singleClickTimerRef.current = null;
      }

      singleClickTimerRef.current = setTimeout(() => {
        onSingleClick();
        singleClickTimerRef.current = null;
      }, delayMs);
    },
    [onSingleClick, delayMs]
  );

  const handleDoubleClick = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (singleClickTimerRef.current) {
        clearTimeout(singleClickTimerRef.current);
        singleClickTimerRef.current = null;
      }

      onDoubleClick();
    },
    [onDoubleClick]
  );

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      const now = Date.now();
      const timeDiff = now - lastTouchTimeRef.current;
      lastTouchTimeRef.current = now;

      if (timeDiff > 0 && timeDiff < delayMs + 50) {
        // Detected double-tap on touch screen
        e.preventDefault();
        e.stopPropagation();
        isTouchRef.current = true;

        if (singleClickTimerRef.current) {
          clearTimeout(singleClickTimerRef.current);
          singleClickTimerRef.current = null;
        }

        onDoubleClick();
      } else {
        // First tap
        if (onSingleClick) {
          if (singleClickTimerRef.current) {
            clearTimeout(singleClickTimerRef.current);
          }
          singleClickTimerRef.current = setTimeout(() => {
            onSingleClick();
            singleClickTimerRef.current = null;
          }, delayMs);
        }
      }
    },
    [onSingleClick, onDoubleClick, delayMs]
  );

  return {
    onClick: handleClick,
    onDoubleClick: handleDoubleClick,
    onTouchEnd: handleTouchEnd,
  };
}

/**
 * Lightweight helper to wrap double-action directly on inline components
 */
export function createDoubleActionHandlers(
  onDoubleClick: () => void,
  onSingleClick?: () => void,
  delayMs = 300
) {
  let lastTap = 0;
  let timer: any = null;

  return {
    onClick: (e: React.MouseEvent) => {
      if (onSingleClick) {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
          onSingleClick();
          timer = null;
        }, delayMs);
      }
    },
    onDoubleClick: (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      onDoubleClick();
    },
    onTouchEnd: (e: React.TouchEvent) => {
      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTap;
      lastTap = currentTime;

      if (tapLength > 0 && tapLength < delayMs + 60) {
        e.preventDefault();
        e.stopPropagation();
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
        onDoubleClick();
      }
    },
  };
}

/**
 * Smooth scroll helper to navigate into any element id with an offset
 */
export function smoothScrollToElement(elementId: string, offset = 80) {
  const el = document.getElementById(elementId);
  if (el) {
    const y = el.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }
}
