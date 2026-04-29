import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Logo from '@/components/Logo'

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
    <div style={{
      minHeight: '100vh', background: '#F8F9FB',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
          <Logo size="md" />
        </div>

        {/* Card */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', padding: 32 }}>
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 6 }}>Acceder al portal</h1>
            <p style={{ fontSize: 13, color: '#6B7280' }}>Introduce tus credenciales para continuar</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@empresa.com"
                required
                style={{
                  width: '100%', padding: '10px 12px', fontSize: 13,
                  border: '1px solid #E5E7EB', borderRadius: 8, outline: 'none',
                  background: '#F9FAFB', color: '#111827',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%', padding: '10px 12px', fontSize: 13,
                  border: '1px solid #E5E7EB', borderRadius: 8, outline: 'none',
                  background: '#F9FAFB', color: '#111827',
                }}
              />
            </div>

            {error && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 12px', fontSize: 12, color: '#DC2626' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '11px', fontSize: 13, fontWeight: 700, color: '#fff',
                background: loading ? '#9CA3AF' : 'linear-gradient(135deg,#00BCD4,#0D2E6E)',
                border: 'none', borderRadius: 10, cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: 4,
              }}
            >
              {loading ? 'Accediendo...' : 'Acceder →'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#9CA3AF', marginTop: 20 }}>
          ¿Necesitas acceso? Escríbenos a{' '}
          <a href="mailto:hola@brainfi.io" style={{ color: '#00BCD4' }}>hola@brainfi.io</a>
        </p>
      </div>
    </div>
  )
}
