import React from 'react';
import { Check, X } from 'lucide-react';
import { DndArea, DragChip, DropTarget } from '../kit/dnd';
import { POOL, Placement, applyDrop, poolOf, type Grade } from '../kit/dndLogic';
import type { Board } from './data';

interface Props {
  board: Board;
  placed: Placement;
  onChange: (next: Placement) => void;
  /** بعد التحقق: تُقفل البطاقات وتظهر النتائج */
  graded: Grade | null;
}

/** لوح سحب وإفلات قابل لإعادة الاستخدام: بطاقات في الأسفل وخانات في الأعلى */
export default function DropBoard({ board, placed, onChange, graded }: Props) {
  const pool = poolOf(board.items, placed);
  const labelOf = (id: string | null) => board.items.find(i => i.id === id)?.label ?? '';

  return (
    <DndArea disabled={!!graded} onDrop={(itemId, target) => onChange(applyDrop(placed, itemId, target))}>
      {board.direction && <p className="gk-direction">{board.direction}</p>}
      <ul className={'gk-slots is-' + board.kind}>
        {board.slots.map(s => {
          const itemId = placed[s.id];
          const res = graded ? (graded.perSlot[s.id] ? 'right' : 'wrong') : undefined;
          return (
            <li key={s.id} className={'gk-slot' + (res ? ` is-${res}` : '')}>
              <span className={'gk-slot-label' + (board.kind === 'order' ? ' is-num' : '')}>{s.label}</span>
              <DropTarget id={s.id} className={'gk-drop' + (itemId ? ' is-filled' : '')} label={board.kind === 'order' ? `المكان ${s.label}` : `تعريف: ${s.label}`}>
                {itemId ? (
                  <DragChip id={itemId} label={labelOf(itemId)} containerId={s.id} state={res} />
                ) : (
                  <span className="gk-drop-empty">أفلتوا البطاقة هنا</span>
                )}
              </DropTarget>
              {res === 'right' && <Check className="gk-slot-mark" size={20} aria-label="صحيح" />}
              {res === 'wrong' && (
                <>
                  <X className="gk-slot-mark" size={20} aria-label="خطأ" />
                  <small className="gk-fix">الصحيح: {labelOf(s.answerId)}</small>
                </>
              )}
            </li>
          );
        })}
      </ul>

      {!graded && (
        <DropTarget id={POOL} className={'gk-pool' + (pool.length ? '' : ' is-empty')} label="البطاقات المتاحة">
          {pool.length ? (
            pool.map(i => <DragChip key={i.id} id={i.id} label={i.label} containerId={POOL} />)
          ) : (
            <span className="gk-pool-done">وضعتم كل البطاقات. اضغطوا «تحقّق» عندما تكونون جاهزين.</span>
          )}
        </DropTarget>
      )}
    </DndArea>
  );
}
