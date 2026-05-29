import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '@/components/Layout'

// ─── Tipos ───────────────────────────────────────────────────────────────────
type TipoPartida = 'ingreso' | 'gasto'
type Distribucion = 'lineal' | 'mensual'

interface Partida {
  id: number
  categoria: string
  tipo: TipoPartida
  planAnual: number
  planMensual: number[]
  distribucion: Distribucion
  icono: string
  color: string
}

// ─── Constantes ───────────────────────────────────────────────────────────────
const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

const initialPartidas: Partida[] = [
  { id:1, categoria:'Ventas directas',       tipo:'ingreso', planAnual:840000, distribucion:'mensual', planMensual:[65000,65000,68000,70000,70200,72000,72000,68000,74000,76000,78000,80000], icono:'ti-trending-up',      color:'#4361EE' },
  { id:2, categoria:'Servicios recurrentes', tipo:'ingreso', planAnual:96000,  distribucion:'lineal',  planMensual:[8000,8000,8000,8000,8000,8000,8000,8000,8000,8000,8000,8000],             icono:'ti-refresh',          color:'#7B93FF' },
  { id:3, categoria:'Licencias',             tipo:'ingreso', planAnual:60000,  distribucion:'mensual', planMensual:[4000,4000,5000,5000,5500,5500,5500,5000,5000,5500,5500,5500],             icono:'ti-file-certificate',  color:'#60A5FA' },
  { id:4, categoria:'Nóminas y SS',          tipo:'gasto',   planAnual:196800, distribucion:'lineal',  planMensual:[16400,16400,16400,16400,16400,16400,16400,16400,16400,16400,16400,16400], icono:'ti-users',             color:'#EF4444' },
  { id:5, categoria:'Alquiler oficina',      tipo:'gasto',   planAnual:25200,  distribucion:'lineal',  planMensual:[2100,2100,2100,2100,2100,2100,2100,2100,2100,2100,2100,2100],             icono:'ti-building',          color:'#F87171' },
  { id:6, categoria:'Marketing',             tipo:'gasto',   planAnual:36000,  distribucion:'lineal',  planMensual:[3000,3000,3000,3000,3000,3000,3000,3000,3000,3000,3000,3000],             icono:'ti-speakerphone',      color:'#FB923C' },
  { id:7, categoria:'Software',              tipo:'gasto',   planAnual:10800,  distribucion:'lineal',  planMensual:[900,900,900,900,900,900,900,900,900,900,900,900],                         icono:'ti-device-laptop',     color:'#A78BFA' },
  { id:8, categoria:'Viajes y dietas',       tipo:'gasto',   planAnual:8400,   distribucion:'mensual', planMensual:[600,600,800,800,800,800,800,600,800,800,600,400],                         icono:'ti-plane',             color:'#34D399' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n: number) {
  return new Intl.NumberFormat('es-ES', { style:'currency', currency:'EUR', maximumFractionDigits:0 }).format(n)
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function PresupuestoConfig() {
  const navigate = useNavigate()
  const [partidas, setPartidas] = useState<Partida[]>(initialPartidas)
  const [expandida, setExpandida] = useState<number | null>(null)
  const [saved, setSaved] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const csvRef = useRef<HTMLInputElement>(null)

  // ── Nueva partida inline ──
  const emptyPartida = (): Partida => ({
    id: Date.now(), categoria: '', tipo: 'gasto', planAnual: 0,
    distribucion: 'lineal', planMensual: Array(12).fill(0),
    icono: 'ti-receipt', color: '#EF4444',
  })
  const [adding, setAdding] = useState(false)
  const [nueva, setNueva] = useState<Partida>(emptyPartida())

  function showToast(msg: string) {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 3000)
  }

  function handleSaveAll() {
    setSaved(true)
    showToast('Cambios guardados correctamente')
    setTimeout(() => setSaved(false), 2000)
  }

  function handleDelete(id: number) {
    setPartidas(prev => prev.filter(p => p.id !== id))
    if (expandida === id) setExpandida(null)
  }

  function updatePartida(id: number, changes: Partial<Partida>) {
    setPartidas(prev => prev.map(p => p.id === id ? { ...p, ...changes } : p))
  }

  function updateMes(id: number, mes: number, valor: string) {
    const n = parseFloat(valor) || 0
    setPartidas(prev => prev.map(p => {
      if (p.id !== id) return p
      const nm = p.planMensual.map((v, i) => i === mes ? n : v)
      return { ...p, planMensual: nm, planAnual: nm.reduce((a,v)=>a+v,0) }
    }))
  }

  function setLineal(id: number, anual: number) {
    const mensual = Math.round(anual / 12)
    setPartidas(prev => prev.map(p => p.id === id
      ? { ...p, planAnual: anual, planMensual: Array(12).fill(mensual), distribucion: 'lineal' } : p))
  }

  function handleAddNueva() {
    if (!nueva.categoria.trim()) return
    const mensual = nueva.distribucion === 'lineal'
      ? Array(12).fill(Math.round(nueva.planAnual / 12))
      : nueva.planMensual
    const planAnual = nueva.distribucion === 'mensual'
      ? nueva.planMensual.reduce((a,v)=>a+v,0)
      : nueva.planAnual
    setPartidas(prev => [...prev, { ...nueva, id: Date.now(), planMensual: mensual, planAnual }])
    setNueva(emptyPartida())
    setAdding(false)
    showToast('Partida añadida')
  }

  // ── Import CSV ──
  function handleCSV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const lines = (ev.target?.result as string).split('\n').filter(Boolean)
      const imported: Partida[] = []
      lines.slice(1).forEach(line => {
        const cols = line.split(',').map(c => c.trim().replace(/"/g,''))
        if (cols.length < 3) return
        const [categoria, tipo, anual] = cols
        const planAnual = parseFloat(anual) || 0
        imported.push({
          id: Date.now() + Math.random(),
          categoria, tipo: tipo === 'ingreso' ? 'ingreso' : 'gasto',
          planAnual, distribucion: 'lineal',
          planMensual: Array(12).fill(Math.round(planAnual / 12)),
          icono: tipo === 'ingreso' ? 'ti-trending-up' : 'ti-receipt',
          color: tipo === 'ingreso' ? '#4361EE' : '#EF4444',
        })
      })
      setPartidas(prev => [...prev, ...imported])
      showToast(`${imported.length} partidas importadas desde CSV`)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const card: React.CSSProperties = { background:'#fff', borderRadius:14, border:'1px solid #E8E8EC' }
  const inputStyle: React.CSSProperties = { padding:'8px 10px', fontSize:13, border:'1px solid #E8E8EC', borderRadius:8, outline:'none', fontFamily:'inherit', color:'#1a1a1a', background:'#fff', width:'100%', boxSizing:'border-box' }

  const ingresos = partidas.filter(p => p.tipo === 'ingreso')
  const gastos   = partidas.filter(p => p.tipo === 'gasto')

  function SeccionPartidas({ arr, tipo }: { arr: Partida[]; tipo: TipoPartida }) {
    const colorAcc = tipo === 'ingreso' ? '#2DC653' : '#EF4444'
    return (
      <div style={{ marginBottom:8 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, padding:'12px 0 8px' }}>
          <span style={{ fontSize:13, fontWeight:700, color:'#1a1a1a' }}>{tipo === 'ingreso' ? 'Ingresos' : 'Gastos'}</span>
          <span style={{ fontSize:11, color:'#B0B7C3' }}>{arr.length} partidas</span>
          <span style={{ fontSize:11, fontWeight:600, color:colorAcc }}>
            {fmt(arr.reduce((a,p)=>a+p.planAnual,0))} / año
          </span>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          {arr.map(p => (
            <div key={p.id} style={{ border:'1px solid #E8E8EC', borderRadius:12, overflow:'hidden', background:'#fff' }}>
              {/* Fila principal */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 140px 130px 130px 36px', gap:12, padding:'12px 16px', alignItems:'center' }}
                onClick={() => setExpandida(expandida === p.id ? null : p.id)}
                style2={{ cursor:'pointer' }}>
                {/* Nombre editable */}
                <div style={{ display:'flex', alignItems:'center', gap:10 }} onClick={e => e.stopPropagation()}>
                  <i className={`ti ti-chevron-${expandida===p.id?'up':'down'}`}
                    style={{ fontSize:14, color:'#B0B7C3', cursor:'pointer', flexShrink:0 }}
                    onClick={() => setExpandida(expandida===p.id?null:p.id)}
                    aria-hidden="true" />
                  <div style={{ width:26, height:26, borderRadius:6, background:`${p.color}18`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <i className={`ti ${p.icono}`} style={{ fontSize:12, color:p.color }} aria-hidden="true" />
                  </div>
                  <input value={p.categoria} onChange={e => updatePartida(p.id, { categoria: e.target.value })}
                    style={{ ...inputStyle, border:'none', background:'transparent', padding:'4px 0', fontSize:13, fontWeight:500 }}
                    onClick={e => e.stopPropagation()} />
                </div>
                {/* Tipo */}
                <div onClick={e => e.stopPropagation()}>
                  <select value={p.tipo} onChange={e => updatePartida(p.id, { tipo: e.target.value as TipoPartida })}
                    style={{ ...inputStyle, fontSize:12 }}>
                    <option value="ingreso">Ingreso</option>
                    <option value="gasto">Gasto</option>
                  </select>
                </div>
                {/* Distribución */}
                <div onClick={e => e.stopPropagation()}>
                  <select value={p.distribucion}
                    onChange={e => {
                      const d = e.target.value as Distribucion
                      updatePartida(p.id, { distribucion: d })
                      if (d === 'lineal') setLineal(p.id, p.planAnual)
                    }}
                    style={{ ...inputStyle, fontSize:12 }}>
                    <option value="lineal">Lineal</option>
                    <option value="mensual">Por mes</option>
                  </select>
                </div>
                {/* Plan anual */}
                <div onClick={e => e.stopPropagation()}>
                  {p.distribucion === 'lineal' ? (
                    <input type="number" value={p.planAnual || ''}
                      onChange={e => setLineal(p.id, parseFloat(e.target.value)||0)}
                      style={{ ...inputStyle, textAlign:'right', fontSize:12 }}
                      placeholder="0" />
                  ) : (
                    <div style={{ textAlign:'right', fontSize:12, fontWeight:600, color:'#4361EE', padding:'8px 10px', background:'#EEF1FD', borderRadius:8 }}>
                      {fmt(p.planAnual)}
                    </div>
                  )}
                </div>
                {/* Eliminar */}
                <button onClick={e => { e.stopPropagation(); handleDelete(p.id) }}
                  style={{ border:'none', background:'transparent', cursor:'pointer', color:'#D0D3DE', fontSize:14, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:6, padding:4 }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color='#EF4444'; (e.currentTarget as HTMLButtonElement).style.background='#FEF2F2' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color='#D0D3DE'; (e.currentTarget as HTMLButtonElement).style.background='transparent' }}>
                  <i className="ti ti-trash" aria-hidden="true" />
                </button>
              </div>

              {/* Panel expandido — distribución mensual */}
              {expandida === p.id && (
                <div style={{ borderTop:'1px solid #F4F5F7', padding:'16px', background:'#FAFAFA' }}>
                  <div style={{ fontSize:11, fontWeight:600, color:'#B0B7C3', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:12 }}>
                    Distribución mensual · {p.distribucion === 'lineal' ? 'Reparto lineal (edita para personalizar)' : 'Personalizada'}
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:8 }}>
                    {MESES.map((mes, i) => (
                      <div key={i}>
                        <div style={{ fontSize:10, fontWeight:600, color:'#B0B7C3', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.08em' }}>{mes}</div>
                        <input
                          type="number"
                          value={p.planMensual[i] || ''}
                          onChange={e => {
                            updateMes(p.id, i, e.target.value)
                            if (p.distribucion === 'lineal') updatePartida(p.id, { distribucion: 'mensual' })
                          }}
                          placeholder="0"
                          style={{ ...inputStyle, textAlign:'right', fontSize:12, padding:'6px 8px' }}
                        />
                      </div>
                    ))}
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', marginTop:10, paddingTop:10, borderTop:'1px solid #ECEEF3' }}>
                    <span style={{ fontSize:11, color:'#888' }}>
                      Mensual medio: {fmt(Math.round(p.planAnual/12))}
                    </span>
                    <span style={{ fontSize:12, fontWeight:600, color:'#4361EE' }}>
                      Total anual: {fmt(p.planMensual.reduce((a,v)=>a+v,0))}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <Layout title="Configurar presupuesto">
      <style>{`
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        input[type=number] { -moz-appearance: textfield; }
      `}</style>

      {/* ── Encabezado ── */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
            <button onClick={() => navigate('/presupuesto')}
              style={{ border:'none', background:'transparent', cursor:'pointer', color:'#B0B7C3', fontSize:13, display:'flex', alignItems:'center', gap:4, padding:0, fontFamily:'inherit' }}>
              <i className="ti ti-arrow-left" style={{ fontSize:14 }} aria-hidden="true" />
              Presupuesto
            </button>
            <span style={{ color:'#E8E8EC' }}>/</span>
            <span style={{ fontSize:13, color:'#1a1a1a', fontWeight:500 }}>Configurar</span>
          </div>
          <div style={{ fontSize:22, fontWeight:700, color:'#1a1a1a', letterSpacing:'-0.4px', marginBottom:3 }}>Configurar presupuesto</div>
          <div style={{ fontSize:12, color:'#888' }}>Gestiona las partidas, importes y distribución mensual</div>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
          {/* Import CSV */}
          <input ref={csvRef} type="file" accept=".csv" onChange={handleCSV} style={{ display:'none' }} />
          <button onClick={() => csvRef.current?.click()}
            style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'8px 14px', fontSize:12, fontWeight:500, border:'1px solid #E8E8EC', borderRadius:8, background:'#fff', color:'#555', cursor:'pointer', fontFamily:'inherit' }}>
            <i className="ti ti-file-import" style={{ fontSize:13 }} aria-hidden="true" />
            Importar CSV
          </button>
          {/* Import Holded — próximamente */}
          <button disabled title="Disponible cuando conectes Holded desde Integraciones"
            style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'8px 14px', fontSize:12, fontWeight:500, border:'1px solid #E8E8EC', borderRadius:8, background:'#F4F5F7', color:'#B0B7C3', cursor:'not-allowed', fontFamily:'inherit' }}>
            <i className="ti ti-plug" style={{ fontSize:13 }} aria-hidden="true" />
            Importar Holded
            <span style={{ fontSize:9, fontWeight:700, padding:'1px 5px', borderRadius:4, background:'#EEF1FD', color:'#4361EE' }}>PRONTO</span>
          </button>
          {/* Añadir partida */}
          <button onClick={() => { setAdding(true); setNueva(emptyPartida()) }}
            style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'8px 14px', fontSize:12, fontWeight:500, border:'1px solid #E8E8EC', borderRadius:8, background:'#fff', color:'#1a1a1a', cursor:'pointer', fontFamily:'inherit' }}>
            <i className="ti ti-plus" style={{ fontSize:13 }} aria-hidden="true" />
            Nueva partida
          </button>
          {/* Guardar */}
          <button onClick={handleSaveAll}
            style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'8px 16px', fontSize:12, fontWeight:600, border:'none', borderRadius:8, background:saved?'#2DC653':'#4361EE', color:'#fff', cursor:'pointer', fontFamily:'inherit' }}>
            <i className={`ti ${saved?'ti-check':'ti-device-floppy'}`} style={{ fontSize:13 }} aria-hidden="true" />
            {saved ? 'Guardado' : 'Guardar cambios'}
          </button>
        </div>
      </div>

      {/* ── Hint CSV ── */}
      <div style={{ background:'#EEF1FD', border:'1px solid #C7D2F8', borderRadius:10, padding:'10px 16px', display:'flex', alignItems:'center', gap:10, fontSize:12 }}>
        <i className="ti ti-info-circle" style={{ fontSize:16, color:'#4361EE', flexShrink:0 }} aria-hidden="true" />
        <span style={{ color:'#185FA5' }}>
          El CSV debe tener las columnas: <strong>categoria, tipo (ingreso/gasto), plan_anual</strong>. La primera fila se usa como cabecera.
        </span>
      </div>

      {/* ── Header columnas ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 140px 130px 130px 36px', gap:12, padding:'0 16px', fontSize:9, fontWeight:700, color:'#B0B7C3', textTransform:'uppercase', letterSpacing:'0.1em' }}>
        <span>Categoría</span>
        <span>Tipo</span>
        <span>Distribución</span>
        <span style={{ textAlign:'right' }}>Plan anual</span>
        <span />
      </div>

      {/* ── Partidas existentes ── */}
      <div style={card}>
        <div style={{ padding:'4px 16px' }}>
          <SeccionPartidas arr={ingresos} tipo="ingreso" />
          <div style={{ height:'1px', background:'#ECEEF3', margin:'8px 0' }} />
          <SeccionPartidas arr={gastos} tipo="gasto" />
        </div>
      </div>

      {/* ── Añadir nueva inline ── */}
      {adding && (
        <div style={{ ...card, padding:'16px', border:'2px solid #4361EE' }}>
          <div style={{ fontSize:12, fontWeight:600, color:'#4361EE', marginBottom:14 }}>Nueva partida</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 130px 120px 120px', gap:12, marginBottom:14 }}>
            <input value={nueva.categoria} onChange={e => setNueva(p=>({...p,categoria:e.target.value}))}
              placeholder="Nombre de la partida" style={inputStyle} />
            <select value={nueva.tipo} onChange={e => setNueva(p=>({...p,tipo:e.target.value as TipoPartida}))}
              style={inputStyle}>
              <option value="ingreso">Ingreso</option>
              <option value="gasto">Gasto</option>
            </select>
            <select value={nueva.distribucion} onChange={e => setNueva(p=>({...p,distribucion:e.target.value as Distribucion}))}
              style={inputStyle}>
              <option value="lineal">Lineal</option>
              <option value="mensual">Por mes</option>
            </select>
            {nueva.distribucion === 'lineal' ? (
              <input type="number" value={nueva.planAnual||''} onChange={e => setNueva(p=>({...p,planAnual:parseFloat(e.target.value)||0}))}
                placeholder="Plan anual €" style={{ ...inputStyle, textAlign:'right' }} />
            ) : (
              <div style={{ fontSize:12, fontWeight:600, color:'#4361EE', padding:'8px 10px', background:'#EEF1FD', borderRadius:8, textAlign:'right' }}>
                {fmt(nueva.planMensual.reduce((a,v)=>a+v,0))}
              </div>
            )}
          </div>
          {nueva.distribucion === 'mensual' && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:8, marginBottom:14 }}>
              {MESES.map((mes, i) => (
                <div key={i}>
                  <div style={{ fontSize:10, fontWeight:600, color:'#B0B7C3', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.08em' }}>{mes}</div>
                  <input type="number" value={nueva.planMensual[i]||''}
                    onChange={e => {
                      const v = parseFloat(e.target.value)||0
                      setNueva(p => ({ ...p, planMensual: p.planMensual.map((x,j)=>j===i?v:x) }))
                    }}
                    placeholder="0"
                    style={{ ...inputStyle, textAlign:'right', fontSize:12, padding:'6px 8px' }} />
                </div>
              ))}
            </div>
          )}
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={() => setAdding(false)} style={{ padding:'8px 16px', fontSize:12, fontWeight:500, border:'1px solid #E8E8EC', borderRadius:8, background:'#F4F5F7', color:'#555', cursor:'pointer', fontFamily:'inherit' }}>Cancelar</button>
            <button onClick={handleAddNueva} disabled={!nueva.categoria.trim()}
              style={{ padding:'8px 16px', fontSize:12, fontWeight:600, border:'none', borderRadius:8, background:!nueva.categoria.trim()?'#C8CFDA':'#4361EE', color:'#fff', cursor:!nueva.categoria.trim()?'not-allowed':'pointer', fontFamily:'inherit' }}>
              <i className="ti ti-plus" style={{ fontSize:13, marginRight:5 }} aria-hidden="true" />
              Añadir
            </button>
          </div>
        </div>
      )}

      {/* ── Resumen totales ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
        {[
          { lbl:'Total ingresos presupuestados', val:fmt(ingresos.reduce((a,p)=>a+p.planAnual,0)), color:'#2DC653', icon:'ti-arrow-up-right', bg:'#F0F9F4' },
          { lbl:'Total gastos presupuestados',   val:fmt(gastos.reduce((a,p)=>a+p.planAnual,0)),   color:'#EF4444', icon:'ti-arrow-down-right', bg:'#FEF2F2' },
          { lbl:'Resultado neto previsto',       val:fmt(ingresos.reduce((a,p)=>a+p.planAnual,0)-gastos.reduce((a,p)=>a+p.planAnual,0)), color:'#4361EE', icon:'ti-chart-pie', bg:'#EEF1FD' },
        ].map((k,i) => (
          <div key={i} style={{ ...card, padding:'16px 20px', display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ width:36, height:36, borderRadius:9, background:k.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <i className={`ti ${k.icon}`} style={{ fontSize:18, color:k.color }} aria-hidden="true" />
            </div>
            <div>
              <div style={{ fontSize:9, fontWeight:600, color:'#B0B7C3', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:3 }}>{k.lbl}</div>
              <div style={{ fontSize:18, fontWeight:700, color:'#1a1a1a', letterSpacing:'-0.3px' }}>{k.val}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Toast ── */}
      {toastMsg && (
        <div style={{ position:'fixed', bottom:24, right:24, zIndex:300, background:'#1a1a1a', color:'#fff', borderRadius:10, padding:'12px 18px', fontSize:13, fontWeight:500, display:'flex', alignItems:'center', gap:8, boxShadow:'0 4px 20px rgba(0,0,0,0.15)' }}>
          <i className="ti ti-check" style={{ fontSize:15, color:'#2DC653' }} aria-hidden="true" />
          {toastMsg}
        </div>
      )}
    </Layout>
  )
}
