'use client';
import { useState } from 'react';
import { MARCA_LABEL, MARCA_ORDEN } from '@/libs/textos';
import { Modal } from './ui/Modal';
import { NuevaSolicitud, type DatosSolicitud } from './NuevaSolicitud';

export type CeldaDia = {
  fecha: string; n: number; st: string; txt: string; hoy: boolean; titulo: string; largo: string;
  marcas: Record<string, string>; turno: string | null; trab: string; col: string; atraso: number; he: string;
  comprobante: string | null; origen: string | null; accion: { tipo: string; label: string } | null; trabajado: boolean;
};

const CHIP: Record<string, string> = { ok: 'ok', warn: 'warn', bad: 'bad', accent: 'accent', vac: 'accent' };

export function Calendario({ celdas, offset, datos, dir }: { celdas: CeldaDia[]; offset: number; datos: DatosSolicitud; dir?: string }) {
  const [sel, setSel] = useState<CeldaDia | null>(null);
  return (
    <>
      <div className={'cal ' + (dir || '')}>
        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(x => <div key={x} className="dw">{x}</div>)}
        {Array.from({ length: offset }, (_, i) => <div key={'b' + i} className="day blank" />)}
        {celdas.map(c => (
          <button key={c.fecha} className={`day st-${c.st}${c.hoy ? ' today' : ''}${c.st === 'none' ? ' none' : ''}`} onClick={() => setSel(c)} aria-label={`${c.titulo}: ${c.txt}`}>
            <span className="dn">{c.n}</span><span className="dt">{c.txt}</span><span className="bar2" />
          </button>
        ))}
      </div>
      <Modal open={!!sel} onClose={() => setSel(null)} label="Detalle del día">
        {sel && <>
          <div><div className="label">{sel.titulo.split(' ')[0]}</div><h2>{sel.largo}</h2></div>
          <div className="row"><span className={`chip c-${CHIP[sel.st] || 'neutral'}`}>{sel.txt}</span>{sel.turno && <span className="hint">Turno {sel.turno}</span>}</div>
          {Object.keys(sel.marcas).length > 0 && (
            <div className="marks">{MARCA_ORDEN.map(t => <div key={t} className={'mark' + (sel.marcas[t] ? ' done' : '')}><div className="label">{MARCA_LABEL[t]}</div><div className="mono">{sel.marcas[t] ?? '--:--:--'}</div></div>)}</div>
          )}
          {sel.trabajado && (
            <div className="grid g4" style={{ gap: 10 }}>
              <div className="kpi"><div className="label">Trabajadas</div><div className="mono">{sel.trab} h</div></div>
              <div className="kpi"><div className="label">Colación</div><div className="mono">{sel.col} h</div></div>
              <div className="kpi"><div className="label">Atraso</div><div className="mono">{sel.atraso} min</div></div>
              <div className="kpi"><div className="label">H. extra</div><div className="mono">{sel.he} h</div></div>
            </div>
          )}
          {sel.comprobante && <p className="hint">Comprobante de entrada <span className="mono">{sel.comprobante}</span> · {sel.origen}</p>}
          <div className="foot">
            <button className="btn" onClick={() => setSel(null)}>Cerrar</button>
            {sel.accion && <NuevaSolicitud tipo={sel.accion.tipo} fecha={sel.fecha} datos={datos}>{sel.accion.label}</NuevaSolicitud>}
          </div>
        </>}
      </Modal>
    </>
  );
}
