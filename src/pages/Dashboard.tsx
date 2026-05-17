import Layout from '@/components/Layout'
import { mockPrevisiones } from '@/lib/mockData'
import { formatCurrency, formatDate } from '@/lib/formatters'

function Badge({ children, color, bg }: { children: React.ReactNode; color: string; bg: string }) {
  return <span style={{ fontSize:9, fontWeight:500, color, background:bg, padding:'2px 8px', borderRadius:99 }}>{children}</span>
}

function IATag() {
  return (
    <div style={{ fontSize:9, fontWeight:600, color:'#00BCD4', textTransform:'uppercase', letterSpacing:'0.06em', margin:'10px 0 2px', display:'flex', alignItems:'center', gap:3 }}>
      <svg width="9" height="9" viewBox="0 0 16 16" fill="none" stroke="#00BCD4" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><path d="M8 5v3l1.5 1"/></svg>
      IA
    </div>
  )
}

function PBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div style={{ height:3, background:'#F3F4F6', borderRadius:99, margin:'8px 0 4px', overflow:'hidden' }}>
      <div style={{ height:3, width:`${Math.min(pct,100)}%`, background:color, borderRadius:99 }} />
    </div>
  )
}

function FranjaBar({ label, amount, total, bgColor, fillColor, textColor, risk, riskColor }: {
  label: string; amount: number; total: number; bgColor: string; fillColor: string; textColor: string; risk: string; riskColor: string
}) {
  const pct = Math.round((amount / total) * 100)
  return (
    <div style={{ marginBottom:10 }}>
      <div style={{ height:22, background:bgColor, borderRadius:6, overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${pct}%`, background:fillColor, borderRadius:6, display:'flex', alignItems:'center', paddingLeft:10, fontSize:10, fontWeight:600, color:textColor, whiteSpace:'nowrap' }}>
          {formatCurrency(amount)}
        </div>
      </div>
      <div style={{ display:'flex', justifyContent:'space-between', marginTop:4 }}>
        <span style={{ fontSize:9, color:'#9CA3AF' }}>{label}</span>
        <span style={{ fontSize:9, color:riskColor }}>{risk}</span>
      </div>
    </div>
  )
}

function CashflowChart() {
  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
        <div>
          <div style={{ fontSize:13, fontWeight:600, color:'#111827' }}>Cashflow</div>
          <div style={{ fontSize:10, color:'#9CA3AF', marginTop:2 }}>Entradas, salidas y saldo neto · 2026</div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <div style={{ display:'flex', alignItems:'center', gap:4, fontSize:10, color:'#9CA3AF' }}>
            <div style={{ width:20, height:2, background:'#00BCD4', borderRadius:99 }}></div>Entradas
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:4, fontSize:10, color:'#9CA3AF' }}>
            <svg width="20" height="2"><line x1="0" y1="1" x2="20" y2="1" stroke="#0D2E6E" strokeWidth="1.5" strokeDasharray="5,3"/></svg>Salidas
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:4, fontSize:10, color:'#9CA3AF' }}>
            <div style={{ width:20, height:2, background:'#16A34A', borderRadius:99 }}></div>Saldo neto
          </div>
        </div>
      </div>
      <div style={{ position:'relative', height:160, marginLeft:36, marginRight:8 }}>
        <div style={{ position:'absolute', left:-36, top:0, height:'100%', display:'flex', flexDirection:'column', justifyContent:'space-between', padding:'4px 0' }}>
          {['€100k','€75k','€50k','€25k','€0'].map(l => <span key={l} style={{ fontSize:8, color:'#9CA3AF' }}>{l}</span>)}
        </div>
        <svg width="100%" height="100%" viewBox="0 0 620 160" preserveAspectRatio="none">
          <defs>
            <linearGradient id="areaIn" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00BCD4" stopOpacity="0.12"/>
              <stop offset="100%" stopColor="#00BCD4" stopOpacity="0"/>
            </linearGradient>
            <linearGradient id="areaNet" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#16A34A" stopOpacity="0.08"/>
              <stop offset="100%" stopColor="#16A34A" stopOpacity="0"/>
            </linearGradient>
          </defs>
          {[6,44,82,120,154].map(y => <line key={y} x1="0" y1={y} x2="620" y2={y} stroke="#F3F4F6" strokeWidth="0.5"/>)}
          <path d="M0,110 C30,108 56,100 112,90 C168,80 196,74 252,64 C308,54 336,50 392,42 C448,34 476,28 532,20 C560,16 588,12 620,8 L620,154 L0,154 Z" fill="url(#areaIn)"/>
          <path d="M0,110 C30,108 56,100 112,90 C168,80 196,74 252,64 C308,54 336,50 392,42 C448,34 476,28 532,20 C560,16 588,12 620,8" fill="none" stroke="#00BCD4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M0,130 C30,128 56,126 112,122 C168,118 196,116 252,112 C308,108 336,106 392,100 C448,94 476,90 532,86 C560,84 588,82 620,78" fill="none" stroke="#0D2E6E" strokeWidth="1.5" strokeDasharray="5,3" strokeLinecap="round"/>
          <path d="M0,120 C30,116 56,110 112,100 C168,90 196,84 252,72 C308,60 336,54 392,44 C448,34 476,26 532,16 C560,11 588,8 620,4 L620,154 L0,154 Z" fill="url(#areaNet)"/>
          <path d="M0,120 C30,116 56,110 112,100 C168,90 196,84 252,72 C308,60 336,54 392,44 C448,34 476,26 532,16 C560,11 588,8 620,4" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="196" y1="6" x2="196" y2="154" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="3,3"/>
          <circle cx="196" cy="74" r="4" fill="#00BCD4" stroke="white" strokeWidth="1.5"/>
          <circle cx="196" cy="116" r="4" fill="#0D2E6E" stroke="white" strokeWidth="1.5"/>
          <circle cx="196" cy="84" r="4" fill="#16A34A" stroke="white" strokeWidth="1.5"/>
          <rect x="206" y="10" width="100" height="68" rx="8" fill="#1F2937"/>
          <text x="216" y="26" fontSize="9" fontWeight="600" fill="white" fontFamily="Inter">Abril 2026</text>
          <rect x="216" y="32" width="7" height="7" rx="1.5" fill="#00BCD4"/>
          <text x="227" y="39" fontSize="8" fill="rgba(255,255,255,0.7)" fontFamily="Inter">Entradas: €94.200</text>
          <rect x="216" y="44" width="7" height="7" rx="1.5" fill="#0D2E6E"/>
          <text x="227" y="51" fontSize="8" fill="rgba(255,255,255,0.7)" fontFamily="Inter">Salidas: €43.800</text>
          <rect x="216" y="56" width="7" height="7" rx="1.5" fill="#16A34A"/>
          <text x="227" y="63" fontSize="8" fill="rgba(255,255,255,0.7)" fontFamily="Inter">Neto: +€50.400</text>
          <polygon points="206,44 211,40 211,48" fill="#1F2937"/>
        </svg>
      </div>
      <div style={{ display:'flex', justifyContent:'space-between', fontSize:8, color:'#9CA3AF', marginTop:6, marginLeft:36, marginRight:8 }}>
        {['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'].map(m => <span key={m}>{m}</span>)}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginTop:14, paddingTop:12, borderTop:'1px solid #F3F4F6' }}>
        {[
          { label:'Total entradas', val:'€94.200', color:'#00BCD4' },
          { label:'Total salidas', val:'€43.800', color:'#0D2E6E' },
          { label:'Saldo neto', val:'+€50.400', color:'#16A34A' },
          { label:'VS mes anterior', val:'↑ +12,3%', color:'#16A34A' },
        ].map((k,i) => (
          <div key={k.label} style={{ textAlign:'center', borderLeft: i>0 ? '1px solid #F3F4F6' : 'none' }}>
            <div style={{ fontSize:9, color:'#9CA3AF', marginBottom:3 }}>{k.label}</div>
            <div style={{ fontSize:13, fontWeight:600, color:k.color }}>{k.val}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

const cardStyle: React.CSSProperties = { background:'#fff', border:'1px solid #EAECF0', borderRadius:12, padding:'16px 18px' }

export default function Dashboard() {
  const supervivencia = 5620
  const fiscalReserva = 2720
  const fiscalEstimado = 3900
  const fiscalPct = Math.round((fiscalReserva / fiscalEstimado) * 100)
  const rendimientoPct = 66
  const facturado = 6100
  const objetivo = 9200
  const cobrosTotal = 12680
  const cobros30 = 2500
  const cobros60 = 5300
  const cobros90 = 4880
  const resistenciaDias = 47

  return (
    <Layout title="Dashboard">

      {/* KPI GRID */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gridTemplateRows:'auto auto', gap:10, flexShrink:0 }}>

        {/* Supervivencia */}
        <div style={cardStyle}>
          <div style={{ fontSize:11, color:'#9CA3AF', marginBottom:6 }}>Supervivencia · Tu dinero real hoy</div>
          <div style={{ fontSize:22, fontWeight:600, color:'#111827', letterSpacing:'-0.03em', marginBottom:5 }}>{formatCurrency(supervivencia)}</div>
          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
            <span style={{ fontSize:10, fontWeight:500, color:'#16A34A', background:'#DCFCE7', padding:'2px 7px', borderRadius:99 }}>↑ Posición sólida</span>
            <span style={{ fontSize:10, color:'#9CA3AF' }}>tras compromisos del mes</span>
          </div>
          <PBar pct={62} color="#00BCD4" />
          <IATag />
          <div style={{ fontSize:10, color:'#6B7280', lineHeight:1.55 }}>Reserva <strong>{formatCurrency(fiscalReserva)}</strong> para el IVA del 20 jul — ese dinero no es tuyo.</div>
        </div>

        {/* Rendimiento */}
        <div style={cardStyle}>
          <div style={{ fontSize:11, color:'#9CA3AF', marginBottom:6 }}>Rendimiento mensual · Punto de equilibrio</div>
          <div style={{ fontSize:22, fontWeight:600, color:'#111827', letterSpacing:'-0.03em', marginBottom:5 }}>{rendimientoPct}%</div>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:9, color:'#9CA3AF', marginTop:2 }}>
            <span>Facturado: {formatCurrency(facturado)}</span><span>Objetivo: {formatCurrency(objetivo)}</span>
          </div>
          <PBar pct={rendimientoPct} color="#00BCD4" />
          <div style={{ fontSize:10, color:'#6B7280' }}>Faltan <strong>{formatCurrency(objetivo - facturado)}</strong> para cubrir costes fijos.</div>
          <IATag />
          <div style={{ fontSize:10, color:'#6B7280', lineHeight:1.55 }}>Necesitas <strong>3-4 presupuestos</strong> cerrados esta semana. Ticket medio: €900.</div>
        </div>

        {/* Cobros pendientes — 2 filas */}
        <div style={{ ...cardStyle, gridColumn:3, gridRow:'1/3', display:'flex', flexDirection:'column' }}>
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
            <div>
              <div style={{ fontSize:11, color:'#9CA3AF' }}>Cobros pendientes</div>
              <div style={{ fontSize:10, color:'#9CA3AF' }}>Te deben en total</div>
            </div>
            <div style={{ fontSize:22, fontWeight:600, color:'#111827', letterSpacing:'-0.03em' }}>{formatCurrency(cobrosTotal)}</div>
          </div>
          <IATag />
          <div style={{ fontSize:10, color:'#6B7280', lineHeight:1.55, marginBottom:14 }}>
            <strong>Llama hoy a Mercadona</strong> (91 días vencida, €2.800). Los €5.300 de Lantero vencen en 16 días.
          </div>
          <div style={{ height:'0.5px', background:'#F3F4F6', margin:'0 0 12px' }} />
          <FranjaBar label="<30 días" amount={cobros30} total={cobrosTotal} bgColor="#EFF6FF" fillColor="#BFDBFE" textColor="#1E40AF" risk="Riesgo bajo" riskColor="#6B7280" />
          <FranjaBar label="31-60 días" amount={cobros60} total={cobrosTotal} bgColor="#EFF6FF" fillColor="#93C5FD" textColor="#1E3A8A" risk="Riesgo medio" riskColor="#6B7280" />
          <FranjaBar label="+60 días" amount={cobros90} total={cobrosTotal} bgColor="#EFF6FF" fillColor="#3B82F6" textColor="#fff" risk="Riesgo alto" riskColor="#DC2626" />
        </div>

        {/* Resistencia */}
        <div style={cardStyle}>
          <div style={{ fontSize:11, color:'#9CA3AF', marginBottom:6 }}>Resistencia · Aguantas sin vender</div>
          <div style={{ fontSize:22, fontWeight:600, color:'#111827', letterSpacing:'-0.03em', marginBottom:5 }}>{resistenciaDias} días</div>
          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
            <span style={{ fontSize:10, fontWeight:500, color:'#D97706', background:'#FFFBEB', padding:'2px 7px', borderRadius:99 }}>↑ Zona de atención</span>
            <span style={{ fontSize:10, color:'#9CA3AF' }}>objetivo: 60 días</span>
          </div>
          <PBar pct={(resistenciaDias/90)*100} color="#D97706" />
          <IATag />
          <div style={{ fontSize:10, color:'#6B7280', lineHeight:1.55 }}>Factura <strong>€1.500 más</strong> o reduce gastos en €180 para llegar a zona segura.</div>
        </div>

        {/* Fiscal */}
        <div style={{ ...cardStyle, background:'#FFFBEB', borderColor:'#FDE68A' }}>
          <div style={{ fontSize:11, color:'#B45309', marginBottom:6 }}>Fiscal · Reserva para Hacienda</div>
          <div style={{ fontSize:22, fontWeight:600, color:'#92400E', letterSpacing:'-0.03em', marginBottom:5 }}>{formatCurrency(fiscalReserva)}</div>
          <PBar pct={fiscalPct} color="#D97706" />
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:9, color:'#92400E', marginBottom:2 }}>
            <span>T2 · IVA trimestre en curso</span><span>vence 20 jul · 68d</span>
          </div>
          <div style={{ fontSize:9, fontWeight:600, color:'#D97706', textTransform:'uppercase', letterSpacing:'0.06em', margin:'10px 0 2px' }}>IA</div>
          <div style={{ fontSize:10, color:'#78350F', lineHeight:1.55 }}>IVA estimado subirá a <strong>~{formatCurrency(fiscalEstimado)}</strong>. Provisiona ahora. Vence <strong>20 julio</strong>.</div>
        </div>

      </div>

      {/* CASHFLOW */}
      <div style={{ ...cardStyle, flexShrink:0 }}>
        <CashflowChart />
      </div>

      {/* PREVISIONES */}
      <div style={{ ...cardStyle, flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
          <span style={{ fontSize:13, fontWeight:600, color:'#111827' }}>Previsiones</span>
          <div style={{ display:'flex', gap:6 }}>
            <div style={{ display:'flex', alignItems:'center', gap:4, fontSize:10, color:'#6B7280', background:'#F9FAFB', border:'1px solid #EAECF0', borderRadius:6, padding:'4px 9px' }}>
              <svg width="9" height="9" viewBox="0 0 16 16" fill="none" stroke="#9CA3AF" strokeWidth="1.5"><circle cx="7" cy="7" r="5"/><path d="M11 11l3 3"/></svg>Buscar
            </div>
            <div style={{ fontSize:10, color:'#6B7280', background:'#F9FAFB', border:'1px solid #EAECF0', borderRadius:6, padding:'4px 9px', cursor:'pointer' }}>Filtrar ▾</div>
          </div>
        </div>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr>
              {['Concepto','Vencimiento','Categoría','Periodicidad','Importe','Estado','Días'].map(h => (
                <th key={h} style={{ fontSize:10, fontWeight:500, color:'#9CA3AF', textAlign:'left', padding:'6px 10px', borderBottom:'1px solid #F3F4F6' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockPrevisiones.map(p => (
              <tr key={p.id}>
                <td style={{ padding:'7px 10px', borderBottom:'1px solid #F9FAFB' }}>
                  <div style={{ fontWeight:500, color:'#111827', fontSize:11 }}>{p.concepto}</div>
                  <div style={{ fontSize:9, color:'#9CA3AF' }}>{p.detalle}</div>
                </td>
                <td style={{ fontSize:10, color:'#9CA3AF', padding:'7px 10px', borderBottom:'1px solid #F9FAFB' }}>{formatDate(p.vencimiento)}</td>
                <td style={{ padding:'7px 10px', borderBottom:'1px solid #F9FAFB' }}>
                  <Badge
                    color={p.categoria==='Fiscal'?'#92400E':p.categoria==='Gasto fijo'?'#991B1B':'#6B21A8'}
                    bg={p.categoria==='Fiscal'?'#FFFBEB':p.categoria==='Gasto fijo'?'#FEF2F2':'#F5F3FF'}
                  >{p.categoria}</Badge>
                </td>
                <td style={{ fontSize:10, color:'#9CA3AF', padding:'7px 10px', borderBottom:'1px solid #F9FAFB' }}>{p.periodicidad}</td>
                <td style={{ fontSize:11, fontWeight:600, padding:'7px 10px', borderBottom:'1px solid #F9FAFB', color:p.categoria==='Fiscal'?'#D97706':'#DC2626' }}>{formatCurrency(p.importe)}</td>
                <td style={{ padding:'7px 10px', borderBottom:'1px solid #F9FAFB' }}>
                  <Badge
                    color={p.estado==='Pendiente'?'#92400E':'#6B7280'}
                    bg={p.estado==='Pendiente'?'#FFFBEB':'#F3F4F6'}
                  >{p.estado}</Badge>
                </td>
                <td style={{ padding:'7px 10px', borderBottom:'1px solid #F9FAFB' }}>
                  <span style={{ fontSize:10, fontWeight:500, color:p.urgente?'#DC2626':p.diasRestantes<=30?'#D97706':'#9CA3AF' }}>{p.diasRestantes} días</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </Layout>
  )
}
