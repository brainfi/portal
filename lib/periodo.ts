// src/lib/periodo.ts
// Lógica de periodo compartida por Resumen, Cobros, Pagos y Presupuesto.
// Modelo basado en datos reales: el periodo se expresa con cadenas `ym` ('2026-05').
//   - 'anual'        -> todos los meses con datos
//   - '2026-05'      -> un mes concreto
//   - '2026-T2'      -> un trimestre (los meses de ese trimestre que tengan datos)

export const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

export type Periodo = string // 'anual' | '2026-05' | '2026-T2'

const mesIdx = (ym: string) => parseInt(ym.slice(5, 7), 10) - 1 // 0-11
const anio   = (ym: string) => ym.slice(0, 4)
const triDe  = (ym: string) => Math.floor(mesIdx(ym) / 3) + 1    // 1-4

// ym -> '2026-T2'
export const ymToTrimestre = (ym: string) => `${anio(ym)}-T${triDe(ym)}`

// Dado un periodo y los ym disponibles (con datos), devuelve los ym que cubre.
export function ymsDe(periodo: Periodo, disponibles: string[]): string[] {
  if (periodo === 'anual') return disponibles
  if (periodo.includes('-T')) {
    const [y, q] = periodo.split('-T')
    return disponibles.filter(ym => anio(ym) === y && triDe(ym) === Number(q))
  }
  return disponibles.includes(periodo) ? [periodo] : []
}

// Etiqueta para el botón del filtro. `meses` = [{ ym, label }] disponibles.
export function labelDe(periodo: Periodo, meses: { ym: string; label: string }[]): string {
  if (periodo === 'anual') return 'Este año'
  if (periodo.includes('-T')) {
    const [y, q] = periodo.split('-T')
    return `T${q} ${y}`
  }
  return meses.find(m => m.ym === periodo)?.label ?? periodo
}
