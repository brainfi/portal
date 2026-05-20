import Layout from '@/components/Layout'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const cashflowData = [
  { mes:'Dic', ingresos:115, gastos:72 },
  { mes:'Ene', ingresos:110, gastos:78 },
  { mes:'Feb', ingresos:125, gastos:80 },
  { mes:'Mar', ingresos:158, gastos:85 },
  { mes:'Abr', ingresos:140, gastos:75 },
  { mes:'May', ingresos:68,  gastos:35 },
]



const kpis = [
  { lbl:'Dinero real hoy', val:'5.620 €', delta:'↗ 12,4%', up:true, sub:'vs mes anterior', iconBg:'#EEF1FD', iconColor:'#3B5BDB', icon:'ti-coin' },
  { lbl:'Resistencia sin vender', val:'47 días', delta:'↘ 1,05%', up:false, sub:'vs mes anterior', iconBg:'#FEF0F0', iconColor:'#EF233C', icon:'ti-shield' },
  { lbl:'Reserva para impuestos', val:'2.720 €', delta:'↗ 35,2%', up:true, sub:'IVA Q2 · 68 días', iconBg:'#FFF8E6', iconColor:'#F4A100', icon:'ti-receipt-tax' },
  { lbl:'Deuda', val:'60.500 €', delta:'↗ 3,8%', up:false, sub:'vs mes anterior', iconBg:'#F0F9F4', iconColor:'#2DC653', icon:'ti-building-bank' },
]

const txns = [
  { name:'Gasto en suministros', sub:'Suministros · 20 may 2026', amount:'-144,46 €', positive:false },
  { name:'Consultoría — Acme Foundry', sub:'Consultoría · 19 may 2026', amount:'+4.657,19 €', positive:true },
  { name:'Gasto de viaje', sub:'Viajes · 19 may 2026', amount:'-520,62 €', positive:false },
  { name:'Gasto en software', sub:'Software · 18 may 2026', amount:'-287,25 €', positive:false },
  { name:'Licencias — Acme Foundry', sub:'Licencias · 16 may 2026', amount:'+4.158,81 €', positive:true },
  { name:'Ventas — Northwind Studios', sub:'Ventas · 16 may 2026', amount:'+4.779,39 €', positive:true },
]

const card: React.CSSProperties = { background:'#fff', borderRadius:16, border:'1px solid #E8E8EC' }

function CfTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'#fff', border:'1px solid #E8E8EC', borderRadius:10, padding:'10px 14px', fontSize:12 }}>
      <div style={{ fontWeight:600, color:'#1a1a1a', marginBottom:8 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
          <div style={{ width:7, height:7, borderRadius:2, background:p.stroke }} />
          <span style={{ color:'#666' }}>{p.dataKey === 'ingresos' ? 'Ingresos' : 'Gastos'}: €{p.value}k</span>
        </div>
      ))}
    </div>
  )
}

export default function Dashboard() {
  // Tabler icons loaded via index.html or index.css — verified below
  return (
    <Layout title="Resumen">
      <style>{`
        @media (max-width: 1024px) { .row2 { grid-template-columns: 1fr !important; } }
        @media (max-width: 768px)  { .kpi-grid { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 480px)  { .kpi-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      {/* KPIs */}
      <div className="kpi-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
        {kpis.map((k, i) => (
          <div key={i} style={{ ...card, padding:'20px 22px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
              <div style={{ fontSize:9, fontWeight:600, color:'#999', textTransform:'uppercase', letterSpacing:'0.12em' }}>{k.lbl}</div>
              <div style={{ width:32, height:32, borderRadius:8, background:k.iconBg, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <i className={`ti ${k.icon}`} aria-hidden="true" style={{ fontSize:16, color:k.iconColor }} />
              </div>
            </div>
            <div style={{ fontFamily:'Inter, sans-serif', fontSize:30, fontWeight:400, color:'#1a1a1a', marginBottom:10, letterSpacing:'-0.01em' }}>{k.val}</div>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <span style={{ fontSize:11, fontWeight:600, color: k.up ? '#1a7a3a' : '#b01a2b', background: k.up ? '#d4f5df' : '#fdd', padding:'2px 7px', borderRadius:99 }}>{k.delta}</span>
              <span style={{ fontSize:11, color:'#aaa' }}>{k.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Cashflow + Donut */}
      <div className="row2" style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:14 }}>
        <div style={{ ...card, padding:'24px' }}>
          <div style={{ fontSize:9, fontWeight:600, color:'#999', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:12 }}>Cash Flow</div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={cashflowData} margin={{ top:4, right:4, left:0, bottom:0 }}>
              <defs>
                <linearGradient id="gNeto" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#BAE6FD" stopOpacity={0.6}/>
                  <stop offset="100%" stopColor="#BAE6FD" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F2" vertical={false}/>
              <XAxis dataKey="mes" tick={{ fontSize:11, fill:'#aaa' }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize:11, fill:'#aaa' }} axisLine={false} tickLine={false} tickFormatter={v => `€${v}k`} width={40}/>
              <Tooltip content={<CfTooltip />} cursor={{ stroke:'#BAE6FD', strokeWidth:1, strokeDasharray:'3 3' }}/>
              <Area type="monotone" dataKey="ingresos" stroke="#7DD3FC" strokeWidth={2} fill="url(#gNeto)" dot={false} activeDot={{ r:5, fill:'#0EA5E9', stroke:'#fff', strokeWidth:2 }}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={{ ...card, padding:'24px', display:'flex', flexDirection:'column' }}>
          <div style={{ fontSize:9, fontWeight:600, color:'#999', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:6 }}>Salud financiera</div>

          {/* Gauge barras verticales */}
          <div style={{ margin:'8px 0 20px' }}>
            <div style={{ marginBottom:16 }}>
              <span style={{ fontSize:30, fontWeight:400, color:'#1a1a1a', letterSpacing:'-0.02em', lineHeight:1, fontFamily:'Inter, sans-serif' }}>68%</span>
            </div>
            <div style={{ display:'flex', alignItems:'flex-end', gap:3, height:40 }}>
              {Array.from({ length: 28 }).map((_, i) => {
                const filled = i < 19
                return (
                  <div key={i} style={{
                    flex: 1, height: 40, borderRadius: 3,
                    background: filled ? '#60A5FA' : '#EEF1FD',
                  }} />
                )
              })}
            </div>
          </div>
          <div style={{ height:'0.5px', background:'#E8E8EC', margin:'18px 0' }} />
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {[
              { label:'Liquidez', pct:82, color:'#3B5BDB', bars:28 },
              { label:'Cobros', pct:61, color:'#7B93FF', bars:28 },
              { label:'Deuda', pct:58, color:'#EF4444', bars:28 },
            ].map(m => {
              const filled = Math.round(m.pct / 100 * m.bars)
              return (
                <div key={m.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <div style={{ width:7, height:7, borderRadius:'50%', background:m.color }} />
                    <span style={{ fontSize:11, color:'#888' }}>{m.label}</span>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{ display:'flex', gap:2 }}>
                      {Array.from({ length: m.bars }).map((_, i) => (
                        <div key={i} style={{ width:4, height:14, borderRadius:2, background: i < filled ? m.color : '#EEF1FD' }} />
                      ))}
                    </div>
                    <span style={{ fontSize:11, fontWeight:400, color:'#1a1a1a', minWidth:28 }}>{m.pct}%</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Transacciones + Paneles */}
      <div className="row2" style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:14 }}>

        {/* Transacciones */}
        <div style={{ ...card, padding:'22px 24px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
            <div>
              <div style={{ fontSize:9, fontWeight:600, color:'#999', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:6 }}>Próximos pagos</div>
            </div>
            <span style={{ fontSize:12, color:'#3B5BDB', fontWeight:500, cursor:'pointer' }}>Ver todas →</span>
          </div>
          {txns.map((t, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:14, padding:'13px 0', borderBottom: i < txns.length-1 ? '1px solid #F4F5F7' : 'none' }}>
              <div style={{ width:36, height:36, borderRadius:10, background: t.positive ? '#EEF1FD' : '#FFF3E0', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <i className={`ti ${t.positive ? 'ti-arrow-up-right' : 'ti-arrow-down-right'}`} aria-hidden="true" style={{ fontSize:16, color: t.positive ? '#3B5BDB' : '#F4A100' }} />
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:500, color:'#1a1a1a', marginBottom:2 }}>{t.name}</div>
                <div style={{ fontSize:11, color:'#aaa' }}>{t.sub}</div>
              </div>
              <div style={{ fontSize:14, fontWeight:500, color: t.positive ? '#3B5BDB' : '#1a1a1a' }}>{t.amount}</div>
            </div>
          ))}
        </div>

        {/* Paneles derecha */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {/* Outstanding */}
          <div style={{ ...card, padding:'22px 24px' }}>
            <div style={{ fontSize:9, fontWeight:600, color:'#999', textTransform:'uppercase', letterSpacing:'0.12em', display:'flex', alignItems:'center', gap:6, marginBottom:10 }}>
              <i className="ti ti-file-invoice" aria-hidden="true" style={{ fontSize:13 }} />Pendiente de cobro
            </div>
            <div style={{ fontFamily:'Inter, sans-serif', fontSize:36, fontWeight:400, color:'#1a1a1a', margin:'6px 0', letterSpacing:'-0.02em' }}>61.381 €</div>
            <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:16 }}>
              <span style={{ fontSize:11, fontWeight:600, color:'#b01a2b', background:'#fdd', padding:'2px 7px', borderRadius:99 }}>↘ 5,3%</span>
              <span style={{ fontSize:11, color:'#aaa' }}>vs mes anterior</span>
            </div>
            <button style={{ width:'100%', padding:11, border:'1px solid #E8E8EC', borderRadius:10, background:'#fff', fontSize:13, color:'#1a1a1a', fontWeight:500, cursor:'pointer', fontFamily:'Inter,sans-serif' }}>
              Revisar facturas
            </button>
          </div>

          {/* AI CFO */}
          <div style={{ background:'#EEF1FD', borderRadius:16, border:'1px solid #D6DCFA', padding:'22px 24px' }}>
            <div style={{ fontSize:9, fontWeight:600, color:'#3B5BDB', textTransform:'uppercase', letterSpacing:'0.12em', display:'flex', alignItems:'center', gap:5, marginBottom:12 }}>
              <i className="ti ti-sparkles" aria-hidden="true" style={{ fontSize:13 }} />IA · brainfi
            </div>
            <div style={{ fontFamily:'Inter, sans-serif', fontSize:20, fontWeight:400, color:'#1a1a1a', marginBottom:8 }}>Pregunta a tu CFO IA</div>
            <div style={{ fontSize:13, color:'#555', lineHeight:1.6, marginBottom:18 }}>
              Obtén un análisis instantáneo de tus números — qué funciona, qué no, y qué hacer a continuación.
            </div>
            <button style={{ width:'100%', padding:12, border:'none', borderRadius:10, background:'#4361EE', color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'Inter,sans-serif' }}>
              Generar insight
            </button>
          </div>
        </div>
      </div>

    </Layout>
  )
}
