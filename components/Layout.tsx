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
          .sidebar-wrap { position: fixed !important; left: ${sidebarOpen ? '0' : '-200px'} !important; top: 0; height: 100vh; z-index: 50; transition: left 0.25s ease; box-shadow: ${sidebarOpen ? '4px 0 24px rgba(0,0,0,0.12)' : 'none'}; }
          .hamburger { display: flex !important; }
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
        <main style={{ flex:1, overflow:'auto', padding:'20px', background:'#F5F6FA', display:'flex', flexDirection:'column', gap:16 }}>
          {/* Page header */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)} style={{ display:'none', alignItems:'center', justifyContent:'center', width:32, height:32, border:'1px solid #ECEEF3', borderRadius:7, background:'#fff', cursor:'pointer' }}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#8A94A6" strokeWidth="1.5"><path d="M2 4h12M2 8h12M2 12h12"/></svg>
              </button>
              <div>
                <div style={{ fontSize:20, fontWeight:700, color:'#1A1D2E', letterSpacing:'-0.02em' }}>{greeting}, {displayName}</div>
                <div style={{ fontSize:11, color:'#8A94A6', marginTop:3 }}>Abril 2026 · Resumen financiero de tu empresa</div>
              </div>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button style={{ display:'flex', alignItems:'center', gap:6, background:'#2DC653', color:'#fff', border:'none', borderRadius:8, padding:'8px 14px', fontSize:12, fontWeight:500 }}>
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><path d="M8 5v3l1.5 1"/></svg>
                Preguntar a IA
              </button>
              <button style={{ display:'flex', alignItems:'center', gap:6, background:'#fff', color:'#1A1D2E', border:'1px solid #ECEEF3', borderRadius:8, padding:'8px 14px', fontSize:12, fontWeight:500, boxShadow:'0 1px 3px rgba(0,0,0,0.06)' }}>
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 12l4-4 3 3 4-5"/><path d="M14 2v4H10"/></svg>
                Exportar informe
              </button>
            </div>
          </div>
          {children}
        </main>
      </div>
    </div>
  )
}
