import Layout from '@/components/Layout'
import { formatCurrency } from '@/lib/formatters'

// ── Styles ─────────────────────────────────────────────────────────────
const card: React.CSSProperties = { background:'#fff', borderRadius:16, padding:'18px 20px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }
const subCard: React.CSSProperties = { background:'#F8F9FC', borderRadius:10, padding:'12px 14px' }
const cardLbl: React.CSSProperties = { fontSize:11, color:'#8A94A6', marginBottom:6, fontWeight:400 }
const cardTitle: React.CSSProperties = { fontSize:13, fontWeight:600, color:'#1A1D2E', marginBottom:6 }
const cardNum: React.CSSProperties = { fontSize:26, fontWeight:700, color:'#1A1D2E', letterSpacing:'-0.03em', marginBottom:6 }
const cardSub: React.CSSProperties = { fontSize:10, color:'#B0B7C3', marginTop:4 }
const pbarBg: React.CSSProperties = { height:8, background:'#ECEEF3', borderRadius:99, overflow:'hidden', margin:'8px 0 4px' }

function DeltaUp({ children }: { children: React.ReactNode }) {
  return <span style={{ fontSize:11, color:'#2DC653', background:'#EAFAF0', padding:'2px 8px', borderRadius:99, display:'inline-flex', alignItems:'center', gap:3, fontWeight:500 }}>{children}</span>
}
function DeltaDn({ children }: { children: React.ReactNode }) {
  return <span style={{ fontSize:11, color:'#EF233C', background:'#FEECEF', padding:'2px 8px', borderRadius:99, display:'inline-flex', alignItems:'center', gap:3, fontWeight:500 }}>{children}</span>
}
function DeltaWarn({ children }: { children: React.ReactNode }) {
  return <span style={{ fontSize:11, color:'#F4A100', background:'#FFF8E6', padding:'2px 8px', borderRadius:99, display:'inline-flex', alignItems:'center', gap:3, fontWeight:500 }}>{children}</span>
}

const movimientos = [
  { id:'N', concepto:'Nóminas Mayo', detalle:'8 empleados · SS incluida', fecha:'30 abr 2026', tipo:'salida', estado:'Programado', importe:-18400, color:'#EEF1FD', textColor:'#4361EE' },
  { id:'M', concepto:'Cobro Mercadona', detalle:'Fact. F-2026-0312', fecha:'2 may 2026', tipo:'entrada', estado:'Confirmado', importe:2800, color:'#EAFAF0', textColor:'#2DC653' },
  { id:'A', concepto:'Alquiler oficina', detalle:'Contrato anual', fecha:'1 may 2026', tipo:'salida', estado:'Programado', importe:-2100, color:'#EEF1FD', textColor:'#4361EE' },
  { id:'L', concepto:'Cobro Lantero Foods', detalle:'Fact. F-2026-0389', fecha:'16 may 2026', tipo:'entrada', estado:'Pendiente', importe:5300, color:'#FFF8E6', textColor:'#F4A100' },
  { id:'I', concepto:'IVA Q2 · Mod. 303', detalle:'AEAT · Autoliquidación', fecha:'20 jul 2026', tipo:'salida', estado:'Pendiente', importe:-3900, color:'#FFF8E6', textColor:'#F4A100' },
  { id:'C', concepto:'Cobro Carrefour', detalle:'Fact. F-2026-0401', fecha:'8 may 2026', tipo:'entrada', estado:'Confirmado', importe:1800, color:'#EAFAF0', textColor:'#2DC653' },
]

function MovBadge({ tipo, estado }: { tipo: string; estado: string }) {
  if (estado === 'Confirmado' && tipo === 'entrada') return <span style={{ fontSize:10, padding:'3px 9px', borderRadius:99, background:'#EAFAF0', color:'#2DC653', fontWeight:500 }}>✓ Confirmado</span>
  if (tipo === 'salida' && estado === 'Programado') return <span style={{ fontSize:10, padding:'3px 9px', borderRadius:99, background:'#FEECEF', color:'#EF233C', fontWeight:500 }}>↓ Salida</span>
  if (tipo === 'entrada' && estado === 'Pendiente') return <span style={{ fontSize:10, padding:'3px 9px', borderRadius:99, background:'#FFF8E6', color:'#F4A100', fontWeight:500 }}>⏳ Pendiente</span>
  if (tipo === 'salida' && estado === 'Pendiente') return <span style={{ fontSize:10, padding:'3px 9px', borderRadius:99, background:'#FFF8E6', color:'#F4A100', fontWeight:500 }}>⏳ Pendiente</span>
  return <span style={{ fontSize:10, padding:'3px 9px', borderRadius:99, background:'#EAFAF0', color:'#2DC653', fontWeight:500 }}>↑ Entrada</span>
}

export default function Dashboard() {
  return (
    <Layout title="Dashboard">
      <style>{`
        @media (max-width: 1024px) {
          .col-layout { grid-template-columns: 1fr 1fr !important; }
          .col-right { display: none !important; }
        }
        @media (max-width: 768px) {
          .col-layout { grid-template-columns: 1fr !important; }
          .kpi-grid { grid-template-columns: 1fr 1fr !important; }
          .tbl-date { display: none !important; }
          .tbl-estado { display: none !important; }
        }
      `}</style>

      <div className="col-layout" style={{ display:'grid', gridTemplateColumns:'1fr 1.5fr 1fr', gap:16 }}>

        {/* ── COL IZQUIERDA ── */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

          {/* Tu dinero real hoy */}
          <div style={card}>
            <div style={cardLbl}>Tu dinero real hoy</div>
            <div style={cardNum}>{formatCurrency(5620)}</div>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
              <DeltaUp>↑ 12,4%</DeltaUp>
              <span style={cardSub}>vs mes anterior</span>
            </div>
            <div style={cardSub}>Tras pagar todo lo comprometido · Abril 2026</div>
          </div>

          {/* Deuda bancaria */}
          <div style={card}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
              <div>
                <div style={cardTitle}>Deuda bancaria</div>
                <div style={cardSub}>Financiación activa</div>
              </div>
              <span style={{ fontSize:10, color:'#8A94A6', background:'#F5F6FA', padding:'3px 8px', borderRadius:6 }}>2 préstamos</span>
            </div>
            <div style={{ ...subCard, marginBottom:10 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                <span style={{ fontSize:11, color:'#8A94A6' }}>Préstamo ICO</span>
                <span style={{ fontSize:12, fontWeight:600, color:'#1A1D2E' }}>{formatCurrency(48000)}</span>
              </div>
              <div style={pbarBg}><div style={{ height:8, width:'63%', borderRadius:99, background:'linear-gradient(90deg,#4361EE,#7B93FF)' }} /></div>
              <div style={{ display:'flex', justifyContent:'space-between' }}>
                <span style={{ fontSize:9, color:'#B0B7C3' }}>Amortizado: 28.000€</span>
                <span style={{ fontSize:9, color:'#B0B7C3' }}>Total: 76.000€</span>
              </div>
            </div>
            <div style={subCard}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                <span style={{ fontSize:11, color:'#8A94A6' }}>Línea crédito Santander</span>
                <span style={{ fontSize:12, fontWeight:600, color:'#1A1D2E' }}>{formatCurrency(12500)}</span>
              </div>
              <div style={pbarBg}><div style={{ height:8, width:'42%', borderRadius:99, background:'linear-gradient(90deg,#4361EE,#7B93FF)' }} /></div>
              <div style={{ display:'flex', justifyContent:'space-between' }}>
                <span style={{ fontSize:9, color:'#B0B7C3' }}>Dispuesto: 12.500€</span>
                <span style={{ fontSize:9, color:'#B0B7C3' }}>Límite: 30.000€</span>
              </div>
            </div>
            <div style={{ marginTop:12, paddingTop:10, borderTop:'1px solid #ECEEF3', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:11, color:'#8A94A6' }}>Total deuda viva</span>
              <span style={{ fontSize:15, fontWeight:700, color:'#1A1D2E' }}>{formatCurrency(60500)}</span>
            </div>
          </div>

          {/* Reserva impuestos */}
          <div style={card}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
              <div>
                <div style={cardTitle}>Reserva impuestos</div>
                <div style={cardSub}>IVA Q2 · Vence 20 jul</div>
              </div>
              <DeltaWarn>68 días</DeltaWarn>
            </div>
            <div style={{ ...cardNum, color:'#F4A100' }}>{formatCurrency(2720)}</div>
            <div style={pbarBg}><div style={{ height:8, width:'70%', borderRadius:99, background:'linear-gradient(90deg,#F4A100,#FBBF24)' }} /></div>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
              <span style={{ fontSize:9, color:'#B0B7C3' }}>Provisionado: 2.720€</span>
              <span style={{ fontSize:9, color:'#F4A100', fontWeight:500 }}>Estimado: 3.900€</span>
            </div>
            <div style={{ fontSize:10, color:'#F4A100', background:'#FFF8E6', borderRadius:8, padding:'8px 10px' }}>
              Faltan <strong>1.180€</strong> por provisionar antes del 20 de julio.
            </div>
          </div>
        </div>

        {/* ── COL CENTRAL ── */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

          {/* 4 KPIs */}
          <div className="kpi-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            {[
              { lbl:'Resistencia', val:'47 días', delta:<DeltaUp>↑ 16,0%</DeltaUp> },
              { lbl:'Punto de equilibrio', val:'6.100 €', delta:<DeltaDn>↓ 8,2%</DeltaDn> },
              { lbl:'Cobros pendientes', val:'12.680 €', delta:<DeltaUp>↑ 4,3%</DeltaUp> },
              { lbl:'Pagos pendientes', val:'29.340 €', delta:<DeltaDn>↓ 2,1%</DeltaDn> },
            ].map((k, i) => (
              <div key={i} style={{ background:'#fff', borderRadius:14, padding:'16px 18px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
                <div style={cardLbl}>{k.lbl}</div>
                <div style={cardNum}>{k.val}</div>
                {k.delta}
                <div style={cardSub}>vs. periodo anterior</div>
              </div>
            ))}
          </div>

          {/* Tabla próximos movimientos */}
          <div style={{ ...card, flex:1 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
              <div style={cardTitle}>Próximos movimientos</div>
              <div style={{ display:'flex', gap:8 }}>
                <div style={{ display:'flex', alignItems:'center', gap:6, background:'#F5F6FA', borderRadius:8, padding:'5px 10px' }}>
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="#B0B7C3" strokeWidth="1.5"><circle cx="7" cy="7" r="5"/><path d="M11 11l3 3"/></svg>
                  <span style={{ fontSize:11, color:'#B0B7C3' }}>Buscar</span>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:5, background:'#F5F6FA', borderRadius:8, padding:'5px 10px', cursor:'pointer' }}>
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="#8A94A6" strokeWidth="1.5"><path d="M2 4h12M5 8h6M7 12h2"/></svg>
                  <span style={{ fontSize:11, color:'#8A94A6' }}>Filtrar</span>
                </div>
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'32px 1fr 90px 100px 80px 24px', fontSize:11, color:'#B0B7C3', fontWeight:500, paddingBottom:10, borderBottom:'1px solid #ECEEF3', marginBottom:2 }}>
              <span></span><span>Concepto</span><span className="tbl-date">Fecha</span><span className="tbl-estado">Estado</span><span style={{ textAlign:'right' }}>Importe</span><span></span>
            </div>
            {movimientos.map((m, i) => (
              <div key={i} style={{ display:'grid', gridTemplateColumns:'32px 1fr 90px 100px 80px 24px', alignItems:'center', padding:'10px 0', borderBottom: i < movimientos.length-1 ? '1px solid #F5F6FA' : 'none' }}>
                <div style={{ width:32, height:32, borderRadius:'50%', background:m.color, color:m.textColor, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, flexShrink:0 }}>{m.id}</div>
                <div>
                  <div style={{ fontSize:12, fontWeight:500, color:'#1A1D2E' }}>{m.concepto}</div>
                  <div style={{ fontSize:10, color:'#B0B7C3' }}>{m.detalle}</div>
                </div>
                <span className="tbl-date" style={{ fontSize:11, color:'#8A94A6' }}>{m.fecha}</span>
                <span className="tbl-estado"><MovBadge tipo={m.tipo} estado={m.estado} /></span>
                <span style={{ fontSize:12, fontWeight:600, color: m.importe > 0 ? '#2DC653' : '#EF233C', textAlign:'right' }}>
                  {m.importe > 0 ? '+' : ''}{formatCurrency(Math.abs(m.importe))}
                </span>
                <span style={{ fontSize:16, color:'#B0B7C3', letterSpacing:1, cursor:'pointer', textAlign:'center' }}>···</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── COL DERECHA ── */}
        <div className="col-right" style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div style={{ ...card, flex:1, display:'flex', flexDirection:'column' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
              <div style={cardTitle}>Salud financiera</div>
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="#B0B7C3" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><path d="M8 5v3"/><circle cx="8" cy="11" r="0.5" fill="#B0B7C3"/></svg>
            </div>
            <div style={{ ...cardSub, marginBottom:20 }}>Basado en liquidez, deuda y cobros</div>

            <div style={{ display:'flex', justifyContent:'center', marginBottom:16 }}>
              <svg width="200" height="130" viewBox="0 0 200 130">
                <defs>
                  <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#4361EE"/>
                    <stop offset="100%" stopColor="#7B93FF"/>
                  </linearGradient>
                </defs>
                <path d="M 20 110 A 80 80 0 0 1 180 110" fill="none" stroke="#ECEEF3" strokeWidth="14" strokeLinecap="round"/>
                <path d="M 28 110 A 72 72 0 0 1 172 110" fill="none" stroke="#ECEEF3" strokeWidth="10" strokeLinecap="round"/>
                <path d="M 36 110 A 64 64 0 0 1 164 110" fill="none" stroke="#ECEEF3" strokeWidth="8" strokeLinecap="round"/>
                <path d="M 20 110 A 80 80 0 0 1 163 42" fill="none" stroke="url(#gaugeGrad)" strokeWidth="14" strokeLinecap="round"/>
                <path d="M 28 110 A 72 72 0 0 1 155 46" fill="none" stroke="#4361EE" strokeWidth="10" strokeLinecap="round" opacity="0.5"/>
                <path d="M 36 110 A 64 64 0 0 1 147 50" fill="none" stroke="#4361EE" strokeWidth="8" strokeLinecap="round" opacity="0.25"/>
                <text x="100" y="98" textAnchor="middle" fontSize="32" fontWeight="700" fill="#1A1D2E" fontFamily="Inter">68%</text>
                <text x="100" y="114" textAnchor="middle" fontSize="10" fill="#8A94A6" fontFamily="Inter">Salud financiera</text>
              </svg>
            </div>

            <div style={{ display:'flex', justifyContent:'center', gap:14, marginBottom:18 }}>
              {[{ color:'#4361EE', label:'Liquidez' }, { color:'#A0AEF5', label:'Cobros' }, { color:'#D6DCFA', label:'Deuda' }].map(l => (
                <div key={l.label} style={{ display:'flex', alignItems:'center', gap:5, fontSize:10, color:'#8A94A6' }}>
                  <div style={{ width:8, height:8, borderRadius:2, background:l.color }} />{l.label}
                </div>
              ))}
            </div>

            <div style={{ height:1, background:'#ECEEF3', marginBottom:14 }} />

            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {[
                { color:'#4361EE', label:'Liquidez', pct:82 },
                { color:'#A0AEF5', label:'Cobros', pct:61 },
                { color:'#D6DCFA', label:'Deuda', pct:58 },
              ].map(m => (
                <div key={m.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <div style={{ width:8, height:8, borderRadius:'50%', background:m.color }} />
                    <span style={{ fontSize:11, color:'#8A94A6' }}>{m.label}</span>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{ width:70, height:5, background:'#ECEEF3', borderRadius:99, overflow:'hidden' }}>
                      <div style={{ height:5, width:`${m.pct}%`, background:m.color, borderRadius:99 }} />
                    </div>
                    <span style={{ fontSize:12, fontWeight:600, color:'#1A1D2E' }}>{m.pct}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </Layout>
  )
}
