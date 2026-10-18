'use client';
import type { ReactNode } from 'react';
import type { Dia } from '@/api/api_portal/tipos';
import { fmtFecha, fmtMin } from '@/libs/tiempo';
import { Icono } from './Icono';

export function Cabecera({ titulo, sub, seccion, children }: { titulo: string; sub?: ReactNode; seccion?: string; children?: ReactNode }) {
  return (
    <div className="head">
      <div>{seccion && <div className="crumb">{seccion}<span>/</span>{titulo}</div>}<h1>{titulo}</h1>{sub && <p className="muted">{sub}</p>}</div>
      {children}
    </div>
  );
}

export const Chip = ({ c, children }: { c: string; children: ReactNode }) => <span className={`chip c-${c}`}>{children}</span>;

export function Vacio({ icono = 'check', children }: { icono?: string; children: ReactNode }) {
  return <div className="empty"><Icono n={icono} s={28} /><p>{children}</p></div>;
}

export function Check() {
  return <div className="check"><svg viewBox="0 0 80 80" fill="none" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><circle cx="40" cy="40" r="36" /><path d="M25 41l10 10 20-22" /></svg></div>;
}

/** Gráfico de barras de horas trabajadas por día (SVG). */
export function GraficoHoras({ dias }: { dias: Dia[] }) {
  const d = dias.filter(x => x.tipo === 'trabajado' || x.tipo === 'inasistencia');
  if (!d.length) return null;
  const W = Math.max(440, d.length * 58), H = 210, pl = 34, pb = 26, pt = 12, max = 12 * 60, bw = 28, step = (W - pl - 30) / d.length;
  const y = (v: number) => pt + (H - pt - pb) * (1 - Math.min(v, max) / max);
  return (
    <div className="panel">
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
        <h3>Horas trabajadas por día</h3>
        <div className="row hint">
          <span className="row" style={{ gap: 5 }}><svg width="10" height="10"><rect width="10" height="10" fill="var(--bar)" /></svg>Jornada</span>
          <span className="row" style={{ gap: 5 }}><svg width="10" height="10"><rect width="10" height="10" fill="var(--accent-fg)" /></svg>Sobre lo pactado</span>
          <span>- - - Pactado</span>
        </div>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label="Horas trabajadas por día">
          {[0, 4, 8, 12].map(t => <g key={t}><line x1={pl} x2={W - 6} y1={y(t * 60)} y2={y(t * 60)} stroke="var(--line)" /><text x={pl - 6} y={y(t * 60) + 3} textAnchor="end">{t}h</text></g>)}
          {d.map((x, i) => {
            const cx = pl + 18 + i * step;
            if (x.tipo === 'inasistencia') return <g key={x.fecha}><text x={cx + bw / 2} y={y(0) - 6} textAnchor="middle" style={{ fill: 'var(--bad)' }}>ausente</text><text x={cx + bw / 2} y={H - 8} textAnchor="middle">{+x.fecha.slice(8)}</text></g>;
            const base = Math.min(x.trab, x.pact || x.trab), ex = Math.max(0, x.trab - (x.pact || x.trab));
            return (
              <g key={x.fecha}>
                <g className="bar-g" style={{ ['--i' as any]: i }}>
                  <rect x={cx} y={y(base)} width={bw} height={y(0) - y(base)} fill="var(--bar)" rx="2" />
                  {ex > 0 && <rect x={cx} y={y(base + ex)} width={bw} height={y(base) - y(base + ex)} fill="var(--accent-fg)" rx="2" />}
                  <title>{`${fmtFecha(x.fecha)}: ${fmtMin(x.trab)} h`}</title>
                </g>
                {x.pact > 0 && <line x1={cx - 4} x2={cx + bw + 4} y1={y(x.pact)} y2={y(x.pact)} stroke="var(--ink)" strokeDasharray="3 2" />}
                <text x={cx + bw / 2} y={H - 8} textAnchor="middle">{+x.fecha.slice(8)}</text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

/** Esqueleto de carga (mismo diseño que el loading del portal) */
export function Cargando() {
  return (
    <div className="sk-wrap" aria-busy="true" aria-label="Cargando">
      <div className="sk" style={{ width: 120, height: 12 }} />
      <div className="sk" style={{ width: 'min(340px,70%)', height: 30, marginTop: 10 }} />
      <div className="sk" style={{ width: 'min(240px,50%)', height: 14, marginTop: 10 }} />
      <div className="grid g4" style={{ marginTop: 26 }}>{[0, 1, 2, 3].map(i => <div key={i} className="sk" style={{ height: 88 }} />)}</div>
      <div className="panel" style={{ marginTop: 18 }}>
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} className="sk-row"><div className="sk sk-c" /><div style={{ flex: 1, display: 'grid', gap: 8 }}><div className="sk" style={{ height: 12, width: `${70 - i * 7}%` }} /><div className="sk" style={{ height: 10, width: `${40 - i * 3}%` }} /></div></div>
        ))}
      </div>
    </div>
  );
}

export function ErrorCarga({ error, reintentar }: { error: string; reintentar?: () => void }) {
  return (
    <div className="empty" role="alert"><Icono n="alert" s={28} /><p>{error}</p>
      {reintentar && <button className="btn sm" onClick={reintentar} style={{ marginTop: 10 }}>Reintentar</button>}
    </div>
  );
}

/** Sin permiso para la vista */
export function SinPermiso() {
  return <Vacio icono="lock">No tienes permiso para ver esta sección.</Vacio>;
}

/** Flechas de mes anterior / siguiente */
export function NavMes({ mes, onCambio, max }: { mes: string; onCambio: (m: string) => void; max?: string }) {
  const sumar = (n: number) => { const [y, m] = mes.split('-').map(Number); return new Date(Date.UTC(y, m - 1 + n, 1)).toISOString().slice(0, 7); };
  const tope = !!max && mes >= max;
  return <>
    <button className="btn sm" onClick={() => onCambio(sumar(-1))} aria-label="Mes anterior"><Icono n="chevl" s={16} /></button>
    <button className="btn sm" onClick={() => onCambio(sumar(1))} aria-label="Mes siguiente" disabled={tope} style={tope ? { opacity: .5 } : undefined}><Icono n="chev" s={16} /></button>
  </>;
}
