// ─── KPICard — componente reutilizable brainfi ───────────────────────────────
// Diseño validado en la página Presupuesto.
// Uso:
//   <KPICard
//     label="Ingresos"
//     description="Total de ingresos planificados y ejecutados en el periodo."
//     value="86.100 €"
//     sub="plan 83.700 €"
//     badge={<DeltaBadge ... />}   // opcional
//     icon="ti-arrow-up-right"
//     iconBg="#F0F9F4"
//     iconColor="#2DC653"
//   />

import React from 'react'

interface KPICardProps {
  label: string
  description?: string
  value: string
  sub?: string
  badge?: React.ReactNode      // pill de desviación, estado, etc.
  icon: string                 // clase Tabler Icon, ej. "ti-arrow-up-right"
  iconBg: string               // fondo del icono, ej. "#F0F9F4"
  iconColor: string            // color del icono, ej. "#2DC653"
  onClick?: () => void
}

export function KPICard({
  label, description, value, sub, badge, icon, iconBg, iconColor, onClick,
}: KPICardProps) {
  return (
    <div
      onClick={onClick}
      style={{
        background: '#fff',
        borderRadius: 14,
        border: '1px solid #E8E8EC',
        padding: '20px 22px',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      {/* Título + descripción + icono */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
        <div style={{ flex:1, minWidth:0, paddingRight:12 }}>
          <div style={{
            fontSize: 9, fontWeight: 600, color: '#1a1a1a',
            textTransform: 'uppercase', letterSpacing: '0.12em',
          }}>
            {label}
          </div>
          {description && (
            <div style={{ fontSize: 11, color: '#B0B7C3', lineHeight: 1.5, marginTop: 2 }}>
              {description}
            </div>
          )}
        </div>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: iconBg, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <i className={`ti ${icon}`} style={{ fontSize: 16, color: iconColor }} aria-hidden="true" />
        </div>
      </div>

      {/* Valor principal */}
      <div style={{
        fontSize: 28, fontWeight: 400, color: '#1a1a1a',
        letterSpacing: '-0.5px', marginTop: 10, marginBottom: 8,
      }}>
        {value}
      </div>

      {/* Badge + subtítulo */}
      {(badge || sub) && (
        <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
          {badge}
          {sub && <span style={{ fontSize: 11, color: '#B0B7C3' }}>{sub}</span>}
        </div>
      )}
    </div>
  )
}

// ─── Tokens de color — referencia para nuevas páginas ────────────────────────
export const KPI_TOKENS = {
  azul:   { iconBg: '#EEF1FD', iconColor: '#4361EE' },
  verde:  { iconBg: '#F0F9F4', iconColor: '#2DC653' },
  rojo:   { iconBg: '#FEF2F2', iconColor: '#EF4444' },
  ambar:  { iconBg: '#FFF8E6', iconColor: '#F4A100' },
  gris:   { iconBg: '#F4F5F7', iconColor: '#B0B7C3' },
}

// ─── DeltaBadge — pill de desviación reutilizable ────────────────────────────
export function DeltaBadge({
  real, plan, tipo,
}: {
  real: number
  plan: number
  tipo: 'ingreso' | 'gasto'
}) {
  if (!plan || !real) return null
  const d = ((real - plan) / plan) * 100
  const isGood = tipo === 'ingreso' ? d >= 0 : d <= 0
  const neutral = Math.abs(d) < 3
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, padding: '2px 8px',
      borderRadius: 99, whiteSpace: 'nowrap',
      background: neutral ? '#F4F5F7' : isGood ? '#EAFAF0' : '#FEF2F2',
      color: neutral ? '#888' : isGood ? '#1a7a3a' : '#b91c1c',
    }}>
      {d > 0 ? '+' : ''}{d.toFixed(1)}%
    </span>
  )
}
