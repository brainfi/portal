import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import Sidebar from './Sidebar'

interface LayoutProps { children: React.ReactNode; title?: string }


const SEARCH_INDEX = [
  { label:'Resumen',              path:'/',                       desc:'KPIs, cashflow, CFO Brainfi',           icon:'ti-layout-dashboard' },
  { label:'Cobros',               path:'/cobros',                 desc:'Facturas pendientes, aging, clientes',   icon:'ti-arrow-up-right'   },
  { label:'Pagos',                path:'/pagos',                  desc:'Obligaciones, deuda, amortización',      icon:'ti-arrow-down-right'  },
  { label:'Presupuesto',          path:'/presupuesto',            desc:'Cuenta de resultados P&L, EBITDA',      icon:'ti-chart-pie'        },
  { label:'Configurar presupuesto',path:'/presupuesto/configurar',desc:'Partidas, cuentas PGC, distribución',    icon:'ti-settings'         },
  { label:'Ajustes',              path:'/ajustes',                desc:'Cuenta, empresa, NIF, notificaciones',   icon:'ti-adjustments'      },
  { label:'IVA · Mod. 303',       path:'/pagos',                  desc:'Obligaciones fiscales trimestrales',     icon:'ti-receipt-tax'      },
  { label:'Nóminas',              path:'/pagos',                  desc:'Pagos de personal y Seguridad Social',   icon:'ti-users'            },
  { label:'Facturas vencidas',    path:'/cobros',                 desc:'Clientes con pagos pendientes',          icon:'ti-alert-triangle'   },
  { label:'DSO',                  path:'/cobros',                 desc:'Días medios hasta cobro efectivo',       icon:'ti-clock'            },
  { label:'Tabla de amortización',path:'/pagos',                  desc:'Préstamos y leasing',                    icon:'ti-building-bank'    },
  { label:'EBITDA',               path:'/presupuesto',            desc:'Resultado antes de intereses e impuestos',icon:'ti-trending-up'    },
  { label:'Margen bruto',         path:'/presupuesto',            desc:'Ingresos menos coste de personal',       icon:'ti-chart-bar'        },
]

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
        <div style={{ padding:'14px 28px 28px', background:'#F4F5F7', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'space-between', gap:16 }}>
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
            <div ref={searchWrap} style={{ position:'relative' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, background:'#fff', border:`1px solid ${searchOpen?'#4361EE':'#E8E8EC'}`, borderRadius:8, padding:'7px 14px', width:220, transition:'border-color .15s' }}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#bbb" strokeWidth="1.5"><circle cx="7" cy="7" r="5"/><path d="M11 11l3 3"/></svg>
                <input type="text" value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setSearchOpen(true) }}
                  onFocus={() => setSearchOpen(true)}
                  onKeyDown={handleSearchKey}
                  placeholder="Buscar..."
                  style={{ border:'none', outline:'none', fontSize:13, color:'#1a1a1a', background:'transparent', width:'100%', fontFamily:'inherit' }} />
                {searchQuery && (
                  <button onClick={() => { setSearchQuery(''); setSearchOpen(false) }}
                    style={{ border:'none', background:'transparent', cursor:'pointer', color:'#B0B7C3', fontSize:16, padding:0, lineHeight:1 }}>×</button>
                )}
              </div>
              {searchOpen && (
                <div style={{ position:'absolute', top:'calc(100% + 6px)', left:0, right:0, zIndex:100, background:'#fff', border:'1px solid #E8E8EC', borderRadius:12, padding:'6px', boxShadow:'0 8px 24px rgba(0,0,0,0.10)', minWidth:300 }}>
                  {searchQuery.trim().length === 0 ? (
                    <div style={{ padding:'12px', fontSize:12, color:'#B0B7C3', textAlign:'center' }}>Escribe para buscar páginas y secciones</div>
                  ) : searchResults.length === 0 ? (
                    <div style={{ padding:'12px', fontSize:12, color:'#B0B7C3', textAlign:'center' }}>Sin resultados para "<strong style={{color:'#888'}}>{searchQuery}</strong>"</div>
                  ) : (
                    <>
                      <div style={{ fontSize:9, fontWeight:700, color:'#B0B7C3', textTransform:'uppercase', letterSpacing:'0.1em', padding:'4px 10px 6px' }}>Resultados</div>
                      {searchResults.map((r, i) => (
                        <button key={i} onClick={() => handleSearchSelect(r.path)}
                          style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'9px 10px', border:'none', background:'transparent', cursor:'pointer', borderRadius:8, textAlign:'left', fontFamily:'inherit' }}
                          onMouseEnter={e => (e.currentTarget.style.background='#F4F5F7')}
                          onMouseLeave={e => (e.currentTarget.style.background='transparent')}>
                          <div style={{ width:28, height:28, borderRadius:7, background:'#EEF1FD', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                            <i className={`ti ${r.icon}`} style={{ fontSize:14, color:'#4361EE' }} aria-hidden="true" />
                          </div>
                          <div>
                            <div style={{ fontSize:12, fontWeight:600, color:'#1a1a1a' }}>{r.label}</div>
                            <div style={{ fontSize:11, color:'#B0B7C3' }}>{r.desc}</div>
                          </div>
                        </button>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
            <div ref={notifWrap} style={{ position:'relative' }}>
              <button onClick={() => { setNotifOpen(o => !o); setSearchOpen(false) }}
                style={{ width:34, height:34, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', border:'none', background:notifOpen?'#EEF1FD':'transparent' }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#888" strokeWidth="1.5"><path d="M8 2a5 5 0 015 5v2l1 2H2l1-2V7a5 5 0 015-5zM6 13a2 2 0 004 0"/></svg>
              </button>
              {notifOpen && (
                <div style={{ position:'absolute', top:'calc(100% + 6px)', right:0, zIndex:100, background:'#fff', border:'1px solid #E8E8EC', borderRadius:14, boxShadow:'0 8px 24px rgba(0,0,0,0.10)', width:300 }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px 10px', borderBottom:'1px solid #F4F5F7' }}>
                    <div style={{ fontSize:13, fontWeight:600, color:'#1a1a1a' }}>Notificaciones</div>
                  </div>
                  <div style={{ padding:'32px 16px', textAlign:'center' }}>
                    <div style={{ width:40, height:40, borderRadius:10, background:'#F4F5F7', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 10px' }}>
                      <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="#B0B7C3" strokeWidth="1.5"><path d="M8 2a5 5 0 015 5v2l1 2H2l1-2V7a5 5 0 015-5zM6 13a2 2 0 004 0"/></svg>
                    </div>
                    <div style={{ fontSize:13, fontWeight:500, color:'#1a1a1a', marginBottom:4 }}>No hay notificaciones pendientes</div>
                    <div style={{ fontSize:11, color:'#B0B7C3', lineHeight:1.5 }}>Las alertas fiscales y de cobros aparecerán aquí cuando conectes Holded.</div>
                  </div>
                </div>
              )}
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
