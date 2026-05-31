import { useState, useMemo } from 'react'
import Layout from '@/components/Layout'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

// ─── Tipos ───────────────────────────────────────────────────────────────────
interface Factura {
  id: string
  cliente: string
  clienteId: string
  numero: string
  emision: string
  vencimiento: string
  importe: number
  cobrado: number
  estado: 'pendiente' | 'vencida' | 'parcial' | 'cobrada'
  diasVencida: number
}

interface Cliente {
  id: string
  nombre: string
  sector: string
  telefono: string
  email: string
  totalPendiente: number
  facturas: number
  dsoMedio: number
  riesgo: 'bajo' | 'medio' | 'alto'
}

// ─── Datos mock ───────────────────────────────────────────────────────────────
const clientes: Cliente[] = [
  { id:'c1', nombre:'Acme Foundry S.L.',    sector:'Industria',    telefono:'+34 91 234 5678', email:'contabilidad@acme.es',    totalPendiente:28400, facturas:3, dsoMedio:42, riesgo:'medio' },
  { id:'c2', nombre:'Northwind Studios',    sector:'Diseño',       telefono:'+34 93 456 7890', email:'pagos@northwind.es',       totalPendiente:14750, facturas:2, dsoMedio:28, riesgo:'bajo'  },
  { id:'c3', nombre:'TechCore Systems',     sector:'Tecnología',   telefono:'+34 91 678 9012', email:'admin@techcore.io',        totalPendiente:9200,  facturas:1, dsoMedio:67, riesgo:'alto'  },
  { id:'c4', nombre:'Grupo Mediterráneo',   sector:'Distribución', telefono:'+34 96 890 1234', email:'gestion@grupomediterraneo.es', totalPendiente:5820, facturas:2, dsoMedio:35, riesgo:'bajo' },
  { id:'c5', nombre:'Innovatech Partners',  sector:'Consultoría',  telefono:'+34 94 012 3456', email:'finanzas@innovatech.es',   totalPendiente:3211,  facturas:1, dsoMedio:18, riesgo:'bajo'  },
]

const facturas: Factura[] = [
  { id:'f1',  clienteId:'c1', cliente:'Acme Foundry S.L.',   numero:'FV-2026-0142', emision:'2026-02-10', vencimiento:'2026-03-12', importe:12400, cobrado:0,     estado:'vencida',   diasVencida:79 },
  { id:'f2',  clienteId:'c1', cliente:'Acme Foundry S.L.',   numero:'FV-2026-0198', emision:'2026-03-15', vencimiento:'2026-04-14', importe:8200,  cobrado:0,     estado:'vencida',   diasVencida:46 },
  { id:'f3',  clienteId:'c1', cliente:'Acme Foundry S.L.',   numero:'FV-2026-0241', emision:'2026-04-20', vencimiento:'2026-05-20', importe:7800,  cobrado:0,     estado:'pendiente', diasVencida:10 },
  { id:'f4',  clienteId:'c2', cliente:'Northwind Studios',   numero:'FV-2026-0189', emision:'2026-03-01', vencimiento:'2026-04-01', importe:9750,  cobrado:5000,  estado:'parcial',   diasVencida:59 },
  { id:'f5',  clienteId:'c2', cliente:'Northwind Studios',   numero:'FV-2026-0230', emision:'2026-04-15', vencimiento:'2026-05-15', importe:5000,  cobrado:0,     estado:'pendiente', diasVencida:15 },
  { id:'f6',  clienteId:'c3', cliente:'TechCore Systems',    numero:'FV-2026-0101', emision:'2026-01-20', vencimiento:'2026-02-20', importe:9200,  cobrado:0,     estado:'vencida',   diasVencida:99 },
  { id:'f7',  clienteId:'c4', cliente:'Grupo Mediterráneo',  numero:'FV-2026-0215', emision:'2026-04-01', vencimiento:'2026-05-01', importe:3200,  cobrado:0,     estado:'vencida',   diasVencida:29 },
  { id:'f8',  clienteId:'c4', cliente:'Grupo Mediterráneo',  numero:'FV-2026-0238', emision:'2026-04-25', vencimiento:'2026-05-25', importe:2620,  cobrado:0,     estado:'pendiente', diasVencida:5  },
  { id:'f9',  clienteId:'c5', cliente:'Innovatech Partners', numero:'FV-2026-0244', emision:'2026-05-01', vencimiento:'2026-05-31', importe:3211,  cobrado:0,     estado:'pendiente', diasVencida:0  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n: number) {
  return new Intl.NumberFormat('es-ES', { style:'currency', currency:'EUR', maximumFractionDigits:0 }).format(n)
}
function fmtFecha(iso: string) {
  return new Intl.DateTimeFormat('es-ES', { day:'numeric', month:'short', year:'numeric' }).format(new Date(iso))
}

const ESTADO_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  pendiente: { bg:'#EEF1FD', color:'#4361EE', label:'Pendiente' },
  vencida:   { bg:'#FEF2F2', color:'#b91c1c', label:'Vencida'   },
  parcial:   { bg:'#FFF8E6', color:'#92400E', label:'Parcial'   },
  cobrada:   { bg:'#EAFAF0', color:'#1a7a3a', label:'Cobrada'   },
}

const RIESGO_STYLE: Record<string, { color: string; label: string }> = {
  bajo:  { color:'#1a7a3a', label:'Riesgo bajo'  },
  medio: { color:'#92400E', label:'Riesgo medio' },
  alto:  { color:'#b91c1c', label:'Riesgo alto'  },
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function Cobros() {
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null)
  const [filtroEstado, setFiltroEstado] = useState<string>('todos')
  const [filtroCliente, setFiltroCliente] = useState<string>('todos')
  const [verMasPrevision, setVerMasPrevision] = useState(false)
  const [verMasConcentracion, setVerMasConcentracion] = useState(false)
  const [filtroOpen, setFiltroOpen] = useState(false)
  const [filtro, setFiltro] = useState<number | 'anual'>(4)
  const MESES_LABEL = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
  const MES_ACTUAL_IDX = 4
  const filtroLabel = filtro === 'anual' ? 'Este año' : MESES_LABEL[filtro as number]
  const opcionesFiltro = [
    ...Array.from({ length: MES_ACTUAL_IDX + 1 }, (_, m) => ({
      key: m as number | 'anual',
      label: m === MES_ACTUAL_IDX ? `${MESES_LABEL[m]} (este mes)` : MESES_LABEL[m],
      group: '2026',
    })).reverse(),
    { key: 'anual' as const, label: 'Este año', group: 'Acumulado' },
  ]

  // ── Totales ──
  const totalPendiente = facturas.filter(f => f.estado !== 'cobrada').reduce((a, f) => a + (f.importe - f.cobrado), 0)
  const totalVencido   = facturas.filter(f => f.estado === 'vencida' || (f.estado === 'parcial' && f.diasVencida > 0)).reduce((a, f) => a + (f.importe - f.cobrado), 0)
  const cobradoMes     = 5000 // mock: lo que ya se ha cobrado en mayo
  const dsoGlobal      = Math.round(facturas.filter(f=>f.estado!=='cobrada').reduce((a,f)=>a+f.diasVencida,0) / facturas.filter(f=>f.estado!=='cobrada').length)
  const totalFacturado = facturas.reduce((a, f) => a + f.importe, 0)
  const pctPendiente   = Math.round((totalPendiente / totalFacturado) * 100)
  const pctVencido     = Math.round((totalVencido / totalFacturado) * 100)
  const pctCobrado     = Math.round((cobradoMes / totalFacturado) * 100)

  // ── Aging ──
  const aging = useMemo(() => [
    { label:'Corriente',  dias:'Al día',    importe: facturas.filter(f=>f.diasVencida<=0&&f.estado!=='cobrada').reduce((a,f)=>a+(f.importe-f.cobrado),0), color:'#4361EE' },
    { label:'0–30 días',  dias:'Reciente',  importe: facturas.filter(f=>f.diasVencida>0&&f.diasVencida<=30&&f.estado!=='cobrada').reduce((a,f)=>a+(f.importe-f.cobrado),0), color:'#93C5FD' },
    { label:'30–60 días', dias:'Atención',  importe: facturas.filter(f=>f.diasVencida>30&&f.diasVencida<=60&&f.estado!=='cobrada').reduce((a,f)=>a+(f.importe-f.cobrado),0), color:'#60A5FA' },
    { label:'60–90 días', dias:'Urgente',   importe: facturas.filter(f=>f.diasVencida>60&&f.diasVencida<=90&&f.estado!=='cobrada').reduce((a,f)=>a+(f.importe-f.cobrado),0), color:'#4361EE' },
    { label:'+90 días',   dias:'Crítico',   importe: facturas.filter(f=>f.diasVencida>90&&f.estado!=='cobrada').reduce((a,f)=>a+(f.importe-f.cobrado),0), color:'#1E3A8A' },
  ], [])

  // ── Previsión de cobros ──
  const prevision = [
    { label:'Próximos 30d', importe: facturas.filter(f=>f.diasVencida<=30&&f.estado!=='cobrada').reduce((a,f)=>a+(f.importe-f.cobrado),0) },
    { label:'31–60d',       importe: facturas.filter(f=>f.diasVencida>30&&f.diasVencida<=60&&f.estado!=='cobrada').reduce((a,f)=>a+(f.importe-f.cobrado),0) },
    { label:'+60d',         importe: facturas.filter(f=>f.diasVencida>60&&f.estado!=='cobrada').reduce((a,f)=>a+(f.importe-f.cobrado),0) },
  ]

  // ── Facturas filtradas ──
  const facturasFiltradas = useMemo(() => facturas.filter(f => {
    if (filtroEstado !== 'todos' && f.estado !== filtroEstado) return false
    if (filtroCliente !== 'todos' && f.clienteId !== filtroCliente) return false
    return true
  }), [filtroEstado, filtroCliente])

  // ── Facturas del cliente seleccionado ──
  const facturasCliente = clienteSeleccionado
    ? facturas.filter(f => f.clienteId === clienteSeleccionado.id)
    : []

  const card: React.CSSProperties = { background:'#fff', borderRadius:14, border:'1px solid #E8E8EC' }
  const th: React.CSSProperties = { fontSize:9, fontWeight:700, color:'#B0B7C3', textTransform:'uppercase', letterSpacing:'0.1em', padding:'0 12px 10px', textAlign:'left' as const }
  const td: React.CSSProperties = { padding:'12px', fontSize:12, color:'#1a1a1a', verticalAlign:'middle' as const }

  return (
    <Layout title="Cobros">
      <style>{`
        @media (max-width: 900px) { .cobros-kgrid { grid-template-columns: 1fr 1fr !important; } .cobros-main { flex-direction: column !important; } }
        .cobros-tr:hover { background: #FAFAFA; cursor: pointer; }
        .cobros-filtro { border:none; cursor:pointer; font-family:inherit; font-size:12px; padding:5px 12px; border-radius:6px; transition:background .12s,color .12s; }
      `}</style>

      {filtroOpen && (
        <div onClick={() => setFiltroOpen(false)} style={{ position:'fixed', inset:0, zIndex:40 }} />
      )}

      {filtroOpen && (
        <div onClick={() => setFiltroOpen(false)} style={{ position:'fixed', inset:0, zIndex:40 }} />
      )}

      {/* ── Encabezado ── */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
        <div>
          <div style={{ fontSize:22, fontWeight:700, color:'#1a1a1a', letterSpacing:'-0.4px', marginBottom:3 }}>Cobros</div>
          <div style={{ fontSize:12, color:'#888' }}>Facturas pendientes, antigüedad y previsión de cobro</div>
        </div>
        <button style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'8px 14px', fontSize:12, fontWeight:500, border:'1px solid #E8E8EC', borderRadius:8, background:'#fff', color:'#555', cursor:'not-allowed', fontFamily:'inherit', opacity:0.6 }} disabled>
          <i className="ti ti-plug" style={{ fontSize:13 }} aria-hidden="true" />
          Sincronizar Holded
          <span style={{ fontSize:9, fontWeight:700, padding:'1px 5px', borderRadius:4, background:'#EEF1FD', color:'#4361EE' }}>PRONTO</span>
        </button>
      </div>

      {/* ── KPI cards ── */}
      <div className="cobros-kgrid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
        {[
          { lbl:'Pendiente de cobro', desc:'Facturas emitidas sin cobrar.', val:fmt(totalPendiente), pct:pctPendiente, pctColor:'#4361EE', iconBg:'#EEF1FD', iconColor:'#4361EE', icon:'ti-file-invoice' },
          { lbl:'Vencido sin cobrar', desc:'Facturas pasadas de fecha.', val:fmt(totalVencido), pct:pctVencido, pctColor:'#EF4444', iconBg:'#FEF2F2', iconColor:'#EF4444', icon:'ti-alert-triangle' },
          { lbl:'Cobrado este mes',   desc:'Total ingresado en el periodo.', val:fmt(cobradoMes), pct:pctCobrado, pctColor:'#2DC653', iconBg:'#F0F9F4', iconColor:'#2DC653', icon:'ti-circle-check' },
          { lbl:'DSO medio',         desc:'Días medios hasta cobro efectivo.', val:`${dsoGlobal} días`, pct:null, pctColor:'#F4A100', iconBg:'#FFF8E6', iconColor:'#F4A100', icon:'ti-clock' },
        ].map((k, i) => (
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
            <div style={{ fontSize:28, fontWeight:400, color:'#1a1a1a', letterSpacing:'-0.5px', marginTop:10, marginBottom:(k as any).pct !== null ? 10 : 0 }}>{k.val}</div>
            {(k as any).pct !== null && (
              <div>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                  <span style={{ fontSize:10, color:'#B0B7C3' }}>sobre total facturado</span>
                  <span style={{ fontSize:11, fontWeight:700, color:(k as any).pctColor }}>{(k as any).pct}%</span>
                </div>
                <div style={{ height:4, background:'#F4F5F7', borderRadius:99, overflow:'hidden' }}>
                  <div style={{ width:`${(k as any).pct}%`, height:'100%', background:(k as any).pctColor, borderRadius:99 }} />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Aging + Previsión ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>

        {/* Aging — ocupa todo el espacio vertical */}
        <div style={{ ...card, padding:'22px 24px', display:'flex', flexDirection:'column' }}>
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:9, fontWeight:600, color:'#1a1a1a', textTransform:'uppercase', letterSpacing:'0.12em' }}>Antigüedad de saldo</div>
            <div style={{ fontSize:11, color:'#B0B7C3', marginTop:2 }}>Clasificación de facturas pendientes por tiempo vencido.</div>
          </div>
          <div style={{ flex:1, minHeight:200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={aging} margin={{ top:4, right:4, left:0, bottom:0 }} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F2" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize:11, fill:'#B0B7C3' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:11, fill:'#B0B7C3' }} axisLine={false} tickLine={false} tickFormatter={v => v>=1000?`${(v/1000).toFixed(0)}k €`:String(v)} width={48} />
                <Tooltip formatter={(v: number) => fmt(v)} labelStyle={{ fontWeight:600 }} contentStyle={{ borderRadius:10, border:'1px solid #E8E8EC', fontSize:12 }} />
                <Bar dataKey="importe" radius={[6,6,0,0]} maxBarSize={64}>
                  {aging.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginTop:14, paddingTop:14, borderTop:'1px solid #F4F5F7' }}>
            {aging.map((a, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:5 }}>
                <div style={{ width:8, height:8, borderRadius:2, background:a.color }} />
                <span style={{ fontSize:10, color:'#888' }}>{a.label}: <strong>{fmt(a.importe)}</strong></span>
              </div>
            ))}
          </div>
        </div>

        {/* Previsión + Concentración — columna derecha */}
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>

          {/* Previsión */}
          <div style={{ ...card, padding:'22px 24px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
              <div>
                <div style={{ fontSize:9, fontWeight:600, color:'#1a1a1a', textTransform:'uppercase', letterSpacing:'0.12em' }}>Previsión de cobros</div>
                <div style={{ fontSize:11, color:'#B0B7C3', marginTop:2 }}>Importes esperados según vencimientos.</div>
              </div>
              <button disabled title="Próximamente enlazará con tu ERP"
                style={{ fontSize:11, fontWeight:500, color:'#B0B7C3', border:'none', background:'transparent', cursor:'not-allowed', fontFamily:'inherit', padding:0, flexShrink:0 }}>
                Ver más ↓
              </button>
            </div>
            {prevision.map((p, i) => (
              <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom: i < prevision.length-1 ? '1px solid #F4F5F7' : 'none' }}>
                <span style={{ fontSize:12, color:'#888' }}>{p.label}</span>
                <span style={{ fontSize:13, fontWeight:600, color:'#1a1a1a' }}>{fmt(p.importe)}</span>
              </div>
            ))}
            {verMasPrevision && (
              <div style={{ marginTop:14, paddingTop:14, borderTop:'1px solid #F4F5F7' }}>
                <div style={{ fontSize:11, fontWeight:600, color:'#B0B7C3', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10 }}>Detalle por cliente</div>
                {clientes.map((c, i) => {
                  const imp = facturas.filter(f=>f.clienteId===c.id&&f.estado!=='cobrada').reduce((a,f)=>a+(f.importe-f.cobrado),0)
                  if (!imp) return null
                  return (
                    <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'7px 0', borderBottom:'1px solid #F4F5F7' }}>
                      <span style={{ fontSize:12, color:'#1a1a1a', fontWeight:500 }}>{c.nombre}</span>
                      <span style={{ fontSize:12, fontWeight:600, color:'#4361EE' }}>{fmt(imp)}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Concentración */}
          <div style={{ ...card, padding:'22px 24px', flex:1 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
              <div>
                <div style={{ fontSize:9, fontWeight:600, color:'#1a1a1a', textTransform:'uppercase', letterSpacing:'0.12em' }}>Concentración</div>
                <div style={{ fontSize:11, color:'#B0B7C3', marginTop:2 }}>Top clientes por saldo pendiente.</div>
              </div>
              <button disabled title="Próximamente enlazará con tu ERP"
                style={{ fontSize:11, fontWeight:500, color:'#B0B7C3', border:'none', background:'transparent', cursor:'not-allowed', fontFamily:'inherit', padding:0, flexShrink:0 }}>
                Ver más ↓
              </button>
            </div>
            {clientes.sort((a,b)=>b.totalPendiente-a.totalPendiente)
              .slice(0, verMasConcentracion ? clientes.length : 4)
              .map((c, i) => {
                const pct = Math.round((c.totalPendiente / totalPendiente) * 100)
                return (
                  <div key={i} style={{ marginBottom:12 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                      <div>
                        <span style={{ fontSize:11, fontWeight:500, color:'#1a1a1a' }}>{c.nombre}</span>
                        <span style={{ fontSize:10, color:'#B0B7C3', marginLeft:6 }}>{fmt(c.totalPendiente)}</span>
                      </div>
                      <span style={{ fontSize:11, fontWeight:600, color:'#4361EE' }}>{pct}%</span>
                    </div>
                    <div style={{ height:5, background:'#EEF1FD', borderRadius:99, overflow:'hidden' }}>
                      <div style={{ width:`${pct}%`, height:'100%', background:'#4361EE', borderRadius:99 }} />
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      </div>

      {/* ── Tabla facturas + panel lateral ── */}
      <div style={{ display:'flex', gap:12 }}>

        {/* Tabla */}
        <div style={{ ...card, flex:1, padding:'22px 24px', minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:16, flexWrap:'wrap', gap:10 }}>
            <div>
              <div style={{ fontSize:9, fontWeight:600, color:'#1a1a1a', textTransform:'uppercase', letterSpacing:'0.12em' }}>Facturas pendientes</div>
              <div style={{ fontSize:11, color:'#B0B7C3', marginTop:2 }}>Haz clic en una fila para ver el detalle del cliente.</div>
            </div>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {/* Filtro estado */}
              <div style={{ display:'flex', gap:2, background:'#F4F5F7', borderRadius:8, padding:3 }}>
                {['todos','pendiente','vencida','parcial'].map(e => (
                  <button key={e} className="cobros-filtro"
                    style={{ background:filtroEstado===e?'#fff':'transparent', color:filtroEstado===e?'#1a1a1a':'#888', fontWeight:filtroEstado===e?600:400, boxShadow:filtroEstado===e?'0 1px 4px rgba(0,0,0,0.08)':'none' }}
                    onClick={() => setFiltroEstado(e)}>
                    {e === 'todos' ? 'Todos' : ESTADO_STYLE[e].label}
                  </button>
                ))}
              </div>
              {/* Filtro cliente */}
              <select value={filtroCliente} onChange={e => setFiltroCliente(e.target.value)}
                style={{ padding:'6px 10px', fontSize:12, border:'1px solid #E8E8EC', borderRadius:8, outline:'none', fontFamily:'inherit', color:'#1a1a1a', background:'#fff' }}>
                <option value="todos">Todos los clientes</option>
                {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
          </div>

          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', minWidth:560 }}>
              <thead>
                <tr style={{ borderBottom:'1px solid #ECEEF3' }}>
                  <th style={th}>Cliente</th>
                  <th style={th}>Factura</th>
                  <th style={{ ...th, textAlign:'right' as const }}>Importe</th>
                  <th style={{ ...th, textAlign:'right' as const }}>Pendiente</th>
                  <th style={th}>Vencimiento</th>
                  <th style={th}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {facturasFiltradas.map(f => {
                  const pendiente = f.importe - f.cobrado
                  const est = ESTADO_STYLE[f.estado]
                  const isSelected = clienteSeleccionado?.id === f.clienteId
                  return (
                    <tr key={f.id} className="cobros-tr"
                      style={{ borderBottom:'1px solid #F4F5F7', background: isSelected ? '#F4F6FF' : 'transparent' }}
                      onClick={() => {
                        const c = clientes.find(c => c.id === f.clienteId) || null
                        setClienteSeleccionado(prev => prev?.id === c?.id ? null : c)
                      }}>
                      <td style={td}>
                        <div style={{ fontWeight:500 }}>{f.cliente}</div>
                      </td>
                      <td style={td}>
                        <div style={{ fontSize:12, color:'#4361EE', fontWeight:500 }}>{f.numero}</div>
                        <div style={{ fontSize:10, color:'#B0B7C3' }}>Emisión {fmtFecha(f.emision)}</div>
                      </td>
                      <td style={{ ...td, textAlign:'right' as const }}>{fmt(f.importe)}</td>
                      <td style={{ ...td, textAlign:'right' as const, fontWeight:600, color: f.estado==='vencida'?'#b91c1c':'#1a1a1a' }}>{fmt(pendiente)}</td>
                      <td style={td}>
                        <div style={{ fontSize:12 }}>{fmtFecha(f.vencimiento)}</div>
                        {f.diasVencida > 0 && (
                          <div style={{ fontSize:10, color:'#EF4444', fontWeight:500 }}>{f.diasVencida}d vencida</div>
                        )}
                      </td>
                      <td style={td}>
                        <span style={{ fontSize:11, fontWeight:600, padding:'3px 9px', borderRadius:99, background:est.bg, color:est.color }}>
                          {est.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {facturasFiltradas.length === 0 && (
              <div style={{ textAlign:'center', padding:'32px', fontSize:13, color:'#B0B7C3' }}>No hay facturas con ese filtro</div>
            )}
          </div>
        </div>

        {/* Panel lateral cliente */}
        {clienteSeleccionado && (
          <div style={{ ...card, width:300, flexShrink:0, padding:'22px 20px', display:'flex', flexDirection:'column', gap:16 }}>
            {/* Cabecera */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:'#1a1a1a', marginBottom:2 }}>{clienteSeleccionado.nombre}</div>
                <div style={{ fontSize:11, color:'#888' }}>{clienteSeleccionado.sector}</div>
              </div>
              <button onClick={() => setClienteSeleccionado(null)}
                style={{ border:'none', background:'transparent', cursor:'pointer', color:'#B0B7C3', fontSize:16, display:'flex', alignItems:'center', padding:2 }}>
                <i className="ti ti-x" aria-hidden="true" />
              </button>
            </div>

            {/* Riesgo */}
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:clienteSeleccionado.riesgo==='bajo'?'#2DC653':clienteSeleccionado.riesgo==='medio'?'#F4A100':'#EF4444' }} />
              <span style={{ fontSize:12, fontWeight:500, color:RIESGO_STYLE[clienteSeleccionado.riesgo].color }}>
                {RIESGO_STYLE[clienteSeleccionado.riesgo].label}
              </span>
            </div>

            {/* Métricas */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {[
                { lbl:'Total pendiente', val:fmt(clienteSeleccionado.totalPendiente), color:'#EF4444' },
                { lbl:'Facturas abiertas', val:`${clienteSeleccionado.facturas}`, color:'#4361EE' },
                { lbl:'DSO medio', val:`${clienteSeleccionado.dsoMedio} días`, color:'#F4A100' },
                { lbl:'Sector', val:clienteSeleccionado.sector, color:'#888' },
              ].map((m, i) => (
                <div key={i} style={{ background:'#F4F5F7', borderRadius:10, padding:'10px 12px' }}>
                  <div style={{ fontSize:9, fontWeight:600, color:'#B0B7C3', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:4 }}>{m.lbl}</div>
                  <div style={{ fontSize:13, fontWeight:600, color:m.color }}>{m.val}</div>
                </div>
              ))}
            </div>

            {/* Contacto */}
            <div style={{ borderTop:'1px solid #F4F5F7', paddingTop:14 }}>
              <div style={{ fontSize:9, fontWeight:600, color:'#B0B7C3', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:10 }}>Contacto</div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                <a href={`tel:${clienteSeleccionado.telefono}`} style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, color:'#1a1a1a', textDecoration:'none' }}>
                  <i className="ti ti-phone" style={{ fontSize:14, color:'#4361EE' }} aria-hidden="true" />
                  {clienteSeleccionado.telefono}
                </a>
                <a href={`mailto:${clienteSeleccionado.email}`} style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, color:'#1a1a1a', textDecoration:'none' }}>
                  <i className="ti ti-mail" style={{ fontSize:14, color:'#4361EE' }} aria-hidden="true" />
                  {clienteSeleccionado.email}
                </a>
              </div>
            </div>

            {/* Facturas del cliente */}
            <div style={{ borderTop:'1px solid #F4F5F7', paddingTop:14 }}>
              <div style={{ fontSize:9, fontWeight:600, color:'#B0B7C3', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:10 }}>Facturas</div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {facturasCliente.map(f => {
                  const est = ESTADO_STYLE[f.estado]
                  return (
                    <div key={f.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid #F4F5F7' }}>
                      <div>
                        <div style={{ fontSize:11, fontWeight:500, color:'#4361EE' }}>{f.numero}</div>
                        <div style={{ fontSize:10, color:'#B0B7C3' }}>Vence {fmtFecha(f.vencimiento)}</div>
                      </div>
                      <div style={{ textAlign:'right' }}>
                        <div style={{ fontSize:12, fontWeight:600, color:'#1a1a1a' }}>{fmt(f.importe - f.cobrado)}</div>
                        <span style={{ fontSize:10, fontWeight:600, padding:'1px 6px', borderRadius:99, background:est.bg, color:est.color }}>{est.label}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Acción */}
            <button style={{ width:'100%', padding:'10px', fontSize:12, fontWeight:600, border:'none', borderRadius:9, background:'#4361EE', color:'#fff', cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
              <i className="ti ti-send" style={{ fontSize:13 }} aria-hidden="true" />
              Enviar recordatorio
            </button>
          </div>
        )}
      </div>
    </Layout>
  )
}
