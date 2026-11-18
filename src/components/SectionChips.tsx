import React, { useCallback, useEffect, useRef, useState } from 'react';

interface SectionChipsProps {
  /** index of the chip to keep in view (the section that plays), -1 = none */
  activeIndex: number;
  children: React.ReactNode;
}

const DRAG_START_PX = 4;

/**
 * A row of buttons that runs past the panel edge: no scrollbar, swipe it left and right with the mouse held down
 * (or touch); the edges fade out where more buttons are hidden. A swipe does not click the button it started on.
 * While playing, the row follows the section that plays (not while the user swipes).
 */
export const SectionChips: React.FC<SectionChipsProps> = ({ activeIndex, children }) => {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; left: number; moved: boolean; id: number } | null>(null);
  const suppressClick = useRef(false);
  const lastSwipe = useRef(0);
  const [edges, setEdges] = useState({ left: false, right: false });

  const updateEdges = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const left = el.scrollLeft > 2;
    const right = el.scrollLeft + el.clientWidth < el.scrollWidth - 2;
    setEdges((prev) => (prev.left === left && prev.right === right ? prev : { left, right }));
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    updateEdges();
    const ro = new ResizeObserver(updateEdges);
    ro.observe(el);
    return () => ro.disconnect();
  }, [updateEdges, children]);

  // keep the playing section in view, unless the user swiped a moment ago
  useEffect(() => {
    const el = ref.current;
    if (!el || activeIndex < 0 || drag.current || Date.now() - lastSwipe.current < 4000) return;
    const chip = el.children[activeIndex] as HTMLElement | undefined;
    if (!chip) return;
    const from = el.scrollLeft;
    if (chip.offsetLeft >= from && chip.offsetLeft + chip.offsetWidth <= from + el.clientWidth) return;
    el.scrollTo({ left: Math.max(0, chip.offsetLeft - el.clientWidth / 4), behavior: 'smooth' });
  }, [activeIndex]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const el = ref.current;
    if (!el) return;
    drag.current = { x: e.clientX, left: el.scrollLeft, moved: false, id: e.pointerId };
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const el = ref.current;
    if (!d || !el || e.pointerId !== d.id) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) < DRAG_START_PX) return;
    if (!d.moved) {
      d.moved = true;
      el.setPointerCapture(e.pointerId);
    }
    el.scrollLeft = d.left - dx;
    lastSwipe.current = Date.now();
  };
  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || e.pointerId !== d.id) return;
    if (d.moved) {
      suppressClick.current = true;
      setTimeout(() => (suppressClick.current = false), 0);
    }
    drag.current = null;
  };

  const fade = `linear-gradient(to right, ${edges.left ? 'transparent 0, #000 2.5rem' : '#000 0'}, ${
    edges.right ? '#000 calc(100% - 2.5rem), transparent 100%' : '#000 100%'
  })`;

  return (
    <div
      ref={ref}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onScroll={updateEdges}
      onClickCapture={(e) => {
        if (suppressClick.current) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
      onDragStart={(e) => e.preventDefault()}
      style={{ maskImage: fade, WebkitMaskImage: fade, touchAction: 'pan-y' }}
      className={`no-scrollbar flex gap-1.5 overflow-x-auto select-none ${
        edges.left || edges.right ? 'cursor-grab active:cursor-grabbing' : ''
      }`}
    >
      {children}
    </div>
  );
};
