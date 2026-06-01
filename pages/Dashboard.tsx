import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'

// ─── Mock data (se reemplazará con Holded) ────────────────────────────────────
const cashflowData = [
  { mes:'Ene', real:72, plan:68 },
  { mes:'Feb', real:78, plan:74 },
  { mes:'Mar', real:86, plan:82 },
  { mes:'Abr', real:94, plan:87 },
  { mes:'May', real:68, plan:84, actual:true },
  { mes:'Jun', plan:88 },
  { mes:'Jul', plan:90 },
  { mes:'Ago', plan:92 },
]

const agingData = [
  { label:'Corriente', importe:15400, color:'#BAE6FD' },
  { label:'0–30d',     importe:18200, color:'#60A5FA' },
  { label:'30–60d',    importe:16800, color:'#4361EE' },
  { label:'+60d',      importe:10981, color:'#1E3A8A' },
]

const proximosPagos = [
  { concepto:'Adobe Creative Cloud', detalle:'Vence en 5 días',  importe:290,   urgencia:'alta'  },
  { concepto:'Seguridad Social',      detalle:'Vence en 10 días', importe:6200,  urgencia:'media' },
  { concepto:'HubSpot CRM · Pro',     detalle:'Vence en 10 días', importe:450,   urgencia:'media' },
  { concepto:'Nóminas · junio 2026',  detalle:'Vence en 30 días', importe:18400, urgencia:'baja'  },
]

// ─── Growth signals ───────────────────────────────────────────────────────────
const signals = [
  {
    label:    'Crecimiento de ingresos',
    sub:      'Mayo vs abril',
    valor:    '+12.3%',
    trend:    'up' as const,
    icon:     'ti-trending-up',
    desc:     'Los ingresos de mayo superan abril en 8.600 €',
  },
  {
    label:    'Margen bruto',
    sub:      'Tendencia últimos 3 meses',
    valor:    '68.2%',
    trend:    'up' as const,
    icon:     'ti-chart-bar',
    desc:     'Mejora de 1.8 puntos porcentuales desde Q1',
  },
  {
    label:    'DSO · Días de cobro',
    sub:      'Media sector: 30 días',
    valor:    '38 días',
    trend:    'down' as const,
    icon:     'ti-clock',
    desc:     '8 días por encima de la media del sector',
  },
  {
    label:    'Ratio deuda / EBITDA',
    sub:      'Apalancamiento financiero',
    valor:    '2.1x',
    trend:    'neutral' as const,
    icon:     'ti-building-bank',
    desc:     'Nivel moderado — por debajo del umbral crítico (3x)',
  },
  {
    label:    'Burn rate mensual',
    sub:      'Gastos operativos fijos',
    valor:    '26.060 €',
    trend:    'up' as const,
    icon:     'ti-flame',
    desc:     'Bajo control — cubre 47 días de runway disponible',
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n: number) {
  return new Intl.NumberFormat('es-ES', { style:'currency', currency:'EUR', maximumFractionDigits:0 }).format(n)
}

const TREND = {
  up:      { bg:'#d4f5df', color:'#1a7a3a', icon:'↗' },
  down:    { bg:'#FEF2F2', color:'#b91c1c', icon:'↘' },
  neutral: { bg:'#FFF8E6', color:'#92400E', icon:'→' },
}

function Badge({ trend, label }: { trend: 'up'|'down'|'neutral'; label: string }) {
  const t = TREND[trend]
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:3, fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:99, background:t.bg, color:t.color }}>
      {t.icon} {label}
    </span>
  )
}

function CfTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'#fff', border:'1px solid #E8E8EC', borderRadius:10, padding:'10px 14px', fontSize:12 }}>
      <div style={{ fontWeight:600, color:'#1a1a1a', marginBottom:6 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ display:'flex', alignItems:'center', gap:6, marginBottom:3 }}>
          <div style={{ width:7, height:7, borderRadius:2, background:p.stroke || p.fill }} />
          <span style={{ color:'#666' }}>{p.dataKey === 'real' ? 'Real' : 'Plan'}: {p.value}k €</span>
        </div>
      ))}
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate()
  const [cfoLoading, setCfoLoading] = useState(false)
  const [cfoInsight, setCfoInsight] = useState<string | null>(null)

  const card: React.CSSProperties = { background:'#fff', borderRadius:14, border:'1px solid #E8E8EC' }

  async function handleCFO() {
    setCfoLoading(true)
    setCfoInsight(null)
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: 'Eres el CFO IA de brainfi, una herramienta financiera para PYMEs españolas. Analiza los datos financieros proporcionados y genera un insight conciso (3-4 frases), directo y accionable. Responde siempre en español. Sin saludos ni despedidas, directo al grano.',
          messages: [{
            role: 'user',
            content: `Analiza estos datos financieros de mayo 2026 y da un insight accionable:
- Ingresos YTD: 430.000 € (plan: 395.000 €) → +8.4% vs plan ✓
- Margen bruto: 68.2% → mejora de 1.8pp vs Q1 ✓
- EBITDA YTD: 89.400 € (plan: 94.200 €) → -5.1% vs plan ✗
- Runway: 47 días sin nuevas ventas
- DSO medio: 38 días (media sector: 30 días) ✗
- Cobros pendientes: 61.381 € (31.200 € vencidos)
- Próximo pago urgente: SS mayo — 6.200 € en 10 días
- Deuda financiera total: 164.600 €
- Ratio Deuda/EBITDA: 2.1x`
          }],
        }),
      })
      const data = await res.json()
      const text = data.content?.[0]?.text || 'No se pudo generar el análisis.'
      setCfoInsight(text)
    } catch {
      setCfoInsight('Error al conectar con el CFO IA. Verifica la API key en ajustes.')
    }
    setCfoLoading(false)
  }

  return (
    <Layout title="Resumen">
      <style>{`
        @media (max-width:1024px){ .res-row2{grid-template-columns:1fr!important} }
        @media (max-width:768px) { .res-kgrid{grid-template-columns:1fr 1fr!important} }
        @media (max-width:480px) { .res-kgrid{grid-template-columns:1fr!important} }
        .res-link:hover{text-decoration:underline;cursor:pointer}
        .res-pago:hover{opacity:.85}
      `}</style>

      {/* ── BLOQUE 1: KPIs ── */}
      <div className="res-kgrid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
        {[
          { lbl:'Ingresos YTD',   val:'430.000 €', badge:'up'      as const, badgeLbl:'+8.4% vs plan',  sub:'Acumulado enero–mayo',      icon:'ti-trending-up',     iconBg:'#F0F9F4', iconColor:'#2DC653' },
          { lbl:'Margen bruto',   val:'68.2%',      badge:'up'      as const, badgeLbl:'+1.8pp vs Q1',   sub:'Ingresos menos personal',   icon:'ti-chart-bar',       iconBg:'#EEF1FD', iconColor:'#4361EE' },
          { lbl:'EBITDA YTD',     val:'89.400 €',   badge:'down'    as const, badgeLbl:'-5.1% vs plan',  sub:'Plan: 94.200 €',            icon:'ti-chart-pie',       iconBg:'#FEF2F2', iconColor:'#EF4444' },
          { lbl:'Runway',         val:'47 días',    badge:'neutral' as const, badgeLbl:'→ estable',      sub:'Sin nuevas ventas',         icon:'ti-shield',          iconBg:'#FFF8E6', iconColor:'#F4A100' },
        ].map((k, i) => (
          <div key={i} style={{ ...card, padding:'20px 22px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
              <div style={{ fontSize:9, fontWeight:600, color:'#1a1a1a', textTransform:'uppercase', letterSpacing:'0.12em' }}>{k.lbl}</div>
              <div style={{ width:32, height:32, borderRadius:8, background:k.iconBg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <i className={`ti ${k.icon}`} style={{ fontSize:16, color:k.iconColor }} aria-hidden="true" />
              </div>
            </div>
            <div style={{ fontSize:28, fontWeight:400, color:'#1a1a1a', letterSpacing:'-0.5px', margin:'10px 0 8px' }}>{k.val}</div>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <Badge trend={k.badge} label={k.badgeLbl} />
              <span style={{ fontSize:11, color:'#B0B7C3' }}>{k.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── BLOQUE 2: Growth signals + Cashflow ── */}
      <div className="res-row2" style={{ display:'grid', gridTemplateColumns:'1fr 1.4fr', gap:14 }}>

        {/* Growth signals */}
        <div style={{ ...card, padding:'22px 24px' }}>
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:9, fontWeight:600, color:'#1a1a1a', textTransform:'uppercase', letterSpacing:'0.12em' }}>Señales de crecimiento</div>
            <div style={{ fontSize:11, color:'#B0B7C3', marginTop:2 }}>Indicadores clave de salud del negocio.</div>
          </div>
          <div style={{ display:'flex', flexDirection:'column' }}>
            {signals.map((s, i) => (
              <div key={i} style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, padding:'12px 0', borderBottom:i<signals.length-1?'1px solid #F4F5F7':'none' }}>
                <div style={{ display:'flex', alignItems:'flex-start', gap:10, flex:1, minWidth:0 }}>
                  <div style={{ width:30, height:30, borderRadius:8, background:TREND[s.trend].bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>
                    <i className={`ti ${s.icon}`} style={{ fontSize:14, color:TREND[s.trend].color }} aria-hidden="true" />
                  </div>
                  <div>
                    <div style={{ fontSize:12, fontWeight:500, color:'#1a1a1a' }}>{s.label}</div>
                    <div style={{ fontSize:10, color:'#B0B7C3', marginTop:1 }}>{s.desc}</div>
                  </div>
                </div>
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <Badge trend={s.trend} label={s.valor} />
                  <div style={{ fontSize:9, color:'#B0B7C3', marginTop:3 }}>{s.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cashflow */}
        <div style={{ ...card, padding:'22px 24px', display:'flex', flexDirection:'column' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
            <div>
              <div style={{ fontSize:9, fontWeight:600, color:'#1a1a1a', textTransform:'uppercase', letterSpacing:'0.12em' }}>Evolución de ingresos · 2026</div>
              <div style={{ fontSize:11, color:'#B0B7C3', marginTop:2 }}>Real (azul sólido) vs plan (discontinuo). Mayo parcial.</div>
            </div>
            <button onClick={() => navigate('/presupuesto')}
              style={{ fontSize:11, fontWeight:500, color:'#4361EE', border:'none', background:'transparent', cursor:'pointer', fontFamily:'inherit' }}>
              Ver P&L →
            </button>
          </div>
          <div style={{ flex:1, minHeight:220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashflowData} margin={{ top:4, right:4, left:0, bottom:0 }}>
                <defs>
                  <linearGradient id="gReal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4361EE" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#4361EE" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="gPlan" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C7D2F8" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#C7D2F8" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F2" vertical={false} />
                <XAxis dataKey="mes" tick={{ fontSize:11, fill:'#B0B7C3' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:11, fill:'#B0B7C3' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}k`} width={36} />
                <Tooltip content={<CfTooltip />} cursor={{ stroke:'#C7D2F8', strokeWidth:1, strokeDasharray:'3 3' }} />
                <Area type="monotone" dataKey="plan" stroke="#C7D2F8" strokeWidth={1.5} strokeDasharray="4 3" fill="url(#gPlan)" dot={false} />
                <Area type="monotone" dataKey="real" stroke="#4361EE" strokeWidth={2.5} fill="url(#gReal)" dot={false}
                  activeDot={{ r:5, fill:'#4361EE', stroke:'#fff', strokeWidth:2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display:'flex', gap:16, paddingTop:12, borderTop:'1px solid #F4F5F7', marginTop:8 }}>
            {[
              { color:'#4361EE', dash:false, lbl:'Real' },
              { color:'#C7D2F8', dash:true,  lbl:'Plan' },
            ].map((l, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:5 }}>
                <svg width="20" height="8"><line x1="0" y1="4" x2="20" y2="4" stroke={l.color} strokeWidth="2" strokeDasharray={l.dash?'4 3':undefined}/></svg>
                <span style={{ fontSize:11, color:'#888' }}>{l.lbl}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── BLOQUE 3: Cobros + Pagos ── */}
      <div className="res-row2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>

        {/* Cobros */}
        <div style={{ ...card, padding:'22px 24px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
            <div>
              <div style={{ fontSize:9, fontWeight:600, color:'#1a1a1a', textTransform:'uppercase', letterSpacing:'0.12em' }}>Cobros · estado actual</div>
              <div style={{ fontSize:11, color:'#B0B7C3', marginTop:2 }}>Facturas emitidas pendientes de cobro.</div>
            </div>
            <button onClick={() => navigate('/cobros')}
              style={{ fontSize:11, fontWeight:500, color:'#4361EE', border:'none', background:'transparent', cursor:'pointer', fontFamily:'inherit' }}>
              Ver detalle →
            </button>
          </div>

          {/* Mini KPIs cobros */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:16 }}>
            {[
              { lbl:'Pendiente', val:'61.381 €', bg:'#EEF1FD', color:'#4361EE' },
              { lbl:'Vencido',   val:'31.200 €', bg:'#FEF2F2', color:'#EF4444' },
              { lbl:'DSO medio', val:'38 días',  bg:'#FFF8E6', color:'#F4A100' },
            ].map((m, i) => (
              <div key={i} style={{ background:m.bg, borderRadius:10, padding:'10px 12px' }}>
                <div style={{ fontSize:9, fontWeight:700, color:m.color, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:4 }}>{m.lbl}</div>
                <div style={{ fontSize:15, fontWeight:600, color:m.color }}>{m.val}</div>
              </div>
            ))}
          </div>

          {/* Aging mini */}
          <div style={{ marginBottom:8 }}>
            <div style={{ fontSize:9, fontWeight:600, color:'#B0B7C3', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:8 }}>Antigüedad del saldo</div>
            <div style={{ height:200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={agingData} margin={{ top:4, right:4, left:0, bottom:0 }} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F2" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize:10, fill:'#B0B7C3' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize:10, fill:'#B0B7C3' }} axisLine={false} tickLine={false} tickFormatter={v => v>=1000?`${Math.round(v/1000)}k`:String(v)} width={36} />
                  <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ borderRadius:10, border:'1px solid #E8E8EC', fontSize:12 }} />
                  <Bar dataKey="importe" radius={[5,5,0,0]} maxBarSize={48}>
                    {agingData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Pagos */}
        <div style={{ ...card, padding:'22px 24px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
            <div>
              <div style={{ fontSize:9, fontWeight:600, color:'#1a1a1a', textTransform:'uppercase', letterSpacing:'0.12em' }}>Pagos · próximos vencimientos</div>
              <div style={{ fontSize:11, color:'#B0B7C3', marginTop:2 }}>Obligaciones ordenadas por urgencia.</div>
            </div>
            <button onClick={() => navigate('/pagos')}
              style={{ fontSize:11, fontWeight:500, color:'#4361EE', border:'none', background:'transparent', cursor:'pointer', fontFamily:'inherit' }}>
              Ver detalle →
            </button>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {proximosPagos.map((p, i) => {
              const cfg = p.urgencia === 'alta'
                ? { bg:'#FEF2F2', border:'#FECACA', color:'#b91c1c' }
                : p.urgencia === 'media'
                ? { bg:'#FFF8E6', border:'#FDE68A', color:'#92400E' }
                : { bg:'#F4F5F7', border:'#E8E8EC', color:'#555' }
              return (
                <div key={i} className="res-pago"
                  style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 14px', background:cfg.bg, border:`1px solid ${cfg.border}`, borderRadius:10, transition:'opacity .12s' }}>
                  <div>
                    <div style={{ fontSize:12, fontWeight:500, color:'#1a1a1a' }}>{p.concepto}</div>
                    <div style={{ fontSize:10, color:cfg.color, marginTop:2, fontWeight:500 }}>{p.detalle}</div>
                  </div>
                  <div style={{ fontSize:14, fontWeight:600, color:cfg.color, flexShrink:0, marginLeft:12 }}>{fmt(p.importe)}</div>
                </div>
              )
            })}
          </div>

          {/* Resumen deuda */}
          <div style={{ marginTop:16, paddingTop:14, borderTop:'1px solid #F4F5F7' }}>
            <div style={{ fontSize:9, fontWeight:600, color:'#B0B7C3', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:10 }}>Estructura de deuda total</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              {[
                { lbl:'Financiera',    val:'164.600 €', color:'#4361EE' },
                { lbl:'No financiera', val:'19.430 €',  color:'#F4A100' },
              ].map((d, i) => (
                <div key={i} style={{ background:'#F4F5F7', borderRadius:8, padding:'10px 12px' }}>
                  <div style={{ fontSize:9, fontWeight:700, color:'#B0B7C3', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:4 }}>{d.lbl}</div>
                  <div style={{ fontSize:15, fontWeight:600, color:d.color }}>{d.val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── BLOQUE 4: CFO Brainfi ── */}
      <div style={{ background:'#EEF1FD', borderRadius:16, border:'1px solid #C7D2F8', padding:'24px 28px' }}>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16, flexWrap:'wrap' }}>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:10 }}>
              <div style={{ width:28, height:28, borderRadius:7, background:'#4361EE', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <i className="ti ti-sparkles" style={{ fontSize:14, color:'#fff' }} aria-hidden="true" />
              </div>
              <span style={{ fontSize:9, fontWeight:700, color:'#4361EE', textTransform:'uppercase', letterSpacing:'0.12em' }}>CFO Brainfi · Análisis IA</span>
            </div>
            {cfoInsight ? (
              <div style={{ fontSize:13, color:'#1a1a1a', lineHeight:1.7, background:'#fff', borderRadius:10, padding:'14px 16px', border:'1px solid #C7D2F8' }}>
                {cfoInsight}
              </div>
            ) : (
              <div>
                <div style={{ fontSize:15, fontWeight:500, color:'#1a1a1a', marginBottom:6 }}>
                  Obtén un análisis de tu situación financiera en segundos
                </div>
                <div style={{ fontSize:12, color:'#4361EE', lineHeight:1.6 }}>
                  Cruza automáticamente los datos de ingresos, cobros, pagos y deuda para darte un insight accionable.
                </div>
                <div style={{ display:'flex', gap:16, marginTop:12, flexWrap:'wrap' }}>
                  {[
                    { icon:'ti-trending-up', lbl:'Analiza el crecimiento' },
                    { icon:'ti-alert-triangle', lbl:'Detecta riesgos de liquidez' },
                    { icon:'ti-bulb', lbl:'Sugiere acciones concretas' },
                  ].map((f, i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:5 }}>
                      <i className={`ti ${f.icon}`} style={{ fontSize:12, color:'#4361EE' }} aria-hidden="true" />
                      <span style={{ fontSize:11, color:'#4361EE', fontWeight:500 }}>{f.lbl}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:8, flexShrink:0 }}>
            <button onClick={handleCFO} disabled={cfoLoading}
              style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'12px 22px', fontSize:13, fontWeight:600, border:'none', borderRadius:10, background:cfoLoading?'#7B93FF':'#4361EE', color:'#fff', cursor:cfoLoading?'not-allowed':'pointer', fontFamily:'inherit', transition:'background .15s' }}>
              <i className={`ti ${cfoLoading?'ti-loader-2':'ti-sparkles'}`} style={{ fontSize:14 }} aria-hidden="true" />
              {cfoLoading ? 'Analizando...' : cfoInsight ? 'Regenerar análisis' : 'Generar análisis'}
            </button>
            {cfoInsight && (
              <button onClick={() => setCfoInsight(null)}
                style={{ fontSize:11, fontWeight:500, color:'#4361EE', border:'1px solid #C7D2F8', borderRadius:8, padding:'7px 14px', background:'transparent', cursor:'pointer', fontFamily:'inherit' }}>
                Limpiar
              </button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
