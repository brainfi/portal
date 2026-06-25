import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { fetchDatos, SheetError } from '@/lib/sheets'
import { DIARIO_DEMO } from '@/lib/demoData'

export interface DatosRaw {
  diario: Record<string, string>[]
  clientes: Record<string, string>[]
  facturas: Record<string, string>[]
  pagos: Record<string, string>[]
  prestamos: Record<string, string>[]
  presupuesto: Record<string, string>[]
}

interface DatosState {
  data: DatosRaw | null
  loading: boolean
  error: { code: string; message: string } | null
  syncedAt: string | null
  /** true cuando se están mostrando datos de demostración (sin hoja conectada). */
  isDemo: boolean
  /** Vuelve a leer la hoja. Úsalo tras conectar/cambiar la hoja en Ajustes. */
  refresh: () => Promise<void>
}

const DataContext = createContext<DatosState>({
  data: null, loading: false, error: null, syncedAt: null, isDemo: false,
  refresh: async () => {},
})

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [data, setData] = useState<DatosRaw | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<{ code: string; message: string } | null>(null)
  const [syncedAt, setSyncedAt] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const r = await fetchDatos()
      setData({
        diario: r.diario ?? [],
        clientes: r.clientes ?? [], facturas: r.facturas ?? [],
        pagos: r.pagos ?? [], prestamos: r.prestamos ?? [], presupuesto: r.presupuesto ?? [],
      })
      setSyncedAt(r.syncedAt ?? new Date().toISOString())
    } catch (e) {
      const code = e instanceof SheetError ? e.code : 'error'
      const message = e instanceof Error ? e.message : String(e)
      setError({ code, message })
      if (code === 'no_sheet') setData(null)
    } finally {
      setLoading(false)
    }
  }, [user])

  // Carga inicial al iniciar sesión.
  useEffect(() => {
    if (user) refresh()
    else { setData(null); setSyncedAt(null); setError(null) }
  }, [user, refresh])

// ── Demo: si no hay diario real con apuntes, servimos el Diario de demostración ──
  const tieneReal = !!data && Array.isArray(data.diario) && data.diario.length > 0
  const isDemo = !loading && !tieneReal
  const dataServida: DatosRaw | null = tieneReal
    ? data
    : {
        diario: DIARIO_DEMO,
        clientes: [], facturas: [], pagos: [], prestamos: [], presupuesto: [],
      }

  return (
    <DataContext.Provider value={{ data: dataServida, loading, error, syncedAt, isDemo, refresh }}>
      {children}
    </DataContext.Provider>
  )
}

export function useDatos() { return useContext(DataContext) }
