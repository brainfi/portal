import Layout from '@/components/Layout'
import { mockKPIs, mockEvolucion, mockPrevisiones, puntoEquilibrio } from '@/lib/mockData'
import { formatCurrency, formatDate, formatNumber } from '@/lib/formatters'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, Cell
} from 'recharts'

// ── KPI Card ──────────────────────────────────────────────────────────────────
interface KPICardProps {
  label: string
  value: string
  delta: string
  positivo: boolean
  extra?: string
  chart: React.ReactNode
}

function KPICard({ label, value, delta, positivo, extra, chart }: KPICardProps) {
  return (
    <div style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRight: '1px solid #E5E7EB' }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: '#6B7280', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {label}
          <span style={{ color: '#9CA3AF', fontSize: 13, letterSpacing: 1 }}>···</span>
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#111827', letterSpacing: '-0.02em', marginBottom: 7, lineHeight: 1 }}>{value}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 2, fontWeight: 600,
            padding: '2px 6px', borderRadius: 99,
            color: positivo ? '#16A34A' : '#DC2626',
            background: positivo ? '#DCFCE7' : '#FEF2F2',
          }}>
            {positivo ? '↑' : '↑'} {delta}
          </span>
          <span style={{ color: '#9CA3AF' }}>{extra ?? 'VS mes anterior'}</span>
        </div>
      </div>
      <div style={{ flexShrink: 0, marginLeft: 8 }}>{chart}</div>
    </div>
  )
}

// Mini bar chart for KPI
function MiniBarChart({ color1, color2 }: { color1: string; color2: string }) {
  const heights = [60, 45, 55, 35, 85]
  return (
    <svg width="72" height="42" viewBox="0 0 72 42" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`g${color1.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color1} stopOpacity={0.5} />
          <stop offset="100%" stopColor={color2} />
        </linearGradient>
      </defs>
      {heights.map((h, i) => (
        <rect key={i} x={i * 14 + 2} y={42 - h * 0.42} width={9} height={h * 0.42} rx={2}
          fill={`url(#g${color1.replace('#','')})`} opacity={i === 4 ? 1 : 0.5 + i * 0.1} />
      ))}
    </svg>
  )
}

// Mini sparkline
function MiniSparkline({ color }: { color: string }) {
  return (
    <svg width="72" height="42" viewBox="0 0 72 42" preserveAspectRatio="none">
      <polyline points="0,36 14,30 28,32 42,24 56,20 72,14" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <polygon points="0,36 14,30 28,32 42,24 56,20 72,14 72,42 0,42" fill={color} fillOpacity={0.08} />
    </svg>
  )
}

// Mini donut gauge
function MiniGauge({ pct }: { pct: number }) {
  const r = 19, circ = 2 * Math.PI * r
  return (
    <svg width="72" height="42" viewBox="0 0 72 42">
      <circle cx="36" cy="21" r={r} fill="none" stroke="#E5E7EB" strokeWidth="5" />
      <circle cx="36" cy="21" r={r} fill="none" stroke="#00BCD4" strokeWidth="5"
        strokeDasharray={`${circ * pct / 100} ${circ}`} strokeDashoffset={circ * 0.25} strokeLinecap="round" />
      <circle cx="36" cy="21" r={r} fill="none" stroke="#0D2E6E" strokeWidth="5"
        strokeDasharray={`${circ * 0.2} ${circ}`} strokeDashoffset={-circ * (pct / 100 - 0.25)} strokeLinecap="round" />
      <line x1="36" y1="21" x2="52" y2="12" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="36" cy="21" r="2.5" fill="#111827" />
    </svg>
  )
}

// ── Custom tooltip for recharts ───────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#1F2937', color: '#fff', borderRadius: 10, padding: '9px 13px', fontSize: 11, minWidth: 150, boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
      <div style={{ fontWeight: 600, marginBottom: 6 }}>{label} 2026</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: p.fill }} />
          <span style={{ color: 'rgba(255,255,255,0.75)' }}>{p.name === 'ingresos' ? 'Ingresos' : 'Gastos'}: {formatCurrency(p.value)}</span>
        </div>
      ))}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
        <div style={{ width: 8, height: 2, background: '#16A34A' }} />
        <span style={{ color: 'rgba(255,255,255,0.75)' }}>PE: {formatCurrency(puntoEquilibrio)} ✓</span>
      </div>
    </div>
  )
}

// ── Badge helper ──────────────────────────────────────────────────────────────
function Badge({ children, color, bg }: { children: React.ReactNode; color: string; bg: string }) {
  return (
    <span style={{ fontSize: 9, fontWeight: 600, color, background: bg, padding: '2px 7px', borderRadius: 99 }}>
      {children}
    </span>
  )
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const kpis = mockKPIs

  return (
    <Layout title="Dashboard">
      {/* KPI Row */}
      <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', flexShrink: 0 }}>
        <KPICard
          label="Liquidez inmediata"
          value={formatNumber(kpis.liquidez.valor)}
          delta={`${kpis.liquidez.delta > 0 ? '+' : ''}${formatNumber(kpis.liquidez.delta)}`}
          positivo={kpis.liquidez.positivo}
          chart={<MiniBarChart color1="#B2EBF2" color2="#00BCD4" />}
        />
        <KPICard
          label="Días de cobro (DSO)"
          value={`${kpis.dso.valor} días`}
          delta={`+${kpis.dso.delta}`}
          positivo={kpis.dso.positivo}
          extra={`sector: ${kpis.dso.sector} días`}
          chart={<MiniSparkline color="#D97706" />}
        />
        <KPICard
          label="Burn rate"
          value={formatCurrency(kpis.burnRate.valor)}
          delta={`${kpis.burnRate.delta}%`}
          positivo={kpis.burnRate.positivo}
          chart={<MiniBarChart color1="#7986CB" color2="#0D2E6E" />}
        />
        <div style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: '#6B7280', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              Margen neto <span style={{ color: '#9CA3AF', fontSize: 13, letterSpacing: 1 }}>···</span>
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#111827', letterSpacing: '-0.02em', marginBottom: 7, lineHeight: 1 }}>{formatNumber(kpis.margenNeto.valor)}%</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontWeight: 600, padding: '2px 6px', borderRadius: 99, color: '#16A34A', background: '#DCFCE7' }}>
                ↑ {formatNumber(kpis.margenNeto.delta)}pp
              </span>
              <span style={{ color: '#9CA3AF' }}>VS mes anterior</span>
            </div>
          </div>
          <MiniGauge pct={38} />
        </div>
      </div>

      {/* Chart */}
      <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: '14px 18px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>Evolución financiera</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: '#6B7280' }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: 'linear-gradient(180deg,#B2EBF2,#00BCD4)' }} />
              Ingresos
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: '#6B7280' }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: 'linear-gradient(180deg,#7986CB,#0D2E6E)' }} />
              Gastos
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: '#16A34A' }}>
              <div style={{ width: 14, height: 0, borderTop: '2px solid #16A34A' }} />
              Punto de equilibrio
            </div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={mockEvolucion} barGap={4} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="0" stroke="#F3F4F6" vertical={false} />
            <XAxis dataKey="mes" tick={{ fontSize: 9, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 8, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={v => `€${v/1000}k`} width={36} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
            <ReferenceLine y={puntoEquilibrio} stroke="#16A34A" strokeWidth={1.5} label={{ value: 'PE', position: 'insideLeft', fontSize: 8, fill: '#16A34A', dy: -6 }} />
            <Bar dataKey="ingresos" name="ingresos" radius={[6, 6, 0, 0]} maxBarSize={42}>
              {mockEvolucion.map((_, i) => (
                <Cell key={i} fill={i === 3 ? '#00ACC1' : '#B2EBF2'} />
              ))}
            </Bar>
            <Bar dataKey="gastos" name="gastos" radius={[4, 4, 0, 0]} maxBarSize={10}>
              {mockEvolucion.map((_, i) => (
                <Cell key={i} fill={i === 3 ? '#0D2E6E' : '#7986CB'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Previsiones */}
      <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: '14px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>Previsiones</span>
          <div style={{ display: 'flex', gap: 7 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#F8F9FB', border: '1px solid #E5E7EB', borderRadius: 7, padding: '5px 9px' }}>
              <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="#9CA3AF" strokeWidth="1.5"><circle cx="7" cy="7" r="5"/><path d="M11 11l3 3"/></svg>
              <span style={{ fontSize: 10, color: '#9CA3AF' }}>Buscar</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#6B7280', background: '#fff', border: '1px solid #E5E7EB', borderRadius: 7, padding: '5px 9px', cursor: 'pointer' }}>
              <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="#6B7280" strokeWidth="1.5"><path d="M2 4h12M5 8h6"/></svg>
              Filtrar
            </div>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Concepto', 'Vencimiento', 'Categoría', 'Periodicidad', 'Importe estimado', 'Estado', 'Días restantes', ''].map(h => (
                <th key={h} style={{ fontSize: 10, fontWeight: 600, color: '#9CA3AF', textAlign: 'left', padding: '5px 8px', borderBottom: '1px solid #F3F4F6' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockPrevisiones.map(p => (
              <tr key={p.id}>
                <td style={{ padding: '7px 8px', borderBottom: '1px solid #F3F4F6' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: 7, flexShrink: 0,
                      background: p.categoria === 'Fiscal' ? '#FEF3C7' : p.categoria === 'Gasto fijo' ? '#FEE2E2' : '#F5F3FF',
                      color: p.categoria === 'Fiscal' ? '#D97706' : p.categoria === 'Gasto fijo' ? '#DC2626' : '#7C3AED',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700
                    }}>
                      {p.categoria === 'Fiscal' ? '€' : p.categoria === 'Gasto fijo' ? '↓' : 'S'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 11, color: '#111827' }}>{p.concepto}</div>
                      <div style={{ fontSize: 10, color: '#9CA3AF' }}>{p.detalle}</div>
                    </div>
                  </div>
                </td>
                <td style={{ fontSize: 11, color: '#6B7280', padding: '7px 8px', borderBottom: '1px solid #F3F4F6' }}>{formatDate(p.vencimiento)}</td>
                <td style={{ padding: '7px 8px', borderBottom: '1px solid #F3F4F6' }}>
                  <Badge
                    color={p.categoria === 'Fiscal' ? '#D97706' : p.categoria === 'Gasto fijo' ? '#DC2626' : '#7C3AED'}
                    bg={p.categoria === 'Fiscal' ? '#FFFBEB' : p.categoria === 'Gasto fijo' ? '#FEF2F2' : '#F5F3FF'}
                  >
                    {p.categoria}
                  </Badge>
                </td>
                <td style={{ fontSize: 11, color: '#6B7280', padding: '7px 8px', borderBottom: '1px solid #F3F4F6' }}>{p.periodicidad}</td>
                <td style={{ fontSize: 11, fontWeight: 600, padding: '7px 8px', borderBottom: '1px solid #F3F4F6', color: p.categoria === 'Fiscal' ? '#D97706' : '#DC2626' }}>
                  {formatCurrency(p.importe)}
                </td>
                <td style={{ padding: '7px 8px', borderBottom: '1px solid #F3F4F6' }}>
                  <Badge
                    color={p.estado === 'Pendiente' ? '#D97706' : p.estado === 'Estimado' ? '#6B7280' : '#6B7280'}
                    bg={p.estado === 'Pendiente' ? '#FFFBEB' : '#F3F4F6'}
                  >
                    {p.estado}
                  </Badge>
                </td>
                <td style={{ padding: '7px 8px', borderBottom: '1px solid #F3F4F6' }}>
                  <span style={{ fontSize: 10, fontWeight: 500, color: p.urgente ? '#DC2626' : p.diasRestantes <= 30 ? '#D97706' : '#6B7280' }}>
                    {p.diasRestantes} días
                  </span>
                </td>
                <td style={{ fontSize: 14, color: '#9CA3AF', padding: '7px 8px', borderBottom: '1px solid #F3F4F6', letterSpacing: 1, cursor: 'pointer' }}>···</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  )
}
