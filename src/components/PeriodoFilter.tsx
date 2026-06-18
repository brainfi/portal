// src/components/PeriodoFilter.tsx
import { Periodo, ymToTrimestre, labelDe } from '@/lib/periodo'

interface Props {
  value: Periodo
  open: boolean
  setOpen: (o: boolean) => void
  onChange: (p: Periodo) => void
  meses: { ym: string; label: string }[] // meses disponibles (con datos)
}

type Opcion = { key: string; label: string }
type Grupo = { titulo: string; opciones: Opcion[] }

function buildGrupos(meses: { ym: string; label: string }[]): Grupo[] {
  // Trimestres presentes en los datos, más reciente primero
  const tmap = new Map<string, string>()
  meses.forEach(m => {
    const k = ymToTrimestre(m.ym)
    const [y, q] = k.split('-T')
    tmap.set(k, `T${q} ${y}`)
  })
  const trimestres = [...tmap.entries()].map(([key, label]) => ({ key, label })).reverse()

  // Meses, más reciente primero
  const mesesOpt = [...meses].reverse().map(m => ({ key: m.ym, label: m.label }))

  const grupos: Grupo[] = []
  if (trimestres.length) grupos.push({ titulo: 'Trimestres', opciones: trimestres })
  if (mesesOpt.length)   grupos.push({ titulo: 'Meses', opciones: mesesOpt })
  grupos.push({ titulo: 'Acumulado', opciones: [{ key: 'anual', label: 'Este año' }] })
  return grupos
}

export default function PeriodoFilter({ value, open, setOpen, onChange, meses }: Props) {
  const grupos = buildGrupos(meses)

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 14px',
          fontSize: 13, fontWeight: 500, border: '1px solid #E8E8EC', borderRadius: 10,
          background: '#F4F5F7', color: '#1a1a1a', cursor: 'pointer', fontFamily: 'inherit',
        }}
      >
        {labelDe(value, meses)}
        <i className="ti ti-chevron-down" style={{ fontSize: 14, color: '#888' }} aria-hidden="true" />
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
          <div style={{
            position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 50,
            background: '#fff', border: '1px solid #E8E8EC', borderRadius: 12, padding: 6,
            minWidth: 190, maxHeight: 320, overflowY: 'auto', boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          }}>
            {grupos.map(g => (
              <div key={g.titulo}>
                <div style={{
                  fontSize: 9, fontWeight: 600, color: '#bbb', textTransform: 'uppercase',
                  letterSpacing: '0.12em', padding: '8px 10px 4px',
                }}>{g.titulo}</div>
                {g.opciones.map(op => {
                  const activo = op.key === value
                  return (
                    <button
                      key={op.key} type="button"
                      onClick={() => { onChange(op.key); setOpen(false) }}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        width: '100%', padding: '8px 12px', fontSize: 13, border: 'none',
                        borderRadius: 7, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                        background: activo ? '#EEF1FD' : 'transparent',
                        color: activo ? '#4361EE' : '#1a1a1a', fontWeight: activo ? 600 : 400,
                      }}
                    >
                      {op.label}
                      {activo && <i className="ti ti-check" style={{ fontSize: 13 }} aria-hidden="true" />}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
