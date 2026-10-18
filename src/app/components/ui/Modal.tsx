'use client';
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

let origen: { x: number; y: number } | null = null;
if (typeof window !== 'undefined' && !(window as any).__malpoOrigen) {
  (window as any).__malpoOrigen = true;
  document.addEventListener('pointerdown', e => { origen = { x: e.clientX, y: e.clientY }; }, true);
}
const reducido = () => typeof window !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const esHoja = () => typeof window !== 'undefined' && matchMedia('(max-width:640px)').matches;
const SPRING = 'cubic-bezier(.16,1,.3,1)';

/**
 * Ventana modal que se abre desde el punto donde se tocó (o sube como hoja en celular).
 * Cambia `paso` para animar el cambio de contenido dentro de la misma ventana.
 */
export function Modal({ open, onClose, children, wide = false, label, paso }: {
  open: boolean; onClose: () => void; children: ReactNode; wide?: boolean; label?: string; paso?: string | number;
}) {
  const [montado, setMontado] = useState(open);
  const ov = useRef<HTMLDivElement>(null), md = useRef<HTMLDivElement>(null), mc = useRef<HTMLDivElement>(null);
  const delta = useRef<{ dx: number; dy: number } | null>(null), alto = useRef(0), cerrando = useRef(false);

  useEffect(() => {
    if (open) { cerrando.current = false; setMontado(true); return; }
    if (!montado || cerrando.current) return;
    cerrando.current = true;
    const m = md.current, o = ov.current;
    if (!m || !o || reducido()) { setMontado(false); return; }
    const d = delta.current;
    const a = esHoja()
      ? m.animate([{ transform: m.style.transform || 'none' }, { transform: 'translateY(105%)' }], { duration: 300, easing: 'cubic-bezier(.4,0,1,1)', fill: 'forwards' })
      : m.animate([{ transform: 'none', opacity: 1, filter: 'blur(0)' }, { transform: d ? `translate(${d.dx * 0.6}px,${d.dy * 0.6}px) scale(.4)` : 'scale(.94)', opacity: 0, filter: 'blur(6px)' }], { duration: 260, easing: 'cubic-bezier(.4,0,1,1)', fill: 'forwards' });
    o.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 280, fill: 'forwards' });
    a.onfinish = () => setMontado(false);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useLayoutEffect(() => {
    if (!montado || !open) return;
    const m = md.current!, o = ov.current!;
    alto.current = m.offsetHeight;
    document.body.style.overflow = 'hidden';
    const foco = m.querySelector<HTMLElement>('[autofocus],input:not([type=file]):not([type=checkbox]):not([type=hidden]),select,textarea,button.primary');
    setTimeout(() => foco?.focus({ preventScroll: true }), reducido() ? 0 : 280);
    if (reducido()) return;
    o.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, easing: 'ease-out' });
    if (esHoja()) m.animate([{ transform: 'translateY(100%)' }, { transform: 'none' }], { duration: 520, easing: SPRING });
    else {
      const r = m.getBoundingClientRect(), p = origen ?? { x: innerWidth / 2, y: innerHeight / 2 };
      const dx = p.x - (r.left + r.width / 2), dy = p.y - (r.top + r.height / 2);
      delta.current = { dx, dy };
      m.animate([{ transform: `translate(${dx}px,${dy}px) scale(.2)`, opacity: 0, filter: 'blur(8px)' }, { opacity: 1, offset: 0.45 }, { transform: 'none', opacity: 1, filter: 'blur(0)' }], { duration: 560, easing: SPRING });
    }
    entrarHijos(mc.current!, esHoja() ? 160 : 200);
    return () => { document.body.style.overflow = ''; };
  }, [montado]); // eslint-disable-line react-hooks/exhaustive-deps

  useLayoutEffect(() => {
    const m = md.current;
    if (!m || paso === undefined) return;
    const h1 = m.offsetHeight, h0 = alto.current;
    alto.current = h1;
    if (reducido() || !h0 || h0 === h1) { entrarHijos(mc.current!, 40); return; }
    m.animate([{ height: h0 + 'px' }, { height: h1 + 'px' }], { duration: 420, easing: SPRING });
    entrarHijos(mc.current!, 60);
  }, [paso]);

  useEffect(() => {
    if (!montado) return;
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    addEventListener('keydown', k);
    return () => removeEventListener('keydown', k);
  }, [montado, onClose]);

  // Arrastrar la hoja hacia abajo para cerrarla en celular.
  const y0 = useRef<number | null>(null), dy = useRef(0);
  const arrastre = {
    onPointerDown: (e: React.PointerEvent) => { if (!esHoja()) return; y0.current = e.clientY; dy.current = 0; (e.target as HTMLElement).setPointerCapture(e.pointerId); md.current!.style.transition = 'none'; },
    onPointerMove: (e: React.PointerEvent) => { if (y0.current === null) return; dy.current = Math.max(0, e.clientY - y0.current); md.current!.style.transform = `translateY(${dy.current}px)`; },
    onPointerUp: () => { if (y0.current === null) return; y0.current = null; if (dy.current > 110) onClose(); else { md.current!.style.transition = 'transform .35s ' + SPRING; md.current!.style.transform = 'none'; } },
  };

  if (!montado) return null;
  return createPortal(
    <div className="overlay" ref={ov} onMouseDown={e => { if (e.target === ov.current) onClose(); }}>
      <div className={'modal' + (wide ? ' wide' : '')} ref={md} role="dialog" aria-modal="true" aria-label={label}>
        <div className="grab" aria-hidden="true" {...arrastre} />
        <div className="mc" ref={mc}>{children}</div>
      </div>
    </div>,
    document.body,
  );
}

function entrarHijos(el: HTMLElement, retraso: number) {
  if (!el || reducido()) return;
  Array.from(el.children).forEach((c, i) => (c as HTMLElement).animate(
    [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }],
    { duration: 380, delay: retraso + i * 45, easing: SPRING, fill: 'backwards' },
  ));
}
