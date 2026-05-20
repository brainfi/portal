import Layout from '@/components/Layout'
import { formatCurrency } from '@/lib/formatters'
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import { PieChart, Pie, Cell as PieCell } from 'recharts'

// ── Data ──────────────────────────────────────────────────────────────
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
  { label:'30 días', sublabel:'Riesgo bajo', importe:2500, pct:19.7, barColor:'rgba(74,222,128,0.4)', danger:false },
  { label:'60 días', sublabel:'Riesgo medio', importe:5300, pct:41.8, barColor:'rgba(74,222,128,0.7)', danger:false },
  { label:'+60 días', sublabel:'Riesgo alto', importe:4880, pct:38.5, barColor:'#FF6B6B', danger:true },
]

const clientes = [
  { initials:'MC', nombre:'Mercadona', sub:'91 días vencida', importe:2800, pct:'22,1%', color:'#FF6B6B', bg:'rgba(255,107,107,0.12)' },
  { initials:'LF', nombre:'Lantero Foods', sub:'Vence en 16 días', importe:5300, pct:'41,8%', color:'#FBBF24', bg:'rgba(251,191,36,0.1)' },
  { initials:'CE', nombre:'Carrefour España', sub:'Vence en 8 días', importe:1800, pct:'14,2%', color:'#6C8BFF', bg:'rgba(108,139,255,0.12)' },
]

const donutData = [
  { name:'Fiscal', value:8100, color:'rgba(251,191,36,0.5)' },
  { name:'Gasto fijo', value:20500, color:'rgba(108,139,255,0.6)' },
  { name:'Suscripción', value:740, color:'rgba(0,212,232,0.5)' },
]

const totalPagos = pagos.reduce((a, p) => a + p.importe, 0)
const totalCobros = cobros.reduce((a, c) => a + c.importe, 0)
const LEFT_W = 'calc(25% - 7.5px)'

// ── Styles ─────────────────────────────────────────────────────────────
const card: React.CSSProperties = { background:'#161D38', border:'1px solid rgba(100,140,255,0.15)', borderRadius:14, padding:'16px 18px' }
const cardCyan: React.CSSProperties = { background:'linear-gradient(135deg,#0E1B2E,#0E2030)', border:'1px solid rgba(0,212,232,0.2)', borderRadius:14, padding:'16px 18px' }
const hdrStyle: React.CSSProperties = { fontSize:10, color:'rgba(255,255,255,0.25)', fontWeight:500, paddingBottom:8, borderBottom:'1px solid rgba(255,255,255,0.07)', marginBottom:2 }
const rowBase: React.CSSProperties = { display:'grid', alignItems:'center', padding:'9px 0', borderBottom:'1px solid rgba(255,255,255,0.04)' }

function dot(color: string) {
  return <span style={{ width:6, height:6, borderRadius:'50%', background:color, display:'inline-block', flexShrink:0 }} />
}

function TipoBadge({ tipo }: { tipo: string }) {
  const s: Record<string, { bg: string; color: string }> = {
    'Fiscal': { bg:'rgba(251,191,36,0.12)', color:'#FBBF24' },
    'Gasto fijo': { bg:'rgba(255,255,255,0.07)', color:'rgba(255,255,255,0.45)' },
    'Suscripción': { bg:'rgba(108,139,255,0.12)', color:'#6C8BFF' },
  }
  const st = s[tipo] ?? s['Gasto fijo']
  return <span style={{ fontSize:9, padding:'2px 7px', borderRadius:99, fontWeight:500, background:st.bg, color:st.color, whiteSpace:'nowrap' }}>{tipo}</span>
}

function CashflowTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'#1A2240', border:'1px solid rgba(100,140,255,0.2)', borderRadius:10, padding:'10px 14px', fontSize:11 }}>
      <div style={{ fontWeight:500, color:'#fff', marginBottom:8 }}>{label} 2026</div>
      {[{ key:'entradas', label:'Ingresos', color:'#4ADE80' }, { key:'gastos', label:'Gastos', color:'rgba(255,255,255,0.3)' }, { key:'neto', label:'Neto', color:'#00D4E8' }].map(item => {
        const p = payload.find((x: any) => x.dataKey === item.key)
        if (!p) return null
        return (
          <div key={item.key} style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
            <div style={{ width:7, height:7, borderRadius:2, background:item.color }} />
            <span style={{ color:'rgba(255,255,255,0.6)' }}>{item.label}: {formatCurrency(p.value)}</span>
          </div>
        )
      })}
    </div>
  )
}

// ── Component ──────────────────────────────────────────────────────────
export default function Dashboard() {
  return (
    <Layout title="Dashboard">
      <style>{`
        @media (max-width: 768px) {
          .dash-hero { grid-template-columns: 1fr 1fr !important; }
          .dash-cf { flex-direction: column !important; }
          .dash-cf-left { width: 100% !important; flex-direction: column !important; }
          .dash-cf-left > div { flex: none !important; }
          .dash-table-hide { display: none !important; }
          .dash-pago-hide { display: none !important; }
        }
        @media (max-width: 480px) {
          .dash-hero { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ── HERO 4 cols ── */}
      <div className="dash-hero" style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:10, flexShrink:0 }}>
        <div style={cardCyan}>
          <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', marginBottom:5, display:'flex', alignItems:'center', gap:5 }}>
            {dot('#00D4E8')} Tu dinero real hoy
          </div>
          <div style={{ fontSize:26, fontWeight:500, color:'#fff', letterSpacing:'-0.03em', marginBottom:6 }}>5.620 €</div>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
            <span style={{ fontSize:10, color:'#4ADE80', background:'rgba(74,222,128,0.1)', padding:'1px 7px', borderRadius:99 }}>↑ 12,4%</span>
            <span style={{ fontSize:10, color:'rgba(255,255,255,0.25)' }}>vs mes anterior</span>
          </div>
          <div style={{ fontSize:10, color:'rgba(255,255,255,0.2)' }}>Tras compromisos · Abril 2026</div>
        </div>
        {[
          { dot:'#6C8BFF', label:'Resistencia', val:'47 días', delta:'↑ 16,0%', up:true, sub:'vs. 40 días periodo anterior' },
          { dot:'#6C8BFF', label:'Punto de equilibrio', val:'6.100 €', delta:'↓ 8,2%', up:false, sub:'vs. 4.116,50 € periodo anterior' },
          { dot:'#FBBF24', label:'Reserva impuestos', val:'2.720 €', delta:'↑ 35,2%', up:true, sub:'IVA Q2 est: 3.900 € · 68 días' },
        ].map((k, i) => (
          <div key={i} style={card}>
            <div style={{ fontSize:10, color:'rgba(255,255,255,0.25)', marginBottom:5, display:'flex', alignItems:'center', gap:5 }}>
              {dot(k.dot)} {k.label}
            </div>
            <div style={{ fontSize:20, fontWeight:500, color:'#fff', letterSpacing:'-0.02em', marginBottom:5 }}>{k.val}</div>
            <span style={{ fontSize:10, fontWeight:500, color: k.up ? '#4ADE80' : '#FF6B6B', background: k.up ? 'rgba(74,222,128,0.1)' : 'rgba(255,107,107,0.1)', padding:'1px 7px', borderRadius:99 }}>{k.delta}</span>
            <div style={{ fontSize:10, color:'rgba(255,255,255,0.2)', marginTop:5 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* ── CASHFLOW ── */}
      <div className="dash-cf" style={{ display:'flex', gap:10, alignItems:'stretch' }}>
        <div className="dash-cf-left" style={{ width:LEFT_W, flexShrink:0, display:'flex', flexDirection:'column', gap:10, alignSelf:'stretch' }}>
          {[
            { dot:'#4ADE80', label:'Ingresos', val:'94.200 €', delta:'↑ 45,0% vs ant.', up:true, bg:'rgba(74,222,128,0.06)', border:'rgba(74,222,128,0.12)' },
            { dot:'rgba(255,255,255,0.2)', label:'Gastos', val:'43.800 €', delta:'↑ 12,5% vs ant.', up:false, bg:'rgba(255,255,255,0.03)', border:'rgba(255,255,255,0.07)' },
          ].map((s, i) => (
            <div key={i} style={{ flex:1, padding:'12px 14px', background:s.bg, border:`1px solid ${s.border}`, borderRadius:10, display:'flex', flexDirection:'column', justifyContent:'center' }}>
              <div style={{ fontSize:9, color:'rgba(255,255,255,0.3)', marginBottom:6, display:'flex', alignItems:'center', gap:5 }}>{dot(s.dot)}{s.label}</div>
              <div style={{ fontSize:16, fontWeight:500, color:'#fff' }}>{s.val}</div>
              <div style={{ fontSize:10, color: s.up ? '#4ADE80' : '#FF6B6B', marginTop:3 }}>{s.delta}</div>
            </div>
          ))}
        </div>
        <div style={{ ...card, flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
            <span style={{ fontSize:13, fontWeight:500, color:'#fff', display:'flex', alignItems:'center', gap:6 }}>
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="#00D4E8" strokeWidth="1.5"><path d="M2 8h3l2-5 3 10 2-5h2"/></svg>
              Cash Flow
            </span>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:10, color:'rgba(255,255,255,0.3)' }}>{dot('#4ADE80')} Ingresos</div>
              <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:10, color:'rgba(255,255,255,0.3)' }}>{dot('rgba(255,255,255,0.2)')} Gastos</div>
              <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:10, color:'rgba(255,255,255,0.3)' }}>
                <div style={{ width:14, height:1.5, background:'#00D4E8', borderRadius:99 }} /> Neto
              </div>
              <div style={{ display:'flex', gap:5 }}>
                <span style={{ fontSize:10, padding:'3px 10px', borderRadius:99, background:'rgba(108,139,255,0.15)', color:'#6C8BFF', border:'1px solid rgba(108,139,255,0.2)' }}>Mensual</span>
                <span style={{ fontSize:10, padding:'3px 10px', borderRadius:99, color:'rgba(255,255,255,0.25)', border:'1px solid rgba(255,255,255,0.07)' }}>Diario</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={150}>
            <ComposedChart data={cashflowData} barGap={2} margin={{ top:4, right:4, left:0, bottom:0 }}>
              <CartesianGrid strokeDasharray="0" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="mes" tick={{ fontSize:8, fill:'rgba(255,255,255,0.2)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:8, fill:'rgba(255,255,255,0.2)' }} axisLine={false} tickLine={false} tickFormatter={v => `€${v/1000}k`} width={36} />
              <Tooltip content={<CashflowTooltip />} cursor={{ fill:'rgba(255,255,255,0.02)' }} />
              <Bar dataKey="entradas" radius={[3,3,0,0]} maxBarSize={20}>
                {cashflowData.map((_,i) => <Cell key={i} fill={i===3 ? '#4ADE80' : 'rgba(74,222,128,0.45)'} />)}
              </Bar>
              <Bar dataKey="gastos" radius={[3,3,0,0]} maxBarSize={10}>
                {cashflowData.map((_,i) => <Cell key={i} fill={i===3 ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)'} />)}
              </Bar>
              <Line type="monotone" dataKey="neto" stroke="#00D4E8" strokeWidth={1.5} dot={false} strokeDasharray="5 3" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── COBROS ── */}
      <div style={{ ...card, display:'flex', gap:20, alignItems:'start' }}>
        <div style={{ width:LEFT_W, flexShrink:0 }}>
          <div style={{ fontSize:13, fontWeight:500, color:'#fff', marginBottom:5, display:'flex', alignItems:'center', gap:6 }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#00D4E8" strokeWidth="1.5"><polyline points="2,12 6,7 9,9 13,4"/></svg>
            Cobros pendientes
          </div>
          <div style={{ fontSize:22, fontWeight:500, color:'#fff', letterSpacing:'-0.02em', marginBottom:14 }}>{formatCurrency(totalCobros)}</div>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {cobros.map((c, i) => (
              <div key={i}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                  <span style={{ fontSize:10, color: c.danger ? '#FF6B6B' : 'rgba(255,255,255,0.3)' }}>{c.label} · {c.sublabel}</span>
                  <span style={{ fontSize:10, fontWeight:500, color: c.danger ? '#FF6B6B' : '#fff' }}>{formatCurrency(c.importe)}</span>
                </div>
                <div style={{ height:3, background:'rgba(255,255,255,0.06)', borderRadius:99 }}>
                  <div style={{ height:3, width:`${c.pct}%`, background:c.barColor, borderRadius:99 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="dash-table-hide" style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 130px 70px 70px', ...hdrStyle }}>
            <span>Cliente</span><span>Vencimiento</span><span>%</span><span style={{ textAlign:'right' }}>Importe</span>
          </div>
          {clientes.map((c, i) => (
            <div key={i} style={{ ...rowBase, gridTemplateColumns:'1fr 130px 70px 70px', borderBottom: i < clientes.length-1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ width:24, height:24, borderRadius:'50%', background:c.bg, color:c.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:600, flexShrink:0 }}>{c.initials}</div>
                <span style={{ fontSize:11, fontWeight:500, color:'#E8EAF6' }}>{c.nombre}</span>
              </div>
              <div style={{ fontSize:10, color:c.color, fontWeight:500 }}>{c.sub}</div>
              <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)' }}>{c.pct}</div>
              <div style={{ textAlign:'right', fontSize:12, fontWeight:600, color:c.color }}>{formatCurrency(c.importe)}</div>
            </div>
          ))}
          <div style={{ height:'1px', background:'rgba(255,255,255,0.07)', margin:'10px 0' }} />
          <div style={{ display:'flex', justifyContent:'space-between' }}>
            <span style={{ fontSize:11, color:'rgba(255,255,255,0.25)' }}>Total cobros pendientes</span>
            <span style={{ fontSize:13, fontWeight:600, color:'#fff' }}>{formatCurrency(totalCobros)}</span>
          </div>
        </div>
      </div>

      {/* ── PAGOS ── */}
      <div style={{ ...card, display:'flex', gap:20, alignItems:'start' }}>
        <div style={{ width:LEFT_W, flexShrink:0 }}>
          <div style={{ fontSize:13, fontWeight:500, color:'#fff', marginBottom:5, display:'flex', alignItems:'center', gap:6 }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#00D4E8" strokeWidth="1.5"><polyline points="2,4 6,9 9,7 13,12"/></svg>
            Pagos pendientes
          </div>
          <div style={{ fontSize:22, fontWeight:500, color:'#fff', letterSpacing:'-0.02em', marginBottom:14 }}>{formatCurrency(totalPagos)}</div>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {donutData.map((d, i) => (
              <div key={i}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                  <span style={{ fontSize:10, color:'rgba(255,255,255,0.3)' }}>{d.name}</span>
                  <span style={{ fontSize:10, fontWeight:500, color:'#fff' }}>
                    {formatCurrency(d.value)} <span style={{ fontSize:9, color:'rgba(255,255,255,0.25)', fontWeight:400 }}>{Math.round(d.value/totalPagos*100)}%</span>
                  </span>
                </div>
                <div style={{ height:3, background:'rgba(255,255,255,0.06)', borderRadius:99 }}>
                  <div style={{ height:3, width:`${Math.round(d.value/totalPagos*100)}%`, background:d.color, borderRadius:99 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="dash-table-hide" style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 110px 90px 70px', ...hdrStyle }}>
            <span>Concepto</span><span>Vencimiento</span><span>Tipo</span><span style={{ textAlign:'right' }}>Importe</span>
          </div>
          {pagos.map((p, i) => (
            <div key={i} style={{ ...rowBase, gridTemplateColumns:'1fr 110px 90px 70px', borderBottom: i < pagos.length-1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
              <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                <span style={{ fontSize:11, fontWeight:500, color:'#E8EAF6' }}>{p.concepto}</span>
                <span style={{ fontSize:10, color:'rgba(255,255,255,0.25)' }}>· {p.detalle}</span>
              </div>
              <div className="dash-pago-hide" style={{ fontSize:10, color:'rgba(255,255,255,0.3)' }}>
                {p.vencimiento} · <span style={{ color: p.urgente ? '#FF6B6B' : p.dias <= 30 ? '#FBBF24' : 'rgba(255,255,255,0.3)', fontWeight:500 }}>{p.dias}d</span>
              </div>
              <div className="dash-pago-hide"><TipoBadge tipo={p.tipo} /></div>
              <div style={{ textAlign:'right', fontSize:12, fontWeight:600, color: p.tipo==='Fiscal' ? '#FBBF24' : '#E8EAF6' }}>{formatCurrency(p.importe)}</div>
            </div>
          ))}
          <div style={{ height:'1px', background:'rgba(255,255,255,0.07)', margin:'10px 0' }} />
          <div style={{ display:'flex', justifyContent:'space-between' }}>
            <span style={{ fontSize:11, color:'rgba(255,255,255,0.25)' }}>Total pagos pendientes</span>
            <span style={{ fontSize:13, fontWeight:600, color:'#fff' }}>{formatCurrency(totalPagos)}</span>
          </div>
        </div>
      </div>

    </Layout>
  )
}
