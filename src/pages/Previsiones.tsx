import Layout from '@/components/Layout'
import { useNavigate } from 'react-router-dom'
import { useMemo, useState } from 'react'
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { useScenarios } from '@/contexts/ScenariosContext'
import { construirPrevision, type FilaPrevision } from '@/lib/forecast'
import { useDatos } from '@/contexts/DataContext'
import { buildResumen } from '@/lib/contabilidad'

const HORIZONTES = [3, 6, 12]

const card: React.CSSProperties = { background:'#fff', borderRadius:16, border:'1px solid #E8E8EC' }
const sectionLbl: React.CSSProperties = { fontSize:9, fontWeight:600, color:'#999', textTransform:'uppercase', letterSpacing:'0.12em' }

function fmt(n: number) {
  return Math.round(n).toLocaleString('es-ES') + ' €'
}
function fmtK(n: number) {
  return `€${Math.round(n / 1000)}k`
}
function pct(n: number) {
  const s = n >= 0 ? '+' : '−'
  return `${s}${Math.abs(n).toFixed(1)}%`
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const get = (k: string) => payload.find((p: any) => p.dataKey === k)?.value
  const hist = get('cajaHist'), base = get('cajaBase'), esc = get('cajaEsc')
  return (
    <div style={{ background:'#fff', border:'1px solid #E8E8EC', borderRadius:10, padding:'10px 14px', fontSize:12 }}>
      <div style={{ fontWeight:600, color:'#1a1a1a', marginBottom:8 }}>{label}</div>
      {hist != null && <Row color="#3B5BDB" lbl="Caja real" val={fmt(hist)} />}
      {base != null && <Row color="#7DD3FC" lbl="Previsión base" val={fmt(base)} />}
      {esc != null && esc !== base && <Row color="#2DC653" lbl="Con escenarios" val={fmt(esc)} />}
    </div>
  )
}
function Row({ color, lbl, val }: { color:string; lbl:string; val:string }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
      <div style={{ width:7, height:7, borderRadius:2, background:color }} />
      <span style={{ color:'#666' }}>{lbl}: <strong style={{ color:'#1a1a1a', fontWeight:600 }}>{val}</strong></span>
    </div>
  )
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <div onClick={onToggle} style={{ width:36, height:20, background: on ? '#4361EE' : '#E8E8EC', borderRadius:99, position:'relative', cursor:'pointer', flexShrink:0, transition:'background .15s' }}>
      <div style={{ position:'absolute', width:14, height:14, background:'#fff', borderRadius:'50%', top:3, left: on ? 19 : 3, transition:'left .15s' }} />
    </div>
  )
}

export default function Previsiones() {
  const navigate = useNavigate()
  const { data } = useDatos()
  const { escenarios, toggle } = useScenarios()
  const [horizonte, setHorizonte] = useState(6)
  const [verEscenarios, setVerEscenarios] = useState(true)
  const activos = escenarios.filter(e => e.activo)

  // ── Histórico REAL derivado del Diario ──
  const resumen = useMemo(() => buildResumen(data?.diario ?? []), [data])
  const evol = resumen.evolucion

  const HIST_INGRESOS = evol.map(e => e.ingresos)
  const HIST_GASTOS = evol.map(e => e.gastos)
  const HIST_MESES = evol.map(e => e.mes)
  const CAJA_INICIAL = resumen.tesoreria
  const DSO = resumen.dso
  const PENDIENTE_ACTUAL = resumen.pendienteCobro

  // Mes/año de inicio de la previsión = mes siguiente al último real
  const ultimoYm = evol.length ? evol[evol.length - 1].ym : null
  let mesInicioPrevision = new Date().getMonth()
  let anioInicioPrevision = new Date().getFullYear()
  if (ultimoYm) {
    const [y, m] = ultimoYm.split('-').map(Number)
    mesInicioPrevision = m % 12          // mes siguiente (0-index): si m=12→0 (Ene)
    anioInicioPrevision = m === 12 ? y + 1 : y
  }

  const filas: FilaPrevision[] = useMemo(() => construirPrevision({
    histIngresos: HIST_INGRESOS,
    histGastos: HIST_GASTOS,
    histMeses: HIST_MESES,
    cajaInicial: CAJA_INICIAL,
    mesInicioPrevision,
    anioInicioPrevision,
    periodos: horizonte,
    escenarios: verEscenarios ? escenarios : [],
  }), [horizonte, verEscenarios, escenarios, data])

  const previsiones = filas.filter(f => f.tipo === 'prevision')
  const ultima = previsiones[previsiones.length - 1]

  // ── KPIs proyectados ──
  const netoMedio = previsiones.length ? previsiones.reduce((a, f) => a + f.neto, 0) / previsiones.length : 0
  const ingMensualFin = ultima?.ingresos ?? 0
  const pendientePrevisto = ingMensualFin * (DSO / 30)
  // Últimos valores reales (con protección si no hay histórico)
  const ingFin = HIST_INGRESOS.length ? HIST_INGRESOS[HIST_INGRESOS.length - 1] : 0
  const gasFin = HIST_GASTOS.length ? HIST_GASTOS[HIST_GASTOS.length - 1] : 0
  const netoFin = ingFin - gasFin

  const kpis = [
    {
      lbl: 'Caja proyectada', sub: `fin de ${ultima.mes}`,
      val: fmt(ultima.caja), delta: pct(((ultima.caja - CAJA_INICIAL) / Math.abs(CAJA_INICIAL)) * 100),
      positivo: ultima.caja >= CAJA_INICIAL, icon: 'ti-wallet', iconBg:'#EEF1FD', iconColor:'#3B5BDB',
    },
    {
      lbl: 'Cashflow neto medio', sub: 'por mes · previsión',
      val: fmt(netoMedio), delta: netoFin !== 0 ? pct(((netoMedio - netoFin) / Math.abs(netoFin)) * 100) : '—',
      positivo: netoMedio >= 0, icon: 'ti-trending-up', iconBg:'#F0F9F4', iconColor:'#2DC653',
    },
    {
      lbl: 'Ingresos previstos', sub: `mensual · ${ultima.mes}`,
      val: fmt(ingMensualFin), delta: ingFin !== 0 ? pct(((ingMensualFin - ingFin) / ingFin) * 100) : '—',
      positivo: ingMensualFin >= ingFin, icon: 'ti-arrow-up-right', iconBg:'#EEF1FD', iconColor:'#3B5BDB',
    },
    {
      lbl: 'Pendiente de cobro', sub: `proyectado · DSO ${DSO}d`,
      val: fmt(pendientePrevisto), delta: PENDIENTE_ACTUAL !== 0 ? pct(((pendientePrevisto - PENDIENTE_ACTUAL) / PENDIENTE_ACTUAL) * 100) : '—',
      positivo: pendientePrevisto <= PENDIENTE_ACTUAL, icon: 'ti-file-invoice', iconBg:'#FFF8E6', iconColor:'#F4A100',
    },
  ]

  // ── Datos del gráfico (línea continua hist → previsión + banda) ──
  const idxBoundary = filas.findIndex(f => f.tipo === 'prevision') - 1
  const chartData = filas.map((f, i) => {
    const esBoundary = i === idxBoundary
    return {
      mes: f.mes,
      cajaHist: f.tipo === 'historico' ? f.caja : null,
      cajaBase: f.tipo === 'prevision' || esBoundary ? f.cajaBase : null,
      cajaEsc: f.tipo === 'prevision' || esBoundary ? f.caja : null,
      bandaBase: f.tipo === 'prevision' ? f.cajaInf : (esBoundary ? f.caja : null),
      bandaRango: f.tipo === 'prevision' ? f.cajaSup - f.cajaInf : (esBoundary ? 0 : null),
    }
  })

  const hayActivos = activos.length > 0 && verEscenarios

  return (
    <Layout title="Previsiones">
      <style>{`
        @media (max-width: 1024px) { .prev-row2 { grid-template-columns: 1fr !important; } }
        @media (max-width: 768px) {
          .prev-kpi { grid-template-columns: 1fr 1fr !important; }
          .prev-hide { display: none !important; }
          .prev-tbl-hdr, .prev-tbl-row { grid-template-columns: 90px 1fr 1fr !important; }
        }
        @media (max-width: 480px) { .prev-kpi { grid-template-columns: 1fr !important; } }
      `}</style>

      {/* CONTROLES */}
      <div style={{ ...card, padding:'14px 18px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, flexWrap:'wrap' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={sectionLbl}>Horizonte</span>
          <div style={{ display:'flex', gap:4, background:'#F4F5F7', borderRadius:9, padding:3 }}>
            {HORIZONTES.map(h => (
              <button key={h} onClick={() => setHorizonte(h)} style={{
                padding:'6px 14px', fontSize:12, fontWeight:600, borderRadius:7, border:'none', cursor:'pointer',
                fontFamily:'Inter, sans-serif',
                background: horizonte === h ? '#fff' : 'transparent',
                color: horizonte === h ? '#4361EE' : '#888',
                boxShadow: horizonte === h ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              }}>{h} meses</button>
            ))}
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:12, color:'#888' }}>Impacto de escenarios</span>
          <Toggle on={verEscenarios} onToggle={() => setVerEscenarios(!verEscenarios)} />
          {activos.length > 0 && (
            <span style={{ fontSize:11, fontWeight:600, color:'#4361EE', background:'#EEF1FD', padding:'3px 9px', borderRadius:99 }}>
              {activos.length} activo{activos.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div className="prev-kpi" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
        {kpis.map((k, i) => (
          <div key={i} style={{ ...card, padding:'20px 22px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
              <div style={sectionLbl}>{k.lbl}</div>
              <div style={{ width:32, height:32, borderRadius:8, background:k.iconBg, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <i className={`ti ${k.icon}`} aria-hidden="true" style={{ fontSize:16, color:k.iconColor }} />
              </div>
            </div>
            <div style={{ fontFamily:'Inter, sans-serif', fontSize:28, fontWeight:400, color:'#1a1a1a', marginBottom:10, letterSpacing:'-0.01em' }}>{k.val}</div>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <span style={{ fontSize:11, fontWeight:600, color: k.positivo ? '#1a7a3a' : '#b01a2b', background: k.positivo ? '#d4f5df' : '#fdd', padding:'2px 7px', borderRadius:99 }}>{k.delta}</span>
              <span style={{ fontSize:11, color:'#aaa' }}>{k.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* GRÁFICO PRINCIPAL + ESCENARIOS */}
      <div className="prev-row2" style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:14 }}>

        {/* Caja proyectada */}
        <div style={{ ...card, padding:'24px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
            <div>
              <div style={{ ...sectionLbl, marginBottom:4 }}>Caja proyectada</div>
              <div style={{ fontSize:12, color:'#aaa' }}>Histórico + previsión a {horizonte} meses · banda de confianza 80%</div>
            </div>
          </div>
          <div style={{ display:'flex', gap:16, margin:'8px 0 14px', flexWrap:'wrap' }}>
            <Leyenda color="#3B5BDB" lbl="Caja real" solido />
            <Leyenda color="#7DD3FC" lbl="Previsión base" />
            {hayActivos && <Leyenda color="#2DC653" lbl="Con escenarios" />}
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={chartData} margin={{ top:4, right:6, left:0, bottom:0 }}>
              <defs>
                <linearGradient id="banda" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#BAE6FD" stopOpacity={0.35}/>
                  <stop offset="100%" stopColor="#BAE6FD" stopOpacity={0.08}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F2" vertical={false}/>
              <XAxis dataKey="mes" tick={{ fontSize:10, fill:'#aaa' }} axisLine={false} tickLine={false} interval="preserveStartEnd"/>
              <YAxis tick={{ fontSize:11, fill:'#aaa' }} axisLine={false} tickLine={false} tickFormatter={fmtK} width={46}/>
              <Tooltip content={<ChartTooltip />} cursor={{ stroke:'#BAE6FD', strokeWidth:1, strokeDasharray:'3 3' }}/>
              <ReferenceLine y={0} stroke="#EF4444" strokeDasharray="4 4" strokeWidth={1} />
              {/* Banda (truco de áreas apiladas) */}
              <Area type="monotone" dataKey="bandaBase" stackId="b" stroke="none" fill="transparent" connectNulls isAnimationActive={false}/>
              <Area type="monotone" dataKey="bandaRango" stackId="b" stroke="none" fill="url(#banda)" connectNulls isAnimationActive={false}/>
              {/* Líneas */}
              <Line type="monotone" dataKey="cajaHist" stroke="#3B5BDB" strokeWidth={2.5} dot={false} connectNulls activeDot={{ r:5, fill:'#3B5BDB', stroke:'#fff', strokeWidth:2 }}/>
              <Line type="monotone" dataKey="cajaBase" stroke="#7DD3FC" strokeWidth={2.5} strokeDasharray="5 4" dot={false} connectNulls activeDot={{ r:5, fill:'#0EA5E9', stroke:'#fff', strokeWidth:2 }}/>
              {hayActivos && <Line type="monotone" dataKey="cajaEsc" stroke="#2DC653" strokeWidth={2.5} strokeDasharray="5 4" dot={false} connectNulls activeDot={{ r:5, fill:'#2DC653', stroke:'#fff', strokeWidth:2 }}/>}
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Panel escenarios */}
        <div style={{ ...card, padding:'22px 24px', display:'flex', flexDirection:'column' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <div style={sectionLbl}>Escenarios</div>
            <button onClick={() => navigate('/escenarios')} title="Próximamente"
              style={{ fontSize:11, fontWeight:600, color:'#4361EE', background:'#EEF1FD', border:'none', borderRadius:7, padding:'5px 10px', cursor:'pointer', fontFamily:'Inter, sans-serif' }}>
              Gestionar →
            </button>
          </div>

          {escenarios.length === 0 && (
            <div style={{ fontSize:12, color:'#aaa', padding:'20px 0', textAlign:'center' }}>
              Aún no hay escenarios. Créalos en la página Escenarios para ver su impacto aquí.
            </div>
          )}

          <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
            {escenarios.map(e => {
              const signo = e.importe >= 0 ? '+' : '−'
              const colorImporte = e.tipo === 'ingreso'
                ? (e.importe >= 0 ? '#2DC653' : '#EF4444')
                : '#EF4444'
              return (
                <div key={e.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 0', borderBottom:'1px solid #F4F5F7' }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:12, fontWeight:500, color: e.activo ? '#1a1a1a' : '#999', marginBottom:2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{e.nombre}</div>
                    <div style={{ fontSize:10, color:'#B0B7C3' }}>
                      <span style={{ color:colorImporte, fontWeight:600 }}>{signo}{fmt(Math.abs(e.importe))}</span>
                      {' · '}{e.recurrencia === 'mensual' ? '/mes' : 'puntual'}
                    </div>
                  </div>
                  <Toggle on={e.activo} onToggle={() => toggle(e.id)} />
                </div>
              )
            })}
          </div>

          {hayActivos && (
            <div style={{ marginTop:14, paddingTop:14, borderTop:'1px solid #ECEEF3', background:'#EEF1FD', margin:'14px -24px -22px', padding:'14px 24px', borderRadius:'0 0 16px 16px' }}>
              <div style={{ fontSize:10, fontWeight:700, color:'#4361EE', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:4 }}>Impacto a fin de horizonte</div>
              <div style={{ fontSize:13, color:'#1a1a1a' }}>
                {ultima.caja >= ultima.cajaBase ? '+' : '−'}{fmt(Math.abs(ultima.caja - ultima.cajaBase))} sobre la previsión base
              </div>
            </div>
          )}
        </div>
      </div>

      {/* TABLA MENSUAL */}
      <div style={{ ...card, padding:'22px 24px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <div>
            <div style={{ fontSize:15, fontWeight:700, color:'#1a1a1a' }}>Previsión mensual</div>
            <div style={{ fontSize:11, color:'#888', marginTop:2 }}>
              {hayActivos ? 'Incluye escenarios activos' : 'Previsión base'} · próximos {horizonte} meses
            </div>
          </div>
        </div>

        <div className="prev-tbl-hdr" style={{ display:'grid', gridTemplateColumns:'110px 1fr 1fr 1fr 1.2fr', fontSize:10, color:'#B0B7C3', fontWeight:600, paddingBottom:10, borderBottom:'1px solid #ECEEF3' }}>
          <span>Mes</span>
          <span className="prev-hide" style={{ textAlign:'right', paddingRight:14 }}>Ingresos</span>
          <span className="prev-hide" style={{ textAlign:'right', paddingRight:14 }}>Gastos</span>
          <span style={{ textAlign:'right', paddingRight:14 }}>Neto</span>
          <span style={{ textAlign:'right' }}>Caja acumulada</span>
        </div>

        {previsiones.map((f, i) => (
          <div key={i} className="prev-tbl-row" style={{ display:'grid', gridTemplateColumns:'110px 1fr 1fr 1fr 1.2fr', alignItems:'center', padding:'11px 0', borderBottom: i < previsiones.length - 1 ? '1px solid #F4F5F7' : 'none' }}>
            <span style={{ fontSize:12, fontWeight:600, color:'#1a1a1a' }}>{f.mes}</span>
            <span className="prev-hide" style={{ fontSize:12, color:'#555', textAlign:'right', paddingRight:14 }}>{fmt(f.ingresos)}</span>
            <span className="prev-hide" style={{ fontSize:12, color:'#555', textAlign:'right', paddingRight:14 }}>{fmt(f.gastos)}</span>
            <span style={{ fontSize:12, fontWeight:600, color: f.neto >= 0 ? '#1a7a3a' : '#b01a2b', textAlign:'right', paddingRight:14 }}>
              {f.neto >= 0 ? '+' : '−'}{fmt(Math.abs(f.neto))}
            </span>
            <span style={{ fontSize:12, fontWeight:600, color: f.caja >= 0 ? '#1a1a1a' : '#EF4444', textAlign:'right' }}>{fmt(f.caja)}</span>
          </div>
        ))}

        <div style={{ display:'flex', justifyContent:'space-between', paddingTop:12, marginTop:4, borderTop:'1px solid #ECEEF3' }}>
          <span style={{ fontSize:11, color:'#888' }}>Caja prevista a {horizonte} meses</span>
          <span style={{ fontSize:15, fontWeight:700, color: ultima.caja >= 0 ? '#1a1a1a' : '#EF4444' }}>{fmt(ultima.caja)}</span>
        </div>
      </div>

    </Layout>
  )
}

function Leyenda({ color, lbl, solido }: { color:string; lbl:string; solido?:boolean }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
      <div style={{ width:18, height:0, borderTop:`2.5px ${solido ? 'solid' : 'dashed'} ${color}` }} />
      <span style={{ fontSize:11, color:'#888' }}>{lbl}</span>
    </div>
  )
}
