// src/lib/forecast.ts
// Motor de previsión de brainfi.
// Regresión lineal (mínimos cuadrados) sobre el histórico mensual + banda de
// confianza que se ensancha con el horizonte. Aplica el impacto de escenarios.
//
// Cuando se conecte el ERP real, solo cambia el ORIGEN del histórico:
// la lógica de previsión no se toca.

import type { Escenario } from '@/contexts/ScenariosContext'

export const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

/** Genera n etiquetas "Mmm AA" empezando en (mes0, anio0). mes0 = 0..11 */
export function etiquetasDesde(mes0: number, anio0: number, n: number): string[] {
  const out: string[] = []
  let m = mes0, a = anio0
  for (let i = 0; i < n; i++) {
    out.push(`${MESES[m]} ${String(a).slice(2)}`)
    m++; if (m > 11) { m = 0; a++ }
  }
  return out
}

interface Ajuste { pendiente: number; interseccion: number; stdErr: number; n: number }

/** Regresión lineal por mínimos cuadrados sobre índices 0..n-1 */
export function regresionLineal(valores: number[]): Ajuste {
  const n = valores.length
  const sumX = valores.reduce((a, _v, i) => a + i, 0)
  const sumY = valores.reduce((a, v) => a + v, 0)
  const sumXY = valores.reduce((a, v, i) => a + i * v, 0)
  const sumXX = valores.reduce((a, _v, i) => a + i * i, 0)
  const denom = n * sumXX - sumX * sumX
  const pendiente = denom === 0 ? 0 : (n * sumXY - sumX * sumY) / denom
  const interseccion = (sumY - pendiente * sumX) / n
  const sse = valores.reduce((a, v, i) => {
    const r = v - (interseccion + pendiente * i)
    return a + r * r
  }, 0)
  const stdErr = Math.sqrt(sse / Math.max(1, n - 2))
  return { pendiente, interseccion, stdErr, n }
}

export interface PuntoPrevision { valor: number; inferior: number; superior: number }

/**
 * Proyecta `periodos` meses hacia delante.
 * z = 1.28 ≈ intervalo del 80% (previsión, no certeza).
 * El margen crece con la raíz del horizonte → la incertidumbre aumenta con el tiempo.
 */
export function preverSerie(historico: number[], periodos: number, z = 1.28): PuntoPrevision[] {
  const { pendiente, interseccion, stdErr, n } = regresionLineal(historico)
  const out: PuntoPrevision[] = []
  for (let h = 1; h <= periodos; h++) {
    const valor = interseccion + pendiente * (n - 1 + h)
    const margen = z * stdErr * Math.sqrt(1 + h / n)
    out.push({ valor, inferior: valor - margen, superior: valor + margen })
  }
  return out
}

// ── Aplicación de escenarios ──────────────────────────────────────────────

/** Delta que aplica un escenario al mes de previsión `h` (0 = primer mes futuro) */
function deltaEscenario(e: Escenario, h: number): { ingreso: number; gasto: number } {
  if (!e.activo) return { ingreso: 0, gasto: 0 }
  if (h < e.mesInicio) return { ingreso: 0, gasto: 0 }
  if (e.recurrencia === 'puntual' && h !== e.mesInicio) return { ingreso: 0, gasto: 0 }
  if (e.recurrencia === 'mensual' && e.duracionMeses != null) {
    if (h >= e.mesInicio + e.duracionMeses) return { ingreso: 0, gasto: 0 }
  }
  return e.tipo === 'ingreso'
    ? { ingreso: e.importe, gasto: 0 }
    : { ingreso: 0, gasto: e.importe }
}

export interface FilaPrevision {
  mes: string
  tipo: 'historico' | 'prevision'
  // Valores efectivos (base + escenarios activos)
  ingresos: number
  gastos: number
  neto: number
  caja: number
  // Referencia base (sin escenarios) para comparar en el gráfico
  netoBase: number
  cajaBase: number
  // Banda de confianza sobre la caja acumulada base
  cajaInf: number
  cajaSup: number
}

export interface ParametrosPrevision {
  histIngresos: number[]
  histGastos: number[]
  histMeses: string[]
  cajaInicial: number
  mesInicioPrevision: number // 0..11
  anioInicioPrevision: number
  periodos: number
  escenarios: Escenario[]
}

/**
 * Construye la tabla completa: histórico + previsión, base vs escenarios,
 * con caja acumulada y banda de confianza.
 */
export function construirPrevision(p: ParametrosPrevision): FilaPrevision[] {
  const filas: FilaPrevision[] = []

  // Tramo histórico (la caja acumulada arranca en cajaInicial al final del histórico,
  // así que reconstruimos hacia atrás para que la línea sea continua).
  const netoHist = p.histIngresos.map((ing, i) => ing - p.histGastos[i])
  const cajaFinalHist = p.cajaInicial
  const cajaHist: number[] = new Array(netoHist.length)
  cajaHist[netoHist.length - 1] = cajaFinalHist
  for (let i = netoHist.length - 2; i >= 0; i--) {
    cajaHist[i] = cajaHist[i + 1] - netoHist[i + 1]
  }
  p.histMeses.forEach((mes, i) => {
    filas.push({
      mes, tipo: 'historico',
      ingresos: p.histIngresos[i], gastos: p.histGastos[i], neto: netoHist[i], caja: cajaHist[i],
      netoBase: netoHist[i], cajaBase: cajaHist[i], cajaInf: cajaHist[i], cajaSup: cajaHist[i],
    })
  })

  // Tramo previsión
  const fIng = preverSerie(p.histIngresos, p.periodos)
  const fGas = preverSerie(p.histGastos, p.periodos)
  const etiquetas = etiquetasDesde(p.mesInicioPrevision, p.anioInicioPrevision, p.periodos)

  let cajaBase = cajaFinalHist
  let cajaEsc = cajaFinalHist
  let cajaInfAcum = cajaFinalHist
  let cajaSupAcum = cajaFinalHist

  for (let h = 0; h < p.periodos; h++) {
    const ingBase = Math.max(0, fIng[h].valor)
    const gasBase = Math.max(0, fGas[h].valor)
    const netoBase = ingBase - gasBase

    let dIng = 0, dGas = 0
    for (const e of p.escenarios) {
      const d = deltaEscenario(e, h)
      dIng += d.ingreso; dGas += d.gasto
    }
    const ingEf = ingBase + dIng
    const gasEf = gasBase + dGas
    const netoEf = ingEf - gasEf

    cajaBase += netoBase
    cajaEsc += netoEf
    cajaInfAcum += (fIng[h].inferior - fGas[h].superior)
    cajaSupAcum += (fIng[h].superior - fGas[h].inferior)

    filas.push({
      mes: etiquetas[h], tipo: 'prevision',
      ingresos: ingEf, gastos: gasEf, neto: netoEf, caja: cajaEsc,
      netoBase, cajaBase,
      cajaInf: cajaInfAcum, cajaSup: cajaSupAcum,
    })
  }

  return filas
}

/** Resumen de un KPI: valor actual vs valor previsto al final del horizonte */
export function resumenKPI(
  serieHist: number[], periodos: number, escenariosDelta = 0,
): { actual: number; previsto: number; deltaPct: number } {
  const actual = serieHist[serieHist.length - 1]
  const prev = preverSerie(serieHist, periodos)
  const previsto = prev[prev.length - 1].valor + escenariosDelta
  const deltaPct = actual !== 0 ? ((previsto - actual) / Math.abs(actual)) * 100 : 0
  return { actual, previsto, deltaPct }
}
