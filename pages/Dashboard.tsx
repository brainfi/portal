import Layout from '@/components/Layout'
import { mockPrevisiones } from '@/lib/mockData'
import { formatCurrency, formatDate } from '@/lib/formatters'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell, LineChart, Line, Legend
} from 'recharts'

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
  { concepto:'IVA Q2 · Mod. 303', detalle:'AEAT · Autoliquidación', vencimiento:'20 jul', dias:68, tipo:'Fiscal', importe:3900, urgente:true },
  { concepto:'IRPF · Mod. 111', detalle:'AEAT · Retenciones', vencimiento:'20 jul', dias:68, tipo:'Fiscal', importe:4200, urgente:true },
  { concepto:'Nóminas · Mayo', detalle:'8 empleados · SS incluida', vencimiento:'30 abr', dias:21, tipo:'Gasto fijo', importe:18400, urgente:false },
  { concepto:'Alquiler oficina', detalle:'Contrato anual', vencimiento:'1 may', dias:22, tipo:'Gasto fijo', importe:2100, urgente:false },
  { concepto:'Adobe Creative Cloud', detalle:'5 licencias', vencimiento:'5 may', dias:26, tipo:'Suscripción', importe:290, urgente:false },
  { concepto:'HubSpot CRM', detalle:'Plan Pro', vencimiento:'10 may', dias:31, tipo:'Suscripción', importe:450, urgente:false },
]

const cobros = [
  { label:'30 días', sublabel:'Riesgo bajo', importe:2500, total:12680, pct:19.7, color:'#93C5FD', iconColor:'#6B7280', iconBg:'transparent', iconBorder:'#D1D5DB' },
  { label:'60 días', sublabel:'Riesgo medio', importe:5300, total:12680, pct:41.8, color:'#3B82F6', iconColor:'#D97706', iconBg:'#FFFBEB', iconBorder:'#FDE68A' },
  { label:'+60 días', sublabel:'Riesgo alto', importe:4880, total:12680, pct:38.5, color:'#1d4ed8', iconColor:'#DC2626', iconBg:'#FEF2F2', iconBorder:'#FECACA', danger:true },
]

function CashflowTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'#1F2937', borderRadius:10, padding:'10px 14px', fontSize:11, boxShadow:'0 4px 16px rgba(0,0,0,0.2)', fontFamily:'Plus Jakarta Sans, sans-serif' }}>
      <div style={{ fontWeight:600, color:'white', marginBottom:8 }}>{label} 2026</div>
      {[
        { key:'entradas', label:'Ingresos', color:'#1d6fd8' },
        { key:'gastos', label:'Gastos', color:'#0D2E6E' },
        { key:'neto', label:'Neto', color:'#00BCD4' },
      ].map(item => {
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
  const styles: Record<string, { bg: string; color: string }> = {
    'Fiscal': { bg:'#FFFBEB', color:'#92400E' },
    'Gasto fijo': { bg:'#F3F4F6', color:'#6B7280' },
    'Suscripción': { bg:'#EFF6FF', color:'#1d4ed8' },
  }
  const s = styles[tipo] ?? styles['Gasto fijo']
  return <span style={{ fontSize:9, padding:'2px 8px', borderRadius:99, whiteSpace:'nowrap', fontWeight:500, background:s.bg, color:s.color }}>{tipo}</span>
}

function CardTitle({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <div style={{ fontSize:13, fontWeight:600, color:'#111827', marginBottom:14, display:'flex', alignItems:'center', gap:6 }}>
      <i className={`ti ${icon}`} aria-hidden="true" style={{ fontSize:15, color:'#1d6fd8' }} />
      {children}
    </div>
  )
}

const card: React.CSSProperties = { background:'#fff', border:'0.5px solid #EAECF0', borderRadius:14, padding:'16px 18px' }
const hdrCell: React.CSSProperties = { fontSize:10, color:'#9CA3AF', fontWeight:500 }
const row: React.CSSProperties = { display:'grid', alignItems:'center', padding:'9px 0', borderBottom:'0.5px solid #F9FAFB' }

export default function Dashboard() {
  return (
    <Layout title="Dashboard">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');
        .brainfi-portal * { font-family: 'Plus Jakarta Sans', sans-serif !important; }
        @media (max-width: 768px) {
          .kpi-grid { grid-template-columns: 1fr !important; }
          .cf-grid { grid-template-columns: 1fr !important; }
          .pago-row { grid-template-columns: 1fr 80px !important; }
          .pago-row .pago-hide { display: none !important; }
        }
      `}</style>

      {/* HERO */}
      <div style={{ background:'#0D2E6E', borderRadius:16, padding:'22px 24px', position:'relative', overflow:'hidden', flexShrink:0 }}>
        <div style={{ position:'absolute', right:-30, top:-30, width:180, height:180, borderRadius:'50%', border:'1px solid rgba(255,255,255,0.07)' }} />
        <div style={{ position:'absolute', right:50, top:40, width:100, height:100, borderRadius:'50%', border:'1px solid rgba(255,255,255,0.04)' }} />
        <div style={{ fontSize:11, color:'rgba(255,255,255,0.45)', marginBottom:8 }}>Tu dinero real hoy</div>
        <div style={{ display:'flex', alignItems:'baseline', gap:12, marginBottom:6 }}>
          <span style={{ fontSize:36, fontWeight:600, color:'#fff', letterSpacing:'-0.03em' }}>5.620 €</span>
          <span style={{ fontSize:12, fontWeight:500, color:'#4ade80', background:'rgba(74,222,128,0.12)', padding:'3px 10px', borderRadius:99 }}>↑ 12,4%</span>
        </div>
        <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)' }}>Tras pagar todo lo comprometido · Abril 2026</div>
      </div>

      {/* CASHFLOW */}
      <div style={card}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
          <CardTitle icon="ti-arrows-exchange">Cash Flow</CardTitle>
          <div style={{ display:'flex', gap:6 }}>
            <span style={{ fontSize:10, fontWeight:500, padding:'3px 10px', borderRadius:99, background:'#EFF6FF', color:'#1d4ed8', border:'0.5px solid #BFDBFE' }}>Mensual</span>
            <span style={{ fontSize:10, padding:'3px 10px', borderRadius:99, color:'#9CA3AF', border:'0.5px solid #EAECF0' }}>Diario</span>
          </div>
        </div>
        <div className="cf-grid" style={{ display:'grid', gridTemplateColumns:'1fr 180px', gap:16, alignItems:'center' }}>
          <ResponsiveContainer width="100%" height={130}>
            <BarChart data={cashflowData} barGap={2} margin={{ top:4, right:4, left:0, bottom:0 }}>
              <CartesianGrid strokeDasharray="0" stroke="#F3F4F6" vertical={false} />
              <XAxis dataKey="mes" tick={{ fontSize:8, fill:'#9CA3AF', fontFamily:'Plus Jakarta Sans' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:8, fill:'#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={v => `€${v/1000}k`} width={32} />
              <Tooltip content={<CashflowTooltip />} cursor={{ fill:'rgba(0,0,0,0.02)' }} />
              <Bar dataKey="entradas" radius={[3,3,0,0]} maxBarSize={16}>
                {cashflowData.map((_, i) => <Cell key={i} fill={i===3 ? '#1d6fd8' : '#93C5FD'} />)}
              </Bar>
              <Bar dataKey="gastos" radius={[3,3,0,0]} maxBarSize={10}>
                {cashflowData.map((_, i) => <Cell key={i} fill={i===3 ? '#0D2E6E' : '#7986CB'} />)}
              </Bar>
              <Line type="monotone" dataKey="neto" stroke="#00BCD4" strokeWidth={1.5} dot={false} />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            <div style={{ padding:'12px 14px', background:'#EFF6FF', borderRadius:10 }}>
              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}>
                <div style={{ width:24, height:24, borderRadius:6, background:'#1d6fd8', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <i className="ti ti-arrow-down-left" aria-hidden="true" style={{ fontSize:12, color:'#fff' }} />
                </div>
                <span style={{ fontSize:10, color:'#1d4ed8', fontWeight:500 }}>Ingresos</span>
              </div>
              <div style={{ fontSize:16, fontWeight:600, color:'#1e3a8a', letterSpacing:'-0.02em' }}>94.200 €</div>
              <div style={{ fontSize:10, color:'#1d6fd8', marginTop:2 }}>↑ 45,0% vs periodo ant.</div>
            </div>
            <div style={{ padding:'12px 14px', background:'#F9FAFB', borderRadius:10 }}>
              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}>
                <div style={{ width:24, height:24, borderRadius:6, background:'#0D2E6E', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <i className="ti ti-arrow-up-right" aria-hidden="true" style={{ fontSize:12, color:'#fff' }} />
                </div>
                <span style={{ fontSize:10, color:'#6B7280', fontWeight:500 }}>Gastos</span>
              </div>
              <div style={{ fontSize:16, fontWeight:600, color:'#111827', letterSpacing:'-0.02em' }}>43.800 €</div>
              <div style={{ fontSize:10, color:'#DC2626', marginTop:2 }}>↑ 12,5% vs periodo ant.</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3 KPIs */}
      <div className="kpi-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, flexShrink:0 }}>
        <div style={card}>
          <div style={{ fontSize:11, color:'#9CA3AF', marginBottom:8, display:'flex', alignItems:'center', gap:5, fontWeight:500 }}>
            <i className="ti ti-shield" aria-hidden="true" style={{ fontSize:13, color:'#1d6fd8' }} />Resistencia
          </div>
          <div style={{ fontSize:22, fontWeight:600, color:'#111827', letterSpacing:'-0.02em', marginBottom:4 }}>
            47 días <span style={{ fontSize:12, color:'#1d6fd8', fontWeight:500 }}>↑ 16,0%</span>
          </div>
          <div style={{ fontSize:10, color:'#9CA3AF' }}>vs. 40 días periodo anterior</div>
        </div>
        <div style={card}>
          <div style={{ fontSize:11, color:'#9CA3AF', marginBottom:8, display:'flex', alignItems:'center', gap:5, fontWeight:500 }}>
            <i className="ti ti-chart-dots" aria-hidden="true" style={{ fontSize:13, color:'#1d6fd8' }} />Punto de equilibrio
          </div>
          <div style={{ fontSize:22, fontWeight:600, color:'#111827', letterSpacing:'-0.02em', marginBottom:4 }}>
            6.100 € <span style={{ fontSize:12, color:'#DC2626', fontWeight:500 }}>↓ 8,2%</span>
          </div>
          <div style={{ fontSize:10, color:'#9CA3AF' }}>vs. 4.116,50 € periodo anterior</div>
        </div>
        <div style={{ ...card, background:'#EFF6FF', borderColor:'#BFDBFE' }}>
          <div style={{ fontSize:11, color:'#1d4ed8', marginBottom:8, display:'flex', alignItems:'center', gap:5, fontWeight:500 }}>
            <i className="ti ti-receipt-tax" aria-hidden="true" style={{ fontSize:13, color:'#1d6fd8' }} />Reserva para impuestos
          </div>
          <div style={{ fontSize:22, fontWeight:600, color:'#1e3a8a', letterSpacing:'-0.02em', marginBottom:4 }}>
            2.720 € <span style={{ fontSize:12, color:'#1d6fd8', fontWeight:500 }}>↑ 35,2%</span>
          </div>
          <div style={{ fontSize:10, color:'#1d6fd8' }}>IVA Q2 estimado: 3.900 € · 68 días</div>
        </div>
      </div>

      {/* COBROS PENDIENTES */}
      <div style={card}>
        <CardTitle icon="ti-trending-up">Cobros pendientes</CardTitle>
        <div style={{ display:'grid', gridTemplateColumns:'120px 1fr 120px 1fr', gap:0, ...hdrCell, paddingBottom:8, borderBottom:'0.5px solid #F3F4F6', marginBottom:2 }}>
          <span>Días vencidos</span><span>Importe</span><span>% s/ total</span><span></span>
        </div>
        {cobros.map((c, i) => (
          <div key={i} style={{ ...row, gridTemplateColumns:'120px 1fr 120px 1fr', borderBottom: i < cobros.length-1 ? '0.5px solid #F9FAFB' : 'none' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:20, height:20, borderRadius:'50%', border:`0.5px solid ${c.iconBorder}`, background:c.iconBg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <i className={`ti ${i===0?'ti-plus':i===1?'ti-arrow-up':'ti-alert-triangle'}`} aria-hidden="true" style={{ fontSize:10, color:c.iconColor }} />
              </div>
              <div>
                <div style={{ fontSize:11, fontWeight:500, color: c.danger ? '#DC2626' : '#111827' }}>{c.label}</div>
                <div style={{ fontSize:9, color: c.danger ? '#DC2626' : '#9CA3AF' }}>{c.sublabel}</div>
              </div>
            </div>
            <div style={{ fontSize:13, fontWeight:600, color: c.danger ? '#DC2626' : '#111827' }}>{formatCurrency(c.importe)}</div>
            <div style={{ fontSize:11, fontWeight:500, color: c.danger ? '#DC2626' : '#111827' }}>{c.pct}%</div>
            <div style={{ height:6, background:'#F3F4F6', borderRadius:99, overflow:'hidden' }}>
              <div style={{ height:6, width:`${c.pct}%`, background:c.color, borderRadius:99 }} />
            </div>
          </div>
        ))}
      </div>

      {/* PAGOS PENDIENTES */}
      <div style={card}>
        <CardTitle icon="ti-trending-down">Pagos pendientes</CardTitle>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 130px 100px 80px', ...hdrCell, paddingBottom:8, borderBottom:'0.5px solid #F3F4F6', marginBottom:2 }}>
          <span>Concepto</span><span>Vencimiento</span><span>Tipo</span><span style={{ textAlign:'right' }}>Importe</span>
        </div>
        {pagos.map((p, i) => (
          <div key={i} className="pago-row" style={{ ...row, gridTemplateColumns:'1fr 130px 100px 80px', borderBottom: i < pagos.length-1 ? '0.5px solid #F9FAFB' : 'none' }}>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <span style={{ fontSize:11, fontWeight:500, color:'#111827' }}>{p.concepto}</span>
              <span style={{ fontSize:10, color:'#9CA3AF' }}>· {p.detalle}</span>
            </div>
            <div className="pago-hide" style={{ fontSize:10, color:'#9CA3AF' }}>
              {p.vencimiento} · <span style={{ color: p.urgente ? '#DC2626' : p.dias <= 30 ? '#D97706' : '#9CA3AF', fontWeight:500 }}>{p.dias}d</span>
            </div>
            <div className="pago-hide"><TipoBadge tipo={p.tipo} /></div>
            <div style={{ textAlign:'right', fontSize:12, fontWeight:600, color: p.tipo==='Fiscal' ? '#D97706' : '#111827' }}>{formatCurrency(p.importe)}</div>
          </div>
        ))}
        <div style={{ height:'0.5px', background:'#EAECF0', margin:'10px 0' }} />
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontSize:11, color:'#9CA3AF' }}>Total pagos pendientes</span>
          <span style={{ fontSize:15, fontWeight:600, color:'#111827' }}>{formatCurrency(pagos.reduce((a,p) => a+p.importe, 0))}</span>
        </div>
      </div>

    </Layout>
  )
}
