import React, { useEffect, useRef, useState } from 'react';
import { indexAtPointer, slicePath, targetRotation } from './wheelMath';
import { prefersReducedMotion } from '../kit/feedback';

export interface WheelSliceView {
  id: string;
  icon: string;
  fill: string;
}

interface Props {
  slices: WheelSliceView[];
  /** تُستدعى عند توقف العجلة على شريحة */
  onResult: (index: number) => void;
  disabled?: boolean;
  /** حجم أصغر (للصفحة الرئيسية) */
  compact?: boolean;
  /** نص مركز العجلة */
  hubLabel?: string;
  /** يُفضَّل تمرير الشريحة المطلوبة (للاختبار)؛ وإلا تُختار عشوائياً */
  pickIndex?: () => number;
}

const SPIN_SECONDS = 4.6;

/** عجلة حظ تفاعلية: اضغطوا عليها لتدور وتتوقف على شريحة عشوائية */
export default function Wheel({ slices, onResult, disabled, compact, hubLabel = 'دوّر', pickIndex }: Props) {
  const n = slices.length;
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [duration, setDuration] = useState(SPIN_SECONDS);
  const [spunOnce, setSpunOnce] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const rotRef = useRef(0);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function spin() {
    if (spinning || disabled) return;
    const idx = pickIndex ? pickIndex() : Math.floor(Math.random() * n);
    const reduce = prefersReducedMotion();
    const secs = reduce ? 0.5 : SPIN_SECONDS;
    const next = targetRotation(rotRef.current, idx, n, reduce ? 1 : 5 + Math.floor(Math.random() * 2), Math.random() * 2 - 1);
    rotRef.current = next;
    setDuration(secs);
    setSpinning(true);
    setSpunOnce(true);
    setRotation(next);
    timer.current = window.setTimeout(() => {
      setSpinning(false);
      onResult(indexAtPointer(next, n));
    }, secs * 1000 + 80);
  }

  const R = 96;
  const C = 100;

  return (
    <div className={'gk-wheel-wrap' + (compact ? ' is-compact' : '')}>
      <button
        type="button"
        className={'gk-wheel' + (spinning ? ' is-spinning' : '') + (!spunOnce ? ' is-idle' : '')}
        onClick={spin}
        disabled={disabled}
        aria-label="أدِر عجلة الحظ"
      >
        <span className="gk-wheel-pin" aria-hidden="true" />
        <span className="gk-wheel-ring" aria-hidden="true">
          <span className="gk-wheel-disc" style={{ transform: `rotate(${rotation}deg)`, transitionDuration: `${duration}s` }}>
            <svg viewBox="0 0 200 200" focusable="false">
              {slices.map((s, i) => (
                <path key={s.id} d={slicePath(i, n, C, C, R)} fill={s.fill} stroke="#FFFFFF" strokeWidth="2.5" />
              ))}
              {slices.map((s, i) => {
                const mid = (i + 0.5) * (360 / n);
                return (
                  <g key={s.id + '-i'} transform={`rotate(${mid} ${C} ${C})`}>
                    <text x={C} y={C - R * 0.66} textAnchor="middle" dominantBaseline="central" fontSize={compact ? 24 : 22}>
                      {s.icon}
                    </text>
                  </g>
                );
              })}
            </svg>
          </span>
        </span>
        <span className="gk-hub" aria-hidden="true">{hubLabel}</span>
      </button>
    </div>
  );
}
