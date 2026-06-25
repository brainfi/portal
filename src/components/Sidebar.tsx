import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

const navGroups = [
  { section:'Actual', items:[
    { label:'Resumen',     path:'/',                       icon:<GridIcon/>,    disabled:false },
    { label:'Cobros',      path:'/cobros',                 icon:<CobrosIcon/>,  disabled:false },
    { label:'Pagos',       path:'/pagos',                  icon:<PagosIcon/>,   disabled:false },
  ]},
  { section:'Planificación', items:[
    { label:'Presupuesto', path:'/presupuesto',            icon:<TableIcon/>,    disabled:false },
    { label:'Configurar',  path:'/presupuesto/configurar', icon:<ConfigIcon/>,   disabled:false },
    { label:'Previsiones', path:'/previsiones',            icon:<ForecastIcon/>, disabled:false },
    { label:'Escenarios',  path:'/escenarios',             icon:<ScenarioIcon/>, disabled:false },
  ]},
  { section:'Admin', items:[
    { label:'Ajustes',     path:'/ajustes',                icon:<SettingsIcon/>, disabled:false },
  ]},
]

interface SidebarProps { onClose?: () => void }

export default function Sidebar({ onClose }: SidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { signOut, user } = useAuth()
  const name = user?.email?.split('@')[0] ?? 'Usuario'
  const displayName = name.charAt(0).toUpperCase() + name.slice(1)
  const initials = displayName.slice(0,2).toUpperCase()
  const email = user?.email ?? ''

  return (
    <aside style={{ width:200, background:'#fff', borderRight:'1px solid #E8E8EC', display:'flex', flexDirection:'column', height:'100vh' }}>

      {/* LOGO */}
      <div style={{ padding:'20px 18px 14px', borderBottom:'1px solid #E8E8EC', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:9 }}>
          <div style={{ width:28, height:28, background:'#4361EE', borderRadius:7, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 2h5a3 3 0 010 6H3V2z" fill="white"/>
              <path d="M3 8h6a3 3 0 010 6H3V8z" fill="rgba(255,255,255,0.6)"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize:9, fontWeight:600, color:'#999', textTransform:'uppercase', letterSpacing:'0.12em' }}>Workspace</div>
            <span style={{ fontSize:16, fontWeight:700, color:'#1a1a1a', letterSpacing:'-0.4px' }}>brainfi</span>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} style={{ border:'none', background:'transparent', cursor:'pointer', color:'#aaa', display:'flex' }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 3l10 10M13 3L3 13"/></svg>
          </button>
        )}
      </div>

      {/* NAV */}
      <nav style={{ flex:1, padding:'14px 10px', overflowY:'auto' }}>
        {navGroups.map(group => (
          <div key={group.section}>
            <div style={{ fontSize:9, color:'#bbb', textTransform:'uppercase', letterSpacing:'0.12em', padding:'0 8px', margin:'12px 0 4px', fontWeight:600 }}>{group.section}</div>
            {group.items.map(item => {
              const isActive = location.pathname === item.path && !item.disabled
              return (
                <button key={item.label}
                  onClick={() => { if (!item.disabled) { navigate(item.path); onClose?.() } }}
                  style={{
                    display:'flex', alignItems:'center', gap:9, padding:'8px 10px', fontSize:12,
                    width:'100%', border:'none', borderRadius:8, marginBottom:2, textAlign:'left',
                    background: isActive ? '#EEF1FD' : 'transparent',
                    color: isActive ? '#4361EE' : item.disabled ? '#ccc' : '#888',
                    fontWeight: isActive ? 600 : 400,
                    cursor: item.disabled ? 'default' : 'pointer',
                  }}>
                  <span style={{ display:'flex', flexShrink:0, color: isActive ? '#4361EE' : item.disabled ? '#ddd' : '#aaa' }}>{item.icon}</span>
                  {item.label}
                </button>
              )
            })}
          </div>
        ))}
        <div style={{ marginTop:8 }}>
          <button onClick={() => signOut()} style={{ display:'flex', alignItems:'center', gap:9, padding:'8px 10px', fontSize:12, width:'100%', border:'none', borderRadius:8, textAlign:'left', background:'transparent', color:'#cc4444', cursor:'pointer' }}>
            <LogoutIcon/>Cerrar sesión
          </button>
        </div>
      </nav>



    </aside>
  )
}

function GridIcon() { return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="1" width="6" height="6" rx="1.5"/><rect x="9" y="1" width="6" height="6" rx="1.5"/><rect x="1" y="9" width="6" height="6" rx="1.5"/><rect x="9" y="9" width="6" height="6" rx="1.5"/></svg> }
function SettingsIcon() { return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="2.5"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2"/></svg> }
function LogoutIcon() { return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M10 11l3-3-3-3M13 8H6"/></svg> }
function CobrosIcon() { return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 4h12M2 8h8"/><circle cx="12" cy="11" r="3"/><path d="M11 11l.7.7L13.5 10"/></svg> }
function PagosIcon()  { return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="3" width="14" height="10" rx="1.5"/><line x1="1" y1="7" x2="15" y2="7"/><line x1="4" y1="11" x2="7" y2="11"/></svg> }
function TableIcon()  { return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="1" width="14" height="14" rx="1.5"/><line x1="1" y1="5" x2="15" y2="5"/><line x1="1" y1="9" x2="15" y2="9"/><line x1="5" y1="5" x2="5" y2="15"/></svg> }
function ConfigIcon() { return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="2"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.1 3.1l1.4 1.4M11.5 11.5l1.4 1.4M3.1 12.9l1.4-1.4M11.5 4.5l1.4-1.4"/></svg> }
function ForecastIcon() { return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 11l4-4 3 3 5-6"/><path d="M11 4h3v3"/></svg> }
function ScenarioIcon() { return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="2.5"/><path d="M8 2v3M8 11v3M3.5 4.5l2 2M10.5 9.5l2 2"/></svg> }