import Layout from '@/components/Layout'

const card: React.CSSProperties = { background:'#fff', borderRadius:16, border:'1px solid #E8E8EC' }

const activas = [
  {
    nombre: 'Holded',
    descripcion: 'ERP en la nube para facturación, contabilidad e inventario. Sincroniza tus datos automáticamente con brainfi.',
    estado: 'Conectado',
    partner: true,
    iconBg: '#EEF1FD',
    iconColor: '#4361EE',
    icon: 'ti-building-store',
  },
]

const proximamente = [
  { nombre:'Sage',         descripcion:'Software de gestión empresarial y contabilidad.',         iconBg:'#EEF1FD', iconColor:'#4361EE', icon:'ti-chart-dots' },
  { nombre:'Odoo',         descripcion:'Suite ERP open source con módulos para toda la empresa.', iconBg:'#F0F9F4', iconColor:'#2DC653', icon:'ti-layout-grid' },
  { nombre:'Quipu',        descripcion:'Facturación y contabilidad para autónomos y pymes.',       iconBg:'#FFF8E6', iconColor:'#F4A100', icon:'ti-receipt' },
  { nombre:'Contasimple',  descripcion:'Contabilidad simplificada para pequeños negocios.',        iconBg:'#FEF0F0', iconColor:'#EF4444', icon:'ti-calculator' },
  { nombre:'Anfix',        descripcion:'Facturación y gestión fiscal para autónomos.',             iconBg:'#F0F9F4', iconColor:'#2DC653', icon:'ti-file-invoice' },
]

export default function Integraciones() {
  return (
    <Layout title="Integraciones">
      <style>{`
        @media (max-width: 900px) { .int-grid { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 600px) { .int-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      <div style={{ fontSize:9, fontWeight:600, color:'#999', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:4 }}>Integración activa</div>
      {activas.map(a => (
        <div key={a.nombre} style={{ ...card, padding:'22px 24px', display:'flex', alignItems:'center', gap:20 }}>
          <div style={{ width:48, height:48, borderRadius:12, background:a.iconBg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <i className={`ti ${a.icon}`} aria-hidden="true" style={{ fontSize:22, color:a.iconColor }} />
          </div>
          <div style={{ flex:1 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
              <span style={{ fontSize:15, fontWeight:600, color:'#1a1a1a' }}>{a.nombre}</span>
              {a.partner && (
                <span style={{ fontSize:10, fontWeight:600, background:'#EEF1FD', color:'#4361EE', borderRadius:99, padding:'2px 8px' }}>Partner oficial</span>
              )}
            </div>
            <div style={{ fontSize:13, color:'#888', lineHeight:1.5 }}>{a.descripcion}</div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
            <div style={{ width:7, height:7, borderRadius:'50%', background:'#2DC653' }} />
            <span style={{ fontSize:12, fontWeight:600, color:'#2DC653' }}>{a.estado}</span>
          </div>
        </div>
      ))}

      <div style={{ fontSize:9, fontWeight:600, color:'#999', textTransform:'uppercase', letterSpacing:'0.12em', marginTop:8, marginBottom:4 }}>Otras integraciones</div>
      <div className="int-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
        {proximamente.map(p => (
          <div key={p.nombre} style={{ ...card, padding:'20px 22px', opacity:0.65 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
              <div style={{ width:40, height:40, borderRadius:10, background:p.iconBg, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <i className={`ti ${p.icon}`} aria-hidden="true" style={{ fontSize:20, color:p.iconColor }} />
              </div>
              <span style={{ fontSize:10, fontWeight:600, color:'#B0B7C3', background:'#F4F5F7', borderRadius:99, padding:'3px 9px' }}>Próximamente</span>
            </div>
            <div style={{ fontSize:14, fontWeight:600, color:'#1a1a1a', marginBottom:6 }}>{p.nombre}</div>
            <div style={{ fontSize:12, color:'#aaa', lineHeight:1.5 }}>{p.descripcion}</div>
          </div>
        ))}
      </div>

    </Layout>
  )
}
