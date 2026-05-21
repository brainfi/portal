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
        <div style={{ height:56, padding:'0 28px', background:'#fff', borderBottom:'1px solid #E8E8EC', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'space-between', gap:16 }}>
          {/* IZQUIERDA — Logo brainfi */}
          <div style={{ display:'flex', alignItems:'center', gap:9, flexShrink:0 }}>
            <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)} style={{ display:'none', alignItems:'center', justifyContent:'center', width:32, height:32, border:'1px solid #E8E8EC', borderRadius:7, background:'#fff', cursor:'pointer', marginRight:4 }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#888" strokeWidth="1.5"><path d="M2 4h12M2 8h12M2 12h12"/></svg>
            </button>
            <div style={{ width:28, height:28, background:'#4361EE', borderRadius:7, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M3 2h5a3 3 0 010 6H3V2z" fill="white"/><path d="M3 8h6a3 3 0 010 6H3V8z" fill="rgba(255,255,255,0.6)"/></svg>
            </div>
            <span style={{ fontSize:16, fontWeight:700, color:'#1a1a1a', letterSpacing:'-0.4px' }}>brainfi</span>
          </div>
          {/* CENTRO — Búsqueda */}
          <div style={{ flex:1, maxWidth:380, display:'flex', alignItems:'center', gap:8, background:'#F4F5F7', border:'1px solid #E8E8EC', borderRadius:8, padding:'8px 14px', fontSize:13, color:'#B0B7C3' }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#bbb" strokeWidth="1.5"><circle cx="7" cy="7" r="5"/><path d="M11 11l3 3"/></svg>
            Buscar...
          </div>
          {/* DERECHA — Acciones + avatar */}
          <div style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
            {/* Campana */}
            <div style={{ position:'relative', width:34, height:34, borderRadius:8, border:'1px solid #E8E8EC', background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#888" strokeWidth="1.5"><path d="M8 2a5 5 0 015 5v2l1 2H2l1-2V7a5 5 0 015-5zM6 13a2 2 0 004 0"/></svg>
              <div style={{ position:'absolute', top:5, right:5, width:6, height:6, borderRadius:'50%', background:'#EF4444', border:'1.5px solid #fff' }}/>
            </div>
            {/* Estado sync */}
            <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:'#EF4444', fontWeight:500, background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:8, padding:'5px 10px', cursor:'default' }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:'#EF4444', flexShrink:0 }}/>
              Sin sync
            </div>
            {/* Avatar */}
            <div style={{ display:'flex', alignItems:'center', gap:8, padding:'5px 10px', border:'1px solid #E8E8EC', borderRadius:8, cursor:'pointer', background:'#fff' }}>
              <div style={{ width:26, height:26, borderRadius:6, background:'#4361EE', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, color:'#fff', flexShrink:0 }}>{initials}</div>
              <span style={{ fontSize:13, fontWeight:500, color:'#1a1a1a' }}>{displayName}</span>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="#888" strokeWidth="1.5"><path d="M4 6l4 4 4-4"/></svg>
            </div>
          </div>
        </div>

        <main style={{ flex:1, overflow:'auto', padding:'0 28px 28px', background:'#F4F5F7', display:'flex', flexDirection:'column', gap:14 }}>
          {children}
        </main>
      </div>
    </div>
  )
}
