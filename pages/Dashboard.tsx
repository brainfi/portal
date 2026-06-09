import { useState, useMemo } from 'react'
import Layout from '@/components/Layout'
import { useDatos } from '@/contexts/DataContext'
import { buildResumen } from '@/lib/contabilidad'
import {
  LineChart, Line, XAxis, YAxis,
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
  const names: Record<string, string> = { ingresos: 'Ingresos', ebitda: 'EBITDA', margenEbitda: 'Margen EBITDA' }
  return (
    <div style={{ background: '#fff', border: '1px solid #E8E8EC', borderRadius: 10, padding: '10px 14px', fontSize: 12 }}>
      <div style={{ fontWeight: 600, color: '#1a1a1a', marginBottom: 6 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
          <div style={{ width: 7, height: 7, borderRadius: 2, background: p.stroke }} />
          <span style={{ color: '#666' }}>{names[p.dataKey]}: {p.dataKey === 'margenEbitda' ? `${p.value}%` : fmt(p.value)}</span>
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
          <div style={{ width: 7, height: 7, borderRadius: 2, background: p.stroke }} />
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

  const dias = diasRestantesMes()
  const [filtroOpen, setFiltroOpen] = useState(false)
  const [filtro, setFiltro] = useState<string>('anual')   // 'anual' | ym ('2026-05')
  const opciones = [{ key: 'anual', label: 'Este año' }, ...[...evol].reverse().map(e => ({ key: e.ym, label: e.mes }))]
  const filtroLabel = filtro === 'anual' ? 'Este año' : (evol.find(e => e.ym === filtro)?.mes ?? 'Mes')

  // Cifras según el filtro
  const mes = filtro === 'anual' ? null : evol.find(e => e.ym === filtro)
  const ingresosVal  = mes ? mes.ingresos : resumen.ingresos
  const ebitdaVal    = mes ? mes.ebitda   : resumen.ebitda
  const margenVal    = ingresosVal > 0 ? ((ebitdaVal / ingresosVal) * 100).toFixed(1) + '%' : '—'
  const tesoreriaVal = mes ? mes.tesoreria : resumen.tesoreria
  const dsoVal       = mes ? mes.dso       : resumen.dso

  // Burn rate (media de gastos de los meses con gasto) y runway
  const conGasto = evol.filter(e => e.gastos > 0)
  const burn = conGasto.length ? conGasto.reduce((a, e) => a + e.gastos, 0) / conGasto.length : 0
  const runway = burn > 0 ? Math.round(resumen.tesoreria / (burn / 30)) : null

  const card: React.CSSProperties = { background: '#fff', borderRadius: 14, border: '1px solid #E8E8EC' }

  // ── Estados ──
  if (loading && !data) return <Layout title="Resumen"><Aviso icon="ti-loader-2" texto="Cargando tus datos…" /></Layout>
  if (error?.code === 'no_sheet') return <Layout title="Resumen"><Aviso icon="ti-table" texto="Conecta tu hoja de Google en Ajustes para ver tu resumen." /></Layout>
  if (error) return <Layout title="Resumen"><Aviso icon="ti-alert-triangle" texto={`No se pudieron cargar los datos: ${error.message}`} /></Layout>
  if (!evol.length) return <Layout title="Resumen"><Aviso icon="ti-table" texto="Tu pestaña Diario no tiene apuntes todavía, o no se reconocen las cuentas." /></Layout>

  return (
    <Layout title="Resumen">
      <style>{`
        @media (max-width:900px){ .dash-main{grid-template-columns:1fr!important} }
      `}</style>

      {filtroOpen && <div onClick={() => setFiltroOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />}

      {/* Encabezado */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a', letterSpacing: '-0.4px', marginBottom: 3 }}>Resumen</div>
          <div style={{ fontSize: 13, color: '#888' }}>Visión consolidada del estado financiero de tu empresa</div>
        </div>
        <div style={{ position: 'relative' }}>
          <button onClick={() => setFiltroOpen(o => !o)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 14px', fontSize: 13, fontWeight: 500, border: '1px solid #E8E8EC', borderRadius: 10, background: '#F4F5F7', color: '#1a1a1a', cursor: 'pointer', fontFamily: 'inherit' }}>
            {filtroLabel}
            <i className="ti ti-chevron-down" style={{ fontSize: 14, color: '#888' }} aria-hidden="true" />
          </button>
          {filtroOpen && (
            <div style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 50, background: '#fff', border: '1px solid #E8E8EC', borderRadius: 12, padding: '6px', minWidth: 180, maxHeight: 300, overflowY: 'auto', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              {opciones.map(o => (
                <button key={o.key} type="button"
                  onClick={() => { setFiltro(o.key); setFiltroOpen(false) }}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '8px 12px', fontSize: 13, border: 'none', borderRadius: 7, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', background: filtro === o.key ? '#EEF1FD' : 'transparent', color: filtro === o.key ? '#4361EE' : '#1a1a1a', fontWeight: filtro === o.key ? 600 : 400 }}>
                  {o.label}
                  {filtro === o.key && <i className="ti ti-check" style={{ fontSize: 13 }} aria-hidden="true" />}
                </button>
              ))}
            </div>
          )}
        </div>
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
        <div className="dash-main" style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <KPICard lbl="Ingresos" val={fmt(ingresosVal)}
              badge="neutral" badgeLbl="sin plan" sub={filtroLabel}
              icon="ti-trending-up" iconBg="#F0F9F4" iconColor="#2DC653"
              comparacion="Define tu plan en Presupuesto para comparar" />
            <KPICard lbl="EBITDA" val={fmt(ebitdaVal)}
              badge="neutral" badgeLbl="sin plan" sub={`Margen ${margenVal}`}
              icon="ti-chart-pie" iconBg="#FEF2F2" iconColor="#EF4444" />
            <KPICard lbl="Margen EBITDA" val={margenVal}
              badge="neutral" badgeLbl="EBITDA / Ingresos" sub="Explotación"
              icon="ti-percentage" iconBg="#FFF8E6" iconColor="#F4A100" />
          </div>
          <div style={{ ...card, padding: '20px 24px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#B0B7C3', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 2 }}>Evolución</div>
              <div style={{ fontSize: 12, color: '#888' }}>Ingresos · EBITDA · Margen EBITDA</div>
            </div>
            <div style={{ display: 'flex', gap: 14, marginBottom: 14, flexWrap: 'wrap' }}>
              {[{ color: '#4361EE', lbl: 'Ingresos', dash: false }, { color: '#F4A100', lbl: 'EBITDA', dash: false }, { color: '#2DC653', lbl: 'Margen EBITDA (%)', dash: true }].map((l, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <svg width="16" height="6"><line x1="0" y1="3" x2="16" y2="3" stroke={l.color} strokeWidth="2" strokeDasharray={l.dash ? '4 2' : undefined} /></svg>
                  <span style={{ fontSize: 10, color: '#888' }}>{l.lbl}</span>
                </div>
              ))}
            </div>
            <div style={{ flex: 1, minHeight: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={evol} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F2" vertical={false} />
                  <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#B0B7C3' }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="eur" tick={{ fontSize: 11, fill: '#B0B7C3' }} axisLine={false} tickLine={false} tickFormatter={fmtK} width={40} />
                  <YAxis yAxisId="pct" orientation="right" tick={{ fontSize: 11, fill: '#B0B7C3' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} width={40} />
                  <Tooltip content={<TooltipPYG />} cursor={{ stroke: '#E8E8EC', strokeWidth: 1 }} />
                  <Line yAxisId="eur" type="monotone" dataKey="ingresos"     stroke="#4361EE" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                  <Line yAxisId="eur" type="monotone" dataKey="ebitda"       stroke="#F4A100" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                  <Line yAxisId="pct" type="monotone" dataKey="margenEbitda" stroke="#2DC653" strokeWidth={2}   dot={{ r: 3 }} strokeDasharray="5 3" activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Sección 2: Tesorería */}
      <div>
        <div style={{ fontSize: 9, fontWeight: 700, color: '#B0B7C3', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>
          Tesorería
        </div>
        <div className="dash-main" style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
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
          <div style={{ ...card, padding: '20px 24px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#B0B7C3', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 2 }}>Evolución</div>
              <div style={{ fontSize: 12, color: '#888' }}>Tesorería acumulada · DSO</div>
            </div>
            <div style={{ display: 'flex', gap: 14, marginBottom: 14, flexWrap: 'wrap' }}>
              {[{ color: '#4361EE', lbl: 'Tesorería' }, { color: '#EF4444', lbl: 'DSO (días)' }].map((l, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <svg width="16" height="6"><line x1="0" y1="3" x2="16" y2="3" stroke={l.color} strokeWidth="2" /></svg>
                  <span style={{ fontSize: 10, color: '#888' }}>{l.lbl}</span>
                </div>
              ))}
            </div>
            <div style={{ flex: 1, minHeight: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={evol} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F2" vertical={false} />
                  <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#B0B7C3' }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="eur" tick={{ fontSize: 11, fill: '#B0B7C3' }} axisLine={false} tickLine={false} tickFormatter={fmtK} width={40} />
                  <YAxis yAxisId="dso" orientation="right" tick={{ fontSize: 11, fill: '#B0B7C3' }} axisLine={false} tickLine={false} width={32} />
                  <Tooltip content={<TooltipTes />} cursor={{ stroke: '#E8E8EC', strokeWidth: 1 }} />
                  <Line yAxisId="eur" type="monotone" dataKey="tesoreria" stroke="#4361EE" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                  <Line yAxisId="dso" type="monotone" dataKey="dso"       stroke="#EF4444" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
