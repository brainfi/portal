import Layout from '@/components/Layout'
import { formatCurrency } from '@/lib/formatters'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts'

const cashflowData = [
  { mes:'Ene', entradas:72000, gastos:38000, neto:34000 },
  { mes:'Feb', entradas:78000, gastos:40000, neto:38000 },
  { mes:'Mar', entradas:82000, gastos:41000, neto:41000 },
  { mes:'Abr', entradas:94200, gastos:43800, neto:50400 },
  { mes:'May', entradas:88000, gastos:42000, neto:46000 },
  { mes:'Jun', entradas:96000, gastos:44000, neto:52000 },
  { mes:'Jul', entradas:90000, gastos:43000, neto:47000 },
  { mes:'Ago', entradas:98000, gastos:45000, neto:53000 },
  { mes:'Sep', entradas:92000, gastos:43500, neto:48500 },
  { mes:'Oct', entradas:102000, gastos:46000, neto:56000 },
  { mes:'Nov', entradas:106000, gastos:47000, neto:59000 },
  { mes:'Dic', entradas:110000, gastos:48000, neto:62000 },
]

const ingresos = [
  { id:'MC', nombre:'Mercadona', sub:'91 días vencida', fecha:'2 may', importe:2800, color:'#EF233C', bg:'#FEECEF' },
  { id:'LF', nombre:'Lantero Foods', sub:'Vence en 16 días', fecha:'16 may', importe:5300, color:'#F4A100', bg:'#FFF8E6' },
  { id:'CE', nombre:'Carrefour España', sub:'Vence en 8 días', fecha:'8 may', importe:1800, color:'#4361EE', bg:'#EEF1FD' },
  { id:'DI', nombre:'Dia Supermercados', sub:'Vence en 22 días', fecha:'22 may', importe:700, color:'#8A94A6', bg:'#ECEEF3' },
  { id:'EC', nombre:'El Corte Inglés', sub:'67 días vencida', fecha:'vencida', importe:2080, color:'#EF233C', bg:'#FEECEF' },
]

const pagos = [
  { n:1, concepto:'IVA Q2 · Mod. 303', detalle:'AEAT', venc:'20 jul · 68d', urgente:true, tipo:'Fiscal', tipoBg:'#FFF8E6', tipoColor:'#F4A100', importe:-3900 },
  { n:2, concepto:'IRPF · Mod. 111', detalle:'AEAT', venc:'20 jul · 68d', urgente:true, tipo:'Fiscal', tipoBg:'#FFF8E6', tipoColor:'#F4A100', importe:-4200 },
  { n:3, concepto:'Nóminas · Mayo', detalle:'8 empleados', venc:'30 abr · 21d', urgente:false, tipo:'Gasto fijo', tipoBg:'#ECEEF3', tipoColor:'#8A94A6', importe:-18400 },
  { n:4, concepto:'Alquiler oficina', detalle:'Anual', venc:'1 may · 22d', urgente:false, tipo:'Gasto fijo', tipoBg:'#ECEEF3', tipoColor:'#8A94A6', importe:-2100 },
  { n:5, concepto:'Adobe Creative Cloud', detalle:'5 licencias', venc:'5 may · 26d', urgente:false, tipo:'Suscripción', tipoBg:'#EEF1FD', tipoColor:'#4361EE', importe:-290 },
  { n:6, concepto:'HubSpot CRM', detalle:'Plan Pro', venc:'10 may · 31d', urgente:false, tipo:'Suscripción', tipoBg:'#EEF1FD', tipoColor:'#4361EE', importe:-450 },
]

const kpis = [
  { dot:'#2DC653', label:'Dinero real', val:'5.620 €', delta:'↑ 12,4%', up:true },
  { dot:'#4361EE', label:'Resistencia', val:'47 días', delta:'↓ 1,05%', up:false },
  { dot:'#00BCD4', label:'Deuda', val:'60.500 €', delta:'↑ 3,8%', up:true },
  { dot:'#F4A100', label:'Reserva impuestos', val:'2.720 €', delta:'↑ 4,2%', up:true },
]

function CfTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'#fff', border:'1px solid #ECEEF3', borderRadius:10, padding:'10px 14px', fontSize:11, boxShadow:'0 4px 12px rgba(0,0,0,0.08)' }}>
      <div style={{ fontWeight:600, color:'#1A1D2E', marginBottom:8 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
          <div style={{ width:7, height:7, borderRadius:2, background:p.stroke }} />
          <span style={{ color:'#8A94A6' }}>{p.dataKey === 'entradas' ? 'Entradas' : p.dataKey === 'gastos' ? 'Salidas' : 'Neto'}: {formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

const card: React.CSSProperties = { background:'#fff', borderRadius:14, padding:'16px 18px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }
const tblHdr: React.CSSProperties = { fontSize:11, color:'#B0B7C3', fontWeight:500, paddingBottom:8, borderBottom:'1px solid #ECEEF3', marginBottom:2 }

export default function Dashboard() {
  return (
    <Layout title="Dashboard">
      <style>{`
        @media (max-width: 1100px) {
          .row2 { grid-template-columns: 1fr !important; }
          .row3 { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 768px) {
          .kpi-row { grid-template-columns: 1fr 1fr !important; }
          .tbl-date { display: none !important; }
          .tbl-tipo { display: none !important; }
        }
        @media (max-width: 480px) {
          .kpi-row { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ── FILA 1: 4 KPIs ── */}
      <div className="kpi-row" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
        {kpis.map((k, i) => (
          <div key={i} style={card}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
              <div style={{ fontSize:12, fontWeight:500, color:'#1A1D2E', display:'flex', alignItems:'center', gap:5 }}>
                <span style={{ width:8, height:8, borderRadius:'50%', background:k.dot, display:'inline-block' }} />
                {k.label}
              </div>
              <span style={{ fontSize:16, color:'#B0B7C3', letterSpacing:1, cursor:'pointer' }}>···</span>
            </div>
            <div style={{ fontSize:26, fontWeight:700, color:'#1A1D2E', letterSpacing:'-0.03em', marginBottom:8 }}>{k.val}</div>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <span style={{ fontSize:10, fontWeight:600, color: k.up ? '#2DC653' : '#EF233C', background: k.up ? '#EAFAF0' : '#FEECEF', padding:'2px 7px', borderRadius:99 }}>{k.delta}</span>
              <span style={{ fontSize:10, color:'#B0B7C3' }}>Mes anterior</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── FILA 2: Cashflow + Salud financiera ── */}
      <div className="row2" style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:12 }}>

        {/* Cashflow */}
        <div style={card}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <div style={{ fontSize:14, fontWeight:600, color:'#1A1D2E' }}>Cashflow</div>
            <div style={{ display:'flex', alignItems:'center', gap:14 }}>
              {[{ c:'#4361EE', l:'Entradas' }, { c:'#EF233C', l:'Salidas' }, { c:'#2DC653', l:'Neto' }].map(l => (
                <div key={l.l} style={{ display:'flex', alignItems:'center', gap:4, fontSize:10, color:'#8A94A6' }}>
                  <div style={{ width:7, height:7, borderRadius:'50%', background:l.c }} />{l.l}
                </div>
              ))}
              <div style={{ fontSize:10, color:'#1A1D2E', background:'#F5F6FA', border:'1px solid #ECEEF3', borderRadius:6, padding:'3px 8px', cursor:'pointer' }}>Este mes ▾</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={cashflowData} margin={{ top:4, right:4, left:0, bottom:0 }}>
              <defs>
                <linearGradient id="gEnt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4361EE" stopOpacity={0.15}/>
                  <stop offset="100%" stopColor="#4361EE" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gNet" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2DC653" stopOpacity={0.12}/>
                  <stop offset="100%" stopColor="#2DC653" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="0" stroke="#F5F6FA" vertical={false}/>
              <XAxis dataKey="mes" tick={{ fontSize:9, fill:'#B0B7C3' }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize:8, fill:'#B0B7C3' }} axisLine={false} tickLine={false} tickFormatter={v => `€${v/1000}k`} width={36}/>
              <Tooltip content={<CfTooltip />} cursor={{ stroke:'#ECEEF3', strokeWidth:1, strokeDasharray:'3 3' }}/>
              <Area type="monotone" dataKey="entradas" stroke="#4361EE" strokeWidth={2} fill="url(#gEnt)" dot={false} activeDot={{ r:4, fill:'#4361EE', stroke:'white', strokeWidth:1.5 }}/>
              <Area type="monotone" dataKey="gastos" stroke="#EF233C" strokeWidth={1.5} strokeDasharray="5 3" fill="none" dot={false} activeDot={{ r:4, fill:'#EF233C', stroke:'white', strokeWidth:1.5 }}/>
              <Area type="monotone" dataKey="neto" stroke="#2DC653" strokeWidth={2} fill="url(#gNet)" dot={false} activeDot={{ r:4, fill:'#2DC653', stroke:'white', strokeWidth:1.5 }}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Salud financiera */}
        <div style={{ ...card, display:'flex', flexDirection:'column' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
            <div style={{ fontSize:14, fontWeight:600, color:'#1A1D2E' }}>Salud financiera</div>
            <div style={{ fontSize:10, color:'#1A1D2E', background:'#F5F6FA', border:'1px solid #ECEEF3', borderRadius:6, padding:'3px 8px', cursor:'pointer' }}>Detalle ▾</div>
          </div>
          <div style={{ fontSize:10, color:'#B0B7C3', marginBottom:12 }}>Basado en liquidez, deuda y cobros</div>

          <div style={{ display:'flex', justifyContent:'center', flex:1, alignItems:'center' }}>
            <svg width="210" height="145" viewBox="0 0 210 145">
              <defs>
                <linearGradient id="gaugeG" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#4361EE"/>
                  <stop offset="100%" stopColor="#7B93FF"/>
                </linearGradient>
              </defs>
              <path d="M 12 125 A 93 93 0 0 1 198 125" fill="none" stroke="#ECEEF3" strokeWidth="15" strokeLinecap="round"/>
              <path d="M 20 125 A 85 85 0 0 1 190 125" fill="none" stroke="#ECEEF3" strokeWidth="11" strokeLinecap="round"/>
              <path d="M 28 125 A 77 77 0 0 1 182 125" fill="none" stroke="#ECEEF3" strokeWidth="9" strokeLinecap="round"/>
              <path d="M 35 125 A 70 70 0 0 1 175 125" fill="none" stroke="#ECEEF3" strokeWidth="7" strokeLinecap="round"/>
              <path d="M 41 125 A 64 64 0 0 1 169 125" fill="none" stroke="#ECEEF3" strokeWidth="5" strokeLinecap="round"/>
              <path d="M 12 125 A 93 93 0 0 1 180 44" fill="none" stroke="url(#gaugeG)" strokeWidth="15" strokeLinecap="round"/>
              <path d="M 20 125 A 85 85 0 0 1 172 50" fill="none" stroke="#4361EE" strokeWidth="11" strokeLinecap="round" opacity="0.5"/>
              <path d="M 28 125 A 77 77 0 0 1 164 56" fill="none" stroke="#4361EE" strokeWidth="9" strokeLinecap="round" opacity="0.3"/>
              <path d="M 35 125 A 70 70 0 0 1 157 62" fill="none" stroke="#4361EE" strokeWidth="7" strokeLinecap="round" opacity="0.18"/>
              <path d="M 41 125 A 64 64 0 0 1 151 68" fill="none" stroke="#4361EE" strokeWidth="5" strokeLinecap="round" opacity="0.1"/>
              <text x="105" y="112" textAnchor="middle" fontSize="34" fontWeight="700" fill="#1A1D2E" fontFamily="Inter">68%</text>
              <text x="105" y="130" textAnchor="middle" fontSize="10" fill="#8A94A6" fontFamily="Inter">Salud financiera</text>
            </svg>
          </div>

          <div style={{ display:'flex', justifyContent:'center', gap:14, paddingTop:10, borderTop:'1px solid #ECEEF3', marginBottom:12 }}>
            {[{ c:'#4361EE', l:'Liquidez' }, { c:'#A0AEF5', l:'Cobros' }, { c:'#D6DCFA', l:'Deuda' }].map(l => (
              <div key={l.l} style={{ display:'flex', alignItems:'center', gap:4, fontSize:10, color:'#8A94A6' }}>
                <div style={{ width:8, height:8, borderRadius:2, background:l.c }} />{l.l}
              </div>
            ))}
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {[{ c:'#4361EE', l:'Liquidez', v:82 }, { c:'#A0AEF5', l:'Cobros', v:61 }, { c:'#D6DCFA', l:'Deuda', v:58 }].map(m => (
              <div key={m.l} style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <div style={{ width:7, height:7, borderRadius:'50%', background:m.c }} />
                  <span style={{ fontSize:11, color:'#8A94A6' }}>{m.l}</span>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ width:70, height:5, background:'#ECEEF3', borderRadius:99, overflow:'hidden' }}>
                    <div style={{ height:5, width:`${m.v}%`, background:m.c, borderRadius:99 }} />
                  </div>
                  <span style={{ fontSize:12, fontWeight:600, color:'#1A1D2E', minWidth:28 }}>{m.v}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FILA 3: Ingresos + Pagos ── */}
      <div className="row3" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>

        {/* Ingresos pendientes */}
        <div style={card}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <div style={{ fontSize:14, fontWeight:600, color:'#1A1D2E' }}>Ingresos pendientes</div>
            <div style={{ fontSize:11, color:'#4361EE', display:'flex', alignItems:'center', gap:3, cursor:'pointer' }}>Ver todos ▾</div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'30px 1fr 70px 65px', ...tblHdr }}>
            <span></span><span>Cliente</span><span className="tbl-date">Fecha</span><span style={{ textAlign:'right' }}>Importe</span>
          </div>
          {ingresos.map((r, i) => (
            <div key={i} style={{ display:'grid', gridTemplateColumns:'30px 1fr 70px 65px', alignItems:'center', padding:'9px 0', borderBottom: i < ingresos.length-1 ? '1px solid #F5F6FA' : 'none' }}>
              <div style={{ width:28, height:28, borderRadius:'50%', background:r.bg, color:r.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:700, flexShrink:0 }}>{r.id}</div>
              <div>
                <div style={{ fontSize:12, fontWeight:500, color:'#1A1D2E' }}>{r.nombre}</div>
                <div style={{ fontSize:10, color: r.color === '#EF233C' ? '#EF233C' : '#B0B7C3' }}>{r.sub}</div>
              </div>
              <span className="tbl-date" style={{ fontSize:10, color:'#8A94A6' }}>{r.fecha}</span>
              <span style={{ fontSize:11, fontWeight:600, color: r.sub.includes('vencida') ? '#EF233C' : r.sub.includes('16') ? '#F4A100' : '#2DC653', textAlign:'right' }}>+{formatCurrency(r.importe)}</span>
            </div>
          ))}
        </div>

        {/* Pagos pendientes */}
        <div style={card}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <div style={{ fontSize:14, fontWeight:600, color:'#1A1D2E' }}>Pagos pendientes</div>
            <div style={{ display:'flex', alignItems:'center', gap:6, background:'#2DC653', color:'#fff', borderRadius:8, padding:'5px 10px', fontSize:11, fontWeight:500, cursor:'pointer' }}>Ordenar ▾</div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'20px 1fr 80px 70px 65px', ...tblHdr }}>
            <span>#</span><span>Concepto</span><span className="tbl-date">Vencimiento</span><span className="tbl-tipo">Tipo</span><span style={{ textAlign:'right' }}>Importe</span>
          </div>
          {pagos.map((p, i) => (
            <div key={i} style={{ display:'grid', gridTemplateColumns:'20px 1fr 80px 70px 65px', alignItems:'center', padding:'9px 0', borderBottom: i < pagos.length-1 ? '1px solid #F5F6FA' : 'none' }}>
              <span style={{ fontSize:10, color:'#B0B7C3' }}>{p.n}</span>
              <div>
                <div style={{ fontSize:12, fontWeight:500, color:'#1A1D2E' }}>{p.concepto}</div>
                <div style={{ fontSize:10, color:'#B0B7C3' }}>{p.detalle}</div>
              </div>
              <span className="tbl-date" style={{ fontSize:10, color: p.urgente ? '#EF233C' : '#8A94A6', fontWeight: p.urgente ? 500 : 400 }}>{p.venc}</span>
              <span className="tbl-tipo" style={{ fontSize:9, padding:'2px 7px', borderRadius:99, background:p.tipoBg, color:p.tipoColor, fontWeight:500, whiteSpace:'nowrap' }}>{p.tipo}</span>
              <span style={{ fontSize:11, fontWeight:600, color:'#EF233C', textAlign:'right' }}>{formatCurrency(Math.abs(p.importe))}</span>
            </div>
          ))}
        </div>
      </div>

    </Layout>
  )
}
