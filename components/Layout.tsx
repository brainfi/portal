import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Sidebar from './Sidebar'

interface LayoutProps { children: React.ReactNode; title?: string }

export default function Layout({ children, title = 'Dashboard' }: LayoutProps) {
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const name = user?.email?.split('@')[0] ?? 'Usuario'
  const displayName = name.charAt(0).toUpperCase() + name.slice(1)
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Buenos días' : hour < 20 ? 'Buenas tardes' : 'Buenas noches'

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden', background:'#F5F6FA' }}>
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.3)', zIndex:40 }} />
      )}
      <style>{`
        @media (max-width: 768px) {
          .sidebar-wrap { position: fixed !important; left: ${sidebarOpen ? '0' : '-210px'} !important; top: 0; height: 100vh; z-index: 50; transition: left 0.25s ease; box-shadow: ${sidebarOpen ? '4px 0 24px rgba(0,0,0,0.12)' : 'none'}; }
          .hamburger { display: flex !important; }
          .topbar-period { display: none !important; }
        }
        @media (min-width: 769px) {
          .hamburger { display: none !important; }
          .sidebar-wrap { position: relative !important; left: 0 !important; }
        }
      `}</style>

      <div className="sidebar-wrap" style={{ flexShrink:0 }}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minWidth:0 }}>
        <header style={{ padding:'0 20px', height:56, background:'#fff', borderBottom:'1px solid #ECEEF3', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)} style={{ display:'none', alignItems:'center', justifyContent:'center', width:32, height:32, border:'1px solid #ECEEF3', borderRadius:7, background:'#fff', cursor:'pointer', flexShrink:0 }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#8A94A6" strokeWidth="1.5"><path d="M2 4h12M2 8h12M2 12h12"/></svg>
            </button>
            <div>
              <div style={{ fontSize:16, fontWeight:700, color:'#1A1D2E' }}>{greeting}, {displayName}</div>
              <div style={{ fontSize:11, color:'#8A94A6', marginTop:1 }}>Mantente al tanto de tu situación financiera.</div>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div className="topbar-period" style={{ fontSize:11, color:'#4361EE', background:'#EEF1FD', borderRadius:8, padding:'6px 12px', fontWeight:500 }}>Abril 2026</div>
            <div style={{ width:32, height:32, borderRadius:9, border:'1px solid #ECEEF3', background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', position:'relative', boxShadow:'0 1px 3px rgba(0,0,0,0.06)', cursor:'pointer' }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#8A94A6" strokeWidth="1.5"><path d="M8 2a5 5 0 015 5v2l1 2H2l1-2V7a5 5 0 015-5zM6 13a2 2 0 004 0"/></svg>
              <div style={{ position:'absolute', top:6, right:6, width:5, height:5, borderRadius:'50%', background:'#EF233C', border:'1.5px solid white' }} />
            </div>
          </div>
        </header>
        <main style={{ flex:1, overflow:'auto', padding:'20px', background:'#F5F6FA' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
