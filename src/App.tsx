import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { DataProvider } from '@/contexts/DataContext'
import { ScenariosProvider } from '@/contexts/ScenariosContext'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import Ajustes from '@/pages/Ajustes'
import Cobros from '@/pages/Cobros'
import Pagos from '@/pages/Pagos'
import Presupuesto from '@/pages/Presupuesto'
import PresupuestoConfig from '@/pages/PresupuestoConfig'
import Previsiones from '@/pages/Previsiones'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#F8F9FB' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#00BCD4,#0D2E6E)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 20, color: 'white' }}>b</span>
        </div>
        <span style={{ fontSize: 12, color: '#9CA3AF' }}>Cargando...</span>
      </div>
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AppRoutes() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/previsiones" element={<ProtectedRoute><Previsiones /></ProtectedRoute>} />
      <Route path="/cobros" element={<ProtectedRoute><Cobros /></ProtectedRoute>} />
      <Route path="/pagos" element={<ProtectedRoute><Pagos /></ProtectedRoute>} />
      <Route path="/presupuesto" element={<ProtectedRoute><Presupuesto /></ProtectedRoute>} />
      <Route path="/presupuesto/configurar" element={<ProtectedRoute><PresupuestoConfig /></ProtectedRoute>} />
      <Route path="/ajustes" element={<ProtectedRoute><Ajustes /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <ScenariosProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ScenariosProvider>
      </DataProvider>
    </AuthProvider>
  )
}
