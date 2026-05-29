import { useState, useMemo } from 'react'
import Layout from '@/components/Layout'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend,
} from 'recharts'

// ─── Tipos ───────────────────────────────────────────────────────────────────

type TipoPartida = 'ingreso' | 'gasto'

type PeriodoKey = 'mes' | 'q1' | 'q2' | 'q3' | 'q4' | 'ytd' | 'anual'

interface Partida {
  id: number
  categoria: string
  tipo: TipoPartida
  planAnual: number     // plan total anual introducido por el usuario
  planMensual: number[] // derivado de planAnual / 12, editable por mes
  real: number[]        // datos reales desde Holded (mock)
}

// ─── Periodos ────────────────────────────────────────────────────────────────

const PERIODOS: { key: PeriodoKey; label: string; meses: number[] }[] = [
  { key: 'mes',  label: 'Mayo',   meses: [4] },
  { key: 'q1',   label: 'Q1',     meses: [0,1,2] },
  { key: 'q2',   label: 'Q2',     meses: [3,4,5] },
  { key: 'q3',   label: 'Q3',     meses: [6,7,8] },
  { key: 'q4',   label: 'Q4',     meses: [9,10,11] },
  { key: 'ytd',  label: 'YTD',    meses: [0,1,2,3,4] },
  { key: 'anual',label: 'Anual',  meses: [0,1,2,3,4,5,6,7,8,9,10,11] },
]

const MES_ACTUAL = 4 // Mayo (0-based)
const MESES_CON_REAL = [0,1,2,3,4]

// ─── Datos mock ──────────────────────────────────────────────────────────────

const initialPartidas: Partida[] = [
  {
    id: 1, categoria: 'Ventas directas', tipo: 'ingreso', planAnual: 840000,
    planMensual: [65000,65000,68000,70000,70200,72000,72000,68000,74000,76000,78000,80000],
    real: [63200,66800,74000,88000,68000,0,0,0,0,0,0,0],
  },
  {
    id: 2, categoria: 'Servicios recurrentes', tipo: 'ingreso', planAnual: 96000,
    planMensual: [8000,8000,8000,8000,8000,8000,8000,8000,8000,8000,8000,8000],
    real: [8100,8000,8200,8100,7900,0,0,0,0,0,0,0],
  },
  {
    id: 3, categoria: 'Licencias', tipo: 'ingreso', planAnual: 60000,
    planMensual: [4000,4000,5000,5000,5500,5500,5500,5000,5000,5500,5500,5500],
    real: [5200,5800,8100,9200,10200,0,0,0,0,0,0,0],
  },
  {
    id: 4, categoria: 'Nóminas y SS', tipo: 'gasto', planAnual: 196800,
    planMensual: [16400,16400,16400,16400,16400,16400,16400,16400,16400,16400,16400,16400],
    real: [16400,16400,16800,17200,18400,0,0,0,0,0,0,0],
  },
  {
    id: 5, categoria: 'Alquiler oficina', tipo: 'gasto', planAnual: 25200,
    planMensual: [2100,2100,2100,2100,2100,2100,2100,2100,2100,2100,2100,2100],
    real: [2100,2100,2100,2100,2100,0,0,0,0,0,0,0],
  },
  {
    id: 6, categoria: 'Marketing', tipo: 'gasto', planAnual: 36000,
    planMensual: [3000,3000,3000,3000,3000,3000,3000,3000,3000,3000,3000,3000],
    real: [2800,3100,3400,3900,4300,0,0,0,0,0,0,0],
  },
  {
    id: 7, categoria: 'Software', tipo: 'gasto', planAnual: 10800,
    planMensual: [900,900,900,900,900,900,900,900,900,900,900,900],
    real: [740,740,740,740,740,0,0,0,0,0,0,0],
  },
  {
    id: 8, categoria: 'Viajes y dietas', tipo: 'gasto', planAnual: 8400,
    planMensual: [600,600,800,800,800,800,800,600,800,800,600,400],
    real: [520,480,610,650,520,0,0,0,0,0,0,0],
  },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency', currency: 'EUR', maximumFractionDigits: 0,
  }).format(n)
}

function fmtK(n: number) {
  if (Math.abs(n) >= 1000) return `${(n/1000).toFixed(n % 1000 === 0 ? 0 : 1)}k €`
  return `${n} €`
}

function calcDelta(real: number, plan: number): number | null {
  if (!plan || !real) return null
  return ((real - plan) / plan) * 100
}

function sumPeriodo(arr: number[], meses: number[]) {
  return meses.reduce((a, i) => a + (arr[i] ?? 0), 0)
}

// ─── Componentes menores ─────────────────────────────────────────────────────

function DeltaBadge({ real, plan, tipo }: { real: number; plan: number; tipo: TipoPartida }) {
  const d = calcDelta(real, plan)
  if (d === null) return <span style={{ fontSize: 11, color: '#B0B7C3' }}>—</span>
  const isGood = tipo === 'ingreso' ? d >= 0 : d <= 0
  const neutral = Math.abs(d) < 3
  const sign = d > 0 ? '+' : ''
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 99,
      background: neutral ? '#F4F5F7' : isGood ? '#EAFAF0' : '#FEF2F2',
      color: neutral ? '#888' : isGood ? '#1a7a3a' : '#b91c1c',
      whiteSpace: 'nowrap',
    }}>
      {sign}{d.toFixed(1)}%
    </span>
  )
}

function EstadoBadge({ real, plan, tipo }: { real: number; plan: number; tipo: TipoPartida }) {
  if (!real) return <span style={{ fontSize: 11, color: '#B0B7C3' }}>Sin datos</span>
  const d = calcDelta(real, plan)
  if (d === null) return null
  const isGood = tipo === 'ingreso' ? d >= -3 : d <= 3
  return (
    <span style={{
      fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 6,
      background: isGood ? '#EEF1FD' : '#FEF2F2',
      color: isGood ? '#4361EE' : '#b91c1c',
    }}>
      {isGood ? 'En curso' : 'Por debajo'}
    </span>
  )
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#fff', border: '1px solid #E8E8EC', borderRadius: 10, padding: '10px 14px', fontSize: 12 }}>
      <div style={{ fontWeight: 600, color: '#1a1a1a', marginBottom: 6 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: p.fill }} />
          <span style={{ color: '#666' }}>{p.name}: {fmtK(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function Presupuesto() {
  const [partidas, setPartidas] = useState<Partida[]>(initialPartidas)
  const [periodo, setPeriodo] = useState<PeriodoKey>('ytd')
  const [editandoPlan, setEditandoPlan] = useState<number | null>(null)
  const [modalNueva, setModalNueva] = useState(false)
  const [nuevaCategoria, setNuevaCategoria] = useState('')
  const [nuevaTipo, setNuevaTipo] = useState<TipoPartida>('gasto')
  const [nuevaImporte, setNuevaImporte] = useState('')
  const [saved, setSaved] = useState(false)

  const periodoActivo = PERIODOS.find(p => p.key === periodo)!
  const meses = periodoActivo.meses

  // ── Sólo mostramos real en meses con datos ──
  const mesaConReal = meses.some(m => MESES_CON_REAL.includes(m))
  const mesesConReal = meses.filter(m => MESES_CON_REAL.includes(m))

  // ── Totales ──
  const ingresos = partidas.filter(p => p.tipo === 'ingreso')
  const gastos   = partidas.filter(p => p.tipo === 'gasto')

  const sumPlan  = (arr: Partida[]) => arr.reduce((a, p) => a + sumPeriodo(p.planMensual, meses), 0)
  const sumReal  = (arr: Partida[]) => arr.reduce((a, p) => a + sumPeriodo(p.real, mesesConReal), 0)

  const ingresosPlan = sumPlan(ingresos)
  const ingresosReal = sumReal(ingresos)
  const gastosPlan   = sumPlan(gastos)
  const gastosReal   = sumReal(gastos)
  const utilPlan     = ingresosPlan - gastosPlan
  const utilReal     = ingresosReal - gastosReal

  // ── Alertas ──
  const sobrePlan  = partidas.filter(p => {
    const d = calcDelta(sumPeriodo(p.real, mesesConReal), sumPeriodo(p.planMensual, meses))
    return d !== null && (p.tipo === 'gasto' ? d > 5 : d < -5)
  }).length
  const bajoPlan = partidas.filter(p => {
    const d = calcDelta(sumPeriodo(p.real, mesesConReal), sumPeriodo(p.planMensual, meses))
    return d !== null && (p.tipo === 'ingreso' ? d < -5 : false)
  }).length

  // ── Datos para el gráfico ──
  const chartData = useMemo(() =>
    partidas.map(p => ({
      name: p.categoria.length > 12 ? p.categoria.slice(0,11) + '…' : p.categoria,
      'Esperado': sumPeriodo(p.planMensual, meses),
      'Real': mesaConReal ? sumPeriodo(p.real, mesesConReal) || undefined : undefined,
      tipo: p.tipo,
    })),
  [partidas, meses, mesesConReal, mesaConReal])

  // ── Edición plan anual inline ──
  function handleEditPlanAnual(id: number, valor: string) {
    const n = parseFloat(valor) || 0
    setPartidas(prev => prev.map(p =>
      p.id === id
        ? { ...p, planAnual: n, planMensual: Array(12).fill(Math.round(n / 12)) }
        : p
    ))
  }

  function handleSave() {
    setEditandoPlan(null)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleAddPartida() {
    if (!nuevaCategoria.trim() || !nuevaImporte) return
    const anual = parseFloat(nuevaImporte) || 0
    const mensual = Math.round(anual / 12)
    setPartidas(prev => [...prev, {
      id: Date.now(),
      categoria: nuevaCategoria.trim(),
      tipo: nuevaTipo,
      planAnual: anual,
      planMensual: Array(12).fill(mensual),
      real: Array(12).fill(0),
    }])
    setNuevaCategoria('')
    setNuevaImporte('')
    setModalNueva(false)
  }

  function handleDelete(id: number) {
    setPartidas(prev => prev.filter(p => p.id !== id))
  }

  // ── Estilos ──
  const card: React.CSSProperties = {
    background: '#fff', borderRadius: 14, border: '1px solid #E8E8EC', padding: '20px 22px',
  }
  const th: React.CSSProperties = {
    fontSize: 9, fontWeight: 700, color: '#B0B7C3', textTransform: 'uppercase',
    letterSpacing: '0.1em', padding: '0 10px 10px', textAlign: 'right' as const,
  }
  const td: React.CSSProperties = {
    padding: '11px 10px', fontSize: 12, color: '#1a1a1a',
    textAlign: 'right' as const, verticalAlign: 'middle' as const,
  }

  function TablaPartidas({ tipo }: { tipo: TipoPartida }) {
    const arr = partidas.filter(p => p.tipo === tipo)
    const totalPlan = sumPlan(tipo === 'ingreso' ? ingresos : gastos)
    const totalReal = sumReal(tipo === 'ingreso' ? ingresos : gastos)
    const colorAcc  = tipo === 'ingreso' ? '#2DC653' : '#EF4444'

    return (
      <div style={{ marginBottom: 4 }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 0 8px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: colorAcc }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a' }}>
              {tipo === 'ingreso' ? 'Ingresos' : 'Gastos'}
            </span>
            <span style={{ fontSize: 11, color: '#B0B7C3' }}>{arr.length} categorías</span>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #ECEEF3' }}>
                <th style={{ ...th, textAlign: 'left', paddingLeft: 0, width: '30%' }}>Categoría</th>
                <th style={{ ...th, width: 130 }}>Plan anual</th>
                <th style={th}>Esperado {periodoActivo.label}</th>
                {mesaConReal && <th style={th}>Real {periodoActivo.label}</th>}
                <th style={th}>Desviación</th>
                <th style={{ ...th, textAlign: 'center' }}>Estado</th>
                <th style={{ width: 28 }} />
              </tr>
            </thead>
            <tbody>
              {arr.map(p => {
                const planPer  = sumPeriodo(p.planMensual, meses)
                const realPer  = mesaConReal ? sumPeriodo(p.real, mesesConReal) : 0
                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid #F4F5F7' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#FAFAFA')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ ...td, textAlign: 'left', paddingLeft: 0, fontWeight: 500 }}>
                      {p.categoria}
                    </td>
                    <td style={{ ...td, width: 130 }}>
                      {editandoPlan === p.id ? (
                        <input
                          type="number"
                          defaultValue={p.planAnual}
                          onChange={e => handleEditPlanAnual(p.id, e.target.value)}
                          style={{
                            width: 110, padding: '5px 8px', fontSize: 12,
                            border: '1px solid #4361EE', borderRadius: 7,
                            textAlign: 'right', fontFamily: 'Inter,sans-serif',
                            background: '#F9FAFB', outline: 'none',
                          }}
                        />
                      ) : (
                        <span
                          onClick={() => setEditandoPlan(p.id)}
                          title="Clic para editar"
                          style={{
                            cursor: 'pointer', padding: '4px 8px',
                            background: '#F4F5F7', borderRadius: 6,
                            fontSize: 12, color: '#555', fontWeight: 500,
                          }}
                        >
                          {fmt(p.planAnual)}
                        </span>
                      )}
                    </td>
                    <td style={{ ...td, color: '#888' }}>{fmt(planPer)}</td>
                    {mesaConReal && (
                      <td style={{ ...td, fontWeight: realPer > 0 ? 600 : 400, color: realPer > 0 ? '#1a1a1a' : '#B0B7C3' }}>
                        {realPer > 0 ? fmt(realPer) : '—'}
                      </td>
                    )}
                    <td style={td}>
                      {mesaConReal && realPer > 0
                        ? <DeltaBadge real={realPer} plan={planPer} tipo={tipo} />
                        : <span style={{ fontSize: 11, color: '#B0B7C3' }}>—</span>}
                    </td>
                    <td style={{ ...td, textAlign: 'center' }}>
                      {mesaConReal && <EstadoBadge real={realPer} plan={planPer} tipo={tipo} />}
                    </td>
                    <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                      <button
                        onClick={() => handleDelete(p.id)}
                        title="Eliminar"
                        style={{
                          border: 'none', background: 'transparent', cursor: 'pointer',
                          color: '#D0D3DE', fontSize: 13, padding: 4, borderRadius: 5,
                          display: 'flex', alignItems: 'center',
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#EF4444'; (e.currentTarget as HTMLButtonElement).style.background = '#FEF2F2' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#D0D3DE'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
                      >
                        <i className="ti ti-trash" aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: '1px solid #ECEEF3' }}>
                <td style={{ ...td, textAlign: 'left', paddingLeft: 0, fontWeight: 700 }}>
                  Total {tipo === 'ingreso' ? 'ingresos' : 'gastos'}
                </td>
                <td style={{ ...td, fontWeight: 700, color: '#888' }}>{fmt(tipo === 'ingreso' ? ingresosPlan : gastosPlan)}</td>
                <td style={{ ...td, color: '#888' }}>{fmt(totalPlan)}</td>
                {mesaConReal && (
                  <td style={{ ...td, fontWeight: 700, color: colorAcc }}>
                    {totalReal > 0 ? fmt(totalReal) : '—'}
                  </td>
                )}
                <td style={td}>
                  {mesaConReal && totalReal > 0 && (
                    <DeltaBadge real={totalReal} plan={totalPlan} tipo={tipo} />
                  )}
                </td>
                <td /><td />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <Layout title="Presupuesto">
      <style>{`
        @media (max-width: 900px) {
          .pres-hero-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 600px) {
          .pres-hero-grid { grid-template-columns: 1fr !important; }
          .pres-periodo-wrap { flex-wrap: wrap; }
        }
      `}</style>

      {/* ── Hero banner ── */}
      <div style={{ ...card, borderLeft: '3px solid #4361EE', borderRadius: '0 14px 14px 0', padding: '18px 22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#4361EE', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
              <i className="ti ti-target" style={{ fontSize: 11 }} aria-hidden="true" />
              Presupuesto 2026
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#1a1a1a', letterSpacing: '-0.4px', marginBottom: 4 }}>
              Plan anual vs ejecución
            </div>
            <div style={{ fontSize: 12, color: '#888' }}>
              {Math.round((MES_ACTUAL + 1) / 12 * 100)}% del año transcurrido · base para todas las desviaciones
            </div>
          </div>
          <button
            onClick={() => setModalNueva(true)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '9px 16px', fontSize: 13, fontWeight: 600,
              border: 'none', borderRadius: 9, background: '#4361EE',
              color: '#fff', cursor: 'pointer', fontFamily: 'Inter,sans-serif',
            }}
          >
            <i className="ti ti-plus" style={{ fontSize: 14 }} aria-hidden="true" />
            Nueva línea
          </button>
        </div>

        <div style={{ height: '1px', background: '#F0F0F4', margin: '16px 0' }} />

        {/* KPIs inline */}
        <div className="pres-hero-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
          {[
            { lbl: 'Ingreso plan / real', plan: ingresosPlan, real: ingresosReal, tipo: 'ingreso' as TipoPartida },
            { lbl: 'Gasto plan / real',   plan: gastosPlan,   real: gastosReal,   tipo: 'gasto'   as TipoPartida },
            { lbl: 'Utilidad neta YTD',   plan: utilPlan,     real: utilReal,     tipo: 'ingreso' as TipoPartida },
            { lbl: 'Alertas', plan: 0, real: 0, esAlertas: true },
          ].map((k, i) => (
            <div key={i}>
              <div style={{ fontSize: 9, fontWeight: 600, color: '#B0B7C3', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
                {k.lbl}
              </div>
              {(k as any).esAlertas ? (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 6, background: sobrePlan > 0 ? '#FEF2F2' : '#F4F5F7', color: sobrePlan > 0 ? '#b91c1c' : '#888' }}>
                    {sobrePlan} Sobre
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 6, background: bajoPlan > 0 ? '#FFF8E6' : '#F4F5F7', color: bajoPlan > 0 ? '#92400E' : '#888' }}>
                    {bajoPlan} Debajo
                  </span>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a', letterSpacing: '-0.4px' }}>
                      {fmtK(k.plan)}
                    </span>
                    {k.real > 0 && (
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#888' }}>
                        {fmtK(k.real)}
                      </span>
                    )}
                  </div>
                  {k.real > 0 && (
                    <div style={{ marginTop: 4 }}>
                      <DeltaBadge real={k.real} plan={k.plan} tipo={k.tipo!} />
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Filtro de periodo ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div className="pres-periodo-wrap" style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#fff', border: '1px solid #E8E8EC', borderRadius: 10, padding: '4px 5px' }}>
          {PERIODOS.map(p => {
            const active = periodo === p.key
            const tieneReal = p.meses.some(m => MESES_CON_REAL.includes(m))
            return (
              <button
                key={p.key}
                onClick={() => setPeriodo(p.key)}
                style={{
                  border: 'none', cursor: 'pointer', fontFamily: 'Inter,sans-serif',
                  fontSize: 12, padding: '6px 12px', borderRadius: 7,
                  background: active ? '#4361EE' : 'transparent',
                  color: active ? '#fff' : '#888',
                  fontWeight: active ? 600 : 400,
                  position: 'relative',
                  transition: 'background .12s, color .12s',
                }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = '#EEF1FD'; if (!active) (e.currentTarget as HTMLButtonElement).style.color = '#4361EE' }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; if (!active) (e.currentTarget as HTMLButtonElement).style.color = '#888' }}
              >
                {p.label}
                {tieneReal && (
                  <span style={{
                    position: 'absolute', bottom: 3, left: '50%', transform: 'translateX(-50%)',
                    width: 3, height: 3, borderRadius: '50%',
                    background: active ? 'rgba(255,255,255,.6)' : '#4361EE',
                  }} />
                )}
              </button>
            )
          })}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {editandoPlan !== null && (
            <button
              onClick={handleSave}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', fontSize: 12, fontWeight: 600,
                borderRadius: 8, border: 'none',
                background: saved ? '#2DC653' : '#4361EE',
                color: '#fff', cursor: 'pointer', fontFamily: 'Inter,sans-serif',
              }}
            >
              {saved ? '✓ Guardado' : 'Guardar cambios'}
            </button>
          )}
        </div>
      </div>

      {/* ── Gráfico de barras comparativo ── */}
      <div style={card}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: '#B0B7C3', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
            Desviación por categoría
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>
            Esperado {periodoActivo.label} vs Real {periodoActivo.label}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barGap={3} barCategoryGap="25%">
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F2" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#B0B7C3' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#B0B7C3' }} axisLine={false} tickLine={false} tickFormatter={v => fmtK(v)} width={52} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F4F5F7' }} />
            <Legend
              wrapperStyle={{ fontSize: 11, color: '#888', paddingTop: 12 }}
              formatter={(val) => <span style={{ color: '#888', fontSize: 11 }}>{val}</span>}
            />
            <Bar dataKey="Esperado" fill="#C7D2F8" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Real" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => {
                const planVal = entry['Esperado'] as number
                const realVal = entry['Real'] as number | undefined
                if (!realVal) return <Cell key={index} fill="#4361EE" fillOpacity={0.3} />
                const over = entry.tipo === 'gasto' ? realVal > planVal : realVal < planVal
                return <Cell key={index} fill={over ? '#EF4444' : '#4361EE'} />
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Tablas ── */}
      <div style={card}>
        <TablaPartidas tipo="ingreso" />
        <div style={{ height: '1px', background: '#ECEEF3', margin: '8px 0 16px' }} />
        <TablaPartidas tipo="gasto" />
      </div>

      {/* ── Modal nueva partida ── */}
      {modalNueva && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setModalNueva(false) }}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.22)',
            zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <div style={{
            background: '#fff', borderRadius: 16, padding: '26px 28px',
            width: 360, boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
          }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a', marginBottom: 20 }}>
              Nueva línea presupuestaria
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#555', marginBottom: 7 }}>Tipo</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['ingreso', 'gasto'] as TipoPartida[]).map(t => (
                  <button key={t} onClick={() => setNuevaTipo(t)} style={{
                    flex: 1, padding: '9px', fontSize: 12, borderRadius: 8,
                    fontFamily: 'Inter,sans-serif', cursor: 'pointer',
                    fontWeight: nuevaTipo === t ? 600 : 400,
                    border: nuevaTipo === t ? '2px solid #4361EE' : '1px solid #E8E8EC',
                    background: nuevaTipo === t ? '#EEF1FD' : '#fff',
                    color: nuevaTipo === t ? '#4361EE' : '#888',
                  }}>
                    {t === 'ingreso' ? 'Ingreso' : 'Gasto'}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#555', marginBottom: 7 }}>Categoría</label>
              <input
                type="text" value={nuevaCategoria}
                onChange={e => setNuevaCategoria(e.target.value)}
                placeholder="ej. Consultoría externa"
                style={{ width: '100%', padding: '10px 12px', fontSize: 13, border: '1px solid #E8E8EC', borderRadius: 9, outline: 'none', fontFamily: 'Inter,sans-serif', color: '#1a1a1a', boxSizing: 'border-box' }}
                onFocus={e => (e.target.style.borderColor = '#4361EE')}
                onBlur={e => (e.target.style.borderColor = '#E8E8EC')}
              />
            </div>

            <div style={{ marginBottom: 22 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#555', marginBottom: 7 }}>Plan anual (€)</label>
              <input
                type="number" value={nuevaImporte}
                onChange={e => setNuevaImporte(e.target.value)}
                placeholder="0" min="0"
                style={{ width: '100%', padding: '10px 12px', fontSize: 13, border: '1px solid #E8E8EC', borderRadius: 9, outline: 'none', fontFamily: 'Inter,sans-serif', color: '#1a1a1a', boxSizing: 'border-box' }}
                onFocus={e => (e.target.style.borderColor = '#4361EE')}
                onBlur={e => (e.target.style.borderColor = '#E8E8EC')}
              />
              <div style={{ fontSize: 11, color: '#B0B7C3', marginTop: 5 }}>
                Se distribuye automáticamente entre los 12 meses.
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setModalNueva(false)} style={{ flex: 1, padding: '10px', fontSize: 13, fontWeight: 500, border: '1px solid #E8E8EC', borderRadius: 9, background: '#F4F5F7', color: '#555', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
                Cancelar
              </button>
              <button
                onClick={handleAddPartida}
                disabled={!nuevaCategoria.trim() || !nuevaImporte}
                style={{ flex: 1, padding: '10px', fontSize: 13, fontWeight: 600, border: 'none', borderRadius: 9, background: !nuevaCategoria.trim() || !nuevaImporte ? '#C8CFDA' : '#4361EE', color: '#fff', cursor: !nuevaCategoria.trim() || !nuevaImporte ? 'not-allowed' : 'pointer', fontFamily: 'Inter,sans-serif' }}
              >
                Añadir
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
