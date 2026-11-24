import type { AwardResult, Difficulty } from './types';
import { difficultyInfo } from './difficulty';

/**
 * ثوابت احتساب النقاط — عدّلوها من هنا فقط.
 * نقاط الجولة = (الأساس + مكافأة السرعة + مكافأة السلسلة) × مضاعف الجولة
 * الأساس = BASE_POINTS × مضاعف الصعوبة × نسبة الصحة.
 */
export const BASE_POINTS = 50;
export const SPEED_BONUS_RATIO = 0.2; // حتى +20% من الأساس عند الإجابة الفورية
export const STREAK_STEP_RATIO = 0.1; // +10% من الأساس لكل إجابة كاملة متتالية
export const STREAK_MAX_STEPS = 4;

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

export function calcAward(opts: {
  difficulty: Difficulty;
  fraction: number;
  timeRatio?: number;
  streakBefore: number;
  sliceMult?: number;
}): AwardResult {
  const fraction = clamp01(opts.fraction);
  const perfect = fraction >= 1;
  const mult = difficultyInfo(opts.difficulty).mult;
  const baseFull = BASE_POINTS * mult;

  const base = Math.round(baseFull * fraction);
  const speed = perfect ? Math.round(baseFull * SPEED_BONUS_RATIO * clamp01(opts.timeRatio ?? 0)) : 0;
  const streak = perfect ? Math.round(baseFull * STREAK_STEP_RATIO * Math.min(opts.streakBefore, STREAK_MAX_STEPS)) : 0;
  const points = fraction <= 0 ? 0 : Math.round((base + speed + streak) * (opts.sliceMult ?? 1));

  return { points, base, speed, streak, fraction, correct: perfect };
}

/** عدد النجوم في شاشة النتيجة (1 إلى 3) بحسب نسبة الإتقان */
export function starsFor(accuracy: number): 1 | 2 | 3 {
  if (accuracy >= 0.9) return 3;
  if (accuracy >= 0.6) return 2;
  return 1;
}
