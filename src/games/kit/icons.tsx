import React from 'react';
import { Check, X } from 'lucide-react';

/** أيقونات دائرية صغيرة للصح والخطأ (بدون الاعتماد على أسماء أيقونات قد تتغير) */
export const CheckCircle2Icon = () => (
  <span className="gk-ico gk-ico-ok"><Check size={18} strokeWidth={3} /></span>
);
export const XCircleIcon = () => (
  <span className="gk-ico gk-ico-bad"><X size={18} strokeWidth={3} /></span>
);
