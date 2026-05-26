import Layout from '@/components/Layout'
import { useState, useCallback } from 'react'
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

// ─── Tipos ────────────────────────────────────────────────────────────────────
const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
const MESES_REALES = ['Ene','Feb','Mar','Abr','May'] // YTD

const CATEGORIAS_GASTO = [
  { key:'nominas',    label:'Nóminas',         default: 18400 },
  { key:'alquiler',  label:'Alquiler',         default: 2100  },
  { key:'fiscal',    label:'Impuestos/fiscal', default: 5500  },
  { key:'software',  label:'Software/SaaS',    default: 740   },
  { key:'marketing', label:'Marketing',        default: 3000  },
  { key:'otros',     label:'Otros gastos',     default: 2000  },
]

type MesData = {
  ingresosPresup: number
  gastosPresup:   number
  categorias:     Record<string, number>
}

type BudgetState = {
  ingresosTotalAnual: number
  gastosTotalAnual:   number
  meses: MesData[]
  categoriasAnual: Record<string, number>
}

// Datos reales YTD
const REALES: Record<string, { ingresos: number; gastos: number }> = {
  Ene: { ingresos: 110000, gastos: 78000 },
  Feb: { ingresos: 125000, gastos: 80000 },
  Mar: { ingresos: 158000, gastos: 85000 },
  Abr: { ingresos: 140000, gastos: 75000 },
  May: { ingresos: 88000,  gastos: 42000 },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function distribuirUniforme(total: number): number[] {
  const base = Math.round(total / 12)
  const arr = Array(12).fill(base)
  arr[11] += total - base * 12 // ajuste redondeo en dic
  return arr
}

function buildMeses(ingresosTotalAnual: number, gastosTotalAnual: number, categoriasAnual: Record<string, number>): MesData[] {
  const ingArr = distribuirUniforme(ingresosTotalAnual)
  const gasArr = distribuirUniforme(gastosTotalAnual)
  return MESES.map((_, i) => ({
    ingresosPresup: ingArr[i],
    gastosPresup:   gasArr[i],
    categorias: Object.fromEntries(
      CATEGORIAS_GASTO.map(c => [c.key, Math.round((categoriasAnual[c.key] ?? 0) / 12)])
    ),
  }))
}

function fmt(n: number) {
  return new Intl.NumberFormat('es-ES', { style:'currency', currency:'EUR', maximumFractionDigits:0 }).format(n)
}

function pctDev(real: number, presup: number): number {
  if (!presup) return 0
  return Math.round(((real - presup) / presup) * 100)
}

// ─── Estado inicial ───────────────────────────────────────────────────────────
const DEFAULT_CATEGORIAS_ANUAL = Object.fromEntries(
  CATEGORIAS_GASTO.map(c => [c.key, c.default * 12])
)
const DEFAULT_GASTOS_TOTAL = CATEGORIAS_GASTO.reduce((s, c) => s + c.default * 12, 0)

function initState(): BudgetState {
  const ingresosTotalAnual = 1560000
  const gastosTotalAnual   = DEFAULT_GASTOS_TOTAL
  const categoriasAnual    = DEFAULT_CATEGORIAS_ANUAL
  return {
    ingresosTotalAnual,
    gastosTotalAnual,
    categoriasAnual,
    meses: buildMeses(ingresosTotalAnual, gastosTotalAnual, categoriasAnual),
  }
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────
function BvRTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const get = (key: string) => payload.find((p: any) => p.dataKey === key)?.value ?? 0
  const ingP = get('ingresosPresup'), ingR = get('ingresosReal')
  const gasP = get('gastosPresup'),   gasR = get('gastosReal')
  const tieneReal = MESES_REALES.includes(label)
  return (
    <div style={{ background:'#fff', border:'1px solid #E8E8EC', borderRadius:10, padding:'12px 16px', fontSize:12, minWidth:200 }}>
      <div style={{ fontWeight:600, color:'#1a1a1a', marginBottom:10 }}>{label}</div>
      <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
        <Row l="Ingresos presup." v={fmt(ingP)} c="#BAE6FD" />
        {tieneReal && <Row l="Ingresos real" v={fmt(ingR)} c="#1C1E26" />}
        {tieneReal && <DevRow real={ingR} presup={ingP} label="Desv. ingresos" />}
        <div style={{ borderTop:'1px solid #F0F0F2', margin:'4px 0' }} />
        <Row l="Gastos presup." v={fmt(gasP)} c="#FECACA" />
        {tieneReal && <Row l="Gastos real" v={fmt(gasR)} c="#EF4444" />}
        {tieneReal && <DevRow real={gasR} presup={gasP} label="Desv. gastos" invert />}
      </div>
    </div>
  )
}
function Row({ l, v, c }: { l:string; v:string; c:string }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', gap:20 }}>
      <span style={{ display:'flex', alignItems:'center', gap:5, color:'#888' }}>
        <div style={{ width:8, height:8, borderRadius:2, background:c, flexShrink:0 }} />{l}
      </span>
      <span style={{ fontWeight:600, color:'#1a1a1a' }}>{v}</span>
    </div>
  )
}
function DevRow({ real, presup, label, invert }: { real:number; presup:number; label:string; invert?:boolean }) {
  const pct = pctDev(real, presup)
  const positive = invert ? pct <= 0 : pct >= 0
  return (
    <div style={{ display:'flex', justifyContent:'space-between', gap:20 }}>
      <span style={{ color:'#888' }}>{label}</span>
      <span style={{ fontWeight:600, color: positive ? '#2DC653' : '#EF4444' }}>
        {pct > 0 ? '+' : ''}{pct}%
      </span>
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function Presupuesto() {
  const [budget, setBudget] = useState<BudgetState>(initState)
  const [step, setStep] = useState<'setup' | 'detalle' | 'comparativa'>('setup')
  const [editMes, setEditMes] = useState<number | null>(null)

  // Totales reales YTD
  const ytdRealIngresos = Object.values(REALES).reduce((s, d) => s + d.ingresos, 0)
  const ytdRealGastos   = Object.values(REALES).reduce((s, d) => s + d.gastos, 0)
  const ytdPresupIngresos = budget.meses.slice(0, MESES_REALES.length).reduce((s, m) => s + m.ingresosPresup, 0)
  const ytdPresupGastos   = budget.meses.slice(0, MESES_REALES.length).reduce((s, m) => s + m.gastosPresup, 0)

  // Chart data
  const chartData = MESES.map((mes, i) => {
    const real = REALES[mes]
    return {
      mes,
      ingresosPresup: budget.meses[i].ingresosPresup,
      gastosPresup:   budget.meses[i].gastosPresup,
      ingresosReal:   real?.ingresos ?? null,
      gastosReal:     real?.gastos   ?? null,
    }
  })

  const handleAnualChange = useCallback((field: 'ingresosTotalAnual' | 'gastosTotalAnual', val: number) => {
    setBudget(prev => {
      const next = { ...prev, [field]: val }
      next.meses = buildMeses(next.ingresosTotalAnual, next.gastosTotalAnual, next.categoriasAnual)
      return next
    })
  }, [])

  const handleCatAnualChange = useCallback((key: string, val: number) => {
    setBudget(prev => {
      const cats = { ...prev.categoriasAnual, [key]: val }
      const gastosTotalAnual = Object.values(cats).reduce((s, v) => s + v, 0)
      const meses = buildMeses(prev.ingresosTotalAnual, gastosTotalAnual, cats)
      return { ...prev, categoriasAnual: cats, gastosTotalAnual, meses }
    })
  }, [])

  const handleMesChange = useCallback((i: number, field: 'ingresosPresup' | 'gastosPresup', val: number) => {
    setBudget(prev => {
      const meses = prev.meses.map((m, idx) => idx === i ? { ...m, [field]: val } : m)
      return { ...prev, meses }
    })
  }, [])

  const card: React.CSSProperties = { background:'#fff', borderRadius:14, border:'1px solid #E8E8EC' }

  return (
    <Layout title="Presupuesto">
      <style>{`
        @media (max-width:900px) { .pres-kpis { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width:600px) { .pres-kpis { grid-template-columns: 1fr !important; } .pres-hide { display:none !important; } }
        .pres-input:focus { border-color: #1C1E26 !important; outline: none; }
        .pres-tab { cursor:pointer; padding:8px 16px; border-radius:8px; font-size:12px; font-weight:500; border:1px solid transparent; transition:all 0.15s; }
        .pres-tab:hover { background: #F4F5F7; }
        .pres-row:hover td { background:#FAFAFA; }
      `}</style>

      {/* ── Tabs ── */}
      <div style={{ display:'flex', gap:6, background:'#fff', border:'1px solid #E8E8EC', borderRadius:10, padding:4, width:'fit-content' }}>
        {(['setup','detalle','comparativa'] as const).map(s => (
          <button key={s} className="pres-tab"
            onClick={() => setStep(s)}
            style={{
              background: step === s ? '#1C1E26' : 'transparent',
              color: step === s ? '#fff' : '#888',
              border: '1px solid transparent',
            }}>
            {s === 'setup' ? '1 · Presupuesto anual' : s === 'detalle' ? '2 · Detalle mensual' : '3 · Presupuesto vs Real'}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════════════
          STEP 1 — Setup anual
      ════════════════════════════════════════════════════ */}
      {step === 'setup' && (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div style={{ ...card, padding:'24px' }}>
            <SectionTitle>Ingresos y gastos anuales</SectionTitle>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginTop:16 }}>
              <Field label="Ingresos totales 2026" value={budget.ingresosTotalAnual}
                onChange={v => handleAnualChange('ingresosTotalAnual', v)} />
              <Field label="Gastos totales 2026 (calculado)" value={budget.gastosTotalAnual}
                onChange={v => handleAnualChange('gastosTotalAnual', v)} disabled />
            </div>
            <Note>Los gastos totales se calculan sumando las categorías de abajo. El presupuesto se distribuye uniformemente entre los 12 meses; puedes ajustarlo mes a mes en el paso 2.</Note>
          </div>

          <div style={{ ...card, padding:'24px' }}>
            <SectionTitle>Categorías de gasto anuales</SectionTitle>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginTop:16 }}>
              {CATEGORIAS_GASTO.map(c => (
                <Field key={c.key} label={c.label} value={budget.categoriasAnual[c.key]}
                  onChange={v => handleCatAnualChange(c.key, v)} />
              ))}
            </div>
            <div style={{ marginTop:16, paddingTop:14, borderTop:'1px solid #F4F5F7', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:12, color:'#888' }}>Total gastos</span>
              <span style={{ fontSize:16, fontWeight:700, color:'#1a1a1a' }}>{fmt(budget.gastosTotalAnual)}</span>
            </div>
          </div>

          <div style={{ display:'flex', justifyContent:'flex-end' }}>
            <button onClick={() => setStep('detalle')} style={{ padding:'11px 24px', background:'#1C1E26', color:'#fff', border:'none', borderRadius:9, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'Inter,sans-serif' }}>
              Siguiente → Detalle mensual
            </button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          STEP 2 — Detalle mensual editable
      ════════════════════════════════════════════════════ */}
      {step === 'detalle' && (
        <div style={{ ...card, padding:'24px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20, flexWrap:'wrap', gap:12 }}>
            <div>
              <div style={{ fontSize:15, fontWeight:700, color:'#1a1a1a' }}>Detalle mensual</div>
              <div style={{ fontSize:11, color:'#B0B7C3', marginTop:2 }}>Ajusta el presupuesto mes a mes si lo necesitas</div>
            </div>
            <button onClick={() => {
              setBudget(prev => ({ ...prev, meses: buildMeses(prev.ingresosTotalAnual, prev.gastosTotalAnual, prev.categoriasAnual) }))
            }} style={{ padding:'8px 16px', fontSize:12, fontWeight:500, border:'1px solid #E8E8EC', borderRadius:8, background:'#F4F5F7', color:'#555', cursor:'pointer', fontFamily:'Inter,sans-serif' }}>
              Restablecer distribución uniforme
            </button>
          </div>

          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
            <thead>
              <tr style={{ borderBottom:'2px solid #F0F0F2' }}>
                <Th>Mes</Th>
                <Th right>Ingresos presup.</Th>
                <Th right>Gastos presup.</Th>
                <Th right>Neto presup.</Th>
                <Th center>Editar</Th>
              </tr>
            </thead>
            <tbody>
              {MESES.map((mes, i) => {
                const m = budget.meses[i]
                const neto = m.ingresosPresup - m.gastosPresup
                const isEdit = editMes === i
                return (
                  <>
                    <tr key={mes} className="pres-row" style={{ borderBottom:'1px solid #F4F5F7' }}>
                      <td style={{ padding:'10px 0', fontWeight:500, color:'#1a1a1a' }}>{mes}</td>
                      <td style={{ padding:'10px 0', textAlign:'right', color:'#1a1a1a' }}>{fmt(m.ingresosPresup)}</td>
                      <td style={{ padding:'10px 0', textAlign:'right', color:'#EF4444' }}>{fmt(m.gastosPresup)}</td>
                      <td style={{ padding:'10px 0', textAlign:'right', fontWeight:600, color: neto >= 0 ? '#2DC653' : '#EF4444' }}>{fmt(neto)}</td>
                      <td style={{ padding:'10px 0', textAlign:'center' }}>
                        <button onClick={() => setEditMes(isEdit ? null : i)}
                          style={{ fontSize:11, padding:'3px 10px', borderRadius:6, border:'1px solid #E8E8EC', background: isEdit ? '#1C1E26' : '#F4F5F7', color: isEdit ? '#fff' : '#555', cursor:'pointer', fontFamily:'Inter,sans-serif' }}>
                          {isEdit ? 'Cerrar' : 'Editar'}
                        </button>
                      </td>
                    </tr>
                    {isEdit && (
                      <tr key={`edit-${mes}`} style={{ background:'#FAFAFA', borderBottom:'1px solid #F0F0F2' }}>
                        <td colSpan={5} style={{ padding:'14px 0' }}>
                          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, maxWidth:480 }}>
                            <Field label="Ingresos" value={m.ingresosPresup}
                              onChange={v => handleMesChange(i, 'ingresosPresup', v)} />
                            <Field label="Gastos" value={m.gastosPresup}
                              onChange={v => handleMesChange(i, 'gastosPresup', v)} />
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                )
              })}
              <tr style={{ borderTop:'2px solid #E8E8EC', background:'#FAFAFA' }}>
                <td style={{ padding:'12px 0', fontWeight:700, color:'#1a1a1a' }}>Total anual</td>
                <td style={{ padding:'12px 0', textAlign:'right', fontWeight:700 }}>{fmt(budget.meses.reduce((s,m) => s+m.ingresosPresup,0))}</td>
                <td style={{ padding:'12px 0', textAlign:'right', fontWeight:700, color:'#EF4444' }}>{fmt(budget.meses.reduce((s,m) => s+m.gastosPresup,0))}</td>
                <td style={{ padding:'12px 0', textAlign:'right', fontWeight:700, color:'#2DC653' }}>
                  {fmt(budget.meses.reduce((s,m) => s+m.ingresosPresup-m.gastosPresup,0))}
                </td>
                <td />
              </tr>
            </tbody>
          </table>

          <div style={{ display:'flex', justifyContent:'flex-end', marginTop:16 }}>
            <button onClick={() => setStep('comparativa')} style={{ padding:'11px 24px', background:'#1C1E26', color:'#fff', border:'none', borderRadius:9, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'Inter,sans-serif' }}>
              Siguiente → Ver comparativa
            </button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          STEP 3 — Presupuesto vs Real
      ════════════════════════════════════════════════════ */}
      {step === 'comparativa' && (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

          {/* KPIs desviación */}
          <div className="pres-kpis" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
            <KpiDev label="Ingresos YTD" real={ytdRealIngresos} presup={ytdPresupIngresos} />
            <KpiDev label="Gastos YTD" real={ytdRealGastos} presup={ytdPresupGastos} invert />
            <KpiDev label="Neto YTD" real={ytdRealIngresos-ytdRealGastos} presup={ytdPresupIngresos-ytdPresupGastos} />
            <div style={{ background:'#fff', borderRadius:14, border:'1px solid #E8E8EC', padding:'18px 22px' }}>
              <div style={{ fontSize:9, fontWeight:600, color:'#B0B7C3', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:10 }}>Meses con datos reales</div>
              <div style={{ fontSize:24, fontWeight:700, color:'#1a1a1a', marginBottom:6 }}>{MESES_REALES.length} / 12</div>
              <div style={{ fontSize:11, color:'#B0B7C3' }}>ene–may 2026</div>
            </div>
          </div>

          {/* Gráfico */}
          <div style={{ ...card, padding:'24px 24px 16px' }}>
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:20, flexWrap:'wrap', gap:12 }}>
              <div>
                <div style={{ fontSize:15, fontWeight:700, color:'#1a1a1a' }}>Presupuesto vs Real — 2026</div>
                <div style={{ fontSize:11, color:'#B0B7C3', marginTop:2 }}>Ingresos y gastos · barras presupuesto + línea real</div>
              </div>
              <div style={{ display:'flex', gap:14, flexWrap:'wrap' }}>
                <LegendItem color="#BAE6FD" label="Ing. presup." />
                <LegendItem color="#FECACA" label="Gas. presup." />
                <LegendItem color="#1C1E26" label="Ing. real" line />
                <LegendItem color="#EF4444" label="Gas. real" line />
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={chartData} margin={{ top:4, right:16, left:0, bottom:0 }} barGap={3}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F2" vertical={false} />
                <XAxis dataKey="mes" tick={{ fontSize:11, fill:'#B0B7C3' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:11, fill:'#B0B7C3' }} axisLine={false} tickLine={false}
                  tickFormatter={v => `${(v/1000).toFixed(0)}k`} width={38} />
                <Tooltip content={<BvRTooltip />} cursor={{ fill:'rgba(0,0,0,0.025)' }} />
                <Bar dataKey="ingresosPresup" name="Ing. presup." fill="#BAE6FD" radius={[4,4,0,0]} />
                <Bar dataKey="gastosPresup"   name="Gas. presup." fill="#FECACA" radius={[4,4,0,0]} />
                <Line dataKey="ingresosReal" name="Ing. real" type="monotone"
                  stroke="#1C1E26" strokeWidth={2} dot={{ r:4, fill:'#1C1E26', stroke:'#fff', strokeWidth:2 }}
                  connectNulls={false} />
                <Line dataKey="gastosReal" name="Gas. real" type="monotone"
                  stroke="#EF4444" strokeWidth={2} dot={{ r:4, fill:'#EF4444', stroke:'#fff', strokeWidth:2 }}
                  connectNulls={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Tabla comparativa */}
          <div style={{ ...card, padding:'24px' }}>
            <div style={{ fontSize:15, fontWeight:700, color:'#1a1a1a', marginBottom:4 }}>Tabla comparativa mensual</div>
            <div style={{ fontSize:11, color:'#B0B7C3', marginBottom:20 }}>Desviación = (Real − Presupuesto) / Presupuesto</div>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
              <thead>
                <tr style={{ borderBottom:'2px solid #F0F0F2' }}>
                  <Th>Mes</Th>
                  <Th right>Ing. presup.</Th>
                  <Th right>Ing. real</Th>
                  <Th right>Desv. ing.</Th>
                  <Th right className="pres-hide">Gas. presup.</Th>
                  <Th right className="pres-hide">Gas. real</Th>
                  <Th right>Desv. gas.</Th>
                </tr>
              </thead>
              <tbody>
                {MESES.map((mes, i) => {
                  const m = budget.meses[i]
                  const real = REALES[mes]
                  const tieneReal = !!real
                  const devIng = tieneReal ? pctDev(real.ingresos, m.ingresosPresup) : null
                  const devGas = tieneReal ? pctDev(real.gastos,   m.gastosPresup)   : null
                  return (
                    <tr key={mes} className="pres-row" style={{ borderBottom:'1px solid #F4F5F7' }}>
                      <td style={{ padding:'10px 0', fontWeight:500, color:'#1a1a1a' }}>{mes}</td>
                      <td style={{ padding:'10px 0', textAlign:'right', color:'#888' }}>{fmt(m.ingresosPresup)}</td>
                      <td style={{ padding:'10px 0', textAlign:'right', color: tieneReal ? '#1a1a1a' : '#D0D0D0' }}>
                        {tieneReal ? fmt(real.ingresos) : '—'}
                      </td>
                      <td style={{ padding:'10px 0', textAlign:'right' }}>
                        {devIng !== null
                          ? <DevBadge pct={devIng} />
                          : <span style={{ color:'#D0D0D0' }}>—</span>
                        }
                      </td>
                      <td className="pres-hide" style={{ padding:'10px 0', textAlign:'right', color:'#888' }}>{fmt(m.gastosPresup)}</td>
                      <td className="pres-hide" style={{ padding:'10px 0', textAlign:'right', color: tieneReal ? '#EF4444' : '#D0D0D0' }}>
                        {tieneReal ? fmt(real.gastos) : '—'}
                      </td>
                      <td style={{ padding:'10px 0', textAlign:'right' }}>
                        {devGas !== null
                          ? <DevBadge pct={devGas} invert />
                          : <span style={{ color:'#D0D0D0' }}>—</span>
                        }
                      </td>
                    </tr>
                  )
                })}
                {/* Totales YTD */}
                <tr style={{ borderTop:'2px solid #E8E8EC', background:'#FAFAFA' }}>
                  <td style={{ padding:'12px 0', fontWeight:700, color:'#1a1a1a' }}>YTD (ene–may)</td>
                  <td style={{ padding:'12px 0', textAlign:'right', fontWeight:600 }}>{fmt(ytdPresupIngresos)}</td>
                  <td style={{ padding:'12px 0', textAlign:'right', fontWeight:600 }}>{fmt(ytdRealIngresos)}</td>
                  <td style={{ padding:'12px 0', textAlign:'right' }}><DevBadge pct={pctDev(ytdRealIngresos, ytdPresupIngresos)} /></td>
                  <td className="pres-hide" style={{ padding:'12px 0', textAlign:'right', fontWeight:600, color:'#EF4444' }}>{fmt(ytdPresupGastos)}</td>
                  <td className="pres-hide" style={{ padding:'12px 0', textAlign:'right', fontWeight:600, color:'#EF4444' }}>{fmt(ytdRealGastos)}</td>
                  <td style={{ padding:'12px 0', textAlign:'right' }}><DevBadge pct={pctDev(ytdRealGastos, ytdPresupGastos)} invert /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Layout>
  )
}

// ─── Subcomponentes ───────────────────────────────────────────────────────────

function Field({ label, value, onChange, disabled }: { label:string; value:number; onChange:(v:number)=>void; disabled?:boolean }) {
  return (
    <div>
      <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#B0B7C3', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>{label}</label>
      <input
        type="number" value={value} disabled={disabled}
        onChange={e => onChange(Number(e.target.value))}
        className="pres-input"
        style={{
          width:'100%', padding:'10px 12px', fontSize:13, fontFamily:'Inter,sans-serif',
          border:'1px solid #E8E8EC', borderRadius:8, background: disabled ? '#F4F5F7' : '#fff',
          color: disabled ? '#B0B7C3' : '#1a1a1a', cursor: disabled ? 'not-allowed' : 'text',
        }}
      />
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize:13, fontWeight:700, color:'#1a1a1a', letterSpacing:'-0.01em' }}>{children}</div>
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ marginTop:14, display:'flex', alignItems:'flex-start', gap:7 }}>
      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="#B0B7C3" strokeWidth="1.5" style={{ flexShrink:0, marginTop:1 }}>
        <circle cx="8" cy="8" r="7"/><path d="M8 7v4M8 5h.01"/>
      </svg>
      <span style={{ fontSize:11, color:'#B0B7C3', lineHeight:1.6 }}>{children}</span>
    </div>
  )
}

function KpiDev({ label, real, presup, invert }: { label:string; real:number; presup:number; invert?:boolean }) {
  const pct = pctDev(real, presup)
  const positive = invert ? pct <= 0 : pct >= 0
  return (
    <div style={{ background:'#fff', borderRadius:14, border:'1px solid #E8E8EC', padding:'18px 22px' }}>
      <div style={{ fontSize:9, fontWeight:600, color:'#B0B7C3', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:10 }}>{label}</div>
      <div style={{ fontSize:22, fontWeight:700, color:'#1a1a1a', marginBottom:6 }}>{fmt(real)}</div>
      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
        <span style={{ fontSize:11, fontWeight:600, color: positive ? '#1a7a3a' : '#b01a2b', background: positive ? '#d4f5df' : '#fdd', padding:'2px 7px', borderRadius:99 }}>
          {pct > 0 ? '+' : ''}{pct}% vs presup.
        </span>
      </div>
    </div>
  )
}

function DevBadge({ pct, invert }: { pct:number; invert?:boolean }) {
  const positive = invert ? pct <= 0 : pct >= 0
  return (
    <span style={{ fontSize:11, fontWeight:600, color: positive ? '#1a7a3a' : '#b01a2b', background: positive ? '#d4f5df' : '#fdd', padding:'2px 8px', borderRadius:99, whiteSpace:'nowrap' }}>
      {pct > 0 ? '+' : ''}{pct}%
    </span>
  )
}

function LegendItem({ color, label, line }: { color:string; label:string; line?:boolean }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:5 }}>
      {line ? <div style={{ width:16, height:2, background:color, borderRadius:99 }} /> : <div style={{ width:10, height:10, borderRadius:3, background:color }} />}
      <span style={{ fontSize:11, color:'#888' }}>{label}</span>
    </div>
  )
}

function Th({ children, right, center, className }: { children:React.ReactNode; right?:boolean; center?:boolean; className?:string }) {
  return (
    <th className={className} style={{
      padding:'0 0 10px', textAlign: center ? 'center' : right ? 'right' : 'left',
      fontSize:10, fontWeight:600, color:'#B0B7C3', textTransform:'uppercase', letterSpacing:'0.1em',
    }}>{children}</th>
  )
}
