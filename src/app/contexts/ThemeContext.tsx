'use client';
/** Tema claro / oscuro / sistema con transición circular (View Transitions). Se guarda en localStorage 'tema'. */
import { useEffect, useState } from 'react';
import { Icono } from '../components/ui/Icono';

export type Pref = 'light' | 'dark' | 'system';

function esOscuro() {
  const a = document.documentElement.getAttribute('data-theme');
  return a ? a === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
}

/** Script que se ejecuta antes de pintar para evitar parpadeo del tema */
export const SCRIPT_TEMA = `try{var t=localStorage.getItem('tema');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t)}catch(e){}`;

export function leerTema(): Pref {
  try { const t = localStorage.getItem('tema'); return t === 'light' || t === 'dark' ? t : 'system'; } catch { return 'system'; }
}

export function aplicarTema(p: Pref, ev?: { clientX: number; clientY: number }) {
  const run = () => {
    const r = document.documentElement;
    if (p === 'system') r.removeAttribute('data-theme'); else r.setAttribute('data-theme', p);
    try { localStorage.setItem('tema', p); } catch { /* sin almacenamiento */ }
    r.classList.toggle('dark', esOscuro());
    document.getElementById('top')?.classList.toggle('is-dark', esOscuro());
    window.dispatchEvent(new Event('malpo-tema'));
  };
  const d = document as any;
  if (!d.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) return run();
  const x = ev?.clientX ?? innerWidth - 60, y = ev?.clientY ?? 30;
  const rad = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  const vt = d.startViewTransition(run);
  vt.ready.then(() => document.documentElement.animate(
    { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${rad}px at ${x}px ${y}px)`] },
    { duration: 650, easing: 'cubic-bezier(.16,1,.3,1)', pseudoElement: '::view-transition-new(root)' } as any,
  )).catch(() => {});
}

/** Mantiene la clase "dark" (NextUI/Tailwind) alineada con el tema del portal */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const sync = () => {
      document.documentElement.classList.toggle('dark', esOscuro());
      document.getElementById('top')?.classList.toggle('is-dark', esOscuro());
    };
    sync();
    const mq = matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', sync);
    addEventListener('malpo-tema', sync);
    return () => { mq.removeEventListener('change', sync); removeEventListener('malpo-tema', sync); };
  }, []);
  return <>{children}</>;
}

export function BotonTema() {
  return (
    <button className="iconbtn" id="theme-btn" aria-label="Cambiar entre modo claro y oscuro" onClick={e => aplicarTema(esOscuro() ? 'light' : 'dark', e)}>
      <span className="theme-ico"><span className="sun"><Icono n="sun" /></span><span className="moon"><Icono n="moon" /></span></span>
    </button>
  );
}

export function TemaSelector() {
  const [p, setP] = useState<Pref>('system');
  useEffect(() => {
    setP(leerTema());
    const f = () => setP(leerTema());
    addEventListener('malpo-tema', f);
    return () => removeEventListener('malpo-tema', f);
  }, []);
  return (
    <div className="segl" role="group" aria-label="Tema">
      {([['light', 'Claro', 'sun'], ['dark', 'Oscuro', 'moon'], ['system', 'Sistema', 'device']] as const).map(([v, l, i]) => (
        <button key={v} type="button" aria-pressed={p === v} onClick={e => { setP(v); aplicarTema(v, e); }}><Icono n={i} s={16} /> {l}</button>
      ))}
    </div>
  );
}
