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
    <div style={{ display:'flex', height:'100vh', overflow:'hidden', background:'#06081E' }}>
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:40 }} />
      )}

      <style>{`
        @media (max-width: 768px) {
          .sidebar-wrap { position: fixed !important; left: ${sidebarOpen ? '0' : '-220px'} !important; top: 0; height: 100vh; z-index: 50; transition: left 0.25s ease; box-shadow: ${sidebarOpen ? '4px 0 24px rgba(0,0,0,0.4)' : 'none'}; }
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
        <header style={{ padding:'0 20px', height:56, background:'#06081E', borderBottom:'1px solid rgba(255,255,255,0.07)', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)} style={{ display:'none', alignItems:'center', justifyContent:'center', width:32, height:32, border:'1px solid rgba(255,255,255,0.1)', borderRadius:7, background:'rgba(255,255,255,0.05)', cursor:'pointer', flexShrink:0 }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"><path d="M2 4h12M2 8h12M2 12h12"/></svg>
            </button>
            <div>
              <div style={{ fontSize:13, fontWeight:500, color:'#fff' }}>{greeting}, {displayName} 👋</div>
              <div style={{ fontSize:10, color:'rgba(255,255,255,0.25)', marginTop:1 }}>Resumen financiero · {title}</div>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div className="topbar-period" style={{ fontSize:10, color:'rgba(255,255,255,0.4)', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:7, padding:'5px 10px', display:'flex', alignItems:'center', gap:4, cursor:'pointer' }}>
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="12" height="12" rx="1.5"/><line x1="2" y1="6" x2="14" y2="6"/></svg>
              Abril 2026
            </div>
            <div className="topbar-period" style={{ fontSize:10, color:'rgba(255,255,255,0.4)', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:7, padding:'5px 10px', cursor:'pointer' }}>Último mes</div>
            <div style={{ width:30, height:30, borderRadius:7, border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.04)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', position:'relative' }}>
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5"><path d="M8 2a5 5 0 015 5v2l1 2H2l1-2V7a5 5 0 015-5zM6 13a2 2 0 004 0"/></svg>
              <div style={{ position:'absolute', top:6, right:6, width:5, height:5, borderRadius:'50%', background:'#00E5C4', border:'1.5px solid #06081E' }} />
            </div>
          </div>
        </header>
        <main style={{ flex:1, overflow:'auto', padding:'16px 20px', display:'flex', flexDirection:'column', gap:12, background:'#06081E' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
