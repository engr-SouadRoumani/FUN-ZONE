/**
 * رياضيات العجلة (دوال نقية قابلة للاختبار).
 * الشريحة i تشغل الزوايا [i×seg, (i+1)×seg) مقيسة باتجاه عقارب الساعة من أعلى العجلة.
 * المؤشر ثابت في الأعلى.
 */
export const normalize = (deg: number) => ((deg % 360) + 360) % 360;

/** الدوران التراكمي الجديد بحيث يستقر مركز الشريحة index تحت المؤشر */
export function targetRotation(current: number, index: number, n: number, extraTurns: number, jitterFrac = 0): number {
  const seg = 360 / n;
  const center = index * seg + seg / 2 + jitterFrac * seg * 0.35; // jitterFrac بين -1 و1
  const desired = normalize(360 - center);
  const delta = normalize(desired - normalize(current));
  return current + extraTurns * 360 + delta;
}

/** أي شريحة تقع تحت المؤشر عند هذا الدوران؟ */
export function indexAtPointer(rotation: number, n: number): number {
  const seg = 360 / n;
  return Math.floor(normalize(-rotation) / seg) % n;
}

const rad = (deg: number) => (deg * Math.PI) / 180;

/** مسار SVG لقطاع دائري (من أعلى العجلة باتجاه عقارب الساعة) */
export function slicePath(i: number, n: number, cx: number, cy: number, r: number): string {
  const seg = 360 / n;
  const a0 = rad(i * seg);
  const a1 = rad((i + 1) * seg);
  const p = (a: number) => `${(cx + r * Math.sin(a)).toFixed(3)} ${(cy - r * Math.cos(a)).toFixed(3)}`;
  const large = seg > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${p(a0)} A ${r} ${r} 0 ${large} 1 ${p(a1)} Z`;
}
