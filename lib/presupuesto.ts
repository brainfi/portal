import { supabase } from '@/lib/supabase'

// Partida tal y como la edita PresupuestoConfig (sin el array `real`, que se
// deriva del mayor en la vista). Se guarda el plan completo como JSON por usuario.
export interface PartidaPlan {
  id: number
  categoria: string
  cuentaCodigo: string
  cuentaNombre: string
  tipo: 'ingreso' | 'gasto'
  planAnual: number
  planMensual: number[]
  distribucion: 'lineal' | 'mensual'
  icono: string
  color: string
}

// Devuelve el plan guardado del usuario, o null si todavía no ha guardado ninguno.
export async function getPlan(): Promise<PartidaPlan[] | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data, error } = await supabase
    .from('plan_presupuesto')
    .select('partidas')
    .eq('user_id', user.id)
    .maybeSingle()
  if (error) throw error
  const partidas = data?.partidas as PartidaPlan[] | undefined
  return partidas && partidas.length ? partidas : null
}

// Guarda (o reemplaza) el plan completo del usuario.
export async function savePlan(partidas: PartidaPlan[]): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No has iniciado sesión')
  const { error } = await supabase
    .from('plan_presupuesto')
    .upsert({ user_id: user.id, partidas }, { onConflict: 'user_id' })
  if (error) throw error
}
