import { supabase } from './supabase'
import { createClient } from '@supabase/supabase-js'
import type { User } from '@supabase/supabase-js'

/**
 * Lista de correos con permisos de Administrador automáticos.
 * Puedes agregar correos aquí para darles permisos inmediatos.
 */
const ADMIN_EMAILS = [
  'admin@antipobreza.org',
  "mdiazbowen@gmail.com",
]

/**
 * Verifica si un usuario tiene el rol de Administrador.
 * Comprueba:
 * 1. Lista de correos maestras (ADMIN_EMAILS)
 * 2. Metadatos de usuario en Supabase Auth (user_metadata o app_metadata: is_admin / isAdmin)
 * 3. Tabla 'profiles' en Supabase DB (columna is_admin o isAdmin)
 */
export async function isUserAdmin(
  user: User | null | undefined,
  accessToken?: string
): Promise<boolean> {
  if (!user) return false

  // 1. Verificar si su email está en la lista de administradores
  if (user.email) {
    const userEmail = user.email.trim().toLowerCase()
    if (ADMIN_EMAILS.some((e) => e.trim().toLowerCase() === userEmail)) {
      return true
    }
  }

  // 2. Verificar metadatos en Supabase Auth
  if (
    user.user_metadata?.is_admin === true ||
    user.user_metadata?.isAdmin === true ||
    user.user_metadata?.is_admin === 'true' ||
    user.user_metadata?.isAdmin === 'true' ||
    user.app_metadata?.is_admin === true ||
    user.app_metadata?.isAdmin === true
  ) {
    return true
  }

  // 3. Consultar la tabla 'profiles' en Supabase usando el token de acceso del usuario si está disponible
  try {
    const client = accessToken
      ? createClient(
        import.meta.env.PUBLIC_SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL || '',
        import.meta.env.PUBLIC_SUPABASE_ANON_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY || '',
        { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
      )
      : supabase

    const { data, error } = await client
      .from('profiles')
      .select('is_admin, isAdmin')
      .eq('id', user.id)
      .maybeSingle()

    if (!error && data) {
      if (data.is_admin === true || data.isAdmin === true || data.is_admin === 1 || data.isAdmin === 1) {
        return true
      }
    }
  } catch (e) {
    console.error('[isUserAdmin Profiles Query Error]:', e)
  }

  return false
}
