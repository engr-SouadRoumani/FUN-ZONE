import type { GameDef } from '../kit/types';
import DragDropGame from './DragDropGame';

export const dragDropGame: GameDef = {
  slug: 'dragdrop',
  name: 'اسحب وأفلت',
  icon: '🧲',
  description: 'رتّب العناصر وطابق المصطلحات مع تعريفاتها',
  howTo: [
    'اسحبوا البطاقات إلى أماكنها، أو اضغطوا البطاقة ثم المكان المناسب',
    'يمكنكم تبديل البطاقات قبل الضغط على «تحقّق»، لكن الوقت يمضي',
    'كل بطاقة في مكانها الصحيح تمنحكم نقاطاً، والجولة الكاملة تمنحكم مكافأة',
  ],
  rounds: 10,
  Board: DragDropGame,
};
