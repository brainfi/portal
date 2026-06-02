import { useState } from 'react'
import Layout from '@/components/Layout'
import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

// ─── Datos mock ───────────────────────────────────────────────────────────────
const evolucionData = [
  { mes:'Ene', ingresos:72,  ebitda:18,  neto:12  },
  { mes:'Feb', ingresos:78,  ebitda:21,  neto:15  },
  { mes:'Mar', ingresos:86,  ebitda:24,  neto:17  },
  { mes:'Abr', ingresos:94,  ebitda:28,  neto:20  },
  { mes:'May', ingresos:68,  ebitda:16,  neto:10  },
  { mes:'Jun', ingresos:null, ebitda:null, neto:null, plan:88 },
  { mes:'Jul', ingresos:null, ebitda:null, neto:null, plan:90 },
  { mes:'Ago', ingresos:null, ebitda:null, neto:null, plan:92 },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n: number) {
  return new Intl.NumberFormat('es-ES', {
    style:'currency', currency:'EUR', maximumFractionDigits:0,
  }).format(n)
}

function diasRestantesMes(): number {
  const hoy    = new Date()
  const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0)
  return finMes.getDate() - hoy.getDate()
}

function Badge({ trend, label }: { trend:'up'|'down'|'neutral'; label:string }) {
  const cfg = {
    up:      { bg:'#d4f5df', color:'#1a7a3a', icon:'↗' },
    down:    { bg:'#FEF2F2', color:'#b91c1c', icon:'↘' },
    neutral: { bg:'#FFF8E6', color:'#92400E', icon:'→' },
  }[trend]
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:3, fontSize:10, fontWeight:600, padding:'2px 7px', borderRadius:99, background:cfg.bg, color:cfg.color }}>
      {cfg.icon} {label}
    </span>
  )
}

function EvolucionTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const labels: Record<string, string> = { ingresos:'Ingresos', ebitda:'EBITDA', neto:'Resultado neto' }
  return (
    <div style={{ background:'#fff', border:'1px solid #E8E8EC', borderRadius:10, padding:'10px 14px', fontSize:12 }}>
      <div style={{ fontWeight:600, color:'#1a1a1a', marginBottom:6 }}>{label}</div>
      {payload.filter((p: any) => p.value !== null).map((p: any) => (
        <div key={p.dataKey} style={{ display:'flex', alignItems:'center', gap:6, marginBottom:3 }}>
          <div style={{ width:7, height:7, borderRadius:2, background:p.stroke }} />
          <span style={{ color:'#666' }}>{labels[p.dataKey] ?? p.dataKey}: {p.value}k €</span>
        </div>
      ))}
    </div>
  )
}

// ─── Componente ───────────────────────────────────────────────────────────────
export default function Dashboard() {
  const MESES_LABEL = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
  const MES_ACTUAL = 4
  const [filtroOpen, setFiltroOpen] = useState(false)
  const [filtro, setFiltro]         = useState<number | 'anual'>(MES_ACTUAL)
  const filtroLabel = filtro === 'anual' ? 'Este año' : MESES_LABEL[filtro as number]
  const opcionesFiltro = [
    ...Array.from({ length: MES_ACTUAL + 1 }, (_, m) => ({
      key: m as number | 'anual',
      label: m === MES_ACTUAL ? `${MESES_LABEL[m]} (este mes)` : MESES_LABEL[m],
      group: '2026',
    })).reverse(),
    { key: 'anual' as const, label: 'Este año', group: 'Acumulado' },
  ]

  const dias = diasRestantesMes()
  const card: React.CSSProperties = { background:'#fff', borderRadius:14, border:'1px solid #E8E8EC' }

  const kpis = [
    { lbl:'Ingresos YTD',        val:'430.000 €', badge:'up'      as const, badgeLbl:'+8.4% vs plan',  sub:'Acumulado ene–may',       icon:'ti-trending-up',   iconBg:'#F0F9F4', iconColor:'#2DC653' },
    { lbl:'Margen bruto',        val:'68.2%',     badge:'up'      as const, badgeLbl:'+1.8pp vs Q1',   sub:'Ingresos menos personal', icon:'ti-chart-bar',     iconBg:'#EEF1FD', iconColor:'#4361EE' },
    { lbl:'EBITDA YTD',          val:'89.400 €',  badge:'down'    as const, badgeLbl:'-5.1% vs plan',  sub:'Plan: 94.200 €',          icon:'ti-chart-pie',     iconBg:'#FEF2F2', iconColor:'#EF4444' },
    { lbl:'Resultado neto YTD',  val:'74.000 €',  badge:'down'    as const, badgeLbl:'-3.8% vs plan',  sub:'Plan: 76.900 €',          icon:'ti-coin',          iconBg:'#FFF8E6', iconColor:'#F4A100' },
    { lbl:'Ratio deuda / EBITDA',val:'2.1x',      badge:'neutral' as const, badgeLbl:'→ moderado',     sub:'Umbral crítico: 3x',      icon:'ti-building-bank', iconBg:'#EEF1FD', iconColor:'#4361EE' },
    { lbl:'Burn rate mensual',   val:'26.060 €',  badge:'up'      as const, badgeLbl:'↗ bajo control', sub:'Runway: 47 días',         icon:'ti-flame',         iconBg:'#F0F9F4', iconColor:'#2DC653' },
  ]

  return (
    <Layout title="Resumen">
      <style>{`
        @media (max-width:1100px){ .dash-perf{grid-template-columns:repeat(3,1fr)!important} }
        @media (max-width:768px) { .dash-perf{grid-template-columns:repeat(2,1fr)!important} }
        @media (max-width:480px) { .dash-perf{grid-template-columns:1fr!important} }
      `}</style>

      {filtroOpen && (
        <div onClick={() => setFiltroOpen(false)} style={{ position:'fixed', inset:0, zIndex:40 }} />
      )}

      {/* ── Encabezado ── */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, flexWrap:'wrap', marginBottom:4 }}>
        <div>
          <div style={{ fontSize:22, fontWeight:700, color:'#1a1a1a', letterSpacing:'-0.4px', marginBottom:4 }}>Resumen</div>
          <div style={{ fontSize:13, color:'#888' }}>Visión consolidada del estado financiero de tu empresa</div>
        </div>
        <div style={{ position:'relative' }}>
          <button onClick={() => setFiltroOpen(o => !o)}
            style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'8px 14px', fontSize:13, fontWeight:500, border:'1px solid #E8E8EC', borderRadius:10, background:'#F4F5F7', color:'#1a1a1a', cursor:'pointer', fontFamily:'inherit' }}>
            {filtroLabel}
            <i className="ti ti-chevron-down" style={{ fontSize:14, color:'#888' }} aria-hidden="true" />
          </button>
          {filtroOpen && (
            <div style={{ position:'absolute', top:'calc(100% + 6px)', right:0, zIndex:50, background:'#fff', border:'1px solid #E8E8EC', borderRadius:12, padding:'6px', minWidth:190, boxShadow:'0 4px 20px rgba(0,0,0,0.08)' }}>
              <div style={{ fontSize:9, fontWeight:700, color:'#B0B7C3', textTransform:'uppercase', letterSpacing:'0.1em', padding:'4px 12px 6px' }}>2026</div>
              {opcionesFiltro.filter(o => o.group === '2026').map(o => (
                <button key={String(o.key)} type="button"
                  onClick={() => { setFiltro(o.key); setFiltroOpen(false) }}
                  style={{ display:'flex', alignItems:'center', justifyContent:'space-between', width:'100%', padding:'8px 12px', fontSize:13, border:'none', borderRadius:7, cursor:'pointer', fontFamily:'inherit', textAlign:'left', background:filtro===o.key?'#EEF1FD':'transparent', color:filtro===o.key?'#4361EE':'#1a1a1a', fontWeight:filtro===o.key?600:400 }}>
                  {o.label}
                  {filtro === o.key && <i className="ti ti-check" style={{ fontSize:13 }} aria-hidden="true" />}
                </button>
              ))}
              <div style={{ height:'1px', background:'#F4F5F7', margin:'4px 0' }} />
              <div style={{ fontSize:9, fontWeight:700, color:'#B0B7C3', textTransform:'uppercase', letterSpacing:'0.1em', padding:'4px 12px 6px' }}>Acumulado</div>
              {opcionesFiltro.filter(o => o.group === 'Acumulado').map(o => (
                <button key={String(o.key)} type="button"
                  onClick={() => { setFiltro(o.key); setFiltroOpen(false) }}
                  style={{ display:'flex', alignItems:'center', justifyContent:'space-between', width:'100%', padding:'8px 12px', fontSize:13, border:'none', borderRadius:7, cursor:'pointer', fontFamily:'inherit', textAlign:'left', background:filtro===o.key?'#EEF1FD':'transparent', color:filtro===o.key?'#4361EE':'#1a1a1a', fontWeight:filtro===o.key?600:400 }}>
                  {o.label}
                  {filtro === o.key && <i className="ti ti-check" style={{ fontSize:13 }} aria-hidden="true" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── CFO Brainfi ── */}
      <div style={{ background:'#EEF1FD', borderRadius:16, border:'1px solid #C7D2F8', padding:'22px 26px' }}>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:20, flexWrap:'wrap' }}>
          <div style={{ flex:1, minWidth:220 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
              <div style={{ width:32, height:32, borderRadius:8, background:'#4361EE', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <i className="ti ti-file-analytics" style={{ fontSize:16, color:'#fff' }} aria-hidden="true" />
              </div>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:'#1a1a1a' }}>CFO Brainfi</div>
                <div style={{ fontSize:11, color:'#4361EE', fontWeight:500 }}>Informe mensual personalizado</div>
              </div>
            </div>

            {/* Contador de días */}
            <div style={{ display:'flex', alignItems:'baseline', gap:6, marginBottom:10 }}>
              <span style={{ fontSize:42, fontWeight:700, color:'#4361EE', letterSpacing:'-1px', lineHeight:1 }}>{dias}</span>
              <span style={{ fontSize:14, fontWeight:500, color:'#4361EE' }}>días</span>
            </div>

            <div style={{ fontSize:13, color:'#1a1a1a', lineHeight:1.65, maxWidth:520 }}>
              Faltan <strong style={{ color:'#4361EE' }}>{dias} días</strong> para recibir tu informe personalizado basado en tu actividad de este mes en curso. Si tienes alguna duda, puedes contactarnos a través de este botón.
            </div>

            {/* Barra de progreso del mes */}
            <div style={{ marginTop:14 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                <span style={{ fontSize:10, color:'#888' }}>1 jun</span>
                <span style={{ fontSize:10, color:'#4361EE', fontWeight:600 }}>Hoy · día {new Date().getDate()}</span>
                <span style={{ fontSize:10, color:'#888' }}>30 jun</span>
              </div>
              <div style={{ height:5, background:'#C7D2F8', borderRadius:99, overflow:'hidden' }}>
                <div style={{ width:`${Math.round((new Date().getDate() / 30) * 100)}%`, height:'100%', background:'#4361EE', borderRadius:99 }} />
              </div>
            </div>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:8, flexShrink:0, alignSelf:'center' }}>
            <a href="mailto:hola@brainfi.io"
              style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'11px 20px', fontSize:13, fontWeight:600, border:'none', borderRadius:10, background:'#4361EE', color:'#fff', cursor:'pointer', fontFamily:'inherit', textDecoration:'none' }}>
              <i className="ti ti-mail" style={{ fontSize:15 }} aria-hidden="true" />
              Contactar
            </a>
          </div>
        </div>
      </div>

      {/* ── Performance: 6 KPIs ── */}
      <div>
        <div style={{ fontSize:9, fontWeight:700, color:'#B0B7C3', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:10 }}>Performance</div>
        <div className="dash-perf" style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:10 }}>
          {kpis.map((k, i) => (
            <div key={i} style={{ ...card, padding:'16px 18px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
                <div style={{ fontSize:9, fontWeight:600, color:'#1a1a1a', textTransform:'uppercase', letterSpacing:'0.1em', lineHeight:1.4 }}>{k.lbl}</div>
                <div style={{ width:28, height:28, borderRadius:7, background:k.iconBg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <i className={`ti ${k.icon}`} style={{ fontSize:13, color:k.iconColor }} aria-hidden="true" />
                </div>
              </div>
              <div style={{ fontSize:20, fontWeight:400, color:'#1a1a1a', letterSpacing:'-0.4px', margin:'8px 0 6px' }}>{k.val}</div>
              <Badge trend={k.badge} label={k.badgeLbl} />
              <div style={{ fontSize:10, color:'#B0B7C3', marginTop:4 }}>{k.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Evolución ── */}
      <div style={{ ...card, padding:'24px 26px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
          <div>
            <div style={{ fontSize:9, fontWeight:700, color:'#B0B7C3', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:4 }}>Evolución</div>
            <div style={{ fontSize:13, color:'#888' }}>Ingresos, EBITDA y Resultado neto · 2026</div>
          </div>
          <div style={{ display:'flex', gap:14, alignItems:'center', flexWrap:'wrap' }}>
            {[
              { color:'#4361EE', lbl:'Ingresos',        dash:false },
              { color:'#F4A100', lbl:'EBITDA',           dash:false },
              { color:'#2DC653', lbl:'Resultado neto',   dash:false },
            ].map((l, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:5 }}>
                <svg width="18" height="8"><line x1="0" y1="4" x2="18" y2="4" stroke={l.color} strokeWidth="2"/></svg>
                <span style={{ fontSize:11, color:'#888' }}>{l.lbl}</span>
              </div>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={evolucionData} margin={{ top:4, right:8, left:0, bottom:0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F2" vertical={false} />
            <XAxis dataKey="mes" tick={{ fontSize:11, fill:'#B0B7C3' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize:11, fill:'#B0B7C3' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}k`} width={36} />
            <Tooltip content={<EvolucionTooltip />} cursor={{ stroke:'#E8E8EC', strokeWidth:1 }} />
            <Line
              type="monotone" dataKey="ingresos" stroke="#4361EE" strokeWidth={2.5}
              dot={{ r:4, fill:'#4361EE', stroke:'#fff', strokeWidth:2 }}
              activeDot={{ r:6, fill:'#4361EE', stroke:'#fff', strokeWidth:2 }}
              connectNulls={false} />
            <Line
              type="monotone" dataKey="ebitda" stroke="#F4A100" strokeWidth={2.5}
              dot={{ r:4, fill:'#F4A100', stroke:'#fff', strokeWidth:2 }}
              activeDot={{ r:6, fill:'#F4A100', stroke:'#fff', strokeWidth:2 }}
              connectNulls={false} />
            <Line
              type="monotone" dataKey="neto" stroke="#2DC653" strokeWidth={2.5}
              dot={{ r:4, fill:'#2DC653', stroke:'#fff', strokeWidth:2 }}
              activeDot={{ r:6, fill:'#2DC653', stroke:'#fff', strokeWidth:2 }}
              connectNulls={false} />
          </LineChart>
        </ResponsiveContainer>
        <div style={{ display:'flex', justifyContent:'center', gap:6, marginTop:8 }}>
          {evolucionData.map((d, i) => (
            <div key={i} style={{ width:6, height:6, borderRadius:'50%', background: i === 4 ? '#4361EE' : '#E8E8EC' }} />
          ))}
        </div>
      </div>
    </Layout>
  )
}
