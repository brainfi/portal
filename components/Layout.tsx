import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Sidebar from './Sidebar'

interface LayoutProps { children: React.ReactNode; title?: string }

export default function Layout({ children, title = 'Resumen' }: LayoutProps) {
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const name = user?.email?.split('@')[0] ?? 'Usuario'
  const displayName = name.charAt(0).toUpperCase() + name.slice(1)
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Buenos días' : hour < 20 ? 'Buenas tardes' : 'Buenas noches'

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden', background:'#F4F5F7' }}>
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.25)', zIndex:40 }} />
      )}
      <style>{`
        @media (max-width: 768px) {
          .sidebar-wrap { position: fixed !important; left: ${sidebarOpen ? '0' : '-210px'} !important; top: 0; height: 100vh; z-index: 50; transition: left 0.25s ease; box-shadow: ${sidebarOpen ? '4px 0 24px rgba(0,0,0,0.1)' : 'none'}; }
          .hamburger { display: flex !important; }
          .tb-actions { display: none !important; }
          .row2 { grid-template-columns: 1fr !important; }
          .kpi-grid { grid-template-columns: 1fr 1fr !important; }
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
        <div style={{ padding:'20px 28px 0', background:'#F4F5F7', flexShrink:0, position:'relative' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:4 }}>
            <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)} style={{ display:'none', alignItems:'center', justifyContent:'center', width:32, height:32, border:'1px solid #E8E8EC', borderRadius:7, background:'#fff', cursor:'pointer' }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#888" strokeWidth="1.5"><path d="M2 4h12M2 8h12M2 12h12"/></svg>
            </button>
            <div style={{ fontSize:10, fontWeight:600, color:'#999', textTransform:'uppercase', letterSpacing:'0.12em' }}>Workspace · Mi empresa</div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:12 }}>
            <span style={{ fontSize:11, fontWeight:600, color:'#888', textTransform:'uppercase', letterSpacing:'0.06em' }}>{new Date().toLocaleDateString('es-ES', { weekday:'long', day:'numeric', month:'long', year:'numeric' }).replace(/^\w/, c => c.toUpperCase())}</span>
            <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:'#2DC653', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em' }}>
              <svg width="8" height="8" viewBox="0 0 10 10" fill="none"><circle cx="5" cy="5" r="4" fill="#2DC653" opacity="0.2"/><circle cx="5" cy="5" r="2.5" fill="#2DC653"/></svg>
              Última sincronización: {new Date().toLocaleTimeString('es-ES', { hour:'2-digit', minute:'2-digit' })}
            </span>
          </div>
          <div style={{ height:0 }}></div>
          <div className="tb-actions" style={{ display:'flex', alignItems:'center', gap:10, position:'absolute', top:20, right:28 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, background:'#fff', border:'1px solid #E8E8EC', borderRadius:8, padding:'8px 14px', fontSize:12, color:'#999', width:200 }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#bbb" strokeWidth="1.5"><circle cx="7" cy="7" r="5"/><path d="M11 11l3 3"/></svg>
              Buscar...
            </div>
            <button style={{ display:'flex', alignItems:'center', gap:6, background:'#4361EE', color:'#fff', border:'none', borderRadius:8, padding:'9px 16px', fontSize:13, fontWeight:500, cursor:'pointer' }}>
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 2v12M2 8h12"/></svg>
              Nuevo
            </button>
          </div>
        </div>
        <main style={{ flex:1, overflow:'auto', padding:'0 28px 28px', background:'#F4F5F7', display:'flex', flexDirection:'column', gap:14 }}>
          {children}
        </main>
      </div>
    </div>
  )
}
