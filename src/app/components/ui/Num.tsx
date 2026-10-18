'use client';
import { useEffect, useRef } from 'react';

const formatear = (x: number, f: string) => {
  if (f === 'hm') { const m = Math.max(0, Math.round(x)); return Math.floor(m / 60) + ':' + String(m % 60).padStart(2, '0'); }
  if (f === 'min') return Math.round(x) + ' min';
  if (f === 'dec') return (Math.round(x * 2) / 2).toLocaleString('es-CL');
  return Math.round(x).toLocaleString('es-CL');
};

/** Número que cuenta hacia arriba al aparecer. */
export function Num({ v, f = 'int' }: { v: number; f?: 'int' | 'hm' | 'min' | 'dec' }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const t0 = performance.now() + 150, dur = 900;
    const paso = (t: number) => {
      const p = Math.max(0, Math.min(1, (t - t0) / dur)), e = 1 - Math.pow(1 - p, 4);
      el.textContent = formatear(v * e, f);
      if (p < 1) raf = requestAnimationFrame(paso);
    };
    raf = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(raf);
  }, [v, f]);
  return <span ref={ref}>{formatear(v, f)}</span>;
}
