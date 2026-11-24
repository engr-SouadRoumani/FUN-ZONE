import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Cloud, CloudOff, Flame, MousePointerClick, RotateCcw, Sparkles, Star, Timer, Trophy } from 'lucide-react';
import './kit.css';
import type { Difficulty, GameDef, SaveFn, SaveStatus, SessionState } from './types';
import { DIFFICULTIES, difficultyInfo } from './difficulty';
import { useGameSession } from './useGameSession';
import { starsFor } from './scoring';
import { bestByDifficulty, pushHistory } from './storage';
import Confetti from './Confetti';

type Phase = 'intro' | 'play' | 'result';
type SaveUi = 'idle' | 'saving' | SaveStatus;

const HOW_ICONS = [MousePointerClick, Timer, Star];

const SAVE_TEXT: Record<SaveStatus, string> = {
  saved: 'تم حفظ نتيجة الفريق',
  'no-db': 'وضع تجريبي: قاعدة البيانات غير مربوطة، لن تُحفظ النتيجة',
  'no-team': 'لم تُحفظ النتيجة: سجّلوا الفريق أولاً من رابط الفعالية',
  'no-game': 'اللعبة غير مضافة بعد إلى قاعدة البيانات: نفّذوا ملف الترحيل الخاص بها',
  error: 'تعذّر حفظ النتيجة. تحقّقوا من الاتصال ثم أعيدوا المحاولة',
};

/** عدّاد يرتفع تدريجياً حتى القيمة النهائية (يُظهر النقاط بشكل ممتع) */
function useCountUp(target: number, run: boolean, ms = 900) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!run) return;
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || target === 0) {
      setV(target);
      return;
    }
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / ms);
      setV(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, run, ms]);
  return v;
}

/** شريط الجولات: كل قطعة = جولة (أخضر صحيح، ذهبي جزئي، أحمر خطأ) */
function Pips({ total, round, records }: { total: number; round: number; records: SessionState['records'] }) {
  return (
    <ol className="gk-pips" aria-label={`الجولة ${round + 1} من ${total}`}>
      {Array.from({ length: total }, (_, i) => {
        const r = records[i];
        const cls = r ? (r.fraction >= 1 ? 'is-right' : r.fraction > 0 ? 'is-part' : 'is-wrong') : i === round ? 'is-now' : '';
        return <li key={i} className={cls} />;
      })}
    </ol>
  );
}

export default function GameFrame({ def, save }: { def: GameDef; save: SaveFn }) {
  const nav = useNavigate();
  const [phase, setPhase] = useState<Phase>('intro');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [runId, setRunId] = useState(0);
  const [final, setFinal] = useState<(SessionState & { duration: number }) | null>(null);
  const [saveUi, setSaveUi] = useState<SaveUi>('idle');
  const startedAt = useRef(0);
  const savingRef = useRef(false);
  const lastScore = useRef({ score: 0, duration: 0 });

  const backCode = sessionStorage.getItem('fz_event_code') || '';
  const teamName = sessionStorage.getItem('fz_team_name');
  const goBack = () => nav(backCode ? `/games/${backCode}` : '/');

  const doSave = useCallback(
    async (score: number, duration: number) => {
      if (savingRef.current) return;
      savingRef.current = true;
      setSaveUi('saving');
      try {
        const status = await save(def.slug, score, duration);
        setSaveUi(status);
        if (status === 'error') savingRef.current = false; // يسمح بإعادة المحاولة
      } catch {
        setSaveUi('error');
        savingRef.current = false;
      }
    },
    [save, def.slug],
  );

  const onComplete = useCallback(
    (s: SessionState) => {
      const duration = Math.max(1, Math.round((Date.now() - startedAt.current) / 1000));
      const correct = s.records.filter(r => r.fraction >= 1).length;
      setFinal({ ...s, duration });
      setPhase('result');
      pushHistory(def.slug, {
        score: s.score,
        difficulty,
        correct,
        total: def.rounds,
        duration,
        at: new Date().toISOString(),
      });
      lastScore.current = { score: s.score, duration };
      void doSave(s.score, duration);
    },
    [def.slug, def.rounds, difficulty, doSave],
  );

  const { session, reset } = useGameSession(def.rounds, difficulty, onComplete);

  function start() {
    reset();
    savingRef.current = false;
    setSaveUi('idle');
    setFinal(null);
    startedAt.current = Date.now();
    setRunId(n => n + 1);
    setPhase('play');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const best = bestByDifficulty(def.slug);
  const Board = def.Board;
  const correctCount = final ? final.records.filter(r => r.fraction >= 1).length : 0;
  const accuracy = final ? correctCount / def.rounds : 0;
  const stars = starsFor(accuracy);
  const shownScore = useCountUp(final?.score ?? 0, phase === 'result');
  const isRecord = final ? (best[difficulty] ?? 0) <= final.score : false;

  return (
    <div className="gk">
      <div className="gk-top">
        <button type="button" className="gk-back" onClick={goBack}>
          <ArrowRight size={16} /> العودة للألعاب
        </button>
        <span className="pill"><span aria-hidden="true">{def.icon}</span> {def.name}</span>
      </div>

      {phase === 'intro' && (
        <section className="gk-card gk-intro">
          <div className="gk-intro-head">
            <span className="gk-badge-icon" aria-hidden="true">{def.icon}</span>
            <div>
              <h1>{def.name}</h1>
              <p>{def.description}</p>
            </div>
          </div>

          <ul className="gk-how">
            {def.howTo.map((t, i) => {
              const Icon = HOW_ICONS[i % HOW_ICONS.length];
              return (
                <li key={i}>
                  <span><Icon size={18} /></span>
                  {t}
                </li>
              );
            })}
          </ul>

          <h2 className="gk-h2">اختاروا المستوى</h2>
          <div className="gk-levels" role="radiogroup" aria-label="مستوى الصعوبة">
            {DIFFICULTIES.map(d => (
              <button
                key={d.id}
                type="button"
                role="radio"
                aria-checked={difficulty === d.id}
                className={'gk-level' + (difficulty === d.id ? ' is-on' : '')}
                data-level={d.id}
                onClick={() => setDifficulty(d.id)}
              >
                <span className="gk-level-emoji" aria-hidden="true">{d.emoji}</span>
                <b>{d.label}</b>
                <small>{d.hint}</small>
                <span className="gk-level-mult">نقاط ×{d.mult}</span>
                {best[d.id] !== undefined && (
                  <span className="gk-level-best"><Trophy size={12} /> أفضل نتيجة {best[d.id]}</span>
                )}
              </button>
            ))}
          </div>

          <button type="button" className="btn primary full gk-start" onClick={start}>
            <Sparkles size={18} /> ابدأوا اللعب
          </button>
        </section>
      )}

      {phase === 'play' && (
        <section className="gk-stage" data-difficulty={difficulty}>
          <div className="gk-hud">
            <div className="gk-hud-round">
              <small>الجولة</small>
              <b>{session.round + 1}<span> / {def.rounds}</span></b>
            </div>
            <div className="gk-hud-chips">
              <span className="gk-chip gk-chip-level" data-level={difficulty}>{difficultyInfo(difficulty).emoji} {difficultyInfo(difficulty).label}</span>
              <span className={'gk-chip gk-chip-streak' + (session.streak >= 2 ? ' is-hot' : '')} title="إجابات صحيحة متتالية">
                <Flame size={15} /> {session.streak}
              </span>
              <span className="gk-chip gk-chip-score" key={session.score} title="النقاط">
                <Star size={15} /> {session.score}
              </span>
            </div>
          </div>
          <Pips total={def.rounds} round={session.round} records={session.records} />
          <Board key={runId} session={session} />
        </section>
      )}

      {phase === 'result' && final && (
        <section className="gk-card gk-result">
          {stars >= 2 && <Confetti burstKey={runId} />}
          <div className="gk-stars" aria-label={`${stars} من 3 نجوم`}>
            {[1, 2, 3].map(n => (
              <span key={n} className={n <= stars ? 'is-on' : ''} style={{ animationDelay: `${n * 160}ms` }}>
                <Star size={38} />
              </span>
            ))}
          </div>
          <p className="gk-result-lead">أحسنتم يا فريق {teamName || 'الأبطال'}!</p>
          <h1>انتهى التحدّي</h1>
          <div className="gk-score-big">{shownScore}<small> نقطة</small></div>
          {isRecord && final.score > 0 && <span className="gk-record"><Trophy size={14} /> أفضل نتيجة لكم في مستوى {difficultyInfo(difficulty).label}</span>}

          <div className="gk-stats">
            <div><b>{correctCount}<span>/{def.rounds}</span></b><small>إجابات كاملة</small></div>
            <div><b>{final.bestStreak}</b><small>أطول سلسلة</small></div>
            <div><b>{final.duration}<span>ث</span></b><small>الزمن</small></div>
          </div>

          <Pips total={def.rounds} round={-1} records={final.records} />

          <div className={'gk-save is-' + saveUi} role="status" aria-live="polite">
            {saveUi === 'saving' && <><Cloud size={16} /> جارٍ حفظ النتيجة...</>}
            {saveUi === 'saved' && <><Cloud size={16} /> {SAVE_TEXT.saved}</>}
            {saveUi !== 'idle' && saveUi !== 'saving' && saveUi !== 'saved' && (
              <>
                <CloudOff size={16} /> {SAVE_TEXT[saveUi]}
                {saveUi === 'error' && (
                  <button type="button" className="gk-link" onClick={() => void doSave(lastScore.current.score, lastScore.current.duration)}>
                    إعادة المحاولة
                  </button>
                )}
              </>
            )}
          </div>

          <div className="gk-result-actions">
            <button type="button" className="btn primary" onClick={start}><RotateCcw size={17} /> العبوا مرة أخرى</button>
            <button type="button" className="btn ghost" onClick={() => setPhase('intro')}>تغيير المستوى</button>
            {backCode && <Link className="btn ghost" to={`/leaderboard/${backCode}`}><Trophy size={16} /> ترتيب الفرق</Link>}
            <button type="button" className="btn ghost" onClick={goBack}>كل الألعاب</button>
          </div>
        </section>
      )}
    </div>
  );
}
