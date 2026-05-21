import Layout from '@/components/Layout'
import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'

const card: React.CSSProperties = { background:'#fff', borderRadius:14, border:'1px solid #E8E8EC', padding:'20px 24px', marginBottom:14 }
const row: React.CSSProperties = { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 0', borderBottom:'1px solid #F4F5F7' }
const rowLast: React.CSSProperties = { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 0' }
const lbl: React.CSSProperties = { fontSize:13, fontWeight:500, color:'#1a1a1a', marginBottom:2 }
const sub: React.CSSProperties = { fontSize:11, color:'#B0B7C3' }
const inputStyle: React.CSSProperties = { padding:'9px 12px', fontSize:13, border:'1px solid #E8E8EC', borderRadius:8, outline:'none', background:'#F9FAFB', color:'#1a1a1a', width:220, fontFamily:'Inter, sans-serif' }
const sectionTitle: React.CSSProperties = { fontSize:10, fontWeight:700, color:'#B0B7C3', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:8 }

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <div onClick={onToggle} style={{ width:36, height:20, background: on ? '#4361EE' : '#E8E8EC', borderRadius:99, position:'relative', cursor:'pointer', flexShrink:0, transition:'background .15s' }}>
      <div style={{ position:'absolute', width:14, height:14, background:'#fff', borderRadius:'50%', top:3, left: on ? 19 : 3, transition:'left .15s' }} />
    </div>
  )
}

export default function Ajustes() {
  const { user, signOut } = useAuth()
  const [nombre, setNombre] = useState('')
  const [empresa, setEmpresa] = useState('')
  const [nif, setNif] = useState('')
  const [iva, setIva] = useState('General (21%)')
  const [saved, setSaved] = useState(false)
  const [notifFiscal, setNotifFiscal] = useState(true)
  const [notifResumen, setNotifResumen] = useState(true)
  const [notifCobros, setNotifCobros] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <Layout title="Ajustes">
      <style>{`
        @media (max-width: 768px) {
          .aj-row { flex-direction: column !important; align-items: flex-start !important; gap: 8px; }
          .aj-input { width: 100% !important; }
        }
      `}</style>

      <div style={{ maxWidth:680 }}>

        {/* CUENTA */}
        <div style={sectionTitle}>Cuenta</div>
        <div style={card}>
          <div className="aj-row" style={row}>
            <div><div style={lbl}>Nombre</div><div style={sub}>Tu nombre en el portal</div></div>
            <input className="aj-input" type="text" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Tu nombre" style={inputStyle}/>
          </div>
          <div className="aj-row" style={rowLast}>
            <div><div style={lbl}>Email</div><div style={sub}>Email de acceso · no editable</div></div>
            <input className="aj-input" type="email" value={user?.email ?? ''} disabled style={{ ...inputStyle, color:'#B0B7C3', cursor:'not-allowed' }}/>
          </div>

          <div style={{ paddingTop:14, display:'flex', justifyContent:'flex-end' }}>
            <button onClick={handleSave} style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'8px 16px', fontSize:13, fontWeight:500, borderRadius:8, border:'none', background: saved ? '#2DC653' : '#4361EE', color:'#fff', cursor:'pointer', fontFamily:'Inter, sans-serif' }}>
              {saved ? '✓ Guardado' : 'Guardar cambios'}
            </button>
          </div>
        </div>

        {/* EMPRESA */}
        <div style={sectionTitle}>Empresa</div>
        <div style={card}>
          <div className="aj-row" style={row}>
            <div><div style={lbl}>Nombre de empresa</div><div style={sub}>Aparece en el portal y reportes</div></div>
            <input className="aj-input" type="text" value={empresa} onChange={e => setEmpresa(e.target.value)} placeholder="Mi empresa S.L." style={inputStyle}/>
          </div>
          <div className="aj-row" style={row}>
            <div><div style={lbl}>NIF / CIF</div><div style={sub}>Identificación fiscal</div></div>
            <input className="aj-input" type="text" value={nif} onChange={e => setNif(e.target.value)} placeholder="B12345678" style={inputStyle}/>
          </div>
          <div className="aj-row" style={rowLast}>
            <div><div style={lbl}>Régimen de IVA</div><div style={sub}>Afecta al cálculo de modelos fiscales</div></div>
            <select value={iva} onChange={e => setIva(e.target.value)} style={{ ...inputStyle, appearance:'auto' }}>
              <option>General (21%)</option>
              <option>Reducido (10%)</option>
              <option>Superreducido (4%)</option>
            </select>
          </div>
          <div style={{ paddingTop:14, display:'flex', justifyContent:'flex-end' }}>
            <button onClick={handleSave} style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'8px 16px', fontSize:13, fontWeight:500, borderRadius:8, border:'none', background: saved ? '#2DC653' : '#4361EE', color:'#fff', cursor:'pointer', fontFamily:'Inter, sans-serif' }}>
              {saved ? '✓ Guardado' : 'Guardar cambios'}
            </button>
          </div>
        </div>

        {/* NOTIFICACIONES */}
        <div style={sectionTitle}>Notificaciones</div>
        <div style={card}>
          <div style={row}>
            <div><div style={lbl}>Alertas fiscales</div><div style={sub}>Aviso antes del vencimiento de modelos</div></div>
            <Toggle on={notifFiscal} onToggle={() => setNotifFiscal(!notifFiscal)}/>
          </div>
          <div style={row}>
            <div><div style={lbl}>Resumen semanal</div><div style={sub}>Email con el resumen financiero</div></div>
            <Toggle on={notifResumen} onToggle={() => setNotifResumen(!notifResumen)}/>
          </div>
          <div style={rowLast}>
            <div><div style={lbl}>Alertas de cobros vencidos</div><div style={sub}>Cuando una factura lleva más de 30 días sin cobrar</div></div>
            <Toggle on={notifCobros} onToggle={() => setNotifCobros(!notifCobros)}/>
          </div>
        </div>

        {/* ZONA PELIGRO */}
        <div style={sectionTitle}>Zona de peligro</div>
        <div style={{ ...card, marginBottom:0 }}>
          <div style={row}>
            <div><div style={lbl}>Contraseña</div><div style={sub}>Cambia tu contraseña de acceso</div></div>
            <button style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'8px 16px', fontSize:13, fontWeight:500, borderRadius:8, border:'1px solid #E8E8EC', background:'#F4F5F7', color:'#555', cursor:'pointer', fontFamily:'Inter, sans-serif' }}>Cambiar contraseña</button>
          </div>
          <div style={row}>
            <div><div style={{ ...lbl, color:'#EF4444' }}>Cerrar sesión en todos los dispositivos</div><div style={sub}>Revoca todos los tokens activos</div></div>
            <button onClick={() => signOut()} style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'8px 16px', fontSize:13, fontWeight:500, borderRadius:8, border:'1px solid #FECACA', background:'#FEF2F2', color:'#EF4444', cursor:'pointer', fontFamily:'Inter, sans-serif' }}>Cerrar todas las sesiones</button>
          </div>
          <div style={rowLast}>
            <div><div style={{ ...lbl, color:'#EF4444' }}>Eliminar cuenta</div><div style={sub}>Acción irreversible · todos los datos se eliminarán</div></div>
            <button style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'8px 16px', fontSize:13, fontWeight:500, borderRadius:8, border:'1px solid #FECACA', background:'#FEF2F2', color:'#EF4444', cursor:'pointer', fontFamily:'Inter, sans-serif' }}>Eliminar cuenta</button>
          </div>
        </div>

      </div>
    </Layout>
  )
}
