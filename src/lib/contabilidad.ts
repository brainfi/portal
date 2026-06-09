// Motor contable: interpreta el libro mayor (pestaña Diario) y deriva las vistas
// del portal usando la lógica de grupos del PGC español.

const DAY = 86400000
const MES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

// Importes con coma decimal y posible punto de miles ("1.234,56" → 1234.56).
export function toNum(v?: string): number {
  if (v == null) return 0
  let s = String(v).trim().replace(/[€\s]/g, '')
  if (s === '') return 0
  const hasComma = s.includes(','), hasDot = s.includes('.')
  if (hasComma && hasDot) s = s.replace(/\./g, '').replace(',', '.')
  else if (hasComma) s = s.replace(',', '.')
  const n = parseFloat(s)
  return isNaN(n) ? 0 : n
}

export function parseFecha(v?: string): Date | null {
  if (!v) return null
  const s = String(v).trim()
  if (!s) return null
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (m) { const d = new Date(+m[1], +m[2] - 1, +m[3]); return isNaN(d.getTime()) ? null : d }
  m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/)
  if (m) { let yr = +m[3]; if (yr < 100) yr += 2000; const d = new Date(yr, +m[2] - 1, +m[1]); return isNaN(d.getTime()) ? null : d }
  const d = new Date(s)
  return isNaN(d.getTime()) ? null : d
}

// Toma un valor de una fila probando varios nombres de cabecera.
function pick(row: Record<string, string>, ...keys: string[]): string {
  for (const k of keys) {
    if (row[k] != null && row[k] !== '') return row[k]
    // tolerante a may/min y acentos
    const found = Object.keys(row).find(rk => rk.toLowerCase().trim() === k.toLowerCase().trim())
    if (found && row[found] !== '') return row[found]
  }
  return ''
}

export interface Apunte {
  asiento: string
  cuenta: string          // subcuenta completa (p. ej. 4300804200)
  fechaReg: Date | null
  fechaVto: Date | null
  documento: string
  concepto: string
  debe: number
  haber: number
  importe: number         // debe - haber (con signo)
  contrapartida: string
}

export function parseDiario(rows: Record<string, string>[]): Apunte[] {
  return rows.map(r => {
    const debe = toNum(pick(r, 'Debe'))
    const haber = toNum(pick(r, 'Haber'))
    const fechaReg = parseFecha(pick(r, 'Fecha de registro', 'Fecha', 'Fecha asiento'))
    let fechaVto = parseFecha(pick(r, 'Fecha de vencimiento', 'Fecha de documento', 'Vencimiento'))
    if (!fechaVto && fechaReg) fechaVto = new Date(fechaReg.getTime() + 30 * DAY)
    return {
      asiento: pick(r, 'Asiento', 'Nº asiento', 'Numero'),
      cuenta: pick(r, 'Subcuenta', 'Cuenta').replace(/\s/g, ''),
      fechaReg, fechaVto,
      documento: pick(r, 'Documento', 'Referencia'),
      concepto: pick(r, 'Concepto', 'Descripcion'),
      debe, haber, importe: debe - haber,
      contrapartida: pick(r, 'Contrapartida'),
    }
  }).filter(a => a.cuenta)
}

// ─── Clasificación por grupos del PGC ──────────────────────────────────────────
export const esIngreso       = (c: string) => /^7[0-5]/.test(c)              // 70-75 explotación
export const esGastoOperativo = (c: string) => /^6[0-5]/.test(c) && !c.startsWith('630') // 60-65 (sin imp. beneficios)
export const esGastoFin      = (c: string) => c.startsWith('66')
export const esTesoreria     = (c: string) => c.startsWith('57')             // 570 caja, 572 bancos
export const esCliente       = (c: string) => c.startsWith('43')             // 430,431,436
export const esProveedor     = (c: string) => c.startsWith('40') || c.startsWith('41')
export const esDeuda         = (c: string) => c.startsWith('17') || c.startsWith('52')

const ym = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`

export interface ResumenMes {
  ym: string; mes: string
  ingresos: number; gastos: number; ebitda: number; margenEbitda: number
  tesoreria: number; dso: number
}
export interface Resumen {
  ingresos: number; gastos: number; ebitda: number; margen: number
  tesoreria: number; pendienteCobro: number; pendientePago: number; deuda: number
  dso: number
  evolucion: ResumenMes[]
}

export function buildResumen(rows: Record<string, string>[]): Resumen {
  const ap = parseDiario(rows)
  const sum = (pred: (a: Apunte) => boolean, fn: (a: Apunte) => number) =>
    ap.filter(pred).reduce((s, a) => s + fn(a), 0)

  const ingresos = sum(a => esIngreso(a.cuenta), a => a.haber - a.debe)
  const gastos   = sum(a => esGastoOperativo(a.cuenta), a => a.debe - a.haber)
  const ebitda   = ingresos - gastos
  const margen   = ingresos > 0 ? (ebitda / ingresos) * 100 : 0
  const tesoreria      = sum(a => esTesoreria(a.cuenta), a => a.debe - a.haber)
  const pendienteCobro = sum(a => esCliente(a.cuenta), a => a.debe - a.haber)
  const pendientePago  = sum(a => esProveedor(a.cuenta), a => a.haber - a.debe)
  const deuda          = sum(a => esDeuda(a.cuenta), a => a.haber - a.debe)
  const dso            = ingresos > 0 ? Math.round((pendienteCobro / ingresos) * 365) : 0

  // Evolución mensual (tesorería como saldo acumulado).
  const meses = Array.from(new Set(ap.filter(a => a.fechaReg).map(a => ym(a.fechaReg!)))).sort()
  let tesAcum = 0
  const evolucion: ResumenMes[] = meses.map(m => {
    const delMes = ap.filter(a => a.fechaReg && ym(a.fechaReg) === m)
    const ing = delMes.filter(a => esIngreso(a.cuenta)).reduce((s, a) => s + (a.haber - a.debe), 0)
    const gas = delMes.filter(a => esGastoOperativo(a.cuenta)).reduce((s, a) => s + (a.debe - a.haber), 0)
    const eb  = ing - gas
    tesAcum  += delMes.filter(a => esTesoreria(a.cuenta)).reduce((s, a) => s + (a.debe - a.haber), 0)
    return {
      ym: m, mes: MES[+m.split('-')[1] - 1],
      ingresos: Math.round(ing), gastos: Math.round(gas), ebitda: Math.round(eb),
      margenEbitda: ing > 0 ? +((eb / ing) * 100).toFixed(1) : 0,
      tesoreria: Math.round(tesAcum),
      dso: ing > 0 ? Math.round((pendienteCobro / ingresos) * 365) : 0,
    }
  })

  return { ingresos, gastos, ebitda, margen, tesoreria, pendienteCobro, pendientePago, deuda, dso, evolucion }
}
