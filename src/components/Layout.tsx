import { useAuth } from '@/contexts/AuthContext'
import Sidebar from './Sidebar'

interface LayoutProps {
  children: React.ReactNode
  title?: string
}

export default function Layout({ children, title = 'Dashboard' }: LayoutProps) {
  const { user } = useAuth()
  const name = user?.email?.split('@')[0] ?? 'Usuario'
  const displayName = name.charAt(0).toUpperCase() + name.slice(1)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Buenos días' : hour < 20 ? 'Buenas tardes' : 'Buenas noches'

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden', background:'#F4F5F7' }}>
      <Sidebar />
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minWidth:0 }}>

        {/* Topbar */}
        <header style={{ padding:'0 20px', height:60, background:'#fff', borderBottom:'1px solid #EAECF0', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
          <div>
            <div style={{ fontSize:14, fontWeight:600, color:'#111827' }}>{greeting}, {displayName} 👋</div>
            <div style={{ fontSize:11, color:'#9CA3AF', marginTop:1 }}>Aquí tienes el resumen financiero de tu empresa · {title}</div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:'#374151', background:'#F9FAFB', border:'1px solid #EAECF0', borderRadius:7, padding:'5px 10px', cursor:'pointer' }}>
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="#6B7280" strokeWidth="1.5"><rect x="2" y="2" width="12" height="12" rx="1.5"/><line x1="2" y1="6" x2="14" y2="6"/></svg>
              Abril 2026
            </div>
            <div style={{ fontSize:11, color:'#374151', background:'#F9FAFB', border:'1px solid #EAECF0', borderRadius:7, padding:'5px 10px', cursor:'pointer' }}>Último mes</div>
            <div style={{ width:30, height:30, borderRadius:7, border:'1px solid #EAECF0', background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', position:'relative' }}>
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="#6B7280" strokeWidth="1.5"><path d="M8 2a5 5 0 015 5v2l1 2H2l1-2V7a5 5 0 015-5zM6 13a2 2 0 004 0"/></svg>
              <div style={{ position:'absolute', top:6, right:6, width:5, height:5, borderRadius:'50%', background:'#DC2626', border:'1.5px solid white' }} />
            </div>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex:1, overflow:'auto', padding:'16px 20px', display:'flex', flexDirection:'column', gap:12 }}>
          {children}
        </main>
      </div>
    </div>
  )
}
