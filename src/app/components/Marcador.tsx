'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { marcar, type ResultadoMarca } from '@/api/api_portal/Api_Marcas';
import { refrescarPortal } from '@/api/api_portal/useApiPortal';
import { MARCA_LABEL, MARCA_ORDEN, MARCA_TEXTO, type TipoMarca } from '@/libs/textos';
import { Icono } from './ui/Icono';
import { Modal } from './ui/Modal';
import { useToast } from './ui/Toasts';

type Res = (ResultadoMarca & { ok: true }) | { ok: false; error: string };

const TZ = 'America/Santiago';
const horaAhora = () => new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).format(new Date());
const aMin = (s: string) => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
const fmtMin = (m: number) => { m = Math.max(0, Math.round(m)); return Math.floor(m / 60) + ':' + String(m % 60).padStart(2, '0'); };
const espera = (ms: number) => new Promise(r => setTimeout(r, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : ms));

function Reloj() {
  const ref = useRef<HTMLDivElement>(null), prev = useRef('');
  useEffect(() => {
    const el = ref.current!;
    const tick = () => {
      const t = horaAhora();
      if (!el.children.length) el.innerHTML = [...t].map((c, i) => `<span class="cd${i >= 5 ? ' sm' : ''}"><span>${c}</span></span>`).join('');
      else [...t].forEach((c, i) => {
        if (c === prev.current[i]) return;
        const box = el.children[i] as HTMLElement, viejo = box.lastElementChild as HTMLElement, nuevo = document.createElement('span');
        nuevo.textContent = c; box.appendChild(nuevo);
        if (matchMedia('(prefers-reduced-motion: reduce)').matches) { viejo?.remove(); return; }
        nuevo.animate([{ transform: 'translateY(-90%)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 420, easing: 'cubic-bezier(.16,1,.3,1)' });
        viejo?.animate([{ transform: 'none', opacity: 1 }, { transform: 'translateY(90%)', opacity: 0 }], { duration: 420, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'forwards' }).addEventListener('finish', () => viejo.remove());
      });
      prev.current = t;
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return <div className="clock" ref={ref} role="timer" aria-label="Hora oficial" />;
}

function Anillo({ marcas, pactadoMin }: { marcas: Partial<Record<TipoMarca, string>>; pactadoMin: number }) {
  const [ahora, setAhora] = useState(horaAhora());
  useEffect(() => { const id = setInterval(() => setAhora(horaAhora()), 15000); return () => clearInterval(id); }, []);
  let w = 0, txt = 'sin iniciar';
  if (marcas.ENTRADA) {
    const n = aMin(ahora), fin = marcas.SALIDA ? aMin(marcas.SALIDA) : n;
    const col = marcas.INICIO_COLACION ? (marcas.FIN_COLACION ? aMin(marcas.FIN_COLACION) : n) - aMin(marcas.INICIO_COLACION) : 0;
    w = Math.max(0, fin - aMin(marcas.ENTRADA) - col);
    txt = marcas.SALIDA ? 'jornada' : marcas.INICIO_COLACION && !marcas.FIN_COLACION ? 'en colación' : 'trabajado';
  }
  const C = 238.8, p = pactadoMin ? Math.min(1, w / pactadoMin) : 0;
  return (
    <div className="ring">
      <svg width="88" height="88" viewBox="0 0 88 88"><circle className="trk" cx="44" cy="44" r="38" fill="none" strokeWidth="7" /><circle className="val" cx="44" cy="44" r="38" fill="none" strokeWidth="7" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - p)} /></svg>
      <div className="lbl"><div><b>{fmtMin(w)}</b>{txt}</div></div>
    </div>
  );
}

export function Marcador({ marcas, turnoTexto, pactadoMin, obra, exigirUbicacion }: {
  marcas: Partial<Record<TipoMarca, string>>; turnoTexto: string; pactadoMin: number;
  obra: { nombre: string; codigo: string; direccion: string } | null; exigirUbicacion: boolean;
}) {
  const toast = useToast();
  const sig = MARCA_ORDEN.find(t => !marcas[t]) ?? null;
  const [abierto, setAbierto] = useState(false);
  const [paso, setPaso] = useState<'confirmar' | 'registrando' | 'listo' | 'error'>('confirmar');
  const [checks, setChecks] = useState(0);
  const [res, setRes] = useState<Res | null>(null);
  const [hora, setHora] = useState('');
  const [recien, setRecien] = useState<TipoMarca | null>(null);

  const abrir = () => { setPaso('confirmar'); setChecks(0); setRes(null); setHora(horaAhora()); setAbierto(true); };

  const registrar = async () => {
    if (!sig) return;
    setPaso('registrando'); setChecks(0);
    let lat: number | null = null, lng: number | null = null;
    const ubic = new Promise<void>(ok => {
      if (!navigator.geolocation) return ok();
      navigator.geolocation.getCurrentPosition(p => { lat = p.coords.latitude; lng = p.coords.longitude; ok(); }, () => ok(), { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 });
    });
    await Promise.all([ubic, espera(520)]);
    setChecks(1);
    const [r] = await Promise.all([
      marcar(sig, lat, lng).then(d => ({ ...d, ok: true as const })).catch((e: Error) => ({ ok: false as const, error: e.message })),
      espera(520),
    ]);
    if (!r.ok) { setRes(r); setPaso('error'); return; }
    setChecks(2); await espera(480); setChecks(3); await espera(260);
    setRes(r); setPaso('listo'); setRecien(sig);
    refrescarPortal();
  };

  return (
    <section className="panel stack">
      <div className="clockrow">
        <div><div className="label">Hora oficial en obra</div><Reloj /><div className="hint">{turnoTexto}</div></div>
        <Anillo marcas={marcas} pactadoMin={pactadoMin} />
      </div>
      {obra && <div className="site"><Icono n="pin" /><div><b>{obra.nombre}</b> · {obra.codigo}<br /><span className="muted">{obra.direccion}</span></div></div>}
      <div className="marks">
        {MARCA_ORDEN.map(t => (
          <div key={t} className={'mark' + (marcas[t] ? ' done' : '') + (t === sig ? ' next' : '') + (recien === t ? ' fresh-mark' : '')}>
            <div className="label">{MARCA_LABEL[t]}</div><div className="mono">{marcas[t]?.slice(0, 5) ?? '--:--'}</div>
          </div>
        ))}
      </div>
      {sig
        ? <button className={'btn primary big' + (sig === 'ENTRADA' ? ' pulse' : '')} onClick={abrir}><Icono n="finger" s={20} /> Marcar {MARCA_TEXTO[sig]}</button>
        : <div className="row"><span className="chip c-ok">Jornada de hoy completa</span></div>}

      <Modal open={abierto} onClose={() => { if (paso !== 'registrando') setAbierto(false); }} paso={paso} label="Marcar asistencia">
        {paso === 'confirmar' && sig && <>
          <div><div className="label">Hora oficial · {obra?.codigo ?? 'Malpo'}</div><h2>Marcar {MARCA_TEXTO[sig]}</h2></div>
          <div className="steps">
            {MARCA_ORDEN.map(t => (
              <div key={t} className={'step' + (marcas[t] ? ' done' : t === sig ? ' now' : '')}>{MARCA_LABEL[t]}<br /><span className="mono">{marcas[t]?.slice(0, 5) ?? (t === sig ? hora.slice(0, 5) : '--:--')}</span></div>
            ))}
          </div>
          <div className="site"><Icono n="pin" /><div>Se registrará en <b>{obra?.nombre ?? 'tu obra'}</b>{obra ? ` (${obra.direccion})` : ''} desde el portal web.{exigirUbicacion && <><br /><span className="hint">Esta obra valida tu ubicación: el navegador te pedirá permiso.</span></>}</div></div>
          <p className="hint">Una vez registrada, la marca no se puede modificar. Si te equivocas, pide una corrección a tu jefatura.</p>
          <div className="foot"><button className="btn" onClick={() => setAbierto(false)}>Cancelar</button><button className="btn primary" onClick={registrar}><Icono n="finger" /> Registrar {MARCA_TEXTO[sig]}</button></div>
        </>}
        {paso === 'registrando' && sig && <div className="scan">
          <div className="fp"><Icono n="finger" s={56} /><i className="beam" /></div>
          <h2>Registrando {MARCA_TEXTO[sig]}</h2>
          <ul className="checks">
            {['Validando ubicación en obra', 'Sellando hora oficial', 'Generando comprobante'].map((t, i) => (
              <li key={t} className={checks > i ? 'done' : checks === i ? '' : 'wait'}>{t}</li>
            ))}
          </ul>
        </div>}
        {paso === 'listo' && res?.ok && <>
          <div className="success">
            <div className="check"><svg viewBox="0 0 80 80" fill="none" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><circle cx="40" cy="40" r="36" /><path d="M25 41l10 10 20-22" /></svg></div>
            <h2>{MARCA_LABEL[res.tipo]} registrada</h2>
            <div className="bigtime">{res.hora}</div>
            <p>Comprobante <b className="mono">{res.comprobante}</b></p>
            <p className="hint">{res.correo ? 'Guarda este código: con él puedes verificar tu marca en cualquier momento.' : 'Tienes desactivado el aviso por correo.'}</p>
          </div>
          <div className="foot" style={{ justifyContent: 'center' }}>
            <Link className="btn" href={`/verificar?c=${res.comprobante}`} onClick={() => setAbierto(false)}>Verificar comprobante</Link>
            <button className="btn primary" onClick={() => { setAbierto(false); toast(`${MARCA_LABEL[res.tipo]} registrada a las ${res.hora.slice(0, 5)}`); }}>Listo</button>
          </div>
        </>}
        {paso === 'error' && res && !res.ok && <>
          <div className="success"><span className="verify"><span className="seal" style={{ background: 'var(--bad-soft)', color: 'var(--bad)' }}><Icono n="x" s={26} /></span></span><h2>No se registró la marca</h2><p className="muted">{res.error}</p></div>
          <div className="foot" style={{ justifyContent: 'center' }}><button className="btn" onClick={() => setAbierto(false)}>Cerrar</button><button className="btn primary" onClick={() => setPaso('confirmar')}>Intentar de nuevo</button></div>
        </>}
      </Modal>
    </section>
  );
}
