'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState, type FormEvent } from 'react';
import { verificarComprobante, type Verificacion } from '@/api/api_portal/Api_Marcas';
import { useUser } from '@/contexts/UserContext';
import { MARCA_TEXTO, ORIGEN_LABEL } from '@/libs/textos';
import { fmtCompleta } from '@/libs/tiempo';
import { Icono } from '@/components/ui/Icono';
import Footer from '@/components/footer/footer';

function Contenido() {
  const params = useSearchParams();
  const inicial = (params.get('c') || '').trim().toUpperCase().slice(0, 20);
  const { token, isTokenValid } = useUser();
  const logueado = !!token && isTokenValid;
  const [c, setC] = useState(inicial);
  const [buscado, setBuscado] = useState('');
  const [r, setR] = useState<Verificacion | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const verificar = async (codigo: string) => {
    const k = codigo.trim().toUpperCase();
    if (!k) return;
    setCargando(true); setError(''); setR(null); setBuscado(k);
    try { setR(await verificarComprobante(k)); } catch (e) { setError((e as Error).message); }
    setCargando(false);
    window.history.replaceState({}, '', '/verificar?c=' + encodeURIComponent(k));
  };
  useEffect(() => { if (inicial) void verificar(inicial); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const enviar = (e: FormEvent) => { e.preventDefault(); void verificar(c); };
  const destino = logueado ? '/pages/inicio' : '/';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="top"><Link href={destino} className="brand"><img className="logo" src="/logo-malpo.png" alt="Malpo Constructora e Inmobiliaria" width={208} height={30} /><span>Verificación de marcación</span></Link>
        <Link className="kbd" style={{ display: 'inline-flex', textDecoration: 'none' }} href={destino}>{logueado ? 'Volver al portal' : 'Ingresar'}</Link></header>
      <main className="fresh" style={{ margin: '0 auto', flex: 1 }}>
        <div className="view">
          <div className="head"><div><div className="crumb">Dirección del Trabajo<span>/</span>Verificación</div><h1>Verificación de marcación</h1><p className="muted">Comprueba que un comprobante de marca es auténtico y que el registro no fue alterado. Sirve para el trabajador y para la fiscalización.</p></div></div>
          <section className="panel stack">
            <form className="row" style={{ alignItems: 'flex-end' }} onSubmit={enviar}>
              <div className="field" style={{ flex: '1 1 220px' }}><label htmlFor="c">Código del comprobante</label><input id="c" className="mono" value={c} onChange={e => setC(e.target.value)} placeholder="MLP-XXXXXXXX" autoComplete="off" required /></div>
              <button className={'btn primary' + (cargando ? ' loading' : '')} disabled={cargando}><Icono n="search" s={16} /> Verificar</button>
            </form>
            {buscado && error && !cargando && <div className="verify"><span className="seal" style={{ background: 'var(--bad-soft)', color: 'var(--bad)' }}><Icono n="x" s={26} /></span><div><h3>No encontramos ese comprobante</h3><p className="muted">{error.includes('válido') || error.includes('encontramos') ? 'Revisa que el código esté completo, por ejemplo MLP-4F2A9C1B.' : error}</p></div></div>}
            {r && (
              <div className="verify">
                <span className="seal" style={{ background: r.integro ? 'var(--ok-soft)' : 'var(--bad-soft)', color: r.integro ? 'var(--ok)' : 'var(--bad)' }}><Icono n={r.integro ? 'shield' : 'alert'} s={28} /></span>
                <div className="stack" style={{ gap: 6 }}>
                  <h3>{r.integro ? 'Comprobante válido · registro sin alteraciones' : 'Atención: el registro no coincide con su huella'}</h3>
                  <div style={{ fontSize: '.92rem' }}>
                    <b>{r.marca.nombre}</b> · RUT {r.marca.rut}<br />
                    Marcación de <b>{MARCA_TEXTO[r.marca.tipo]}</b> el {fmtCompleta(r.marca.fecha)} a las <span className="mono">{r.marca.fecha_hora.slice(11, 19)}</span><br />
                    {r.marca.obra ? `${r.marca.obra.nombre} · ${r.marca.obra.codigo} · ` : ''}{ORIGEN_LABEL[r.marca.origen]}
                  </div>
                  <div className="hint">Huella del registro: <span className="mono" style={{ wordBreak: 'break-all' }}>{r.marca.hash}</span></div>
                  {r.marca.origen === 'CORRECCION' && <div className="hint">Esta marca proviene de una corrección aprobada; la marca original se conserva.</div>}
                </div>
              </div>
            )}
          </section>
          <Footer />
        </div>
      </main>
    </div>
  );
}

export default function Verificar() {
  return <Suspense fallback={<div className="boot" />}><Contenido /></Suspense>;
}
