'use client';
import { useApiPacto } from '@/api/api_portal/Api_HorasExtra';
import { fmtLarga, fmtMin } from '@/libs/tiempo';
import { Cabecera, Cargando, Chip, ErrorCarga } from '@/components/ui/ui';
import { Icono } from '@/components/ui/Icono';
import { NuevaSolicitud } from '@/components/NuevaSolicitud';
import { Num } from '@/components/ui/Num';

export default function Pacto() {
  const { data: p, loading, error, refetch } = useApiPacto();
  let card = null;
  if (p) {
    const b = p.bolsa;
    if (b.pacto) card = (
      <div className="grid g2">
        <section className="panel stack"><div className="row"><Chip c="ok">Vigente</Chip></div><h2>Pacto de compensación de horas extra</h2><p className="muted">Desde el {fmtLarga(b.pacto.desde)} hasta el {fmtLarga(b.pacto.hasta)}.</p></section>
        <section className="panel kpi"><div className="label">Bolsa de horas disponible</div><div className="v"><Num v={b.saldo} f="hm" /> h</div>
          <div className="s">{fmtMin(b.usado)} h usadas de {fmtMin(b.acumulado)} h acumuladas</div>
          <div className="meter"><i style={{ width: `${b.acumulado ? Math.round((b.saldo / b.acumulado) * 100) : 0}%` }} /></div>
          <div style={{ marginTop: 14 }}><NuevaSolicitud tipo="USO_HE" datos={p.datos} disabled={b.saldo < 60}>Usar horas compensadas</NuevaSolicitud>{b.saldo < 60 && <p className="hint" style={{ marginTop: 6 }}>Necesitas al menos 1 hora en la bolsa.</p>}</div>
        </section>
      </div>
    );
    else if (p.pendiente) card = <section className="panel stack"><div className="row"><Chip c="warn">En revisión</Chip></div><h2>Tu solicitud de pacto está en revisión</h2><p className="muted">{p.pendiente.detalle}. Te avisaremos cuando jefatura responda.</p></section>;
    else card = (
      <section className="panel stack">
        {p.rechazada && <div className="row"><Chip c="bad">Última solicitud rechazada</Chip><span className="hint">{p.rechazada.comentario}</span></div>}
        <h2>No tienes un pacto de compensación vigente</h2>
        <p className="muted" style={{ maxWidth: '60ch' }}>Con un pacto de compensación puedes cambiar tus horas extra por horas o días libres en vez de recibir el pago. La ley permite compensar hasta 5 días hábiles adicionales de feriado al año.</p>
        <div><NuevaSolicitud tipo="PACTO_HE" datos={p.datos}><Icono n="plus" s={16} /> Solicitar pacto</NuevaSolicitud></div>
      </section>
    );
  }
  return <><Cabecera seccion="Horas extras" titulo="Pacto y compensación" sub="Cambia horas extra por tiempo libre." />{loading && !p ? <Cargando /> : error ? <ErrorCarga error={error} reintentar={() => refetch()} /> : card}</>;
}
