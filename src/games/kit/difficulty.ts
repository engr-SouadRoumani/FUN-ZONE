import type { Difficulty } from './types';

export interface DifficultyInfo {
  id: Difficulty;
  label: string;
  emoji: string;
  /** مضاعف النقاط */
  mult: number;
  hint: string;
}

export const DIFFICULTIES: DifficultyInfo[] = [
  { id: 'easy', label: 'سهل', emoji: '🌱', mult: 1, hint: 'وقت أطول وأسئلة مباشرة' },
  { id: 'medium', label: 'متوسط', emoji: '⚡', mult: 1.5, hint: 'وقت أقل وتحدٍّ أكبر' },
  { id: 'hard', label: 'صعب', emoji: '🔥', mult: 2, hint: 'للأبطال فقط: أسرع وأصعب' },
];

export const difficultyInfo = (d: Difficulty) => DIFFICULTIES.find(x => x.id === d)!;
