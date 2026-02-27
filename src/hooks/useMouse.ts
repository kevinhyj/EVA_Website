'use client';

import { useEffect, useRef } from 'react';

export function useMouse() {
  const pos = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      pos.current.x = e.clientX;
      pos.current.y = e.clientY;
    };
    const onLeave = () => {
      pos.current.x = -9999;
      pos.current.y = -9999;
    };
    const onTouch = (e: TouchEvent) => {
      if (e.touches[0]) {
        pos.current.x = e.touches[0].clientX;
        pos.current.y = e.touches[0].clientY;
      }
    };
    const onTouchEnd = () => {
      pos.current.x = -9999;
      pos.current.y = -9999;
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseleave', onLeave);
    window.addEventListener('touchmove', onTouch, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('touchmove', onTouch);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  return pos;
}
