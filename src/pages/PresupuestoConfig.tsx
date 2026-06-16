import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import {
  CUENTAS_INGRESOS, CUENTAS_GASTOS, TODAS_CUENTAS,
  type CuentaContable,
} from '@/lib/cuentasContables'
import { getPlan, savePlan } from '@/lib/presupuesto'

// ─── Tipos ───────────────────────────────────────────────────────────────────
type TipoPartida = 'ingreso' | 'gasto'
type Distribucion = 'lineal' | 'mensual'

interface Partida {
  id: number
  categoria: string
  cuentaCodigo: string   // ej. "705"
  cuentaNombre: string   // ej. "Prestaciones de servicios"
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
  { id:1, categoria:'Ventas directas',       cuentaCodigo:'700', cuentaNombre:'Ventas de mercaderías',             tipo:'ingreso', planAnual:840000, distribucion:'mensual', planMensual:[65000,65000,68000,70000,70200,72000,72000,68000,74000,76000,78000,80000], icono:'ti-trending-up',     color:'#4361EE' },
  { id:2, categoria:'Servicios recurrentes', cuentaCodigo:'705', cuentaNombre:'Prestaciones de servicios',         tipo:'ingreso', planAnual:96000,  distribucion:'lineal',  planMensual:[8000,8000,8000,8000,8000,8000,8000,8000,8000,8000,8000,8000],             icono:'ti-refresh',         color:'#7B93FF' },
  { id:3, categoria:'Licencias',             cuentaCodigo:'752', cuentaNombre:'Ingresos por arrendamientos',       tipo:'ingreso', planAnual:60000,  distribucion:'mensual', planMensual:[4000,4000,5000,5000,5500,5500,5500,5000,5000,5500,5500,5500],             icono:'ti-file-certificate', color:'#60A5FA' },
  { id:4, categoria:'Nóminas y SS',          cuentaCodigo:'640', cuentaNombre:'Sueldos y salarios',                tipo:'gasto',   planAnual:196800, distribucion:'lineal',  planMensual:[16400,16400,16400,16400,16400,16400,16400,16400,16400,16400,16400,16400], icono:'ti-users',            color:'#EF4444' },
  { id:5, categoria:'Alquiler oficina',      cuentaCodigo:'621', cuentaNombre:'Arrendamientos y cánones',          tipo:'gasto',   planAnual:25200,  distribucion:'lineal',  planMensual:[2100,2100,2100,2100,2100,2100,2100,2100,2100,2100,2100,2100],             icono:'ti-building',         color:'#F87171' },
  { id:6, categoria:'Marketing',             cuentaCodigo:'627', cuentaNombre:'Publicidad, propaganda y RRPP',    tipo:'gasto',   planAnual:36000,  distribucion:'lineal',  planMensual:[3000,3000,3000,3000,3000,3000,3000,3000,3000,3000,3000,3000],             icono:'ti-speakerphone',     color:'#FB923C' },
  { id:7, categoria:'Software',              cuentaCodigo:'629', cuentaNombre:'Otros servicios',                   tipo:'gasto',   planAnual:10800,  distribucion:'lineal',  planMensual:[900,900,900,900,900,900,900,900,900,900,900,900],                         icono:'ti-device-laptop',    color:'#A78BFA' },
  { id:8, categoria:'Viajes y dietas',       cuentaCodigo:'624', cuentaNombre:'Transportes',                       tipo:'gasto',   planAnual:8400,   distribucion:'mensual', planMensual:[600,600,800,800,800,800,800,600,800,800,600,400],                         icono:'ti-plane',            color:'#34D399' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n: number) {
  return new Intl.NumberFormat('es-ES', { style:'currency', currency:'EUR', maximumFractionDigits:0 }).format(n)
}

// ─── Selector de cuenta contable ─────────────────────────────────────────────
function SelectorCuenta({
  tipo, valor, onChange,
}: {
  tipo: TipoPartida
  valor: string
  onChange: (c: CuentaContable) => void
}) {
  const [busqueda, setBusqueda] = useState('')
  const [open, setOpen] = useState(false)
  const [rect, setRect] = useState<DOMRect | null>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const cuentas = tipo === 'ingreso' ? CUENTAS_INGRESOS : CUENTAS_GASTOS

  const filtradas = busqueda.length >= 1
    ? cuentas.filter(c =>
        c.codigo.includes(busqueda) ||
        c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.grupo.toLowerCase().includes(busqueda.toLowerCase())
      )
    : cuentas

  const grupos: Record<string, CuentaContable[]> = {}
  filtradas.forEach(c => {
    if (!grupos[c.grupo]) grupos[c.grupo] = []
    grupos[c.grupo].push(c)
  })

  const seleccionada = TODAS_CUENTAS.find(c => c.codigo === valor)

  function handleOpen() {
    if (btnRef.current) setRect(btnRef.current.getBoundingClientRect())
    setOpen(o => !o)
  }

  return (
    <div style={{ position:'relative' }}>
      <button ref={btnRef} type="button" onClick={handleOpen}
        style={{
          width:'100%', padding:'8px 10px', fontSize:12,
          border:'1px solid #E8E8EC', borderRadius:8,
          background:'#fff', color:'#1a1a1a', cursor:'pointer',
          fontFamily:'inherit', textAlign:'left',
          display:'flex', alignItems:'center', justifyContent:'space-between', gap:8,
        }}
      >
        <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1 }}>
          {seleccionada
            ? <><strong style={{ color:'#4361EE' }}>{seleccionada.codigo}</strong> · {seleccionada.nombre}</>
            : <span style={{ color:'#B0B7C3' }}>Seleccionar cuenta…</span>}
        </span>
        <i className={`ti ti-chevron-${open?'up':'down'}`} style={{ fontSize:12, color:'#B0B7C3', flexShrink:0 }} aria-hidden="true" />
      </button>

      {open && (
        <>
          {/* Overlay para cerrar */}
          <div onClick={() => { setOpen(false); setBusqueda('') }}
            style={{ position:'fixed', inset:0, zIndex:200 }} />
          {/* Dropdown con position fixed para escapar del overflow:hidden */}
          <div style={{
            position:'fixed',
            top: rect ? rect.bottom + 4 : 0,
            left: rect ? rect.left : 0,
            width: rect ? rect.width : 280,
            zIndex:201,
            background:'#fff', border:'1px solid #E8E8EC', borderRadius:10,
            boxShadow:'0 8px 24px rgba(0,0,0,0.12)', overflow:'hidden',
            display:'flex', flexDirection:'column',
          }}>
            <div style={{ padding:'8px 10px', borderBottom:'1px solid #F4F5F7' }}>
              <input autoFocus type="text" value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                placeholder="Buscar por código o nombre…"
                style={{ width:'100%', padding:'6px 10px', fontSize:12, border:'1px solid #E8E8EC', borderRadius:7, outline:'none', fontFamily:'inherit', boxSizing:'border-box' }}
                onFocus={e => (e.target.style.borderColor='#4361EE')}
                onBlur={e => (e.target.style.borderColor='#E8E8EC')} />
            </div>
            <div style={{ overflowY:'auto', maxHeight:260 }}>
              {Object.entries(grupos).map(([grupo, items]) => (
                <div key={grupo}>
                  <div style={{ fontSize:9, fontWeight:700, color:'#B0B7C3', textTransform:'uppercase', letterSpacing:'0.1em', padding:'8px 12px 4px' }}>{grupo}</div>
                  {items.map(c => (
                    <button key={c.codigo} type="button"
                      onClick={() => { onChange(c); setOpen(false); setBusqueda('') }}
                      style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'8px 12px', fontSize:12, border:'none', background:c.codigo===valor?'#EEF1FD':'transparent', color:'#1a1a1a', cursor:'pointer', fontFamily:'inherit', textAlign:'left' }}
                      onMouseEnter={e => { if (c.codigo!==valor) (e.currentTarget as HTMLButtonElement).style.background='#F4F5F7' }}
                      onMouseLeave={e => { if (c.codigo!==valor) (e.currentTarget as HTMLButtonElement).style.background='transparent' }}>
                      <span style={{ fontSize:11, fontWeight:700, color:'#4361EE', minWidth:32, flexShrink:0 }}>{c.codigo}</span>
                      <span style={{ color:c.codigo===valor?'#4361EE':'#1a1a1a', fontWeight:c.codigo===valor?600:400 }}>{c.nombre}</span>
                      {c.codigo===valor && <i className="ti ti-check" style={{ fontSize:12, color:'#4361EE', marginLeft:'auto' }} aria-hidden="true" />}
                    </button>
                  ))}
                </div>
              ))}
              {filtradas.length === 0 && (
                <div style={{ padding:'20px', textAlign:'center', fontSize:12, color:'#B0B7C3' }}>Sin resultados para "{busqueda}"</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function PresupuestoConfig() {
  const navigate = useNavigate()
  const [partidas, setPartidas] = useState<Partida[]>(initialPartidas)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  useEffect(() => {
    getPlan()
      .then(p => { if (p) setPartidas(p as Partida[]) })
      .catch(() => {})
      .finally(() => setCargando(false))
  }, [])
  const [expandida, setExpandida] = useState<number | null>(null)
  const [saved, setSaved] = useState(false)
  const [toastMsg, setToastMsg] = useState('')

  const emptyPartida = (): Partida => ({
    id: Date.now(), categoria: '', cuentaCodigo: '', cuentaNombre: '',
    tipo: 'gasto', planAnual: 0, distribucion: 'lineal',
    planMensual: Array(12).fill(0), icono: 'ti-receipt', color: '#EF4444',
  })
  const [adding, setAdding] = useState(false)
  const [nueva, setNueva] = useState<Partida>(emptyPartida())

  function showToast(msg: string) {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 3000)
  }

  async function handleSaveAll() {
    setGuardando(true)
    try {
      await savePlan(partidas)
      setSaved(true)
      showToast('Plan guardado correctamente')
      setTimeout(() => setSaved(false), 2000)
    } catch (e: any) {
      showToast(`No se pudo guardar: ${e?.message ?? 'error'}`)
    } finally {
      setGuardando(false)
    }
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
    setPartidas(prev => prev.map(p => p.id === id
      ? { ...p, planAnual: anual, planMensual: Array(12).fill(Math.round(anual/12)), distribucion:'lineal' } : p))
  }

  function handleAddNueva() {
    if (!nueva.categoria.trim() || !nueva.cuentaCodigo) return
    const mensual = nueva.distribucion === 'lineal'
      ? Array(12).fill(Math.round(nueva.planAnual/12))
      : nueva.planMensual
    const planAnual = nueva.distribucion === 'mensual'
      ? nueva.planMensual.reduce((a,v)=>a+v,0)
      : nueva.planAnual
    setPartidas(prev => [...prev, { ...nueva, id: Date.now(), planMensual: mensual, planAnual }])
    setNueva(emptyPartida())
    setAdding(false)
    showToast('Partida añadida')
  }

  const card: React.CSSProperties = { background:'#fff', borderRadius:14, border:'1px solid #E8E8EC' }
  const inputStyle: React.CSSProperties = { padding:'8px 10px', fontSize:12, border:'1px solid #E8E8EC', borderRadius:8, outline:'none', fontFamily:'inherit', color:'#1a1a1a', background:'#fff', width:'100%', boxSizing:'border-box' }

  const ingresos = partidas.filter(p => p.tipo === 'ingreso')
  const gastos   = partidas.filter(p => p.tipo === 'gasto')

  function SeccionPartidas({ arr, tipo }: { arr: Partida[]; tipo: TipoPartida }) {
    const colorAcc = tipo === 'ingreso' ? '#2DC653' : '#EF4444'
    return (
      <div style={{ marginBottom:8 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, padding:'12px 0 8px' }}>
          <span style={{ fontSize:13, fontWeight:700, color:'#1a1a1a' }}>{tipo==='ingreso'?'Ingresos':'Gastos'}</span>
          <span style={{ fontSize:11, color:'#B0B7C3' }}>{arr.length} partidas</span>
          <span style={{ fontSize:11, fontWeight:600, color:colorAcc }}>{fmt(arr.reduce((a,p)=>a+p.planAnual,0))} / año</span>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          {arr.map(p => (
            <div key={p.id} style={{ border:'1px solid #E8E8EC', borderRadius:12, overflow:'hidden', background:'#fff' }}>
              {/* Fila principal */}
              <div style={{ display:'grid', gridTemplateColumns:'28px 1fr 180px 120px 120px 36px', gap:10, padding:'12px 14px', alignItems:'center', cursor:'pointer' }}
                onClick={() => setExpandida(expandida===p.id?null:p.id)}>
                <i className={`ti ti-chevron-${expandida===p.id?'up':'down'}`}
                  style={{ fontSize:14, color:'#B0B7C3' }} aria-hidden="true" />
                {/* Nombre */}
                <div style={{ display:'flex', alignItems:'center', gap:8 }} onClick={e => e.stopPropagation()}>
                  <div style={{ width:24, height:24, borderRadius:6, background:`${p.color}18`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <i className={`ti ${p.icono}`} style={{ fontSize:11, color:p.color }} aria-hidden="true" />
                  </div>
                  <div>
                    <input value={p.categoria} onChange={e => updatePartida(p.id, { categoria:e.target.value })}
                      style={{ border:'none', background:'transparent', padding:0, fontSize:12, fontWeight:500, fontFamily:'inherit', color:'#1a1a1a', outline:'none', width:'100%' }}
                      onClick={e => e.stopPropagation()} />
                    {p.cuentaCodigo && (
                      <div style={{ fontSize:10, color:'#B0B7C3' }}>{p.cuentaCodigo} · {p.cuentaNombre}</div>
                    )}
                  </div>
                </div>
                {/* Cuenta contable */}
                <div onClick={e => e.stopPropagation()} style={{ fontSize:11 }}>
                  <SelectorCuenta tipo={p.tipo} valor={p.cuentaCodigo}
                    onChange={c => updatePartida(p.id, { cuentaCodigo:c.codigo, cuentaNombre:c.nombre, tipo:c.tipo })} />
                </div>
                {/* Distribución */}
                <div onClick={e => e.stopPropagation()}>
                  <select value={p.distribucion}
                    onChange={e => {
                      const d = e.target.value as Distribucion
                      updatePartida(p.id, { distribucion:d })
                      if (d==='lineal') setLineal(p.id, p.planAnual)
                    }}
                    style={{ ...inputStyle, fontSize:12 }}>
                    <option value="lineal">Lineal</option>
                    <option value="mensual">Por mes</option>
                  </select>
                </div>
                {/* Plan anual */}
                <div onClick={e => e.stopPropagation()}>
                  {p.distribucion==='lineal' ? (
                    <input type="number" value={p.planAnual||''}
                      onChange={e => setLineal(p.id, parseFloat(e.target.value)||0)}
                      style={{ ...inputStyle, textAlign:'right', fontSize:12 }} placeholder="0" />
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
              {expandida===p.id && (
                <div style={{ borderTop:'1px solid #F4F5F7', padding:'16px', background:'#FAFAFA' }}>
                  <div style={{ fontSize:11, fontWeight:600, color:'#B0B7C3', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:12 }}>
                    Distribución mensual · {p.distribucion==='lineal'?'Reparto lineal':'Personalizada'}
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:8 }}>
                    {MESES.map((mes, i) => (
                      <div key={i}>
                        <div style={{ fontSize:10, fontWeight:600, color:'#B0B7C3', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.08em' }}>{mes}</div>
                        <input type="number" value={p.planMensual[i]||''}
                          onChange={e => {
                            updateMes(p.id, i, e.target.value)
                            if (p.distribucion==='lineal') updatePartida(p.id, { distribucion:'mensual' })
                          }}
                          placeholder="0"
                          style={{ ...inputStyle, textAlign:'right', fontSize:12, padding:'6px 8px' }} />
                      </div>
                    ))}
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', marginTop:10, paddingTop:10, borderTop:'1px solid #ECEEF3' }}>
                    <span style={{ fontSize:11, color:'#888' }}>Media mensual: {fmt(Math.round(p.planAnual/12))}</span>
                    <span style={{ fontSize:12, fontWeight:600, color:'#4361EE' }}>Total anual: {fmt(p.planMensual.reduce((a,v)=>a+v,0))}</span>
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
      <style>{`input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none}input[type=number]{-moz-appearance:textfield}`}</style>

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
          <div style={{ fontSize:12, color:'#888' }}>Gestiona partidas, cuentas contables e importes anuales</div>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
          <button onClick={() => { setAdding(true); setNueva(emptyPartida()) }}
            style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'8px 14px', fontSize:12, fontWeight:500, border:'1px solid #E8E8EC', borderRadius:8, background:'#fff', color:'#1a1a1a', cursor:'pointer', fontFamily:'inherit' }}>
            <i className="ti ti-plus" style={{ fontSize:13 }} aria-hidden="true" />
            Nueva partida
          </button>
          <button onClick={handleSaveAll} disabled={guardando || cargando}
            style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'8px 16px', fontSize:12, fontWeight:600, border:'none', borderRadius:8, background:saved?'#2DC653':(guardando||cargando)?'#C8CFDA':'#4361EE', color:'#fff', cursor:(guardando||cargando)?'not-allowed':'pointer', fontFamily:'inherit' }}>
            <i className={`ti ${saved?'ti-check':guardando?'ti-loader-2':'ti-device-floppy'}`} style={{ fontSize:13 }} aria-hidden="true" />
            {cargando ? 'Cargando…' : guardando ? 'Guardando…' : saved ? 'Guardado' : 'Guardar cambios'}
          </button>
        </div>
      </div>

      {/* ── Header columnas ── */}
      <div style={{ display:'grid', gridTemplateColumns:'28px 1fr 180px 120px 120px 36px', gap:10, padding:'0 14px', fontSize:9, fontWeight:700, color:'#B0B7C3', textTransform:'uppercase', letterSpacing:'0.1em' }}>
        <span />
        <span>Categoría · Cuenta contable</span>
        <span>Cuenta PGC</span>
        <span>Distribución</span>
        <span style={{ textAlign:'right' }}>Plan anual</span>
        <span />
      </div>

      {/* ── Partidas ── */}
      <div style={card}>
        <div style={{ padding:'4px 14px' }}>
          <SeccionPartidas arr={ingresos} tipo="ingreso" />
          <div style={{ height:'1px', background:'#ECEEF3', margin:'8px 0' }} />
          <SeccionPartidas arr={gastos} tipo="gasto" />
        </div>
      </div>

      {/* ── Nueva partida inline ── */}
      {adding && (
        <div style={{ ...card, padding:'18px', border:'2px solid #4361EE' }}>
          <div style={{ fontSize:12, fontWeight:600, color:'#4361EE', marginBottom:14 }}>Nueva partida</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 120px', gap:12, marginBottom:12 }}>
            <div>
              <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#B0B7C3', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>Nombre de la partida</label>
              <input value={nueva.categoria} onChange={e => setNueva(p=>({...p,categoria:e.target.value}))}
                placeholder="ej. Ventas online" style={{ ...inputStyle, fontSize:13 }} />
            </div>
            <div>
              <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#B0B7C3', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>Tipo</label>
              <select value={nueva.tipo} onChange={e => setNueva(p=>({...p,tipo:e.target.value as TipoPartida,cuentaCodigo:'',cuentaNombre:''}))}
                style={{ ...inputStyle, fontSize:13 }}>
                <option value="ingreso">Ingreso</option>
                <option value="gasto">Gasto</option>
              </select>
            </div>
          </div>

          {/* Cuenta contable */}
          <div style={{ marginBottom:12 }}>
            <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#B0B7C3', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>
              Cuenta contable PGC
              {!nueva.cuentaCodigo && <span style={{ color:'#EF4444', marginLeft:4 }}>*</span>}
            </label>
            <SelectorCuenta tipo={nueva.tipo} valor={nueva.cuentaCodigo}
              onChange={c => setNueva(p=>({...p,cuentaCodigo:c.codigo,cuentaNombre:c.nombre,tipo:c.tipo}))} />
            <div style={{ fontSize:11, color:'#B0B7C3', marginTop:4 }}>
              Se usa para comparar esta partida con lo real de tu libro mayor.
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
            <div>
              <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#B0B7C3', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>Distribución</label>
              <select value={nueva.distribucion} onChange={e => setNueva(p=>({...p,distribucion:e.target.value as Distribucion}))}
                style={inputStyle}>
                <option value="lineal">Lineal — igual todos los meses</option>
                <option value="mensual">Por mes — personalizada</option>
              </select>
            </div>
            {nueva.distribucion==='lineal' && (
              <div>
                <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#B0B7C3', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>Plan anual (€)</label>
                <input type="number" value={nueva.planAnual||''} onChange={e => setNueva(p=>({...p,planAnual:parseFloat(e.target.value)||0}))}
                  placeholder="0" style={{ ...inputStyle, textAlign:'right' }} />
              </div>
            )}
          </div>

          {nueva.distribucion==='mensual' && (
            <div style={{ marginBottom:14 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                <label style={{ fontSize:11, fontWeight:600, color:'#B0B7C3', textTransform:'uppercase', letterSpacing:'0.08em' }}>Importe por mes (€)</label>
                <span style={{ fontSize:12, fontWeight:600, color:'#4361EE' }}>Total: {fmt(nueva.planMensual.reduce((a,v)=>a+v,0))}</span>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:8 }}>
                {MESES.map((mes, i) => (
                  <div key={i}>
                    <div style={{ fontSize:10, fontWeight:600, color:'#B0B7C3', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.08em' }}>{mes}</div>
                    <input type="number" value={nueva.planMensual[i]||''}
                      onChange={e => {
                        const v = parseFloat(e.target.value)||0
                        setNueva(p=>({...p,planMensual:p.planMensual.map((x,j)=>j===i?v:x)}))
                      }}
                      placeholder="0" style={{ ...inputStyle, textAlign:'right', fontSize:12, padding:'6px 8px' }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display:'flex', gap:8 }}>
            <button onClick={() => setAdding(false)} style={{ padding:'8px 16px', fontSize:12, fontWeight:500, border:'1px solid #E8E8EC', borderRadius:8, background:'#F4F5F7', color:'#555', cursor:'pointer', fontFamily:'inherit' }}>Cancelar</button>
            <button onClick={handleAddNueva} disabled={!nueva.categoria.trim()||!nueva.cuentaCodigo}
              style={{ padding:'8px 16px', fontSize:12, fontWeight:600, border:'none', borderRadius:8, background:(!nueva.categoria.trim()||!nueva.cuentaCodigo)?'#C8CFDA':'#4361EE', color:'#fff', cursor:(!nueva.categoria.trim()||!nueva.cuentaCodigo)?'not-allowed':'pointer', fontFamily:'inherit' }}>
              <i className="ti ti-plus" style={{ fontSize:13, marginRight:5 }} aria-hidden="true" />
              Añadir partida
            </button>
          </div>
        </div>
      )}

      {/* ── Resumen totales ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
        {[
          { lbl:'Total ingresos', val:fmt(ingresos.reduce((a,p)=>a+p.planAnual,0)), color:'#2DC653', icon:'ti-arrow-up-right', bg:'#F0F9F4' },
          { lbl:'Total gastos',   val:fmt(gastos.reduce((a,p)=>a+p.planAnual,0)),   color:'#EF4444', icon:'ti-arrow-down-right', bg:'#FEF2F2' },
          { lbl:'Resultado neto', val:fmt(ingresos.reduce((a,p)=>a+p.planAnual,0)-gastos.reduce((a,p)=>a+p.planAnual,0)), color:'#4361EE', icon:'ti-chart-pie', bg:'#EEF1FD' },
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
