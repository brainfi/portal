import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import {
  AreaChart, Area, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ComposedChart,
} from 'recharts'

type TipoPartida = 'ingreso' | 'gasto'
// filtro: número de mes (0-11) o 'anual'
type FiltroPeriodo = number | 'anual'

interface Partida {
  id: number
  categoria: string
  tipo: TipoPartida
  planAnual: number
  planMensual: number[]
  real: number[]
  icono: string
  color: string
  cuentaCodigo?: string
  cuentaNombre?: string
}

const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
const MES_ACTUAL = 4
const MESES_CON_REAL = [0,1,2,3,4]

const initialPartidas: Partida[] = [
  { id:1, categoria:'Ventas directas', cuentaCodigo:'700', cuentaNombre:'Ventas de mercaderías',       tipo:'ingreso', planAnual:840000, planMensual:[65000,65000,68000,70000,70200,72000,72000,68000,74000,76000,78000,80000], real:[63200,66800,74000,88000,68000,0,0,0,0,0,0,0], icono:'ti-trending-up',      color:'#4361EE' },
  { id:2, categoria:'Servicios recurrentes', cuentaCodigo:'705', cuentaNombre:'Prestaciones de servicios', tipo:'ingreso', planAnual:96000,  planMensual:[8000,8000,8000,8000,8000,8000,8000,8000,8000,8000,8000,8000],             real:[8100,8000,8200,8100,7900,0,0,0,0,0,0,0],   icono:'ti-refresh',          color:'#7B93FF' },
  { id:3, categoria:'Licencias', cuentaCodigo:'752', cuentaNombre:'Ingresos por arrendamientos',             tipo:'ingreso', planAnual:60000,  planMensual:[4000,4000,5000,5000,5500,5500,5500,5000,5000,5500,5500,5500],             real:[5200,5800,8100,9200,10200,0,0,0,0,0,0,0],  icono:'ti-file-certificate',  color:'#60A5FA' },
  { id:4, categoria:'Nóminas y SS', cuentaCodigo:'640', cuentaNombre:'Sueldos y salarios',          tipo:'gasto',   planAnual:196800, planMensual:[16400,16400,16400,16400,16400,16400,16400,16400,16400,16400,16400,16400], real:[16400,16400,16800,17200,18400,0,0,0,0,0,0,0], icono:'ti-users',             color:'#EF4444' },
  { id:5, categoria:'Alquiler oficina', cuentaCodigo:'621', cuentaNombre:'Arrendamientos y cánones',      tipo:'gasto',   planAnual:25200,  planMensual:[2100,2100,2100,2100,2100,2100,2100,2100,2100,2100,2100,2100],             real:[2100,2100,2100,2100,2100,0,0,0,0,0,0,0],   icono:'ti-building',          color:'#F87171' },
  { id:6, categoria:'Marketing', cuentaCodigo:'627', cuentaNombre:'Publicidad, propaganda y RRPP',             tipo:'gasto',   planAnual:36000,  planMensual:[3000,3000,3000,3000,3000,3000,3000,3000,3000,3000,3000,3000],             real:[2800,3100,3400,3900,4300,0,0,0,0,0,0,0],   icono:'ti-speakerphone',      color:'#FB923C' },
  { id:7, categoria:'Software', cuentaCodigo:'629', cuentaNombre:'Otros servicios',              tipo:'gasto',   planAnual:10800,  planMensual:[900,900,900,900,900,900,900,900,900,900,900,900],                         real:[740,740,740,740,740,0,0,0,0,0,0,0],        icono:'ti-device-laptop',     color:'#A78BFA' },
  { id:8, categoria:'Viajes y dietas', cuentaCodigo:'624', cuentaNombre:'Transportes',       tipo:'gasto',   planAnual:8400,   planMensual:[600,600,800,800,800,800,800,600,800,800,600,400],                         real:[520,480,610,650,520,0,0,0,0,0,0,0],        icono:'ti-plane',             color:'#34D399' },
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
        <div key={p.dataKey} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
          <div style={{ width:8, height:8, borderRadius:2, background:p.stroke }} />
          <span style={{ color:'#666', minWidth:80 }}>{p.dataKey === 'Real' ? 'Real acumulado' : 'Plan acumulado'}:</span>
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
  const navigate = useNavigate()
  const [partidas, setPartidas] = useState<Partida[]>(initialPartidas)
  const [filtro, setFiltro] = useState<FiltroPeriodo>(MES_ACTUAL)
  const [filtroOpen, setFiltroOpen] = useState(false)
  const [editandoPlan, setEditandoPlan] = useState<number | null>(null)
  const [vistaPL,     setVistaPL]     = useState<'anual' | 'trimestral' | 'mensual'>('anual')
  const [modalPL,     setModalPL]     = useState(false)
  const [saved, setSaved] = useState(false)
  const [modalNueva, setModalNueva] = useState(false)
  const [nuevaCategoria, setNuevaCategoria] = useState('')
  const [nuevaTipo, setNuevaTipo] = useState<TipoPartida>('gasto')
  const [nuevaImporte, setNuevaImporte] = useState('')
  const [nuevaDistrib, setNuevaDistrib] = useState<'lineal' | 'mensual'>('lineal')
  const [nuevaMensual, setNuevaMensual] = useState<number[]>(Array(12).fill(0))

  const mesesActivos = useMemo(() => {
    return filtro === 'anual' ? [0,1,2,3,4,5,6,7,8,9,10,11] : [filtro as number]
  }, [filtro])

  // Label del filtro activo
  const filtroLabel = filtro === 'anual' ? 'Último año' : MESES[filtro as number]

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

  // KPIs financieros
  // Margen bruto = Ingresos - Coste de personal (cta. 640 — nóminas y SS)
  const nominas        = partidas.filter(p => p.cuentaCodigo === '640')
  const nominasPlan    = nominas.reduce((a, p) => a + sumMeses(p.planMensual, mesesActivos), 0)
  const nominasReal    = nominas.reduce((a, p) => a + sumMeses(p.real, mesesConReal), 0)
  const margenBrutoPlan = ingresosPlan - nominasPlan
  const margenBrutoReal = ingresosReal - (nominasReal || nominasPlan * (ingresosReal / (ingresosPlan || 1)))
  const margenBrutoPct  = ingresosPlan > 0 ? Math.round((margenBrutoPlan / ingresosPlan) * 100) : 0
  const margenBrutoRealPct = ingresosReal > 0 && margenBrutoReal > 0 ? Math.round((margenBrutoReal / ingresosReal) * 100) : 0

  // EBITDA = Margen bruto - resto opex (excluye 640 ya descontado, 66x financieros, 63x tributos, 68x amortizaciones)
  const codigosNoEbitda = ['640','660','661','662','663','664','665','669','630','631','633','680','681','682']
  const opexRestoPlan   = partidas.filter(p => p.tipo === 'gasto' && !codigosNoEbitda.includes(p.cuentaCodigo || '')).reduce((a, p) => a + sumMeses(p.planMensual, mesesActivos), 0)
  const opexRestoReal   = partidas.filter(p => p.tipo === 'gasto' && !codigosNoEbitda.includes(p.cuentaCodigo || '')).reduce((a, p) => a + sumMeses(p.real, mesesConReal), 0)
  const ebitdaPlan      = margenBrutoPlan - opexRestoPlan
  const ebitdaReal      = hayReal ? margenBrutoReal - opexRestoReal : null

  // Gráfico: líneas acumuladas mes a mes
  const chartData = useMemo(() => {
    let acumReal = 0
    let acumPlan = 0
    return MESES.map((mes, m) => {
      const planIngresos = partidas.filter(p => p.tipo === 'ingreso').reduce((a, p) => a + p.planMensual[m], 0)
      const planGastos   = partidas.filter(p => p.tipo === 'gasto').reduce((a, p) => a + p.planMensual[m], 0)
      const planNeto     = planIngresos - planGastos
      const hayRealMes   = MESES_CON_REAL.includes(m)
      const realIngresos = hayRealMes ? partidas.filter(p => p.tipo === 'ingreso').reduce((a, p) => a + p.real[m], 0) : null
      const realGastos   = hayRealMes ? partidas.filter(p => p.tipo === 'gasto').reduce((a, p) => a + p.real[m], 0) : null
      const realNeto     = realIngresos !== null && realGastos !== null ? realIngresos - realGastos : null
      acumPlan += planNeto
      if (realNeto !== null) acumReal += realNeto
      return {
        mes,
        Plan: acumPlan,
        Real: realNeto !== null ? acumReal : null,
      }
    })
  }, [partidas])

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
    if (!nuevaCategoria.trim()) return
    const anual = parseFloat(nuevaImporte) || 0
    const mensual = nuevaDistrib === 'lineal'
      ? Array(12).fill(Math.round(anual / 12))
      : nuevaMensual.map(v => v || 0)
    const planAnualReal = nuevaDistrib === 'mensual'
      ? nuevaMensual.reduce((a, v) => a + (v || 0), 0)
      : anual
    setPartidas(prev => [...prev, {
      id: Date.now(), categoria: nuevaCategoria.trim(), tipo: nuevaTipo,
      planAnual: planAnualReal, planMensual: mensual,
      real: Array(12).fill(0),
      icono: nuevaTipo === 'ingreso' ? 'ti-trending-up' : 'ti-receipt',
      color: nuevaTipo === 'ingreso' ? '#4361EE' : '#EF4444',
    }])
    setNuevaCategoria(''); setNuevaImporte('')
    setNuevaDistrib('lineal'); setNuevaMensual(Array(12).fill(0))
    setModalNueva(false)
  }
  function handleDelete(id: number) {
    setPartidas(prev => prev.filter(p => p.id !== id))
  }

  const card: React.CSSProperties = { background:'#fff', borderRadius:14, border:'1px solid #E8E8EC' }
  const th: React.CSSProperties = { fontSize:9, fontWeight:700, color:'#B0B7C3', textTransform:'uppercase', letterSpacing:'0.1em', padding:'0 10px 10px', textAlign:'right' as const }
  const td: React.CSSProperties = { padding:'11px 10px', fontSize:12, color:'#1a1a1a', textAlign:'right' as const, verticalAlign:'middle' as const }
  const tdTotal: React.CSSProperties = { ...td, background:'#EEF1FD', fontWeight:700 }

  // Opciones del dropdown: meses pasados del año + último año
  const opcionesFiltro: { key: FiltroPeriodo; label: string; group: string }[] = [
    ...Array.from({ length: MES_ACTUAL + 1 }, (_, m) => ({
      key: m as FiltroPeriodo,
      label: m === MES_ACTUAL ? `${MESES[m]} (este mes)` : MESES[m],
      group: '2026',
    })).reverse(),
    { key: 'anual', label: 'Último año', group: 'Acumulado' },
  ]

  // Orden y agrupación P&L según PGC
  const PL_TEMPLATE: { codigo:string; nombre:string; tipo:'ingreso'|'gasto'; seccion:string }[] = [
    { codigo:'700', nombre:'Ventas de mercaderías',                  tipo:'ingreso', seccion:'Cifra de negocios' },
    { codigo:'701', nombre:'Ventas de productos terminados',         tipo:'ingreso', seccion:'Cifra de negocios' },
    { codigo:'705', nombre:'Prestaciones de servicios',              tipo:'ingreso', seccion:'Cifra de negocios' },
    { codigo:'708', nombre:'Devoluciones de ventas',                 tipo:'ingreso', seccion:'Cifra de negocios' },
    { codigo:'740', nombre:'Subvenciones de explotación',            tipo:'ingreso', seccion:'Subvenciones' },
    { codigo:'752', nombre:'Ingresos por arrendamientos',            tipo:'ingreso', seccion:'Otros ingresos' },
    { codigo:'753', nombre:'Ingresos de propiedad industrial',       tipo:'ingreso', seccion:'Otros ingresos' },
    { codigo:'754', nombre:'Ingresos por comisiones',                tipo:'ingreso', seccion:'Otros ingresos' },
    { codigo:'759', nombre:'Ingresos por servicios diversos',        tipo:'ingreso', seccion:'Otros ingresos' },
    { codigo:'760', nombre:'Ingresos de participaciones',            tipo:'ingreso', seccion:'Ingresos financieros' },
    { codigo:'762', nombre:'Ingresos de créditos',                   tipo:'ingreso', seccion:'Ingresos financieros' },
    { codigo:'769', nombre:'Otros ingresos financieros',             tipo:'ingreso', seccion:'Ingresos financieros' },
    { codigo:'600', nombre:'Compras de mercaderías',                 tipo:'gasto', seccion:'Aprovisionamientos' },
    { codigo:'601', nombre:'Compras de materias primas',             tipo:'gasto', seccion:'Aprovisionamientos' },
    { codigo:'607', nombre:'Trabajos realizados por otras empresas', tipo:'gasto', seccion:'Aprovisionamientos' },
    { codigo:'621', nombre:'Arrendamientos y cánones',               tipo:'gasto', seccion:'Servicios exteriores' },
    { codigo:'622', nombre:'Reparaciones y conservación',            tipo:'gasto', seccion:'Servicios exteriores' },
    { codigo:'623', nombre:'Servicios de profesionales independientes', tipo:'gasto', seccion:'Servicios exteriores' },
    { codigo:'624', nombre:'Transportes',                            tipo:'gasto', seccion:'Servicios exteriores' },
    { codigo:'625', nombre:'Primas de seguros',                      tipo:'gasto', seccion:'Servicios exteriores' },
    { codigo:'626', nombre:'Servicios bancarios y similares',        tipo:'gasto', seccion:'Servicios exteriores' },
    { codigo:'627', nombre:'Publicidad, propaganda y RRPP',          tipo:'gasto', seccion:'Servicios exteriores' },
    { codigo:'628', nombre:'Suministros',                            tipo:'gasto', seccion:'Servicios exteriores' },
    { codigo:'629', nombre:'Otros servicios',                        tipo:'gasto', seccion:'Servicios exteriores' },
    { codigo:'640', nombre:'Sueldos y salarios',                     tipo:'gasto', seccion:'Gastos de personal' },
    { codigo:'641', nombre:'Indemnizaciones',                        tipo:'gasto', seccion:'Gastos de personal' },
    { codigo:'642', nombre:'Seguridad Social a cargo de la empresa', tipo:'gasto', seccion:'Gastos de personal' },
    { codigo:'649', nombre:'Otros gastos sociales',                  tipo:'gasto', seccion:'Gastos de personal' },
    { codigo:'650', nombre:'Pérdidas de créditos por insolvencias',  tipo:'gasto', seccion:'Otros gastos de gestión' },
    { codigo:'659', nombre:'Otras pérdidas en gestión corriente',    tipo:'gasto', seccion:'Otros gastos de gestión' },
    { codigo:'662', nombre:'Intereses de deudas',                    tipo:'gasto', seccion:'Gastos financieros' },
    { codigo:'665', nombre:'Descuentos s/ventas por pronto pago',    tipo:'gasto', seccion:'Gastos financieros' },
    { codigo:'669', nombre:'Otros gastos financieros',               tipo:'gasto', seccion:'Gastos financieros' },
    { codigo:'680', nombre:'Amortización inmovilizado intangible',   tipo:'gasto', seccion:'Amortizaciones' },
    { codigo:'681', nombre:'Amortización inmovilizado material',     tipo:'gasto', seccion:'Amortizaciones' },
    { codigo:'630', nombre:'Impuesto sobre beneficios',              tipo:'gasto', seccion:'Tributos' },
    { codigo:'631', nombre:'Otros tributos',                         tipo:'gasto', seccion:'Tributos' },
  ]

  function plSortKey(codigo: string): number {
    return parseInt(codigo, 10) || 999
  }
  function plSeccion(codigo: string, tipo: TipoPartida): string {
    const n = parseInt(codigo.slice(0, 2), 10)
    if (tipo === 'ingreso') {
      if (n <= 73) return 'Cifra de negocios'
      if (n === 74) return 'Subvenciones'
      if (n === 75) return 'Otros ingresos'
      if (n === 76) return 'Ingresos financieros'
      return 'Beneficios excepcionales'
    }
    if (n <= 61) return 'Aprovisionamientos'
    if (n === 62) return 'Servicios exteriores'
    if (n === 63) return 'Tributos'
    if (n === 64) return 'Gastos de personal'
    if (n === 65) return 'Otros gastos de gestión'
    if (n === 66) return 'Gastos financieros'
    if (n === 67) return 'Pérdidas'
    if (n === 68) return 'Amortizaciones'
    return 'Otros'
  }

  function CuentaResultados() {
    const allSorted = PL_TEMPLATE.map(tpl => {
      const match = partidas.find(p => p.cuentaCodigo === tpl.codigo)
      return match ?? {
        id: -parseInt(tpl.codigo),
        categoria: tpl.nombre,
        cuentaCodigo: tpl.codigo,
        cuentaNombre: tpl.nombre,
        tipo: tpl.tipo,
        planAnual: 0,
        planMensual: Array(12).fill(0),
        real: Array(12).fill(0),
        icono: tpl.tipo === 'ingreso' ? 'ti-trending-up' : 'ti-receipt',
        color: tpl.tipo === 'ingreso' ? '#4361EE' : '#EF4444',
        distribucion: 'lineal' as const,
      }
    })
    function secSum(seccion: string, campo: 'plan' | 'real'): number {
      return allSorted.filter(p => plSeccion(p.cuentaCodigo||'', p.tipo) === seccion)
        .reduce((a, p) => a + (campo === 'plan' ? sumMeses(p.planMensual, mesesActivos) : sumMeses(p.real, mesesConReal)), 0)
    }
    const ingPlan = allSorted.filter(p=>p.tipo==='ingreso').reduce((a,p)=>a+sumMeses(p.planMensual,mesesActivos),0)
    const ingReal = allSorted.filter(p=>p.tipo==='ingreso').reduce((a,p)=>a+sumMeses(p.real,mesesConReal),0)
    const mbPlan = ingPlan - secSum('Aprovisionamientos','plan')
    const mbReal = ingReal - secSum('Aprovisionamientos','real')
    const svcPlan = secSum('Servicios exteriores','plan')+secSum('Gastos de personal','plan')+secSum('Otros gastos de gestión','plan')
    const svcReal = secSum('Servicios exteriores','real')+secSum('Gastos de personal','real')+secSum('Otros gastos de gestión','real')
    const ebitdaPlan = mbPlan - svcPlan
    const ebitdaReal = mbReal - svcReal
    const amortPlan = secSum('Amortizaciones','plan')+secSum('Gastos financieros','plan')+secSum('Tributos','plan')+secSum('Pérdidas','plan')
    const amortReal = secSum('Amortizaciones','real')+secSum('Gastos financieros','real')+secSum('Tributos','real')+secSum('Pérdidas','real')
    const rnetoPlan = ebitdaPlan - amortPlan
    const rnetoReal = ebitdaReal - amortReal
    const vista   = vistaPL
    const setVista = setVistaPL
    const TRIMESTRES = [
      { label:'Q1', meses:[0,1,2],   isCurrent:false },
      { label:'Q2', meses:[3,4,5],   isCurrent:true  },
      { label:'Q3', meses:[6,7,8],   isCurrent:false },
      { label:'Q4', meses:[9,10,11], isCurrent:false },
    ]
    const MESES_SHORT = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
    const MES_ACTUAL_IDX = 4
    function cellVal(p: typeof allSorted[0], ms: number[]) {
      const rm = ms.filter(m => MESES_CON_REAL.includes(m))
      const r = rm.reduce((a, m) => a + (p.real[m]||0), 0)
      return { real:r, plan:ms.reduce((a,m)=>a+(p.planMensual[m]||0),0), hayReal:rm.length>0&&r>0 }
    }
    // Meses del periodo seleccionado
    const mesesVista = vista === 'anual' ? MESES_CON_REAL
      : vista === 'trimestral' ? [3,4,5].filter(m => MESES_CON_REAL.includes(m))
      : [4].filter(m => MESES_CON_REAL.includes(m))
    const planMesesVista = vista === 'anual' ? Array.from({length:12},(_,i)=>i)
      : vista === 'trimestral' ? [3,4,5]
      : [4]
    const labelVista = vista === 'anual' ? 'Real YTD' : vista === 'trimestral' ? 'Real Q2' : 'Real May'

    const POST_EBITDA = new Set(['66','67','68','63'])
    let margenMostrado = false, ebitdaMostrado = false, lastSec = '', lastTipo: TipoPartida | '' = ''
    function SubtotalRow({ slabel, plan, real, color }: { slabel:string; plan:number; real:number; color:string }) {
      const diff = real - plan
      return (
        <tr style={{ background:`${color}0D`, borderTop:`2px solid ${color}40`, borderBottom:`2px solid ${color}40` }}>
          <td style={{ ...td, textAlign:'left' as const, paddingLeft:8, fontWeight:700, fontSize:13, color }}>{slabel}</td>
          <td style={{ ...td, fontWeight:700, color:'#888' }}>{fmt(plan)}</td>
          <td style={{ ...td, textAlign:'right' as const, fontWeight:700, color }}>{real!==0?fmt(real):'—'}</td>
          <td className="pres-hide" style={{ ...td, textAlign:'right' as const, fontWeight:700, color:diff>=0?'#1a7a3a':'#b91c1c' }}>{real!==0?(diff>=0?'+':'')+fmt(diff):'—'}</td>
          <td style={td}>{real!==0&&<DeltaBadge real={Math.abs(real)} plan={Math.abs(plan)} tipo="ingreso"/>}</td>
          <td />
        </tr>
      )
    }
    const rows: React.ReactNode[] = []
    allSorted.forEach((p, idx) => {
      const tplE = PL_TEMPLATE.find(t=>t.codigo===p.cuentaCodigo)
      const sec = tplE?.seccion || plSeccion(p.cuentaCodigo||'', p.tipo)
      const nextP = allSorted[idx+1]
      const nextPre = nextP?(nextP.cuentaCodigo||'99').slice(0,2):''
      const nextTipoVal = nextP?nextP.tipo:''
      const nextSec = (nextP?PL_TEMPLATE.find(t=>t.codigo===nextP.cuentaCodigo):undefined)?.seccion || (nextP?plSeccion(nextP.cuentaCodigo||'',nextP.tipo):'')
      const planPer = sumMeses(p.planMensual, mesesActivos)
      const realPer = sumMeses(p.real, mesesConReal)
      const colSpan = vista==='anual'?6:vista==='trimestral'?8:16
      if (p.tipo !== lastTipo) {
        lastTipo=p.tipo; lastSec=''
      }
      if (sec !== lastSec) {
        rows.push(<tr key={`sec-${sec}-${idx}`}><td colSpan={colSpan} style={{padding:'10px 0 3px',paddingLeft:0,fontSize:9,fontWeight:700,color:'#4361EE',textTransform:'uppercase',letterSpacing:'0.1em',background:'#F8F9FF',borderBottom:'1px solid #EEF1FD',borderTop:'1px solid #EEF1FD'}}>{sec}</td></tr>)
        lastSec=sec
      }
      rows.push(
        <tr key={p.id} style={{borderBottom:'1px solid #F4F5F7'}} onMouseEnter={e=>(e.currentTarget.style.background='#FAFAFA')} onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>
          <td style={{...td,textAlign:'left' as const,paddingLeft:8}}>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <div style={{width:24,height:24,borderRadius:6,background:`${p.color}18`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <i className={`ti ${p.icono}`} style={{fontSize:11,color:p.color}} aria-hidden="true"/>
              </div>
              <div><span style={{fontWeight:500}}>{p.categoria}</span>
                {p.cuentaCodigo&&<div className="pres-hide" style={{fontSize:10,color:'#B0B7C3',marginTop:1}}>{p.cuentaCodigo} · {p.cuentaNombre}</div>}
              </div>
            </div>
          </td>
          {vista==='anual'?(
            <td style={{...td,width:110}}>
              {editandoPlan===p.id?(<input type="number" defaultValue={p.planAnual} onChange={e=>handleEditPlanAnual(p.id,e.target.value)} style={{width:90,padding:'5px 8px',fontSize:12,border:'1px solid #4361EE',borderRadius:7,textAlign:'right',fontFamily:'Inter,sans-serif',background:'#F9FAFB',outline:'none'}}/>):(<span onClick={()=>setEditandoPlan(p.id)} title="Clic para editar" style={{cursor:'pointer',padding:'4px 6px',background:'#F4F5F7',borderRadius:6,fontSize:11,color:'#555',fontWeight:500}}>{fmt(p.planAnual)}</span>)}
            </td>
          ):(
            <td style={{...td,width:110}}><span style={{padding:'4px 6px',background:'#F4F5F7',borderRadius:6,fontSize:11,color:'#555',fontWeight:500}}>{fmt(p.planAnual)}</span></td>
          )}
          {(()=>{
            const rV   = mesesVista.reduce((a,m)=>a+(p.real[m]||0),0)
            const pV   = planMesesVista.reduce((a,m)=>a+(p.planMensual[m]||0),0)
            const dV   = rV - pV
            const good = p.tipo==='ingreso'?dV>=0:dV<=0
            return(<>
              <td style={{...td,textAlign:'right' as const,fontWeight:rV>0?600:400,color:rV>0?'#1a1a1a':'#B0B7C3'}}>{rV>0?fmt(rV):'—'}</td>
              <td className="pres-hide" style={{...td,textAlign:'right' as const,fontWeight:600,color:rV>0?(good?'#1a7a3a':'#b91c1c'):'#B0B7C3'}}>{rV>0?(dV>=0?'+':'')+fmt(dV):'—'}</td>
              <td style={{...td,textAlign:'right' as const}}>{rV>0?<DeltaBadge real={rV} plan={pV} tipo={p.tipo}/>:<span style={{fontSize:11,color:'#B0B7C3'}}>—</span>}</td>
            </>)
          })()}
          <td style={{textAlign:'center',verticalAlign:'middle'}}>
            {p.id>0&&(<button onClick={()=>handleDelete(p.id)} style={{border:'none',background:'transparent',cursor:'pointer',color:'#D0D3DE',fontSize:13,padding:4,borderRadius:5,display:'flex',alignItems:'center'}} onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.color='#EF4444';(e.currentTarget as HTMLButtonElement).style.background='#FEF2F2'}} onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.color='#D0D3DE';(e.currentTarget as HTMLButtonElement).style.background='transparent'}}><i className="ti ti-trash" aria-hidden="true"/></button>)}
          </td>
        </tr>
      )
      const isLastAprov = sec==='Aprovisionamientos'&&(nextSec!=='Aprovisionamientos'||nextTipoVal!==p.tipo)
      if (!margenMostrado&&isLastAprov) { margenMostrado=true; rows.push(<SubtotalRow key="mb" slabel="Margen bruto" plan={mbPlan} real={mbReal} color="#4361EE"/>) }
      const isLastGasto=p.tipo==='gasto'&&(!nextP||nextTipoVal!=='gasto')
      const nextIsPost=nextP&&nextTipoVal==='gasto'&&POST_EBITDA.has(nextPre)
      if (!ebitdaMostrado&&p.tipo==='gasto'&&(isLastGasto||nextIsPost)) { ebitdaMostrado=true; rows.push(<SubtotalRow key="ebitda" slabel="EBITDA" plan={ebitdaPlan} real={ebitdaReal} color="#4361EE"/>) }
    })
    rows.push(<SubtotalRow key="rneto" slabel="Resultado neto" plan={rnetoPlan} real={rnetoReal} color="#4361EE"/>)
    return (
      <div style={{...card,padding:'22px 24px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:14}}>
          <div>
            <div style={{fontSize:9,fontWeight:600,color:'#1a1a1a',textTransform:'uppercase',letterSpacing:'0.12em'}}>Cuenta de resultados</div>
            <div style={{fontSize:11,color:'#B0B7C3',marginTop:2}}>Estructura de la cuenta de pérdidas y ganancias según el PGC español.</div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <div style={{display:'flex',gap:2,background:'#F4F5F7',borderRadius:8,padding:3}}>
              {([['anual','Año'],['trimestral','Q'],['mensual','Mes']] as const).map(([v,lbl])=>(
                <button key={v} onClick={()=>setVista(v as 'anual'|'trimestral'|'mensual')} style={{border:'none',cursor:'pointer',fontFamily:'inherit',fontSize:11,fontWeight:vista===v?600:400,padding:'5px 12px',borderRadius:6,background:vista===v?'#fff':'transparent',color:vista===v?'#1a1a1a':'#888',boxShadow:vista===v?'0 1px 4px rgba(0,0,0,0.08)':'none'}}>{lbl}</button>
              ))}
            </div>
            <button onClick={()=>setModalPL(true)} style={{display:'inline-flex',alignItems:'center',gap:5,padding:'5px 11px',fontSize:11,fontWeight:500,border:'1px solid #E8E8EC',borderRadius:7,background:'#fff',color:'#555',cursor:'pointer',fontFamily:'inherit'}}>
              <i className="ti ti-arrows-maximize" style={{fontSize:12}} aria-hidden="true"/>Expandir
            </button>
          </div>
        </div>
        <div style={{overflowX:'auto'}}>
          <table className="pres-pl-table" style={{width:'100%',borderCollapse:'collapse',minWidth:580}}>
            <thead>
              <tr style={{borderBottom:'2px solid #ECEEF3'}}>
                <th style={{...th,textAlign:'left' as const,paddingLeft:8,width:'28%'}}>Partida · Cuenta PGC</th>
                <th style={{...th,width:110}}>Plan anual</th>
                <th style={{...th,textAlign:'right' as const}}>{labelVista}</th>
                <th className="pres-hide" style={{...th,textAlign:'right' as const}}>Desv. €</th>
                <th style={{...th,textAlign:'right' as const}}>Desv. %</th>
                <th style={{width:28}}/>
              </tr>
            </thead>
            <tbody>{rows}</tbody>
          </table>
        </div>
        {modalPL&&(
          <div onClick={e=>{if(e.target===e.currentTarget)setModalPL(false)}} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.35)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
            <div style={{background:'#F4F5F7',borderRadius:16,width:'95vw',maxWidth:1100,maxHeight:'90vh',overflow:'hidden',display:'flex',flexDirection:'column',boxShadow:'0 16px 48px rgba(0,0,0,0.2)'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'18px 24px',background:'#fff',borderBottom:'1px solid #E8E8EC'}}>
                <div><div style={{fontSize:14,fontWeight:700,color:'#1a1a1a'}}>Cuenta de resultados · Detalle mensual</div><div style={{fontSize:11,color:'#B0B7C3',marginTop:2}}>Plan vs real por mes · 2026</div></div>
                <button onClick={()=>setModalPL(false)} style={{border:'none',background:'transparent',cursor:'pointer',color:'#888',fontSize:20,display:'flex',alignItems:'center'}}><i className="ti ti-x" aria-hidden="true"/></button>
              </div>
              <div style={{overflow:'auto',padding:'16px 24px'}}>
                <table style={{width:'100%',borderCollapse:'collapse',minWidth:900}}>
                  <thead>
                    <tr style={{borderBottom:'2px solid #ECEEF3'}}>
                      <th style={{...th,textAlign:'left' as const,paddingLeft:0,width:'22%',fontSize:9}}>Partida</th>
                      <th style={{...th,fontSize:9,width:80}}>Plan anual</th>
                      {MESES_SHORT.map((m,i)=>(<th key={m} style={{...th,textAlign:'right' as const,fontSize:9,minWidth:58,background:i===MES_ACTUAL_IDX?'#EEF1FD':'transparent',borderRadius:4}}>{m}</th>))}
                      <th style={{...th,fontSize:9,textAlign:'right' as const}}>Real YTD</th>
                      <th style={{...th,fontSize:9,textAlign:'right' as const}}>Desv.%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(()=>{
                      const mRows: React.ReactNode[] = []
                      let mMargen=false, mEbitda=false, mLastSec='', mLastTipo: TipoPartida|''=''
                      function MSubtotal({slabel,plan,real,color}:{slabel:string;plan:number;real:number;color:string}) {
                        const diff=real-plan
                        return(<tr style={{background:`${color}0D`,borderTop:`2px solid ${color}40`,borderBottom:`2px solid ${color}40`}}>
                          <td style={{...td,textAlign:'left' as const,paddingLeft:0,fontWeight:700,fontSize:12,color}}>{slabel}</td>
                          <td style={{...td,fontSize:11,fontWeight:700,color:'#888'}}>{fmt(plan)}</td>
                          {MESES_SHORT.map(m=><td key={m} style={td}/>)}
                          <td style={{...td,textAlign:'right' as const,fontWeight:700,color}}>{real!==0?fmt(real):'—'}</td>
                          <td style={{...td,textAlign:'right' as const,fontSize:11}}>{real!==0&&<DeltaBadge real={Math.abs(real)} plan={Math.abs(plan)} tipo="ingreso"/>}</td>
                        </tr>)
                      }
                      allSorted.forEach((p,idx)=>{
                        const tplE=PL_TEMPLATE.find(t=>t.codigo===p.cuentaCodigo)
                        const sec=tplE?.seccion||plSeccion(p.cuentaCodigo||'',p.tipo)
                        const nextP=allSorted[idx+1]
                        const nextPre=nextP?(nextP.cuentaCodigo||'99').slice(0,2):''
                        const nextTipoVal=nextP?nextP.tipo:''
                        const nextSec=(nextP?PL_TEMPLATE.find(t=>t.codigo===nextP.cuentaCodigo):undefined)?.seccion||(nextP?plSeccion(nextP.cuentaCodigo||'',nextP.tipo):'')
                        const rYTD=MESES_CON_REAL.reduce((a,m)=>a+(p.real[m]||0),0)
                        const COLS=16
                        if (p.tipo!==mLastTipo) {
                          mLastTipo=p.tipo; mLastSec=''
                        }
                        if (sec!==mLastSec) {
                          mRows.push(<tr key={`ms-${sec}-${idx}`}><td colSpan={COLS} style={{padding:'8px 0 3px',paddingLeft:0,fontSize:9,fontWeight:700,color:'#4361EE',textTransform:'uppercase',letterSpacing:'0.1em',background:'#F8F9FF',borderBottom:'1px solid #EEF1FD'}}>{sec}</td></tr>)
                          mLastSec=sec
                        }
                        mRows.push(<tr key={`m-${p.id}`} style={{borderBottom:'1px solid #F4F5F7'}} onMouseEnter={e=>(e.currentTarget.style.background='#FAFAFA')} onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>
                          <td style={{...td,textAlign:'left' as const,paddingLeft:0,fontSize:11}}><div style={{fontWeight:500}}>{p.categoria}</div>{p.cuentaCodigo&&<div style={{fontSize:9,color:'#B0B7C3'}}>{p.cuentaCodigo}</div>}</td>
                          <td style={{...td,fontSize:11,color:'#888'}}>{p.planAnual>0?fmt(p.planAnual):'—'}</td>
                          {MESES_SHORT.map((m,mi)=>{const hr=MESES_CON_REAL.includes(mi)&&p.real[mi]>0;const ic=mi===MES_ACTUAL_IDX;return(<td key={m} style={{...td,textAlign:'right' as const,fontSize:11,background:ic?'#F4F6FF':'transparent',fontWeight:hr?600:400,color:hr?'#1a1a1a':p.planMensual[mi]>0?'#C7D2F8':'#E8E8EC'}}>{hr?fmt(p.real[mi]):p.planMensual[mi]>0?fmt(p.planMensual[mi]):'—'}</td>)})}
                          <td style={{...td,textAlign:'right' as const,fontWeight:rYTD>0?600:400,color:rYTD>0?'#1a1a1a':'#B0B7C3',fontSize:11}}>{rYTD>0?fmt(rYTD):'—'}</td>
                          <td style={{...td,textAlign:'right' as const,fontSize:11}}>{rYTD>0&&p.planAnual>0?<DeltaBadge real={rYTD} plan={p.planAnual} tipo={p.tipo}/>:<span style={{color:'#B0B7C3'}}>—</span>}</td>
                        </tr>)
                        const isLastAprov=sec==='Aprovisionamientos'&&(nextSec!=='Aprovisionamientos'||nextTipoVal!==p.tipo)
                        if (!mMargen&&isLastAprov) { mMargen=true; mRows.push(<MSubtotal key="m-mb" slabel="Margen bruto" plan={mbPlan} real={mbReal} color="#4361EE"/>) }
                        const isLast=p.tipo==='gasto'&&(!nextP||nextTipoVal!=='gasto')
                        const nextPost=nextP&&nextTipoVal==='gasto'&&POST_EBITDA.has(nextPre)
                        if (!mEbitda&&p.tipo==='gasto'&&(isLast||nextPost)) { mEbitda=true; mRows.push(<MSubtotal key="m-ebitda" slabel="EBITDA" plan={ebitdaPlan} real={ebitdaReal} color="#4361EE"/>) }
                      })
                      mRows.push(<MSubtotal key="m-rneto" slabel="Resultado neto" plan={rnetoPlan} real={rnetoReal} color="#4361EE"/>)
                      return mRows
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }



  return (
    <Layout title="Presupuesto">
      <style>{`
        @media (max-width: 1100px) { .pres-kgrid { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 600px)  { .pres-kgrid { grid-template-columns: 1fr !important; } }
        @media (max-width: 640px)  { .pres-hide { display: none !important; } .pres-pl-table { min-width: 0 !important; } }
        .pres-dd-item { display:flex; align-items:center; justify-content:space-between; width:100%; padding:8px 12px; font-size:13px; border:none; background:transparent; cursor:pointer; font-family:inherit; text-align:left; color:#1a1a1a; border-radius:7px; }
        .pres-dd-item:hover { background:#F4F5F7; }
        .pres-dd-item.active { color:#4361EE; font-weight:600; }
      `}</style>

      {filtroOpen && (
        <div onClick={() => setFiltroOpen(false)} style={{ position:'fixed', inset:0, zIndex:40 }} />
      )}

      {/* ── Encabezado ── */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
        <div>
          <div style={{ fontSize:22, fontWeight:700, color:'#1a1a1a', letterSpacing:'-0.4px', marginBottom:3 }}>Presupuesto</div>
          <div style={{ fontSize:12, color:'#888' }}>Controla y optimiza tu planificación financiera</div>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>


          {editandoPlan !== null && (
            <button onClick={handleSave} style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'8px 14px', fontSize:12, fontWeight:600, border:'none', borderRadius:8, background:saved?'#2DC653':'#4361EE', color:'#fff', cursor:'pointer', fontFamily:'inherit' }}>
              {saved ? '✓ Guardado' : 'Guardar cambios'}
            </button>
          )}
          <button onClick={() => navigate('/presupuesto/configurar')} style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'8px 14px', fontSize:12, fontWeight:600, border:'none', borderRadius:8, background:'#4361EE', color:'#fff', cursor:'pointer', fontFamily:'Inter,sans-serif' }}>
            <i className="ti ti-settings" style={{ fontSize:13 }} aria-hidden="true" />
            Configurar
          </button>
          {/* Dropdown estilo imagen */}
          <div style={{ position:'relative' }}>
            <button
              onClick={() => setFiltroOpen(o => !o)}
              style={{
                display:'inline-flex', alignItems:'center', gap:8,
                padding:'8px 14px', fontSize:13, fontWeight:500,
                border:'1px solid #E8E8EC', borderRadius:10,
                background:'#F4F5F7', color:'#1a1a1a',
                cursor:'pointer', fontFamily:'inherit',
              }}>
              {filtroLabel}
              <i className="ti ti-chevron-down" style={{ fontSize:14, color:'#888' }} aria-hidden="true" />
            </button>
            {filtroOpen && (
              <div style={{
                position:'absolute', top:'calc(100% + 6px)', right:0, zIndex:50,
                background:'#fff', border:'1px solid #E8E8EC', borderRadius:12,
                padding:'6px', minWidth:180,
                boxShadow:'0 4px 20px rgba(0,0,0,0.08)',
              }}>
                <div style={{ fontSize:9, fontWeight:700, color:'#B0B7C3', textTransform:'uppercase', letterSpacing:'0.1em', padding:'4px 12px 6px' }}>2026</div>
                {opcionesFiltro.filter(o => o.group === '2026').map(o => (
                  <button key={String(o.key)} className={`pres-dd-item${filtro===o.key?' active':''}`}
                    onClick={() => { setFiltro(o.key); setFiltroOpen(false) }}>
                    {o.label}
                    {filtro === o.key && <i className="ti ti-check" style={{ fontSize:13 }} aria-hidden="true" />}
                  </button>
                ))}
                <div style={{ height:'1px', background:'#F4F5F7', margin:'4px 0' }} />
                <div style={{ fontSize:9, fontWeight:700, color:'#B0B7C3', textTransform:'uppercase', letterSpacing:'0.1em', padding:'4px 12px 6px' }}>Acumulado</div>
                {opcionesFiltro.filter(o => o.group === 'Acumulado').map(o => (
                  <button key={String(o.key)} className={`pres-dd-item${filtro===o.key?' active':''}`}
                    onClick={() => { setFiltro(o.key); setFiltroOpen(false) }}>
                    {o.label}
                    {filtro === o.key && <i className="ti ti-check" style={{ fontSize:13 }} aria-hidden="true" />}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ── KPI cards ── */}
      <div className="pres-kgrid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
        {[
          { lbl:'Ingresos reales',  val:hayReal?fmt(ingresosReal):fmt(ingresosPlan), real:ingresosReal, plan:ingresosPlan, tipo:'ingreso' as TipoPartida, desc:'Total facturado en el periodo.', sub:`plan ${fmt(ingresosPlan)}`, iconBg:'#F0F9F4', iconColor:'#2DC653', icon:'ti-arrow-up-right' },
          { lbl:'Margen bruto',     val:hayReal?fmt(margenBrutoReal):fmt(margenBrutoPlan), real:margenBrutoReal||0, plan:margenBrutoPlan, tipo:'ingreso' as TipoPartida, desc:`Ingresos menos coste de personal.`, sub:`${hayReal?margenBrutoRealPct:margenBrutoPct}% s/ingresos`, iconBg:'#EEF1FD', iconColor:'#4361EE', icon:'ti-chart-bar' },
          { lbl:'EBITDA',           val:ebitdaReal!=null?fmt(ebitdaReal):fmt(ebitdaPlan), real:ebitdaReal||0, plan:ebitdaPlan, tipo:'ingreso' as TipoPartida, desc:'Resultado antes de intereses e impuestos.', sub:`plan ${fmt(ebitdaPlan)}`, iconBg:'#FFF8E6', iconColor:'#F4A100', icon:'ti-trending-up' },
          { lbl:'Resultado neto',   val:hayReal?fmt(utilReal):fmt(utilPlan), real:utilReal, plan:utilPlan, tipo:'ingreso' as TipoPartida, desc:'Ingresos menos todos los gastos.', sub:`plan ${fmt(utilPlan)}`, iconBg:'#F0F9F4', iconColor:'#2DC653', icon:'ti-chart-pie' },
        ].map((k, i) => (
          <div key={i} style={{ ...card, padding:'20px 22px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
              <div>
                <div style={{ fontSize:9, fontWeight:600, color:'#1a1a1a', textTransform:'uppercase', letterSpacing:'0.12em' }}>{k.lbl}</div>
                {(k as any).desc && (
                  <div style={{ fontSize:11, color:'#B0B7C3', lineHeight:1.5, marginTop:2 }}>{(k as any).desc}</div>
                )}
              </div>
              <div style={{ width:32, height:32, borderRadius:8, background:k.iconBg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <i className={`ti ${k.icon}`} style={{ fontSize:16, color:k.iconColor }} aria-hidden="true" />
              </div>
            </div>
            <div style={{ fontSize:28, fontWeight:400, color:'#1a1a1a', letterSpacing:'-0.5px', marginTop:10, marginBottom:8 }}>{k.val}</div>
            <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
              {hayReal && k.real > 0 && <DeltaBadge real={k.real} plan={k.plan} tipo={k.tipo} />}
              <span style={{ fontSize:11, color:'#B0B7C3' }}>{k.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Gráfico 2 líneas acumuladas ── */}
      <div style={{ ...card, padding:'22px 24px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
          <div>
            <div style={{ fontSize:9, fontWeight:600, color:'#1a1a1a', textTransform:'uppercase', letterSpacing:'0.12em' }}>Resultado Neto</div>
            <div style={{ fontSize:11, color:'#B0B7C3', lineHeight:1.5, marginTop:2 }}>Evolución acumulada del neto mensual: ingresos menos gastos.</div>
          </div>
          <div style={{ display:'flex', gap:16, alignItems:'center' }}>
            <div style={{ display:'flex', alignItems:'center', gap:5 }}>
              <div style={{ width:20, height:2, background:'#C7D2F8', borderRadius:1, borderTop:'2px dashed #C7D2F8' }} />
              <span style={{ fontSize:11, color:'#888' }}>Plan</span>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:5 }}>
              <div style={{ width:20, height:2, background:'#4361EE', borderRadius:1 }} />
              <span style={{ fontSize:11, color:'#888' }}>Real</span>
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <ComposedChart data={chartData} margin={{ top:4, right:4, left:0, bottom:0 }}>
            <defs>
              <linearGradient id="gReal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4361EE" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#4361EE" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F2" vertical={false} />
            <XAxis dataKey="mes" tick={{ fontSize:11, fill:'#B0B7C3' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize:11, fill:'#B0B7C3' }} axisLine={false} tickLine={false} tickFormatter={v => fmtK(v)} width={52} />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke:'#E8E8EC', strokeWidth:1, strokeDasharray:'3 3' }} />
            <Line type="monotone" dataKey="Plan" stroke="#C7D2F8" strokeWidth={2} strokeDasharray="5 3" dot={false} activeDot={{ r:4, fill:'#C7D2F8', stroke:'#fff', strokeWidth:2 }} />
            <Area type="monotone" dataKey="Real" stroke="#4361EE" strokeWidth={2} fill="url(#gReal)" dot={false} activeDot={{ r:4, fill:'#4361EE', stroke:'#fff', strokeWidth:2 }} connectNulls={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* ── Tablas independientes ── */}
      <CuentaResultados />

      {/* ── Modal nueva partida ── */}
      {modalNueva && (
        <div onClick={e => { if (e.target===e.currentTarget) setModalNueva(false) }}
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.22)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
          <div style={{ background:'#fff', borderRadius:16, padding:'26px 28px', width: nuevaDistrib === 'mensual' ? 520 : 380, maxWidth:'100%', boxShadow:'0 8px 40px rgba(0,0,0,0.12)', maxHeight:'90vh', overflowY:'auto' }}>
            <div style={{ fontSize:15, fontWeight:700, color:'#1a1a1a', marginBottom:20 }}>Nueva línea presupuestaria</div>

            {/* Tipo */}
            <div style={{ marginBottom:14 }}>
              <label style={{ display:'block', fontSize:12, fontWeight:500, color:'#555', marginBottom:7 }}>Tipo</label>
              <div style={{ display:'flex', gap:8 }}>
                {(['ingreso','gasto'] as TipoPartida[]).map(t => (
                  <button key={t} onClick={() => setNuevaTipo(t)} style={{ flex:1, padding:'9px', fontSize:12, borderRadius:8, fontFamily:'inherit', cursor:'pointer', fontWeight:nuevaTipo===t?600:400, border:nuevaTipo===t?'2px solid #4361EE':'1px solid #E8E8EC', background:nuevaTipo===t?'#EEF1FD':'#fff', color:nuevaTipo===t?'#4361EE':'#888' }}>
                    {t==='ingreso'?'Ingreso':'Gasto'}
                  </button>
                ))}
              </div>
            </div>

            {/* Categoría */}
            <div style={{ marginBottom:14 }}>
              <label style={{ display:'block', fontSize:12, fontWeight:500, color:'#555', marginBottom:7 }}>Categoría</label>
              <input type="text" value={nuevaCategoria} onChange={e => setNuevaCategoria(e.target.value)} placeholder="ej. Consultoría externa"
                style={{ width:'100%', padding:'10px 12px', fontSize:13, border:'1px solid #E8E8EC', borderRadius:9, outline:'none', fontFamily:'inherit', color:'#1a1a1a', boxSizing:'border-box' }}
                onFocus={e => (e.target.style.borderColor='#4361EE')} onBlur={e => (e.target.style.borderColor='#E8E8EC')} />
            </div>

            {/* Distribución */}
            <div style={{ marginBottom:14 }}>
              <label style={{ display:'block', fontSize:12, fontWeight:500, color:'#555', marginBottom:7 }}>Distribución del presupuesto</label>
              <div style={{ display:'flex', gap:8 }}>
                {([
                  { key:'lineal', label:'Lineal', sub:'Igual todos los meses' },
                  { key:'mensual', label:'Por mes', sub:'Personaliza cada mes' },
                ] as const).map(d => (
                  <button key={d.key} onClick={() => setNuevaDistrib(d.key)} style={{ flex:1, padding:'10px 12px', fontSize:12, borderRadius:9, fontFamily:'inherit', cursor:'pointer', textAlign:'left', border:nuevaDistrib===d.key?'2px solid #4361EE':'1px solid #E8E8EC', background:nuevaDistrib===d.key?'#EEF1FD':'#fff' }}>
                    <div style={{ fontWeight:600, color:nuevaDistrib===d.key?'#4361EE':'#1a1a1a', marginBottom:2 }}>{d.label}</div>
                    <div style={{ fontSize:11, color:'#888' }}>{d.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Importe — lineal */}
            {nuevaDistrib === 'lineal' && (
              <div style={{ marginBottom:22 }}>
                <label style={{ display:'block', fontSize:12, fontWeight:500, color:'#555', marginBottom:7 }}>Plan anual (€)</label>
                <input type="number" value={nuevaImporte} onChange={e => setNuevaImporte(e.target.value)} placeholder="0" min="0"
                  style={{ width:'100%', padding:'10px 12px', fontSize:13, border:'1px solid #E8E8EC', borderRadius:9, outline:'none', fontFamily:'inherit', color:'#1a1a1a', boxSizing:'border-box' }}
                  onFocus={e => (e.target.style.borderColor='#4361EE')} onBlur={e => (e.target.style.borderColor='#E8E8EC')} />
                <div style={{ fontSize:11, color:'#B0B7C3', marginTop:5 }}>Se distribuye en {nuevaImporte ? `${fmt(Math.round((parseFloat(nuevaImporte)||0)/12))} / mes` : '— / mes'}</div>
              </div>
            )}

            {/* Importe — mensual */}
            {nuevaDistrib === 'mensual' && (
              <div style={{ marginBottom:22 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                  <label style={{ fontSize:12, fontWeight:500, color:'#555' }}>Importe por mes (€)</label>
                  <span style={{ fontSize:11, color:'#4361EE', fontWeight:600 }}>
                    Total: {fmt(nuevaMensual.reduce((a,v)=>a+(v||0),0))}
                  </span>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
                  {MESES.map((mes, i) => (
                    <div key={i}>
                      <div style={{ fontSize:10, fontWeight:600, color:'#B0B7C3', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:4 }}>{mes}</div>
                      <input
                        type="number"
                        value={nuevaMensual[i] || ''}
                        onChange={e => {
                          const v = parseFloat(e.target.value) || 0
                          setNuevaMensual(prev => prev.map((x, j) => j === i ? v : x))
                        }}
                        placeholder="0"
                        min="0"
                        style={{ width:'100%', padding:'7px 8px', fontSize:12, border:'1px solid #E8E8EC', borderRadius:7, outline:'none', fontFamily:'inherit', color:'#1a1a1a', boxSizing:'border-box', textAlign:'right' }}
                        onFocus={e => (e.target.style.borderColor='#4361EE')} onBlur={e => (e.target.style.borderColor='#E8E8EC')}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display:'flex', gap:8 }}>
              <button onClick={() => setModalNueva(false)} style={{ flex:1, padding:'10px', fontSize:13, fontWeight:500, border:'1px solid #E8E8EC', borderRadius:9, background:'#F4F5F7', color:'#555', cursor:'pointer', fontFamily:'inherit' }}>Cancelar</button>
              <button onClick={handleAddPartida}
                disabled={!nuevaCategoria.trim() || (nuevaDistrib==='lineal' && !nuevaImporte)}
                style={{ flex:2, padding:'10px', fontSize:13, fontWeight:600, border:'none', borderRadius:9, background:(!nuevaCategoria.trim()||(nuevaDistrib==='lineal'&&!nuevaImporte))?'#C8CFDA':'#4361EE', color:'#fff', cursor:(!nuevaCategoria.trim()||(nuevaDistrib==='lineal'&&!nuevaImporte))?'not-allowed':'pointer', fontFamily:'inherit' }}>
                Añadir partida
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
