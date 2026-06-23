import { supabase } from '@/lib/supabase'

// Extrae el ID de una hoja desde su URL (o acepta el ID pegado directamente).
export function parseSheetId(input: string): string | null {
  const s = (input || '').trim()
  const m = s.match(/\/d\/([a-zA-Z0-9-_]+)/)
  if (m) return m[1]
  if (/^[a-zA-Z0-9-_]{20,}$/.test(s)) return s // pegaron solo el ID
  return null
}

export interface Conexion {
  sheet_id: string
  sheet_url: string | null
  last_synced_at: string | null
}

// Lee la conexión guardada del usuario actual (RLS devuelve solo su fila).
export async function getConnection(): Promise<Conexion | null> {
  const { data, error } = await supabase
    .from('data_source')
    .select('sheet_id, sheet_url, last_synced_at')
    .maybeSingle()
  if (error) throw error
  return data as Conexion | null
}

// Guarda (o actualiza) la hoja conectada del usuario.
export async function saveConnection(url: string): Promise<string> {
  const sheet_id = parseSheetId(url)
  if (!sheet_id) throw new Error('No pude reconocer el ID en esa URL. Pega el enlace completo de la hoja.')
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Sesión no válida.')
  const { error } = await supabase
    .from('data_source')
    .upsert({ user_id: user.id, sheet_id, sheet_url: url }, { onConflict: 'user_id' })
  if (error) throw error
  return sheet_id
}

export interface DatosPayload {
  diario: Record<string, string>[]
  clientes: Record<string, string>[]
  facturas: Record<string, string>[]
  pagos: Record<string, string>[]
  prestamos: Record<string, string>[]
  presupuesto: Record<string, string>[]
  syncedAt?: string
}

export class SheetError extends Error {
  code: string
  constructor(code: string, message: string) { super(message); this.code = code }
}

// Llama a la edge function con la sesión del usuario y devuelve los datos.
export async function fetchDatos(): Promise<DatosPayload> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new SheetError('no_session', 'No hay sesión activa.')

  const base = (import.meta as any).env.VITE_SUPABASE_URL
  const res = await fetch(`${base}/functions/v1/sheets-cobros`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      apikey: (import.meta as any).env.VITE_SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
    },
  })

  let body: any = null
  try { body = await res.json() } catch { /* sin cuerpo */ }

  if (!res.ok) {
    const code = body?.error ?? 'error'
    const message = body?.message ?? `Error ${res.status}`
    throw new SheetError(code, message)
  }
  return body as DatosPayload
}