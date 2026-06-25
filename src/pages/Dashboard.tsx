import { useState, useMemo, useEffect } from 'react'
import Layout from '@/components/Layout'
import { useDatos } from '@/contexts/DataContext'
import { buildResumen, realPorCuenta } from '@/lib/contabilidad'
import { getPlan, type PartidaPlan } from '@/lib/presupuesto'
import { usePeriodo } from '@/hooks/usePeriodo'
import PeriodoFilter from '@/components/PeriodoFilter'
import {
  ComposedChart, Bar, Line, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function diasRestantesMes(): number {
  const hoy = new Date()
  const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0)
  return finMes.getDate() - hoy.getDate()
}
function fmt(n: number) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}
function fmtK(v: number) {
  return Math.abs(v) >= 1000 ? `${Math.round(v / 1000)}k` : `${Math.round(v)}`
}

function Badge({ trend, label }: { trend: 'up' | 'down' | 'neutral'; label: string }) {
  const cfg = {
    up:      { bg: '#d4f5df', color: '#1a7a3a', icon: '↗' },
    down:    { bg: '#FEF2F2', color: '#b91c1c', icon: '↘' },
    neutral: { bg: '#F4F5F7', color: '#888',    icon: '→' },
  }[trend]
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 99, background: cfg.bg, color: cfg.color, whiteSpace: 'nowrap' }}>
      {cfg.icon} {label}
    </span>
  )
}

function TooltipPYG({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const names: Record<string, string> = { ingresos: 'Ingresos', gastos: 'Gastos', ebitda: 'EBITDA' }
  return (
    <div style={{ background: '#fff', border: '1px solid #E8E8EC', borderRadius: 10, padding: '10px 14px', fontSize: 12 }}>
      <div style={{ fontWeight: 600, color: '#1a1a1a', marginBottom: 6 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
          <div style={{ width: 7, height: 7, borderRadius: 2, background: p.color || p.stroke || p.fill }} />
          <span style={{ color: '#666' }}>{names[p.dataKey]}: {fmt(p.value)}</span>
        </div>
      ))}
    </div>
  )
}
function TooltipTes({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const names: Record<string, string> = { tesoreria: 'Tesorería', dso: 'DSO' }
  return (
    <div style={{ background: '#fff', border: '1px solid #E8E8EC', borderRadius: 10, padding: '10px 14px', fontSize: 12 }}>
      <div style={{ fontWeight: 600, color: '#1a1a1a', marginBottom: 6 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
          <div style={{ width: 7, height: 7, borderRadius: 2, background: p.color || p.stroke || p.fill }} />
          <span style={{ color: '#666' }}>{names[p.dataKey]}: {p.dataKey === 'dso' ? `${p.value} d` : fmt(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

function KPICard({ lbl, val, badge, badgeLbl, sub, icon, iconBg, iconColor, comparacion }:
  { lbl: string; val: string; badge: 'up' | 'down' | 'neutral'; badgeLbl: string; sub: string; icon: string; iconBg: string; iconColor: string; comparacion?: string }) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E8E8EC', padding: '14px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
        <div style={{ fontSize: 9, fontWeight: 600, color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: '0.1em', lineHeight: 1.4 }}>{lbl}</div>
        <div style={{ width: 26, height: 26, borderRadius: 7, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <i className={`ti ${icon}`} style={{ fontSize: 12, color: iconColor }} aria-hidden="true" />
        </div>
      </div>
      <div style={{ fontSize: 22, fontWeight: 400, color: '#1a1a1a', letterSpacing: '-0.4px', margin: '6px 0 6px' }}>{val}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        <Badge trend={badge} label={badgeLbl} />
        <span style={{ fontSize: 10, color: '#B0B7C3' }}>{sub}</span>
      </div>
      {comparacion && (
        <div style={{ marginTop: 6, fontSize: 10, color: '#B0B7C3', borderTop: '1px solid #F4F5F7', paddingTop: 6 }}>{comparacion}</div>
      )}
    </div>
  )
}

function Aviso({ icon, texto }: { icon: string; texto: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '80px 24px', textAlign: 'center' }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: '#EEF1FD', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <i className={`ti ${icon}`} style={{ fontSize: 24, color: '#4361EE' }} aria-hidden="true" />
      </div>
      <div style={{ fontSize: 14, color: '#555', maxWidth: 380, lineHeight: 1.5 }}>{texto}</div>
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function Dashboard() {
  const { data, loading, error } = useDatos()
  const resumen = useMemo(() => buildResumen(data?.diario ?? []), [data])
  const evol = resumen.evolucion
  const [planPartidas, setPlanPartidas] = useState<PartidaPlan[]>([])
  useEffect(() => { getPlan().then(p => setPlanPartidas(p ?? [])).catch(() => {}) }, [])

  const dias = diasRestantesMes()

  // ── Filtro de periodo compartido (mes · trimestre · anual) ──
  const periodos = useMemo(() => evol.map(e => ({ ym: e.ym, label: e.mes })), [evol])
  const { periodo, setPeriodo, open, setOpen, yms, label: filtroLabel } = usePeriodo(periodos, 'anual')

  const esAnual = periodo === 'anual'
  const sel = evol.filter(e => yms.includes(e.ym))         // meses que abarca el periodo
  const ultimo = sel.length ? sel[sel.length - 1] : null   // último mes (para saldos de fin de periodo)

  // Flujos (Ingresos, EBITDA): se suman. Para 'anual' usamos el agregado precalculado.
  const ingresosVal  = esAnual ? resumen.ingresos : sel.reduce((a, e) => a + e.ingresos, 0)
  const ebitdaVal    = esAnual ? resumen.ebitda   : sel.reduce((a, e) => a + e.ebitda, 0)
  const margenVal    = ingresosVal > 0 ? ((ebitdaVal / ingresosVal) * 100).toFixed(1) + '%' : '—'
  // Saldos de fin de periodo (Tesorería, DSO): NO se suman -> último mes del periodo.
  const tesoreriaVal = esAnual ? resumen.tesoreria : (ultimo ? ultimo.tesoreria : resumen.tesoreria)
  const dsoVal       = esAnual ? resumen.dso       : (ultimo ? ultimo.dso : resumen.dso)

  // Burn rate (media de gastos de los meses con gasto) y runway
  const conGasto = evol.filter(e => e.gastos > 0)
  const burn = conGasto.length ? conGasto.reduce((a, e) => a + e.gastos, 0) / conGasto.length : 0
  const runway = burn > 0 ? Math.round(resumen.tesoreria / (burn / 30)) : null

  // ── Comparativa vs plan (plan guardado en Supabase) ──
  const hayPlan = planPartidas.length > 0
  const mesesData = evol.filter(e => e.ingresos > 0 || e.gastos > 0).map(e => parseInt(e.ym.slice(5, 7), 10) - 1)
  const idxPeriodo = esAnual ? mesesData : sel.map(e => parseInt(e.ym.slice(5, 7), 10) - 1)
  const planDe = (tipo: 'ingreso' | 'gasto') => planPartidas
    .filter(p => p.tipo === tipo)
    .reduce((a, p) => a + idxPeriodo.reduce((sm, mi) => sm + (p.planMensual[mi] ?? 0), 0), 0)
  const ingresosPlan = planDe('ingreso')
  const ebitdaPlan = ingresosPlan - planDe('gasto')
  // ── Tabla de presupuesto: partidas con plan anual > 0, real por cuenta ──
  const filasPpto = useMemo(() => planPartidas
    .filter(p => (p.planAnual ?? 0) > 0)
    .map(p => {
      const plan = idxPeriodo.reduce((sm, mi) => sm + (p.planMensual[mi] ?? 0), 0)
      const real = realPorCuenta(data?.diario ?? [], p.cuentaCodigo, p.tipo, yms)
      const desviacion = real - plan
      const favorable = p.tipo === 'ingreso' ? real >= plan : real <= plan
      const cumplimiento = plan !== 0 ? (real / plan) * 100 : 0
      return { ...p, plan, real, desviacion, favorable, cumplimiento }
    }), [planPartidas, idxPeriodo, data, yms])

  const totPptoIng = filasPpto.filter(f => f.tipo === 'ingreso')
  const totPptoGas = filasPpto.filter(f => f.tipo === 'gasto')
  const sumPlan = (arr: typeof filasPpto) => arr.reduce((a, f) => a + f.plan, 0)
  const sumReal = (arr: typeof filasPpto) => arr.reduce((a, f) => a + f.real, 0)
  const ebitdaPptoPlan = sumPlan(totPptoIng) - sumPlan(totPptoGas)
  const ebitdaPptoReal = sumReal(totPptoIng) - sumReal(totPptoGas)
  const deltaVsPlan = (real: number, plan: number): { badge: 'up' | 'down' | 'neutral'; lbl: string } => {
    if (!hayPlan || plan === 0) return { badge: 'neutral', lbl: 'sin plan' }
    const d = ((real - plan) / Math.abs(plan)) * 100
    return { badge: d >= 0 ? 'up' : 'down', lbl: `${d >= 0 ? '+' : ''}${d.toFixed(0)}% vs plan` }
  }
  const ingDelta = deltaVsPlan(ingresosVal, ingresosPlan)
  const ebDelta = deltaVsPlan(ebitdaVal, ebitdaPlan)

  const card: React.CSSProperties = { background: '#fff', borderRadius: 14, border: '1px solid #E8E8EC' }

  // ── Estados ──
  if (loading && !data) return <Layout title="Resumen"><Aviso icon="ti-loader-2" texto="Cargando tus datos…" /></Layout>
  if (error?.code === 'no_sheet') return <Layout title="Resumen"><Aviso icon="ti-table" texto="Conecta tu hoja de Google en Ajustes para ver tu resumen." /></Layout>
  if (error) return <Layout title="Resumen"><Aviso icon="ti-alert-triangle" texto={`No se pudieron cargar los datos: ${error.message}`} /></Layout>
  if (!evol.length) return <Layout title="Resumen"><Aviso icon="ti-table" texto="Tu pestaña Diario no tiene apuntes todavía, o no se reconocen las cuentas." /></Layout>

  return (
    <Layout title="Resumen">
      <style>{`
        @media (max-width:768px){ .kpi-row{grid-template-columns:1fr!important} }
      `}</style>

      {/* Encabezado */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a', letterSpacing: '-0.4px', marginBottom: 3 }}>Resumen</div>
          <div style={{ fontSize: 13, color: '#888' }}>Visión consolidada del estado financiero de tu empresa</div>
        </div>
        <PeriodoFilter value={periodo} open={open} setOpen={setOpen} onChange={setPeriodo} meses={periodos} />
      </div>

      {/* CFO Brainfi */}
      <div style={{ background: '#EEF1FD', borderRadius: 12, border: '1px solid #C7D2F8', padding: '14px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: '#4361EE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="ti ti-file-analytics" style={{ fontSize: 15, color: '#fff' }} aria-hidden="true" />
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#1a1a1a' }}>CFO Brainfi</div>
              <div style={{ fontSize: 10, color: '#4361EE', fontWeight: 500 }}>Informe mensual personalizado</div>
            </div>
          </div>
          <div style={{ background: '#4361EE', borderRadius: 99, padding: '4px 14px', flexShrink: 0 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{dias}d</span>
          </div>
          <div style={{ flex: 1, minWidth: 200, fontSize: 12, color: '#1a1a1a', lineHeight: 1.5 }}>
            Faltan <strong style={{ color: '#4361EE' }}>{dias} días</strong> para tu informe personalizado de este mes. Si tienes dudas, contáctanos con el botón.
          </div>
          <a href="mailto:hola@brainfi.io"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', fontSize: 12, fontWeight: 600, border: 'none', borderRadius: 8, background: '#4361EE', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>
            <i className="ti ti-mail" style={{ fontSize: 13 }} aria-hidden="true" />
            Contactar
          </a>
        </div>
      </div>

      {/* Sección 1: P&G */}
      <div>
        <div style={{ fontSize: 9, fontWeight: 700, color: '#B0B7C3', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>
          Cuenta de pérdidas y ganancias · {filtroLabel}
        </div>
        <div className="kpi-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 14 }}>
          <KPICard lbl="Ingresos" val={fmt(ingresosVal)}
            badge={ingDelta.badge} badgeLbl={ingDelta.lbl} sub={filtroLabel}
            icon="ti-trending-up" iconBg="#F0F9F4" iconColor="#2DC653"
            comparacion={hayPlan ? `Plan ${fmt(ingresosPlan)} · real ${fmt(ingresosVal)}` : 'Define tu plan en Presupuesto para comparar'} />
          <KPICard lbl="EBITDA" val={fmt(ebitdaVal)}
            badge={ebDelta.badge} badgeLbl={ebDelta.lbl} sub={`Margen ${margenVal}`}
            icon="ti-chart-pie" iconBg="#FEF2F2" iconColor="#EF4444"
            comparacion={hayPlan ? `Plan ${fmt(ebitdaPlan)} · real ${fmt(ebitdaVal)}` : undefined} />
          <KPICard lbl="Margen EBITDA" val={margenVal}
            badge="neutral" badgeLbl="EBITDA / Ingresos" sub="Explotación"
            icon="ti-percentage" iconBg="#FFF8E6" iconColor="#F4A100" />
        </div>
        <div style={{ ...card, padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#B0B7C3', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 2 }}>Evolución mensual</div>
              <div style={{ fontSize: 12, color: '#888' }}>Ingresos y gastos · EBITDA</div>
            </div>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              {[{ color: '#4361EE', lbl: 'Ingresos', t: 'bar' }, { color: '#D4DBF0', lbl: 'Gastos', t: 'bar' }, { color: '#2DC653', lbl: 'EBITDA', t: 'line' }].map((l, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  {l.t === 'bar'
                    ? <span style={{ width: 10, height: 10, borderRadius: 3, background: l.color }} />
                    : <svg width="16" height="6"><line x1="0" y1="3" x2="16" y2="3" stroke={l.color} strokeWidth="2.5" /></svg>}
                  <span style={{ fontSize: 11, color: '#888' }}>{l.lbl}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={evol} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barGap={4} barCategoryGap="26%">
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F2" vertical={false} />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#B0B7C3' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#B0B7C3' }} axisLine={false} tickLine={false} tickFormatter={fmtK} width={42} />
                <Tooltip content={<TooltipPYG />} cursor={{ fill: '#F4F5F7' }} />
                <Bar dataKey="ingresos" name="Ingresos" fill="#4361EE" radius={[5, 5, 0, 0]} maxBarSize={26} />
                <Bar dataKey="gastos" name="Gastos" fill="#D4DBF0" radius={[5, 5, 0, 0]} maxBarSize={26} />
                <Line type="monotone" dataKey="ebitda" name="EBITDA" stroke="#2DC653" strokeWidth={2.5} dot={{ r: 3, fill: '#2DC653', strokeWidth: 0 }} activeDot={{ r: 5 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Sección 2: Tesorería */}
      <div>
        <div style={{ fontSize: 9, fontWeight: 700, color: '#B0B7C3', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>
          Tesorería · {filtroLabel}
        </div>
        <div className="kpi-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 14 }}>
          <KPICard lbl="Tesorería" val={fmt(tesoreriaVal)}
            badge="neutral" badgeLbl="saldo real" sub="Bancos y caja (grupo 57)"
            icon="ti-building-bank" iconBg="#EEF1FD" iconColor="#4361EE"
            comparacion={`Pendiente de cobro: ${fmt(resumen.pendienteCobro)} · de pago: ${fmt(resumen.pendientePago)}`} />
          <KPICard lbl="DSO medio" val={`${dsoVal} días`}
            badge="neutral" badgeLbl="días de cobro" sub="Sobre saldo de clientes"
            icon="ti-clock" iconBg="#FEF2F2" iconColor="#EF4444" />
          <KPICard lbl="Runway" val={runway != null ? `${runway} días` : '—'}
            badge="neutral" badgeLbl="estimado" sub="Sin nuevas ventas"
            icon="ti-shield" iconBg="#FFF8E6" iconColor="#F4A100"
            comparacion={burn > 0 ? `Burn rate mensual: ${fmt(Math.round(burn))}` : 'Sin gastos registrados aún'} />
        </div>
        <div style={{ ...card, padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#B0B7C3', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 2 }}>Evolución de la tesorería</div>
              <div style={{ fontSize: 12, color: '#888' }}>Saldo de bancos y caja, mes a mes</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: '#4361EE' }} />
              <span style={{ fontSize: 11, color: '#888' }}>Tesorería</span>
            </div>
          </div>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={evol} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gTes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4361EE" stopOpacity={0.26} />
                    <stop offset="100%" stopColor="#4361EE" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F2" vertical={false} />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#B0B7C3' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#B0B7C3' }} axisLine={false} tickLine={false} tickFormatter={fmtK} width={42} />
                <Tooltip content={<TooltipTes />} cursor={{ stroke: '#C7D2F8', strokeWidth: 1, strokeDasharray: '4 3' }} />
                <Area type="monotone" dataKey="tesoreria" name="Tesorería" stroke="#4361EE" strokeWidth={2.5} fill="url(#gTes)" dot={false} activeDot={{ r: 5, fill: '#4361EE', stroke: '#fff', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    {/* ── PRESUPUESTO: plan vs real por partida ── */}
      {filasPpto.length > 0 && (
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, color: '#B0B7C3', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>
            Presupuesto · {filtroLabel}
          </div>
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E8E8EC', padding: '20px 24px' }}>
            <style>{`@media (max-width: 768px){ .dpto-hide{ display:none !important } .dpto-row{ grid-template-columns: 1.6fr 1fr 1.1fr !important } }`}</style>
            <div className="dpto-row" style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr 1fr 1.1fr 70px', fontSize: 10, color: '#B0B7C3', fontWeight: 600, paddingBottom: 10, borderBottom: '1px solid #ECEEF3' }}>
              <span>Partida</span>
              <span className="dpto-hide" style={{ textAlign: 'right', paddingRight: 14 }}>Plan</span>
              <span style={{ textAlign: 'right', paddingRight: 14 }}>Real</span>
              <span style={{ textAlign: 'right', paddingRight: 14 }}>Desviación</span>
              <span className="dpto-hide" style={{ textAlign: 'right' }}>Ejec.</span>
            </div>

            {[['Ingresos', totPptoIng], ['Gastos', totPptoGas]].map(([titulo, items]: any) => items.length > 0 && (
              <div key={titulo}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#B0B7C3', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '12px 0 4px' }}>{titulo}</div>
                {items.map((f: any) => (
                  <div key={f.id} className="dpto-row" style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr 1fr 1.1fr 70px', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #F4F5F7' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <div style={{ width: 26, height: 26, borderRadius: 7, background: (f.color || '#4361EE') + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <i className={`ti ${f.icono}`} aria-hidden="true" style={{ fontSize: 13, color: f.color || '#4361EE' }} />
                      </div>
                      <span style={{ fontSize: 13, color: '#1a1a1a' }}>{f.categoria}</span>
                    </div>
                    <span className="dpto-hide" style={{ fontSize: 12, color: '#888', textAlign: 'right', paddingRight: 14 }}>{fmt(f.plan)}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#1a1a1a', textAlign: 'right', paddingRight: 14 }}>{fmt(f.real)}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: f.favorable ? '#1a7a3a' : '#b01a2b', textAlign: 'right', paddingRight: 14 }}>{(f.desviacion >= 0 ? '+' : '−') + fmt(Math.abs(f.desviacion))}</span>
                    <span className="dpto-hide" style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: f.favorable ? '#1a7a3a' : '#b01a2b', background: f.favorable ? '#d4f5df' : '#fdd', padding: '2px 7px', borderRadius: 99 }}>{isFinite(f.cumplimiento) ? Math.round(f.cumplimiento) + '%' : '—'}</span>
                    </span>
                  </div>
                ))}
              </div>
            ))}

            <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr 1fr 1.1fr 70px', alignItems: 'center', padding: '13px 0 2px', marginTop: 4, borderTop: '1px solid #ECEEF3' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a' }}>EBITDA</span>
              <span className="dpto-hide" style={{ fontSize: 12, fontWeight: 600, color: '#888', textAlign: 'right', paddingRight: 14 }}>{fmt(ebitdaPptoPlan)}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', textAlign: 'right', paddingRight: 14 }}>{fmt(ebitdaPptoReal)}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: (ebitdaPptoReal >= ebitdaPptoPlan) ? '#1a7a3a' : '#b01a2b', textAlign: 'right', paddingRight: 14 }}>{((ebitdaPptoReal - ebitdaPptoPlan) >= 0 ? '+' : '−') + fmt(Math.abs(ebitdaPptoReal - ebitdaPptoPlan))}</span>
              <span></span>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
