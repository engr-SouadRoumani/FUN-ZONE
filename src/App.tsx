import React, { useEffect, useMemo, useState } from 'react';
import { Link, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Trophy, Gamepad2, Users, Plus, LogOut, ArrowLeft, Sparkles, Brain, RefreshCw, House as HouseIcon, ShieldCheck, Check, Crown, Medal, Rocket } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { GAME_DEFS, findGameDef } from './games/registry';
import GameFrame from './games/kit/GameFrame';
import Confetti from './games/kit/Confetti';
import HeroWheel from './ui/HeroWheel';
import type { SaveStatus } from './games/kit/types';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const db: SupabaseClient | null = url && key ? createClient(url, key) : null;

const cleanBase = import.meta.env.BASE_URL.replace(/\/$/, '');
const shareBase = `${window.location.origin}${cleanBase}/#`;

type Game = { id: string; slug: string; name: string; description: string; icon: string; badge?: string };
type EventRow = { id: string; title: string; description: string | null; join_code: string; status: string };
type TeamRow = {
  id: string;
  event_id: string;
  user_id?: string | null;
  team_name: string;
  members?: string[];
  score?: number;
  progress?: Record<string, any>;
};

const games: Game[] = [
  { id: 'memory', slug: 'memory', name: 'تحدي الذاكرة', description: 'اكشف البطاقات وطابق الصور المتشابهة', icon: '🧠' },
  { id: 'steps', slug: 'steps', name: 'رتّب الخطوات', description: 'رتّب الأحداث والخطوات بالتسلسل الصحيح', icon: '🪜' },
  { id: 'quiz', slug: 'quiz', name: 'معلومات عامة', description: 'اختبر معلوماتك في أسئلة متنوعة', icon: '🌍' },
  { id: 'crossword', slug: 'crossword', name: 'تحدي الكلمات', description: 'حل الكلمات والألغاز القصيرة', icon: '🔤' },
  { id: 'riddles', slug: 'riddles', name: 'ألغاز وذكاء', description: 'فكّر خارج الصندوق واعثر على الحل', icon: '💡' },
  { id: 'scramble', slug: 'scramble', name: 'رتّب الحروف', description: 'كوّن الكلمة الصحيحة من الحروف المبعثرة', icon: '🔀' },
  { id: 'spot', slug: 'spot', name: 'اكتشف المختلف', description: 'لاحظ التفاصيل واختر الإجابة المختلفة', icon: '👀' },
  { id: 'emoji', slug: 'emoji', name: 'خمّن بالإيموجي', description: 'خمّن المثل أو الحيوان أو البلد', icon: '😄' }
];

// الألعاب التفاعلية الجديدة تُضاف تلقائياً من src/games/registry.ts
games.push(...GAME_DEFS.map(d => ({ id: d.slug, slug: d.slug, name: d.name, description: d.description, icon: d.icon, badge: 'جديد' })));

const content: Record<string, { q: string; a: string[]; correct: number; explain?: string }[]> = {
  quiz: [{ q: 'ما عاصمة اليابان؟', a: ['بكين', 'طوكيو', 'سيول', 'بانكوك'], correct: 1 }, { q: 'أي حيوان يُلقّب بسفينة الصحراء؟', a: ['الحصان', 'الفيل', 'الجمل', 'الغزال'], correct: 2 }, { q: 'كم عدد ألوان قوس قزح التقليدية؟', a: ['5', '6', '7', '8'], correct: 2 }, { q: 'ما أكبر كوكب في المجموعة الشمسية؟', a: ['الأرض', 'المشتري', 'المريخ', 'زحل'], correct: 1 }, { q: 'أي فاكهة تُعرف بأنها غنية بفيتامين C؟', a: ['البرتقال', 'الموز', 'العنب', 'التمر'], correct: 0 }],
  riddles: [{ q: 'شيء كلما أخذت منه كبر، ما هو؟', a: ['الحفرة', 'العمر', 'الظل', 'البحر'], correct: 0 }, { q: 'له أسنان ولا يعض، ما هو؟', a: ['الكلب', 'المشط', 'التمساح', 'المفتاح'], correct: 1 }, { q: 'ما الشيء الذي يكتب ولا يقرأ؟', a: ['القلم', 'الكتاب', 'الطالب', 'الهاتف'], correct: 0 }, { q: 'يمشي بلا قدمين ويبكي بلا عينين، ما هو؟', a: ['الطفل', 'السحاب', 'النهر', 'الساعة'], correct: 1 }],
  steps: [{ q: 'رتّب خطوات تحضير الشاي: ما الخطوة الأولى؟', a: ['صب الشاي في الكوب', 'غلي الماء', 'إضافة السكر', 'تحريك الشاي'], correct: 1 }, { q: 'ما أول مرحلة في نمو الفراشة؟', a: ['فراشة', 'شرنقة', 'بيضة', 'يرقة'], correct: 2 }, { q: 'ما أول خطوة عند زراعة بذرة؟', a: ['قطف الثمرة', 'وضع البذرة في التربة', 'تقليم الأوراق', 'حصاد النبات'], correct: 1 }],
  scramble: [{ q: 'رتّب الحروف: (د - س - أ)', a: ['أسد', 'داس', 'سأد', 'أدس'], correct: 0 }, { q: 'رتّب الحروف: (ز - و - م - ر)', a: ['موزر', 'زمور', 'موز', 'رومز'], correct: 2 }, { q: 'رتّب الحروف: (ب - ا - ت - ك)', a: ['كتاب', 'كاتب', 'تكاب', 'باكت'], correct: 0 }],
  spot: [{ q: 'أي كلمة ليست من الفواكه؟', a: ['تفاح', 'موز', 'خيار', 'عنب'], correct: 2 }, { q: 'أي حيوان مختلف عن البقية؟', a: ['أسد', 'نمر', 'فهد', 'دلفين'], correct: 3 }, { q: 'أي عنصر لا ينتمي للمجموعة؟', a: ['قلم', 'دفتر', 'ممحاة', 'ملعقة'], correct: 3 }],
  emoji: [{ q: '🐪 ☀️ 🏜️ — ما الحيوان المقصود؟', a: ['الجمل', 'الدب', 'البطريق', 'الحوت'], correct: 0 }, { q: '🍯 🐝 — ماذا نحصل عليه؟', a: ['حليب', 'عسل', 'خبز', 'جبن'], correct: 1 }, { q: '🍎 🍌 🍇 — ما التصنيف؟', a: ['خضروات', 'ألعاب', 'فواكه', 'بلدان'], correct: 2 }],
  crossword: [{ q: 'شيء نراه في السماء ليلاً ويضيء: (4 أحرف)', a: ['قمر', 'نجم', 'شمس', 'سحاب'], correct: 0 }, { q: 'فاكهة صفراء يحبها القرد', a: ['تفاح', 'موز', 'كيوي', 'كرز'], correct: 1 }, { q: 'عاصمة مصر', a: ['دمشق', 'عمّان', 'القاهرة', 'الرباط'], correct: 2 }]
};

const memoryCards = ['🐼', '🍉', '🚀', '🦊', '🍓', '🐬'];

// ضمان وجود جلسة مستخدم ثابتة عبر Supabase Auth
async function ensurePlayerSession() {
  if (!db) return null;
  const { data: { session } } = await db.auth.getSession();
  if (session?.user) return session.user;
  const { data, error } = await db.auth.signInAnonymously();
  if (error) return null;
  return data.user;
}

// حفظ بيانات الفريق محلياً كنسخة احتياطية سريعة بجانب قاعدة البيانات
function persistTeamCache(team: TeamRow, event: EventRow) {
  localStorage.setItem(`fz_team_${event.id}`, team.id);
  sessionStorage.setItem('fz_team', team.id);
  sessionStorage.setItem('fz_team_name', team.team_name);
  sessionStorage.setItem('fz_event', event.id);
  sessionStorage.setItem('fz_event_code', event.join_code);
  sessionStorage.setItem('fz_event_title', event.title);
}

// استرجاع الفريق المسجل مسبقاً للفعالية إن وُجد
async function findExistingTeam(eventId: string, userId?: string | null): Promise<TeamRow | null> {
  if (!db) return null;
  const savedTeamId = localStorage.getItem(`fz_team_${eventId}`) || sessionStorage.getItem('fz_team');

  if (userId) {
    const { data: byUser } = await db
      .from('teams')
      .select('*')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .maybeSingle();
    if (byUser) return byUser;
  }

  if (savedTeamId) {
    const { data: byId } = await db
      .from('teams')
      .select('*')
      .eq('event_id', eventId)
      .eq('id', savedTeamId)
      .maybeSingle();
    if (byId) return byId;
  }

  return null;
}

// تحديث نقاط وتقدم الفريق في قاعدة البيانات
async function saveTeamProgress(teamId: string, addedPoints: number, gameSlug: string, finalGameScore: number) {
  if (!db || !teamId) return;
  const { data: currentTeam } = await db
    .from('teams')
    .select('score, progress')
    .eq('id', teamId)
    .maybeSingle();

  const prevScore = Number(currentTeam?.score || 0);
  const prevProgress = (currentTeam?.progress && typeof currentTeam.progress === 'object')
    ? currentTeam.progress
    : {};
  const completedGames: string[] = Array.isArray(prevProgress.completedGames)
    ? prevProgress.completedGames
    : [];

  const updatedCompleted = completedGames.includes(gameSlug)
    ? completedGames
    : [...completedGames, gameSlug];

  const nextProgress = {
    ...prevProgress,
    completedGames: updatedCompleted,
    lastGame: gameSlug,
    lastGameScore: finalGameScore
  };

  await db
    .from('teams')
    .update({
      score: prevScore + addedPoints,
      progress: nextProgress,
      updated_at: new Date().toISOString()
    })
    .eq('id', teamId);
}

// حفظ نتيجة لعبة تفاعلية جديدة: نفس خطوات Play.finish (محاولة + تقدم الفريق) مع إرجاع الحالة لعرضها
async function saveGameAttempt(slug: string, finalScore: number, durationSec: number): Promise<SaveStatus> {
  if (!db) return 'no-db';
  const user = await ensurePlayerSession();
  const eventId = sessionStorage.getItem('fz_event');
  let teamId = sessionStorage.getItem('fz_team');
  if (!teamId && eventId) {
    const found = await findExistingTeam(eventId, user?.id);
    if (found) {
      teamId = found.id;
      sessionStorage.setItem('fz_team', found.id);
      sessionStorage.setItem('fz_team_name', found.team_name);
    }
  }
  if (!teamId || !eventId) return 'no-team';
  const { data: g } = await db.from('games').select('id').eq('slug', slug).maybeSingle();
  if (!g) return 'no-game';
  const { error } = await db.from('game_attempts').insert({
    event_id: eventId,
    game_id: g.id,
    team_id: teamId,
    score: finalScore,
    duration: durationSec,
    status: 'completed',
    completed_at: new Date().toISOString()
  });
  if (error) return 'error';
  await saveTeamProgress(teamId, finalScore, slug, finalScore);
  return 'saved';
}

function Header() {
  return (
    <header className="topbar">
      <Link to="/" className="brand">
        <span className="brand-mark"><Gamepad2 size={20} /></span>
        <span>FUN <b>ZONE</b></span>
      </Link>
      <nav>
        <Link to="/"><HouseIcon size={16} /><span>الرئيسية</span></Link>
        <Link to="/admin"><ShieldCheck size={16} /><span>لوحة الإدارة</span></Link>
      </nav>
    </header>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <footer>FUN ZONE · العب، تحدّث، واجمع النقاط ✨</footer>
    </>
  );
}

function Home() {
  return (
    <Layout>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow"><Sparkles size={15} /> مساحة المرح والتحدّي</span>
          <h1>اللعب أحلى<br /><em>لما نلعب سوا!</em></h1>
          <p>منصة ألعاب تفاعلية للفعاليات والمسابقات. امسح رمز QR، سجّل اسم فريقك، وابدأ التحدّي.</p>
          <div className="actions">
            <a className="btn primary" href="#join">انضم إلى فعالية <ArrowLeft size={18} /></a>
            <Link className="btn ghost" to="/admin">لوحة المنظّم</Link>
          </div>
        </div>
        <div className="hero-art">
          <div className="float-card f1">🧩 <b>تحديات ذكية</b></div>
          <HeroWheel />
          <div className="float-card f2">🏆 <b>نافس واربح</b></div>
          <div className="spark s1">✦</div>
          <div className="spark s2">✧</div>
        </div>
      </section>
      <section className="feature-row">
        <div className="f-g"><Brain /><b>ألعاب متنوعة</b><small>{games.length} ألعاب وتحديات</small></div>
        <div className="f-y"><Users /><b>فرق فقط</b><small>اسم الفريق دون أسماء أفراد</small></div>
        <div className="f-b"><Trophy /><b>نتائج مباشرة</b><small>ترتيب يتحدّث تلقائياً</small></div>
      </section>
      <section id="join" className="join-callout">
        <div>
          <h2>عندك رمز الفعالية؟</h2>
          <p>أدخله للانتقال مباشرة إلى صفحة تسجيل فريقك.</p>
        </div>
        <JoinByCode />
      </section>
    </Layout>
  );
}

function JoinByCode() {
  const [code, setCode] = useState('');
  const nav = useNavigate();
  return (
    <form className="inline-form" onSubmit={e => { e.preventDefault(); nav('/join/' + code.trim().toUpperCase()); }}>
      <input value={code} onChange={e => setCode(e.target.value)} placeholder="مثال: FUN2026" required />
      <button className="btn primary">دخول <ArrowLeft size={17} /></button>
    </form>
  );
}

function Join() {
  const { code = '' } = useParams();
  const [event, setEvent] = useState<EventRow | null>(null);
  const [team, setTeam] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(true);
  const nav = useNavigate();

  useEffect(() => {
    let active = true;
    (async () => {
      setChecking(true);
      setError('');
      if (!db) {
        setError('قاعدة البيانات غير مربوطة بعد. أكملي إعداد Supabase حسب ملف README.');
        setChecking(false);
        return;
      }
      const user = await ensurePlayerSession();
      const { data: ev, error: evErr } = await db
        .from('events')
        .select('*')
        .eq('join_code', code.toUpperCase())
        .eq('status', 'active')
        .maybeSingle();

      if (!active) return;
      if (evErr || !ev) {
        setError('لم نعثر على فعالية نشطة بهذا الرمز. تأكدي من الرمز مع المنظّم.');
        setChecking(false);
        return;
      }
      setEvent(ev);

      // استرجاع الفريق تلقائياً إذا كان مسجلاً مسبقاً في هذه الفعالية
      const existing = await findExistingTeam(ev.id, user?.id);
      if (!active) return;
      if (existing) {
        persistTeamCache(existing, ev);
        nav('/games/' + ev.join_code, { replace: true });
        return;
      }
      setChecking(false);
    })();
    return () => { active = false; };
  }, [code, nav]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!db || !event) return;
    setBusy(true);
    setError('');
    const user = await ensurePlayerSession();

    // التحقق أولاً من وجود فريق مسبق لنفس المستخدم في هذه الفعالية
    const existing = await findExistingTeam(event.id, user?.id);
    if (existing) {
      persistTeamCache(existing, event);
      setBusy(false);
      nav('/games/' + event.join_code, { replace: true });
      return;
    }

    const payload: Record<string, any> = {
      event_id: event.id,
      team_name: team.trim(),
      score: 0,
      progress: { completedGames: [] }
    };
    if (user?.id) payload.user_id = user.id;

    const { data, error: insErr } = await db
      .from('teams')
      .upsert(payload, { onConflict: 'event_id,user_id' })
      .select('*')
      .single();

    setBusy(false);
    if (insErr) {
      setError(insErr.code === '23505' ? 'هذا الاسم مسجّل مسبقاً في الفعالية أو لديك فريق مسجّل مسبقاً.' : insErr.message);
      return;
    }
    persistTeamCache(data, event);
    nav('/games/' + event.join_code, { replace: true });
  }

  return (
    <Layout>
      <div className="narrow panel join-panel">
        <span className="join-icon"><Users size={26} /></span>
        <span className="eyebrow">انضم إلى التحدّي</span>
        <h1>{event?.title || 'تسجيل الفريق'}</h1>
        {event?.description && <p>{event.description}</p>}
        {checking ? (
          <p className="muted">جارٍ التحقق من الجلسة واسترجاع الفريق...</p>
        ) : (
          <form onSubmit={submit} className="stack">
            <label>اسم الفريق</label>
            <input value={team} onChange={e => setTeam(e.target.value)} placeholder="مثلاً: العباقرة" minLength={2} maxLength={32} required />
            <button className="btn primary" disabled={!event || busy}>{busy ? 'جارٍ التسجيل...' : 'تسجيل الفريق وبدء اللعب'} <ArrowLeft size={18} /></button>
          </form>
        )}
        {error && <p className="error">{error}</p>}
        <small className="muted">لا نطلب أسماء اللاعبين؛ نسجّل اسم الفريق فقط.</small>
      </div>
    </Layout>
  );
}

function GameList() {
  const { code = '' } = useParams();
  // إظهار كل الألعاب افتراضياً لضمان ظهورها جميعاً عند الدخول عبر QR
  const [active, setActive] = useState<string[]>(games.map(g => g.slug));
  const [teamRow, setTeamRow] = useState<TeamRow | null>(null);
  const [eventRow, setEventRow] = useState<EventRow | null>(null);
  const nav = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!db) return;
      const user = await ensurePlayerSession();
      const { data: ev } = await db
        .from('events')
        .select('*')
        .eq('join_code', code.toUpperCase())
        .maybeSingle();

      if (!mounted || !ev) return;
      setEventRow(ev);
      sessionStorage.setItem('fz_event', ev.id);
      sessionStorage.setItem('fz_event_code', ev.join_code);
      sessionStorage.setItem('fz_event_title', ev.title);

      // دمج الألعاب المفعّلة في event_games إن وُجدت مع الإبقاء على جميع الألعاب المتاحة
      const { data: eg } = await db
        .from('event_games')
        .select('games(slug)')
        .eq('event_id', ev.id)
        .eq('is_active', true);
      if (mounted && eg?.length) {
        const slugs = eg.map((x: any) => x.games?.slug).filter(Boolean);
        if (slugs.length) {
          const knownSlugs = games.map(g => g.slug);
          setActive(Array.from(new Set([...knownSlugs, ...slugs])));
        }
      }

      const existing = await findExistingTeam(ev.id, user?.id);
      if (mounted && existing) {
        setTeamRow(existing);
        persistTeamCache(existing, ev);
      }
    })();
    return () => { mounted = false; };
  }, [code]);

  async function handleTeamLogout() {
    const evId = eventRow?.id || sessionStorage.getItem('fz_event');
    if (evId) localStorage.removeItem(`fz_team_${evId}`);
    sessionStorage.removeItem('fz_team');
    sessionStorage.removeItem('fz_team_name');
    if (db) {
      await db.auth.signOut();
    }
    nav('/');
  }

  const teamId = teamRow?.id || sessionStorage.getItem('fz_team');
  const teamName = teamRow?.team_name || sessionStorage.getItem('fz_team_name');
  const eventTitle = eventRow?.title || sessionStorage.getItem('fz_event_title');

  const doneSlugs: string[] = Array.isArray(teamRow?.progress?.completedGames) ? teamRow!.progress!.completedGames : [];
  const shown = games.filter(g => active.includes(g.slug));
  const doneCount = shown.filter(g => doneSlugs.includes(g.slug)).length;

  return (
    <Layout>
      <div className="page-heading">
        <span className="eyebrow">{eventTitle || 'الفعالية'}</span>
        <h1>اختاروا لعبتكم!</h1>
        <p>الفريق: <b>{teamName || '—'}</b>{typeof teamRow?.score === 'number' ? ` · النقاط: ${teamRow.score}` : ''}</p>
        {teamId && shown.length > 0 && (
          <div className="team-progress">
            <div className="team-progress-top"><span><Rocket size={15} /> رحلة الفريق</span><b>{doneCount} / {shown.length} ألعاب</b></div>
            <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={shown.length} aria-valuenow={doneCount}>
              <span style={{ width: (doneCount / shown.length * 100) + '%' }} />
            </div>
          </div>
        )}
        {teamId && (
          <button className="btn ghost" onClick={handleTeamLogout}><LogOut size={16} /> تسجيل الخروج</button>
        )}
      </div>
      <div className="game-grid">
        {shown.map(g => (
          <Link to={'/play/' + g.slug} className={'game-card' + (g.badge ? ' is-new' : '') + (doneSlugs.includes(g.slug) ? ' is-done' : '')} data-game={g.slug} key={g.slug}>
            <span className="game-emoji">{g.icon}</span>
            {g.badge && <span className="game-badge"><Sparkles size={12} /> {g.badge}</span>}
            {doneSlugs.includes(g.slug) && <span className="game-done"><Check size={13} /> أنجزتموها</span>}
            <h3>{g.name}</h3>
            <p>{g.description}</p>
            <span className="play-link">العب الآن <ArrowLeft size={16} /></span>
          </Link>
        ))}
      </div>
      <div className="center">
        <Link to={'/leaderboard/' + code} className="btn ghost"><Trophy size={17} /> مشاهدة ترتيب الفرق</Link>
      </div>
      {!teamId && <p className="error center">للتسجيل، افتحوا رابط الفعالية وادخلوا اسم الفريق أولاً.</p>}
    </Layout>
  );
}

function Play() {
  const { slug = '' } = useParams();
  const game = games.find(g => g.slug === slug);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [flips, setFlips] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [start] = useState(Date.now());
  const nav = useNavigate();
  const questions = content[slug] || content.quiz;
  const memoryDeck = useMemo(() => [...memoryCards, ...memoryCards].map((v, i) => ({ v, i })).sort((a, b) => ((a.i * 17 + 13) % 23) - ((b.i * 17 + 13) % 23)), []);

  if (!game) return <Layout><p>اللعبة غير موجودة.</p></Layout>;

  function next() {
    if (answer === null) return;
    const correct = questions[index].correct === answer;
    const nextScore = score + (correct ? 100 : 0);
    setScore(nextScore);
    setAnswer(null);
    if (index + 1 >= questions.length) { finish(nextScore); }
    else setIndex(index + 1);
  }

  async function finish(finalScore: number) {
    if (done) return;
    setDone(true);
    if (!db) return;
    const user = await ensurePlayerSession();
    const eventId = sessionStorage.getItem('fz_event');
    let teamId = sessionStorage.getItem('fz_team');
    if (!teamId && eventId) {
      const found = await findExistingTeam(eventId, user?.id);
      if (found) {
        teamId = found.id;
        sessionStorage.setItem('fz_team', found.id);
        sessionStorage.setItem('fz_team_name', found.team_name);
      }
    }
    if (teamId && eventId) {
      const { data: g } = await db.from('games').select('id').eq('slug', slug).maybeSingle();
      if (g) {
        await db.from('game_attempts').insert({
          event_id: eventId,
          game_id: g.id,
          team_id: teamId,
          score: finalScore,
          duration: Math.round((Date.now() - start) / 1000),
          status: 'completed',
          completed_at: new Date().toISOString()
        });
      }
      await saveTeamProgress(teamId, finalScore, slug, finalScore);
    }
  }

  function flip(i: number) {
    if (flips.length === 2 || flips.includes(i) || matched.includes(i)) return;
    const next = [...flips, i];
    setFlips(next);
    if (next.length === 2) {
      if (memoryDeck[next[0]].v === memoryDeck[next[1]].v) {
        const m = [...matched, ...next];
        const nextScore = score + 50;
        setMatched(m);
        setScore(nextScore);
        setFlips([]);
        if (m.length === memoryDeck.length) setTimeout(() => finish(nextScore), 300);
      } else setTimeout(() => setFlips([]), 750);
    }
  }

  const backCode = sessionStorage.getItem('fz_event_code') || '';
  const backTarget = backCode ? `/games/${backCode}` : '/';

  return (
    <Layout>
      <div className="play-top">
        <Link to={backTarget} className="back">← العودة للألعاب</Link>
        <span className="pill">{game.icon} {game.name}</span>
      </div>
      {done ? (
        <div className="narrow panel result">
          <Confetti burstKey="done" />
          <div className="trophy">🏆</div>
          <span className="eyebrow">أحسنتم يا فريق {sessionStorage.getItem('fz_team_name')}!</span>
          <h1>انتهى التحدّي</h1>
          <div className="score-big">{score}<small> نقطة</small></div>
          <p>تم حفظ نتيجتكم وتقدمكم في قاعدة البيانات.</p>
          <button className="btn primary" onClick={() => nav(backTarget)}>العودة للألعاب</button>
        </div>
      ) : slug === 'memory' ? (
        <div className="memory-wrap">
          <div className="page-heading">
            <h1>اختبروا ذاكرتكم!</h1>
            <p>طابقوا كل صورتين متشابهتين. كل تطابق = 50 نقطة.</p>
            <b className="score-chip">النقاط: {score}</b>
          </div>
          <div className="memory-grid">
            {memoryDeck.map((c, i) => (
              <button className={'memory-tile ' + (flips.includes(i) || matched.includes(i) ? 'revealed' : '') + (matched.includes(i) ? ' matched' : '')} onClick={() => flip(i)} key={i}>
                <span className="tile-flip">
                  <span className="tile-face tile-front">?</span>
                  <span className="tile-face tile-back">{c.v}</span>
                </span>
              </button>
            ))}
          </div>
          {matched.length === memoryDeck.length && <button className="btn primary" onClick={() => finish(score)}>إنهاء اللعبة</button>}
        </div>
      ) : (
        <div className="narrow panel quiz-panel">
          <div className="quiz-meta">
            <span>{game.icon} {game.name}</span>
            <span>السؤال {index + 1} / {questions.length}</span>
          </div>
          <div className="progress"><span style={{ width: ((index + 1) / questions.length * 100) + '%' }} /></div>
          <h2>{questions[index].q}</h2>
          <div className="answers">
            {questions[index].a.map((a, i) => (
              <button key={a} className={'answer ' + (answer === i ? 'selected' : '')} onClick={() => setAnswer(i)}>
                <span>{['أ', 'ب', 'ج', 'د'][i]}</span>{a}
              </button>
            ))}
          </div>
          <button className="btn primary full" disabled={answer === null} onClick={next}>
            {index === questions.length - 1 ? 'إنهاء وعرض النتيجة' : 'السؤال التالي'} <ArrowLeft size={17} />
          </button>
        </div>
      )}
    </Layout>
  );
}

function Leaderboard() {
  const { code = '' } = useParams();
  const [rows, setRows] = useState<any[]>([]);
  const [event, setEvent] = useState<EventRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let channel: any;
    async function load() {
      if (!db) { setLoading(false); return; }
      const { data: ev } = await db.from('events').select('*').eq('join_code', code.toUpperCase()).maybeSingle();
      setEvent(ev);
      if (ev) {
        const { data } = await db.from('leaderboard').select('*').eq('event_id', ev.id).order('total_score', { ascending: false });
        setRows(data || []);
      }
      setLoading(false);
    }
    load();
    if (db) {
      channel = db.channel('scores-' + code).on('postgres_changes', { event: '*', schema: 'public', table: 'game_attempts' }, load).subscribe();
    }
    return () => { if (db && channel) db.removeChannel(channel); };
  }, [code]);

  const maxScore = Math.max(1, ...rows.map(r => Number(r.total_score) || 0));

  return (
    <Layout>
      <div className="page-heading">
        <span className="eyebrow"><Trophy size={15} /> لوحة الأبطال</span>
        <h1>{event?.title || 'ترتيب الفرق'}</h1>
        <p>النتائج والترتيب العام للفرق المشاركة</p>
      </div>
      <div className="panel leaderboard">
        {loading ? 'جارٍ تحميل النتائج...' : rows.length === 0 ? (
          <div className="empty">
            🏅<h3>لا توجد نتائج حتى الآن</h3>
            <p>كونوا أول فريق يبدأ التحدّي!</p>
          </div>
        ) : (
          rows.map((r, i) => (
            <div className={'rank-row' + (i === 0 ? ' is-first' : '')} key={r.team_id}>
              <span className={'rank ' + (i < 3 ? 'top-rank rank-' + (i + 1) : '')}>
                {i === 0 ? <Crown size={17} /> : i < 3 ? <Medal size={17} /> : i + 1}
              </span>
              <div className="rank-main">
                <b>{r.team_name}</b>
                <div className="rank-bar"><i style={{ width: Math.max(4, Math.round((Number(r.total_score) || 0) / maxScore * 100)) + '%' }} /></div>
              </div>
              <span className="rank-score">{r.total_score} نقطة</span>
            </div>
          ))
        )}
      </div>
      <div className="center">
        <button className="btn ghost" onClick={() => location.reload()}><RefreshCw size={16} /> تحديث النتائج</button>
      </div>
    </Layout>
  );
}

function Admin() {
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [events, setEvents] = useState<EventRow[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState<EventRow | null>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [scores, setScores] = useState<any[]>([]);

  useEffect(() => {
    if (db) {
      db.auth.getSession().then(({ data }) => setSession(data.session));
      const { data } = db.auth.onAuthStateChange((_e, s) => setSession(s));
      return () => data.subscription.unsubscribe();
    }
  }, []);

  async function load() {
    if (!db) return;
    const { data } = await db.from('events').select('*').order('created_at', { ascending: false });
    setEvents(data || []);
  }

  useEffect(() => { if (session) load(); }, [session]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    if (!db) return;
    const { data, error } = await db.auth.signInWithPassword({ email, password });
    if (error) setMessage(error.message);
    else setSession(data.session);
  }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!db) return;
    setBusy(true);
    const code = 'FUN' + Math.random().toString(36).slice(2, 7).toUpperCase();
    const { error } = await db.from('events').insert({ title, description, join_code: code, status: 'active' });
    setBusy(false);
    if (error) setMessage(error.message);
    else {
      setTitle('');
      setDescription('');
      setMessage('تم إنشاء الفعالية بنجاح');
      load();
    }
  }

  async function inspect(ev: EventRow) {
    setSelected(ev);
    if (!db) return;
    const { data: t } = await db.from('teams').select('id,team_name,created_at').eq('event_id', ev.id).order('created_at', { ascending: false });
    const { data: s } = await db.from('leaderboard').select('*').eq('event_id', ev.id).order('total_score', { ascending: false });
    setTeams(t || []);
    setScores(s || []);
  }

  if (!db) {
    return (
      <Layout>
        <div className="narrow panel">
          <h1>إعداد لوحة الإدارة</h1>
          <p>لم يتم ربط Supabase بعد. افتحي ملف README واتّبعي خطوات الإعداد، ثم أضيفي بيانات الاتصال إلى ملف <code>.env</code>.</p>
        </div>
      </Layout>
    );
  }

  const joinUrl = selected ? `${shareBase}/join/${selected.join_code}` : '';
  const leaderboardUrl = selected ? `${shareBase}/leaderboard/${selected.join_code}` : '';

  return (
    <Layout>
      <div className="admin-head">
        <div>
          <span className="eyebrow">مساحة المنظّم</span>
          <h1>لوحة الإدارة</h1>
        </div>
        {session && <button className="btn ghost" onClick={() => db.auth.signOut()}><LogOut size={16} /> تسجيل الخروج</button>}
      </div>
      {!session ? (
        <form className="narrow panel stack" onSubmit={login}>
          <h2>تسجيل دخول المنظّم</h2>
          <label>البريد الإلكتروني</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          <label>كلمة المرور</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          <button className="btn primary">دخول لوحة الإدارة</button>
          <small className="muted">أنشئي المستخدم من Supabase Authentication، ثم أضيفي رقمه إلى جدول admins حسب README.</small>
          {message && <p className="error">{message}</p>}
        </form>
      ) : (
        <>
          <div className="admin-grid">
            <form className="panel stack" onSubmit={create}>
              <h2><Plus size={19} /> إنشاء فعالية جديدة</h2>
              <label>اسم الفعالية</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="مثلاً: يوم المرح" required />
              <label>وصف مختصر</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="أهلاً بكم في تحدياتنا!" />
              <button className="btn primary" disabled={busy}>{busy ? 'جارٍ الإنشاء...' : 'إنشاء الفعالية'}</button>
              {message && <small className="muted">{message}</small>}
            </form>
            <div className="panel">
              <h2><Gamepad2 size={19} /> فعالياتي</h2>
              {events.length === 0 ? (
                <p className="muted">لم تنشئي فعاليات بعد.</p>
              ) : (
                events.map(ev => (
                  <button className="event-item" key={ev.id} onClick={() => inspect(ev)}>
                    <span><b>{ev.title}</b><small>رمز الدخول: {ev.join_code}</small></span>
                    <ArrowLeft size={17} />
                  </button>
                ))
              )}
            </div>
          </div>
          {selected && (
            <section className="panel event-detail">
              <div className="admin-head">
                <div>
                  <h2>{selected.title}</h2>
                  <p className="muted">رمز الفعالية: <b>{selected.join_code}</b></p>
                </div>
                <button className="btn ghost" onClick={() => setSelected(null)}>إغلاق</button>
              </div>
              <div className="qr-area">
                <QRCodeSVG value={joinUrl} size={150} />
                <div>
                  <b>امسح الرمز للانضمام</b>
                  <p className="muted">{joinUrl}</p>
                  <a className="btn ghost" href={leaderboardUrl} target="_blank" rel="noreferrer">فتح لوحة النتائج</a>
                </div>
              </div>
              <h3>الفرق المسجّلة ({teams.length})</h3>
              {teams.map(t => <div className="simple-row" key={t.id}>{t.team_name}</div>)}
              <h3>الترتيب</h3>
              {scores.map((s, i) => <div className="simple-row" key={s.team_id}>{i + 1}. {s.team_name} <b>{s.total_score} نقطة</b></div>)}
            </section>
          )}
        </>
      )}
    </Layout>
  );
}

// يختار بين الألعاب التفاعلية الجديدة (من السجلّ) واللعبة الأصلية Play
function PlayEntry() {
  const { slug = '' } = useParams();
  const def = findGameDef(slug);
  if (!def) return <Play />;
  return <Layout><GameFrame key={slug} def={def} save={saveGameAttempt} /></Layout>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/join/:code" element={<Join />} />
      <Route path="/games/:code" element={<GameList />} />
      <Route path="/play/:slug" element={<PlayEntry />} />
      <Route path="/leaderboard/:code" element={<Leaderboard />} />
      <Route path="/admin/*" element={<Admin />} />
      <Route path="*" element={<Home />} />
    </Routes>
  );
}