import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { fetchDatos, SheetError } from '@/lib/sheets'

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
  /** Vuelve a leer la hoja. Úsalo tras conectar/cambiar la hoja en Ajustes. */
  refresh: () => Promise<void>
}

const DataContext = createContext<DatosState>({
  data: null, loading: false, error: null, syncedAt: null,
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
    setError(null)
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

  return (
    <DataContext.Provider value={{ data, loading, error, syncedAt, refresh }}>
      {children}
    </DataContext.Provider>
  )
}

export function useDatos() { return useContext(DataContext) }
