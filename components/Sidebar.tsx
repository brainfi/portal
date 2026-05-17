import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

const navGroups = [
  {
    section: 'General',
    items: [
      { label: 'Dashboard', path: '/', icon: <GridIcon />, disabled: false },
      { label: 'Análisis financiero', path: '/analisis', icon: <ChartIcon />, disabled: true },
      { label: 'Impuestos', path: '/impuestos', icon: <CalIcon />, disabled: true },
    ]
  },
  {
    section: 'Admin',
    items: [
      { label: 'Ajustes', path: '/ajustes', icon: <SettingsIcon />, disabled: false },
      { label: 'Integraciones', path: '/integraciones', icon: <PlugIcon />, disabled: true },
      { label: 'Help desk', path: '/help', icon: <HelpIcon />, disabled: true },
    ]
  }
]

interface SidebarProps {
  onClose?: () => void
}

export default function Sidebar({ onClose }: SidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { signOut, user } = useAuth()
  const name = user?.email?.split('@')[0] ?? 'Usuario'
  const displayName = name.charAt(0).toUpperCase() + name.slice(1)
  const initials = displayName.slice(0, 2).toUpperCase()

  const handleNav = (path: string, disabled: boolean) => {
    if (disabled) return
    navigate(path)
    onClose?.()
  }

  return (
    <aside style={{ width:210, background:'#fff', borderRight:'1px solid #EAECF0', display:'flex', flexDirection:'column', height:'100vh' }}>

      {/* Logo */}
      <div style={{ padding:'20px 18px 16px', borderBottom:'1px solid #EAECF0', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:28, height:28, background:'linear-gradient(135deg,#00BCD4,#0D2E6E)', borderRadius:7, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <span style={{ fontFamily:'Nunito, sans-serif', fontWeight:800, fontSize:16, color:'white', lineHeight:1 }}>b</span>
          </div>
          <span style={{ fontFamily:'Nunito, sans-serif', fontWeight:800, fontSize:17, letterSpacing:'-0.5px', color:'#111827', lineHeight:1 }}>brainfi</span>
        </div>
        {/* Close button móvil */}
        {onClose && (
          <button onClick={onClose} style={{ display:'flex', alignItems:'center', justifyContent:'center', width:24, height:24, border:'none', background:'transparent', cursor:'pointer', color:'#9CA3AF' }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 3l10 10M13 3L3 13"/></svg>
          </button>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex:1, padding:'12px 10px', overflowY:'auto' }}>
        {navGroups.map(group => (
          <div key={group.section}>
            <div style={{ fontSize:9, fontWeight:600, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.08em', padding:'0 8px', margin:'14px 0 6px' }}>
              {group.section}
            </div>
            {group.items.map(item => {
              const isActive = location.pathname === item.path && !item.disabled
              return (
                <button key={item.label} onClick={() => handleNav(item.path, item.disabled)}
                  style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 10px', fontSize:12, width:'100%', border:'none', borderRadius:8, marginBottom:1, textAlign:'left', background: isActive ? '#F0F9FF' : 'transparent', color: isActive ? '#111827' : item.disabled ? '#D1D5DB' : '#6B7280', fontWeight: isActive ? 500 : 400, opacity: item.disabled ? 0.5 : 1, cursor: item.disabled ? 'not-allowed' : 'pointer' }}>
                  <span style={{ opacity: isActive ? 1 : 0.7, flexShrink:0, display:'flex' }}>{item.icon}</span>
                  {item.label}
                </button>
              )
            })}
          </div>
        ))}
        <div style={{ marginTop:8 }}>
          <button onClick={() => signOut()} style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 10px', fontSize:12, width:'100%', border:'none', borderRadius:8, textAlign:'left', background:'transparent', color:'#DC2626', cursor:'pointer', fontWeight:400 }}>
            <LogoutIcon />Cerrar sesión
          </button>
        </div>
      </nav>

      {/* User */}
      <div style={{ padding:12, borderTop:'1px solid #EAECF0' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 6px', borderRadius:8 }}>
          <div style={{ width:28, height:28, borderRadius:'50%', background:'linear-gradient(135deg,#00BCD4,#0D2E6E)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:600, color:'#fff', flexShrink:0 }}>{initials}</div>
          <div>
            <div style={{ fontSize:11, fontWeight:500, color:'#111827' }}>{displayName}</div>
            <div style={{ fontSize:9, color:'#9CA3AF' }}>Admin · Mi empresa</div>
          </div>
        </div>
      </div>
    </aside>
  )
}

function GridIcon() { return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="1" width="6" height="6" rx="1.5"/><rect x="9" y="1" width="6" height="6" rx="1.5"/><rect x="1" y="9" width="6" height="6" rx="1.5"/><rect x="9" y="9" width="6" height="6" rx="1.5"/></svg> }
function ChartIcon() { return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 4h12M2 8h12M2 12h8"/></svg> }
function CalIcon() { return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="12" height="12" rx="1.5"/><line x1="2" y1="6" x2="14" y2="6"/><line x1="6" y1="2" x2="6" y2="6"/><line x1="10" y1="2" x2="10" y2="6"/></svg> }
function SettingsIcon() { return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="2.5"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2"/></svg> }
function PlugIcon() { return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="4" width="14" height="9" rx="1.5"/><circle cx="8" cy="8.5" r="1.5"/></svg> }
function HelpIcon() { return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><path d="M8 5v3"/></svg> }
function LogoutIcon() { return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M10 11l3-3-3-3M13 8H6"/></svg> }
