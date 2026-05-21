import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Sidebar from './Sidebar'

interface LayoutProps { children: React.ReactNode; title?: string }

export default function Layout({ children, title = 'Resumen' }: LayoutProps) {
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const name = user?.email?.split('@')[0] ?? 'Usuario'
  const displayName = name.charAt(0).toUpperCase() + name.slice(1)
  const initials = displayName.slice(0,2).toUpperCase()

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
        <div style={{ padding:'16px 28px', background:'#F4F5F7', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'space-between', gap:16 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
            <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)} style={{ display:'none', alignItems:'center', justifyContent:'center', width:32, height:32, border:'1px solid #E8E8EC', borderRadius:7, background:'#fff', cursor:'pointer' }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#888" strokeWidth="1.5"><path d="M2 4h12M2 8h12M2 12h12"/></svg>
            </button>
            <span style={{ fontSize:10, fontWeight:600, color:'#B0B7C3', textTransform:'uppercase', letterSpacing:'0.12em' }}>
              {['Resumen','Dashboard'].includes(title) ? 'General' :
               ['Cashflow','Análisis','Impuestos'].includes(title) ? 'General' :
               ['Ajustes','Integraciones'].includes(title) ? 'Admin' : 'General'}
              {' / '}{title.toUpperCase()}
            </span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, background:'#fff', border:'1px solid #E8E8EC', borderRadius:8, padding:'8px 14px', fontSize:13, color:'#B0B7C3', width:220 }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#bbb" strokeWidth="1.5"><circle cx="7" cy="7" r="5"/><path d="M11 11l3 3"/></svg>
              Buscar...
            </div>
            <div style={{ position:'relative', width:34, height:34, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#888" strokeWidth="1.5"><path d="M8 2a5 5 0 015 5v2l1 2H2l1-2V7a5 5 0 015-5zM6 13a2 2 0 004 0"/></svg>
              <div style={{ position:'absolute', top:4, right:4, width:6, height:6, borderRadius:'50%', background:'#EF4444', border:'1.5px solid #F4F5F7' }}/>
            </div>
            <div style={{ width:34, height:34, borderRadius:8, background:'#4361EE', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#fff', cursor:'pointer', flexShrink:0 }}>{initials}</div>
          </div>
        </div>
        <main style={{ flex:1, overflow:'auto', padding:'0 28px 28px', background:'#F4F5F7', display:'flex', flexDirection:'column', gap:14 }}>
          {children}
        </main>
      </div>
    </div>
  )
}
