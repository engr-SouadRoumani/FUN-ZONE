import type { GameDef } from './kit/types';
import { wheelGame } from './wheel';
import { dragDropGame } from './dragdrop';

/**
 * سجلّ الألعاب التفاعلية الجديدة.
 * لإضافة لعبة: أنشئوا GameDef (انظر wheel/index.ts) ثم أضيفوه إلى هذه المصفوفة،
 * وأضيفوا صفاً لها في جدول games (انظر supabase-add-wheel-dragdrop.sql كمثال).
 * ستظهر تلقائياً في قائمة الألعاب وتعمل على المسار /play/:slug.
 */
export const GAME_DEFS: GameDef[] = [wheelGame, dragDropGame];

export const findGameDef = (slug: string) => GAME_DEFS.find(g => g.slug === slug);
