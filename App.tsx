import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import Ajustes from '@/pages/Ajustes'
import Impuestos from '@/pages/Impuestos'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#F8F9FB' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 36, height: 36, background: '#4361EE', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
  <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
    <path d="M3 2h5a3 3 0 010 6H3V2z" fill="white"/>
    <path d="M3 8h6a3 3 0 010 6H3V8z" fill="rgba(255,255,255,0.6)"/>
  </svg>
</div>
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AppRoutes() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/impuestos" element={<ProtectedRoute><Impuestos /></ProtectedRoute>} />
      <Route path="/ajustes" element={<ProtectedRoute><Ajustes /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
