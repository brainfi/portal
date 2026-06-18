import { useState, useMemo, useEffect, useRef } from 'react'
import Layout from '@/components/Layout'
import { useDatos } from '@/contexts/DataContext'
import { buildPagos } from '@/lib/contabilidad'
import { MESES } from '@/lib/periodo'
import { usePeriodo } from '@/hooks/usePeriodo'
import PeriodoFilter from '@/components/PeriodoFilter'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

// ─── Tipos ───────────────────────────────────────────────────────────────────
type CategoriaOp  = 'nominas' | 'fiscal' | 'proveedor' | 'alquiler' | 'suscripcion' | 'ss'
type EstadoOp     = 'vencida' | 'urgente' | 'programada'
type TipoDeuda    = 'financiera' | 'no_financiera'
type PlazoDeuda   = 'corto' | 'largo'
type TipoPrestamo = 'prestamo' | 'leasing' | 'credito' | 'pagare'

interface ObligacionOp {
  id: number; concepto: string; detalle: string
  categoria: CategoriaOp; vencimiento: string; importe: number
  estado: EstadoOp; diasRestantes: number; cuentaPGC: string
}
interface Prestamo {
  id: number; nombre: string; entidad: string
  tipo: TipoPrestamo; clasificacion: TipoDeuda; plazo: PlazoDeuda
  capitalInicial: number; capitalPendiente: number; cuotaMensual: number
  tipoInteres: number; fechaInicio: string; fechaFin: string
  proximaFecha: string; mesesRestantes: number
}

// ─── Fechas (para render) ─────────────────────────────────────────────────────
function parseFecha(v?: string): Date | null {
  if (!v) return null
  const s = String(v).trim()
  if (!s) return null
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (m) { const d = new Date(+m[1], +m[2] - 1, +m[3]); return isNaN(d.getTime()) ? null : d }
  m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/)
  if (m) { let yr = +m[3]; if (yr < 100) yr += 2000; const d = new Date(yr, +m[2] - 1, +m[1]); return isNaN(d.getTime()) ? null : d }
  const d = new Date(s)
  return isNaN(d.getTime()) ? null : d
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n: number) {
  return new Intl.NumberFormat('es-ES', { style:'currency', currency:'EUR', maximumFractionDigits:0 }).format(n)
}
function fmtFecha(iso: string) {
  const d = parseFecha(iso)
  if (!d) return '—'
  return new Intl.DateTimeFormat('es-ES', { day:'numeric', month:'short', year:'numeric' }).format(d)
}

const CAT_CONFIG: Record<CategoriaOp, { label:string; icon:string; color:string; bg:string }> = {
  nominas:     { label:'Nóminas',      icon:'ti-users',         color:'#4361EE', bg:'#EEF1FD' },
  fiscal:      { label:'Fiscal',       icon:'ti-receipt-tax',   color:'#F4A100', bg:'#FFF8E6' },
  proveedor:   { label:'Proveedor',    icon:'ti-truck',         color:'#7B93FF', bg:'#EEF1FD' },
  alquiler:    { label:'Alquiler',     icon:'ti-building',      color:'#60A5FA', bg:'#EFF6FF' },
  suscripcion: { label:'Suscripción',  icon:'ti-device-laptop', color:'#A78BFA', bg:'#F5F3FF' },
  ss:          { label:'Seg. Social',  icon:'ti-heart-rate',    color:'#EF4444', bg:'#FEF2F2' },
}
const ESTADO_CONFIG: Record<EstadoOp, { label:string; color:string; bg:string }> = {
  vencida:    { label:'Vencida',    color:'#b91c1c', bg:'#FEF2F2' },
  urgente:    { label:'Urgente',    color:'#92400E', bg:'#FFF8E6' },
  programada: { label:'Programada', color:'#1a7a3a', bg:'#EAFAF0' },
}
const TIPO_CONFIG: Record<TipoPrestamo, { label:string; icon:string }> = {
  prestamo: { label:'Préstamo',      icon:'ti-building-bank' },
  leasing:  { label:'Leasing',       icon:'ti-car'           },
  credito:  { label:'Línea crédito', icon:'ti-credit-card'   },
  pagare:   { label:'Pagaré/Deuda',  icon:'ti-file-invoice'  },
}

// ─── Amortización francesa ────────────────────────────────────────────────────
function calcAmortizacion(capital: number, tasaAnual: number, meses: number) {
  if (tasaAnual === 0 || meses === 0) return []
  const r = tasaAnual / 100 / 12
  const cuota = capital * (r * Math.pow(1+r, meses)) / (Math.pow(1+r, meses) - 1)
  const rows = []
  let saldo = capital
  const base = new Date('2026-06-01')
  for (let i = 1; i <= meses; i++) {
    const intereses = saldo * r
    const capitalMes = cuota - intereses
    saldo -= capitalMes
    const f = new Date(base)
    f.setMonth(f.getMonth() + i - 1)
    rows.push({
      num: i,
      fecha: f.toISOString().slice(0, 7),
      cuota: Math.round(cuota),
      capital: Math.round(capitalMes),
      intereses: Math.round(intereses),
      saldo: Math.max(0, Math.round(saldo)),
    })
  }
  return rows
}

function Aviso({ icon, texto }: { icon: string; texto: string }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12, padding:'80px 24px', textAlign:'center' }}>
      <div style={{ width:48, height:48, borderRadius:12, background:'#EEF1FD', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <i className={`ti ${icon}`} style={{ fontSize:24, color:'#4361EE' }} aria-hidden="true" />
      </div>
      <div style={{ fontSize:14, color:'#555', maxWidth:380, lineHeight:1.5 }}>{texto}</div>
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function Pagos() {
  // ── Filtro de periodo (mes · trimestre · anual) ──
  // Pagos no filtra por fecha: el periodo es un multiplicador de meses para proyectar cuotas.
  const periodos = useMemo(() => {
    const hoy = new Date()
    const anio = hoy.getFullYear()
    return Array.from({ length: hoy.getMonth() + 1 }, (_, m) => ({
      ym: `${anio}-${String(m + 1).padStart(2, '0')}`,
      label: MESES[m],
    }))
  }, [])
  // Cambia 'anual' por periodos.at(-1)?.ym ?? 'anual' para abrir en el mes actual (1 mes de cuotas).
  const { periodo, setPeriodo, open, setOpen, label: filtroLabel } = usePeriodo(periodos, 'anual')
  const numMeses = periodo === 'anual' ? 12 : periodo.includes('-T') ? 3 : 1

  // Filtros tabla obligaciones
  const [filtroEstado,    setFiltroEstado]    = useState<string>('todos')
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todos')

  // Datos reales desde la hoja conectada (proveedor global)
  const { data, loading, error } = useDatos()
  const { obligaciones, prestamos } = useMemo(() => buildPagos(data?.diario ?? []), [data])

  // Tabla amortización
  const [prestamoSel,         setPrestamoSel]         = useState<Prestamo | null>(null)
  const [mostrarTodasCuotas,  setMostrarTodasCuotas]  = useState(false)
  const autoSel = useRef(false)
  useEffect(() => {
    if (!autoSel.current && prestamos.length) { setPrestamoSel(prestamos.find(p => p.tipo === 'prestamo') ?? prestamos[0]); autoSel.current = true }
  }, [prestamos])

  // ── Totales ──
  const totalOp    = obligaciones.reduce((a, o) => a + o.importe, 0)
  const deudaFin   = prestamos.filter(p => p.clasificacion === 'financiera').reduce((a, p) => a + p.capitalPendiente, 0)
  const deudaNoFin = prestamos.filter(p => p.clasificacion === 'no_financiera').reduce((a, p) => a + p.capitalPendiente, 0)
  const proximoVenc = obligaciones.filter(o => o.diasRestantes >= 0).sort((a, b) => a.diasRestantes - b.diasRestantes)[0]

  // ── Importes del periodo filtrado ──
  const deudaFinMes   = prestamos.filter(p => p.clasificacion === 'financiera' && p.cuotaMensual > 0).reduce((a, p) => a + p.cuotaMensual, 0) * numMeses
  const deudaNoFinMes = prestamos.filter(p => p.clasificacion === 'no_financiera').reduce((a, p) => {
    const m = Math.min(p.mesesRestantes, numMeses)
    return a + (p.capitalPendiente / Math.max(p.mesesRestantes, 1)) * m
  }, 0)

  // ── Gráfico deuda ──
  const chartDeuda = [
    { label:'Fin. corto',  importe: prestamos.filter(p => p.clasificacion === 'financiera'    && p.plazo === 'corto').reduce((a, p) => a + p.capitalPendiente, 0), color:'#7DD3FC' },
    { label:'Fin. largo',  importe: prestamos.filter(p => p.clasificacion === 'financiera'    && p.plazo === 'largo').reduce((a, p) => a + p.capitalPendiente, 0), color:'#4361EE' },
    { label:'No fin.',     importe: prestamos.filter(p => p.clasificacion === 'no_financiera'                       ).reduce((a, p) => a + p.capitalPendiente, 0), color:'#C7D2F8' },
  ]

  // ── Obligaciones filtradas ──
  const obFiltradas = useMemo(() => obligaciones
    .filter(o => (filtroEstado    === 'todos' || o.estado    === filtroEstado)
              && (filtroCategoria === 'todos' || o.categoria === filtroCategoria))
    .sort((a, b) => a.diasRestantes - b.diasRestantes)
  , [obligaciones, filtroEstado, filtroCategoria])

  // ── Amortización ──
  const cuotasAm       = useMemo(() => prestamoSel ? calcAmortizacion(prestamoSel.capitalPendiente, prestamoSel.tipoInteres, prestamoSel.mesesRestantes) : [], [prestamoSel])
  const cuotasVisibles = mostrarTodasCuotas ? cuotasAm : cuotasAm.slice(0, 12)

  const card: React.CSSProperties = { background:'#fff', borderRadius:14, border:'1px solid #E8E8EC' }
  const th: React.CSSProperties   = { fontSize:9, fontWeight:700, color:'#B0B7C3', textTransform:'uppercase', letterSpacing:'0.1em', padding:'0 10px 10px', textAlign:'left' as const }
  const td: React.CSSProperties   = { padding:'11px 10px', fontSize:12, color:'#1a1a1a', verticalAlign:'middle' as const }

  if (loading && !data) return <Layout title="Pagos"><Aviso icon="ti-loader-2" texto="Cargando tus datos…" /></Layout>
  if (error?.code === 'no_sheet') return <Layout title="Pagos"><Aviso icon="ti-table" texto="Conecta tu hoja de Google en Ajustes para ver tus pagos." /></Layout>
  if (error) return <Layout title="Pagos"><Aviso icon="ti-alert-triangle" texto={`No se pudieron cargar los datos: ${error.message}`} /></Layout>
  if (!obligaciones.length && !prestamos.length) return <Layout title="Pagos"><Aviso icon="ti-inbox" texto="Tu libro mayor no tiene pagos pendientes ni deuda todavía. Aquí verás facturas de proveedor por pagar, impuestos y nóminas pendientes, y préstamos." /></Layout>

  return (
    <Layout title="Pagos">
      <style>{`
        @media (max-width:900px){ .pagos-kgrid{grid-template-columns:1fr 1fr !important} .pagos-mid{grid-template-columns:1fr !important} }
        .pagos-tr:hover{background:#FAFAFA}
        .pagos-filtro{border:none;cursor:pointer;font-family:inherit;font-size:12px;padding:5px 12px;border-radius:6px;transition:background .12s}
        .pagos-pres{transition:all .12s}
        .pagos-pres:hover{background:#F4F6FF!important}
      `}</style>

      {/* ── Encabezado ── */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
        <div>
          <div style={{ fontSize:22, fontWeight:700, color:'#1a1a1a', letterSpacing:'-0.4px', marginBottom:3 }}>Pagos</div>
          <div style={{ fontSize:12, color:'#888' }}>Obligaciones operativas, deuda financiera y no financiera</div>
        </div>
        <PeriodoFilter value={periodo} open={open} setOpen={setOpen} onChange={setPeriodo} meses={periodos} />
      </div>

      {/* ── KPI cards ── */}
      <div className="pagos-kgrid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
        {([
          { lbl:'Obligaciones operativas', desc:'Pagos pendientes próximos 30 días.',   val:fmt(totalOp),                iconBg:'#FEF2F2', iconColor:'#EF4444', icon:'ti-calendar-due', sub:undefined },
          { lbl:'Deuda financiera',        desc:`Cuotas ${filtroLabel} · préstamos.`,   val:fmt(Math.round(deudaFinMes)), iconBg:'#EEF1FD', iconColor:'#4361EE', icon:'ti-building-bank', sub:`Total pendiente ${fmt(deudaFin)}` },
          { lbl:'Deuda no financiera',     desc:`Vencimientos ${filtroLabel}.`,          val:fmt(Math.round(deudaNoFinMes)),iconBg:'#FFF8E6', iconColor:'#F4A100', icon:'ti-receipt',       sub:`Total pendiente ${fmt(deudaNoFin)}` },
          { lbl:'Próximo vencimiento',     desc:'Obligación más urgente pendiente.',    val:proximoVenc ? `${proximoVenc.diasRestantes}d` : '—', iconBg:'#F0F9F4', iconColor:'#2DC653', icon:'ti-clock', sub:proximoVenc ? `${proximoVenc.concepto} · ${fmt(proximoVenc.importe)}` : '' },
        ] as const).map((k, i) => (
          <div key={i} style={{ ...card, padding:'20px 22px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
              <div style={{ flex:1, minWidth:0, paddingRight:10 }}>
                <div style={{ fontSize:9, fontWeight:600, color:'#1a1a1a', textTransform:'uppercase', letterSpacing:'0.12em' }}>{k.lbl}</div>
                <div style={{ fontSize:11, color:'#B0B7C3', marginTop:2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{k.desc}</div>
              </div>
              <div style={{ width:32, height:32, borderRadius:8, background:k.iconBg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <i className={`ti ${k.icon}`} style={{ fontSize:16, color:k.iconColor }} aria-hidden="true" />
              </div>
            </div>
            <div style={{ fontSize:28, fontWeight:400, color:'#1a1a1a', letterSpacing:'-0.5px', marginTop:10, marginBottom:k.sub ? 6 : 0 }}>{k.val}</div>
            {k.sub && <div style={{ fontSize:11, color:'#B0B7C3', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{k.sub}</div>}
          </div>
        ))}
      </div>

      {/* ── Obligaciones operativas ── */}
      <div style={{ ...card, padding:'22px 24px' }}>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:16, flexWrap:'wrap', gap:10 }}>
          <div>
            <div style={{ fontSize:9, fontWeight:600, color:'#1a1a1a', textTransform:'uppercase', letterSpacing:'0.12em' }}>Obligaciones operativas</div>
            <div style={{ fontSize:11, color:'#B0B7C3', marginTop:2 }}>Pagos con origen en actividad ordinaria — fuente: Holded (próximamente).</div>
          </div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            <div style={{ display:'flex', gap:2, background:'#F4F5F7', borderRadius:8, padding:3 }}>
              {(['todos','vencida','urgente','programada'] as const).map(e => (
                <button key={e} className="pagos-filtro"
                  style={{ background:filtroEstado===e?'#fff':'transparent', color:filtroEstado===e?'#1a1a1a':'#888', fontWeight:filtroEstado===e?600:400, boxShadow:filtroEstado===e?'0 1px 4px rgba(0,0,0,0.08)':'none' }}
                  onClick={() => setFiltroEstado(e)}>
                  {e === 'todos' ? 'Todos' : ESTADO_CONFIG[e].label}
                </button>
              ))}
            </div>
            <select value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)}
              style={{ padding:'6px 10px', fontSize:12, border:'1px solid #E8E8EC', borderRadius:8, outline:'none', fontFamily:'inherit', color:'#1a1a1a', background:'#fff' }}>
              <option value="todos">Todas las categorías</option>
              {(Object.keys(CAT_CONFIG) as CategoriaOp[]).map(k => <option key={k} value={k}>{CAT_CONFIG[k].label}</option>)}
            </select>
          </div>
        </div>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', minWidth:580 }}>
            <thead>
              <tr style={{ borderBottom:'1px solid #ECEEF3' }}>
                <th style={th}>Concepto</th>
                <th style={{ ...th, textAlign:'center' as const }}>Categoría</th>
                <th style={{ ...th, textAlign:'right' as const }}>Importe</th>
                <th style={{ ...th, textAlign:'center' as const }}>Vencimiento</th>
                <th style={{ ...th, textAlign:'center' as const }}>Estado</th>
                <th style={th}>Cuenta PGC</th>
              </tr>
            </thead>
            <tbody>
              {obFiltradas.map(o => {
                const cat = CAT_CONFIG[o.categoria]
                const est = ESTADO_CONFIG[o.estado]
                return (
                  <tr key={o.id} className="pagos-tr" style={{ borderBottom:'1px solid #F4F5F7' }}>
                    <td style={td}>
                      <div style={{ fontWeight:500 }}>{o.concepto}</div>
                      <div style={{ fontSize:10, color:'#B0B7C3' }}>{o.detalle}</div>
                    </td>
                    <td style={{ ...td, textAlign:'center' as const }}>
                      <div style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 9px', borderRadius:99, background:cat.bg }}>
                        <i className={`ti ${cat.icon}`} style={{ fontSize:11, color:cat.color }} aria-hidden="true" />
                        <span style={{ fontSize:10, fontWeight:600, color:cat.color }}>{cat.label}</span>
                      </div>
                    </td>
                    <td style={{ ...td, textAlign:'right' as const, fontWeight:600, color:o.estado==='vencida'?'#b91c1c':'#1a1a1a' }}>{fmt(o.importe)}</td>
                    <td style={{ ...td, textAlign:'center' as const }}>
                      <div style={{ fontSize:12 }}>{fmtFecha(o.vencimiento)}</div>
                      {o.diasRestantes < 0
                        ? <div style={{ fontSize:10, color:'#b91c1c', fontWeight:500 }}>{Math.abs(o.diasRestantes)}d vencida</div>
                        : o.diasRestantes <= 10
                        ? <div style={{ fontSize:10, color:'#F4A100', fontWeight:500 }}>en {o.diasRestantes}d</div>
                        : <div style={{ fontSize:10, color:'#B0B7C3' }}>en {o.diasRestantes}d</div>}
                    </td>
                    <td style={{ ...td, textAlign:'center' as const }}>
                      <span style={{ fontSize:11, fontWeight:600, padding:'3px 9px', borderRadius:99, background:est.bg, color:est.color }}>{est.label}</span>
                    </td>
                    <td style={td}>
                      <span style={{ fontSize:11, fontWeight:600, color:'#4361EE', background:'#EEF1FD', padding:'2px 7px', borderRadius:6 }}>{o.cuentaPGC}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr style={{ borderTop:'1px solid #ECEEF3', background:'#EEF1FD' }}>
                <td style={{ ...td, fontWeight:700, color:'#4361EE' }} colSpan={2}>Total obligaciones</td>
                <td style={{ ...td, textAlign:'right' as const, fontWeight:700, color:'#4361EE' }}>{fmt(obFiltradas.reduce((a, o) => a + o.importe, 0))}</td>
                <td colSpan={3} />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ── Deuda: gráfico + listado ── */}
      <div className="pagos-mid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>

        {/* Gráfico */}
        <div style={{ ...card, padding:'22px 24px', display:'flex', flexDirection:'column' }}>
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:9, fontWeight:600, color:'#1a1a1a', textTransform:'uppercase', letterSpacing:'0.12em' }}>Estructura de deuda</div>
            <div style={{ fontSize:11, color:'#B0B7C3', marginTop:2 }}>Desglose por clasificación y plazo.</div>
          </div>
          <div style={{ flex:1, minHeight:180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartDeuda} margin={{ top:4, right:4, left:0, bottom:0 }} barCategoryGap="35%">
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F2" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize:11, fill:'#B0B7C3' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:11, fill:'#B0B7C3' }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `${Math.round(v/1000)}k €` : String(v)} width={52} />
                <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ borderRadius:10, border:'1px solid #E8E8EC', fontSize:12 }} />
                <Bar dataKey="importe" radius={[6,6,0,0]} maxBarSize={64}>
                  {chartDeuda.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginTop:12, paddingTop:12, borderTop:'1px solid #F4F5F7' }}>
            {chartDeuda.map((d, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:5 }}>
                <div style={{ width:8, height:8, borderRadius:2, background:d.color }} />
                <span style={{ fontSize:10, color:'#888' }}>{d.label}: <strong>{fmt(d.importe)}</strong></span>
              </div>
            ))}
          </div>
        </div>

        {/* Listado préstamos */}
        <div style={{ ...card, padding:'22px 24px' }}>
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:9, fontWeight:600, color:'#1a1a1a', textTransform:'uppercase', letterSpacing:'0.12em' }}>Instrumentos de deuda</div>
            <div style={{ fontSize:11, color:'#B0B7C3', marginTop:2 }}>Haz clic para ver la tabla de amortización.</div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {prestamos.map(p => {
              const tipo = TIPO_CONFIG[p.tipo]
              const sel  = prestamoSel?.id === p.id
              return (
                <div key={p.id} className="pagos-pres"
                  onClick={() => setPrestamoSel(sel ? null : p)}
                  style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 12px', borderRadius:10, border:`1px solid ${sel?'#4361EE':'#E8E8EC'}`, background:sel?'#EEF1FD':'#FAFAFA', cursor:'pointer' }}>
                  <div style={{ width:30, height:30, borderRadius:8, background:p.clasificacion==='financiera'?'#EEF1FD':'#FFF8E6', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <i className={`ti ${tipo.icon}`} style={{ fontSize:14, color:p.clasificacion==='financiera'?'#4361EE':'#F4A100' }} aria-hidden="true" />
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:12, fontWeight:500, color:'#1a1a1a', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.nombre}</div>
                    <div style={{ fontSize:10, color:'#B0B7C3' }}>{p.entidad} · {tipo.label} · {p.plazo==='corto'?'Corto plazo':'Largo plazo'}</div>
                  </div>
                  <div style={{ textAlign:'right', flexShrink:0 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:sel?'#4361EE':'#1a1a1a' }}>{fmt(p.capitalPendiente)}</div>
                    <div style={{ fontSize:10, color:'#B0B7C3' }}>{p.mesesRestantes} meses</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Tabla de amortización ── */}
      {prestamoSel && (
        <div style={{ ...card, padding:'22px 24px' }}>
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:18, flexWrap:'wrap', gap:10 }}>
            <div>
              <div style={{ fontSize:9, fontWeight:600, color:'#1a1a1a', textTransform:'uppercase', letterSpacing:'0.12em' }}>Tabla de amortización</div>
              <div style={{ fontSize:11, color:'#B0B7C3', marginTop:2 }}>
                {prestamoSel.nombre} · {prestamoSel.entidad} · {prestamoSel.tipoInteres}% TIN · cuota francesa
              </div>
            </div>
            <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
              {[
                { lbl:'Capital pendiente', val:fmt(prestamoSel.capitalPendiente),  color:'#4361EE' },
                { lbl:'Cuota mensual',     val:prestamoSel.tipoInteres>0 ? fmt(cuotasAm[0]?.cuota||0) : 'Variable', color:'#1a1a1a' },
                { lbl:'Total intereses',   val:prestamoSel.tipoInteres>0 ? fmt(cuotasAm.reduce((a,c)=>a+c.intereses,0)) : '—', color:'#F4A100' },
                { lbl:'Fin contrato',      val:fmtFecha(prestamoSel.fechaFin),     color:'#888'    },
              ].map((s, i) => (
                <div key={i} style={{ textAlign:'right' }}>
                  <div style={{ fontSize:9, fontWeight:600, color:'#B0B7C3', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:2 }}>{s.lbl}</div>
                  <div style={{ fontSize:14, fontWeight:600, color:s.color }}>{s.val}</div>
                </div>
              ))}
            </div>
          </div>

          {prestamoSel.tipoInteres === 0 ? (
            <div style={{ textAlign:'center', padding:'32px', fontSize:13, color:'#B0B7C3' }}>
              <i className="ti ti-info-circle" style={{ fontSize:24, display:'block', marginBottom:8 }} aria-hidden="true" />
              Este instrumento no genera intereses — no aplica tabla de amortización.
            </div>
          ) : (
            <>
              <div style={{ overflowX:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse', minWidth:560 }}>
                  <thead>
                    <tr style={{ borderBottom:'1px solid #ECEEF3' }}>
                      {['Nº','Fecha','Cuota total','Capital','Intereses','Saldo pendiente'].map((h, i) => (
                        <th key={i} style={{ fontSize:9, fontWeight:700, color:'#B0B7C3', textTransform:'uppercase', letterSpacing:'0.1em', padding:'0 10px 10px', textAlign:(i>1?'right':'left') as 'right' | 'left' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {cuotasVisibles.map((c, i) => (
                      <tr key={c.num} className="pagos-tr" style={{ borderBottom:'1px solid #F4F5F7', background:i===0?'#F4F6FF':'transparent' }}>
                        <td style={{ ...td, fontWeight:i===0?600:400, color:i===0?'#4361EE':'#888' }}>{c.num}</td>
                        <td style={td}>{c.fecha}</td>
                        <td style={{ ...td, textAlign:'right' as const, fontWeight:600 }}>{fmt(c.cuota)}</td>
                        <td style={{ ...td, textAlign:'right' as const, color:'#4361EE', fontWeight:500 }}>{fmt(c.capital)}</td>
                        <td style={{ ...td, textAlign:'right' as const, color:'#F4A100' }}>{fmt(c.intereses)}</td>
                        <td style={{ ...td, textAlign:'right' as const, fontWeight:600 }}>{fmt(c.saldo)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ borderTop:'1px solid #ECEEF3', background:'#EEF1FD' }}>
                      <td style={{ ...td, fontWeight:700, color:'#4361EE' }} colSpan={2}>Total</td>
                      <td style={{ ...td, textAlign:'right' as const, fontWeight:700, color:'#4361EE' }}>{fmt(cuotasAm.reduce((a,c)=>a+c.cuota,0))}</td>
                      <td style={{ ...td, textAlign:'right' as const, fontWeight:700, color:'#4361EE' }}>{fmt(prestamoSel.capitalPendiente)}</td>
                      <td style={{ ...td, textAlign:'right' as const, fontWeight:700, color:'#F4A100' }}>{fmt(cuotasAm.reduce((a,c)=>a+c.intereses,0))}</td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
              {cuotasAm.length > 12 && (
                <div style={{ textAlign:'center', marginTop:12 }}>
                  <button onClick={() => setMostrarTodasCuotas(v => !v)}
                    style={{ fontSize:12, fontWeight:500, color:'#4361EE', border:'1px solid #C7D2F8', background:'#EEF1FD', borderRadius:8, padding:'8px 18px', cursor:'pointer', fontFamily:'inherit' }}>
                    {mostrarTodasCuotas ? 'Mostrar menos ↑' : `Ver las ${cuotasAm.length - 12} cuotas restantes ↓`}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </Layout>
  )
}
