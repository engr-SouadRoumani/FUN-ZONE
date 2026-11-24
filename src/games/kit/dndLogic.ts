/**
 * منطق السحب والإفلات (دوال نقية).
 * placed: يربط كل خانة (slot) بالبطاقة الموضوعة فيها أو null.
 * الهدف 'pool' يعني إعادة البطاقة إلى مجموعة البطاقات المتاحة.
 */
export type Placement = Record<string, string | null>;
export const POOL = 'pool';

export interface DndItem { id: string; label: string }
export interface DndSlot { id: string; label: string; answerId: string }

export const emptyPlacement = (slots: DndSlot[]): Placement =>
  Object.fromEntries(slots.map(s => [s.id, null])) as Placement;

export function slotOf(placed: Placement, itemId: string): string | null {
  return Object.keys(placed).find(s => placed[s] === itemId) ?? null;
}

/** ينقل بطاقة إلى هدف: خانة (مع تبديل المحتل) أو المجموعة */
export function applyDrop(placed: Placement, itemId: string, target: string): Placement {
  const from = slotOf(placed, itemId);
  if (target === POOL) {
    if (!from) return placed;
    return { ...placed, [from]: null };
  }
  if (!(target in placed) || from === target) return placed;
  const next = { ...placed };
  const occupant = next[target];
  if (from) next[from] = occupant ?? null; // تبديل (أو تفريغ الخانة القديمة)
  next[target] = itemId; // إن جاءت من المجموعة، يعود المحتل السابق إليها ضمنياً
  return next;
}

export const poolOf = (items: DndItem[], placed: Placement) => {
  const taken = new Set(Object.values(placed).filter(Boolean) as string[]);
  return items.filter(i => !taken.has(i.id));
};

export interface Grade {
  perSlot: Record<string, boolean>;
  correct: number;
  total: number;
  fraction: number;
}

export function grade(slots: DndSlot[], placed: Placement): Grade {
  const perSlot: Record<string, boolean> = {};
  let correct = 0;
  for (const s of slots) {
    const ok = placed[s.id] === s.answerId;
    perSlot[s.id] = ok;
    if (ok) correct++;
  }
  return { perSlot, correct, total: slots.length, fraction: slots.length ? correct / slots.length : 0 };
}
