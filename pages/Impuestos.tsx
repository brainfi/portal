import Layout from '@/components/Layout'

const trimestre = 'Q2 2026'
const fechaLimite = '20 jul 2026'
const diasRestantes = 68

const modelos = [
  { codigo:'303', nombre:'IVA Trimestral', descripcion:'Liquidación trimestral del IVA', estimado:3900, provisionado:2720, base:'Ventas sujetas a IVA del trimestre', tipo:'21%', fechaLimite:'20 jul 2026', diasRestantes:68 },
  { codigo:'111', nombre:'IRPF Retenciones', descripcion:'Retenciones e ingresos a cuenta', estimado:4200, provisionado:3100, base:'Nóminas y honorarios profesionales', tipo:'15%', fechaLimite:'20 jul 2026', diasRestantes:68 },
  { codigo:'115', nombre:'Ret. Alquileres', descripcion:'Retenciones sobre arrendamientos', estimado:630, provisionado:630, base:'Alquiler oficina · 2.100€/mes', tipo:'19%', fechaLimite:'20 jul 2026', diasRestantes:68 },
]

const historico = [
  { periodo:'Q1 2026', modelo:'303', nombre:'IVA', importe:3200, estado:'Presentado', fecha:'20 abr 2026' },
  { periodo:'Q1 2026', modelo:'111', nombre:'IRPF Retenciones', importe:3800, estado:'Presentado', fecha:'20 abr 2026' },
  { periodo:'Q1 2026', modelo:'115', nombre:'Ret. Alquileres', importe:630, estado:'Presentado', fecha:'20 abr 2026' },
]

const totalEstimado = modelos.reduce((a,m) => a+m.estimado, 0)
const totalProvisionado = modelos.reduce((a,m) => a+m.provisionado, 0)

function fmt(n: number) { return n.toLocaleString('es-ES') + ' €' }

function Barras({ pct }: { pct: number }) {
  const total = 20
  const filled = Math.round(pct / 100 * total)
  return (
    <div style={{ display:'flex', gap:3 }}>
      {Array.from({ length: total }).map((_,i) => (
        <div key={i} style={{ flex:1, height:22, borderRadius:3, background: i < filled ? '#4361EE' : '#EEF1FD' }} />
      ))}
    </div>
  )
}

function Badge({ estado }: { estado: string }) {
  const s: Record<string,{bg:string;color:string}> = {
    'Presentado': { bg:'#EAFAF0', color:'#1a7a3a' },
    'Pendiente':  { bg:'#FFF8E6', color:'#92400E' },
    'Fuera de plazo': { bg:'#FEF2F2', color:'#b91c1c' },
  }
  const st = s[estado] ?? { bg:'#F4F5F7', color:'#888' }
  return <span style={{ fontSize:11, fontWeight:600, padding:'3px 9px', borderRadius:99, background:st.bg, color:st.color, whiteSpace:'nowrap' }}>{estado}</span>
}

const card: React.CSSProperties = { background:'#fff', borderRadius:14, border:'1px solid #E8E8EC', padding:'20px 22px' }
const hdr: React.CSSProperties = { fontSize:10, color:'#B0B7C3', fontWeight:600, paddingBottom:10, borderBottom:'1px solid #ECEEF3', marginBottom:4 }

export default function Impuestos() {
  return (
    <Layout title="Impuestos">
      <style>{`
        @media (max-width: 900px) { .imp-grid { grid-template-columns: 1fr !important; } }
        @media (max-width: 768px) {
          .imp-hide { display: none !important; }
          .imp-grid { grid-template-columns: 1fr !important; }
          .imp-tbl-hdr { grid-template-columns: 70px 1fr 80px 100px !important; }
          .imp-tbl-row { grid-template-columns: 70px 1fr 80px 100px !important; }
        }
      `}</style>



      <div className="imp-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
        {modelos.map(m => {
          const pct = Math.min(100, Math.round(m.provisionado / m.estimado * 100))
          const falta = m.estimado - m.provisionado
          return (
            <div key={m.codigo} style={card}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
                <div>
                  <div style={{ fontSize:9, fontWeight:700, color:'#B0B7C3', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:3 }}>Mod. {m.codigo}</div>
                  <div style={{ fontSize:13, fontWeight:700, color:'#1a1a1a' }}>{m.nombre}</div>
                  <div style={{ fontSize:11, color:'#888', marginTop:1 }}>{m.descripcion}</div>
                </div>
                <span style={{ background:'#EEF1FD', borderRadius:8, padding:'4px 8px', fontSize:11, fontWeight:600, color:'#4361EE', flexShrink:0 }}>{m.tipo}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:10 }}>
                <div><div style={{ fontSize:9, fontWeight:700, color:'#B0B7C3', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:3 }}>Provisionado</div><div style={{ fontSize:20, fontWeight:700, color:'#1a1a1a' }}>{fmt(m.provisionado)}</div></div>
                <div style={{ textAlign:'right' }}><div style={{ fontSize:9, fontWeight:700, color:'#B0B7C3', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:3 }}>Estimado</div><div style={{ fontSize:16, fontWeight:600, color:'#888' }}>{fmt(m.estimado)}</div></div>
              </div>
              <Barras pct={pct} />
              <div style={{ display:'flex', justifyContent:'space-between', marginTop:6 }}>
                <span style={{ fontSize:11, fontWeight:600, color:'#4361EE' }}>{pct}% provisionado</span>
                {falta > 0
                  ? <span style={{ fontSize:11, color:'#EF4444', fontWeight:500 }}>Faltan {fmt(falta)}</span>
                  : <span style={{ fontSize:11, color:'#2DC653', fontWeight:500 }}>✓ Completo</span>
                }
              </div>
              <div style={{ marginTop:12, paddingTop:10, borderTop:'1px solid #F4F5F7', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontSize:10, color:'#B0B7C3' }}>Base: {m.base}</span>
                <span style={{ fontSize:11, fontWeight:600, color: m.diasRestantes < 30 ? '#EF4444' : '#F4A100', background: m.diasRestantes < 30 ? '#FEF2F2' : '#FFF8E6', padding:'2px 8px', borderRadius:99 }}>
                  {m.fechaLimite} · {m.diasRestantes}d
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <div style={card}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <div>
            <div style={{ fontSize:15, fontWeight:700, color:'#1a1a1a' }}>Histórico {new Date().getFullYear()}</div>
            <div style={{ fontSize:11, color:'#888', marginTop:2 }}>Declaraciones presentadas y pendientes</div>
          </div>
          <div style={{ fontSize:11, color:'#888', background:'#F4F5F7', padding:'4px 10px', borderRadius:6 }}>
            {historico.filter(h => h.estado === 'Presentado').length} de {historico.length} presentadas
          </div>
        </div>
        <div className="imp-tbl-hdr" style={{ display:'grid', gridTemplateColumns:'80px 1fr 100px 80px 120px 90px', ...hdr }}>
          <span>Periodo</span><span>Modelo</span><span className="imp-hide">Tipo</span><span style={{ textAlign:'right' }}>Importe</span><span>Estado</span><span className="imp-hide" style={{ textAlign:'center' }}>Archivo</span>
        </div>
        {historico.map((h,i) => (
          <div key={i} className="imp-tbl-row" style={{ display:'grid', gridTemplateColumns:'80px 1fr 100px 80px 120px 90px', alignItems:'center', padding:'11px 0', borderBottom: i < historico.length-1 ? '1px solid #F4F5F7' : 'none' }}>
            <span style={{ fontSize:11, fontWeight:600, color:'#888' }}>{h.periodo}</span>
            <div><div style={{ fontSize:12, fontWeight:500, color:'#1a1a1a' }}>Mod. {h.modelo} · {h.nombre}</div><div style={{ fontSize:10, color:'#B0B7C3' }}>{h.fecha}</div></div>
            <span className="imp-hide" style={{ fontSize:11, color:'#888' }}>AEAT</span>
            <span style={{ fontSize:12, fontWeight:600, color:'#1a1a1a', textAlign:'right' }}>{fmt(h.importe)}</span>
            <span><Badge estado={h.estado} /></span>
            <div className="imp-hide" style={{ textAlign:'center' }}>
              <button disabled title="Disponible cuando conectes tu ERP" style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:11, fontWeight:500, color:'#B0B7C3', background:'#F4F5F7', border:'1px solid #E8E8EC', borderRadius:6, padding:'4px 10px', cursor:'not-allowed' }}>
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 2v8M5 7l3 3 3-3"/><path d="M3 13h10"/></svg>
                PDF
              </button>
            </div>
          </div>
        ))}
        <div style={{ display:'flex', justifyContent:'space-between', paddingTop:12, marginTop:4, borderTop:'1px solid #ECEEF3' }}>
          <span style={{ fontSize:11, color:'#888' }}>Total declarado {new Date().getFullYear()}</span>
          <span style={{ fontSize:15, fontWeight:700, color:'#1a1a1a' }}>{fmt(historico.reduce((a,h) => a+h.importe, 0))}</span>
        </div>
      </div>



    </Layout>
  )
}
