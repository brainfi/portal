import Layout from '@/components/Layout'
import { mockEvolucion, mockPrevisiones, puntoEquilibrio } from '@/lib/mockData'
import { formatCurrency, formatDate } from '@/lib/formatters'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, Cell
} from 'recharts'

const S = {
  card: { background:'#fff', border:'1px solid #E5E7EB', borderRadius:14, padding:'20px 22px' } as React.CSSProperties,
  label: { fontSize:11, fontWeight:600, color:'#9CA3AF', textTransform:'uppercase' as const, letterSpacing:'0.08em', marginBottom:6, display:'flex', alignItems:'center', gap:6 },
  bigNum: { fontSize:34, fontWeight:700, color:'#111827', letterSpacing:'-0.03em', lineHeight:1, margin:'8px 0 6px' },
  sub: { fontSize:12, color:'#6B7280' },
  iaTag: { fontSize:10, fontWeight:700, color:'#00BCD4', textTransform:'uppercase' as const, letterSpacing:'0.06em', display:'flex', alignItems:'center', gap:4, marginTop:14, marginBottom:4 },
  iaText: { fontSize:12, color:'#374151', lineHeight:1.6 },
  bar: (pct: number, color: string) => ({
    height:5, borderRadius:99, background:'#F3F4F6', margin:'10px 0 4px',
    overflow:'hidden', position:'relative' as const,
  }),
}

function IAIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" stroke="#00BCD4" strokeWidth="1.5"/>
      <path d="M8 4v4l2.5 1.5" stroke="#00BCD4" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function ProgressBar({ pct, color = '#00BCD4' }: { pct: number; color?: string }) {
  return (
    <div style={{ height:5, borderRadius:99, background:'#F3F4F6', margin:'10px 0 4px', overflow:'hidden' }}>
      <div style={{ height:'100%', width:`${Math.min(pct,100)}%`, background:color, borderRadius:99, transition:'width 0.6s' }} />
    </div>
  )
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'#1F2937', color:'#fff', borderRadius:10, padding:'9px 13px', fontSize:11, minWidth:150 }}>
      <div style={{ fontWeight:600, marginBottom:6 }}>{label} 2026</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ display:'flex', alignItems:'center', gap:6, marginBottom:3 }}>
          <div style={{ width:8, height:8, borderRadius:2, background:p.fill }} />
          <span style={{ color:'rgba(255,255,255,0.75)' }}>{p.name==='ingresos'?'Ingresos':'Gastos'}: {formatCurrency(p.value)}</span>
        </div>
      ))}
      <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:3 }}>
        <div style={{ width:8, height:2, background:'#16A34A' }} />
        <span style={{ color:'rgba(255,255,255,0.75)' }}>PE: {formatCurrency(puntoEquilibrio)} ✓</span>
      </div>
    </div>
  )
}

function Badge({ children, color, bg }: { children: React.ReactNode; color: string; bg: string }) {
  return <span style={{ fontSize:9, fontWeight:600, color, background:bg, padding:'2px 7px', borderRadius:99 }}>{children}</span>
}

export default function Dashboard() {
  const supervivencia = 5620
  const resistenciaDias = 47
  const fiscalReserva = 2720
  const fiscalEstimado = 3900
  const fiscalPct = Math.round((fiscalReserva / fiscalEstimado) * 100)
  const rendimientoPct = 66
  const facturado = 6100
  const objetivo = 9200
  const cobrosTotal = 12680
  const cobros30 = 2500
  const cobros60 = 5300
  const cobros90 = 4880

  return (
    <Layout title="Dashboard">

      {/* TOP 3 KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, flexShrink:0 }}>

        {/* SUPERVIVENCIA */}
        <div style={S.card}>
          <div style={S.label}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="#9CA3AF" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><path d="M8 4v4"/><circle cx="8" cy="11" r="0.5" fill="#9CA3AF"/></svg>
            Supervivencia · Tu dinero real hoy
          </div>
          <div style={S.bigNum}>{formatCurrency(supervivencia)}</div>
          <div style={S.sub}>Tras pagar todo lo comprometido este mes.</div>
          <ProgressBar pct={62} color="#00BCD4" />
          <div style={S.iaTag}><IAIcon />Recomendación IA</div>
          <div style={S.iaText}>Posición sólida. Reserva <strong>{formatCurrency(fiscalReserva)}</strong> en subcuenta separada para el IVA del 20 de julio — ese dinero no es tuyo.</div>
        </div>

        {/* RESISTENCIA */}
        <div style={S.card}>
          <div style={S.label}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="#9CA3AF" strokeWidth="1.5"><path d="M8 2a6 6 0 100 12A6 6 0 008 2z"/><path d="M8 5v3l2 1"/></svg>
            Resistencia · Aguantas sin vender
          </div>
          <div style={S.bigNum}>{resistenciaDias} días</div>
          <div style={S.sub}>Si hoy deja de entrar dinero en la empresa</div>
          <ProgressBar pct={(resistenciaDias/90)*100} color={resistenciaDias >= 60 ? '#16A34A' : resistenciaDias >= 30 ? '#D97706' : '#DC2626'} />
          <div style={S.iaTag}><IAIcon />Recomendación IA</div>
          <div style={S.iaText}>Para llegar a <strong>60 días</strong> (zona segura), factura <strong>€1.500 más</strong> este mes o reduce gastos fijos en €180. Tienes 3 presupuestos pendientes.</div>
        </div>

        {/* FISCAL */}
        <div style={{ ...S.card, background:'#FFFBEB', borderColor:'#FDE68A' }}>
          <div style={{ ...S.label, color:'#B45309' }}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="#B45309" strokeWidth="1.5"><rect x="2" y="2" width="12" height="12" rx="1.5"/><line x1="2" y1="6" x2="14" y2="6"/><line x1="6" y1="2" x2="6" y2="6"/><line x1="10" y1="2" x2="10" y2="6"/></svg>
            Fiscal · Reserva para Hacienda
          </div>
          <div style={{ ...S.bigNum, color:'#92400E' }}>{formatCurrency(fiscalReserva)}</div>
          <ProgressBar pct={fiscalPct} color="#D97706" />
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'#92400E', marginBottom:4 }}>
            <span>T2 iniciado · IVA acumulado trimestre en curso</span>
            <span>vence 20 jul · 68 días</span>
          </div>
          <div style={{ ...S.iaTag, color:'#D97706' }}><IAIcon />Recomendación IA</div>
          <div style={{ ...S.iaText, color:'#78350F' }}>Si cierras junio con el ritmo actual, el IVA estimado subirá a <strong>~{formatCurrency(fiscalEstimado)}</strong>. Provisiona ahora. Vencimiento: <strong>20 julio</strong>, sin excepción.</div>
        </div>
      </div>

      {/* BOTTOM 2 KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, flexShrink:0 }}>

        {/* RENDIMIENTO MENSUAL */}
        <div style={S.card}>
          <div style={S.label}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="#9CA3AF" strokeWidth="1.5"><polyline points="2,12 6,7 9,9 13,4"/></svg>
            Rendimiento mensual · Punto de equilibrio
          </div>
          <div style={S.bigNum}>{rendimientoPct}%</div>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'#6B7280', marginTop:4 }}>
            <span>Facturado: {formatCurrency(facturado)}</span>
            <span>Objetivo: {formatCurrency(objetivo)}</span>
          </div>
          <ProgressBar pct={rendimientoPct} color="#00BCD4" />
          <div style={{ fontSize:12, color:'#374151', marginBottom:4 }}>Faltan <strong>{formatCurrency(objetivo - facturado)}</strong> para cubrir costes fijos del mes.</div>
          <div style={S.iaTag}><IAIcon />Recomendación IA</div>
          <div style={S.iaText}>Faltan <strong>18 días hábiles</strong> para cerrar el gap. Con tu ticket medio de <strong>€900</strong>, necesitas cerrar 3-4 presupuestos pendientes esta semana.</div>
        </div>

        {/* COBROS PENDIENTES */}
        <div style={S.card}>
          <div style={S.label}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="#9CA3AF" strokeWidth="1.5"><rect x="2" y="4" width="12" height="9" rx="1.5"/><path d="M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1"/><line x1="8" y1="9" x2="8" y2="9"/></svg>
            Cobros pendientes · Te deben en total
          </div>
          <div style={S.bigNum}>{formatCurrency(cobrosTotal)}</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, margin:'12px 0' }}>
            <div style={{ background:'#F3F4F6', borderRadius:10, padding:'10px 12px', textAlign:'center' as const }}>
              <div style={{ fontSize:10, color:'#6B7280', marginBottom:4 }}>&lt;30 días</div>
              <div style={{ fontSize:15, fontWeight:600, color:'#111827' }}>{formatCurrency(cobros30)}</div>
            </div>
            <div style={{ background:'#FEF3C7', borderRadius:10, padding:'10px 12px', textAlign:'center' as const }}>
              <div style={{ fontSize:10, color:'#92400E', marginBottom:4 }}>31-60 días</div>
              <div style={{ fontSize:15, fontWeight:600, color:'#92400E' }}>{formatCurrency(cobros60)}</div>
            </div>
            <div style={{ background:'#FEE2E2', borderRadius:10, padding:'10px 12px', textAlign:'center' as const }}>
              <div style={{ fontSize:10, color:'#991B1B', marginBottom:4 }}>+60 días ⚠</div>
              <div style={{ fontSize:15, fontWeight:600, color:'#991B1B' }}>{formatCurrency(cobros90)}</div>
            </div>
          </div>
          <div style={S.iaTag}><IAIcon />Recomendación IA</div>
          <div style={S.iaText}><strong>Llama hoy a Mercadona</strong> (91 días vencida, €2.800). Cada semana reduce un 8% la probabilidad de cobro. Los €5.300 de Lantero vencen en 16 días — anticípate.</div>
        </div>
      </div>

      {/* CHART */}
      <div style={{ ...S.card, flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
          <span style={{ fontSize:13, fontWeight:600, color:'#111827' }}>Evolución financiera</span>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:10, color:'#6B7280' }}>
              <div style={{ width:10, height:10, borderRadius:3, background:'linear-gradient(180deg,#B2EBF2,#00BCD4)' }} />Ingresos
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:10, color:'#6B7280' }}>
              <div style={{ width:10, height:10, borderRadius:3, background:'linear-gradient(180deg,#7986CB,#0D2E6E)' }} />Gastos
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:10, color:'#16A34A' }}>
              <div style={{ width:14, height:0, borderTop:'2px solid #16A34A' }} />Punto de equilibrio
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={mockEvolucion} barGap={4} margin={{ top:4, right:4, left:0, bottom:0 }}>
            <CartesianGrid strokeDasharray="0" stroke="#F3F4F6" vertical={false} />
            <XAxis dataKey="mes" tick={{ fontSize:9, fill:'#9CA3AF' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize:8, fill:'#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={v=>`€${v/1000}k`} width={36} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill:'rgba(0,0,0,0.03)' }} />
            <ReferenceLine y={puntoEquilibrio} stroke="#16A34A" strokeWidth={1.5} label={{ value:'PE', position:'insideLeft', fontSize:8, fill:'#16A34A', dy:-6 }} />
            <Bar dataKey="ingresos" name="ingresos" radius={[6,6,0,0]} maxBarSize={42}>
              {mockEvolucion.map((_,i) => <Cell key={i} fill={i===3?'#00ACC1':'#B2EBF2'} />)}
            </Bar>
            <Bar dataKey="gastos" name="gastos" radius={[4,4,0,0]} maxBarSize={10}>
              {mockEvolucion.map((_,i) => <Cell key={i} fill={i===3?'#0D2E6E':'#7986CB'} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* PREVISIONES */}
      <div style={{ ...S.card }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
          <span style={{ fontSize:13, fontWeight:600, color:'#111827' }}>Previsiones</span>
          <div style={{ display:'flex', gap:7 }}>
            <div style={{ display:'flex', alignItems:'center', gap:5, background:'#F8F9FB', border:'1px solid #E5E7EB', borderRadius:7, padding:'5px 9px' }}>
              <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="#9CA3AF" strokeWidth="1.5"><circle cx="7" cy="7" r="5"/><path d="M11 11l3 3"/></svg>
              <span style={{ fontSize:10, color:'#9CA3AF' }}>Buscar</span>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:4, fontSize:10, color:'#6B7280', background:'#fff', border:'1px solid #E5E7EB', borderRadius:7, padding:'5px 9px', cursor:'pointer' }}>
              <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="#6B7280" strokeWidth="1.5"><path d="M2 4h12M5 8h6"/></svg>
              Filtrar
            </div>
          </div>
        </div>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr>
              {['Concepto','Vencimiento','Categoría','Periodicidad','Importe estimado','Estado','Días restantes',''].map(h => (
                <th key={h} style={{ fontSize:10, fontWeight:600, color:'#9CA3AF', textAlign:'left', padding:'5px 8px', borderBottom:'1px solid #F3F4F6' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockPrevisiones.map(p => (
              <tr key={p.id}>
                <td style={{ padding:'7px 8px', borderBottom:'1px solid #F3F4F6' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{
                      width:26, height:26, borderRadius:7, flexShrink:0,
                      background: p.categoria==='Fiscal'?'#FEF3C7':p.categoria==='Gasto fijo'?'#FEE2E2':'#F5F3FF',
                      color: p.categoria==='Fiscal'?'#D97706':p.categoria==='Gasto fijo'?'#DC2626':'#7C3AED',
                      display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700
                    }}>
                      {p.categoria==='Fiscal'?'€':p.categoria==='Gasto fijo'?'↓':'S'}
                    </div>
                    <div>
                      <div style={{ fontWeight:500, fontSize:11, color:'#111827' }}>{p.concepto}</div>
                      <div style={{ fontSize:10, color:'#9CA3AF' }}>{p.detalle}</div>
                    </div>
                  </div>
                </td>
                <td style={{ fontSize:11, color:'#6B7280', padding:'7px 8px', borderBottom:'1px solid #F3F4F6' }}>{formatDate(p.vencimiento)}</td>
                <td style={{ padding:'7px 8px', borderBottom:'1px solid #F3F4F6' }}>
                  <Badge
                    color={p.categoria==='Fiscal'?'#D97706':p.categoria==='Gasto fijo'?'#DC2626':'#7C3AED'}
                    bg={p.categoria==='Fiscal'?'#FFFBEB':p.categoria==='Gasto fijo'?'#FEF2F2':'#F5F3FF'}
                  >{p.categoria}</Badge>
                </td>
                <td style={{ fontSize:11, color:'#6B7280', padding:'7px 8px', borderBottom:'1px solid #F3F4F6' }}>{p.periodicidad}</td>
                <td style={{ fontSize:11, fontWeight:600, padding:'7px 8px', borderBottom:'1px solid #F3F4F6', color:p.categoria==='Fiscal'?'#D97706':'#DC2626' }}>{formatCurrency(p.importe)}</td>
                <td style={{ padding:'7px 8px', borderBottom:'1px solid #F3F4F6' }}>
                  <Badge
                    color={p.estado==='Pendiente'?'#D97706':'#6B7280'}
                    bg={p.estado==='Pendiente'?'#FFFBEB':'#F3F4F6'}
                  >{p.estado}</Badge>
                </td>
                <td style={{ padding:'7px 8px', borderBottom:'1px solid #F3F4F6' }}>
                  <span style={{ fontSize:10, fontWeight:500, color:p.urgente?'#DC2626':p.diasRestantes<=30?'#D97706':'#6B7280' }}>{p.diasRestantes} días</span>
                </td>
                <td style={{ fontSize:14, color:'#9CA3AF', padding:'7px 8px', borderBottom:'1px solid #F3F4F6', letterSpacing:1, cursor:'pointer' }}>···</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  )
}
