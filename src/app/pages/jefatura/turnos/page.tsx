'use client';
import { useState } from 'react';
import { useApiTurnos } from '@/api/api_portal/Api_Jefatura';
import { PERMISO, usePermisos } from '@/contexts/UserContext';
import { fmtFecha, fmtFechaHora, hoy, sumarDias } from '@/libs/tiempo';
import { SelectTurno } from '@/components/Acciones';
import { Cabecera, Cargando, ErrorCarga, SinPermiso, Vacio } from '@/components/ui/ui';
import { Icono } from '@/components/ui/Icono';

export default function Turnos() {
  const { puede } = usePermisos();
  const [semana, setSemana] = useState(hoy());
  const { data: t, loading, error, refetch } = useApiTurnos(semana);
  if (!puede(PERMISO.TURNOS)) return <SinPermiso />;
  const dias = t?.dias || [];
  return <>
    <Cabecera seccion="Jefatura" titulo="Turnos del equipo" sub={dias.length ? `Semana del ${fmtFecha(dias[0], { day: 'numeric', month: 'long' })} al ${fmtFecha(dias[6], { day: 'numeric', month: 'long' })}. Cada cambio queda registrado y la persona lo ve en sus reportes.` : ''}>
      <div className="row">
        <button className="btn sm" onClick={() => setSemana(sumarDias(t?.lunes || semana, -7))} aria-label="Semana anterior"><Icono n="chevl" s={16} /></button>
        <button className="btn sm" onClick={() => setSemana(hoy())}>Esta semana</button>
        <button className="btn sm" onClick={() => setSemana(sumarDias(t?.lunes || semana, 7))} aria-label="Semana siguiente"><Icono n="chev" s={16} /></button>
      </div>
    </Cabecera>
    {loading && !t ? <Cargando /> : error ? <ErrorCarga error={error} reintentar={() => refetch()} /> : t && <>
      {t.filas.length ? <div className="tw"><table><thead><tr><th>Trabajador</th>{dias.map(d => <th key={d}>{fmtFecha(d)}</th>)}</tr></thead><tbody className="stagger" key={t.lunes}>
        {t.filas.map(p => <tr key={p.id_externo}><td>{p.nombre}<div className="hint">{p.cargo}</div></td>{p.dias.map(c => (
          <td key={c.fecha}><SelectTurno key={c.fecha + c.valor} usuarioId={p.id_externo} fecha={c.fecha} valor={c.valor} opciones={t.tipos} etiqueta={`Turno de ${p.nombre} el ${fmtFecha(c.fecha)}`} /><div className="hint" style={{ fontSize: '.72rem' }}>{c.valor === 'HABITUAL' ? c.habitual : ''}</div></td>
        ))}</tr>)}
      </tbody></table></div> : <Vacio icono="users">Aún no tienes personas a cargo.</Vacio>}
      <div className="row hint" style={{ marginTop: 10 }}>{t.tipos.map(x => <span key={x.codigo} className="shift" data-k={x.codigo} style={{ cursor: 'default' }}>{x.nombre}</span>)}</div>
      <h2 style={{ margin: '26px 0 10px' }}>Cambios registrados</h2>
      <div className="list stagger">
        {t.mod_turnos.length ? t.mod_turnos.map(m => (
          <div key={m.id} className="item"><span className="ic"><Icono n="swap" /></span><div><b>{m.nombre} · {/^\d{4}-/.test(m.aplica) ? fmtFecha(m.aplica) : m.aplica}</b><div className="meta">{m.antes} → <b>{m.despues}</b> · {m.motivo} · {m.autor ?? 'Sistema'}</div></div><div className="actions"><span className="hint mono">{fmtFechaHora(m.creado_en)}</span></div></div>
        )) : <Vacio icono="swap">Aún no hay cambios de turno.</Vacio>}
      </div>
    </>}
  </>;
}
