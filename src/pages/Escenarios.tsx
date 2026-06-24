import Layout from '@/components/Layout'
import { useState } from 'react'
import { useScenarios, type Escenario } from '@/contexts/ScenariosContext'

const MESES = ['Mes 1', 'Mes 2', 'Mes 3', 'Mes 4', 'Mes 5', 'Mes 6', 'Mes 7', 'Mes 8', 'Mes 9', 'Mes 10', 'Mes 11', 'Mes 12']

const card: React.CSSProperties = { background: '#fff', borderRadius: 16, border: '1px solid #E8E8EC' }
const sectionLbl: React.CSSProperties = { fontSize: 9, fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: '0.12em' }
const lbl: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 600, color: '#555', marginBottom: 6 }
const inputBase: React.CSSProperties = { width: '100%', padding: '9px 11px', fontSize: 13, border: '1px solid #E8E8EC', borderRadius: 9, outline: 'none', background: '#fff', color: '#1a1a1a', fontFamily: 'Inter, sans-serif' }

function fmt(n: number) {
  return Math.abs(n).toLocaleString('es-ES') + ' €'
}

interface FormState {
  nombre: string
  descripcion: string
  tipo: 'ingreso' | 'gasto'
  signo: 'mas' | 'menos'
  importe: string
  recurrencia: 'puntual' | 'mensual'
  mesInicio: number
  duracionMeses: string
}

const FORM_VACIO: FormState = {
  nombre: '', descripcion: '', tipo: 'ingreso', signo: 'mas', importe: '',
  recurrencia: 'mensual', mesInicio: 0, duracionMeses: '',
}

export default function Escenarios() {
  const { escenarios, add, update, remove, toggle } = useScenarios()
  const [form, setForm] = useState<FormState>(FORM_VACIO)
  const [editando, setEditando] = useState<string | null>(null)
  const [error, setError] = useState('')

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm(f => ({ ...f, [k]: v }))

  const resetForm = () => { setForm(FORM_VACIO); setEditando(null); setError('') }

  const empezarEdicion = (e: Escenario) => {
    setEditando(e.id)
    setError('')
    setForm({
      nombre: e.nombre,
      descripcion: e.descripcion ?? '',
      tipo: e.tipo,
      signo: e.importe < 0 ? 'menos' : 'mas',
      importe: String(Math.abs(e.importe)),
      recurrencia: e.recurrencia,
      mesInicio: e.mesInicio,
      duracionMeses: e.duracionMeses != null ? String(e.duracionMeses) : '',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const guardar = () => {
    const importeNum = parseFloat(form.importe.replace(',', '.'))
    if (!form.nombre.trim()) { setError('Ponle un nombre al escenario.'); return }
    if (isNaN(importeNum) || importeNum <= 0) { setError('Indica un importe válido (mayor que 0).'); return }

    const importeFinal = form.signo === 'menos' ? -Math.abs(importeNum) : Math.abs(importeNum)
    const dur = form.recurrencia === 'mensual' && form.duracionMeses.trim() !== ''
      ? Math.max(1, parseInt(form.duracionMeses, 10))
      : undefined

    const payload: Omit<Escenario, 'id'> = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim() || undefined,
      tipo: form.tipo,
      importe: importeFinal,
      recurrencia: form.recurrencia,
      mesInicio: form.mesInicio,
      duracionMeses: dur,
      activo: true,
    }

    if (editando) update(editando, payload)
    else add(payload)
    resetForm()
  }

  // Color del importe según efecto neto: lo que sube caja en verde, lo que la baja en rojo.
  function colorImporte(e: Escenario) {
    const sube = e.tipo === 'ingreso' ? e.importe >= 0 : e.importe < 0
    return sube ? '#2DC653' : '#EF4444'
  }
  function textoImporte(e: Escenario) {
    const signo = (e.tipo === 'ingreso' ? e.importe >= 0 : e.importe < 0) ? '+' : '−'
    return `${signo}${fmt(e.importe)}`
  }

  return (
    <Layout title="Escenarios">
      <style>{`
        @media (max-width: 768px) {
          .esc-form-grid { grid-template-columns: 1fr !important; }
          .esc-hide { display: none !important; }
          .esc-tbl-hdr, .esc-tbl-row { grid-template-columns: 1.4fr 1fr 70px !important; }
        }
      `}</style>

      {/* FORMULARIO */}
      <div style={{ ...card, padding: '22px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div>
            <div style={{ ...sectionLbl, marginBottom: 4 }}>{editando ? 'Editar escenario' : 'Nuevo escenario'}</div>
            <div style={{ fontSize: 12, color: '#aaa' }}>Su impacto se refleja automáticamente en Previsiones</div>
          </div>
          {editando && (
            <button onClick={resetForm} style={{ fontSize: 12, fontWeight: 500, color: '#888', background: '#F4F5F7', border: '1px solid #E8E8EC', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Cancelar edición</button>
          )}
        </div>

        <div className="esc-form-grid" style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div>
            <label style={lbl}>Nombre</label>
            <input value={form.nombre} onChange={e => set('nombre', e.target.value)} placeholder="Ej. Nueva cuenta · cliente X" style={inputBase}
              onFocus={e => e.target.style.borderColor = '#4361EE'} onBlur={e => e.target.style.borderColor = '#E8E8EC'} />
          </div>
          <div>
            <label style={lbl}>Tipo</label>
            <select value={form.tipo} onChange={e => set('tipo', e.target.value as FormState['tipo'])} style={{ ...inputBase, appearance: 'auto' }}>
              <option value="ingreso">Ingreso</option>
              <option value="gasto">Gasto</option>
            </select>
          </div>
          <div>
            <label style={lbl}>Efecto</label>
            <select value={form.signo} onChange={e => set('signo', e.target.value as FormState['signo'])} style={{ ...inputBase, appearance: 'auto' }}>
              <option value="mas">Aumenta (+)</option>
              <option value="menos">Reduce (−)</option>
            </select>
          </div>
        </div>

        <div className="esc-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div>
            <label style={lbl}>Importe (€)</label>
            <input value={form.importe} onChange={e => set('importe', e.target.value)} placeholder="0" inputMode="decimal" style={inputBase}
              onFocus={e => e.target.style.borderColor = '#4361EE'} onBlur={e => e.target.style.borderColor = '#E8E8EC'} />
          </div>
          <div>
            <label style={lbl}>Recurrencia</label>
            <select value={form.recurrencia} onChange={e => set('recurrencia', e.target.value as FormState['recurrencia'])} style={{ ...inputBase, appearance: 'auto' }}>
              <option value="mensual">Mensual</option>
              <option value="puntual">Puntual</option>
            </select>
          </div>
          <div>
            <label style={lbl}>Empieza en</label>
            <select value={form.mesInicio} onChange={e => set('mesInicio', parseInt(e.target.value, 10))} style={{ ...inputBase, appearance: 'auto' }}>
              {MESES.map((m, i) => <option key={i} value={i}>{m}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Duración {form.recurrencia === 'puntual' && <span style={{ color: '#ccc' }}>· n/a</span>}</label>
            <input value={form.duracionMeses} onChange={e => set('duracionMeses', e.target.value)} placeholder="Hasta el final" inputMode="numeric"
              disabled={form.recurrencia === 'puntual'}
              style={{ ...inputBase, background: form.recurrencia === 'puntual' ? '#F4F5F7' : '#fff', color: form.recurrencia === 'puntual' ? '#ccc' : '#1a1a1a', cursor: form.recurrencia === 'puntual' ? 'not-allowed' : 'text' }}
              onFocus={e => { if (form.recurrencia !== 'puntual') e.target.style.borderColor = '#4361EE' }} onBlur={e => e.target.style.borderColor = '#E8E8EC'} />
          </div>
        </div>

        <div>
          <label style={lbl}>Descripción <span style={{ color: '#ccc', fontWeight: 400 }}>· opcional</span></label>
          <input value={form.descripcion} onChange={e => set('descripcion', e.target.value)} placeholder="Una nota para recordar de qué va" style={inputBase}
            onFocus={e => e.target.style.borderColor = '#4361EE'} onBlur={e => e.target.style.borderColor = '#E8E8EC'} />
        </div>

        {error && (
          <div style={{ marginTop: 14, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '9px 12px', fontSize: 12, color: '#DC2626' }}>{error}</div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
          <button onClick={guardar} style={{ padding: '10px 20px', fontSize: 13, fontWeight: 600, color: '#fff', background: '#4361EE', border: 'none', borderRadius: 9, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
            {editando ? 'Guardar cambios' : 'Añadir escenario'}
          </button>
        </div>
      </div>

      {/* TABLA */}
      <div style={{ ...card, padding: '22px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a' }}>Tus escenarios</div>
            <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
              {escenarios.filter(e => e.activo).length} activos de {escenarios.length}
            </div>
          </div>
        </div>

        {escenarios.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', fontSize: 13, color: '#B0B7C3' }}>
            Aún no hay escenarios. Crea el primero con el formulario de arriba.
          </div>
        ) : (
          <>
            <div className="esc-tbl-hdr" style={{ display: 'grid', gridTemplateColumns: '1.6fr 0.9fr 1fr 1fr 0.8fr 90px', fontSize: 10, color: '#B0B7C3', fontWeight: 600, paddingBottom: 10, borderBottom: '1px solid #ECEEF3' }}>
              <span>Escenario</span>
              <span className="esc-hide">Tipo</span>
              <span style={{ textAlign: 'right', paddingRight: 14 }}>Importe</span>
              <span className="esc-hide">Cuándo</span>
              <span className="esc-hide" style={{ textAlign: 'center' }}>Activo</span>
              <span style={{ textAlign: 'right' }}>Acciones</span>
            </div>

            {escenarios.map((e, i) => (
              <div key={e.id} className="esc-tbl-row" style={{ display: 'grid', gridTemplateColumns: '1.6fr 0.9fr 1fr 1fr 0.8fr 90px', alignItems: 'center', padding: '12px 0', borderBottom: i < escenarios.length - 1 ? '1px solid #F4F5F7' : 'none', opacity: e.activo ? 1 : 0.55 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#1a1a1a' }}>{e.nombre}</div>
                  {e.descripcion && <div style={{ fontSize: 11, color: '#B0B7C3', marginTop: 1 }}>{e.descripcion}</div>}
                </div>
                <span className="esc-hide" style={{ fontSize: 11 }}>
                  <span style={{ background: e.tipo === 'ingreso' ? '#EAFAF0' : '#FFF3E0', color: e.tipo === 'ingreso' ? '#1a7a3a' : '#92400E', padding: '3px 9px', borderRadius: 99, fontWeight: 600 }}>
                    {e.tipo === 'ingreso' ? 'Ingreso' : 'Gasto'}
                  </span>
                </span>
                <span style={{ fontSize: 13, fontWeight: 600, color: colorImporte(e), textAlign: 'right', paddingRight: 14 }}>{textoImporte(e)}</span>
                <span className="esc-hide" style={{ fontSize: 11, color: '#888' }}>
                  {e.recurrencia === 'mensual' ? 'Mensual' : 'Puntual'} · {MESES[e.mesInicio] ?? `Mes ${e.mesInicio + 1}`}
                  {e.recurrencia === 'mensual' && e.duracionMeses ? ` (${e.duracionMeses}m)` : ''}
                </span>
                <span className="esc-hide" style={{ display: 'flex', justifyContent: 'center' }}>
                  <div onClick={() => toggle(e.id)} style={{ width: 36, height: 20, background: e.activo ? '#4361EE' : '#E8E8EC', borderRadius: 99, position: 'relative', cursor: 'pointer', flexShrink: 0, transition: 'background .15s' }}>
                    <div style={{ position: 'absolute', width: 14, height: 14, background: '#fff', borderRadius: '50%', top: 3, left: e.activo ? 19 : 3, transition: 'left .15s' }} />
                  </div>
                </span>
                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                  <button onClick={() => empezarEdicion(e)} title="Editar" style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #E8E8EC', borderRadius: 8, background: '#fff', cursor: 'pointer', color: '#888' }}>
                    <i className="ti ti-pencil" aria-hidden="true" style={{ fontSize: 14 }} />
                  </button>
                  <button onClick={() => remove(e.id)} title="Eliminar" style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #FECACA', borderRadius: 8, background: '#FEF2F2', cursor: 'pointer', color: '#EF4444' }}>
                    <i className="ti ti-trash" aria-hidden="true" style={{ fontSize: 14 }} />
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </Layout>
  )
}
