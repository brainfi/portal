import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

const navGroups = [
  { section:'General', items:[
    { label:'Dashboard', path:'/', icon:<GridIcon/>, disabled:false },
    { label:'Análisis financiero', path:'/analisis', icon:<ChartIcon/>, disabled:true },
    { label:'Impuestos', path:'/impuestos', icon:<TaxIcon/>, disabled:true },
  ]},
  { section:'Admin', items:[
    { label:'Ajustes', path:'/ajustes', icon:<SettingsIcon/>, disabled:false },
    { label:'Integraciones', path:'/integraciones', icon:<PlugIcon/>, disabled:true },
    { label:'Help desk', path:'/help', icon:<HelpIcon/>, disabled:true },
  ]}
]

interface SidebarProps { onClose?: () => void }

export default function Sidebar({ onClose }: SidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { signOut, user } = useAuth()
  const name = user?.email?.split('@')[0] ?? 'Usuario'
  const displayName = name.charAt(0).toUpperCase() + name.slice(1)
  const initials = displayName.slice(0,2).toUpperCase()

  return (
    <aside style={{ width:190, background:'#fff', borderRight:'1px solid #ECEEF3', display:'flex', flexDirection:'column', height:'100vh' }}>
      <div style={{ padding:'18px 16px 14px', borderBottom:'1px solid #ECEEF3', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:26, height:26, background:'#4361EE', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 2h5a3 3 0 010 6H3V2z" fill="white"/><path d="M3 8h6a3 3 0 010 6H3V8z" fill="rgba(255,255,255,0.6)"/></svg>
          </div>
          <span style={{ fontSize:16, fontWeight:700, color:'#1A1D2E', letterSpacing:'-0.4px' }}>brainfi</span>
        </div>
        {onClose && (
          <button onClick={onClose} style={{ border:'none', background:'transparent', cursor:'pointer', color:'#B0B7C3' }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 3l10 10M13 3L3 13"/></svg>
          </button>
        )}
      </div>

      <nav style={{ flex:1, padding:'12px 8px', overflowY:'auto' }}>
        {navGroups.map(group => (
          <div key={group.section}>
            <div style={{ fontSize:9, color:'#B0B7C3', textTransform:'uppercase', letterSpacing:'0.1em', padding:'0 8px', margin:'12px 0 4px', fontWeight:500 }}>{group.section}</div>
            {group.items.map(item => {
              const isActive = location.pathname === item.path && !item.disabled
              return (
                <button key={item.label} onClick={() => { if (!item.disabled) { navigate(item.path); onClose?.() } }} style={{
                  display:'flex', alignItems:'center', gap:8, padding:'7px 10px', fontSize:12,
                  width:'100%', border:'none', borderRadius:8, marginBottom:2, textAlign:'left',
                  background: isActive ? '#EEF1FD' : 'transparent',
                  color: isActive ? '#4361EE' : item.disabled ? '#C8CDD6' : '#8A94A6',
                  fontWeight: isActive ? 500 : 400,
                  cursor: item.disabled ? 'not-allowed' : 'pointer',
                }}>
                  <span style={{ display:'flex', flexShrink:0 }}>{item.icon}</span>
                  {item.label}
                </button>
              )
            })}
          </div>
        ))}
        <div style={{ marginTop:8 }}>
          <button onClick={() => signOut()} style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 10px', fontSize:12, width:'100%', border:'none', borderRadius:8, textAlign:'left', background:'transparent', color:'#EF233C', cursor:'pointer' }}>
            <LogoutIcon/>Cerrar sesión
          </button>
        </div>
      </nav>

      <div style={{ padding:10, borderTop:'1px solid #ECEEF3', display:'flex', alignItems:'center', gap:8 }}>
        <div style={{ width:26, height:26, borderRadius:'50%', background:'linear-gradient(135deg,#4361EE,#7B93FF)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:600, color:'#fff', flexShrink:0 }}>{initials}</div>
        <div><div style={{ fontSize:11, fontWeight:600, color:'#1A1D2E' }}>{displayName}</div><div style={{ fontSize:9, color:'#B0B7C3' }}>Admin · Mi empresa</div></div>
      </div>
    </aside>
  )
}

function GridIcon() { return <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="1" width="6" height="6" rx="1.5"/><rect x="9" y="1" width="6" height="6" rx="1.5"/><rect x="1" y="9" width="6" height="6" rx="1.5"/><rect x="9" y="9" width="6" height="6" rx="1.5"/></svg> }
function ChartIcon() { return <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 4h12M2 8h12M2 12h8"/></svg> }
function TaxIcon() { return <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="12" height="12" rx="1.5"/><line x1="2" y1="6" x2="14" y2="6"/><line x1="6" y1="2" x2="6" y2="6"/><line x1="10" y1="2" x2="10" y2="6"/></svg> }
function SettingsIcon() { return <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="2.5"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2"/></svg> }
function PlugIcon() { return <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="4" width="14" height="9" rx="1.5"/><circle cx="8" cy="8.5" r="1.5"/></svg> }
function HelpIcon() { return <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><path d="M8 5v3"/></svg> }
function LogoutIcon() { return <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M10 11l3-3-3-3M13 8H6"/></svg> }
