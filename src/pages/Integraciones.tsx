import Layout from '@/components/Layout'

const card: React.CSSProperties = { background:'#fff', borderRadius:16, border:'1px solid #E8E8EC' }

const integraciones = [
  { nombre:'Holded', descripcion:'ERP en la nube para facturación, contabilidad e inventario. Sincroniza tus datos automáticamente con brainfi.', partner:true, activa:true, iconBg:'#EEF1FD', iconColor:'#4361EE', icon:'ti-building-store' },
  { nombre:'Sage', descripcion:'Software de gestión empresarial y contabilidad.', activa:false, partner:false, iconBg:'#EEF1FD', iconColor:'#4361EE', icon:'ti-chart-dots' },
  { nombre:'Odoo', descripcion:'Suite ERP open source con módulos para toda la empresa.', activa:false, partner:false, iconBg:'#F0F9F4', iconColor:'#2DC653', icon:'ti-layout-grid' },
  { nombre:'Quipu', descripcion:'Facturación y contabilidad para autónomos y pymes.', activa:false, partner:false, iconBg:'#FFF8E6', iconColor:'#F4A100', icon:'ti-receipt' },
  { nombre:'Contasimple', descripcion:'Contabilidad simplificada para pequeños negocios.', activa:false, partner:false, iconBg:'#FEF0F0', iconColor:'#EF4444', icon:'ti-calculator' },
  { nombre:'Anfix', descripcion:'Facturación y gestión fiscal para autónomos.', activa:false, partner:false, iconBg:'#F0F9F4', iconColor:'#2DC653', icon:'ti-file-invoice' },
]

const activas = integraciones.filter(i => i.activa)
const otras = integraciones.filter(i => !i.activa)

function Card({ i }: { i: typeof integraciones[0] }) {
  return (
    <div style={{ ...card, padding:'20px 22px', opacity: i.activa ? 1 : 0.65 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
        <div style={{ width:40, height:40, borderRadius:10, background:i.iconBg, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <i className={`ti ${i.icon}`} aria-hidden="true" style={{ fontSize:20, color:i.iconColor }} />
        </div>
        {i.activa
          ? <span style={{ fontSize:10, fontWeight:600, background:'#EEF1FD', color:'#4361EE', borderRadius:99, padding:'3px 9px' }}>Partner oficial</span>
          : <span style={{ fontSize:10, fontWeight:600, color:'#B0B7C3', background:'#F4F5F7', borderRadius:99, padding:'3px 9px' }}>Próximamente</span>
        }
      </div>
      <div style={{ fontSize:14, fontWeight:600, color:'#1a1a1a', marginBottom:6 }}>{i.nombre}</div>
      <div style={{ fontSize:12, color:'#aaa', lineHeight:1.5 }}>{i.descripcion}</div>
    </div>
  )
}

export default function Integraciones() {
  return (
    <Layout title="Integraciones">
      <style>{`
        @media (max-width: 900px) { .int-grid { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 600px) { .int-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      <div style={{ fontSize:9, fontWeight:600, color:'#999', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:4 }}>Integración activa</div>
      <div className="int-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
        {activas.map(i => <Card key={i.nombre} i={i} />)}
      </div>

      <div style={{ fontSize:9, fontWeight:600, color:'#999', textTransform:'uppercase', letterSpacing:'0.12em', marginTop:8, marginBottom:4 }}>Otras integraciones</div>
      <div className="int-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
        {otras.map(i => <Card key={i.nombre} i={i} />)}
      </div>

    </Layout>
  )
}
