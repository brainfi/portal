import Layout from '@/components/Layout'
import { useNavigate } from 'react-router-dom'
import { useMemo, useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend,
} from 'recharts'
import { useDatos } from '@/contexts/DataContext'
import { buildPresupuesto, type FilaPresupuesto } from '@/lib/contabilidad'
import { getPlan, type PartidaPlan } from '@/lib/presupuesto'

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

const card: React.CSSProperties = { background: '#fff', borderRadius: 16, border: '1px solid #E8E8EC' }
const sectionLbl: React.CSSProperties = { fontSize: 9, fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: '0.12em' }

function fmt(n: number) {
  return Math.round(n).toLocaleString('es-ES') + ' €'
}
function fmtDelta(n: number) {
  const s = n >= 0 ? '+' : '−'
  return `${s}${Math.abs(Math.round(n)).toLocaleString('es-ES')} €`
}
function pct(n: number) {
  if (!isFinite(n)) return '—'
  return `${Math.round(n)}%`
}

function BarTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#fff', border: '1px solid #E8E8EC', borderRadius: 10, padding: '10px 14px', fontSize: 12 }}>
      <div style={{ fontWeight: 600, color: '#1a1a1a', marginBottom: 8 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <div style={{ width: 7, height: 7, borderRadius: 2, background: p.fill }} />
          <span style={{ color: '#666' }}>{p.dataKey === 'plan' ? 'Plan' : 'Real'}: <strong style={{ color: '#1a1a1a' }}>{fmt(p.value)}</strong></span>
        </div>
      ))}
    </div>
  )
}

export default function Presupuesto() {
  const navigate = useNavigate()
  const { data } = useDatos()
  const [plan, setPlan] = useState<PartidaPlan[] | null>(null)
  const [cargandoPlan, setCargandoPlan] = useState(true)
  const [modo, setModo] = useState<'mes' | 'ytd'>('mes')
  const [mesIdx, setMesIdx] = useState(new Date().getMonth())

  useEffect(() => {
    getPlan().then(setPlan).catch(() => setPlan(null)).finally(() => setCargandoPlan(false))
  }, [])

  const resumen = useMemo(() => {
    if (!plan) return null
    return buildPresupuesto(data?.diario ?? [], plan, modo, mesIdx)
  }, [data, plan, modo, mesIdx])

  // ── Sin plan configurado ──
  if (!cargandoPlan && (!plan || plan.length === 0)) {
    return (
      <Layout title="Presupuesto">
        <div style={{ ...card, padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: '#EEF1FD', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
            <i className="ti ti-table" aria-hidden="true" style={{ fontSize: 22, color: '#4361EE' }} />
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a', marginBottom: 6 }}>Aún no has definido tu presupuesto</div>
          <div style={{ fontSize: 13, color: '#888', maxWidth: 420, margin: '0 auto 18px' }}>
            Configura tus objetivos por categoría para comparar tu plan con lo que ocurre de verdad.
          </div>
          <button onClick={() => navigate('/presupuesto/configurar')} style={{ padding: '10px 20px', fontSize: 13, fontWeight: 600, color: '#fff', background: '#4361EE', border: 'none', borderRadius: 9, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
            Configurar presupuesto →
          </button>
        </div>
      </Layout>
    )
  }

  if (!resumen) {
    return (
      <Layout title="Presupuesto">
        <div style={{ ...card, padding: '48px 24px', textAlign: 'center', fontSize: 13, color: '#888' }}>Cargando presupuesto…</div>
      </Layout>
    )
  }

  const { filas, totalPlanIngresos, totalRealIngresos, totalPlanGastos, totalRealGastos } = resumen
  const ingresos = filas.filter(f => f.tipo === 'ingreso')
  const gastos = filas.filter(f => f.tipo === 'gasto')

  const planNeto = totalPlanIngresos - totalPlanGastos
  const realNeto = totalRealIngresos - totalRealGastos

  // Datos del gráfico: top partidas por plan, plan vs real
  const chartData = [...filas]
    .sort((a, b) => b.plan - a.plan)
    .slice(0, 7)
    .map(f => ({ nombre: f.categoria.length > 14 ? f.categoria.slice(0, 13) + '…' : f.categoria, plan: f.plan, real: f.real }))

  const periodoLbl = modo === 'mes' ? MESES[mesIdx] : `Ene–${MESES[mesIdx]}`

  const TablaSeccion = ({ titulo, items }: { titulo: string; items: FilaPresupuesto[] }) => (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: '#B0B7C3', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '12px 0 6px' }}>{titulo}</div>
      {items.map((f, i) => (
        <div key={f.id} className="ppto-row" style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr 1.2fr 80px', alignItems: 'center', padding: '11px 0', borderBottom: i < items.length - 1 ? '1px solid #F4F5F7' : 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: f.color, flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: '#1a1a1a' }}>{f.categoria}</span>
          </div>
          <span className="ppto-hide" style={{ fontSize: 12, color: '#888', textAlign: 'right', paddingRight: 14 }}>{fmt(f.plan)}</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#1a1a1a', textAlign: 'right', paddingRight: 14 }}>{fmt(f.real)}</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: f.favorable ? '#1a7a3a' : '#b01a2b', textAlign: 'right', paddingRight: 14 }}>{fmtDelta(f.desviacion)}</span>
          <span style={{ textAlign: 'right' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: f.favorable ? '#1a7a3a' : '#b01a2b', background: f.favorable ? '#d4f5df' : '#fdd', padding: '2px 7px', borderRadius: 99 }}>{pct(f.cumplimiento)}</span>
          </span>
        </div>
      ))}
    </div>
  )

  return (
    <Layout title="Presupuesto">
      <style>{`
        @media (max-width: 768px) {
          .ppto-kpi { grid-template-columns: 1fr 1fr !important; }
          .ppto-hide { display: none !important; }
          .ppto-hdr, .ppto-row { grid-template-columns: 1.6fr 1fr 1.2fr 70px !important; }
        }
      `}</style>

      {/* CONTROLES */}
      <div style={{ ...card, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={sectionLbl}>Vista</span>
          <div style={{ display: 'flex', gap: 4, background: '#F4F5F7', borderRadius: 9, padding: 3 }}>
            {([['mes', 'Mensual'], ['ytd', 'Acumulado']] as const).map(([v, l]) => (
              <button key={v} onClick={() => setModo(v)} style={{
                padding: '6px 14px', fontSize: 12, fontWeight: 600, borderRadius: 7, border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                background: modo === v ? '#fff' : 'transparent', color: modo === v ? '#4361EE' : '#888',
                boxShadow: modo === v ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              }}>{l}</button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 12, color: '#888' }}>{modo === 'mes' ? 'Mes' : 'Hasta'}</span>
          <select value={mesIdx} onChange={e => setMesIdx(parseInt(e.target.value, 10))} style={{ padding: '7px 12px', fontSize: 13, border: '1px solid #E8E8EC', borderRadius: 8, background: '#fff', color: '#1a1a1a', fontFamily: 'Inter, sans-serif', appearance: 'auto' }}>
            {MESES.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
        </div>
      </div>

      {/* KPIs */}
      <div className="ppto-kpi" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
        {[
          { lbl: 'Ingresos', plan: totalPlanIngresos, real: totalRealIngresos, favorable: totalRealIngresos >= totalPlanIngresos, icon: 'ti-trending-up', bg: '#EEF1FD', col: '#3B5BDB' },
          { lbl: 'Gastos', plan: totalPlanGastos, real: totalRealGastos, favorable: totalRealGastos <= totalPlanGastos, icon: 'ti-trending-down', bg: '#FEF0F0', col: '#EF233C' },
          { lbl: 'Resultado neto', plan: planNeto, real: realNeto, favorable: realNeto >= planNeto, icon: 'ti-scale', bg: '#F0F9F4', col: '#2DC653' },
        ].map((k, i) => {
          const desv = k.real - k.plan
          return (
            <div key={i} style={{ ...card, padding: '20px 22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div style={sectionLbl}>{k.lbl} · {periodoLbl}</div>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: k.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className={`ti ${k.icon}`} aria-hidden="true" style={{ fontSize: 16, color: k.col }} />
                </div>
              </div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 26, fontWeight: 400, color: '#1a1a1a', marginBottom: 4, letterSpacing: '-0.01em' }}>{fmt(k.real)}</div>
              <div style={{ fontSize: 11, color: '#aaa', marginBottom: 10 }}>Plan: {fmt(k.plan)}</div>
              <span style={{ fontSize: 11, fontWeight: 600, color: k.favorable ? '#1a7a3a' : '#b01a2b', background: k.favorable ? '#d4f5df' : '#fdd', padding: '2px 7px', borderRadius: 99 }}>{fmtDelta(desv)}</span>
            </div>
          )
        })}
      </div>

      {/* GRÁFICO RESUMEN */}
      <div style={{ ...card, padding: '24px' }}>
        <div style={{ marginBottom: 6 }}>
          <div style={{ ...sectionLbl, marginBottom: 4 }}>Plan vs Real por categoría</div>
          <div style={{ fontSize: 12, color: '#aaa' }}>{periodoLbl} · principales partidas</div>
        </div>
        <div style={{ display: 'flex', gap: 16, margin: '8px 0 14px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 10, height: 10, borderRadius: 3, background: '#C7D2F8' }} /><span style={{ fontSize: 11, color: '#888' }}>Plan</span></span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 10, height: 10, borderRadius: 3, background: '#4361EE' }} /><span style={{ fontSize: 11, color: '#888' }}>Real</span></span>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} margin={{ top: 4, right: 6, left: 0, bottom: 0 }} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F2" vertical={false} />
            <XAxis dataKey="nombre" tick={{ fontSize: 10, fill: '#aaa' }} axisLine={false} tickLine={false} interval={0} angle={-15} textAnchor="end" height={50} />
            <YAxis tick={{ fontSize: 11, fill: '#aaa' }} axisLine={false} tickLine={false} tickFormatter={(v) => `€${Math.round(v / 1000)}k`} width={46} />
            <Tooltip content={<BarTooltip />} cursor={{ fill: '#F4F5F7' }} />
            <Bar dataKey="plan" fill="#C7D2F8" radius={[4, 4, 0, 0]} />
            <Bar dataKey="real" fill="#4361EE" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* TABLA */}
      <div style={{ ...card, padding: '22px 24px' }}>
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a' }}>Detalle por partida</div>
          <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>Desviación = real − plan · {periodoLbl}</div>
        </div>

        <div className="ppto-hdr" style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr 1.2fr 80px', fontSize: 10, color: '#B0B7C3', fontWeight: 600, paddingBottom: 8, borderBottom: '1px solid #ECEEF3' }}>
          <span>Categoría</span>
          <span className="ppto-hide" style={{ textAlign: 'right', paddingRight: 14 }}>Plan</span>
          <span style={{ textAlign: 'right', paddingRight: 14 }}>Real</span>
          <span style={{ textAlign: 'right', paddingRight: 14 }}>Desviación</span>
          <span style={{ textAlign: 'right' }}>Ejec.</span>
        </div>

        {ingresos.length > 0 && <TablaSeccion titulo="Ingresos" items={ingresos} />}
        {gastos.length > 0 && <TablaSeccion titulo="Gastos" items={gastos} />}
      </div>
    </Layout>
  )
}
