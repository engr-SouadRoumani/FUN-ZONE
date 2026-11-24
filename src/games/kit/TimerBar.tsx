import React from 'react';
import { Timer } from 'lucide-react';

/** شريط وقت متحرك؛ يتحول للون التنبيه في آخر 25% */
export default function TimerBar({ left, ratio }: { left: number; ratio: number }) {
  const urgent = ratio <= 0.25 && left > 0;
  return (
    <div className={'gk-timer' + (urgent ? ' is-urgent' : '')} role="timer" aria-label="الوقت المتبقي">
      <span className="gk-timer-icon"><Timer size={15} /></span>
      <div className="gk-timer-track"><i style={{ width: `${Math.max(0, Math.min(1, ratio)) * 100}%` }} /></div>
      <b className="gk-timer-num">{Math.ceil(left)}</b>
    </div>
  );
}
