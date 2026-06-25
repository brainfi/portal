import Layout from '@/components/Layout'
import { useNavigate } from 'react-router-dom'
import { useMemo, useState, useEffect } from 'react'
import { useDatos } from '@/contexts/DataContext'
import { usePeriodo } from '@/hooks/usePeriodo'
import PeriodoFilter from '@/components/PeriodoFilter'
import { buildResumen, buildPresupuestoPYG, type LineaPYG } from '@/lib/contabilidad'
import { getPlan, type PartidaPlan } from '@/lib/presupuesto'

const card: React.CSSProperties = { background: '#fff', borderRadius: 16, border: '1px solid #E8E8EC' }
const sectionLbl: React.CSSProperties = { fontSize: 9, fontWeight: 700, color: '#B0B7C3', textTransform: 'uppercase', letterSpacing: '0.12em' }

function fmt(n: number) {
  return Math.round(n).toLocaleString('es-ES') + ' €'
}
function fmtDelta(n: number) {
  const s = n >= 0 ? '+' : '−'
  return `${s}${Math.abs(Math.round(n)).toLocaleString('es-ES')} €`
}
function pct(n: number) {
  if (!isFinite(n)) return '—'
  return `${Math.round(n)}%`
}

export default function Presupuesto() {
  const navigate = useNavigate()
  const { data } = useDatos()
  const [plan, setPlan] = useState<PartidaPlan[] | null>(null)
  const [cargandoPlan, setCargandoPlan] = useState(true)

  useEffect(() => {
    getPlan().then(setPlan).catch(() => setPlan(null)).finally(() => setCargandoPlan(false))
  }, [])

  // Histórico real para alimentar el filtro de periodo (mismos ym que el resto del portal)
  const resumen = useMemo(() => buildResumen(data?.diario ?? []), [data])
  const periodos = useMemo(() => resumen.evolucion.map(e => ({ ym: e.ym, label: e.mes })), [resumen])
  const { periodo, setPeriodo, open, setOpen, yms, label: filtroLabel } = usePeriodo(periodos, 'anual')

  const lineas: LineaPYG[] = useMemo(() => {
    if (!plan) return []
    return buildPresupuestoPYG(data?.diario ?? [], plan, yms)
  }, [data, plan, yms])

  // ── Sin plan configurado ──
  if (!cargandoPlan && (!plan || plan.length === 0)) {
    return (
      <Layout title="Presupuesto">
        <div style={{ ...card, padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: '#EEF1FD', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
            <i className="ti ti-table" aria-hidden="true" style={{ fontSize: 22, color: '#4361EE' }} />
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a', marginBottom: 6 }}>Aún no has definido tu presupuesto</div>
          <div style={{ fontSize: 13, color: '#888', maxWidth: 420, margin: '0 auto 18px' }}>
            Configura tus objetivos por categoría para comparar tu plan con la cuenta de resultados real.
          </div>
          <button onClick={() => navigate('/presupuesto/configurar')} style={{ padding: '10px 20px', fontSize: 13, fontWeight: 600, color: '#fff', background: '#4361EE', border: 'none', borderRadius: 9, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
            Configurar presupuesto →
          </button>
        </div>
      </Layout>
    )
  }

  if (cargandoPlan || !lineas.length) {
    return (
      <Layout title="Presupuesto">
        <div style={{ ...card, padding: '48px 24px', textAlign: 'center', fontSize: 13, color: '#888' }}>Cargando presupuesto…</div>
      </Layout>
    )
  }

  const ingresos = lineas.find(l => l.clave === 'ingresos')!
  const ebitda = lineas.find(l => l.clave === 'ebitda')!
  const margenRealPct = ingresos.real !== 0 ? (ebitda.real / ingresos.real) * 100 : 0

  // KPIs cabecera: Ingresos, EBITDA, Margen — al estilo Dashboard
  const kpis = [
    { lbl: 'Ingresos', linea: ingresos, icon: 'ti-trending-up', bg: '#F0F9F4', col: '#2DC653' },
    { lbl: 'EBITDA', linea: ebitda, icon: 'ti-chart-pie', bg: '#FEF2F2', col: '#EF4444' },
  ]

  return (
    <Layout title="Presupuesto">
      <style>{`
        @media (max-width: 768px) {
          .ppto-kpi { grid-template-columns: 1fr !important; }
          .pyg-hide { display: none !important; }
          .pyg-row { grid-template-columns: 1.4fr 1fr 1.1fr !important; }
        }
      `}</style>

      {/* CABECERA con filtro compartido */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={sectionLbl}>Presupuesto vs Real · {filtroLabel}</div>
        <PeriodoFilter value={periodo} open={open} setOpen={setOpen} onChange={setPeriodo} meses={periodos} />
      </div>

      {/* KPIs */}
      <div className="ppto-kpi" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
        {kpis.map((k, i) => {
          const desv = k.linea.real - k.linea.plan
          return (
            <div key={i} style={{ ...card, padding: '20px 22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div style={sectionLbl}>{k.lbl}</div>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: k.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className={`ti ${k.icon}`} aria-hidden="true" style={{ fontSize: 16, color: k.col }} />
                </div>
              </div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 26, fontWeight: 400, color: '#1a1a1a', marginBottom: 4, letterSpacing: '-0.01em' }}>{fmt(k.linea.real)}</div>
              <div style={{ fontSize: 11, color: '#aaa', marginBottom: 10 }}>Plan: {fmt(k.linea.plan)}</div>
              <span style={{ fontSize: 11, fontWeight: 600, color: k.linea.favorable ? '#1a7a3a' : '#b01a2b', background: k.linea.favorable ? '#d4f5df' : '#fdd', padding: '2px 7px', borderRadius: 99 }}>{fmtDelta(desv)}</span>
            </div>
          )
        })}
        <div style={{ ...card, padding: '20px 22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div style={sectionLbl}>Margen EBITDA</div>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#FFF8E6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="ti ti-percentage" aria-hidden="true" style={{ fontSize: 16, color: '#F4A100' }} />
            </div>
          </div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 26, fontWeight: 400, color: '#1a1a1a', marginBottom: 4, letterSpacing: '-0.01em' }}>{margenRealPct.toFixed(1).replace('.', ',')}%</div>
          <div style={{ fontSize: 11, color: '#aaa', marginBottom: 10 }}>EBITDA / Ingresos</div>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#888', background: '#F4F5F7', padding: '2px 7px', borderRadius: 99 }}>Explotación</span>
        </div>
      </div>

      {/* CUENTA DE RESULTADOS plan vs real */}
      <div style={{ ...card, padding: '22px 24px' }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a' }}>Cuenta de resultados</div>
          <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>Plan vs real hasta EBITDA · {filtroLabel}</div>
        </div>

        <div className="pyg-row" style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr 1.1fr 80px', fontSize: 10, color: '#B0B7C3', fontWeight: 600, paddingBottom: 10, borderBottom: '1px solid #ECEEF3' }}>
          <span>Concepto</span>
          <span className="pyg-hide" style={{ textAlign: 'right', paddingRight: 14 }}>Plan</span>
          <span style={{ textAlign: 'right', paddingRight: 14 }}>Real</span>
          <span style={{ textAlign: 'right', paddingRight: 14 }}>Desviación</span>
          <span className="pyg-hide" style={{ textAlign: 'right' }}>Ejec.</span>
        </div>

        {lineas.map((l, i) => {
          const esSub = l.tipo === 'subtotal'
          const cumpl = l.plan !== 0 ? (l.real / l.plan) * 100 : 0
          return (
            <div key={l.clave} className="pyg-row" style={{
              display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr 1.1fr 80px', alignItems: 'center',
              padding: esSub ? '13px 0' : '11px 0',
              borderTop: esSub ? '1px solid #ECEEF3' : 'none',
              borderBottom: !esSub && i < lineas.length - 1 ? '1px solid #F4F5F7' : 'none',
              background: l.clave === 'ebitda' ? '#F8F9FC' : 'transparent',
              marginLeft: l.clave === 'ebitda' ? -24 : 0, marginRight: l.clave === 'ebitda' ? -24 : 0,
              paddingLeft: l.clave === 'ebitda' ? 24 : 0, paddingRight: l.clave === 'ebitda' ? 24 : 0,
            }}>
              <span style={{ fontSize: esSub ? 13 : 12, fontWeight: esSub ? 700 : 400, color: '#1a1a1a' }}>
                {l.tipo === 'gasto' && <span style={{ color: '#B0B7C3', marginRight: 4 }}>−</span>}
                {esSub && <span style={{ color: '#B0B7C3', marginRight: 4 }}>=</span>}
                {l.label}
              </span>
              <span className="pyg-hide" style={{ fontSize: 12, color: '#888', textAlign: 'right', paddingRight: 14, fontWeight: esSub ? 600 : 400 }}>{fmt(l.plan)}</span>
              <span style={{ fontSize: 12, fontWeight: esSub ? 700 : 600, color: '#1a1a1a', textAlign: 'right', paddingRight: 14 }}>{fmt(l.real)}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: l.favorable ? '#1a7a3a' : '#b01a2b', textAlign: 'right', paddingRight: 14 }}>{fmtDelta(l.desviacion)}</span>
              <span className="pyg-hide" style={{ textAlign: 'right' }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: l.favorable ? '#1a7a3a' : '#b01a2b', background: l.favorable ? '#d4f5df' : '#fdd', padding: '2px 7px', borderRadius: 99 }}>{pct(cumpl)}</span>
              </span>
            </div>
          )
        })}
      </div>
    </Layout>
  )
}
