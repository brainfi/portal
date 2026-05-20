import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

const navGroups = [
  {
    section: 'General',
    items: [
      { label: 'Dashboard', path: '/', icon: <GridIcon />, disabled: false },
      { label: 'Análisis financiero', path: '/analisis', icon: <ChartIcon />, disabled: true },
      { label: 'Impuestos', path: '/impuestos', icon: <TaxIcon />, disabled: true },
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

interface SidebarProps { onClose?: () => void }

const S = {
  sidebar: { width:210, background:'#131830', borderRight:'1px solid rgba(255,255,255,0.07)', display:'flex', flexDirection:'column' as const, height:'100vh' },
  logo: { padding:'20px 18px 16px', borderBottom:'1px solid rgba(255,255,255,0.07)', display:'flex', alignItems:'center', justifyContent:'space-between' },
  logoInner: { display:'flex', alignItems:'center', gap:9 },
  mark: { width:28, height:28, background:'#6C8BFF', borderRadius:7, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 as const },
  name: { fontSize:17, fontWeight:600, color:'#fff', letterSpacing:'-0.4px', fontFamily:'Inter, sans-serif' },
  nav: { flex:1, padding:'14px 10px', overflowY:'auto' as const },
  section: { fontSize:9, color:'rgba(255,255,255,0.25)', textTransform:'uppercase' as const, letterSpacing:'0.1em', padding:'0 8px', margin:'14px 0 5px', fontWeight:500 },
  bottom: { padding:12, borderTop:'1px solid rgba(255,255,255,0.07)', display:'flex', alignItems:'center', gap:8 },
  av: { width:28, height:28, borderRadius:'50%', background:'linear-gradient(135deg,#00D4E8,#6C8BFF)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:600, color:'#fff', flexShrink:0 as const },
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
    <aside style={S.sidebar}>
      <div style={S.logo}>
        <div style={S.logoInner}>
          <div style={S.mark}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 2h5a3 3 0 010 6H3V2z" fill="white"/>
              <path d="M3 8h6a3 3 0 010 6H3V8z" fill="rgba(255,255,255,0.5)"/>
            </svg>
          </div>
          <span style={S.name}>brainfi</span>
        </div>
        {onClose && (
          <button onClick={onClose} style={{ border:'none', background:'transparent', cursor:'pointer', color:'rgba(255,255,255,0.3)', display:'flex', alignItems:'center' }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 3l10 10M13 3L3 13"/></svg>
          </button>
        )}
      </div>

      <nav style={S.nav}>
        {navGroups.map(group => (
          <div key={group.section}>
            <div style={S.section}>{group.section}</div>
            {group.items.map(item => {
              const isActive = location.pathname === item.path && !item.disabled
              return (
                <button key={item.label} onClick={() => handleNav(item.path, item.disabled)} style={{
                  display:'flex', alignItems:'center', gap:9, padding:'8px 10px', fontSize:12,
                  width:'100%', border:'none', borderRadius:8, marginBottom:2, textAlign:'left',
                  background: isActive ? 'rgba(108,139,255,0.15)' : 'transparent',
                  color: isActive ? '#fff' : item.disabled ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.45)',
                  fontWeight: isActive ? 500 : 400,
                  cursor: item.disabled ? 'not-allowed' : 'pointer',
                }}>
                  <span style={{ color: isActive ? '#6C8BFF' : 'rgba(255,255,255,0.25)', display:'flex', flexShrink:0 }}>{item.icon}</span>
                  {item.label}
                </button>
              )
            })}
          </div>
        ))}
        <div style={{ marginTop:8 }}>
          <button onClick={() => signOut()} style={{ display:'flex', alignItems:'center', gap:9, padding:'8px 10px', fontSize:12, width:'100%', border:'none', borderRadius:8, textAlign:'left', background:'transparent', color:'rgba(255,100,100,0.6)', cursor:'pointer' }}>
            <LogoutIcon />Cerrar sesión
          </button>
        </div>
      </nav>

      <div style={S.bottom}>
        <div style={S.av}>{initials}</div>
        <div>
          <div style={{ fontSize:11, fontWeight:500, color:'#fff' }}>{displayName}</div>
          <div style={{ fontSize:9, color:'rgba(255,255,255,0.25)' }}>Admin · Mi empresa</div>
        </div>
      </div>
    </aside>
  )
}

function GridIcon() { return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="1" width="6" height="6" rx="1.5"/><rect x="9" y="1" width="6" height="6" rx="1.5"/><rect x="1" y="9" width="6" height="6" rx="1.5"/><rect x="9" y="9" width="6" height="6" rx="1.5"/></svg> }
function ChartIcon() { return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 4h12M2 8h12M2 12h8"/></svg> }
function TaxIcon() { return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="12" height="12" rx="1.5"/><line x1="2" y1="6" x2="14" y2="6"/><line x1="6" y1="2" x2="6" y2="6"/><line x1="10" y1="2" x2="10" y2="6"/></svg> }
function SettingsIcon() { return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="2.5"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2"/></svg> }
function PlugIcon() { return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="4" width="14" height="9" rx="1.5"/><circle cx="8" cy="8.5" r="1.5"/></svg> }
function HelpIcon() { return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><path d="M8 5v3"/></svg> }
function LogoutIcon() { return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M10 11l3-3-3-3M13 8H6"/></svg> }
