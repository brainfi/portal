import Layout from '@/components/Layout'
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Legend,
} from 'recharts'

// ─── Datos ────────────────────────────────────────────────────────────────────
// YTD real (ene–may 2026)
const real2026: Record<string, { ingresos: number; gastos: number }> = {
  Ene: { ingresos: 110000, gastos: 78000 },
  Feb: { ingresos: 125000, gastos: 80000 },
  Mar: { ingresos: 158000, gastos: 85000 },
  Abr: { ingresos: 140000, gastos: 75000 },
  May: { ingresos: 88000,  gastos: 42000 },
}

// Proyección meses restantes 2026 (jun–dic)
const proy2026: Record<string, { ingresos: number; gastos: number }> = {
  Jun: { ingresos: 132000, gastos: 68000 },
  Jul: { ingresos: 128000, gastos: 66000 },
  Ago: { ingresos: 115000, gastos: 62000 },
  Sep: { ingresos: 138000, gastos: 70000 },
  Oct: { ingresos: 145000, gastos: 72000 },
  Nov: { ingresos: 152000, gastos: 74000 },
  Dic: { ingresos: 160000, gastos: 76000 },
}

const SCALE_2027 = 1.12 // +12% sobre patrón 2026

const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

// Construir datos del gráfico
const chartData = MESES.map(mes => {
  const esReal = mes in real2026
  const src = esReal ? real2026[mes] : proy2026[mes]
  const neto = src.ingresos - src.gastos
  return {
    mes,
    ingresos: src.ingresos,
    gastos: src.gastos,
    neto,
    tipo: esReal ? 'real' : 'proyectado',
  }
})

// Acumulado cashflow para línea
let acum = 0
const chartDataConAcum = chartData.map(d => {
  acum += d.neto
  return { ...d, acumulado: acum }
})

// Totales 2026
const total2026Ingresos = chartData.reduce((s, d) => s + d.ingresos, 0)
const total2026Gastos   = chartData.reduce((s, d) => s + d.gastos, 0)
const total2026Neto     = total2026Ingresos - total2026Gastos

// Proyección 2027 (patrón 2026 × SCALE_2027)
const total2027Ingresos = Math.round(total2026Ingresos * SCALE_2027)
const total2027Gastos   = Math.round(total2026Gastos   * SCALE_2027)
const total2027Neto     = total2027Ingresos - total2027Gastos

// YTD real
const ytdIngresos = Object.values(real2026).reduce((s, d) => s + d.ingresos, 0)
const ytdGastos   = Object.values(real2026).reduce((s, d) => s + d.gastos, 0)
const ytdNeto     = ytdIngresos - ytdGastos

// ─── Formatters ───────────────────────────────────────────────────────────────
function fmt(n: number) {
  return new Intl.NumberFormat('es-ES', { style:'currency', currency:'EUR', maximumFractionDigits:0 }).format(n)
}
function fmtK(n: number) {
  return (Math.abs(n) >= 1000 ? (n / 1000).toFixed(0) + 'k' : n.toString()) + ' €'
}

// ─── Tooltip personalizado ────────────────────────────────────────────────────
function CfTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  return (
    <div style={{ background:'#fff', border:'1px solid #E8E8EC', borderRadius:10, padding:'12px 16px', fontSize:12, minWidth:160 }}>
      <div style={{ fontWeight:600, color:'#1a1a1a', marginBottom:8, display:'flex', alignItems:'center', gap:6 }}>
        {label}
        {d?.tipo === 'proyectado' && (
          <span style={{ fontSize:10, background:'#FFF8E6', color:'#92400E', padding:'1px 6px', borderRadius:99, fontWeight:500 }}>Estimado</span>
        )}
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
        <div style={{ display:'flex', justifyContent:'space-between', gap:24 }}>
          <span style={{ color:'#888' }}>Ingresos</span>
          <span style={{ fontWeight:600, color:'#1C1E26' }}>{fmt(d?.ingresos)}</span>
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', gap:24 }}>
          <span style={{ color:'#888' }}>Gastos</span>
          <span style={{ fontWeight:600, color:'#EF4444' }}>{fmt(d?.gastos)}</span>
        </div>
        <div style={{ borderTop:'1px solid #F0F0F2', paddingTop:5, display:'flex', justifyContent:'space-between', gap:24 }}>
          <span style={{ color:'#888' }}>Neto</span>
          <span style={{ fontWeight:700, color: d?.neto >= 0 ? '#2DC653' : '#EF4444' }}>{fmt(d?.neto)}</span>
        </div>
      </div>
    </div>
  )
}

// ─── Estilos compartidos ──────────────────────────────────────────────────────
const card: React.CSSProperties = { background:'#fff', borderRadius:14, border:'1px solid #E8E8EC' }
const kpiCard: React.CSSProperties = { ...card, padding:'18px 22px' }

// ─── Componente principal ─────────────────────────────────────────────────────
export default function Cashflow() {
  return (
    <Layout title="Cashflow">
      <style>{`
        @media (max-width: 900px) { .cf-kpis { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 600px) { .cf-kpis { grid-template-columns: 1fr !important; } .cf-hide { display: none !important; } }
        .cf-tr:hover td { background: #FAFAFA; }
        .cf-tr td { transition: background 0.1s; }
      `}</style>

      {/* ── KPIs ── */}
      <div className="cf-kpis" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
        <KpiCard label="YTD Ingresos"   value={fmt(ytdIngresos)}   delta="ene–may 2026"         color="#1C1E26" />
        <KpiCard label="YTD Gastos"     value={fmt(ytdGastos)}     delta="ene–may 2026"         color="#EF4444" />
        <KpiCard label="YTD Neto"       value={fmt(ytdNeto)}       delta="↗ margen 37,2%"       color="#2DC653" />
        <KpiCard label="Proyección 2026" value={fmt(total2026Neto)} delta="neto estimado cierre" color="#F4A100" />
      </div>

      {/* ── Gráfico ── */}
      <div style={{ ...card, padding:'24px 24px 16px' }}>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:20, flexWrap:'wrap', gap:12 }}>
          <div>
            <div style={{ fontSize:15, fontWeight:700, color:'#1a1a1a', letterSpacing:'-0.02em' }}>Flujo de caja 2026</div>
            <div style={{ fontSize:11, color:'#B0B7C3', marginTop:2 }}>Mensualizado · Real + proyección a cierre de año</div>
          </div>
          <div style={{ display:'flex', gap:16, alignItems:'center' }}>
            <LegendItem color="#BAE6FD" label="Ingresos" />
            <LegendItem color="#FECACA" label="Gastos" />
            <LegendItem color="#1C1E26" label="Neto acumulado" line />
            <div style={{ width:1, height:16, background:'#E8E8EC', margin:'0 4px' }} />
            <div style={{ display:'flex', alignItems:'center', gap:5 }}>
              <div style={{ width:10, height:10, borderRadius:2, background:'#FFF8E6', border:'1px solid #F4A100' }} />
              <span style={{ fontSize:11, color:'#B0B7C3' }}>Estimado</span>
            </div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={chartDataConAcum} margin={{ top:4, right:16, left:0, bottom:0 }} barGap={3}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F2" vertical={false} />
            <XAxis dataKey="mes" tick={{ fontSize:11, fill:'#B0B7C3' }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="bars" tick={{ fontSize:11, fill:'#B0B7C3' }} axisLine={false} tickLine={false}
              tickFormatter={v => `${(v/1000).toFixed(0)}k`} width={38} />
            <YAxis yAxisId="line" orientation="right" tick={{ fontSize:11, fill:'#B0B7C3' }} axisLine={false} tickLine={false}
              tickFormatter={v => `${(v/1000).toFixed(0)}k`} width={38} />
            <Tooltip content={<CfTooltip />} cursor={{ fill:'rgba(0,0,0,0.025)' }} />
            <ReferenceLine yAxisId="bars" y={0} stroke="#E8E8EC" />

            {/* Barras con opacidad reducida en proyectados */}
            <Bar yAxisId="bars" dataKey="ingresos" name="Ingresos" radius={[4,4,0,0]}
              fill="#BAE6FD"
              shape={(props: any) => {
                const { x, y, width, height, tipo } = props
                return <rect x={x} y={y} width={width} height={height}
                  fill={tipo === 'proyectado' ? '#E0F2FE' : '#BAE6FD'}
                  rx={4} ry={4}
                  stroke={tipo === 'proyectado' ? '#7DD3FC' : 'none'}
                  strokeWidth={tipo === 'proyectado' ? 1 : 0}
                  strokeDasharray={tipo === 'proyectado' ? '3 2' : 'none'}
                />
              }}
            />
            <Bar yAxisId="bars" dataKey="gastos" name="Gastos" radius={[4,4,0,0]}
              fill="#FECACA"
              shape={(props: any) => {
                const { x, y, width, height, tipo } = props
                return <rect x={x} y={y} width={width} height={height}
                  fill={tipo === 'proyectado' ? '#FEE2E2' : '#FECACA'}
                  rx={4} ry={4}
                  stroke={tipo === 'proyectado' ? '#FCA5A5' : 'none'}
                  strokeWidth={tipo === 'proyectado' ? 1 : 0}
                  strokeDasharray={tipo === 'proyectado' ? '3 2' : 'none'}
                />
              }}
            />
            <Line yAxisId="line" type="monotone" dataKey="acumulado" name="Neto acumulado"
              stroke="#1C1E26" strokeWidth={2} dot={false}
              activeDot={{ r:5, fill:'#1C1E26', stroke:'#fff', strokeWidth:2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* ── Tabla detalle ── */}
      <div style={{ ...card, padding:'24px' }}>
        <div style={{ fontSize:15, fontWeight:700, color:'#1a1a1a', letterSpacing:'-0.02em', marginBottom:4 }}>Detalle mensual</div>
        <div style={{ fontSize:11, color:'#B0B7C3', marginBottom:20 }}>Ingresos, gastos y neto · 2026 real + proyección · 2027 total estimado</div>

        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
          <thead>
            <tr style={{ borderBottom:'2px solid #F0F0F2' }}>
              <Th>Periodo</Th>
              <Th right>Ingresos</Th>
              <Th right>Gastos</Th>
              <Th right>Neto</Th>
              <Th right className="cf-hide">Margen</Th>
              <Th right className="cf-hide">Acumulado</Th>
              <Th center>Estado</Th>
            </tr>
          </thead>
          <tbody>
            {chartDataConAcum.map((d, i) => {
              const margen = Math.round((d.neto / d.ingresos) * 100)
              return (
                <tr key={d.mes} className="cf-tr" style={{ borderBottom:'1px solid #F4F5F7' }}>
                  <td style={{ padding:'11px 0', color:'#1a1a1a', fontWeight:500 }}>{d.mes} 2026</td>
                  <td style={{ padding:'11px 0', textAlign:'right', color:'#1a1a1a' }}>{fmt(d.ingresos)}</td>
                  <td style={{ padding:'11px 0', textAlign:'right', color:'#EF4444' }}>{fmt(d.gastos)}</td>
                  <td style={{ padding:'11px 0', textAlign:'right', fontWeight:600, color: d.neto >= 0 ? '#2DC653' : '#EF4444' }}>{fmt(d.neto)}</td>
                  <td className="cf-hide" style={{ padding:'11px 0', textAlign:'right', color:'#888' }}>{margen}%</td>
                  <td className="cf-hide" style={{ padding:'11px 0', textAlign:'right', color:'#1a1a1a', fontWeight:500 }}>{fmt(d.acumulado)}</td>
                  <td style={{ padding:'11px 0', textAlign:'center' }}>
                    <Badge tipo={d.tipo} />
                  </td>
                </tr>
              )
            })}

            {/* Subtotal 2026 */}
            <tr style={{ borderBottom:'2px solid #E8E8EC', background:'#FAFAFA' }}>
              <td style={{ padding:'12px 0', fontWeight:700, color:'#1a1a1a' }}>Total 2026</td>
              <td style={{ padding:'12px 0', textAlign:'right', fontWeight:700, color:'#1a1a1a' }}>{fmt(total2026Ingresos)}</td>
              <td style={{ padding:'12px 0', textAlign:'right', fontWeight:700, color:'#EF4444' }}>{fmt(total2026Gastos)}</td>
              <td style={{ padding:'12px 0', textAlign:'right', fontWeight:700, color: total2026Neto >= 0 ? '#2DC653' : '#EF4444' }}>{fmt(total2026Neto)}</td>
              <td className="cf-hide" style={{ padding:'12px 0', textAlign:'right', fontWeight:700, color:'#888' }}>
                {Math.round((total2026Neto / total2026Ingresos) * 100)}%
              </td>
              <td className="cf-hide" />
              <td style={{ padding:'12px 0', textAlign:'center' }}>
                <span style={{ fontSize:10, fontWeight:600, color:'#555', background:'#F0F0F2', padding:'2px 8px', borderRadius:99 }}>Cierre est.</span>
              </td>
            </tr>

            {/* 2027 */}
            <tr style={{ background:'#FFFBF0' }}>
              <td style={{ padding:'13px 0 13px', fontWeight:700, color:'#1a1a1a' }}>
                Total 2027
                <div style={{ fontSize:10, fontWeight:400, color:'#B0B7C3', marginTop:2 }}>Patrón 2026 × +12%</div>
              </td>
              <td style={{ padding:'13px 0', textAlign:'right', fontWeight:700, color:'#1a1a1a' }}>{fmt(total2027Ingresos)}</td>
              <td style={{ padding:'13px 0', textAlign:'right', fontWeight:700, color:'#EF4444' }}>{fmt(total2027Gastos)}</td>
              <td style={{ padding:'13px 0', textAlign:'right', fontWeight:700, color: total2027Neto >= 0 ? '#2DC653' : '#EF4444' }}>{fmt(total2027Neto)}</td>
              <td className="cf-hide" style={{ padding:'13px 0', textAlign:'right', fontWeight:700, color:'#888' }}>
                {Math.round((total2027Neto / total2027Ingresos) * 100)}%
              </td>
              <td className="cf-hide" />
              <td style={{ padding:'13px 0', textAlign:'center' }}>
                <span style={{ fontSize:10, fontWeight:600, color:'#92400E', background:'#FFF8E6', padding:'2px 8px', borderRadius:99 }}>Proyección</span>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Nota */}
        <div style={{ marginTop:16, paddingTop:14, borderTop:'1px solid #F4F5F7', display:'flex', alignItems:'flex-start', gap:8 }}>
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="#B0B7C3" strokeWidth="1.5" style={{ flexShrink:0, marginTop:1 }}>
            <circle cx="8" cy="8" r="7"/><path d="M8 7v4M8 5h.01"/>
          </svg>
          <span style={{ fontSize:11, color:'#B0B7C3', lineHeight:1.6 }}>
            Los datos de junio a diciembre 2026 y el total 2027 son estimaciones. La proyección 2027 aplica el patrón estacional de 2026 con un crecimiento del 12%. Conecta tu ERP desde <a href="/integraciones" style={{ color:'#1C1E26', fontWeight:600 }}>Integraciones</a> para datos reales.
          </span>
        </div>
      </div>

    </Layout>
  )
}

// ─── Subcomponentes ───────────────────────────────────────────────────────────

function KpiCard({ label, value, delta, color }: { label:string; value:string; delta:string; color:string }) {
  return (
    <div style={{ background:'#fff', borderRadius:14, border:'1px solid #E8E8EC', padding:'18px 22px' }}>
      <div style={{ fontSize:9, fontWeight:600, color:'#B0B7C3', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:10 }}>{label}</div>
      <div style={{ fontSize:24, fontWeight:700, color:'#1a1a1a', letterSpacing:'-0.02em', marginBottom:6 }}>{value}</div>
      <div style={{ fontSize:11, color, fontWeight:500 }}>{delta}</div>
    </div>
  )
}

function LegendItem({ color, label, line }: { color:string; label:string; line?:boolean }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:5 }}>
      {line
        ? <div style={{ width:16, height:2, background:color, borderRadius:99 }} />
        : <div style={{ width:10, height:10, borderRadius:3, background:color }} />
      }
      <span style={{ fontSize:11, color:'#888' }}>{label}</span>
    </div>
  )
}

function Badge({ tipo }: { tipo: string }) {
  if (tipo === 'real') return (
    <span style={{ fontSize:10, fontWeight:600, color:'#1a7a3a', background:'#EAFAF0', padding:'2px 8px', borderRadius:99 }}>Real</span>
  )
  return (
    <span style={{ fontSize:10, fontWeight:600, color:'#92400E', background:'#FFF8E6', padding:'2px 8px', borderRadius:99 }}>Estimado</span>
  )
}

function Th({ children, right, center, className }: { children:React.ReactNode; right?:boolean; center?:boolean; className?:string }) {
  return (
    <th className={className} style={{
      padding:'0 0 10px', textAlign: center ? 'center' : right ? 'right' : 'left',
      fontSize:10, fontWeight:600, color:'#B0B7C3', textTransform:'uppercase', letterSpacing:'0.1em',
    }}>
      {children}
    </th>
  )
}
