import { useAuth } from '@/contexts/AuthContext'
import Sidebar from './Sidebar'

interface LayoutProps {
  children: React.ReactNode
  title?: string
}

export default function Layout({ children, title = 'Dashboard' }: LayoutProps) {
  const { user } = useAuth()
  const name = user?.email?.split('@')[0] ?? 'Usuario'
  const initials = name.slice(0, 2).toUpperCase()

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#F8F9FB' }}>
      <Sidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {/* Topbar */}
        <header style={{
          padding: '8px 20px', background: '#fff', borderBottom: '1px solid #E5E7EB',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0
        }}>
          <div style={{ fontSize: 11, color: '#6B7280' }}>
            Mi empresa <span style={{ color: '#9CA3AF' }}>›</span> {title} · Abril 2026
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Search */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#F8F9FB', border: '1px solid #E5E7EB', borderRadius: 8, padding: '6px 10px', width: 170 }}>
              <SearchIcon />
              <span style={{ fontSize: 11, color: '#9CA3AF', flex: 1 }}>Buscar aquí...</span>
              <span style={{ fontSize: 9, color: '#9CA3AF', background: '#fff', border: '1px solid #E5E7EB', padding: '1px 4px', borderRadius: 3 }}>⌘K</span>
            </div>
            {/* Bell */}
            <div style={{ width: 30, height: 30, borderRadius: '50%', border: '1px solid #E5E7EB', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', cursor: 'pointer' }}>
              <BellIcon />
              <div style={{ position: 'absolute', top: 5, right: 5, width: 6, height: 6, borderRadius: '50%', background: '#DC2626', border: '1.5px solid white' }} />
            </div>
            {/* Avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer' }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#00BCD4,#0D2E6E)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: '#fff' }}>
                {initials}
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#111827' }}>{name}</div>
                <div style={{ fontSize: 9, color: '#9CA3AF' }}>Admin</div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, overflow: 'auto', padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {children}
        </main>
      </div>
    </div>
  )
}

function SearchIcon() {
  return <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="#9CA3AF" strokeWidth="1.5"><circle cx="7" cy="7" r="5"/><path d="M11 11l3 3"/></svg>
}
function BellIcon() {
  return <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="#6B7280" strokeWidth="1.5"><path d="M8 2a5 5 0 015 5v2l1 2H2l1-2V7a5 5 0 015-5zM6 13a2 2 0 004 0"/></svg>
}
