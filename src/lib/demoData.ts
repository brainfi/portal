// src/lib/demoData.ts
// Diario contable de DEMOSTRACIÓN, generado en memoria. Alimenta todo el portal
// cuando el usuario aún no ha conectado su hoja de Google. Las claves coinciden
// exactamente con las que espera parseDiario() en contabilidad.ts.
// Empresa ficticia "Brío Estudio S.L." · cifras modestas para que se note demo.

type Fila = Record<string, string>

const CLIENTES: [string, string][] = [
  ['4300000001', 'Cliente Demo · Vega Diseño'],
  ['4300000002', 'Cliente Demo · Norte Logística'],
  ['4300000003', 'Cliente Demo · Aula Digital'],
]

const f = (d: Date) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
const eur = (n: number) => n.toFixed(2)

// Pseudo-aleatorio determinista (misma demo siempre)
let seed = 7
const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff }
const pick = <T,>(arr: T[]): T => arr[Math.floor(rnd() * arr.length)]

export function generarDiarioDemo(): Fila[] {
  const filas: Fila[] = []
  let asiento = 0
  const add = (sub: string, fecha: Date, doc: string, vto: Date | null, concepto: string, debe: number, haber: number, contra: string) => {
    filas.push({
      'Asiento': String(asiento),
      'Subcuenta': sub,
      'Fecha de registro': f(fecha),
      'Documento': doc,
      'Fecha de vencimiento': vto ? f(vto) : '',
      'Concepto': concepto,
      'Debe': debe ? eur(debe) : '',
      'Haber': haber ? eur(haber) : '',
      'Saldo': '',
      'Contrapartida': contra,
    })
  }

  // 6 meses hacia atrás desde el mes pasado
  const hoy = new Date()
  const meses: Date[] = []
  for (let i = 6; i >= 1; i--) meses.push(new Date(hoy.getFullYear(), hoy.getMonth() - i, 1))

  // Préstamo inicial (primer mes)
  asiento++
  const m0 = meses[0]
  add('5720000000', new Date(m0.getFullYear(), m0.getMonth(), 2), 'PREST-DEMO', null, 'Disposición préstamo (demo)', 40000, 0, '1700000000')
  add('1700000000', new Date(m0.getFullYear(), m0.getMonth(), 2), 'PREST-DEMO', null, 'Préstamo bancario L/P (demo)', 0, 40000, '5720000000')

  meses.forEach((mes, idx) => {
    const yy = mes.getFullYear(), mm = mes.getMonth()
    const esUltimo = idx >= meses.length - 2 // últimos 2 meses dejan facturas sin cobrar

    // 3-4 ventas/mes
    const nVentas = 3 + Math.floor(rnd() * 2)
    for (let k = 0; k < nVentas; k++) {
      const base = Math.round((4000 + rnd() * 6000) / 10) * 10
      const iva = Math.round(base * 0.21 * 100) / 100
      const total = base + iva
      const [cuentaCli, nombreCli] = pick(CLIENTES)
      asiento++
      const dia = 3 + Math.floor(rnd() * 22)
      const freg = new Date(yy, mm, dia)
      const fvto = new Date(freg.getTime() + 30 * 86400000)
      const doc = `F-DEMO-${yy}${String(mm + 1).padStart(2, '0')}-${k + 1}`
      add(cuentaCli, freg, doc, fvto, `Venta · ${nombreCli}`, total, 0, '7000000000')
      add('7000000000', freg, doc, null, 'Prestación de servicios (demo)', 0, base, cuentaCli)
      add('4770000000', freg, doc, null, 'IVA repercutido (demo)', 0, iva, cuentaCli)
      // cobro (salvo en los últimos meses, para dejar pendiente de cobro)
      if (!esUltimo || rnd() > 0.6) {
        asiento++
        const fcob = new Date(fvto.getTime() + (rnd() * 10 - 3) * 86400000)
        add('5720000000', fcob, `COB-${doc}`, null, `Cobro ${doc}`, total, 0, cuentaCli)
        add(cuentaCli, fcob, `COB-${doc}`, null, `Cobro · ${nombreCli}`, 0, total, '5720000000')
      }
    }

    // Compra mensual
    const baseC = Math.round((2500 + rnd() * 2500) / 10) * 10
    const ivaC = Math.round(baseC * 0.21 * 100) / 100
    asiento++
    const fc = new Date(yy, mm, 8)
    add('6000000000', fc, `FR-DEMO-${idx}`, null, 'Compra mercaderías (demo)', baseC, 0, '4000000001')
    add('4720000000', fc, `FR-DEMO-${idx}`, null, 'IVA soportado (demo)', ivaC, 0, '4000000001')
    add('4000000001', fc, `FR-DEMO-${idx}`, new Date(yy, mm, 28), 'Proveedor demo', 0, baseC + ivaC, '6000000000')
    if (!esUltimo) {
      asiento++
      add('4000000001', new Date(yy, mm, 27), `PAG-FR-${idx}`, null, 'Pago proveedor', baseC + ivaC, 0, '5720000000')
      add('5720000000', new Date(yy, mm, 27), `PAG-FR-${idx}`, null, 'Pago proveedor', 0, baseC + ivaC, '4000000001')
    }

    // Alquiler + software (servicios)
    for (const [concepto, imp] of [['Alquiler oficina (demo)', 750], ['Software y SaaS (demo)', 280]] as [string, number][]) {
      const ivaS = Math.round(imp * 0.21 * 100) / 100
      asiento++
      const fs = new Date(yy, mm, 5)
      add('6210000000', fs, `GAS-${idx}`, null, concepto, imp, 0, '5720000000')
      add('4720000000', fs, `GAS-${idx}`, null, 'IVA soportado (demo)', ivaS, 0, '5720000000')
      add('5720000000', fs, `GAS-${idx}`, null, concepto, 0, imp + ivaS, '6210000000')
    }

    // Nóminas
    const sueldos = 7800
    const ss = Math.round(sueldos * 0.30)
    asiento++
    const fn = new Date(yy, mm, 28)
    add('6400000000', fn, `NOM-${idx}`, null, 'Sueldos y salarios (demo)', sueldos, 0, '5720000000')
    add('6420000000', fn, `NOM-${idx}`, null, 'Seguridad Social (demo)', ss, 0, '4760000000')
    add('5720000000', fn, `NOM-${idx}`, null, 'Pago nóminas (demo)', 0, sueldos, '6400000000')
    add('4760000000', fn, `NOM-${idx}`, new Date(yy, mm + 1, 28), 'SS a pagar (demo)', 0, ss, '6420000000')
  })

  // Cuota de préstamo cada mes
  meses.forEach((mes, idx) => {
    asiento++
    const fc = new Date(mes.getFullYear(), mes.getMonth(), 5)
    add('1700000000', fc, `CUO-${idx}`, null, 'Amortización préstamo (demo)', 650, 0, '5720000000')
    add('6620000000', fc, `CUO-${idx}`, null, 'Intereses (demo)', 170, 0, '5720000000')
    add('5720000000', fc, `CUO-${idx}`, null, 'Cuota préstamo (demo)', 0, 820, '1700000000')
  })

  return filas
}

// Diario demo "congelado" (se genera una vez por carga de app)
export const DIARIO_DEMO: Fila[] = generarDiarioDemo()
