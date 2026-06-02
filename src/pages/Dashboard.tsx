import { useState } from 'react'
import Layout from '@/components/Layout'
import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

// ─── Datos mock ───────────────────────────────────────────────────────────────
const evolucionData = [
  { mes:'Ene', ingresos:72,  ebitda:15,  margenEbitda:20.8, tesoreria:48, dso:35 },
  { mes:'Feb', ingresos:78,  ebitda:17,  margenEbitda:21.8, tesoreria:52, dso:36 },
  { mes:'Mar', ingresos:86,  ebitda:21,  margenEbitda:24.4, tesoreria:44, dso:37 },
  { mes:'Abr', ingresos:94,  ebitda:26,  margenEbitda:27.7, tesoreria:61, dso:36 },
  { mes:'May', ingresos:68,  ebitda:15,  margenEbitda:22.1, tesoreria:18, dso:38 },
]

function diasRestantesMes(): number {
  const hoy    = new Date()
  const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0)
  return finMes.getDate() - hoy.getDate()
}

function fmt(n: number) {
  return new Intl.NumberFormat('es-ES', { style:'currency', currency:'EUR', maximumFractionDigits:0 }).format(n)
}

function Badge({ trend, label }: { trend:'up'|'down'|'neutral'; label:string }) {
  const cfg = {
    up:      { bg:'#d4f5df', color:'#1a7a3a', icon:'↗' },
    down:    { bg:'#FEF2F2', color:'#b91c1c', icon:'↘' },
    neutral: { bg:'#FFF8E6', color:'#92400E', icon:'→' },
  }[trend]
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:3, fontSize:10, fontWeight:600, padding:'2px 7px', borderRadius:99, background:cfg.bg, color:cfg.color, whiteSpace:'nowrap' }}>
      {cfg.icon} {label}
    </span>
  )
}

function CustomTooltip({ active, payload, label, section }: any) {
  if (!active || !payload?.length) return null
  const names: Record<string, string> = {
    ingresos:'Ingresos', ebitda:'EBITDA', margenEbitda:'Margen EBITDA',
    tesoreria:'Tesorería neta', dso:'DSO',
  }
  const units: Record<string, string> = {
    ingresos:'k €', ebitda:'k €', margenEbitda:'%',
    tesoreria:'k €', dso:'d',
  }
  return (
    <div style={{ background:'#fff', border:'1px solid #E8E8EC', borderRadius:10, padding:'10px 14px', fontSize:12 }}>
      <div style={{ fontWeight:600, color:'#1a1a1a', marginBottom:6 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ display:'flex', alignItems:'center', gap:6, marginBottom:3 }}>
          <div style={{ width:7, height:7, borderRadius:2, background:p.stroke }} />
          <span style={{ color:'#666' }}>{names[p.dataKey]}: {p.value}{units[p.dataKey]}</span>
        </div>
      ))}
    </div>
  )
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KPICard({ lbl, val, badge, badgeLbl, sub, icon, iconBg, iconColor, comparacion }:
  { lbl:string; val:string; badge:'up'|'down'|'neutral'; badgeLbl:string; sub:string; icon:string; iconBg:string; iconColor:string; comparacion?:string }) {
  return (
    <div style={{ background:'#fff', borderRadius:12, border:'1px solid #E8E8EC', padding:'14px 16px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:4 }}>
        <div style={{ fontSize:9, fontWeight:600, color:'#1a1a1a', textTransform:'uppercase', letterSpacing:'0.1em', lineHeight:1.4 }}>{lbl}</div>
        <div style={{ width:26, height:26, borderRadius:7, background:iconBg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <i className={`ti ${icon}`} style={{ fontSize:12, color:iconColor }} aria-hidden="true" />
        </div>
      </div>
      <div style={{ fontSize:22, fontWeight:400, color:'#1a1a1a', letterSpacing:'-0.4px', margin:'6px 0 6px' }}>{val}</div>
      <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
        <Badge trend={badge} label={badgeLbl} />
        <span style={{ fontSize:10, color:'#B0B7C3' }}>{sub}</span>
      </div>
      {comparacion && (
        <div style={{ marginTop:6, fontSize:10, color:'#B0B7C3', borderTop:'1px solid #F4F5F7', paddingTop:6 }}>
          {comparacion}
        </div>
      )}
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function Dashboard() {
  const dias = diasRestantesMes()
  const pctMes = Math.round((new Date().getDate() / 30) * 100)

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

  // Qué métricas muestra el gráfico según sección activa
  const [seccionActiva, setSeccionActiva] = useState<'pyg'|'tesoreria'>('pyg')

  return (
    <Layout title="Resumen">
      <style>{`
        @media (max-width:900px){ .dash-main{grid-template-columns:1fr!important} }
        .dash-sec-btn { border:none; cursor:pointer; font-family:inherit; font-size:11px; padding:5px 14px; border-radius:6px; transition:all .12s; }
      `}</style>

      {filtroOpen && (
        <div onClick={() => setFiltroOpen(false)} style={{ position:'fixed', inset:0, zIndex:40 }} />
      )}

      {/* ── Encabezado ── */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
        <div>
          <div style={{ fontSize:22, fontWeight:700, color:'#1a1a1a', letterSpacing:'-0.4px', marginBottom:3 }}>Resumen</div>
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

      {/* ── CFO Brainfi · compacto ── */}
      <div style={{ background:'#EEF1FD', borderRadius:12, border:'1px solid #C7D2F8', padding:'14px 20px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
          {/* Icono + título */}
          <div style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
            <div style={{ width:30, height:30, borderRadius:8, background:'#4361EE', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <i className="ti ti-file-analytics" style={{ fontSize:15, color:'#fff' }} aria-hidden="true" />
            </div>
            <div>
              <div style={{ fontSize:12, fontWeight:700, color:'#1a1a1a', lineHeight:1.2 }}>CFO Brainfi</div>
              <div style={{ fontSize:10, color:'#4361EE', fontWeight:500 }}>Informe mensual</div>
            </div>
          </div>

          {/* Días restantes pill */}
          <div style={{ background:'#4361EE', borderRadius:99, padding:'4px 14px', flexShrink:0 }}>
            <span style={{ fontSize:13, fontWeight:700, color:'#fff' }}>{dias}d</span>
          </div>

          {/* Mensaje */}
          <div style={{ flex:1, minWidth:200, fontSize:12, color:'#1a1a1a', lineHeight:1.5 }}>
            Faltan <strong style={{ color:'#4361EE' }}>{dias} días</strong> para recibir tu informe personalizado basado en tu actividad de este mes en curso. Si tienes alguna duda, puedes contactarnos a través de este botón.
          </div>

          {/* Barra progreso + botón */}
          <div style={{ display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
            <div style={{ width:80 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                <span style={{ fontSize:9, color:'#888' }}>jun</span>
                <span style={{ fontSize:9, color:'#4361EE', fontWeight:600 }}>{pctMes}%</span>
              </div>
              <div style={{ height:4, background:'#C7D2F8', borderRadius:99, overflow:'hidden' }}>
                <div style={{ width:`${pctMes}%`, height:'100%', background:'#4361EE', borderRadius:99 }} />
              </div>
            </div>
            <a href="mailto:hola@brainfi.io"
              style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'8px 16px', fontSize:12, fontWeight:600, border:'none', borderRadius:8, background:'#4361EE', color:'#fff', cursor:'pointer', fontFamily:'inherit', textDecoration:'none', whiteSpace:'nowrap' }}>
              <i className="ti ti-mail" style={{ fontSize:13 }} aria-hidden="true" />
              Contactar
            </a>
          </div>
        </div>
      </div>

      {/* ── Main grid: KPIs izquierda / Gráfico derecha ── */}
      <div className="dash-main" style={{ display:'grid', gridTemplateColumns:'320px 1fr', gap:14 }}>

        {/* ── Columna izquierda: KPIs ── */}
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>

          {/* Sección P&G */}
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8, cursor:'pointer' }}
              onClick={() => setSeccionActiva('pyg')}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:'#4361EE', flexShrink:0 }} />
              <span style={{ fontSize:9, fontWeight:700, color: seccionActiva==='pyg'?'#4361EE':'#B0B7C3', textTransform:'uppercase', letterSpacing:'0.12em', transition:'color .15s' }}>
                Cuenta de pérdidas y ganancias
              </span>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              <KPICard
                lbl="Ingresos YTD"
                val="430.000 €"
                badge="up"
                badgeLbl="+8.4% vs plan"
                sub="Plan: 395.000 €"
                icon="ti-trending-up"
                iconBg="#F0F9F4"
                iconColor="#2DC653"
                comparacion="Presupuesto anual: 1.010.000 €"
              />
              <KPICard
                lbl="EBITDA YTD"
                val="89.400 €"
                badge="down"
                badgeLbl="-5.1% vs plan"
                sub="Plan: 94.200 €"
                icon="ti-chart-pie"
                iconBg="#FEF2F2"
                iconColor="#EF4444"
                comparacion="Presupuesto anual: 231.000 €"
              />
              <KPICard
                lbl="Margen EBITDA"
                val="20.8%"
                badge="neutral"
                badgeLbl="→ 23.9% plan"
                sub="EBITDA / Ingresos"
                icon="ti-percentage"
                iconBg="#FFF8E6"
                iconColor="#F4A100"
                comparacion="Objetivo anual: 22.9%"
              />
            </div>
          </div>

          {/* Separador */}
          <div style={{ height:'0.5px', background:'#E8E8EC' }} />

          {/* Sección Tesorería */}
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8, cursor:'pointer' }}
              onClick={() => setSeccionActiva('tesoreria')}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:'#2DC653', flexShrink:0 }} />
              <span style={{ fontSize:9, fontWeight:700, color: seccionActiva==='tesoreria'?'#2DC653':'#B0B7C3', textTransform:'uppercase', letterSpacing:'0.12em', transition:'color .15s' }}>
                Tesorería
              </span>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              <KPICard
                lbl="Tesorería neta"
                val="17.760 €"
                badge="neutral"
                badgeLbl="→ ajustada"
                sub="Banco − obligaciones 30d"
                icon="ti-building-bank"
                iconBg="#EEF1FD"
                iconColor="#4361EE"
                comparacion="Saldo banco: 65.000 € · Obligaciones: 47.240 €"
              />
              <KPICard
                lbl="DSO medio"
                val="38 días"
                badge="down"
                badgeLbl="↘ sector: 30d"
                sub="Días medios de cobro"
                icon="ti-clock"
                iconBg="#FEF2F2"
                iconColor="#EF4444"
                comparacion="Reducir 8d liberaría ~12.400 € de caja"
              />
              <KPICard
                lbl="Runway"
                val="47 días"
                badge="neutral"
                badgeLbl="→ estable"
                sub="Sin nuevas ventas"
                icon="ti-shield"
                iconBg="#FFF8E6"
                iconColor="#F4A100"
                comparacion="Burn rate mensual: 26.060 €"
              />
            </div>
          </div>
        </div>

        {/* ── Columna derecha: Gráfico ── */}
        <div style={{ background:'#fff', borderRadius:14, border:'1px solid #E8E8EC', padding:'22px 24px', display:'flex', flexDirection:'column' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16, flexWrap:'wrap', gap:10 }}>
            <div>
              <div style={{ fontSize:9, fontWeight:700, color:'#B0B7C3', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:3 }}>Evolución</div>
              <div style={{ fontSize:13, color:'#888' }}>
                {seccionActiva === 'pyg'
                  ? 'Ingresos · EBITDA · Margen EBITDA · 2026'
                  : 'Tesorería neta · DSO · 2026'}
              </div>
            </div>
            {/* Toggle sección */}
            <div style={{ display:'flex', gap:2, background:'#F4F5F7', borderRadius:8, padding:3 }}>
              {([['pyg','P&G'],['tesoreria','Tesorería']] as const).map(([v, lbl]) => (
                <button key={v} className="dash-sec-btn"
                  onClick={() => setSeccionActiva(v)}
                  style={{ background:seccionActiva===v?'#fff':'transparent', color:seccionActiva===v?'#1a1a1a':'#888', fontWeight:seccionActiva===v?600:400, boxShadow:seccionActiva===v?'0 1px 4px rgba(0,0,0,0.08)':'none' }}>
                  {lbl}
                </button>
              ))}
            </div>
          </div>

          {/* Leyenda */}
          <div style={{ display:'flex', gap:14, marginBottom:12, flexWrap:'wrap' }}>
            {seccionActiva === 'pyg' ? [
              { color:'#4361EE', lbl:'Ingresos (k €)' },
              { color:'#F4A100', lbl:'EBITDA (k €)' },
              { color:'#2DC653', lbl:'Margen EBITDA (%)' },
            ] : [
              { color:'#4361EE', lbl:'Tesorería neta (k €)' },
              { color:'#EF4444', lbl:'DSO (días)' },
            ].map((l, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:5 }}>
                <svg width="16" height="6"><line x1="0" y1="3" x2="16" y2="3" stroke={l.color} strokeWidth="2"/></svg>
                <span style={{ fontSize:10, color:'#888' }}>{l.lbl}</span>
              </div>
            ))}
          </div>

          <div style={{ flex:1, minHeight:300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={evolucionData} margin={{ top:4, right:8, left:0, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F2" vertical={false} />
                <XAxis dataKey="mes" tick={{ fontSize:11, fill:'#B0B7C3' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:11, fill:'#B0B7C3' }} axisLine={false} tickLine={false}
                  tickFormatter={v => seccionActiva==='pyg' ? `${v}k` : String(v)} width={38} />
                <Tooltip content={<CustomTooltip section={seccionActiva} />} cursor={{ stroke:'#E8E8EC', strokeWidth:1 }} />

                {seccionActiva === 'pyg' ? <>
                  <Line type="monotone" dataKey="ingresos"    stroke="#4361EE" strokeWidth={2.5}
                    dot={{ r:4, fill:'#4361EE', stroke:'#fff', strokeWidth:2 }}
                    activeDot={{ r:6, fill:'#4361EE', stroke:'#fff', strokeWidth:2 }} />
                  <Line type="monotone" dataKey="ebitda"      stroke="#F4A100" strokeWidth={2.5}
                    dot={{ r:4, fill:'#F4A100', stroke:'#fff', strokeWidth:2 }}
                    activeDot={{ r:6, fill:'#F4A100', stroke:'#fff', strokeWidth:2 }} />
                  <Line type="monotone" dataKey="margenEbitda" stroke="#2DC653" strokeWidth={2}
                    strokeDasharray="5 3"
                    dot={{ r:4, fill:'#2DC653', stroke:'#fff', strokeWidth:2 }}
                    activeDot={{ r:6, fill:'#2DC653', stroke:'#fff', strokeWidth:2 }} />
                </> : <>
                  <Line type="monotone" dataKey="tesoreria" stroke="#4361EE" strokeWidth={2.5}
                    dot={{ r:4, fill:'#4361EE', stroke:'#fff', strokeWidth:2 }}
                    activeDot={{ r:6, fill:'#4361EE', stroke:'#fff', strokeWidth:2 }} />
                  <Line type="monotone" dataKey="dso"       stroke="#EF4444" strokeWidth={2.5}
                    dot={{ r:4, fill:'#EF4444', stroke:'#fff', strokeWidth:2 }}
                    activeDot={{ r:6, fill:'#EF4444', stroke:'#fff', strokeWidth:2 }} />
                </>}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Layout>
  )
}
