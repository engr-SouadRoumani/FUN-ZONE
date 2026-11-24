import type React from 'react';

/** مستويات الصعوبة المشتركة بين كل الألعاب الجديدة */
export type Difficulty = 'easy' | 'medium' | 'hard';

/** نتيجة محاولة حفظ النتيجة في قاعدة البيانات */
export type SaveStatus = 'saved' | 'no-db' | 'no-team' | 'no-game' | 'error';
export type SaveFn = (slug: string, score: number, durationSec: number) => Promise<SaveStatus>;

/** ما تُرسله اللعبة عند تقييم جولة واحدة */
export interface AwardInput {
  /** نسبة الصحة من 0 إلى 1 (سؤال = 0 أو 1، جولة سحب وإفلات = جزء من الأماكن الصحيحة) */
  fraction: number;
  /** نسبة الوقت المتبقي من 0 إلى 1 (لمكافأة السرعة) */
  timeRatio?: number;
  /** مضاعف خاص بالجولة (مثل الجولة الذهبية) */
  sliceMult?: number;
}

export interface AwardResult {
  points: number;
  base: number;
  speed: number;
  streak: number;
  fraction: number;
  correct: boolean;
}

export interface RoundRecord {
  fraction: number;
  points: number;
}

export interface SessionState {
  round: number;
  score: number;
  streak: number;
  bestStreak: number;
  records: RoundRecord[];
}

/** الواجهة التي يراها لوحُ أي لعبة: النقاط، السلسلة، الجولة الحالية */
export interface Session extends SessionState {
  total: number;
  difficulty: Difficulty;
  award: (input: AwardInput) => AwardResult;
  advance: () => void;
}

export interface BoardProps {
  session: Session;
}

/** تعريف لعبة قابلة للتسجيل في registry.ts */
export interface GameDef {
  /** يجب أن يطابق عمود slug في جدول games */
  slug: string;
  name: string;
  icon: string;
  description: string;
  /** أسطر قصيرة تظهر في شاشة «كيف تلعب» */
  howTo: string[];
  rounds: number;
  Board: React.ComponentType<BoardProps>;
}
