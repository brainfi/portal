// ─── Catálogo de cuentas contables PGC — compatible con Holded ───────────────
// Grupos 6 (gastos) y 7 (ingresos) del Plan General Contable español

export interface CuentaContable {
  codigo: string
  nombre: string
  tipo: 'ingreso' | 'gasto'
  grupo: string
}

export const CUENTAS_INGRESOS: CuentaContable[] = [
  // Grupo 70 — Ventas
  { codigo:'700', nombre:'Ventas de mercaderías',                    tipo:'ingreso', grupo:'Ventas' },
  { codigo:'701', nombre:'Ventas de productos terminados',           tipo:'ingreso', grupo:'Ventas' },
  { codigo:'702', nombre:'Ventas de productos semiterminados',       tipo:'ingreso', grupo:'Ventas' },
  { codigo:'704', nombre:'Ventas de envases y embalajes',           tipo:'ingreso', grupo:'Ventas' },
  { codigo:'705', nombre:'Prestaciones de servicios',               tipo:'ingreso', grupo:'Ventas' },
  { codigo:'706', nombre:'Descuentos sobre ventas por pronto pago', tipo:'ingreso', grupo:'Ventas' },
  { codigo:'708', nombre:'Devoluciones de ventas',                  tipo:'ingreso', grupo:'Ventas' },
  { codigo:'709', nombre:'Rappels sobre ventas',                    tipo:'ingreso', grupo:'Ventas' },
  // Grupo 74 — Subvenciones
  { codigo:'740', nombre:'Subvenciones a la explotación',           tipo:'ingreso', grupo:'Subvenciones' },
  { codigo:'747', nombre:'Otras subvenciones, donaciones y legados',tipo:'ingreso', grupo:'Subvenciones' },
  // Grupo 75 — Otros ingresos de gestión
  { codigo:'751', nombre:'Resultados de operaciones en común',      tipo:'ingreso', grupo:'Otros ingresos' },
  { codigo:'752', nombre:'Ingresos por arrendamientos',             tipo:'ingreso', grupo:'Otros ingresos' },
  { codigo:'753', nombre:'Ingresos de propiedad industrial',        tipo:'ingreso', grupo:'Otros ingresos' },
  { codigo:'754', nombre:'Ingresos por comisiones',                 tipo:'ingreso', grupo:'Otros ingresos' },
  { codigo:'755', nombre:'Ingresos por servicios al personal',      tipo:'ingreso', grupo:'Otros ingresos' },
  { codigo:'759', nombre:'Ingresos por servicios diversos',         tipo:'ingreso', grupo:'Otros ingresos' },
  // Grupo 76 — Ingresos financieros
  { codigo:'760', nombre:'Ingresos de participaciones en capital',  tipo:'ingreso', grupo:'Financieros' },
  { codigo:'762', nombre:'Ingresos de créditos',                    tipo:'ingreso', grupo:'Financieros' },
  { codigo:'769', nombre:'Otros ingresos financieros',              tipo:'ingreso', grupo:'Financieros' },
  // Grupo 77 — Beneficios
  { codigo:'770', nombre:'Beneficios procedentes de AF',            tipo:'ingreso', grupo:'Beneficios y pérdidas' },
  { codigo:'771', nombre:'Beneficios procedentes de AC',            tipo:'ingreso', grupo:'Beneficios y pérdidas' },
  { codigo:'775', nombre:'Ingresos excepcionales',                  tipo:'ingreso', grupo:'Beneficios y pérdidas' },
]

export const CUENTAS_GASTOS: CuentaContable[] = [
  // Grupo 60 — Compras
  { codigo:'600', nombre:'Compras de mercaderías',                  tipo:'gasto', grupo:'Compras' },
  { codigo:'601', nombre:'Compras de materias primas',              tipo:'gasto', grupo:'Compras' },
  { codigo:'602', nombre:'Compras de otros aprovisionamientos',     tipo:'gasto', grupo:'Compras' },
  { codigo:'606', nombre:'Descuentos sobre compras por pronto pago',tipo:'gasto', grupo:'Compras' },
  { codigo:'607', nombre:'Trabajos realizados por otras empresas',  tipo:'gasto', grupo:'Compras' },
  { codigo:'608', nombre:'Devoluciones de compras',                 tipo:'gasto', grupo:'Compras' },
  { codigo:'609', nombre:'Rappels por compras',                     tipo:'gasto', grupo:'Compras' },
  // Grupo 62 — Servicios exteriores
  { codigo:'620', nombre:'Gastos en I+D del ejercicio',             tipo:'gasto', grupo:'Servicios exteriores' },
  { codigo:'621', nombre:'Arrendamientos y cánones',                tipo:'gasto', grupo:'Servicios exteriores' },
  { codigo:'622', nombre:'Reparaciones y conservación',             tipo:'gasto', grupo:'Servicios exteriores' },
  { codigo:'623', nombre:'Servicios de profesionales independientes',tipo:'gasto', grupo:'Servicios exteriores' },
  { codigo:'624', nombre:'Transportes',                             tipo:'gasto', grupo:'Servicios exteriores' },
  { codigo:'625', nombre:'Primas de seguros',                       tipo:'gasto', grupo:'Servicios exteriores' },
  { codigo:'626', nombre:'Servicios bancarios y similares',         tipo:'gasto', grupo:'Servicios exteriores' },
  { codigo:'627', nombre:'Publicidad, propaganda y RRPP',           tipo:'gasto', grupo:'Servicios exteriores' },
  { codigo:'628', nombre:'Suministros',                             tipo:'gasto', grupo:'Servicios exteriores' },
  { codigo:'629', nombre:'Otros servicios',                         tipo:'gasto', grupo:'Servicios exteriores' },
  // Grupo 63 — Tributos
  { codigo:'630', nombre:'Impuesto sobre beneficios',               tipo:'gasto', grupo:'Tributos' },
  { codigo:'631', nombre:'Otros tributos',                          tipo:'gasto', grupo:'Tributos' },
  { codigo:'633', nombre:'Ajustes negativos en imposición indirecta',tipo:'gasto', grupo:'Tributos' },
  // Grupo 64 — Gastos de personal
  { codigo:'640', nombre:'Sueldos y salarios',                      tipo:'gasto', grupo:'Personal' },
  { codigo:'641', nombre:'Indemnizaciones',                         tipo:'gasto', grupo:'Personal' },
  { codigo:'642', nombre:'Seguridad Social a cargo de la empresa',  tipo:'gasto', grupo:'Personal' },
  { codigo:'643', nombre:'Retribuciones a largo plazo',             tipo:'gasto', grupo:'Personal' },
  { codigo:'644', nombre:'Retribuciones al personal con acciones',  tipo:'gasto', grupo:'Personal' },
  { codigo:'649', nombre:'Otros gastos sociales',                   tipo:'gasto', grupo:'Personal' },
  // Grupo 65 — Otros gastos de gestión
  { codigo:'650', nombre:'Pérdidas de créditos por insolvencias',   tipo:'gasto', grupo:'Otros gastos' },
  { codigo:'651', nombre:'Resultados de operaciones en común',      tipo:'gasto', grupo:'Otros gastos' },
  { codigo:'659', nombre:'Otras pérdidas en gestión corriente',     tipo:'gasto', grupo:'Otros gastos' },
  // Grupo 66 — Gastos financieros
  { codigo:'660', nombre:'Gastos por emisión de obligaciones',      tipo:'gasto', grupo:'Financieros' },
  { codigo:'661', nombre:'Intereses de obligaciones y bonos',       tipo:'gasto', grupo:'Financieros' },
  { codigo:'662', nombre:'Intereses de deudas',                     tipo:'gasto', grupo:'Financieros' },
  { codigo:'663', nombre:'Pérdidas por valoración de instrumentos', tipo:'gasto', grupo:'Financieros' },
  { codigo:'664', nombre:'Gastos por dividendos de acciones',       tipo:'gasto', grupo:'Financieros' },
  { codigo:'665', nombre:'Descuentos sobre ventas por pronto pago', tipo:'gasto', grupo:'Financieros' },
  { codigo:'669', nombre:'Otros gastos financieros',                tipo:'gasto', grupo:'Financieros' },
  // Grupo 67 — Pérdidas procedentes de AF y gastos excepcionales
  { codigo:'670', nombre:'Pérdidas procedentes de AF',              tipo:'gasto', grupo:'Pérdidas' },
  { codigo:'671', nombre:'Pérdidas procedentes de AC',              tipo:'gasto', grupo:'Pérdidas' },
  { codigo:'678', nombre:'Gastos excepcionales',                    tipo:'gasto', grupo:'Pérdidas' },
  // Grupo 68 — Dotaciones para amortizaciones
  { codigo:'680', nombre:'Amortización del inmovilizado intangible',tipo:'gasto', grupo:'Amortizaciones' },
  { codigo:'681', nombre:'Amortización del inmovilizado material',  tipo:'gasto', grupo:'Amortizaciones' },
  { codigo:'682', nombre:'Amortización de las inversiones inmobiliarias',tipo:'gasto', grupo:'Amortizaciones' },
]

export const TODAS_CUENTAS = [...CUENTAS_INGRESOS, ...CUENTAS_GASTOS]

// Helper para buscar cuenta por código
export function getCuenta(codigo: string): CuentaContable | undefined {
  return TODAS_CUENTAS.find(c => c.codigo === codigo)
}

// Helper para obtener grupos únicos por tipo
export function getGrupos(tipo: 'ingreso' | 'gasto'): string[] {
  const cuentas = tipo === 'ingreso' ? CUENTAS_INGRESOS : CUENTAS_GASTOS
  return [...new Set(cuentas.map(c => c.grupo))]
}
