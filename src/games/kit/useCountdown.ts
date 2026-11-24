import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * عدّاد تنازلي يعتمد على الوقت الفعلي (لا يتأخر إذا تباطأ المتصفح).
 * resetKey: غيّروه لإعادة العدّاد من البداية (مثلاً رقم الجولة).
 */
export function useCountdown(seconds: number, running: boolean, onExpire: () => void, resetKey: string | number) {
  const [left, setLeft] = useState(seconds);
  const leftRef = useRef(seconds);
  const expireRef = useRef(onExpire);
  expireRef.current = onExpire;

  useEffect(() => {
    leftRef.current = seconds;
    setLeft(seconds);
  }, [seconds, resetKey]);

  useEffect(() => {
    if (!running) return;
    const from = leftRef.current;
    const t0 = performance.now();
    const id = window.setInterval(() => {
      const l = Math.max(0, from - (performance.now() - t0) / 1000);
      leftRef.current = l;
      setLeft(l);
      if (l <= 0) {
        window.clearInterval(id);
        expireRef.current();
      }
    }, 200);
    return () => window.clearInterval(id);
  }, [running, resetKey, seconds]);

  /** نسبة الوقت المتبقي لحظة الاستدعاء (للمكافأة) */
  const getRatio = useCallback(() => (seconds > 0 ? leftRef.current / seconds : 0), [seconds]);

  return { left, ratio: seconds > 0 ? left / seconds : 0, getRatio };
}
