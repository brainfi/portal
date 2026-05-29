import { useState, useMemo } from 'react'
import Layout from '@/components/Layout'
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts'

// ─── Tipos ───────────────────────────────────────────────────────────────────
type TipoPartida = 'ingreso' | 'gasto'
type FiltroPeriodo = 'dia' | 'mes' | 'anual'

interface Partida {
  id: number
  categoria: string
  tipo: TipoPartida
  planAnual: number
  planMensual: number[]
  real: number[]
  icono: string
  color: string
}

// ─── Constantes ───────────────────────────────────────────────────────────────
const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
const MES_ACTUAL = 4
const MESES_CON_REAL = [0,1,2,3,4]

const initialPartidas: Partida[] = [
  { id:1, categoria:'Ventas directas',       tipo:'ingreso', planAnual:840000, planMensual:[65000,65000,68000,70000,70200,72000,72000,68000,74000,76000,78000,80000], real:[63200,66800,74000,88000,68000,0,0,0,0,0,0,0], icono:'ti-trending-up',    color:'#4361EE' },
  { id:2, categoria:'Servicios recurrentes', tipo:'ingreso', planAnual:96000,  planMensual:[8000,8000,8000,8000,8000,8000,8000,8000,8000,8000,8000,8000],             real:[8100,8000,8200,8100,7900,0,0,0,0,0,0,0],   icono:'ti-refresh',        color:'#7B93FF' },
  { id:3, categoria:'Licencias',             tipo:'ingreso', planAnual:60000,  planMensual:[4000,4000,5000,5000,5500,5500,5500,5000,5000,5500,5500,5500],             real:[5200,5800,8100,9200,10200,0,0,0,0,0,0,0],  icono:'ti-file-certificate',color:'#60A5FA' },
  { id:4, categoria:'Nóminas y SS',          tipo:'gasto',   planAnual:196800, planMensual:[16400,16400,16400,16400,16400,16400,16400,16400,16400,16400,16400,16400], real:[16400,16400,16800,17200,18400,0,0,0,0,0,0,0], icono:'ti-users',           color:'#EF4444' },
  { id:5, categoria:'Alquiler oficina',      tipo:'gasto',   planAnual:25200,  planMensual:[2100,2100,2100,2100,2100,2100,2100,2100,2100,2100,2100,2100],             real:[2100,2100,2100,2100,2100,0,0,0,0,0,0,0],   icono:'ti-building',        color:'#F87171' },
  { id:6, categoria:'Marketing',             tipo:'gasto',   planAnual:36000,  planMensual:[3000,3000,3000,3000,3000,3000,3000,3000,3000,3000,3000,3000],             real:[2800,3100,3400,3900,4300,0,0,0,0,0,0,0],   icono:'ti-speakerphone',    color:'#FB923C' },
  { id:7, categoria:'Software',              tipo:'gasto',   planAnual:10800,  planMensual:[900,900,900,900,900,900,900,900,900,900,900,900],                         real:[740,740,740,740,740,0,0,0,0,0,0,0],        icono:'ti-device-laptop',   color:'#A78BFA' },
  { id:8, categoria:'Viajes y dietas',       tipo:'gasto',   planAnual:8400,   planMensual:[600,600,800,800,800,800,800,600,800,800,600,400],                         real:[520,480,610,650,520,0,0,0,0,0,0,0],        icono:'ti-plane',           color:'#34D399' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n: number) {
  return new Intl.NumberFormat('es-ES', { style:'currency', currency:'EUR', maximumFractionDigits:0 }).format(n)
}
function fmtK(n: number) {
  if (Math.abs(n) >= 1000000) return `${(n/1000000).toFixed(1)}M €`
  if (Math.abs(n) >= 1000) return `${(n/1000).toFixed(n % 1000 === 0 ? 0 : 1)}k €`
  return `${n} €`
}
function pct(real: number, plan: number) {
  if (!plan) return 0
  return Math.min(Math.round((real / plan) * 100), 100)
}
function delta(real: number, plan: number) {
  if (!plan || !real) return null
  return ((real - plan) / plan) * 100
}
function sumMeses(arr: number[], meses: number[]) {
  return meses.reduce((a, i) => a + (arr[i] ?? 0), 0)
}

// ─── Tooltip personalizado ────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'#fff', border:'1px solid #E8E8EC', borderRadius:10, padding:'12px 16px', fontSize:12, boxShadow:'0 4px 16px rgba(0,0,0,0.08)' }}>
      <div style={{ fontWeight:600, color:'#1a1a1a', marginBottom:8 }}>{label}</div>
      {payload.map((p: any) => p.value != null && (
        <div key={p.name} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
          <div style={{ width:8, height:8, borderRadius:2, background:p.fill || p.stroke }} />
          <span style={{ color:'#666', minWidth:70 }}>{p.name === 'Plan' ? 'Presupuesto' : 'Real/Forecast'}:</span>
          <span style={{ fontWeight:600, color:'#1a1a1a' }}>{fmtK(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function Presupuesto() {
  const [partidas, setPartidas] = useState<Partida[]>(initialPartidas)
  const [filtro, setFiltro] = useState<FiltroPeriodo>('mes')
  const [mesSeleccionado, setMesSeleccionado] = useState(MES_ACTUAL)
  const [modalNueva, setModalNueva] = useState(false)
  const [nuevaCategoria, setNuevaCategoria] = useState('')
  const [nuevaTipo, setNuevaTipo] = useState<TipoPartida>('gasto')
  const [nuevaImporte, setNuevaImporte] = useState('')

  // ── Meses activos según filtro ──
  const mesesActivos = useMemo(() => {
    if (filtro === 'dia' || filtro === 'mes') return [mesSeleccionado]
    return [0,1,2,3,4,5,6,7,8,9,10,11]
  }, [filtro, mesSeleccionado])

  const mesesConReal = mesesActivos.filter(m => MESES_CON_REAL.includes(m))
  const hayReal = mesesConReal.length > 0

  // ── Totales ──
  const ingresos = partidas.filter(p => p.tipo === 'ingreso')
  const gastos   = partidas.filter(p => p.tipo === 'gasto')

  const ingresosPlan = ingresos.reduce((a, p) => a + sumMeses(p.planMensual, mesesActivos), 0)
  const ingresosReal = ingresos.reduce((a, p) => a + sumMeses(p.real, mesesConReal), 0)
  const gastosPlan   = gastos.reduce((a, p) => a + sumMeses(p.planMensual, mesesActivos), 0)
  const gastosReal   = gastos.reduce((a, p) => a + sumMeses(p.real, mesesConReal), 0)
  const totalPlan    = ingresosPlan - gastosPlan
  const totalReal    = ingresosReal - gastosReal
  const usadoPct     = ingresosPlan > 0 ? Math.round((ingresosReal / ingresosPlan) * 100) : 0

  // ── Datos gráfico ──
  const chartData = useMemo(() => MESES.map((mes, m) => ({
    mes,
    Plan: partidas.reduce((a, p) => a + p.planMensual[m], 0),
    Real: MESES_CON_REAL.includes(m) ? partidas.reduce((a, p) => a + p.real[m], 0) : null,
    isCurrent: m === mesSeleccionado,
  })), [partidas, mesSeleccionado])

  function handleAddPartida() {
    if (!nuevaCategoria.trim() || !nuevaImporte) return
    const anual = parseFloat(nuevaImporte) || 0
    setPartidas(prev => [...prev, {
      id: Date.now(), categoria: nuevaCategoria.trim(), tipo: nuevaTipo,
      planAnual: anual, planMensual: Array(12).fill(Math.round(anual / 12)),
      real: Array(12).fill(0), icono: nuevaTipo === 'ingreso' ? 'ti-trending-up' : 'ti-receipt',
      color: nuevaTipo === 'ingreso' ? '#4361EE' : '#EF4444',
    }])
    setNuevaCategoria(''); setNuevaImporte(''); setModalNueva(false)
  }
  function handleDelete(id: number) {
    setPartidas(prev => prev.filter(p => p.id !== id))
  }

  const card: React.CSSProperties = { background:'#fff', borderRadius:14, border:'1px solid #E8E8EC' }

  const filtroBtns: { key: FiltroPeriodo; label: string }[] = [
    { key:'dia',   label:'Este día' },
    { key:'mes',   label:'Este mes' },
    { key:'anual', label:'Este año' },
  ]

  // ── Label del periodo activo ──
  const periodoLabel = filtro === 'anual' ? '2026' : MESES[mesSeleccionado]

  return (
    <Layout title="Presupuesto">
      <style>{`
        @media (max-width: 900px) { .pres-top3 { grid-template-columns: 1fr !important; } }
        @media (max-width: 768px) { .pres-breakdown { grid-template-columns: 1fr !important; } }
        .pres-filtro-btn { border:none; cursor:pointer; font-family:Inter,sans-serif; font-size:12px; padding:5px 12px; border-radius:6px; transition:background .12s,color .12s; }
        .pres-row:hover { background:#FAFAFA; }
      `}</style>

      {/* ── Fila 1: Budget Total + Ingresos + Gastos ── */}
      <div className="pres-top3" style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>

        {/* Budget Total */}
        <div style={{ ...card, padding:'20px 22px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
            <div style={{ fontSize:13, fontWeight:600, color:'#1a1a1a' }}>Presupuesto total</div>
            <div style={{ display:'flex', gap:2, background:'#F4F5F7', borderRadius:7, padding:3 }}>
              {filtroBtns.map(b => (
                <button key={b.key} className="pres-filtro-btn"
                  style={{ background: filtro === b.key ? '#fff' : 'transparent', color: filtro === b.key ? '#1a1a1a' : '#888', fontWeight: filtro === b.key ? 600 : 400, boxShadow: filtro === b.key ? '0 1px 4px rgba(0,0,0,0.08)' : 'none' }}
                  onClick={() => setFiltro(b.key)}>
                  {b.label}
                </button>
              ))}
            </div>
          </div>
          <div style={{ fontSize:30, fontWeight:700, color:'#1a1a1a', letterSpacing:'-0.5px', marginBottom:4 }}>
            {fmt(hayReal ? totalReal : totalPlan)}
          </div>
          <div style={{ fontSize:12, color:'#888', marginBottom:14 }}>
            presupuestado {fmt(totalPlan)}
          </div>
          {/* Barra de categorías */}
          <div style={{ display:'flex', height:8, borderRadius:99, overflow:'hidden', gap:2, marginBottom:8 }}>
            {partidas.filter(p => p.tipo === 'ingreso').map((p, i) => {
              const w = ingresosPlan > 0 ? (sumMeses(p.planMensual, mesesActivos) / ingresosPlan) * 100 : 0
              return <div key={i} style={{ width:`${w}%`, background:p.color, borderRadius:99 }} />
            })}
          </div>
          <div style={{ fontSize:11, color:'#888' }}>
            {usadoPct}% de ingresos ejecutado · {periodoLabel}
          </div>
        </div>

        {/* Ingresos */}
        <div style={{ ...card, padding:'20px 22px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:32, height:32, borderRadius:8, background:'#F0F9F4', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <i className="ti ti-arrow-up-right" style={{ fontSize:16, color:'#2DC653' }} aria-hidden="true" />
              </div>
              <span style={{ fontSize:13, fontWeight:600, color:'#1a1a1a' }}>Ingresos</span>
            </div>
            <button onClick={() => setModalNueva(true)} style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'6px 12px', fontSize:11, fontWeight:600, border:'none', borderRadius:7, background:'#4361EE', color:'#fff', cursor:'pointer', fontFamily:'Inter,sans-serif' }}>
              <i className="ti ti-plus" style={{ fontSize:12 }} aria-hidden="true" />
              Nueva línea
            </button>
          </div>
          <div style={{ fontSize:30, fontWeight:700, color:'#1a1a1a', letterSpacing:'-0.5px', marginBottom:4 }}>
            {fmt(hayReal ? ingresosReal : ingresosPlan)}
          </div>
          {hayReal && ingresosReal > 0 && (() => {
            const d = delta(ingresosReal, ingresosPlan)
            if (!d) return null
            const up = d >= 0
            return (
              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
                <span style={{ fontSize:12, fontWeight:600, color: up ? '#2DC653' : '#EF4444' }}>
                  {up ? '↑' : '↓'} {Math.abs(d).toFixed(1)}%
                </span>
                <span style={{ fontSize:12, color:'#888' }}>vs presupuesto</span>
              </div>
            )
          })()}
          <div style={{ fontSize:12, color:'#888' }}>{hayReal ? `+${fmt(ingresosReal - ingresosPlan)} vs plan` : `plan ${fmt(ingresosPlan)}`}</div>
        </div>

        {/* Gastos */}
        <div style={{ ...card, padding:'20px 22px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:32, height:32, borderRadius:8, background:'#FEF2F2', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <i className="ti ti-arrow-down-right" style={{ fontSize:16, color:'#EF4444' }} aria-hidden="true" />
              </div>
              <span style={{ fontSize:13, fontWeight:600, color:'#1a1a1a' }}>Gastos</span>
            </div>
          </div>
          <div style={{ fontSize:30, fontWeight:700, color:'#1a1a1a', letterSpacing:'-0.5px', marginBottom:4 }}>
            {fmt(hayReal ? gastosReal : gastosPlan)}
          </div>
          {hayReal && gastosReal > 0 && (() => {
            const d = delta(gastosReal, gastosPlan)
            if (!d) return null
            const over = d > 0
            return (
              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
                <span style={{ fontSize:12, fontWeight:600, color: over ? '#EF4444' : '#2DC653' }}>
                  {over ? '↑' : '↓'} {Math.abs(d).toFixed(1)}%
                </span>
                <span style={{ fontSize:12, color:'#888' }}>vs presupuesto</span>
              </div>
            )
          })()}
          <div style={{ fontSize:12, color:'#888' }}>{hayReal ? `${fmt(gastosReal - gastosPlan)} vs plan` : `plan ${fmt(gastosPlan)}`}</div>
        </div>
      </div>

      {/* ── Gráfico ── */}
      <div style={{ ...card, padding:'22px 24px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <div>
            <div style={{ fontSize:9, fontWeight:700, color:'#B0B7C3', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:4 }}>Flujo de presupuesto</div>
            <div style={{ fontSize:15, fontWeight:700, color:'#1a1a1a' }}>Budget Spending Flow</div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <div style={{ display:'flex', gap:3, background:'#F4F5F7', borderRadius:7, padding:3 }}>
              {filtroBtns.map(b => (
                <button key={b.key} className="pres-filtro-btn"
                  style={{ background: filtro === b.key ? '#fff' : 'transparent', color: filtro === b.key ? '#1a1a1a' : '#888', fontWeight: filtro === b.key ? 600 : 400, boxShadow: filtro === b.key ? '0 1px 4px rgba(0,0,0,0.08)' : 'none' }}
                  onClick={() => setFiltro(b.key)}>
                  {b.label}
                </button>
              ))}
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:4, background:'#F4F5F7', borderRadius:7, padding:'5px 10px', fontSize:12, color:'#888', fontWeight:500 }}>
              <i className="ti ti-calendar" style={{ fontSize:13 }} aria-hidden="true" />
              2026
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <ComposedChart data={chartData} margin={{ top:4, right:4, left:0, bottom:0 }} barCategoryGap="25%">
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F2" vertical={false} />
            <XAxis dataKey="mes" tick={{ fontSize:11, fill:'#B0B7C3' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize:11, fill:'#B0B7C3' }} axisLine={false} tickLine={false} tickFormatter={v => fmtK(v)} width={52} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill:'rgba(67,97,238,0.04)' }} />
            <Bar dataKey="Plan" radius={[4,4,0,0]} maxBarSize={36}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.isCurrent ? '#4361EE' : '#EEF1FD'} />
              ))}
            </Bar>
            <Bar dataKey="Real" radius={[4,4,0,0]} maxBarSize={36}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.Real != null ? (entry.isCurrent ? '#2DC653' : '#C7D2F8') : 'transparent'} />
              ))}
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
        {/* Leyenda */}
        <div style={{ display:'flex', gap:16, marginTop:8 }}>
          <div style={{ display:'flex', alignItems:'center', gap:5 }}>
            <div style={{ width:10, height:10, borderRadius:2, background:'#4361EE' }} />
            <span style={{ fontSize:11, color:'#888' }}>Presupuesto</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:5 }}>
            <div style={{ width:10, height:10, borderRadius:2, background:'#2DC653' }} />
            <span style={{ fontSize:11, color:'#888' }}>Real</span>
          </div>
        </div>
      </div>

      {/* ── Tabla desglose ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:12 }}>
        <div style={{ ...card, padding:'22px 24px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
            <div>
              <div style={{ fontSize:9, fontWeight:700, color:'#B0B7C3', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:4 }}>Desglose</div>
              <div style={{ fontSize:15, fontWeight:700, color:'#1a1a1a' }}>Budget Spending Breakdown</div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:4, background:'#F4F5F7', borderRadius:7, padding:'5px 10px', fontSize:12, color:'#888', fontWeight:500 }}>
              <i className="ti ti-calendar" style={{ fontSize:13 }} aria-hidden="true" />
              {periodoLabel}
            </div>
          </div>

          {/* Header */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 110px 110px 1fr 60px 40px', gap:8, padding:'0 0 10px', borderBottom:'1px solid #ECEEF3', fontSize:9, fontWeight:700, color:'#B0B7C3', textTransform:'uppercase', letterSpacing:'0.1em' }}>
            <span>Categoría</span>
            <span style={{ textAlign:'right' }}>Presupuestado</span>
            <span style={{ textAlign:'right' }}>Real</span>
            <span style={{ padding:'0 12px' }}>Progreso</span>
            <span style={{ textAlign:'right' }}>Usado</span>
            <span />
          </div>

          {/* Ingresos */}
          <div style={{ padding:'12px 0 6px', fontSize:10, fontWeight:700, color:'#4361EE', textTransform:'uppercase', letterSpacing:'0.1em' }}>
            Ingresos
          </div>
          {ingresos.map(p => {
            const planPer = sumMeses(p.planMensual, mesesActivos)
            const realPer = sumMeses(p.real, mesesConReal)
            const usoPct  = pct(realPer, planPer)
            const over    = realPer > planPer && realPer > 0
            return (
              <div key={p.id} className="pres-row" style={{ display:'grid', gridTemplateColumns:'1fr 110px 110px 1fr 60px 40px', gap:8, padding:'11px 0', borderBottom:'1px solid #F4F5F7', alignItems:'center' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:28, height:28, borderRadius:7, background:`${p.color}18`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <i className={`ti ${p.icono}`} style={{ fontSize:13, color:p.color }} aria-hidden="true" />
                  </div>
                  <span style={{ fontSize:12, fontWeight:500, color:'#1a1a1a' }}>{p.categoria}</span>
                </div>
                <span style={{ fontSize:12, color:'#888', textAlign:'right' }}>{fmt(planPer)}</span>
                <span style={{ fontSize:12, fontWeight:600, color: realPer > 0 ? '#1a1a1a' : '#B0B7C3', textAlign:'right' }}>
                  {realPer > 0 ? fmt(realPer) : '—'}
                </span>
                <div style={{ padding:'0 12px' }}>
                  <div style={{ height:6, background:'#EEF1FD', borderRadius:99, overflow:'hidden' }}>
                    <div style={{ width:`${usoPct}%`, height:'100%', background: over ? '#2DC653' : '#4361EE', borderRadius:99, transition:'width .3s' }} />
                  </div>
                </div>
                <span style={{ fontSize:12, fontWeight:600, color: over ? '#2DC653' : '#4361EE', textAlign:'right' }}>
                  {realPer > 0 ? `${usoPct}%` : '—'}
                </span>
                <button onClick={() => handleDelete(p.id)} style={{ border:'none', background:'transparent', cursor:'pointer', color:'#D0D3DE', fontSize:13, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:5, padding:4 }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color='#EF4444'; (e.currentTarget as HTMLButtonElement).style.background='#FEF2F2' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color='#D0D3DE'; (e.currentTarget as HTMLButtonElement).style.background='transparent' }}>
                  <i className="ti ti-dots-vertical" aria-hidden="true" />
                </button>
              </div>
            )
          })}

          {/* Gastos */}
          <div style={{ padding:'16px 0 6px', fontSize:10, fontWeight:700, color:'#EF4444', textTransform:'uppercase', letterSpacing:'0.1em' }}>
            Gastos
          </div>
          {gastos.map(p => {
            const planPer = sumMeses(p.planMensual, mesesActivos)
            const realPer = sumMeses(p.real, mesesConReal)
            const usoPct  = pct(realPer, planPer)
            const over    = realPer > planPer && realPer > 0
            return (
              <div key={p.id} className="pres-row" style={{ display:'grid', gridTemplateColumns:'1fr 110px 110px 1fr 60px 40px', gap:8, padding:'11px 0', borderBottom:'1px solid #F4F5F7', alignItems:'center' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:28, height:28, borderRadius:7, background:`${p.color}18`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <i className={`ti ${p.icono}`} style={{ fontSize:13, color:p.color }} aria-hidden="true" />
                  </div>
                  <span style={{ fontSize:12, fontWeight:500, color:'#1a1a1a' }}>{p.categoria}</span>
                </div>
                <span style={{ fontSize:12, color:'#888', textAlign:'right' }}>{fmt(planPer)}</span>
                <span style={{ fontSize:12, fontWeight:600, color: realPer > 0 ? '#1a1a1a' : '#B0B7C3', textAlign:'right' }}>
                  {realPer > 0 ? fmt(realPer) : '—'}
                </span>
                <div style={{ padding:'0 12px' }}>
                  <div style={{ height:6, background:'#FEF2F2', borderRadius:99, overflow:'hidden' }}>
                    <div style={{ width:`${usoPct}%`, height:'100%', background: over ? '#EF4444' : '#F87171', borderRadius:99, transition:'width .3s' }} />
                  </div>
                </div>
                <span style={{ fontSize:12, fontWeight:600, color: over ? '#EF4444' : '#F87171', textAlign:'right' }}>
                  {realPer > 0 ? `${usoPct}%` : '—'}
                </span>
                <button onClick={() => handleDelete(p.id)} style={{ border:'none', background:'transparent', cursor:'pointer', color:'#D0D3DE', fontSize:13, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:5, padding:4 }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color='#EF4444'; (e.currentTarget as HTMLButtonElement).style.background='#FEF2F2' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color='#D0D3DE'; (e.currentTarget as HTMLButtonElement).style.background='transparent' }}>
                  <i className="ti ti-dots-vertical" aria-hidden="true" />
                </button>
              </div>
            )
          })}

          {/* Footer totales */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 110px 110px 1fr 60px 40px', gap:8, padding:'12px 0 0', borderTop:'1px solid #ECEEF3', marginTop:4 }}>
            <span style={{ fontSize:12, fontWeight:700, color:'#1a1a1a' }}>Total neto</span>
            <span style={{ fontSize:12, fontWeight:700, color:'#888', textAlign:'right' }}>{fmt(ingresosPlan - gastosPlan)}</span>
            <span style={{ fontSize:12, fontWeight:700, color: totalReal >= 0 ? '#2DC653' : '#EF4444', textAlign:'right' }}>
              {hayReal ? fmt(totalReal) : '—'}
            </span>
            <div />
            <span style={{ fontSize:12, fontWeight:700, color:'#4361EE', textAlign:'right' }}>
              {hayReal && ingresosPlan > 0 ? `${usadoPct}%` : '—'}
            </span>
            <span />
          </div>
        </div>
      </div>

      {/* ── Modal nueva partida ── */}
      {modalNueva && (
        <div onClick={e => { if (e.target === e.currentTarget) setModalNueva(false) }}
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.22)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ background:'#fff', borderRadius:16, padding:'26px 28px', width:360, boxShadow:'0 8px 40px rgba(0,0,0,0.12)' }}>
            <div style={{ fontSize:15, fontWeight:700, color:'#1a1a1a', marginBottom:20 }}>Nueva línea presupuestaria</div>
            <div style={{ marginBottom:14 }}>
              <label style={{ display:'block', fontSize:12, fontWeight:500, color:'#555', marginBottom:7 }}>Tipo</label>
              <div style={{ display:'flex', gap:8 }}>
                {(['ingreso','gasto'] as TipoPartida[]).map(t => (
                  <button key={t} onClick={() => setNuevaTipo(t)} style={{ flex:1, padding:'9px', fontSize:12, borderRadius:8, fontFamily:'Inter,sans-serif', cursor:'pointer', fontWeight:nuevaTipo === t ? 600 : 400, border:nuevaTipo === t ? '2px solid #4361EE' : '1px solid #E8E8EC', background:nuevaTipo === t ? '#EEF1FD' : '#fff', color:nuevaTipo === t ? '#4361EE' : '#888' }}>
                    {t === 'ingreso' ? 'Ingreso' : 'Gasto'}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={{ display:'block', fontSize:12, fontWeight:500, color:'#555', marginBottom:7 }}>Categoría</label>
              <input type="text" value={nuevaCategoria} onChange={e => setNuevaCategoria(e.target.value)} placeholder="ej. Consultoría externa"
                style={{ width:'100%', padding:'10px 12px', fontSize:13, border:'1px solid #E8E8EC', borderRadius:9, outline:'none', fontFamily:'Inter,sans-serif', color:'#1a1a1a', boxSizing:'border-box' }}
                onFocus={e => (e.target.style.borderColor = '#4361EE')} onBlur={e => (e.target.style.borderColor = '#E8E8EC')} />
            </div>
            <div style={{ marginBottom:22 }}>
              <label style={{ display:'block', fontSize:12, fontWeight:500, color:'#555', marginBottom:7 }}>Plan anual (€)</label>
              <input type="number" value={nuevaImporte} onChange={e => setNuevaImporte(e.target.value)} placeholder="0" min="0"
                style={{ width:'100%', padding:'10px 12px', fontSize:13, border:'1px solid #E8E8EC', borderRadius:9, outline:'none', fontFamily:'Inter,sans-serif', color:'#1a1a1a', boxSizing:'border-box' }}
                onFocus={e => (e.target.style.borderColor = '#4361EE')} onBlur={e => (e.target.style.borderColor = '#E8E8EC')} />
              <div style={{ fontSize:11, color:'#B0B7C3', marginTop:5 }}>Se distribuye automáticamente entre los 12 meses.</div>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={() => setModalNueva(false)} style={{ flex:1, padding:'10px', fontSize:13, fontWeight:500, border:'1px solid #E8E8EC', borderRadius:9, background:'#F4F5F7', color:'#555', cursor:'pointer', fontFamily:'Inter,sans-serif' }}>Cancelar</button>
              <button onClick={handleAddPartida} disabled={!nuevaCategoria.trim() || !nuevaImporte}
                style={{ flex:1, padding:'10px', fontSize:13, fontWeight:600, border:'none', borderRadius:9, background:!nuevaCategoria.trim() || !nuevaImporte ? '#C8CFDA' : '#4361EE', color:'#fff', cursor:!nuevaCategoria.trim() || !nuevaImporte ? 'not-allowed' : 'pointer', fontFamily:'Inter,sans-serif' }}>
                Añadir
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
