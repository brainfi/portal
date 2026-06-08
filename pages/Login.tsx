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
          .login-right { width: 100% !important; flex: 1 1 auto !important; padding: 32px 24px !important; }
        }
      `}</style>
      <div className="login-left" style={{ flex:1, background:'#4361EE', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-100, left:-100, width:400, height:400, borderRadius:'50%', background:'rgba(255,255,255,0.05)' }} />
        <div style={{ position:'absolute', bottom:-80, right:-80, width:320, height:320, borderRadius:'50%', background:'rgba(255,255,255,0.05)' }} />
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:20, zIndex:1 }}>
          <div style={{ width:72, height:72, background:'rgba(255,255,255,0.15)', borderRadius:18, border:'1px solid rgba(255,255,255,0.25)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="38" height="38" viewBox="0 0 16 16" fill="none">
              <path d="M3 2h5a3 3 0 010 6H3V2z" fill="white"/>
              <path d="M3 8h6a3 3 0 010 6H3V8z" fill="rgba(255,255,255,0.6)"/>
            </svg>
          </div>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:32, fontWeight:700, color:'#fff', letterSpacing:'-0.5px', marginBottom:8 }}>brainfi</div>
            <div style={{ fontSize:14, color:'rgba(255,255,255,0.6)', lineHeight:1.6, maxWidth:260 }}>Inteligencia financiera<br/>para PYMEs españolas</div>
          </div>
        </div>
        <div style={{ position:'absolute', bottom:40, fontSize:11, color:'rgba(255,255,255,0.35)', letterSpacing:'0.05em' }}>app.brainfi.io</div>
      </div>
      <div className="login-right" style={{ width:480, background:'#fff', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'48px 56px', flexShrink:0 }}>
        <div style={{ width:'100%', maxWidth:340 }}>
          <div style={{ marginBottom:32 }}>
            <h1 style={{ fontSize:22, fontWeight:700, color:'#1a1a1a', marginBottom:6, letterSpacing:'-0.02em' }}>Acceder al portal</h1>
            <p style={{ fontSize:13, color:'#aaa' }}>Introduce tus credenciales para continuar</p>
          </div>
          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:500, color:'#555', marginBottom:6 }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@empresa.com" required
                style={{ width:'100%', padding:'11px 13px', fontSize:13, border:'1px solid #E8E8EC', borderRadius:9, outline:'none', background:'#fff', color:'#1a1a1a', fontFamily:'Inter, sans-serif' }}
                onFocus={e => e.target.style.borderColor = '#4361EE'}
                onBlur={e => e.target.style.borderColor = '#E8E8EC'} />
            </div>
            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:500, color:'#555', marginBottom:6 }}>Contraseña</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required
                style={{ width:'100%', padding:'11px 13px', fontSize:13, border:'1px solid #E8E8EC', borderRadius:9, outline:'none', background:'#fff', color:'#1a1a1a', fontFamily:'Inter, sans-serif' }}
                onFocus={e => e.target.style.borderColor = '#4361EE'}
                onBlur={e => e.target.style.borderColor = '#E8E8EC'} />
            </div>
            {error && (
              <div style={{ background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:8, padding:'10px 12px', fontSize:12, color:'#DC2626' }}>{error}</div>
            )}
            <button type="submit" disabled={loading} style={{ padding:'12px', fontSize:13, fontWeight:600, color:'#fff', background: loading ? '#aaa' : '#4361EE', border:'none', borderRadius:10, cursor: loading ? 'not-allowed' : 'pointer', marginTop:4, fontFamily:'Inter, sans-serif' }}>
              {loading ? 'Accediendo...' : 'Acceder →'}
            </button>
          </form>
          <p style={{ textAlign:'center', fontSize:12, color:'#aaa', marginTop:28 }}>
            ¿Necesitas acceso?{' '}<a href="mailto:hola@brainfi.io" style={{ color:'#4361EE', fontWeight:500 }}>hola@brainfi.io</a>
          </p>
        </div>
      </div>
    </div>
  )
}
