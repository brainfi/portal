import { useState, useMemo } from 'react'
import Layout from '@/components/Layout'
import {
  ComposedChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts'

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

const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
const MES_ACTUAL = 4
const MESES_CON_REAL = [0,1,2,3,4]

const initialPartidas: Partida[] = [
  { id:1, categoria:'Ventas directas',       tipo:'ingreso', planAnual:840000, planMensual:[65000,65000,68000,70000,70200,72000,72000,68000,74000,76000,78000,80000], real:[63200,66800,74000,88000,68000,0,0,0,0,0,0,0], icono:'ti-trending-up',      color:'#4361EE' },
  { id:2, categoria:'Servicios recurrentes', tipo:'ingreso', planAnual:96000,  planMensual:[8000,8000,8000,8000,8000,8000,8000,8000,8000,8000,8000,8000],             real:[8100,8000,8200,8100,7900,0,0,0,0,0,0,0],   icono:'ti-refresh',          color:'#7B93FF' },
  { id:3, categoria:'Licencias',             tipo:'ingreso', planAnual:60000,  planMensual:[4000,4000,5000,5000,5500,5500,5500,5000,5000,5500,5500,5500],             real:[5200,5800,8100,9200,10200,0,0,0,0,0,0,0],  icono:'ti-file-certificate',  color:'#60A5FA' },
  { id:4, categoria:'Nóminas y SS',          tipo:'gasto',   planAnual:196800, planMensual:[16400,16400,16400,16400,16400,16400,16400,16400,16400,16400,16400,16400], real:[16400,16400,16800,17200,18400,0,0,0,0,0,0,0], icono:'ti-users',             color:'#EF4444' },
  { id:5, categoria:'Alquiler oficina',      tipo:'gasto',   planAnual:25200,  planMensual:[2100,2100,2100,2100,2100,2100,2100,2100,2100,2100,2100,2100],             real:[2100,2100,2100,2100,2100,0,0,0,0,0,0,0],   icono:'ti-building',          color:'#F87171' },
  { id:6, categoria:'Marketing',             tipo:'gasto',   planAnual:36000,  planMensual:[3000,3000,3000,3000,3000,3000,3000,3000,3000,3000,3000,3000],             real:[2800,3100,3400,3900,4300,0,0,0,0,0,0,0],   icono:'ti-speakerphone',      color:'#FB923C' },
  { id:7, categoria:'Software',              tipo:'gasto',   planAnual:10800,  planMensual:[900,900,900,900,900,900,900,900,900,900,900,900],                         real:[740,740,740,740,740,0,0,0,0,0,0,0],        icono:'ti-device-laptop',     color:'#A78BFA' },
  { id:8, categoria:'Viajes y dietas',       tipo:'gasto',   planAnual:8400,   planMensual:[600,600,800,800,800,800,800,600,800,800,600,400],                         real:[520,480,610,650,520,0,0,0,0,0,0,0],        icono:'ti-plane',             color:'#34D399' },
]

function fmt(n: number) {
  return new Intl.NumberFormat('es-ES', { style:'currency', currency:'EUR', maximumFractionDigits:0 }).format(n)
}
function fmtK(n: number) {
  if (Math.abs(n) >= 1000000) return `${(n/1000000).toFixed(1)}M €`
  if (Math.abs(n) >= 1000) return `${(n/1000).toFixed(Math.abs(n)%1000===0?0:1)}k €`
  return `${n} €`
}
function calcDelta(real: number, plan: number): number | null {
  if (!plan || !real) return null
  return ((real - plan) / plan) * 100
}
function sumMeses(arr: number[], meses: number[]) {
  return meses.reduce((a, i) => a + (arr[i] ?? 0), 0)
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'#fff', border:'1px solid #E8E8EC', borderRadius:10, padding:'12px 16px', fontSize:12, boxShadow:'0 4px 16px rgba(0,0,0,0.08)' }}>
      <div style={{ fontWeight:600, color:'#1a1a1a', marginBottom:8 }}>{label}</div>
      {payload.map((p: any) => p.value != null && (
        <div key={p.name} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
          <div style={{ width:8, height:8, borderRadius:2, background:p.fill }} />
          <span style={{ color:'#666', minWidth:90 }}>{p.name === 'Plan' ? 'Presupuesto' : 'Real'}:</span>
          <span style={{ fontWeight:600, color:'#1a1a1a' }}>{fmtK(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

function DeltaBadge({ real, plan, tipo }: { real: number; plan: number; tipo: TipoPartida }) {
  const d = calcDelta(real, plan)
  if (d === null) return <span style={{ fontSize:11, color:'#B0B7C3' }}>—</span>
  const isGood = tipo === 'ingreso' ? d >= 0 : d <= 0
  const neutral = Math.abs(d) < 3
  return (
    <span style={{ fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:99, whiteSpace:'nowrap',
      background: neutral ? '#F4F5F7' : isGood ? '#EAFAF0' : '#FEF2F2',
      color: neutral ? '#888' : isGood ? '#1a7a3a' : '#b91c1c' }}>
      {d > 0 ? '+' : ''}{d.toFixed(1)}%
    </span>
  )
}

export default function Presupuesto() {
  const [partidas, setPartidas] = useState<Partida[]>(initialPartidas)
  const [filtro, setFiltro] = useState<FiltroPeriodo>('mes')
  const [editandoPlan, setEditandoPlan] = useState<number | null>(null)
  const [saved, setSaved] = useState(false)
  const [modalNueva, setModalNueva] = useState(false)
  const [nuevaCategoria, setNuevaCategoria] = useState('')
  const [nuevaTipo, setNuevaTipo] = useState<TipoPartida>('gasto')
  const [nuevaImporte, setNuevaImporte] = useState('')

  const mesesActivos = useMemo(() => {
    if (filtro === 'dia' || filtro === 'mes') return [MES_ACTUAL]
    return [0,1,2,3,4,5,6,7,8,9,10,11]
  }, [filtro])

  const mesesConReal = mesesActivos.filter(m => MESES_CON_REAL.includes(m))
  const hayReal = mesesConReal.length > 0

  const ingresos = partidas.filter(p => p.tipo === 'ingreso')
  const gastos   = partidas.filter(p => p.tipo === 'gasto')

  const ingresosPlan = ingresos.reduce((a, p) => a + sumMeses(p.planMensual, mesesActivos), 0)
  const ingresosReal = ingresos.reduce((a, p) => a + sumMeses(p.real, mesesConReal), 0)
  const gastosPlan   = gastos.reduce((a, p) => a + sumMeses(p.planMensual, mesesActivos), 0)
  const gastosReal   = gastos.reduce((a, p) => a + sumMeses(p.real, mesesConReal), 0)
  const utilPlan     = ingresosPlan - gastosPlan
  const utilReal     = ingresosReal - gastosReal

  const periodoLabel = filtro === 'anual' ? '2026' : MESES[MES_ACTUAL]

  const chartData = useMemo(() => MESES.map((mes, m) => ({
    mes,
    Plan: partidas.reduce((a, p) => a + p.planMensual[m], 0),
    Real: MESES_CON_REAL.includes(m) ? partidas.reduce((a, p) => a + p.real[m], 0) : null,
    isCurrent: m === MES_ACTUAL,
  })), [partidas])

  function handleEditPlanAnual(id: number, valor: string) {
    const n = parseFloat(valor) || 0
    setPartidas(prev => prev.map(p => p.id === id
      ? { ...p, planAnual: n, planMensual: Array(12).fill(Math.round(n/12)) } : p))
  }
  function handleSave() {
    setEditandoPlan(null); setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }
  function handleAddPartida() {
    if (!nuevaCategoria.trim() || !nuevaImporte) return
    const anual = parseFloat(nuevaImporte) || 0
    setPartidas(prev => [...prev, {
      id: Date.now(), categoria: nuevaCategoria.trim(), tipo: nuevaTipo,
      planAnual: anual, planMensual: Array(12).fill(Math.round(anual/12)),
      real: Array(12).fill(0),
      icono: nuevaTipo === 'ingreso' ? 'ti-trending-up' : 'ti-receipt',
      color: nuevaTipo === 'ingreso' ? '#4361EE' : '#EF4444',
    }])
    setNuevaCategoria(''); setNuevaImporte(''); setModalNueva(false)
  }
  function handleDelete(id: number) {
    setPartidas(prev => prev.filter(p => p.id !== id))
  }

  const card: React.CSSProperties = { background:'#fff', borderRadius:14, border:'1px solid #E8E8EC' }
  const th: React.CSSProperties = { fontSize:9, fontWeight:700, color:'#B0B7C3', textTransform:'uppercase', letterSpacing:'0.1em', padding:'0 10px 10px', textAlign:'right' as const }
  const td: React.CSSProperties = { padding:'11px 10px', fontSize:12, color:'#1a1a1a', textAlign:'right' as const, verticalAlign:'middle' as const }

  const filtroBtns: { key: FiltroPeriodo; label: string }[] = [
    { key:'dia',   label:'Este día' },
    { key:'mes',   label:'Este mes' },
    { key:'anual', label:'Este año' },
  ]

  function TablaPartidas({ tipo }: { tipo: TipoPartida }) {
    const arr = partidas.filter(p => p.tipo === tipo)
    const totalPlan = arr.reduce((a, p) => a + sumMeses(p.planMensual, mesesActivos), 0)
    const totalReal = arr.reduce((a, p) => a + sumMeses(p.real, mesesConReal), 0)
    const colorAcc  = tipo === 'ingreso' ? '#2DC653' : '#EF4444'
    const planAnualTotal = arr.reduce((a, p) => a + p.planAnual, 0)

    return (
      <div>
        <div style={{ display:'flex', alignItems:'center', gap:8, padding:'4px 0 10px' }}>
          <span style={{ fontSize:13, fontWeight:700, color:'#1a1a1a' }}>{tipo === 'ingreso' ? 'Ingresos' : 'Gastos'}</span>
          <span style={{ fontSize:11, color:'#B0B7C3' }}>{arr.length} categorías</span>
        </div>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', minWidth:620 }}>
            <thead>
              <tr style={{ borderBottom:'1px solid #ECEEF3' }}>
                <th style={{ ...th, textAlign:'left' as const, paddingLeft:0, width:'30%' }}>Categoría</th>
                <th style={{ ...th, width:130 }}>Plan anual</th>
                <th style={th}>Esperado {periodoLabel}</th>
                {hayReal && <th style={th}>Real {periodoLabel}</th>}
                <th style={th}>Desviación %</th>
                {hayReal && <th style={th}>Δ importe</th>}
                <th style={{ width:28 }} />
              </tr>
            </thead>
            <tbody>
              {arr.map(p => {
                const planPer = sumMeses(p.planMensual, mesesActivos)
                const realPer = sumMeses(p.real, mesesConReal)
                const diff    = realPer - planPer
                return (
                  <tr key={p.id} style={{ borderBottom:'1px solid #F4F5F7' }}
                    onMouseEnter={e => (e.currentTarget.style.background='#FAFAFA')}
                    onMouseLeave={e => (e.currentTarget.style.background='transparent')}>
                    <td style={{ ...td, textAlign:'left' as const, paddingLeft:0 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <div style={{ width:26, height:26, borderRadius:6, background:`${p.color}18`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                          <i className={`ti ${p.icono}`} style={{ fontSize:12, color:p.color }} aria-hidden="true" />
                        </div>
                        <span style={{ fontWeight:500 }}>{p.categoria}</span>
                      </div>
                    </td>
                    <td style={{ ...td, width:130 }}>
                      {editandoPlan === p.id ? (
                        <input type="number" defaultValue={p.planAnual}
                          onChange={e => handleEditPlanAnual(p.id, e.target.value)}
                          style={{ width:110, padding:'5px 8px', fontSize:12, border:'1px solid #4361EE', borderRadius:7, textAlign:'right', fontFamily:'Inter,sans-serif', background:'#F9FAFB', outline:'none' }} />
                      ) : (
                        <span onClick={() => setEditandoPlan(p.id)} title="Clic para editar"
                          style={{ cursor:'pointer', padding:'4px 8px', background:'#F4F5F7', borderRadius:6, fontSize:12, color:'#555', fontWeight:500 }}>
                          {fmt(p.planAnual)}
                        </span>
                      )}
                    </td>
                    <td style={{ ...td, color:'#888' }}>{fmt(planPer)}</td>
                    {hayReal && (
                      <td style={{ ...td, fontWeight:realPer>0?600:400, color:realPer>0?'#1a1a1a':'#B0B7C3' }}>
                        {realPer > 0 ? fmt(realPer) : '—'}
                      </td>
                    )}
                    <td style={td}>
                      {hayReal && realPer > 0
                        ? <DeltaBadge real={realPer} plan={planPer} tipo={tipo} />
                        : <span style={{ fontSize:11, color:'#B0B7C3' }}>—</span>}
                    </td>
                    {hayReal && (
                      <td style={{ ...td, fontWeight:600, color: tipo==='ingreso' ? (diff>=0?'#1a7a3a':'#b91c1c') : (diff<=0?'#1a7a3a':'#b91c1c') }}>
                        {realPer > 0 ? (diff>=0?'+':'') + fmt(diff) : '—'}
                      </td>
                    )}
                    <td style={{ textAlign:'center', verticalAlign:'middle' }}>
                      <button onClick={() => handleDelete(p.id)}
                        style={{ border:'none', background:'transparent', cursor:'pointer', color:'#D0D3DE', fontSize:13, padding:4, borderRadius:5, display:'flex', alignItems:'center' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color='#EF4444'; (e.currentTarget as HTMLButtonElement).style.background='#FEF2F2' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color='#D0D3DE'; (e.currentTarget as HTMLButtonElement).style.background='transparent' }}>
                        <i className="ti ti-trash" aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr style={{ borderTop:'1px solid #ECEEF3' }}>
                <td style={{ ...td, textAlign:'left' as const, paddingLeft:0, fontWeight:700 }}>
                  Total {tipo === 'ingreso' ? 'ingresos' : 'gastos'}
                </td>
                <td style={{ ...td, fontWeight:700, color:'#888' }}>{fmt(planAnualTotal)}</td>
                <td style={{ ...td, color:'#888' }}>{fmt(totalPlan)}</td>
                {hayReal && <td style={{ ...td, fontWeight:700, color:colorAcc }}>{totalReal>0?fmt(totalReal):'—'}</td>}
                <td style={td}>
                  {hayReal && totalReal > 0 && <DeltaBadge real={totalReal} plan={totalPlan} tipo={tipo} />}
                </td>
                {hayReal && (
                  <td style={{ ...td, fontWeight:700, color: tipo==='ingreso'?(totalReal-totalPlan>=0?'#1a7a3a':'#b91c1c'):(totalReal-totalPlan<=0?'#1a7a3a':'#b91c1c') }}>
                    {totalReal > 0 ? (totalReal-totalPlan>=0?'+':'') + fmt(totalReal-totalPlan) : '—'}
                  </td>
                )}
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    )
  }

  return (
    <Layout title="Presupuesto">
      <style>{`
        @media (max-width: 900px) { .pres-kgrid { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 600px) { .pres-kgrid { grid-template-columns: 1fr !important; } }
        .pres-filtro-btn { border:none; cursor:pointer; font-family:Inter,sans-serif; font-size:12px; padding:5px 12px; border-radius:6px; transition:background .12s,color .12s; }
      `}</style>

      {/* ── Encabezado estilo Cazura ── */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
        <div>
          <div style={{ fontSize:22, fontWeight:700, color:'#1a1a1a', letterSpacing:'-0.4px', marginBottom:3 }}>Presupuesto</div>
          <div style={{ fontSize:12, color:'#888' }}>Controla y optimiza tu planificación financiera</div>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
          <div style={{ display:'flex', gap:2, background:'#fff', border:'1px solid #E8E8EC', borderRadius:8, padding:3 }}>
            {filtroBtns.map(b => (
              <button key={b.key} className="pres-filtro-btn"
                style={{ background: filtro===b.key ? '#4361EE' : 'transparent', color: filtro===b.key ? '#fff' : '#888', fontWeight: filtro===b.key ? 600 : 400 }}
                onClick={() => setFiltro(b.key)}>
                {b.label}
              </button>
            ))}
          </div>
          <button style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'8px 14px', fontSize:12, fontWeight:500, border:'1px solid #E8E8EC', borderRadius:8, background:'#fff', color:'#555', cursor:'pointer', fontFamily:'Inter,sans-serif' }}>
            <i className="ti ti-download" style={{ fontSize:13 }} aria-hidden="true" />
            Exportar
          </button>
          {editandoPlan !== null && (
            <button onClick={handleSave} style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'8px 14px', fontSize:12, fontWeight:600, border:'none', borderRadius:8, background:saved?'#2DC653':'#4361EE', color:'#fff', cursor:'pointer', fontFamily:'Inter,sans-serif' }}>
              {saved ? '✓ Guardado' : 'Guardar cambios'}
            </button>
          )}
          <button onClick={() => setModalNueva(true)} style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'8px 14px', fontSize:12, fontWeight:600, border:'none', borderRadius:8, background:'#4361EE', color:'#fff', cursor:'pointer', fontFamily:'Inter,sans-serif' }}>
            <i className="ti ti-plus" style={{ fontSize:13 }} aria-hidden="true" />
            Nueva línea
          </button>
        </div>
      </div>

      {/* ── KPI cards ── */}
      <div className="pres-kgrid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
        {[
          { lbl:'Presupuesto total', val:hayReal?fmt(utilReal):fmt(utilPlan), real:utilReal,     plan:utilPlan,     tipo:'ingreso' as TipoPartida, sub:`presupuestado ${fmt(utilPlan)}`,   iconBg:'#EEF1FD', iconColor:'#4361EE', icon:'ti-chart-pie' },
          { lbl:'Ingresos',         val:hayReal?fmt(ingresosReal):fmt(ingresosPlan), real:ingresosReal, plan:ingresosPlan, tipo:'ingreso' as TipoPartida, sub:`plan ${fmt(ingresosPlan)}`, iconBg:'#F0F9F4', iconColor:'#2DC653', icon:'ti-arrow-up-right' },
          { lbl:'Gastos',           val:hayReal?fmt(gastosReal):fmt(gastosPlan),     real:gastosReal,   plan:gastosPlan,   tipo:'gasto'   as TipoPartida, sub:`plan ${fmt(gastosPlan)}`,   iconBg:'#FEF2F2', iconColor:'#EF4444', icon:'ti-arrow-down-right' },
        ].map((k, i) => (
          <div key={i} style={{ ...card, padding:'20px 22px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
              <div style={{ fontSize:9, fontWeight:600, color:'#B0B7C3', textTransform:'uppercase', letterSpacing:'0.12em' }}>{k.lbl}</div>
              <div style={{ width:32, height:32, borderRadius:8, background:k.iconBg, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <i className={`ti ${k.icon}`} style={{ fontSize:16, color:k.iconColor }} aria-hidden="true" />
              </div>
            </div>
            <div style={{ fontSize:28, fontWeight:400, color:'#1a1a1a', letterSpacing:'-0.5px', marginBottom:8 }}>{k.val}</div>
            <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
              {hayReal && k.real > 0 && <DeltaBadge real={k.real} plan={k.plan} tipo={k.tipo} />}
              <span style={{ fontSize:11, color:'#B0B7C3' }}>{k.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Gráfico ── */}
      <div style={{ ...card, padding:'22px 24px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <div style={{ fontSize:9, fontWeight:700, color:'#B0B7C3', textTransform:'uppercase', letterSpacing:'0.1em' }}>
            Evolución mensual · {periodoLabel}
          </div>
          <div style={{ display:'flex', gap:14, alignItems:'center' }}>
            <div style={{ display:'flex', alignItems:'center', gap:5 }}>
              <div style={{ width:10, height:10, borderRadius:2, background:'#EEF1FD', border:'1px solid #C7D2F8' }} />
              <span style={{ fontSize:11, color:'#888' }}>Presupuesto</span>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:5 }}>
              <div style={{ width:10, height:10, borderRadius:2, background:'#7DD3FC' }} />
              <span style={{ fontSize:11, color:'#888' }}>Real</span>
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <ComposedChart data={chartData} margin={{ top:4, right:4, left:0, bottom:0 }} barCategoryGap="25%">
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F2" vertical={false} />
            <XAxis dataKey="mes" tick={{ fontSize:11, fill:'#B0B7C3' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize:11, fill:'#B0B7C3' }} axisLine={false} tickLine={false} tickFormatter={v => fmtK(v)} width={52} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill:'rgba(67,97,238,0.04)' }} />
            <Bar dataKey="Plan" radius={[4,4,0,0]} maxBarSize={36}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.isCurrent ? '#C7D2F8' : '#EEF1FD'} />
              ))}
            </Bar>
            <Bar dataKey="Real" radius={[4,4,0,0]} maxBarSize={36}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.Real!=null ? (entry.isCurrent ? '#4361EE' : '#7DD3FC') : 'transparent'} />
              ))}
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* ── Tablas ── */}
      <div style={{ ...card, padding:'22px 24px' }}>
        <TablaPartidas tipo="ingreso" />
        <div style={{ height:'1px', background:'#ECEEF3', margin:'12px 0 16px' }} />
        <TablaPartidas tipo="gasto" />
      </div>

      {/* ── Modal ── */}
      {modalNueva && (
        <div onClick={e => { if (e.target===e.currentTarget) setModalNueva(false) }}
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.22)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ background:'#fff', borderRadius:16, padding:'26px 28px', width:360, boxShadow:'0 8px 40px rgba(0,0,0,0.12)' }}>
            <div style={{ fontSize:15, fontWeight:700, color:'#1a1a1a', marginBottom:20 }}>Nueva línea presupuestaria</div>
            <div style={{ marginBottom:14 }}>
              <label style={{ display:'block', fontSize:12, fontWeight:500, color:'#555', marginBottom:7 }}>Tipo</label>
              <div style={{ display:'flex', gap:8 }}>
                {(['ingreso','gasto'] as TipoPartida[]).map(t => (
                  <button key={t} onClick={() => setNuevaTipo(t)} style={{ flex:1, padding:'9px', fontSize:12, borderRadius:8, fontFamily:'Inter,sans-serif', cursor:'pointer', fontWeight:nuevaTipo===t?600:400, border:nuevaTipo===t?'2px solid #4361EE':'1px solid #E8E8EC', background:nuevaTipo===t?'#EEF1FD':'#fff', color:nuevaTipo===t?'#4361EE':'#888' }}>
                    {t==='ingreso'?'Ingreso':'Gasto'}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={{ display:'block', fontSize:12, fontWeight:500, color:'#555', marginBottom:7 }}>Categoría</label>
              <input type="text" value={nuevaCategoria} onChange={e => setNuevaCategoria(e.target.value)} placeholder="ej. Consultoría externa"
                style={{ width:'100%', padding:'10px 12px', fontSize:13, border:'1px solid #E8E8EC', borderRadius:9, outline:'none', fontFamily:'Inter,sans-serif', color:'#1a1a1a', boxSizing:'border-box' }}
                onFocus={e => (e.target.style.borderColor='#4361EE')} onBlur={e => (e.target.style.borderColor='#E8E8EC')} />
            </div>
            <div style={{ marginBottom:22 }}>
              <label style={{ display:'block', fontSize:12, fontWeight:500, color:'#555', marginBottom:7 }}>Plan anual (€)</label>
              <input type="number" value={nuevaImporte} onChange={e => setNuevaImporte(e.target.value)} placeholder="0" min="0"
                style={{ width:'100%', padding:'10px 12px', fontSize:13, border:'1px solid #E8E8EC', borderRadius:9, outline:'none', fontFamily:'Inter,sans-serif', color:'#1a1a1a', boxSizing:'border-box' }}
                onFocus={e => (e.target.style.borderColor='#4361EE')} onBlur={e => (e.target.style.borderColor='#E8E8EC')} />
              <div style={{ fontSize:11, color:'#B0B7C3', marginTop:5 }}>Se distribuye automáticamente entre los 12 meses.</div>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={() => setModalNueva(false)} style={{ flex:1, padding:'10px', fontSize:13, fontWeight:500, border:'1px solid #E8E8EC', borderRadius:9, background:'#F4F5F7', color:'#555', cursor:'pointer', fontFamily:'Inter,sans-serif' }}>Cancelar</button>
              <button onClick={handleAddPartida} disabled={!nuevaCategoria.trim()||!nuevaImporte}
                style={{ flex:1, padding:'10px', fontSize:13, fontWeight:600, border:'none', borderRadius:9, background:!nuevaCategoria.trim()||!nuevaImporte?'#C8CFDA':'#4361EE', color:'#fff', cursor:!nuevaCategoria.trim()||!nuevaImporte?'not-allowed':'pointer', fontFamily:'Inter,sans-serif' }}>
                Añadir
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
