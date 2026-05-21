import Layout from '@/components/Layout'
import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'

export default function Ajustes() {
  const { user } = useAuth()
  const [holdedKey, setHoldedKey] = useState('')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <Layout title="Ajustes">
      <div style={{ maxWidth: 640 }}>


        {/* Cuenta */}
        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: 24, marginBottom: 16 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 16 }}>Cuenta</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Email</label>
              <input
                value={user?.email ?? ''}
                disabled
                style={{ width: '100%', padding: '9px 12px', fontSize: 13, border: '1px solid #E5E7EB', borderRadius: 8, background: '#F9FAFB', color: '#6B7280' }}
              />
            </div>
          </div>
        </div>

        {/* Holded */}
        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#F94545', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 44 44" fill="none">
                <rect x="8" y="16" width="13" height="22" rx="5" fill="white" transform="rotate(-38 14.5 27)"/>
                <rect x="22" y="9" width="16" height="16" rx="5" fill="white" transform="rotate(45 30 17)"/>
              </svg>
            </div>
            <div>
              <h2 style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>Holded</h2>
              <p style={{ fontSize: 11, color: '#9CA3AF' }}>Partner oficial · Sincronización de datos ERP</p>
            </div>
          </div>
          <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 16 }}>
            Introduce tu API key de Holded para sincronizar facturas, gastos y contactos automáticamente.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              type="password"
              value={holdedKey}
              onChange={e => setHoldedKey(e.target.value)}
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              style={{ flex: 1, padding: '9px 12px', fontSize: 13, border: '1px solid #E5E7EB', borderRadius: 8, outline: 'none', background: '#F9FAFB', color: '#111827' }}
            />
            <button
              onClick={handleSave}
              style={{ display:'flex', alignItems:'center', gap:6, padding: '9px 16px', fontSize: 13, fontWeight: 500, color: '#fff', background: saved ? '#2DC653' : '#4361EE', border: 'none', borderRadius: 8, cursor:'pointer' }}
            >
              {saved ? '✓ Guardado' : 'Guardar'}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  )
}
