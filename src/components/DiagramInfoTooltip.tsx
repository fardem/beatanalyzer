import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { HelpCircle } from 'lucide-react';

export interface DiagramHelpContent {
  title: string;
  summary: string;
  items: { color?: 'rose' | 'cyan' | 'amber' | 'indigo' | 'emerald' | 'slate'; text: string }[];
  actionTip: string;
}

interface DiagramInfoTooltipProps {
  help: DiagramHelpContent;
  buttonLabel: string;
  /** Optional inline trigger text; if omitted renders a compact ? icon badge */
  children?: React.ReactNode;
}

const DOT_CLASS: Record<NonNullable<DiagramHelpContent['items'][number]['color']>, string> = {
  rose: 'bg-rose-400',
  cyan: 'bg-cyan-400',
  amber: 'bg-amber-400',
  indigo: 'bg-indigo-400',
  emerald: 'bg-emerald-400',
  slate: 'bg-slate-400',
};

export const DiagramInfoTooltip: React.FC<DiagramInfoTooltipProps> = ({
  help,
  buttonLabel,
  children,
}) => {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; placeAbove: boolean } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tooltipId = useId();

  const updatePosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el || typeof window === 'undefined') return;
    const rect = el.getBoundingClientRect();
    const tooltipW = Math.min(360, window.innerWidth - 24);
    const spaceBelow = window.innerHeight - rect.bottom;
    const placeAbove = spaceBelow < 250 && rect.top > spaceBelow;
    const left = Math.max(12, Math.min(window.innerWidth - tooltipW - 12, rect.left));
    const top = placeAbove ? rect.top - 8 : rect.bottom + 8;
    setCoords({ top, left, placeAbove });
  }, []);

  const show = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    updatePosition();
    setOpen(true);
  }, [updatePosition]);

  const scheduleHide = useCallback(() => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      setOpen(false);
    }, 90);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onScrollOrResize = () => updatePosition();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('scroll', onScrollOrResize, true);
    window.addEventListener('resize', onScrollOrResize);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('scroll', onScrollOrResize, true);
      window.removeEventListener('resize', onScrollOrResize);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={buttonLabel}
        aria-expanded={open}
        aria-describedby={open ? tooltipId : undefined}
        onMouseEnter={show}
        onMouseLeave={scheduleHide}
        onFocus={show}
        onBlur={scheduleHide}
        onClick={(e) => {
          e.stopPropagation();
          if (open) setOpen(false);
          else show();
        }}
        className="inline-flex items-center gap-1 text-slate-400 hover:text-cyan-300 transition-colors cursor-help focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded px-1 py-0.5 shrink-0"
      >
        {children}
        <HelpCircle className="w-3.5 h-3.5 shrink-0" />
      </button>

      {open &&
        coords &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            id={tooltipId}
            role="tooltip"
            onMouseEnter={show}
            onMouseLeave={scheduleHide}
            style={{
              top: coords.top,
              left: coords.left,
              transform: coords.placeAbove ? 'translateY(-100%)' : 'translateY(0)',
            }}
            className="fixed z-50 w-[min(22.5rem,calc(100vw-24px))] rounded-xl bg-slate-950/95 backdrop-blur-md border border-slate-700/90 shadow-2xl p-3.5 text-left pointer-events-auto"
          >
            <div className="text-xs font-semibold text-white mb-1">{help.title}</div>
            <p className="text-[11px] leading-relaxed text-slate-300 mb-2.5">{help.summary}</p>
            <ul className="space-y-1.5 mb-2.5">
              {help.items.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-[11px] leading-snug text-slate-300">
                  <span
                    className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                      item.color ? DOT_CLASS[item.color] : 'bg-slate-400'
                    }`}
                    aria-hidden="true"
                  />
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
            <div className="pt-2 border-t border-slate-800 text-[11px] leading-snug text-cyan-200/95">
              {help.actionTip}
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

interface ValueTooltipProps {
  title: string;
  body: string;
  children: React.ReactNode;
  className?: string;
}

export const ValueTooltip: React.FC<ValueTooltipProps> = ({ title, body, children, className = '' }) => {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; placeAbove: boolean } | null>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tooltipId = useId();

  const updatePosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el || typeof window === 'undefined') return;
    const rect = el.getBoundingClientRect();
    const tooltipW = Math.min(288, window.innerWidth - 24);
    const spaceBelow = window.innerHeight - rect.bottom;
    const placeAbove = spaceBelow < 160 && rect.top > spaceBelow;
    const left = Math.max(12, Math.min(window.innerWidth - tooltipW - 12, rect.left));
    const top = placeAbove ? rect.top - 6 : rect.bottom + 6;
    setCoords({ top, left, placeAbove });
  }, []);

  const show = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    updatePosition();
    setOpen(true);
  }, [updatePosition]);

  const scheduleHide = useCallback(() => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => setOpen(false), 75);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onScrollOrResize = () => updatePosition();
    window.addEventListener('scroll', onScrollOrResize, true);
    window.addEventListener('resize', onScrollOrResize);
    return () => {
      window.removeEventListener('scroll', onScrollOrResize, true);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  return (
    <>
      <span
        ref={triggerRef}
        tabIndex={0}
        aria-describedby={open ? tooltipId : undefined}
        onMouseEnter={show}
        onMouseLeave={scheduleHide}
        onFocus={show}
        onBlur={scheduleHide}
        className={`cursor-help underline decoration-dotted decoration-slate-600 underline-offset-4 hover:decoration-cyan-400/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400 rounded-sm ${className}`}
      >
        {children}
      </span>

      {open &&
        coords &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            id={tooltipId}
            role="tooltip"
            style={{
              top: coords.top,
              left: coords.left,
              transform: coords.placeAbove ? 'translateY(-100%)' : 'translateY(0)',
            }}
            className="fixed z-50 w-[min(18rem,calc(100vw-24px))] rounded-xl bg-slate-950/95 backdrop-blur-md border border-slate-700/90 shadow-2xl p-3 text-left pointer-events-none"
          >
            <div className="text-[11px] font-semibold text-cyan-300 mb-1">{title}</div>
            <p className="text-[11px] leading-relaxed text-slate-300">{body}</p>
          </div>,
          document.body
        )}
    </>
  );
};
