import React from 'react';
import { CheckCircle2Icon, XCircleIcon } from './icons';
import type { AwardResult } from './types';

interface Props {
  award: AwardResult;
  /** عنوان عند الصح/الخطأ/الإجابة الجزئية */
  title: string;
  /** سطر الشرح أو الإجابة الصحيحة */
  detail?: string;
  /** يظهر عند انتهاء الوقت */
  timedOut?: boolean;
}

/** بطاقة نتيجة الجولة: أخضر للصح، ذهبي للجزئي، أحمر للخطأ، مع تفصيل النقاط */
export default function FeedbackCard({ award, title, detail, timedOut }: Props) {
  const tone = award.correct ? 'ok' : award.fraction > 0 ? 'part' : 'bad';
  return (
    <div className={`gk-feedback is-${tone}`} role="status" aria-live="polite">
      <span className="gk-feedback-icon">{tone === 'bad' ? <XCircleIcon /> : <CheckCircle2Icon />}</span>
      <div className="gk-feedback-body">
        <b>{timedOut ? 'انتهى الوقت!' : title}</b>
        {detail && <p>{detail}</p>}
        {award.points > 0 && (award.speed > 0 || award.streak > 0) && (
          <small>
            {award.speed > 0 && <span>⏱️ سرعة +{award.speed}</span>}
            {award.streak > 0 && <span>🔥 سلسلة +{award.streak}</span>}
          </small>
        )}
      </div>
      <span className="gk-points" key={award.points + '-' + tone}>+{award.points}</span>
    </div>
  );
}
