import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

/**
 * نظام سحب وإفلات خفيف يعمل على اللمس والفأرة (Pointer Events) —
 * لا يعتمد على HTML5 drag الذي لا يعمل على الهواتف.
 * بديل بدون سحب: اضغط البطاقة ثم اضغط المكان (يعمل أيضاً بلوحة المفاتيح).
 */
interface Ctx {
  draggingId: string | null;
  overId: string | null;
  selectedId: string | null;
  disabled: boolean;
  startDrag: (e: React.PointerEvent, id: string, label: string) => void;
  tapItem: (id: string, containerId: string) => void;
  tapTarget: (targetId: string) => void;
}
const DndContext = createContext<Ctx | null>(null);
const useDnd = () => {
  const c = useContext(DndContext);
  if (!c) throw new Error('DndArea مفقود');
  return c;
};

const DRAG_THRESHOLD = 6;

export function DndArea({
  onDrop,
  disabled = false,
  children,
}: {
  onDrop: (itemId: string, targetId: string) => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const ghost = useRef<HTMLDivElement | null>(null);
  const drag = useRef<{ id: string; sx: number; sy: number; active: boolean; label: string } | null>(null);
  const suppressClick = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const place = (el: HTMLElement | null) => {
    const p = lastPos.current;
    if (el && p) el.style.transform = `translate(${p.x}px, ${p.y}px) translate(-50%, -60%)`;
  };
  const onDropRef = useRef(onDrop);
  onDropRef.current = onDrop;

  useEffect(() => {
    if (disabled) {
      setSelectedId(null);
      setDraggingId(null);
      setOverId(null);
    }
  }, [disabled]);

  const targetAt = (x: number, y: number): string | null => {
    const el = document.elementFromPoint(x, y) as HTMLElement | null;
    const t = el?.closest('[data-drop-id]') as HTMLElement | null;
    return t?.getAttribute('data-drop-id') ?? null;
  };

  const startDrag = useCallback(
    (e: React.PointerEvent, id: string, label: string) => {
      if (disabled || (e.pointerType === 'mouse' && e.button !== 0)) return;
      const el = e.currentTarget as HTMLElement;
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        /* بعض المتصفحات */
      }
      drag.current = { id, sx: e.clientX, sy: e.clientY, active: false, label };

      const move = (ev: PointerEvent) => {
        const d = drag.current;
        if (!d) return;
        if (!d.active) {
          if (Math.hypot(ev.clientX - d.sx, ev.clientY - d.sy) < DRAG_THRESHOLD) return;
          d.active = true;
          setDraggingId(d.id);
          setSelectedId(null);
        }
        lastPos.current = { x: ev.clientX, y: ev.clientY };
        place(ghost.current);
        const over = targetAt(ev.clientX, ev.clientY);
        // تمرير تلقائي عند الاقتراب من حافة الشاشة (مفيد على الهاتف).
        // لا نمرّر للأسفل فوق مجموعة البطاقات الثابتة نفسها حتى لا تتحرك الصفحة عند بدء السحب.
        if (ev.clientY < 70) window.scrollBy(0, -14);
        else if (ev.clientY > window.innerHeight - 70 && over !== 'pool') window.scrollBy(0, 14);
        setOverId(prev => (prev === over ? prev : over));
      };
      const end = (ev: PointerEvent) => {
        el.removeEventListener('pointermove', move);
        el.removeEventListener('pointerup', end);
        el.removeEventListener('pointercancel', cancel);
        const d = drag.current;
        drag.current = null;
        if (d?.active) {
          suppressClick.current = true;
          window.setTimeout(() => (suppressClick.current = false), 0);
          const target = targetAt(ev.clientX, ev.clientY);
          if (target) onDropRef.current(d.id, target);
        }
        setDraggingId(null);
        setOverId(null);
      };
      const cancel = () => {
        el.removeEventListener('pointermove', move);
        el.removeEventListener('pointerup', end);
        el.removeEventListener('pointercancel', cancel);
        drag.current = null;
        setDraggingId(null);
        setOverId(null);
      };
      el.addEventListener('pointermove', move);
      el.addEventListener('pointerup', end);
      el.addEventListener('pointercancel', cancel);
    },
    [disabled],
  );

  const tapItem = useCallback(
    (id: string, containerId: string) => {
      if (disabled || suppressClick.current) return;
      if (selectedId && selectedId !== id) {
        onDropRef.current(selectedId, containerId); // تبديل أو إعادة للمجموعة
        setSelectedId(null);
      } else setSelectedId(selectedId === id ? null : id);
    },
    [disabled, selectedId],
  );

  const tapTarget = useCallback(
    (targetId: string) => {
      if (disabled || suppressClick.current || !selectedId) return;
      onDropRef.current(selectedId, targetId);
      setSelectedId(null);
    },
    [disabled, selectedId],
  );

  const ghostLabel = drag.current?.label;
  return (
    <DndContext.Provider value={{ draggingId, overId, selectedId, disabled, startDrag, tapItem, tapTarget }}>
      {children}
      {draggingId && (
        <div
          className="gk-ghost"
          ref={el => {
            ghost.current = el;
            place(el);
          }}
          aria-hidden="true"
        >
          {ghostLabel}
        </div>
      )}
    </DndContext.Provider>
  );
}

/** بطاقة قابلة للسحب (أو الاختيار بالضغط) */
export function DragChip({
  id,
  label,
  containerId,
  state,
}: {
  id: string;
  label: string;
  containerId: string;
  state?: 'right' | 'wrong';
}) {
  const d = useDnd();
  const cls =
    'gk-chipcard' +
    (d.draggingId === id ? ' is-dragging' : '') +
    (d.selectedId === id ? ' is-selected' : '') +
    (state ? ` is-${state}` : '');
  return (
    <button
      type="button"
      className={cls}
      disabled={d.disabled}
      onPointerDown={e => d.startDrag(e, id, label)}
      onClick={e => {
        e.stopPropagation();
        d.tapItem(id, containerId);
      }}
    >
      {label}
    </button>
  );
}

/** منطقة إفلات: خانة أو مجموعة البطاقات */
export function DropTarget({
  id,
  className = '',
  children,
  label,
}: {
  id: string;
  className?: string;
  children?: React.ReactNode;
  label?: string;
}) {
  const d = useDnd();
  const cls = `${className}${d.overId === id ? ' is-over' : ''}${d.selectedId ? ' is-armed' : ''}`;
  return (
    <div
      data-drop-id={id}
      className={cls}
      role="group"
      aria-label={label}
      tabIndex={d.selectedId ? 0 : -1}
      onClick={() => d.tapTarget(id)}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          d.tapTarget(id);
        }
      }}
    >
      {children}
    </div>
  );
}
