import { useCallback, useRef, useState } from 'react';
import type { Difficulty, Session, SessionState } from './types';
import { calcAward } from './scoring';

const initial = (): SessionState => ({ round: 0, score: 0, streak: 0, bestStreak: 0, records: [] });

/**
 * حالة جلسة اللعب: الجولة، النقاط، السلسلة، سجل الجولات.
 * المرجع (ref) هو مصدر الحقيقة حتى لا تضيع التحديثات المتتالية السريعة.
 */
export function useGameSession(total: number, difficulty: Difficulty, onComplete: (final: SessionState) => void) {
  const [state, setState] = useState<SessionState>(initial);
  const ref = useRef<SessionState>(state);
  const completeRef = useRef(onComplete);
  completeRef.current = onComplete;

  const award: Session['award'] = useCallback(
    input => {
      const cur = ref.current;
      const res = calcAward({
        difficulty,
        fraction: input.fraction,
        timeRatio: input.timeRatio,
        sliceMult: input.sliceMult,
        streakBefore: cur.streak,
      });
      const streak = res.correct ? cur.streak + 1 : 0;
      const next: SessionState = {
        ...cur,
        score: cur.score + res.points,
        streak,
        bestStreak: Math.max(cur.bestStreak, streak),
        records: [...cur.records, { fraction: res.fraction, points: res.points }],
      };
      ref.current = next;
      setState(next);
      return res;
    },
    [difficulty],
  );

  const advance = useCallback(() => {
    const cur = ref.current;
    if (cur.round + 1 >= total) {
      completeRef.current(cur);
      return;
    }
    const next = { ...cur, round: cur.round + 1 };
    ref.current = next;
    setState(next);
  }, [total]);

  const reset = useCallback(() => {
    const fresh = initial();
    ref.current = fresh;
    setState(fresh);
  }, []);

  const session: Session = { ...state, total, difficulty, award, advance };
  return { session, reset };
}
