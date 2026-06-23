// src/contexts/ScenariosContext.tsx
// Estado compartido de escenarios. La página Escenarios (futura) hace el CRUD;
// la página Previsiones lee de aquí y recalcula la previsión en vivo.
//
// De momento vive en memoria + semilla de ejemplo. Cuando haya backend,
// se persiste en Supabase (tabla `escenarios`) sin cambiar la interfaz.

import { createContext, useContext, useState } from 'react'

export interface Escenario {
  id: string
  nombre: string
  descripcion?: string
  tipo: 'ingreso' | 'gasto'
  /** Importe en € CON signo. Negativo = reduce ese bucket (p.ej. pérdida de cliente) */
  importe: number
  recurrencia: 'puntual' | 'mensual'
  /** Mes de previsión en el que empieza. 0 = primer mes futuro */
  mesInicio: number
  /** Solo para mensual: nº de meses que dura. undefined = hasta el final del horizonte */
  duracionMeses?: number
  activo: boolean
}

interface ScenariosContextType {
  escenarios: Escenario[]
  toggle: (id: string) => void
  add: (e: Omit<Escenario, 'id'>) => void
  update: (id: string, patch: Partial<Escenario>) => void
  remove: (id: string) => void
}

// Semilla de ejemplo (se sustituye por datos reales / Supabase).
const SEMILLA: Escenario[] = [
  { id: 's1', nombre: 'Nueva cuenta · Northwind', descripcion: 'Contrato recurrente firmado', tipo: 'ingreso', importe: 9000, recurrencia: 'mensual', mesInicio: 1, activo: false },
  { id: 's2', nombre: 'Contratar dev senior', descripcion: 'Coste empresa mensual', tipo: 'gasto', importe: 5500, recurrencia: 'mensual', mesInicio: 2, activo: false },
  { id: 's3', nombre: 'Renovar equipamiento', descripcion: 'Compra única de hardware', tipo: 'gasto', importe: 14000, recurrencia: 'puntual', mesInicio: 1, activo: false },
  { id: 's4', nombre: 'Riesgo · pérdida Acme Foundry', descripcion: 'Baja del cliente principal', tipo: 'ingreso', importe: -38000, recurrencia: 'mensual', mesInicio: 3, activo: false },
]

const ScenariosContext = createContext<ScenariosContextType>({
  escenarios: [], toggle: () => {}, add: () => {}, update: () => {}, remove: () => {},
})

export function ScenariosProvider({ children }: { children: React.ReactNode }) {
  const [escenarios, setEscenarios] = useState<Escenario[]>(SEMILLA)

  const toggle = (id: string) =>
    setEscenarios(prev => prev.map(e => e.id === id ? { ...e, activo: !e.activo } : e))

  const add = (e: Omit<Escenario, 'id'>) =>
    setEscenarios(prev => [...prev, { ...e, id: `s${Date.now()}` }])

  const update = (id: string, patch: Partial<Escenario>) =>
    setEscenarios(prev => prev.map(e => e.id === id ? { ...e, ...patch } : e))

  const remove = (id: string) =>
    setEscenarios(prev => prev.filter(e => e.id !== id))

  return (
    <ScenariosContext.Provider value={{ escenarios, toggle, add, update, remove }}>
      {children}
    </ScenariosContext.Provider>
  )
}

export function useScenarios() { return useContext(ScenariosContext) }
