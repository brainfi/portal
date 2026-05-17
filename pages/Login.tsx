import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function Login() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await signIn(email, password)
    if (error) {
      setError('Email o contraseña incorrectos')
      setLoading(false)
    }
  }

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden', fontFamily:'Inter, sans-serif' }}>
      <style>{`
        @media (max-width: 768px) {
          .login-left { display: none !important; }
          .login-right {
            width: 100% !important;
            padding: 32px 24px !important;
            background: #F4F5F7 !important;
          }
          .login-card {
            background: #fff !important;
            border-radius: 16px !important;
            border: 1px solid #EAECF0 !important;
            padding: 28px 24px !important;
          }
          .login-logo-mobile { display: flex !important; }
        }
        @media (min-width: 769px) {
          .login-logo-mobile { display: none !important; }
          .login-card {
            background: transparent !important;
            border: none !important;
            padding: 0 !important;
          }
        }
      `}</style>

      {/* LEFT — Ilustración */}
      <div className="login-left" style={{
        flex:1, background:'linear-gradient(135deg, #0D2E6E 0%, #00BCD4 100%)',
        display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
        padding:48, position:'relative', overflow:'hidden'
      }}>
        <div style={{ position:'absolute', top:-80, left:-80, width:300, height:300, borderRadius:'50%', background:'rgba(255,255,255,0.05)' }} />
        <div style={{ position:'absolute', bottom:-60, right:-60, width:250, height:250, borderRadius:'50%', background:'rgba(255,255,255,0.05)' }} />

        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:48, alignSelf:'flex-start' }}>
          <div style={{ width:34, height:34, background:'rgba(255,255,255,0.2)', borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <span style={{ fontFamily:'Nunito, sans-serif', fontWeight:800, fontSize:20, color:'white', lineHeight:1 }}>b</span>
          </div>
          <span style={{ fontFamily:'Nunito, sans-serif', fontWeight:800, fontSize:20, color:'white', letterSpacing:'-0.5px' }}>brainfi</span>
        </div>

        {/* Mockup */}
        <div style={{ width:'100%', maxWidth:420, background:'rgba(255,255,255,0.1)', borderRadius:16, border:'1px solid rgba(255,255,255,0.15)', padding:20, marginBottom:32 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
            <div style={{ fontSize:11, fontWeight:600, color:'rgba(255,255,255,0.7)' }}>Mi empresa › Dashboard · Abril 2026</div>
            <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:10, color:'#4ade80', fontWeight:600, background:'rgba(74,222,128,0.15)', padding:'3px 8px', borderRadius:99 }}>
              <div style={{ width:5, height:5, borderRadius:'50%', background:'#4ade80' }} />ERP · sync
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:16 }}>
            {[
              { label:'Liquidez', value:'1,42', delta:'↑ 0,12', pos:true },
              { label:'DSO', value:'38d', delta:'↑ +3', pos:false },
              { label:'Burn rate', value:'€43.8k', delta:'↑ 3,1%', pos:false },
              { label:'Margen', value:'38,4%', delta:'↑ 2,1pp', pos:true },
            ].map(k => (
              <div key={k.label} style={{ background:'rgba(255,255,255,0.1)', borderRadius:8, padding:'8px 10px', border:'1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize:8, color:'rgba(255,255,255,0.5)', marginBottom:4 }}>{k.label}</div>
                <div style={{ fontSize:12, fontWeight:700, color:'white', marginBottom:2 }}>{k.value}</div>
                <div style={{ fontSize:8, fontWeight:600, color:k.pos ? '#4ade80' : '#f87171' }}>{k.delta}</div>
              </div>
            ))}
          </div>
          <div style={{ background:'rgba(255,255,255,0.07)', borderRadius:10, padding:12, marginBottom:12 }}>
            <div style={{ fontSize:10, fontWeight:600, color:'rgba(255,255,255,0.7)', marginBottom:8 }}>Cashflow · 2026</div>
            <svg width="100%" height="50" viewBox="0 0 340 50" preserveAspectRatio="none">
              <defs>
                <linearGradient id="lg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#00BCD4" stopOpacity="0.3"/><stop offset="100%" stopColor="#00BCD4" stopOpacity="0"/></linearGradient>
                <linearGradient id="lg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#16A34A" stopOpacity="0.2"/><stop offset="100%" stopColor="#16A34A" stopOpacity="0"/></linearGradient>
              </defs>
              <path d="M0,40 C60,38 90,32 140,24 C190,16 220,14 280,8 C300,6 320,4 340,2 L340,50 L0,50 Z" fill="url(#lg1)"/>
              <path d="M0,40 C60,38 90,32 140,24 C190,16 220,14 280,8 C300,6 320,4 340,2" fill="none" stroke="#00BCD4" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M0,44 C60,42 90,38 140,32 C190,26 220,22 280,16 C300,14 320,12 340,8 L340,50 L0,50 Z" fill="url(#lg2)"/>
              <path d="M0,44 C60,42 90,38 140,32 C190,26 220,22 280,16 C300,14 320,12 340,8" fill="none" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, background:'rgba(248,113,113,0.15)', borderRadius:7, padding:'6px 10px', border:'1px solid rgba(248,113,113,0.2)' }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:'#f87171', flexShrink:0 }} />
              <span style={{ fontSize:10, color:'rgba(255,255,255,0.8)' }}>€52.900 sin cobrar · 3 facturas vencidas</span>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:8, background:'rgba(251,191,36,0.15)', borderRadius:7, padding:'6px 10px', border:'1px solid rgba(251,191,36,0.2)' }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:'#fbbf24', flexShrink:0 }} />
              <span style={{ fontSize:10, color:'rgba(255,255,255,0.8)' }}>IVA Q2 · Vence en 11 días</span>
            </div>
          </div>
        </div>

        <div style={{ alignSelf:'flex-start' }}>
          <p style={{ fontSize:22, fontWeight:800, color:'white', letterSpacing:'-0.03em', lineHeight:1.2, marginBottom:8 }}>Previsión completa<br/>de caja</p>
          <p style={{ fontSize:13, color:'rgba(255,255,255,0.6)', lineHeight:1.6, maxWidth:320 }}>Conectamos con tu ERP para proyectar datos en tiempo real y generar alertas financieras y fiscales.</p>
        </div>
      </div>

      {/* RIGHT — Formulario */}
      <div className="login-right" style={{
        width:440, background:'#F4F5F7',
        display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
        padding:'48px', flexShrink:0
      }}>

        {/* Logo solo en móvil */}
        <div className="login-logo-mobile" style={{ display:'none', alignItems:'center', gap:9, marginBottom:28 }}>
          <div style={{ width:34, height:34, background:'linear-gradient(135deg,#00BCD4,#0D2E6E)', borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <span style={{ fontFamily:'Nunito, sans-serif', fontWeight:800, fontSize:20, color:'white', lineHeight:1 }}>b</span>
          </div>
          <span style={{ fontFamily:'Nunito, sans-serif', fontWeight:800, fontSize:22, letterSpacing:'-0.5px', color:'#111827' }}>brainfi</span>
        </div>

        <div className="login-card" style={{ width:'100%', maxWidth:340 }}>
          <div style={{ marginBottom:28 }}>
            <h1 style={{ fontSize:20, fontWeight:700, color:'#111827', marginBottom:6, letterSpacing:'-0.02em' }}>Acceder al portal</h1>
            <p style={{ fontSize:13, color:'#6B7280' }}>Introduce tus credenciales para continuar</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:500, color:'#374151', marginBottom:6 }}>Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="tu@empresa.com" required
                style={{ width:'100%', padding:'10px 12px', fontSize:13, border:'1px solid #EAECF0', borderRadius:8, outline:'none', background:'#fff', color:'#111827' }}
                onFocus={e => e.target.style.borderColor = '#00BCD4'}
                onBlur={e => e.target.style.borderColor = '#EAECF0'}
              />
            </div>
            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:500, color:'#374151', marginBottom:6 }}>Contraseña</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required
                style={{ width:'100%', padding:'10px 12px', fontSize:13, border:'1px solid #EAECF0', borderRadius:8, outline:'none', background:'#fff', color:'#111827' }}
                onFocus={e => e.target.style.borderColor = '#00BCD4'}
                onBlur={e => e.target.style.borderColor = '#EAECF0'}
              />
            </div>
            {error && (
              <div style={{ background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:8, padding:'10px 12px', fontSize:12, color:'#DC2626' }}>{error}</div>
            )}
            <button type="submit" disabled={loading} style={{
              padding:'11px', fontSize:13, fontWeight:700, color:'#fff',
              background: loading ? '#9CA3AF' : 'linear-gradient(135deg,#00BCD4,#0D2E6E)',
              border:'none', borderRadius:10, cursor: loading ? 'not-allowed' : 'pointer', marginTop:4
            }}>
              {loading ? 'Accediendo...' : 'Acceder →'}
            </button>
          </form>

          <p style={{ textAlign:'center', fontSize:12, color:'#9CA3AF', marginTop:20 }}>
            ¿Necesitas acceso?{' '}
            <a href="mailto:hola@brainfi.io" style={{ color:'#00BCD4', fontWeight:500 }}>hola@brainfi.io</a>
          </p>
        </div>
      </div>
    </div>
  )
}
