import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

const navGroups = [
  { section:'General', items:[
    { label:'Resumen', path:'/', icon:<GridIcon/>, disabled:false, blurred:false },
    { label:'Cashflow', path:'/cashflow', icon:<CashflowIcon/>, disabled:true, blurred:true },
    { label:'Análisis', path:'/analisis', icon:<ChartIcon/>, disabled:true, blurred:false },
    { label:'Impuestos', path:'/impuestos', icon:<TaxIcon/>, disabled:true, blurred:false },
  ]},
  { section:'Admin', items:[
    { label:'Ajustes', path:'/ajustes', icon:<SettingsIcon/>, disabled:false, blurred:false },
    { label:'Integraciones', path:'/integraciones', icon:<PlugIcon/>, disabled:true, blurred:false },
  ]}
]

interface SidebarProps { onClose?: () => void }

export default function Sidebar({ onClose }: SidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { signOut, user } = useAuth()
  const name = user?.email?.split('@')[0] ?? 'Usuario'
  const displayName = name.charAt(0).toUpperCase() + name.slice(1)
  const initials = displayName.slice(0,2).toUpperCase()

  return (
    <aside style={{ width:200, background:'#fff', borderRight:'1px solid #E8E8EC', display:'flex', flexDirection:'column', height:'100vh' }}>
      <div style={{ padding:'20px 18px 14px', borderBottom:'1px solid #E8E8EC', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:9 }}>
          <div style={{ width:28, height:28, background:'linear-gradient(135deg,#00BCD4,#0D2E6E)', borderRadius:7, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <span style={{ fontFamily:'Nunito,sans-serif', fontWeight:800, fontSize:16, color:'white', lineHeight:1 }}>b</span>
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

      <nav style={{ flex:1, padding:'14px 10px', overflowY:'auto' }}>
        {navGroups.map(group => (
          <div key={group.section}>
            <div style={{ fontSize:9, color:'#bbb', textTransform:'uppercase', letterSpacing:'0.12em', padding:'0 8px', margin:'12px 0 4px', fontWeight:600 }}>{group.section}</div>
            {group.items.map(item => {
              const isActive = location.pathname === item.path && !item.disabled
              return (
                <button key={item.label} onClick={() => { if (!item.disabled) { navigate(item.path); onClose?.() } }}
                  style={{
                    display:'flex', alignItems:'center', gap:9, padding:'8px 10px', fontSize:12,
                    width:'100%', border:'none', borderRadius:8, marginBottom:2, textAlign:'left',
                    background: isActive ? '#F4F5F7' : 'transparent',
                    color: isActive ? '#1a1a1a' : '#888',
                    fontWeight: isActive ? 500 : 400,
                    cursor: item.disabled ? 'not-allowed' : 'pointer',
                    filter: item.blurred ? 'blur(2px)' : 'none',
                    opacity: item.disabled && !item.blurred ? 0.35 : 1,
                  }}>
                  <span style={{ display:'flex', flexShrink:0 }}>{item.icon}</span>
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

      <div style={{ padding:12, borderTop:'1px solid #E8E8EC', display:'flex', alignItems:'center', gap:8 }}>
        <div style={{ width:28, height:28, borderRadius:'50%', background:'linear-gradient(135deg,#00BCD4,#0D2E6E)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:600, color:'#fff', flexShrink:0 }}>{initials}</div>
        <div>
          <div style={{ fontSize:11, fontWeight:600, color:'#1a1a1a' }}>{displayName}</div>
          <div style={{ fontSize:9, color:'#aaa' }}>Admin · Mi empresa</div>
        </div>
      </div>
    </aside>
  )
}

function GridIcon() { return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="1" width="6" height="6" rx="1.5"/><rect x="9" y="1" width="6" height="6" rx="1.5"/><rect x="1" y="9" width="6" height="6" rx="1.5"/><rect x="9" y="9" width="6" height="6" rx="1.5"/></svg> }
function CashflowIcon() { return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 8h3l2-5 3 10 2-5h2"/></svg> }
function ChartIcon() { return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 4h12M2 8h12M2 12h8"/></svg> }
function TaxIcon() { return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="12" height="12" rx="1.5"/><line x1="2" y1="6" x2="14" y2="6"/><line x1="6" y1="2" x2="6" y2="6"/><line x1="10" y1="2" x2="10" y2="6"/></svg> }
function SettingsIcon() { return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="2.5"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2"/></svg> }
function PlugIcon() { return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="4" width="14" height="9" rx="1.5"/><circle cx="8" cy="8.5" r="1.5"/></svg> }
function LogoutIcon() { return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M10 11l3-3-3-3M13 8H6"/></svg> }
