'use client';
import { useState, type ReactNode } from 'react';
import { crearSolicitud } from '@/api/api_portal/Api_Solicitudes';
import { refrescarPortal } from '@/api/api_portal/useApiPortal';
import type { DatosSolicitud } from '@/api/api_portal/tipos';
import { MARCA_LABEL, MARCA_ORDEN, SOLICITUD_LABEL } from '@/libs/textos';
import { Icono } from './ui/Icono';
import { Modal } from './ui/Modal';

export type { DatosSolicitud };

const sumar = (f: string, n: number) => { const d = new Date(f + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
function habiles(a: string, b: string, fer: Set<string>) {
  let n = 0;
  for (let f = a; f <= b; f = sumar(f, 1)) { const w = new Date(f + 'T12:00:00Z').getUTCDay(); if (w > 0 && w < 6 && !fer.has(f)) n++; }
  return n;
}

export function NuevaSolicitud({ tipo = 'VACACIONES', fecha, datos, className = 'btn primary', disabled, children }: {
  tipo?: string; fecha?: string; datos: DatosSolicitud; className?: string; disabled?: boolean; children: ReactNode;
}) {
  const [abierto, setAbierto] = useState(false);
  const [t, setT] = useState(tipo);
  const [desde, setDesde] = useState(sumar(datos.hoy, 10));
  const [hasta, setHasta] = useState(sumar(datos.hoy, 14));
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [listo, setListo] = useState<string | null>(null);
  const fer = new Set(datos.feriados);
  const dias = desde && hasta && hasta >= desde ? habiles(desde, hasta, fer) : 0;
  const fechaDef = fecha || (t.startsWith('JUSTIFICAR') || t === 'CORRECCION_MARCA' ? sumar(datos.hoy, -1) : t === 'USO_HE' ? sumar(datos.hoy, 3) : datos.hoy);

  const abrir = () => { setT(tipo); setError(''); setListo(null); setAbierto(true); };
  const enviar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(''); setEnviando(true);
    const fd = new FormData(e.currentTarget);
    const [r] = await Promise.all([
      crearSolicitud(fd).then(d => ({ detalle: d.detalle, error: '' })).catch((err: Error) => ({ detalle: '', error: err.message })),
      new Promise(ok => setTimeout(ok, 500)),
    ]);
    setEnviando(false);
    if (r.error) { setError(r.error); return; }
    setListo(r.detalle || '');
    refrescarPortal();
  };

  return (
    <>
      <button type="button" className={className} onClick={abrir} disabled={disabled}>{children}</button>
      <Modal open={abierto} onClose={() => setAbierto(false)} paso={listo === null ? t : 'ok'} label="Nueva solicitud">
        {listo === null ? (
          <form onSubmit={enviar} className="stack" style={{ gap: 14 }}>
            <div><div className="label">Nueva solicitud</div><h2>{SOLICITUD_LABEL[t]}</h2></div>
            <div className="field"><label htmlFor="s-tipo">Tipo</label>
              <select id="s-tipo" name="tipo" value={t} onChange={e => { setT(e.target.value); setError(''); }}>
                {Object.entries(SOLICITUD_LABEL).map(([k, l]) => <option key={k} value={k} disabled={k === 'USO_HE' && !datos.pacto_vigente}>{l}{k === 'USO_HE' && !datos.pacto_vigente ? ' (requiere pacto)' : ''}</option>)}
              </select>
            </div>
            {t === 'VACACIONES' && <>
              <div className="grid g2" style={{ gap: 10 }}>
                <div className="field"><label htmlFor="s-desde">Desde</label><input id="s-desde" name="desde" type="date" value={desde} min={datos.hoy} onChange={e => setDesde(e.target.value)} required /></div>
                <div className="field"><label htmlFor="s-hasta">Hasta</label><input id="s-hasta" name="hasta" type="date" value={hasta} min={desde} onChange={e => setHasta(e.target.value)} required /></div>
              </div>
              <p className="hint"><b>{dias} días hábiles</b> · saldo después: {(datos.saldo_vac - dias).toLocaleString('es-CL')} días{datos.saldo_vac - dias < 0 && <span style={{ color: 'var(--bad)' }}> · supera tu saldo</span>}</p>
            </>}
            {t === 'PACTO_HE' && <>
              <div className="field"><label htmlFor="s-meses">Duración del pacto</label><select id="s-meses" name="meses" defaultValue="3"><option value="1">1 mes</option><option value="2">2 meses</option><option value="3">3 meses</option></select></div>
              <p className="hint">Tus horas extra aceptadas se sumarán a una bolsa que podrás usar como tiempo libre.</p>
            </>}
            {t !== 'VACACIONES' && t !== 'PACTO_HE' && (
              <div className="field"><label htmlFor="s-fecha">Fecha</label><input key={t} id="s-fecha" name="fecha" type="date" defaultValue={fechaDef} max={t === 'CORRECCION_MARCA' || t.startsWith('JUSTIFICAR') ? datos.hoy : undefined} required /></div>
            )}
            {t === 'PERMISO_SALIDA' && <div className="grid g2" style={{ gap: 10 }}>
              <div className="field"><label htmlFor="s-h1">Sale</label><input id="s-h1" name="hora_desde" type="time" defaultValue="15:00" required /></div>
              <div className="field"><label htmlFor="s-h2">Vuelve</label><input id="s-h2" name="hora_hasta" type="time" defaultValue="17:00" required /></div>
            </div>}
            {t === 'CAMBIO_TURNO' && <div className="field"><label htmlFor="s-turno">Turno propuesto</label><select id="s-turno" name="turno">{datos.turnos.map(x => <option key={x.codigo} value={x.codigo}>{x.nombre}</option>)}</select></div>}
            {t === 'CORRECCION_MARCA' && <div className="grid g2" style={{ gap: 10 }}>
              <div className="field"><label htmlFor="s-mt">Marca</label><select id="s-mt" name="marca_tipo">{MARCA_ORDEN.map(m => <option key={m} value={m}>{MARCA_LABEL[m]}</option>)}</select></div>
              <div className="field"><label htmlFor="s-hc">Hora correcta</label><input id="s-hc" name="hora_correcta" type="time" defaultValue="18:00" required /></div>
            </div>}
            {t === 'USO_HE' && <>
              <div className="field"><label htmlFor="s-horas">Horas a usar</label><select id="s-horas" name="horas">{Array.from({ length: Math.max(0, Math.floor(datos.bolsa_min / 60)) }, (_, i) => <option key={i} value={i + 1}>{i + 1} h</option>)}</select></div>
              <p className="hint">Tienes {Math.floor(datos.bolsa_min / 60)}:{String(datos.bolsa_min % 60).padStart(2, '0')} h en tu bolsa.</p>
            </>}
            {t.startsWith('JUSTIFICAR') && <div className="field"><label htmlFor="s-adj">Respaldo (licencia o certificado, opcional)</label><input id="s-adj" name="adjunto" type="file" accept=".pdf,image/jpeg,image/png,image/webp" /></div>}
            <div className="field"><label htmlFor="s-motivo">Motivo</label><textarea id="s-motivo" name="motivo" placeholder="Cuéntale a tu jefatura lo necesario" maxLength={1000} /></div>
            {error && <p className="err" role="alert">{error}</p>}
            <div className="foot"><button type="button" className="btn" onClick={() => setAbierto(false)}>Cancelar</button><button className={'btn primary' + (enviando ? ' loading' : '')} disabled={enviando}>Enviar a jefatura</button></div>
          </form>
        ) : (
          <>
            <div className="success">
              <div className="check"><svg viewBox="0 0 80 80" fill="none" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><circle cx="40" cy="40" r="36" /><path d="M25 41l10 10 20-22" /></svg></div>
              <h2>Solicitud enviada</h2><p className="muted">{SOLICITUD_LABEL[t]} · {listo}</p><p className="hint">Tu jefatura recibió la solicitud. Te avisaremos cuando responda.</p>
            </div>
            <div className="foot" style={{ justifyContent: 'center' }}><button className="btn primary" onClick={() => setAbierto(false)}><Icono n="check" s={16} /> Listo</button></div>
          </>
        )}
      </Modal>
    </>
  );
}
