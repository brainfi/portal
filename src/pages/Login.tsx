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
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ flex: 1, background: 'linear-gradient(135deg, #0D2E6E 0%, #00BCD4 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 48, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -80, left: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', bottom: -60, right: -60, width: 250, height: 250, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 48, alignSelf: 'flex-start' }}>
          <div style={{ width: 34, height: 34, background: 'rgba(255,255,255,0.2)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 20, color: 'white', lineHeight: 1 }}>b</span>
          </div>
          <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 20, color: 'white', letterSpacing: '-0.5px' }}>brainfi</span>
        </div>
        <div style={{ width: '100%', maxWidth: 420, background: 'rgba(255,255,255,0.1)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.15)', padding: 20, marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>Mi empresa › Dashboard · Abril 2026</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: '#4ade80', fontWeight: 600, background: 'rgba(74,222,128,0.15)', padding: '3px 8px', borderRadius: 99 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#4ade80' }} />ERP · sync
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 16 }}>
            {[{label:'Liquidez',value:'1,42',delta:'↑ 0,12',pos:true},{label:'DSO',value:'38d',delta:'↑ +3',pos:false},{label:'Burn rate',value:'€43.8k',delta:'↑ 3,1%',pos:false},{label:'Margen',value:'38,4%',delta:'↑ 2,1pp',pos:true}].map(k => (
              <div key={k.label} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 10px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>{k.label}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'white', marginBottom: 2 }}>{k.value}</div>
                <div style={{ fontSize: 8, fontWeight: 600, color: k.pos ? '#4ade80' : '#f87171' }}>{k.delta}</div>
              </div>
            ))}
          </div>
          <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 10, padding: 12, marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 8 }}>Evolución financiera</div>
            <svg width="100%" height="60" viewBox="0 0 340 60" preserveAspectRatio="none">
              <defs>
                <linearGradient id="bI" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#B2EBF2"/><stop offset="100%" stopColor="#00BCD4"/></linearGradient>
                <linearGradient id="bG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7986CB"/><stop offset="100%" stopColor="#0D2E6E"/></linearGradient>
              </defs>
              {[0,1,2,3,4,5,6,7,8,9,10,11].map(i => (
                <g key={i}>
                  <rect x={i*28+2} y={60-(30+i*2.5)} width={18} height={30+i*2.5} rx={4} fill="url(#bI)" opacity={i===3?1:0.6}/>
                  <rect x={i*28+22} y={60-(18+i*1.5)} width={5} height={18+i*1.5} rx={2} fill="url(#bG)" opacity={i===3?1:0.5}/>
                </g>
              ))}
              <line x1="0" y1="36" x2="340" y2="36" stroke="#4ade80" strokeWidth="1.5"/>
            </svg>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(248,113,113,0.15)', borderRadius: 7, padding: '6px 10px', border: '1px solid rgba(248,113,113,0.2)' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#f87171', flexShrink: 0 }} />
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)' }}>€52.900 sin cobrar · 3 facturas vencidas</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(251,191,36,0.15)', borderRadius: 7, padding: '6px 10px', border: '1px solid rgba(251,191,36,0.2)' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fbbf24', flexShrink: 0 }} />
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)' }}>IVA Q2 · Vence en 11 días</span>
            </div>
          </div>
        </div>
        <div style={{ alignSelf: 'flex-start' }}>
          <p style={{ fontSize: 22, fontWeight: 800, color: 'white', letterSpacing: '-0.03em', lineHeight: 1.2, marginBottom: 8 }}>Previsión completa<br/>de caja</p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, maxWidth: 320 }}>Conectamos con tu ERP para proyectar datos en tiempo real y generar alertas financieras y fiscales.</p>
        </div>
      </div>
      <div style={{ width: 440, background: '#F8F9FB', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px', flexShrink: 0 }}>
        <div style={{ width: '100%', maxWidth: 340 }}>
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 6, letterSpacing: '-0.02em' }}>Acceder al portal</h1>
            <p style={{ fontSize: 13, color: '#6B7280' }}>Introduce tus credenciales para continuar</p>
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@empresa.com" required
                style={{ width: '100%', padding: '10px 12px', fontSize: 13, border: '1px solid #E5E7EB', borderRadius: 8, outline: 'none', background: '#fff', color: '#111827' }}
                onFocus={e => e.target.style.borderColor = '#00BCD4'}
                onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Contraseña</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required
                style={{ width: '100%', padding: '10px 12px', fontSize: 13, border: '1px solid #E5E7EB', borderRadius: 8, outline: 'none', background: '#fff', color: '#111827' }}
                onFocus={e => e.target.style.borderColor = '#00BCD4'}
                onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
            </div>
            {error && <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 12px', fontSize: 12, color: '#DC2626' }}>{error}</div>}
            <button type="submit" disabled={loading}
              style={{ padding: '11px', fontSize: 13, fontWeight: 700, color: '#fff', background: loading ? '#9CA3AF' : 'linear-gradient(135deg,#00BCD4,#0D2E6E)', border: 'none', borderRadius: 10, cursor: loading ? 'not-allowed' : 'pointer', marginTop: 4 }}>
              {loading ? 'Accediendo...' : 'Acceder →'}
            </button>
          </form>
          <p style={{ textAlign: 'center', fontSize: 12, color: '#9CA3AF', marginTop: 24 }}>
            ¿Necesitas acceso?{' '}
            <a href="mailto:hola@brainfi.io" style={{ color: '#00BCD4', fontWeight: 500 }}>hola@brainfi.io</a>
          </p>
        </div>
      </div>
    </div>
  )
}
