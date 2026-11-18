import React, { useRef } from 'react';
import { ChevronDown, ChevronUp, GripVertical } from 'lucide-react';
import { useI18n } from '../i18n';
import { PanelId } from '../utils/panelLayout';

/** drag state shared by all panels (owned by App) */
export interface PanelDrag {
  dragging: PanelId | null;
  over: { id: PanelId; place: 'before' | 'after' } | null;
  start: (id: PanelId) => void;
  hover: (id: PanelId, place: 'before' | 'after') => void;
  drop: () => void;
  end: () => void;
  moveBy: (id: PanelId, delta: -1 | 1) => void;
}

interface PanelShellProps {
  id: PanelId;
  title: string;
  icon: React.ReactNode;
  /** help button (DiagramInfoTooltip) next to the title */
  help?: React.ReactNode;
  /** short info on the right of the title bar, also shown when folded */
  extra?: React.ReactNode;
  collapsed: boolean;
  onToggle: () => void;
  drag: PanelDrag;
  children: React.ReactNode;
}

const DRAG_TYPE = 'application/x-beatanalyzer-panel';

/**
 * Frame of a panel: title bar with a grip (drag to move the panel; arrow keys on the grip move it too), the title
 * (click: fold / unfold), help and a short info. The content is only built while unfolded.
 */
export const PanelShell: React.FC<PanelShellProps> = ({
  id,
  title,
  icon,
  help,
  extra,
  collapsed,
  onToggle,
  drag,
  children,
}) => {
  const { t } = useI18n();
  const ref = useRef<HTMLElement>(null);
  const isDragged = drag.dragging === id;
  const marker = drag.over && drag.over.id === id && drag.dragging && drag.dragging !== id ? drag.over.place : null;

  return (
    <section
      ref={ref}
      aria-label={title}
      data-panel={id}
      onDragOver={(e) => {
        if (!drag.dragging) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        const r = e.currentTarget.getBoundingClientRect();
        drag.hover(id, e.clientY < r.top + r.height / 2 ? 'before' : 'after');
      }}
      onDrop={(e) => {
        if (!drag.dragging) return;
        e.preventDefault();
        drag.drop();
      }}
      className={`relative rounded-2xl bg-slate-900/90 border shadow-xl transition-opacity ${
        isDragged ? 'opacity-40 border-cyan-700' : 'border-slate-800'
      }`}
    >
      {marker && (
        <div
          aria-hidden="true"
          className={`absolute left-2 right-2 h-1 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.7)] z-20 ${
            marker === 'before' ? '-top-3.5' : '-bottom-3.5'
          }`}
        />
      )}
      <div className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5">
        <button
          type="button"
          draggable
          onDragStart={(e) => {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData(DRAG_TYPE, id);
            if (ref.current) e.dataTransfer.setDragImage(ref.current, 24, 18);
            drag.start(id);
          }}
          onDragEnd={() => drag.end()}
          onKeyDown={(e) => {
            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
              e.preventDefault();
              drag.moveBy(id, e.key === 'ArrowUp' ? -1 : 1);
            }
          }}
          aria-label={t('web.layout.grip', { panel: title })}
          title={t('web.layout.grip_tip')}
          className="p-1 rounded-md text-slate-500 hover:text-slate-200 hover:bg-slate-800 cursor-grab active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 shrink-0"
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={!collapsed}
          title={collapsed ? t('web.layout.unfold') : t('web.layout.fold')}
          className="flex items-center gap-2 text-xs font-semibold text-slate-200 hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-lg py-1 pr-1 whitespace-nowrap shrink-0"
        >
          <span className="shrink-0 [&>svg]:w-4 [&>svg]:h-4">{icon}</span>
          <span>{title}</span>
          {collapsed ? (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          ) : (
            <ChevronUp className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          )}
        </button>
        {help}
        <div className="flex-1 min-w-0 flex justify-end">{extra}</div>
      </div>
      {!collapsed && <div className="px-3 sm:px-4 pb-4 pt-1">{children}</div>}
    </section>
  );
};
