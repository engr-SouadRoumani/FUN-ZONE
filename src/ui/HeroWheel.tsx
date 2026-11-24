import React, { useState } from 'react';
import Wheel from '../games/wheel/Wheel';
import { WHEEL_SLICES } from '../games/wheel/data';

/** عجلة الصفحة الرئيسية: تجربة صغيرة تعرّف الزائر بلعبة عجلة الحظ */
export default function HeroWheel() {
  const [last, setLast] = useState<number | null>(null);
  return (
    <div className="hero-wheel">
      <Wheel slices={WHEEL_SLICES} compact hubLabel="جرّب" onResult={setLast} />
      <p className="hero-wheel-note" aria-live="polite" key={last ?? 'idle'}>
        {last === null ? 'اضغط العجلة وجرّب حظك' : `${WHEEL_SLICES[last].icon} ${WHEEL_SLICES[last].label}`}
      </p>
    </div>
  );
}
