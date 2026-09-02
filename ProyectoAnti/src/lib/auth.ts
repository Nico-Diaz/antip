import { supabase } from './supabase'
import type { User } from '@supabase/supabase-js'

/**
 * Verifica si un usuario tiene el rol de Administrador.
 * Comprueba:
 * 1. Correo maestro del sistema ('admin@antipobreza.org')
 * 2. Metadatos de usuario en Supabase Auth (user_metadata o app_metadata: is_admin / isAdmin)
 * 3. Tabla 'profiles' en Supabase DB (columna is_admin o isAdmin)
 */
export async function isUserAdmin(user: User | null | undefined): Promise<boolean> {
  if (!user) return false

  // 1. Email principal de administrador
  if (user.email === 'admin@antipobreza.org') {
    return true
  }

  // 2. Metadatos en Supabase Auth
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

  // 3. Consulta a la tabla 'profiles' en la base de datos de Supabase si existe
  try {
    const { data, error } = await supabase
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
    // Si la tabla no existe o falla la consulta, continuar sin lanzar error
  }

  return false
}
