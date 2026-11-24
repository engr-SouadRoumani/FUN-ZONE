/** اهتزاز خفيف على الهواتف عند الصح/الخطأ (يُتجاهل إن لم يكن مدعوماً) */
export function buzz(ok: boolean) {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(ok ? 18 : [28, 40, 28]);
    }
  } catch {
    /* لا شيء */
  }
}

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function shuffle<T>(arr: T[], rnd: () => number = Math.random): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * يعزل التعابير الحسابية (مثل 7 + 8 = 15) داخل النص العربي بعلامات LRI/PDI
 * حتى تظهر بترتيبها الحسابي المعتاد وبأقواس غير مقلوبة.
 */
export function isolateMath(text: string): string {
  return text.replace(/\(?\d[\d.,]*\)?(?:\s*[+×÷−=*/-]\s*\(?\d[\d.,]*\)?)+/g, m => `\u2066${m}\u2069`);
}
