import type { Difficulty } from './types';

/**
 * سجل محلي لنتائج الفريق (نسخة سريعة بجانب قاعدة البيانات).
 * يُستخدم لعرض «أفضل نتيجة» لكل مستوى وآخر المحاولات.
 */
export interface AttemptLog {
  score: number;
  difficulty: Difficulty;
  correct: number;
  total: number;
  duration: number;
  at: string;
}

const MAX_KEEP = 20;

function key(slug: string) {
  let team = 'guest';
  try {
    team = sessionStorage.getItem('fz_team') || 'guest';
  } catch {
    /* التخزين غير متاح */
  }
  return `fz_hist_${team}_${slug}`;
}

export function readHistory(slug: string): AttemptLog[] {
  try {
    const raw = localStorage.getItem(key(slug));
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function pushHistory(slug: string, entry: AttemptLog) {
  try {
    const next = [entry, ...readHistory(slug)].slice(0, MAX_KEEP);
    localStorage.setItem(key(slug), JSON.stringify(next));
  } catch {
    /* تجاهل: الحفظ المحلي اختياري */
  }
}

export function bestByDifficulty(slug: string): Partial<Record<Difficulty, number>> {
  const out: Partial<Record<Difficulty, number>> = {};
  for (const a of readHistory(slug)) {
    if (out[a.difficulty] === undefined || a.score > (out[a.difficulty] as number)) out[a.difficulty] = a.score;
  }
  return out;
}
