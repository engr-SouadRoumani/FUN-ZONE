import React, { useMemo } from 'react';

const COLORS = ['#10B981', '#F59E0B', '#26364A', '#EBF3FA', '#FFFFFF'];

/** انفجار قصاصات احتفالي بـ CSS فقط (يختفي عند تفعيل تقليل الحركة) */
export default function Confetti({ count = 34, burstKey = 0 }: { count?: number; burstKey?: number | string }) {
  const bits = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: Math.round((Math.random() - 0.5) * 360),
        y: -Math.round(120 + Math.random() * 220),
        r: Math.round(Math.random() * 720 - 360),
        d: Math.round(Math.random() * 280),
        c: COLORS[i % COLORS.length],
        w: 6 + Math.round(Math.random() * 6),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [count, burstKey],
  );
  return (
    <div className="gk-confetti" aria-hidden="true">
      {bits.map((b, i) => (
        <span
          key={i}
          style={{
            ['--x' as any]: b.x + 'px',
            ['--y' as any]: b.y + 'px',
            ['--r' as any]: b.r + 'deg',
            animationDelay: b.d + 'ms',
            background: b.c,
            width: b.w,
            height: b.w * 1.6,
          }}
        />
      ))}
    </div>
  );
}
