import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Zap } from 'lucide-react';
import type { AwardResult, BoardProps } from '../kit/types';
import Wheel from './Wheel';
import AnswerOptions from '../kit/AnswerOptions';
import TimerBar from '../kit/TimerBar';
import FeedbackCard from '../kit/FeedbackCard';
import { useCountdown } from '../kit/useCountdown';
import { buzz } from '../kit/feedback';
import { DrawnQuestion, QUESTION_SECONDS, SPEED_TIME_FACTOR, WHEEL_BANK, WHEEL_SLICES, WheelSlice, drawQuestion } from './data';

type Stage = 'spin' | 'landed' | 'question' | 'feedback';

/** لوح لعبة عجلة الحظ: يدير الدوران ثم السؤال ثم النتيجة */
export default function WheelGame({ session }: BoardProps) {
  const bank = useMemo(() => WHEEL_BANK[session.difficulty], [session.difficulty]);
  const used = useRef<Set<string>>(new Set());
  const [stage, setStage] = useState<Stage>('spin');
  const [slice, setSlice] = useState<WheelSlice | null>(null);
  const [item, setItem] = useState<DrawnQuestion | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const [award, setAward] = useState<AwardResult | null>(null);
  const [timedOut, setTimedOut] = useState(false);

  const seconds = Math.max(
    6,
    Math.round(QUESTION_SECONDS[session.difficulty] * (slice?.kind === 'speed' ? SPEED_TIME_FACTOR : 1)),
  );

  const resolve = useCallback(
    (choice: number, ratio: number, expired: boolean) => {
      if (!item || !slice) return;
      const ok = choice === item.answer;
      const res = session.award({ fraction: ok ? 1 : 0, timeRatio: ratio, sliceMult: slice.mult });
      setPicked(choice);
      setAward(res);
      setTimedOut(expired);
      setStage('feedback');
      buzz(ok);
    },
    [item, slice, session],
  );

  const countdown = useCountdown(seconds, stage === 'question', () => resolve(-1, 0, true), `${session.round}-${slice?.id}`);

  function onLanded(index: number) {
    const s = WHEEL_SLICES[index];
    const drawn = drawQuestion(bank, used.current, s.category);
    if (!drawn) return;
    used.current.add(drawn.id);
    setSlice(s);
    setItem(drawn);
    setPicked(null);
    setAward(null);
    setTimedOut(false);
    setStage('landed');
    window.setTimeout(() => setStage('question'), 1100);
  }

  function next() {
    setStage('spin');
    session.advance();
  }

  const isLast = session.round + 1 >= session.total;

  return (
    <div className="gk-wheelgame">
      {(stage === 'spin' || stage === 'landed') && (
        <div className="gk-wheel-stage">
          <p className="gk-hint">{stage === 'spin' ? 'اضغطوا على العجلة لتدور' : '\u00A0'}</p>
          <Wheel slices={WHEEL_SLICES} onResult={onLanded} disabled={stage === 'landed'} />
          {stage === 'landed' && slice ? (
            <div className={'gk-landed is-' + slice.kind} key={slice.id}>
              <span aria-hidden="true">{slice.icon}</span> {slice.label}
            </div>
          ) : (
            <ul className="gk-legend" aria-label="شرائح العجلة">
              {WHEEL_SLICES.map(s => (
                <li key={s.id}><span aria-hidden="true">{s.icon}</span> {s.label}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {(stage === 'question' || stage === 'feedback') && slice && item && (
        <div className={'gk-qcard is-' + slice.kind}>
          <div className="gk-qhead">
            <span className="gk-tag"><span aria-hidden="true">{slice.icon}</span> {slice.label}</span>
            {slice.mult > 1 && <span className="gk-tag gk-tag-mult"><Zap size={13} /> ×{slice.mult}</span>}
          </div>
          {stage === 'question' && <TimerBar left={countdown.left} ratio={countdown.ratio} />}
          <h2 className="gk-qtext">{item.q}</h2>
          <AnswerOptions
            options={item.options}
            picked={picked}
            correct={stage === 'feedback' ? item.answer : null}
            onPick={i => resolve(i, countdown.getRatio(), false)}
          />
          {stage === 'feedback' && award && (
            <>
              <FeedbackCard
                award={award}
                timedOut={timedOut}
                title={award.correct ? 'إجابة صحيحة!' : 'إجابة خاطئة'}
                detail={award.correct ? item.explain : `الإجابة الصحيحة: ${item.options[item.answer]}. ${item.explain}`}
              />
              <button type="button" className="btn primary full" onClick={next} autoFocus>
                {isLast ? 'عرض النتيجة' : 'أدِروا العجلة من جديد'} <ArrowLeft size={17} />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
