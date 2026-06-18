// src/hooks/usePeriodo.ts
import { useState } from 'react'
import { Periodo, ymsDe, labelDe } from '@/lib/periodo'

// La página pasa los meses disponibles (con datos): [{ ym, label }].
// El hook devuelve el estado + los `yms` que cubre el periodo activo y su etiqueta.
export function usePeriodo(
  meses: { ym: string; label: string }[],
  inicial: Periodo = 'anual',
) {
  const [periodo, setPeriodo] = useState<Periodo>(inicial)
  const [open, setOpen] = useState(false)
  const disponibles = meses.map(m => m.ym)

  return {
    periodo,
    setPeriodo,
    open,
    setOpen,
    yms: ymsDe(periodo, disponibles), // ym's que abarca el periodo activo
    label: labelDe(periodo, meses),
  }
}
