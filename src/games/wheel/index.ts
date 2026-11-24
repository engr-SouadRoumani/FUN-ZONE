import type { GameDef } from '../kit/types';
import WheelGame from './WheelGame';

export const wheelGame: GameDef = {
  slug: 'wheel',
  name: 'عجلة الحظ',
  icon: '🎡',
  description: 'أدِر العجلة وواجه سؤالاً أو تحدياً عشوائياً',
  howTo: [
    'اضغطوا على العجلة لتدور، وستتوقف على سؤال أو تحدٍّ عشوائي',
    'أجيبوا قبل انتهاء الوقت: السرعة والإجابات المتتالية تمنحكم نقاطاً إضافية',
    'شريحة ⚡ تقصّر الوقت وتزيد النقاط، وشريحة 🌟 الذهبية تضاعف الجائزة',
  ],
  rounds: 10,
  Board: WheelGame,
};
