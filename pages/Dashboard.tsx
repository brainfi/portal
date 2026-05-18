import Layout from '@/components/Layout'
import { formatCurrency } from '@/lib/formatters'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ComposedChart, Line
} from 'recharts'
import { PieChart, Pie, Cell as PieCell } from 'recharts'

const cashflowData = [
  { mes:'Ene', entradas:72000, gastos:38000 },
  { mes:'Feb', entradas:78000, gastos:40000 },
  { mes:'Mar', entradas:82000, gastos:41000 },
  { mes:'Abr', entradas:94200, gastos:43800 },
  { mes:'May', entradas:88000, gastos:42000 },
  { mes:'Jun', entradas:96000, gastos:44000 },
  { mes:'Jul', entradas:90000, gastos:43000 },
  { mes:'Ago', entradas:98000, gastos:45000 },
  { mes:'Sep', entradas:92000, gastos:43500 },
  { mes:'Oct', entradas:102000, gastos:46000 },
  { mes:'Nov', entradas:106000, gastos:47000 },
  { mes:'Dic', entradas:110000, gastos:48000 },
].map(d => ({ ...d, neto: d.entradas - d.gastos }))

const pagos = [
  { concepto:'IVA Q2 · Mod. 303', detalle:'AEAT', vencimiento:'20 jul', dias:68, tipo:'Fiscal', importe:3900, urgente:true },
  { concepto:'IRPF · Mod. 111', detalle:'AEAT', vencimiento:'20 jul', dias:68, tipo:'Fiscal', importe:4200, urgente:true },
  { concepto:'Nóminas · Mayo', detalle:'8 empleados', vencimiento:'30 abr', dias:21, tipo:'Gasto fijo', importe:18400, urgente:false },
  { concepto:'Alquiler oficina', detalle:'Anual', vencimiento:'1 may', dias:22, tipo:'Gasto fijo', importe:2100, urgente:false },
  { concepto:'Adobe Creative Cloud', detalle:'5 licencias', vencimiento:'5 may', dias:26, tipo:'Suscripción', importe:290, urgente:false },
  { concepto:'HubSpot CRM', detalle:'Plan Pro', vencimiento:'10 may', dias:31, tipo:'Suscripción', importe:450, urgente:false },
]

const cobros = [
  { label:'30 días', sublabel:'Riesgo bajo', importe:2500, pct:19.7, barColor:'#93C5FD', iconColor:'#9CA3AF', iconBg:'transparent', iconBorder:'#D1D5DB', icon:'ti-plus' },
  { label:'60 días', sublabel:'Riesgo medio', importe:5300, pct:41.8, barColor:'#3B82F6', iconColor:'#D97706', iconBg:'#FFFBEB', iconBorder:'#FDE68A', icon:'ti-arrow-up' },
  { label:'+60 días', sublabel:'Riesgo alto', importe:4880, pct:38.5, barColor:'#1d4ed8', iconColor:'#DC2626', iconBg:'#FEF2F2', iconBorder:'#FECACA', icon:'ti-alert-triangle', danger:true },
]

const clientes = [
  { initials:'MC', nombre:'Mercadona', sub:'91 días vencida', importe:2800, pct:'22,1%', color:'#DC2626', bg:'#FEE2E2' },
  { initials:'LF', nombre:'Lantero Foods', sub:'Vence en 16 días', importe:5300, pct:'41,8%', color:'#D97706', bg:'#FFFBEB' },
  { initials:'CE', nombre:'Carrefour España', sub:'Vence en 8 días', importe:1800, pct:'14,2%', color:'#1d4ed8', bg:'#EFF6FF' },
]

const donutData = [
  { name:'Fiscal', value:8100, color:'#BFDBFE' },
  { name:'Gasto fijo', value:20500, color:'#3B82F6' },
  { name:'Suscripción', value:740, color:'#93C5FD' },
]

const totalPagos = pagos.reduce((a, p) => a + p.importe, 0)
const totalCobros = cobros.reduce((a, c) => a + c.importe, 0)

// Column widths — left panel same as "Tu dinero real hoy" card
const LEFT_W = 220

function CashflowTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'#1F2937', borderRadius:10, padding:'10px 14px', fontSize:11, boxShadow:'0 4px 16px rgba(0,0,0,0.2)' }}>
      <div style={{ fontWeight:600, color:'white', marginBottom:8 }}>{label} 2026</div>
      {[{ key:'entradas', label:'Ingresos', color:'#1d6fd8' }, { key:'gastos', label:'Gastos', color:'#0D2E6E' }, { key:'neto', label:'Neto', color:'#00BCD4' }].map(item => {
        const p = payload.find((x: any) => x.dataKey === item.key)
        if (!p) return null
        return (
          <div key={item.key} style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
            <div style={{ width:8, height:8, borderRadius:2, background:item.color }} />
            <span style={{ color:'rgba(255,255,255,0.75)' }}>{item.label}: {formatCurrency(p.value)}</span>
          </div>
        )
      })}
    </div>
  )
}

function TipoBadge({ tipo }: { tipo: string }) {
  const s: Record<string, { bg: string; color: string }> = {
    'Fiscal': { bg:'#FFFBEB', color:'#92400E' },
    'Gasto fijo': { bg:'#F3F4F6', color:'#6B7280' },
    'Suscripción': { bg:'#EFF6FF', color:'#1d4ed8' },
  }
  const st = s[tipo] ?? s['Gasto fijo']
  return <span style={{ fontSize:9, padding:'2px 8px', borderRadius:99, whiteSpace:'nowrap', fontWeight:500, background:st.bg, color:st.color }}>{tipo}</span>
}

const card: React.CSSProperties = { background:'#fff', border:'0.5px solid #EAECF0', borderRadius:12, padding:'16px 18px' }
const hdrStyle: React.CSSProperties = { fontSize:10, color:'#9CA3AF', fontWeight:500, paddingBottom:8, borderBottom:'0.5px solid #F3F4F6', marginBottom:2 }
const rowBase: React.CSSProperties = { display:'grid', alignItems:'center', padding:'9px 0', borderBottom:'0.5px solid #F9FAFB' }

function StatCard({ icon, label, value, delta, deltaUp, bg, textColor, subColor }: any) {
  return (
    <div style={{ padding:'14px 16px', background: bg ?? '#F9FAFB', borderRadius:10, border:'0.5px solid #EAECF0' }}>
      <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8 }}>
        <div style={{ width:22, height:22, borderRadius:6, background: icon.bg, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <i className={`ti ${icon.name}`} aria-hidden="true" style={{ fontSize:11, color:'#fff' }} />
        </div>
        <span style={{ fontSize:10, color: subColor ?? '#6B7280', fontWeight:500 }}>{label}</span>
      </div>
      <div style={{ fontSize:17, fontWeight:600, color: textColor ?? '#111827', letterSpacing:'-0.02em' }}>{value}</div>
      <div style={{ fontSize:10, color: deltaUp ? '#1d6fd8' : '#DC2626', marginTop:3 }}>{delta}</div>
    </div>
  )
}

export default function Dashboard() {
  return (
    <Layout title="Dashboard">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');
        @media (max-width: 768px) {
          .dash-hero { grid-template-columns: 1fr !important; }
          .dash-cf { flex-direction: column !important; }
          .dash-cf-left { width: 100% !important; flex-direction: row !important; gap: 8px !important; }
          .dash-section { flex-direction: column !important; }
          .dash-section-left { width: 100% !important; }
          .dash-pago-hide { display: none !important; }
        }
      `}</style>

      {/* FILA HERO — 4 tarjetas */}
      <div className="dash-hero" style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:10, flexShrink:0 }}>
        <div style={{ background:'#0D2E6E', borderRadius:12, padding:'16px 18px', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', right:-20, top:-20, width:120, height:120, borderRadius:'50%', border:'1px solid rgba(255,255,255,0.07)' }} />
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.45)', marginBottom:6 }}>Tu dinero real hoy</div>
          <div style={{ display:'flex', alignItems:'baseline', gap:8, marginBottom:4 }}>
            <span style={{ fontSize:26, fontWeight:600, color:'#fff', letterSpacing:'-0.03em' }}>5.620 €</span>
            <span style={{ fontSize:11, fontWeight:500, color:'#4ade80', background:'rgba(74,222,128,0.12)', padding:'2px 8px', borderRadius:99 }}>↑ 12,4%</span>
          </div>
          <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)' }}>Tras pagar todo lo comprometido · Abril 2026</div>
        </div>
        <div style={card}>
          <div style={{ fontSize:11, color:'#9CA3AF', marginBottom:8, display:'flex', alignItems:'center', gap:5, fontWeight:500 }}>
            <i className="ti ti-shield" aria-hidden="true" style={{ fontSize:13, color:'#1d6fd8' }} />Resistencia
          </div>
          <div style={{ fontSize:22, fontWeight:600, color:'#111827', letterSpacing:'-0.02em', marginBottom:4 }}>47 días <span style={{ fontSize:12, color:'#1d6fd8', fontWeight:500 }}>↑ 16,0%</span></div>
          <div style={{ fontSize:10, color:'#9CA3AF' }}>vs. 40 días periodo anterior</div>
        </div>
        <div style={card}>
          <div style={{ fontSize:11, color:'#9CA3AF', marginBottom:8, display:'flex', alignItems:'center', gap:5, fontWeight:500 }}>
            <i className="ti ti-chart-dots" aria-hidden="true" style={{ fontSize:13, color:'#1d6fd8' }} />Punto de equilibrio
          </div>
          <div style={{ fontSize:22, fontWeight:600, color:'#111827', letterSpacing:'-0.02em', marginBottom:4 }}>6.100 € <span style={{ fontSize:12, color:'#DC2626', fontWeight:500 }}>↓ 8,2%</span></div>
          <div style={{ fontSize:10, color:'#9CA3AF' }}>vs. 4.116,50 € periodo anterior</div>
        </div>
        <div style={{ background:'#EFF6FF', border:'0.5px solid #BFDBFE', borderRadius:12, padding:'16px 18px' }}>
          <div style={{ fontSize:11, color:'#1d4ed8', marginBottom:8, display:'flex', alignItems:'center', gap:5, fontWeight:500 }}>
            <i className="ti ti-receipt-tax" aria-hidden="true" style={{ fontSize:13, color:'#1d6fd8' }} />Reserva para impuestos
          </div>
          <div style={{ fontSize:22, fontWeight:600, color:'#1e3a8a', letterSpacing:'-0.02em', marginBottom:4 }}>2.720 € <span style={{ fontSize:12, color:'#1d6fd8', fontWeight:500 }}>↑ 35,2%</span></div>
          <div style={{ fontSize:10, color:'#1d6fd8' }}>IVA Q2 estimado: 3.900 € · 68 días</div>
        </div>
      </div>

      {/* CASHFLOW — stats izquierda alineados, gráfica derecha */}
      <div className="dash-cf" style={{ display:'flex', gap:10, alignItems:'stretch' }}>
        {/* Panel izquierdo — mismo ancho que "Tu dinero real hoy" */}
        <div className="dash-cf-left" style={{ width:'calc(25% - 7.5px)', flexShrink:0, display:'flex', flexDirection:'column', gap:10 }}>
          <StatCard
            icon={{ name:'ti-arrow-down-left', bg:'#1d6fd8' }}
            label="Ingresos" value="94.200 €" delta="↑ 45,0% vs periodo ant." deltaUp
            bg="#EFF6FF" textColor="#1e3a8a" subColor="#1d4ed8"
          />
          <StatCard
            icon={{ name:'ti-arrow-up-right', bg:'#0D2E6E' }}
            label="Gastos" value="43.800 €" delta="↑ 12,5% vs periodo ant." deltaUp={false}
            bg="#F9FAFB" textColor="#111827" subColor="#6B7280"
          />
          <StatCard
            icon={{ name:'ti-trending-up', bg:'#16A34A' }}
            label="Saldo neto" value="+50.400 €" delta="↑ 12,3% vs periodo ant." deltaUp
            bg="#F0FDF4" textColor="#15803D" subColor="#16A34A"
          />
        </div>
        {/* Gráfica */}
        <div style={{ ...card, flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
            <div style={{ fontSize:13, fontWeight:600, color:'#111827', display:'flex', alignItems:'center', gap:6 }}>
              <i className="ti ti-arrows-exchange" aria-hidden="true" style={{ fontSize:14, color:'#1d6fd8' }} />Cash Flow
            </div>
            <div style={{ display:'flex', gap:6 }}>
              <span style={{ fontSize:10, fontWeight:500, padding:'3px 10px', borderRadius:99, background:'#EFF6FF', color:'#1d4ed8', border:'0.5px solid #BFDBFE' }}>Mensual</span>
              <span style={{ fontSize:10, padding:'3px 10px', borderRadius:99, color:'#9CA3AF', border:'0.5px solid #EAECF0' }}>Diario</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <ComposedChart data={cashflowData} barGap={2} margin={{ top:4, right:4, left:0, bottom:0 }}>
              <CartesianGrid strokeDasharray="0" stroke="#F3F4F6" vertical={false} />
              <XAxis dataKey="mes" tick={{ fontSize:8, fill:'#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:8, fill:'#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={v => `€${v/1000}k`} width={36} />
              <Tooltip content={<CashflowTooltip />} cursor={{ fill:'rgba(0,0,0,0.02)' }} />
              <Bar dataKey="entradas" radius={[3,3,0,0]} maxBarSize={20}>
                {cashflowData.map((_, i) => <Cell key={i} fill={i===3 ? '#1d6fd8' : '#93C5FD'} />)}
              </Bar>
              <Bar dataKey="gastos" radius={[3,3,0,0]} maxBarSize={10}>
                {cashflowData.map((_, i) => <Cell key={i} fill={i===3 ? '#0D2E6E' : '#7986CB'} />)}
              </Bar>
              <Line type="monotone" dataKey="neto" stroke="#00BCD4" strokeWidth={1.5} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* COBROS PENDIENTES */}
      <div className="dash-section" style={{ display:'flex', gap:10, alignItems:'stretch' }}>
        {/* Panel izquierdo — resumen por días */}
        <div className="dash-section-left" style={{ width:'calc(25% - 7.5px)', flexShrink:0, ...card }}>
          <div style={{ fontSize:12, fontWeight:600, color:'#111827', marginBottom:8, display:'flex', alignItems:'center', gap:5 }}>
            <i className="ti ti-trending-up" aria-hidden="true" style={{ fontSize:13, color:'#1d6fd8' }} />Cobros pendientes
          </div>
          <div style={{ fontSize:20, fontWeight:600, color:'#111827', letterSpacing:'-0.02em', marginBottom:14 }}>{formatCurrency(totalCobros)}</div>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {cobros.map((c, i) => (
              <div key={i}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                  <span style={{ fontSize:10, color: c.danger ? '#DC2626' : '#9CA3AF' }}>{c.label} · {c.sublabel}</span>
                  <span style={{ fontSize:10, fontWeight:600, color: c.danger ? '#DC2626' : '#111827' }}>{formatCurrency(c.importe)}</span>
                </div>
                <div style={{ height:4, background:'#F3F4F6', borderRadius:99 }}>
                  <div style={{ height:4, width:`${c.pct}%`, background:c.barColor, borderRadius:99 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Tabla detalle */}
        <div style={{ ...card, flex:1, minWidth:0 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 110px 90px 70px', ...hdrStyle }}>
            <span>Concepto</span><span>Vencimiento</span><span>Cliente</span><span style={{ textAlign:'right' }}>Importe</span>
          </div>
          {clientes.map((c, i) => (
            <div key={i} style={{ ...rowBase, gridTemplateColumns:'1fr 110px 90px 70px', borderBottom: i < clientes.length-1 ? '0.5px solid #F9FAFB' : 'none' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ width:24, height:24, borderRadius:'50%', background:c.bg, color:c.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:600, flexShrink:0 }}>{c.initials}</div>
                <span style={{ fontSize:11, fontWeight:500, color:'#111827' }}>{c.nombre}</span>
              </div>
              <div style={{ fontSize:10, color: c.color, fontWeight:500 }}>{c.sub}</div>
              <div style={{ fontSize:10, color:'#9CA3AF' }}>{c.pct}</div>
              <div style={{ textAlign:'right', fontSize:12, fontWeight:600, color:c.color }}>{formatCurrency(c.importe)}</div>
            </div>
          ))}
          <div style={{ height:'0.5px', background:'#EAECF0', margin:'10px 0' }} />
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontSize:11, color:'#9CA3AF' }}>Total cobros pendientes</span>
            <span style={{ fontSize:14, fontWeight:600, color:'#111827' }}>{formatCurrency(totalCobros)}</span>
          </div>
        </div>
      </div>

      {/* PAGOS PENDIENTES */}
      <div className="dash-section" style={{ display:'flex', gap:10, alignItems:'stretch' }}>
        {/* Panel izquierdo — donut */}
        <div className="dash-section-left" style={{ width:'calc(25% - 7.5px)', flexShrink:0, ...card }}>
          <div style={{ fontSize:12, fontWeight:600, color:'#111827', marginBottom:8, display:'flex', alignItems:'center', gap:5 }}>
            <i className="ti ti-trending-down" aria-hidden="true" style={{ fontSize:13, color:'#1d6fd8' }} />Pagos pendientes
          </div>
          <div style={{ fontSize:20, fontWeight:600, color:'#111827', letterSpacing:'-0.02em', marginBottom:14 }}>{formatCurrency(totalPagos)}</div>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {donutData.map((d, i) => (
              <div key={i}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                  <span style={{ fontSize:10, color:'#9CA3AF' }}>{d.name}</span>
                  <span style={{ fontSize:10, fontWeight:600, color:'#111827' }}>
                    {formatCurrency(d.value)} <span style={{ fontSize:9, color:'#9CA3AF', fontWeight:400 }}>{Math.round(d.value/totalPagos*100)}%</span>
                  </span>
                </div>
                <div style={{ height:4, background:'#F3F4F6', borderRadius:99 }}>
                  <div style={{ height:4, width:`${Math.round(d.value/totalPagos*100)}%`, background:d.color, borderRadius:99 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Tabla detalle */}
        <div style={{ ...card, flex:1, minWidth:0 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 110px 90px 70px', ...hdrStyle }}>
            <span>Concepto</span><span>Vencimiento</span><span>Tipo</span><span style={{ textAlign:'right' }}>Importe</span>
          </div>
          {pagos.map((p, i) => (
            <div key={i} className="dash-pago-row" style={{ ...rowBase, gridTemplateColumns:'1fr 110px 90px 70px', borderBottom: i < pagos.length-1 ? '0.5px solid #F9FAFB' : 'none' }}>
              <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                <span style={{ fontSize:11, fontWeight:500, color:'#111827' }}>{p.concepto}</span>
                <span style={{ fontSize:10, color:'#9CA3AF' }}>· {p.detalle}</span>
              </div>
              <div className="dash-pago-hide" style={{ fontSize:10, color:'#9CA3AF' }}>
                {p.vencimiento} · <span style={{ color: p.urgente ? '#DC2626' : p.dias <= 30 ? '#D97706' : '#9CA3AF', fontWeight:500 }}>{p.dias}d</span>
              </div>
              <div className="dash-pago-hide"><TipoBadge tipo={p.tipo} /></div>
              <div style={{ textAlign:'right', fontSize:12, fontWeight:600, color: p.tipo==='Fiscal' ? '#D97706' : '#111827' }}>{formatCurrency(p.importe)}</div>
            </div>
          ))}
          <div style={{ height:'0.5px', background:'#EAECF0', margin:'10px 0' }} />
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontSize:11, color:'#9CA3AF' }}>Total pagos pendientes</span>
            <span style={{ fontSize:14, fontWeight:600, color:'#111827' }}>{formatCurrency(totalPagos)}</span>
          </div>
        </div>
      </div>

    </Layout>
  )
}
