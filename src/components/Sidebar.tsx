import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import Logo from './Logo'

const navItems = [
  {
    section: 'General',
    items: [
      { label: 'Dashboard', path: '/', icon: <GridIcon />, active: true },
      { label: 'Análisis financiero', path: '/analisis', icon: <ChartIcon />, disabled: true },
      { label: 'Impuestos', path: '/impuestos', icon: <CalIcon />, disabled: true },
    ]
  },
  {
    section: 'Admin',
    items: [
      { label: 'Ajustes', path: '/ajustes', icon: <SettingsIcon />, disabled: false },
      { label: 'Integraciones', path: '/integraciones', icon: <PlugIcon />, disabled: true },
      { label: 'Help desk', path: '/help', icon: <HelpIcon />, disabled: false },
    ]
  }
]

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signOut, user } = useAuth()

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? 'JG'

  return (
    <aside style={{
      width: 220, background: '#fff', borderRight: '1px solid #E5E7EB',
      display: 'flex', flexDirection: 'column', flexShrink: 0, height: '100vh', position: 'sticky', top: 0
    }}>
      {/* Logo */}
      <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E5E7EB' }}>
        <Logo />
        <CollapseIcon />
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
        {navItems.map(group => (
          <div key={group.section}>
            <div style={{ fontSize: 9, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 8px', margin: '14px 0 4px' }}>
              {group.section}
            </div>
            {group.items.map(item => {
              const isActive = location.pathname === item.path && !item.disabled
              return (
                <button
                  key={item.label}
                  onClick={() => !item.disabled && navigate(item.path)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 9,
                    padding: '8px 10px', fontSize: 12.5, width: '100%', border: 'none',
                    borderRadius: 9, marginBottom: 1, textAlign: 'left',
                    background: isActive ? '#E0F7FA' : 'transparent',
                    color: isActive ? '#0D2E6E' : item.disabled ? '#9CA3AF' : '#6B7280',
                    fontWeight: isActive ? 500 : 400,
                    opacity: item.disabled ? 0.4 : 1,
                    cursor: item.disabled ? 'not-allowed' : 'pointer',
                    filter: item.disabled ? 'blur(0.2px)' : 'none',
                    transition: 'background 0.15s',
                  }}
                >
                  <span style={{ opacity: isActive ? 1 : 0.7, flexShrink: 0 }}>{item.icon}</span>
                  {item.label}
                </button>
              )
            })}
          </div>
        ))}

        {/* Cerrar sesión */}
        <div style={{ marginTop: 8 }}>
          <button
            onClick={() => signOut()}
            style={{
              display: 'flex', alignItems: 'center', gap: 9,
              padding: '8px 10px', fontSize: 12.5, width: '100%', border: 'none',
              borderRadius: 9, textAlign: 'left', background: 'transparent',
              color: '#DC2626', cursor: 'pointer',
            }}
          >
            <LogoutIcon />
            Cerrar sesión
          </button>
        </div>
      </nav>

      {/* Referencias */}
      <div style={{ margin: 10, borderRadius: 14, background: '#F8F9FB', border: '1px solid #E5E7EB', padding: 16, textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: '#E0F7FA', border: '1px solid rgba(0,188,212,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
          <GiftIcon />
        </div>
        <p style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.5 }}>
          Invita a otras empresas y obtén beneficios recurrentes
        </p>
      </div>
    </aside>
  )
}

// Icons
function GridIcon() {
  return <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="1" width="6" height="6" rx="1.5"/><rect x="9" y="1" width="6" height="6" rx="1.5"/><rect x="1" y="9" width="6" height="6" rx="1.5"/><rect x="9" y="9" width="6" height="6" rx="1.5"/></svg>
}
function ChartIcon() {
  return <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 4h12M2 8h12M2 12h8"/></svg>
}
function CalIcon() {
  return <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="12" height="12" rx="1.5"/><line x1="2" y1="6" x2="14" y2="6"/><line x1="6" y1="2" x2="6" y2="6"/><line x1="10" y1="2" x2="10" y2="6"/></svg>
}
function SettingsIcon() {
  return <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="2.5"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2"/></svg>
}
function PlugIcon() {
  return <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="4" width="14" height="9" rx="1.5"/><path d="M4 4V3a1 1 0 011-1h6a1 1 0 011 1v1"/><circle cx="8" cy="8.5" r="1.5"/></svg>
}
function HelpIcon() {
  return <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><path d="M8 5v3l2 1.5"/></svg>
}
function LogoutIcon() {
  return <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M10 11l3-3-3-3M13 8H6"/></svg>
}
function CollapseIcon() {
  return <div style={{ width: 24, height: 24, border: '1px solid #E5E7EB', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="#9CA3AF" strokeWidth="2"><path d="M10 4L6 8l4 4"/></svg></div>
}
function GiftIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00BCD4" strokeWidth="1.5"><path d="M20 12v10H4V12"/><path d="M22 7H2v5h20V7z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/></svg>
}
