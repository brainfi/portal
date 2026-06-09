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

// ─── Cobros (reconstruido desde cuentas de cliente 43x) ────────────────────────
function iso(d: Date | null): string {
  return d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` : ''
}

export interface FacturaCobro {
  id: string; cliente: string; clienteId: string; numero: string
  emision: string; vencimiento: string; importe: number; cobrado: number
  estado: 'cobrada' | 'parcial' | 'vencida' | 'pendiente'; diasVencida: number
}
export interface ClienteCobro {
  id: string; nombre: string; sector: string; telefono: string; email: string
  riesgo: 'bajo' | 'medio' | 'alto'; totalPendiente: number; facturas: number; dsoMedio: number
}

export function buildCobros(rows: Record<string, string>[]): { clientes: ClienteCobro[]; facturas: FacturaCobro[] } {
  const ap = parseDiario(rows)
  const hoy = new Date()
  const porCuenta = new Map<string, Apunte[]>()
  ap.filter(a => esCliente(a.cuenta)).forEach(a => {
    if (!porCuenta.has(a.cuenta)) porCuenta.set(a.cuenta, [])
    porCuenta.get(a.cuenta)!.push(a)
  })

  const facturas: FacturaCobro[] = []
  const clientes: ClienteCobro[] = []

  for (const [cuenta, movs] of porCuenta) {
    // Cargos (debe) = facturas emitidas; abonos (haber) = cobros recibidos.
    const cargos = movs.filter(m => m.debe > 0)
      .sort((a, b) => (a.fechaReg?.getTime() ?? 0) - (b.fechaReg?.getTime() ?? 0))
    let pool = movs.reduce((s, m) => s + m.haber, 0)   // total cobrado del cliente

    const fcli: FacturaCobro[] = cargos.map((m, k) => {
      const importe = m.debe
      const cobrado = Math.min(importe, Math.max(0, pool))   // FIFO: lo más antiguo se cobra primero
      pool -= cobrado
      const diasVencida = m.fechaVto ? Math.floor((hoy.getTime() - m.fechaVto.getTime()) / DAY) : 0
      let estado: FacturaCobro['estado']
      if (cobrado >= importe) estado = 'cobrada'
      else if (cobrado > 0) estado = 'parcial'
      else if (diasVencida > 0) estado = 'vencida'
      else estado = 'pendiente'
      return {
        id: `${cuenta}-${k}`, cliente: `Cliente ${cuenta}`, clienteId: cuenta, numero: m.documento,
        emision: iso(m.fechaReg), vencimiento: iso(m.fechaVto), importe, cobrado, estado, diasVencida,
      }
    })
    facturas.push(...fcli)

    const abiertas = fcli.filter(f => f.estado !== 'cobrada')
    const totalPendiente = abiertas.reduce((s, f) => s + (f.importe - f.cobrado), 0)
    const edades = abiertas.map(f => {
      const e = parseFecha(f.emision)
      return e ? Math.max(0, Math.floor((hoy.getTime() - e.getTime()) / DAY)) : 0
    })
    const dsoMedio = edades.length ? Math.round(edades.reduce((a, b) => a + b, 0) / edades.length) : 0
    const vencido = abiertas.filter(f => f.diasVencida > 0).reduce((s, f) => s + (f.importe - f.cobrado), 0)
    const riesgo: ClienteCobro['riesgo'] =
      totalPendiente > 0 && vencido > totalPendiente * 0.5 ? 'alto' : vencido > 0 ? 'medio' : 'bajo'

    clientes.push({
      id: cuenta, nombre: `Cliente ${cuenta}`, sector: '—', telefono: '', email: '',
      riesgo, totalPendiente, facturas: abiertas.length, dsoMedio,
    })
  }
  return { clientes, facturas }
}

// ─── Pagos (reconstruido desde cuentas a pagar y de deuda) ─────────────────────
function categoriaPago(cuenta: string): 'nominas' | 'fiscal' | 'proveedor' | 'ss' | null {
  if (/^465/.test(cuenta)) return 'nominas'
  if (/^476/.test(cuenta)) return 'ss'
  if (/^475/.test(cuenta)) return 'fiscal'
  if (/^4[01]/.test(cuenta)) return 'proveedor'   // 400/401/410/411 acreedores
  return null
}
const LBL_PAGO: Record<string, string> = {
  nominas: 'Nóminas', ss: 'Seguridad Social', fiscal: 'Hacienda Pública', proveedor: 'Proveedor',
}

export interface ObligacionPago {
  id: number; concepto: string; detalle: string
  categoria: 'nominas' | 'fiscal' | 'proveedor' | 'alquiler' | 'suscripcion' | 'ss'
  vencimiento: string; importe: number
  estado: 'vencida' | 'urgente' | 'programada'; diasRestantes: number; cuentaPGC: string
}
export interface PrestamoPago {
  id: number; nombre: string; entidad: string
  tipo: 'prestamo' | 'leasing' | 'credito' | 'pagare'
  clasificacion: 'financiera' | 'no_financiera'; plazo: 'corto' | 'largo'
  capitalInicial: number; capitalPendiente: number; cuotaMensual: number
  tipoInteres: number; fechaInicio: string; fechaFin: string
  proximaFecha: string; mesesRestantes: number
}

export function buildPagos(rows: Record<string, string>[]): { obligaciones: ObligacionPago[]; prestamos: PrestamoPago[] } {
  const ap = parseDiario(rows)
  const hoy = new Date()
  const prox = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 1)
  const proximaFecha = `${prox.getFullYear()}-${String(prox.getMonth() + 1).padStart(2, '0')}-01`

  // ── Obligaciones: saldo acreedor pendiente por subcuenta a pagar ──
  const porPago = new Map<string, Apunte[]>()
  ap.forEach(a => {
    if (categoriaPago(a.cuenta)) {
      if (!porPago.has(a.cuenta)) porPago.set(a.cuenta, [])
      porPago.get(a.cuenta)!.push(a)
    }
  })

  const obligaciones: ObligacionPago[] = []
  let oid = 0
  for (const [cuenta, movs] of porPago) {
    const pendiente = movs.reduce((s, m) => s + m.haber - m.debe, 0)   // acreedor − pagado
    if (pendiente <= 0.005) continue
    const cat = categoriaPago(cuenta)!
    // vencimiento más próximo entre los abonos pendientes
    const vtos = movs.filter(m => m.haber > 0 && m.fechaVto).map(m => m.fechaVto!.getTime())
    const venc = vtos.length ? new Date(Math.min(...vtos)) : null
    const diasRestantes = venc ? Math.floor((venc.getTime() - hoy.getTime()) / DAY) : 0
    const estado: ObligacionPago['estado'] = diasRestantes < 0 ? 'vencida' : diasRestantes <= 10 ? 'urgente' : 'programada'
    const ult = movs.filter(m => m.concepto).slice(-1)[0]
    obligaciones.push({
      id: ++oid,
      concepto: cat === 'proveedor' ? `Proveedor ${cuenta}` : LBL_PAGO[cat],
      detalle: ult?.concepto || `Subcuenta ${cuenta}`,
      categoria: cat, vencimiento: iso(venc), importe: pendiente,
      estado, diasRestantes, cuentaPGC: cuenta,
    })
  }

  // ── Préstamos / deuda: saldo acreedor por subcuenta 17x (largo) / 52x (corto) ──
  const porDeuda = new Map<string, Apunte[]>()
  ap.filter(a => esDeuda(a.cuenta)).forEach(a => {
    if (!porDeuda.has(a.cuenta)) porDeuda.set(a.cuenta, [])
    porDeuda.get(a.cuenta)!.push(a)
  })

  const prestamos: PrestamoPago[] = []
  let pid = 0
  for (const [cuenta, movs] of porDeuda) {
    const capitalPendiente = movs.reduce((s, m) => s + m.haber - m.debe, 0)
    if (capitalPendiente <= 0.005) continue
    const capitalInicial = movs.reduce((s, m) => s + m.haber, 0) || capitalPendiente
    const inicio = movs.map(m => m.fechaReg?.getTime() ?? 0).filter(Boolean).sort()[0]
    prestamos.push({
      id: ++pid, nombre: `Deuda ${cuenta}`, entidad: '',
      tipo: 'prestamo', clasificacion: 'financiera',
      plazo: /^52/.test(cuenta) ? 'corto' : 'largo',
      capitalInicial, capitalPendiente, cuotaMensual: 0,
      tipoInteres: 0, fechaInicio: inicio ? iso(new Date(inicio)) : '', fechaFin: '',
      proximaFecha, mesesRestantes: 0,
    })
  }

  return { obligaciones, prestamos }
}

// ─── Real por partida del plan (derivado del mayor) ────────────────────────────
// Para cada partida (con su código PGC y tipo), suma por mes los apuntes del
// mayor cuya subcuenta empieza por ese código. Ingresos = haber−debe (cuentas 7x),
// gastos = debe−haber (cuentas 6x). Devuelve real[idPartida] = number[12] y la
// lista de meses (0-11) que tienen algún dato real.
export function buildReal(
  rows: Record<string, string>[],
  partidas: { id: number; cuentaCodigo: string; tipo: 'ingreso' | 'gasto' }[],
): { real: Record<number, number[]>; mesesConReal: number[] } {
  const ap = parseDiario(rows)
  // prefijo más largo primero, para que 640 gane a 64 si ambos existen
  const orden = [...partidas]
    .filter(p => p.cuentaCodigo)
    .sort((a, b) => b.cuentaCodigo.length - a.cuentaCodigo.length)

  const real: Record<number, number[]> = {}
  partidas.forEach(p => { real[p.id] = Array(12).fill(0) })
  const meses = new Set<number>()

  for (const a of ap) {
    if (!a.fechaReg || !a.cuenta) continue
    const p = orden.find(pp => a.cuenta.startsWith(pp.cuentaCodigo))
    if (!p) continue
    const val = p.tipo === 'ingreso' ? (a.haber - a.debe) : (a.debe - a.haber)
    if (val === 0) continue
    real[p.id][a.fechaReg.getMonth()] += val
    meses.add(a.fechaReg.getMonth())
  }
  return { real, mesesConReal: Array.from(meses).sort((x, y) => x - y) }
}
