import React from 'react';
import { Check, X } from 'lucide-react';

const KEYS = ['أ', 'ب', 'ج', 'د', 'هـ', 'و'];

interface Props {
  options: string[];
  /** الخيار الذي اختاره الفريق (أو -1 عند انتهاء الوقت) */
  picked: number | null;
  /** رقم الإجابة الصحيحة؛ null = لم تُكشف بعد */
  correct: number | null;
  locked?: boolean;
  onPick: (i: number) => void;
}

/** أزرار اختيار من متعدد مع كشف الصح (أخضر) والخطأ (أحمر) */
export default function AnswerOptions({ options, picked, correct, locked, onPick }: Props) {
  const revealed = correct !== null;
  return (
    <div className="gk-options" role="group" aria-label="الإجابات">
      {options.map((o, i) => {
        let state = '';
        if (revealed) state = i === correct ? 'is-right' : i === picked ? 'is-wrong' : 'is-dim';
        else if (picked === i) state = 'is-picked';
        return (
          <button key={i} type="button" className={'gk-opt ' + state} disabled={locked || revealed} onClick={() => onPick(i)}>
            <span className="gk-opt-key">{KEYS[i]}</span>
            <span className="gk-opt-text">{o}</span>
            {state === 'is-right' && <Check className="gk-opt-mark" size={20} aria-label="إجابة صحيحة" />}
            {state === 'is-wrong' && <X className="gk-opt-mark" size={20} aria-label="إجابة خاطئة" />}
          </button>
        );
      })}
    </div>
  );
}
