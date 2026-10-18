'use client';
/** Paginación reutilizable para listas y tablas del portal. */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Icono } from './Icono';

export function usePaginado<T>(lista: T[] | null | undefined, porPaginaInicial = 10, reinicio?: unknown) {
  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState(porPaginaInicial);
  const datos = useMemo(() => lista || [], [lista]);
  useEffect(() => { setPagina(1); }, [reinicio, porPagina]);
  const total = Math.max(1, Math.ceil(datos.length / porPagina));
  const actual = Math.min(pagina, total);
  const desde = datos.length ? (actual - 1) * porPagina : 0;
  const items = datos.slice(desde, desde + porPagina);
  return { items, pagina: actual, total, setPagina, porPagina, setPorPagina, cantidad: datos.length, desde: datos.length ? desde + 1 : 0, hasta: desde + items.length };
}

type P = ReturnType<typeof usePaginado<unknown>>;

function numeros(actual: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const out: (number | '…')[] = [1];
  const a = Math.max(2, actual - 1), b = Math.min(total - 1, actual + 1);
  if (a > 2) out.push('…');
  for (let i = a; i <= b; i++) out.push(i);
  if (b < total - 1) out.push('…');
  out.push(total);
  return out;
}

export function Paginacion({ p, opciones = [10, 25, 50], etiqueta = 'registros' }: { p: Pick<P, 'pagina' | 'total' | 'setPagina' | 'porPagina' | 'setPorPagina' | 'cantidad' | 'desde' | 'hasta'>; opciones?: number[]; etiqueta?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  if (p.cantidad <= Math.min(...opciones)) return null;
  const ir = (n: number) => {
    p.setPagina(Math.max(1, Math.min(p.total, n)));
    const lista = ref.current?.previousElementSibling as HTMLElement | null;
    if (lista && lista.getBoundingClientRect().top < 70) lista.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  return (
    <div className="pager" ref={ref} role="navigation" aria-label="Paginación">
      <span className="pager-info">{p.desde}–{p.hasta} de {p.cantidad} {etiqueta}</span>
      <div className="pager-nav">
        <button type="button" onClick={() => ir(p.pagina - 1)} disabled={p.pagina === 1} aria-label="Página anterior"><Icono n="chevl" s={15} /></button>
        {numeros(p.pagina, p.total).map((n, i) => n === '…'
          ? <span key={'e' + i} className="pager-dots">…</span>
          : <button key={n} type="button" onClick={() => ir(n)} aria-current={n === p.pagina ? 'page' : undefined}>{n}</button>)}
        <button type="button" onClick={() => ir(p.pagina + 1)} disabled={p.pagina === p.total} aria-label="Página siguiente"><Icono n="chev" s={15} /></button>
      </div>
      <label className="pager-size">Mostrar
        <select value={p.porPagina} onChange={e => p.setPorPagina(Number(e.target.value))}>{opciones.map(o => <option key={o} value={o}>{o}</option>)}</select>
      </label>
    </div>
  );
}
