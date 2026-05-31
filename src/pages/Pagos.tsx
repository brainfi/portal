import { useState, useMemo } from 'react'
import Layout from '@/components/Layout'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

// ─── Tipos ───────────────────────────────────────────────────────────────────
type CategoriaOp = 'nominas' | 'fiscal' | 'proveedor' | 'alquiler' | 'suscripcion' | 'ss'
type EstadoOp    = 'vencida' | 'urgente' | 'programada'
type TipoDeuda   = 'financiera' | 'no_financiera'
type PlazoDeuda  = 'corto' | 'largo'
type TipoPrestamo = 'prestamo' | 'leasing' | 'credito' | 'pagare'

interface ObligacionOp {
  id: number
  concepto: string
  detalle: string
  categoria: CategoriaOp
  vencimiento: string
  importe: number
  estado: EstadoOp
  diasRestantes: number
  cuentaPGC: string
}

interface Prestamo {
  id: number
  nombre: string
  entidad: string
  tipo: TipoPrestamo
  clasificacion: TipoDeuda
  plazo: PlazoDeuda
  capitalInicial: number
  capitalPendiente: number
  cuotaMensual: number
  tipoInteres: number
  fechaInicio: string
  fechaFin: string
  proximaFecha: string
  mesesRestantes: number
}

// ─── Datos mock ───────────────────────────────────────────────────────────────
const obligaciones: ObligacionOp[] = [
  { id:1,  concepto:'IVA Q2 · Mod. 303',         detalle:'AEAT · Autoliquidación trimestral',    categoria:'fiscal',      vencimiento:'2026-07-20', importe:21850, estado:'programada', diasRestantes:50, cuentaPGC:'477' },
  { id:2,  concepto:'IRPF · Mod. 111',            detalle:'AEAT · Retenciones trabajadores',      categoria:'fiscal',      vencimiento:'2026-07-20', importe:4200,  estado:'programada', diasRestantes:50, cuentaPGC:'4751' },
  { id:3,  concepto:'Ret. Alquileres · Mod. 115', detalle:'AEAT · Retenciones arrendamientos',    categoria:'fiscal',      vencimiento:'2026-07-20', importe:630,   estado:'programada', diasRestantes:50, cuentaPGC:'4751' },
  { id:4,  concepto:'Nóminas · junio 2026',       detalle:'8 empleados · SS incluida',            categoria:'nominas',     vencimiento:'2026-06-30', importe:18400, estado:'programada', diasRestantes:30, cuentaPGC:'640' },
  { id:5,  concepto:'Seguridad Social · mayo',    detalle:'TGSS · cuota empresarial',             categoria:'ss',          vencimiento:'2026-06-10', importe:6200,  estado:'urgente',    diasRestantes:10, cuentaPGC:'476' },
  { id:6,  concepto:'Alquiler oficina · junio',   detalle:'Proveedor · contrato anual',           categoria:'alquiler',    vencimiento:'2026-06-01', importe:2100,  estado:'vencida',    diasRestantes:-1, cuentaPGC:'621' },
  { id:7,  concepto:'Adobe Creative Cloud',       detalle:'Suscripción · 5 licencias',            categoria:'suscripcion', vencimiento:'2026-06-05', importe:290,   estado:'urgente',    diasRestantes:5,  cuentaPGC:'629' },
  { id:8,  concepto:'HubSpot CRM · Pro',          detalle:'Suscripción mensual',                  categoria:'suscripcion', vencimiento:'2026-06-10', importe:450,   estado:'urgente',    diasRestantes:10, cuentaPGC:'629' },
  { id:9,  concepto:'Proveedor suministros A',    detalle:'Factura #2026-0341 · 30 días',         categoria:'proveedor',   vencimiento:'2026-06-15', importe:3800,  estado:'urgente',    diasRestantes:15, cuentaPGC:'400' },
  { id:10, concepto:'Proveedor logística B',      detalle:'Factura #2026-0287 · vencida',         categoria:'proveedor',   vencimiento:'2026-05-20', importe:4600,  estado:'vencida',    diasRestantes:-11,cuentaPGC:'400' },
]

const prestamos: Prestamo[] = [
  { id:1, nombre:'Préstamo ICO Digitalización', entidad:'Santander',  tipo:'prestamo', clasificacion:'financiera', plazo:'largo',  capitalInicial:150000, capitalPendiente:120000, cuotaMensual:2340, tipoInteres:4.5, fechaInicio:'2024-01-01', fechaFin:'2029-01-01', proximaFecha:'2026-06-01', mesesRestantes:55 },
  { id:2, nombre:'Línea de crédito',           entidad:'BBVA',        tipo:'credito',  clasificacion:'financiera', plazo:'corto',  capitalInicial:40000,  capitalPendiente:25000,  cuotaMensual:0,    tipoInteres:6.5, fechaInicio:'2025-06-01', fechaFin:'2026-12-01', proximaFecha:'2026-12-01', mesesRestantes:7 },
  { id:3, nombre:'Leasing vehículo comercial', entidad:'CaixaBank',   tipo:'leasing',  clasificacion:'financiera', plazo:'largo',  capitalInicial:28000,  capitalPendiente:19600,  cuotaMensual:520,  tipoInteres:3.9, fechaInicio:'2023-07-01', fechaFin:'2027-07-01', proximaFecha:'2026-06-01', mesesRestantes:25 },
  { id:4, nombre:'Facturas proveedores',        entidad:'Varios',      tipo:'pagare',   clasificacion:'no_financiera', plazo:'corto', capitalInicial:8400, capitalPendiente:8400,  cuotaMensual:0,    tipoInteres:0,   fechaInicio:'2026-05-01', fechaFin:'2026-06-30', proximaFecha:'2026-06-30', mesesRestantes:1 },
  { id:5, nombre:'SS pendiente · mayo',         entidad:'TGSS',        tipo:'pagare',   clasificacion:'no_financiera', plazo:'corto', capitalInicial:6200, capitalPendiente:6200,  cuotaMensual:0,    tipoInteres:0,   fechaInicio:'2026-05-01', fechaFin:'2026-06-10', proximaFecha:'2026-06-10', mesesRestantes:1 },
  { id:6, nombre:'Retenciones IRPF pendientes', entidad:'AEAT',        tipo:'pagare',   clasificacion:'no_financiera', plazo:'corto', capitalInicial:4830, capitalPendiente:4830,  cuotaMensual:0,    tipoInteres:0,   fechaInicio:'2026-04-01', fechaFin:'2026-07-20', proximaFecha:'2026-07-20', mesesRestantes:2 },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n: number) {
  return new Intl.NumberFormat('es-ES', { style:'currency', currency:'EUR', maximumFractionDigits:0 }).format(n)
}
function fmtFecha(iso: string) {
  return new Intl.DateTimeFormat('es-ES', { day:'numeric', month:'short', year:'numeric' }).format(new Date(iso))
}

const CAT_CONFIG: Record<CategoriaOp, { label:string; icon:string; color:string; bg:string }> = {
  nominas:     { label:'Nóminas',       icon:'ti-users',        color:'#4361EE', bg:'#EEF1FD' },
  fiscal:      { label:'Fiscal',        icon:'ti-receipt-tax',  color:'#F4A100', bg:'#FFF8E6' },
  proveedor:   { label:'Proveedor',     icon:'ti-truck',        color:'#7B93FF', bg:'#EEF1FD' },
  alquiler:    { label:'Alquiler',      icon:'ti-building',     color:'#60A5FA', bg:'#EFF6FF' },
  suscripcion: { label:'Suscripción',   icon:'ti-device-laptop',color:'#A78BFA', bg:'#F5F3FF' },
  ss:          { label:'Seg. Social',   icon:'ti-heart-rate',   color:'#EF4444', bg:'#FEF2F2' },
}
const ESTADO_CONFIG: Record<EstadoOp, { label:string; color:string; bg:string }> = {
  vencida:    { label:'Vencida',    color:'#b91c1c', bg:'#FEF2F2' },
  urgente:    { label:'Urgente',    color:'#92400E', bg:'#FFF8E6' },
  programada: { label:'Programada', color:'#1a7a3a', bg:'#EAFAF0' },
}
const TIPO_CONFIG: Record<TipoPrestamo, { label:string; icon:string }> = {
  prestamo: { label:'Préstamo',      icon:'ti-building-bank' },
  leasing:  { label:'Leasing',       icon:'ti-car' },
  credito:  { label:'Línea crédito', icon:'ti-credit-card' },
  pagare:   { label:'Pagaré/Deuda',  icon:'ti-file-invoice' },
}

// ─── Cálculo amortización francesa ───────────────────────────────────────────
function calcAmortizacion(capital: number, tasaAnual: number, meses: number) {
  if (tasaAnual === 0) return []
  const r = tasaAnual / 100 / 12
  const cuota = capital * (r * Math.pow(1+r, meses)) / (Math.pow(1+r, meses) - 1)
  const rows = []
  let saldo = capital
  const hoy = new Date('2026-06-01')
  for (let i = 1; i <= meses; i++) {
    const intereses = saldo * r
    const capitalMes = cuota - intereses
    saldo -= capitalMes
    const fecha = new Date(hoy)
    fecha.setMonth(fecha.getMonth() + i - 1)
    rows.push({
      num: i,
      fecha: fecha.toISOString().slice(0, 7),
      cuota: Math.round(cuota),
      capital: Math.round(capitalMes),
      intereses: Math.round(intereses),
      saldo: Math.max(0, Math.round(saldo)),
    })
  }
  return rows
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function Pagos() {
  const [filtroEstado, setFiltroEstado] = useState<string>('todos')
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todos')
  const [prestamoSeleccionado, setPrestamoSeleccionado] = useState<Prestamo | null>(prestamos.find(p=>p.tipo==='prestamo')||null)
  const [mostrarTodasCuotas, setMostrarTodasCuotas] = useState(false)
  const [filtroOpen, setFiltroOpen] = useState(false)
  const [filtro, setFiltro] = useState<number|'anual'>(5)
  const MESES_F = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
  const filtroLabel = filtro === 'anual' ? 'Último año' : MESES_LABEL[filtro as number]

  // ── Totales ──
  const totalOp        = obligaciones.reduce((a,o)=>a+o.importe,0)
  const deudaFin       = prestamos.filter(p=>p.clasificacion==='financiera').reduce((a,p)=>a+p.capitalPendiente,0)
  const deudaNoFin     = prestamos.filter(p=>p.clasificacion==='no_financiera').reduce((a,p)=>a+p.capitalPendiente,0)
  const proximoVenc    = obligaciones.filter(o=>o.diasRestantes>=0).sort((a,b)=>a.diasRestantes-b.diasRestantes)[0]

  // Importe del mes filtrado para deuda
  const numMeses       = filtro === 'anual' ? 12 : 1
  const deudaFinMes    = prestamos.filter(p=>p.clasificacion==='financiera'&&p.cuotaMensual>0).reduce((a,p)=>a+p.cuotaMensual,0) * numMeses
  const deudaNoFinMes  = prestamos.filter(p=>p.clasificacion==='no_financiera').reduce((a,p)=>{
    const meses = p.mesesRestantes <= (filtro==='anual'?12:1) ? p.mesesRestantes : (filtro==='anual'?12:1)
    return a + (p.capitalPendiente / Math.max(p.mesesRestantes,1)) * meses
  }, 0)

  // ── Obligaciones filtradas ──
  const obFiltradas = useMemo(() => obligaciones.filter(o => {
    if (filtroEstado !== 'todos' && o.estado !== filtroEstado) return false
    if (filtroCategoria !== 'todos' && o.categoria !== filtroCategoria) return false
    return true
  }), [filtroEstado, filtroCategoria])

  // ── Datos gráfico deuda por categoría ──
  const chartDeuda = [
    { label:'Financiera\ncorto',  importe: prestamos.filter(p=>p.clasificacion==='financiera'&&p.plazo==='corto').reduce((a,p)=>a+p.capitalPendiente,0), color:'#7DD3FC' },
    { label:'Financiera\nlargo',  importe: prestamos.filter(p=>p.clasificacion==='financiera'&&p.plazo==='largo').reduce((a,p)=>a+p.capitalPendiente,0), color:'#4361EE' },
    { label:'No financiera\ncorto',importe: prestamos.filter(p=>p.clasificacion==='no_financiera'&&p.plazo==='corto').reduce((a,p)=>a+p.capitalPendiente,0), color:'#C7D2F8' },
  ]

  // ── Tabla amortización ──
  const cuotasAm = useMemo(() => {
    if (!prestamoSeleccionado || prestamoSeleccionado.tipoInteres === 0) return []
    return calcAmortizacion(
      prestamoSeleccionado.capitalPendiente,
      prestamoSeleccionado.tipoInteres,
      prestamoSeleccionado.mesesRestantes
    )
  }, [prestamoSeleccionado])

  const cuotasVisibles = mostrarTodasCuotas ? cuotasAm : cuotasAm.slice(0, 12)

  const card: React.CSSProperties = { background:'#fff', borderRadius:14, border:'1px solid #E8E8EC' }
  const th: React.CSSProperties   = { fontSize:9, fontWeight:700, color:'#B0B7C3', textTransform:'uppercase', letterSpacing:'0.1em', padding:'0 10px 10px', textAlign:'left' as const }
  const td: React.CSSProperties   = { padding:'11px 10px', fontSize:12, color:'#1a1a1a', verticalAlign:'middle' as const }

  return (
    <Layout title="Pagos">
      <style>{`
        @media (max-width:900px){ .pagos-kgrid{grid-template-columns:1fr 1fr !important} .pagos-mid{grid-template-columns:1fr !important} }
        .pagos-tr:hover{background:#FAFAFA;cursor:default}
        .pagos-filtro{border:none;cursor:pointer;font-family:inherit;font-size:12px;padding:5px 12px;border-radius:6px;transition:background .12s}
        .pagos-pres:hover{background:#F4F6FF!important;cursor:pointer}
      `}</style>

      {filtroOpen && <div onClick={()=>setFiltroOpen(false)} style={{position:'fixed',inset:0,zIndex:40}}/>}

      {filtroOpen && (
        <div onClick={() => setFiltroOpen(false)} style={{ position:'fixed', inset:0, zIndex:40 }} />
      )}

      {/* ── Encabezado ── */}
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:12,flexWrap:'wrap'}}>
        <div>
          <div style={{fontSize:22,fontWeight:700,color:'#1a1a1a',letterSpacing:'-0.4px',marginBottom:3}}>Pagos</div>
          <div style={{fontSize:12,color:'#888'}}>Obligaciones operativas, deuda financiera y no financiera</div>
        </div>
        <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
          <div style={{position:'relative'}}>
            <button onClick={()=>setFiltroOpen(o=>!o)}
              style={{display:'inline-flex',alignItems:'center',gap:8,padding:'8px 14px',fontSize:13,fontWeight:500,border:'1px solid #E8E8EC',borderRadius:10,background:'#F4F5F7',color:'#1a1a1a',cursor:'pointer',fontFamily:'inherit'}}>
              {filtroLabel}
              <i className="ti ti-chevron-down" style={{fontSize:14,color:'#888'}} aria-hidden="true"/>
            </button>
            {filtroOpen && (
              <div style={{position:'absolute',top:'calc(100% + 6px)',right:0,zIndex:50,background:'#fff',border:'1px solid #E8E8EC',borderRadius:12,padding:'6px',minWidth:180,boxShadow:'0 4px 20px rgba(0,0,0,0.08)'}}>
                <div style={{fontSize:9,fontWeight:700,color:'#B0B7C3',textTransform:'uppercase',letterSpacing:'0.1em',padding:'4px 12px 6px'}}>2026</div>
                {[4,5].map(m=>(
                  <button key={m} onClick={()=>{setFiltro(m);setFiltroOpen(false)}}
                    style={{display:'flex',alignItems:'center',justifyContent:'space-between',width:'100%',padding:'8px 12px',fontSize:13,border:'none',borderRadius:7,cursor:'pointer',fontFamily:'inherit',textAlign:'left',background:filtro===m?'#EEF1FD':'transparent',color:filtro===m?'#4361EE':'#1a1a1a',fontWeight:filtro===m?600:400}}>
                    {m===5?'Jun (este mes)':MESES_LABEL[m]}
                    {filtro===m && <i className="ti ti-check" style={{fontSize:13}} aria-hidden="true"/>}
                  </button>
                ))}
                <div style={{height:'1px',background:'#F4F5F7',margin:'4px 0'}}/>
                <div style={{fontSize:9,fontWeight:700,color:'#B0B7C3',textTransform:'uppercase',letterSpacing:'0.1em',padding:'4px 12px 6px'}}>Acumulado</div>
                <button onClick={()=>{setFiltro('anual');setFiltroOpen(false)}}
                  style={{display:'flex',alignItems:'center',justifyContent:'space-between',width:'100%',padding:'8px 12px',fontSize:13,border:'none',borderRadius:7,cursor:'pointer',fontFamily:'inherit',textAlign:'left',background:filtro==='anual'?'#EEF1FD':'transparent',color:filtro==='anual'?'#4361EE':'#1a1a1a',fontWeight:filtro==='anual'?600:400}}>
                  Último año
                  {filtro==='anual'&&<i className="ti ti-check" style={{fontSize:13}} aria-hidden="true"/>}
                </button>
              </div>
            )}
          </div>
          <button disabled style={{display:'inline-flex',alignItems:'center',gap:6,padding:'8px 14px',fontSize:12,fontWeight:500,border:'1px solid #E8E8EC',borderRadius:8,background:'#F4F5F7',color:'#B0B7C3',cursor:'not-allowed',fontFamily:'inherit'}}>
            <i className="ti ti-plug" style={{fontSize:13}} aria-hidden="true"/>
            Sincronizar Holded
            <span style={{fontSize:9,fontWeight:700,padding:'1px 5px',borderRadius:4,background:'#EEF1FD',color:'#4361EE'}}>PRONTO</span>
          </button>
        </div>
      </div>

      {/* ── KPI cards ── */}
      <div className="pagos-kgrid" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12}}>
        {[
          { lbl:'Obligaciones operativas', desc:'Pagos pendientes próximos 30 días.', val:fmt(totalOp), iconBg:'#FEF2F2', iconColor:'#EF4444', icon:'ti-calendar-due' },
          { lbl:'Deuda financiera', desc:`Cuotas ${filtroLabel} · préstamos y leasing.`, val:fmt(Math.round(deudaFinMes)), sub:`Total pendiente ${fmt(deudaFin)}`, iconBg:'#EEF1FD', iconColor:'#4361EE', icon:'ti-building-bank' },
          { lbl:'Deuda no financiera', desc:`Vencimientos ${filtroLabel} · proveedores y AEAT.`, val:fmt(Math.round(deudaNoFinMes)), sub:`Total pendiente ${fmt(deudaNoFin)}`, iconBg:'#FFF8E6', iconColor:'#F4A100', icon:'ti-receipt' },
          { lbl:'Próximo vencimiento',     desc:'Obligación más urgente pendiente.', val:proximoVenc?`${proximoVenc.diasRestantes}d`:'—', sub:proximoVenc?`${proximoVenc.concepto} · ${fmt(proximoVenc.importe)}`:'', iconBg:'#F0F9F4', iconColor:'#2DC653', icon:'ti-clock' },
        ].map((k,i)=>(
          <div key={i} style={{...card,padding:'20px 22px'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}>
              <div style={{flex:1,minWidth:0,paddingRight:10}}>
                <div style={{fontSize:9,fontWeight:600,color:'#1a1a1a',textTransform:'uppercase',letterSpacing:'0.12em'}}>{k.lbl}</div>
                <div style={{fontSize:11,color:'#B0B7C3',marginTop:2,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{k.desc}</div>
              </div>
              <div style={{width:32,height:32,borderRadius:8,background:k.iconBg,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <i className={`ti ${k.icon}`} style={{fontSize:16,color:k.iconColor}} aria-hidden="true"/>
              </div>
            </div>
            <div style={{fontSize:28,fontWeight:400,color:'#1a1a1a',letterSpacing:'-0.5px',marginTop:10,marginBottom:(k as any).sub?6:0}}>{k.val}</div>
            {(k as any).sub && <div style={{fontSize:11,color:'#B0B7C3',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{(k as any).sub}</div>}
          </div>
        ))}
      </div>

      {/* ── Obligaciones operativas ── */}
      <div style={{...card,padding:'22px 24px'}}>
        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:16,flexWrap:'wrap',gap:10}}>
          <div>
            <div style={{fontSize:9,fontWeight:600,color:'#1a1a1a',textTransform:'uppercase',letterSpacing:'0.12em'}}>Obligaciones operativas</div>
            <div style={{fontSize:11,color:'#B0B7C3',marginTop:2}}>Pagos con origen en actividad ordinaria — fuente: Holded (próximamente).</div>
          </div>
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            <div style={{display:'flex',gap:2,background:'#F4F5F7',borderRadius:8,padding:3}}>
              {['todos','vencida','urgente','programada'].map(e=>(
                <button key={e} className="pagos-filtro"
                  style={{background:filtroEstado===e?'#fff':'transparent',color:filtroEstado===e?'#1a1a1a':'#888',fontWeight:filtroEstado===e?600:400,boxShadow:filtroEstado===e?'0 1px 4px rgba(0,0,0,0.08)':'none'}}
                  onClick={()=>setFiltroEstado(e)}>
                  {e==='todos'?'Todos':ESTADO_CONFIG[e as EstadoOp].label}
                </button>
              ))}
            </div>
            <select value={filtroCategoria} onChange={e=>setFiltroCategoria(e.target.value)}
              style={{padding:'6px 10px',fontSize:12,border:'1px solid #E8E8EC',borderRadius:8,outline:'none',fontFamily:'inherit',color:'#1a1a1a',background:'#fff'}}>
              <option value="todos">Todas las categorías</option>
              {Object.entries(CAT_CONFIG).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
        </div>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',minWidth:600}}>
            <thead>
              <tr style={{borderBottom:'1px solid #ECEEF3'}}>
                <th style={th}>Concepto</th>
                <th style={{...th,textAlign:'center' as const}}>Categoría</th>
                <th style={{...th,textAlign:'right' as const}}>Importe</th>
                <th style={{...th,textAlign:'center' as const}}>Vencimiento</th>
                <th style={{...th,textAlign:'center' as const}}>Estado</th>
                <th style={{...th}}>Cuenta PGC</th>
              </tr>
            </thead>
            <tbody>
              {obFiltradas.sort((a,b)=>a.diasRestantes-b.diasRestantes).map(o=>{
                const cat = CAT_CONFIG[o.categoria]
                const est = ESTADO_CONFIG[o.estado]
                return (
                  <tr key={o.id} className="pagos-tr" style={{borderBottom:'1px solid #F4F5F7'}}>
                    <td style={td}>
                      <div style={{fontWeight:500}}>{o.concepto}</div>
                      <div style={{fontSize:10,color:'#B0B7C3'}}>{o.detalle}</div>
                    </td>
                    <td style={{...td,textAlign:'center' as const}}>
                      <div style={{display:'inline-flex',alignItems:'center',gap:5,padding:'3px 9px',borderRadius:99,background:cat.bg}}>
                        <i className={`ti ${cat.icon}`} style={{fontSize:11,color:cat.color}} aria-hidden="true"/>
                        <span style={{fontSize:10,fontWeight:600,color:cat.color}}>{cat.label}</span>
                      </div>
                    </td>
                    <td style={{...td,textAlign:'right' as const,fontWeight:600,color:o.estado==='vencida'?'#b91c1c':'#1a1a1a'}}>{fmt(o.importe)}</td>
                    <td style={{...td,textAlign:'center' as const}}>
                      <div style={{fontSize:12}}>{fmtFecha(o.vencimiento)}</div>
                      {o.diasRestantes<0
                        ? <div style={{fontSize:10,color:'#b91c1c',fontWeight:500}}>{Math.abs(o.diasRestantes)}d vencida</div>
                        : o.diasRestantes<=10
                        ? <div style={{fontSize:10,color:'#F4A100',fontWeight:500}}>en {o.diasRestantes}d</div>
                        : <div style={{fontSize:10,color:'#B0B7C3'}}>en {o.diasRestantes}d</div>}
                    </td>
                    <td style={{...td,textAlign:'center' as const}}>
                      <span style={{fontSize:11,fontWeight:600,padding:'3px 9px',borderRadius:99,background:est.bg,color:est.color}}>{est.label}</span>
                    </td>
                    <td style={{...td}}>
                      <span style={{fontSize:11,fontWeight:600,color:'#4361EE',background:'#EEF1FD',padding:'2px 7px',borderRadius:6}}>{o.cuentaPGC}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr style={{borderTop:'1px solid #ECEEF3',background:'#EEF1FD'}}>
                <td style={{...td,fontWeight:700,color:'#4361EE'}} colSpan={2}>Total obligaciones</td>
                <td style={{...td,textAlign:'right' as const,fontWeight:700,color:'#4361EE'}}>{fmt(obFiltradas.reduce((a,o)=>a+o.importe,0))}</td>
                <td colSpan={3}/>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ── Deuda: gráfico + estructura ── */}
      <div className="pagos-mid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>

        {/* Gráfico estructura de deuda */}
        <div style={{...card,padding:'22px 24px',display:'flex',flexDirection:'column'}}>
          <div style={{marginBottom:16}}>
            <div style={{fontSize:9,fontWeight:600,color:'#1a1a1a',textTransform:'uppercase',letterSpacing:'0.12em'}}>Estructura de deuda</div>
            <div style={{fontSize:11,color:'#B0B7C3',marginTop:2}}>Desglose por clasificación y plazo.</div>
          </div>
          <div style={{flex:1,minHeight:180}}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartDeuda} margin={{top:4,right:4,left:0,bottom:0}} barCategoryGap="35%">
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F2" vertical={false}/>
                <XAxis dataKey="label" tick={{fontSize:10,fill:'#B0B7C3'}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:10,fill:'#B0B7C3'}} axisLine={false} tickLine={false} tickFormatter={v=>v>=1000?`${(v/1000).toFixed(0)}k €`:String(v)} width={52}/>
                <Tooltip formatter={(v:number)=>fmt(v)} contentStyle={{borderRadius:10,border:'1px solid #E8E8EC',fontSize:12}}/>
                <Bar dataKey="importe" radius={[6,6,0,0]} maxBarSize={64}>
                  {chartDeuda.map((e,i)=><Cell key={i} fill={e.color}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{display:'flex',gap:12,flexWrap:'wrap',marginTop:12,paddingTop:12,borderTop:'1px solid #F4F5F7'}}>
            {chartDeuda.map((d,i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:5}}>
                <div style={{width:8,height:8,borderRadius:2,background:d.color}}/>
                <span style={{fontSize:10,color:'#888'}}>{d.label.replace('\n',' ')}: <strong>{fmt(d.importe)}</strong></span>
              </div>
            ))}
          </div>
        </div>

        {/* Listado préstamos */}
        <div style={{...card,padding:'22px 24px'}}>
          <div style={{marginBottom:14}}>
            <div style={{fontSize:9,fontWeight:600,color:'#1a1a1a',textTransform:'uppercase',letterSpacing:'0.12em'}}>Instrumentos de deuda</div>
            <div style={{fontSize:11,color:'#B0B7C3',marginTop:2}}>Haz clic para ver la tabla de amortización.</div>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:6}}>
            {prestamos.map(p=>{
              const tipo = TIPO_CONFIG[p.tipo]
              const isSelected = prestamoSeleccionado?.id===p.id
              return (
                <div key={p.id} className="pagos-pres"
                  onClick={()=>setPrestamoSeleccionado(isSelected?null:p)}
                  style={{display:'flex',alignItems:'center',gap:12,padding:'10px 12px',borderRadius:10,border:`1px solid ${isSelected?'#4361EE':'#E8E8EC'}`,background:isSelected?'#EEF1FD':'#FAFAFA',cursor:'pointer',transition:'all .12s'}}>
                  <div style={{width:30,height:30,borderRadius:8,background:p.clasificacion==='financiera'?'#EEF1FD':'#FFF8E6',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <i className={`ti ${tipo.icon}`} style={{fontSize:14,color:p.clasificacion==='financiera'?'#4361EE':'#F4A100'}} aria-hidden="true"/>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:12,fontWeight:500,color:'#1a1a1a',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.nombre}</div>
                    <div style={{fontSize:10,color:'#B0B7C3'}}>{p.entidad} · {tipo.label} · {p.plazo==='corto'?'Corto plazo':'Largo plazo'}</div>
                  </div>
                  <div style={{textAlign:'right',flexShrink:0}}>
                    <div style={{fontSize:13,fontWeight:600,color:isSelected?'#4361EE':'#1a1a1a'}}>{fmt(p.capitalPendiente)}</div>
                    <div style={{fontSize:10,color:'#B0B7C3'}}>{p.mesesRestantes} meses</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Tabla de amortización ── */}
      {prestamoSeleccionado && (
        <div style={{...card,padding:'22px 24px'}}>
          <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:18,flexWrap:'wrap',gap:10}}>
            <div>
              <div style={{fontSize:9,fontWeight:600,color:'#1a1a1a',textTransform:'uppercase',letterSpacing:'0.12em'}}>Tabla de amortización</div>
              <div style={{fontSize:11,color:'#B0B7C3',marginTop:2}}>
                {prestamoSeleccionado.nombre} · {prestamoSeleccionado.entidad} · {prestamoSeleccionado.tipoInteres}% TIN · cuota francesa
              </div>
            </div>
            <div style={{display:'flex',gap:16,flexWrap:'wrap'}}>
              {[
                {lbl:'Capital pendiente',val:fmt(prestamoSeleccionado.capitalPendiente),color:'#4361EE'},
                {lbl:'Cuota mensual',val:prestamoSeleccionado.tipoInteres>0?fmt(prestamoSeleccionado.cuotaMensual>0?prestamoSeleccionado.cuotaMensual:cuotasAm[0]?.cuota||0):'Variable',color:'#1a1a1a'},
                {lbl:'Total intereses',val:prestamoSeleccionado.tipoInteres>0?fmt(cuotasAm.reduce((a,c)=>a+c.intereses,0)):'—',color:'#F4A100'},
                {lbl:'Fin contrato',val:fmtFecha(prestamoSeleccionado.fechaFin),color:'#888'},
              ].map((s,i)=>(
                <div key={i} style={{textAlign:'right'}}>
                  <div style={{fontSize:9,fontWeight:600,color:'#B0B7C3',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:2}}>{s.lbl}</div>
                  <div style={{fontSize:14,fontWeight:600,color:s.color}}>{s.val}</div>
                </div>
              ))}
            </div>
          </div>

          {prestamoSeleccionado.tipoInteres === 0 ? (
            <div style={{textAlign:'center',padding:'32px',fontSize:13,color:'#B0B7C3'}}>
              <i className="ti ti-info-circle" style={{fontSize:24,display:'block',marginBottom:8}} aria-hidden="true"/>
              Este instrumento no genera intereses — no aplica tabla de amortización.
            </div>
          ) : (
            <>
              <div style={{overflowX:'auto'}}>
                <table style={{width:'100%',borderCollapse:'collapse',minWidth:580}}>
                  <thead>
                    <tr style={{borderBottom:'1px solid #ECEEF3'}}>
                      {['Nº','Fecha','Cuota total','Capital','Intereses','Saldo pendiente'].map((h,i)=>(
                        <th key={i} style={{...{fontSize:9,fontWeight:700,color:'#B0B7C3',textTransform:'uppercase' as const,letterSpacing:'0.1em',padding:'0 10px 10px',textAlign:(i>1?'right':'left') as const}}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {cuotasVisibles.map((c,i)=>(
                      <tr key={c.num} className="pagos-tr" style={{borderBottom:'1px solid #F4F5F7',background:i===0?'#F4F6FF':'transparent'}}>
                        <td style={{...td,fontWeight:i===0?600:400,color:i===0?'#4361EE':'#888'}}>{c.num}</td>
                        <td style={td}>{c.fecha}</td>
                        <td style={{...td,textAlign:'right' as const,fontWeight:600}}>{fmt(c.cuota)}</td>
                        <td style={{...td,textAlign:'right' as const,color:'#4361EE',fontWeight:500}}>{fmt(c.capital)}</td>
                        <td style={{...td,textAlign:'right' as const,color:'#F4A100'}}>{fmt(c.intereses)}</td>
                        <td style={{...td,textAlign:'right' as const,fontWeight:600}}>{fmt(c.saldo)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{borderTop:'1px solid #ECEEF3',background:'#EEF1FD'}}>
                      <td style={{...td,fontWeight:700,color:'#4361EE'}} colSpan={2}>Total</td>
                      <td style={{...td,textAlign:'right' as const,fontWeight:700,color:'#4361EE'}}>{fmt(cuotasAm.reduce((a,c)=>a+c.cuota,0))}</td>
                      <td style={{...td,textAlign:'right' as const,fontWeight:700,color:'#4361EE'}}>{fmt(prestamoSeleccionado.capitalPendiente)}</td>
                      <td style={{...td,textAlign:'right' as const,fontWeight:700,color:'#F4A100'}}>{fmt(cuotasAm.reduce((a,c)=>a+c.intereses,0))}</td>
                      <td/>
                    </tr>
                  </tfoot>
                </table>
              </div>
              {cuotasAm.length > 12 && (
                <div style={{textAlign:'center',marginTop:12}}>
                  <button onClick={()=>setMostrarTodasCuotas(v=>!v)}
                    style={{fontSize:12,fontWeight:500,color:'#4361EE',border:'1px solid #C7D2F8',background:'#EEF1FD',borderRadius:8,padding:'8px 18px',cursor:'pointer',fontFamily:'inherit'}}>
                    {mostrarTodasCuotas?`Mostrar menos ↑`:`Ver las ${cuotasAm.length - 12} cuotas restantes ↓`}
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
