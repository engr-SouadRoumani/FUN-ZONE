import React, { useCallback, useMemo, useState } from 'react';
import { ArrowLeft, CheckCheck, Hand } from 'lucide-react';
import type { AwardResult, BoardProps } from '../kit/types';
import DropBoard from './DropBoard';
import TimerBar from '../kit/TimerBar';
import FeedbackCard from '../kit/FeedbackCard';
import { useCountdown } from '../kit/useCountdown';
import { buzz } from '../kit/feedback';
import { Grade, Placement, emptyPlacement, grade as gradeBoard } from '../kit/dndLogic';
import { ROUND_SECONDS, buildBoard, buildRounds } from './data';

/** لوح لعبة اسحب وأفلت: 10 جولات من المطابقة والترتيب */
export default function DragDropGame({ session }: BoardProps) {
  const rounds = useMemo(() => buildRounds(session.difficulty), [session.difficulty]);
  const round = rounds[session.round % rounds.length];
  const board = useMemo(() => buildBoard(round), [round]);

  const [placed, setPlaced] = useState<Placement>(() => emptyPlacement(board.slots));
  const [graded, setGraded] = useState<Grade | null>(null);
  const [award, setAward] = useState<AwardResult | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const [boardId, setBoardId] = useState(round);

  // عند الانتقال إلى جولة جديدة نبدأ بلوح فارغ
  if (boardId !== round) {
    setBoardId(round);
    setPlaced(emptyPlacement(board.slots));
    setGraded(null);
    setAward(null);
    setTimedOut(false);
  }

  const filled = Object.values(placed).filter(Boolean).length;
  const allFilled = filled === board.slots.length;

  const check = useCallback(
    (expired: boolean, ratio: number) => {
      if (graded) return;
      const g = gradeBoard(board.slots, placed);
      const res = session.award({ fraction: g.fraction, timeRatio: ratio });
      setGraded(g);
      setAward(res);
      setTimedOut(expired);
      buzz(g.fraction >= 1);
    },
    [graded, board.slots, placed, session],
  );

  const countdown = useCountdown(ROUND_SECONDS[session.difficulty], !graded, () => check(true, 0), session.round);
  const isLast = session.round + 1 >= session.total;

  const title = award
    ? award.correct
      ? 'ممتاز! كل البطاقات في مكانها'
      : award.fraction > 0
        ? `أصبتم ${graded!.correct} من ${graded!.total}`
        : 'لم تُصيبوا هذه المرة'
    : '';
  const detail = graded && !award?.correct ? 'الأماكن الخاطئة مظلّلة بالأحمر وتحتها الإجابة الصحيحة.' : undefined;

  return (
    <div className="gk-qcard gk-ddcard">
      <div className="gk-qhead">
        <span className="gk-tag">
          <span aria-hidden="true">{board.kind === 'match' ? '🧩' : '🔢'}</span> {board.kind === 'match' ? 'مطابقة' : 'ترتيب'}
        </span>
        {!graded && (
          <span className="gk-tag gk-tag-soft">
            <Hand size={13} /> {filled} / {board.slots.length}
          </span>
        )}
      </div>
      {!graded && <TimerBar left={countdown.left} ratio={countdown.ratio} />}
      <h2 className="gk-qtext">{board.title}</h2>

      <DropBoard board={board} placed={placed} onChange={setPlaced} graded={graded} />

      {!graded && (
        <button type="button" className="btn primary full" disabled={!allFilled} onClick={() => check(false, countdown.getRatio())}>
          <CheckCheck size={18} /> تحقّقوا من الإجابة
        </button>
      )}
      {graded && award && (
        <>
          <FeedbackCard award={award} timedOut={timedOut} title={title} detail={detail} />
          <button type="button" className="btn primary full" onClick={() => session.advance()} autoFocus>
            {isLast ? 'عرض النتيجة' : 'الجولة التالية'} <ArrowLeft size={17} />
          </button>
        </>
      )}
    </div>
  );
}
