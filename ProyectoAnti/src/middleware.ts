import type { MiddlewareHandler } from 'astro'
import { supabase } from './lib/supabase'
import { isUserAdmin } from './lib/auth'

const protectedRoutes = ['/dashboard', '/admin']

export const onRequest: MiddlewareHandler = async (context, next) => {
  const { url, cookies, redirect } = context
  const pathname = url.pathname

  const accessToken = cookies.get('sb-access-token')?.value
  const refreshToken = cookies.get('sb-refresh-token')?.value

  // Redirigir usuarios autenticados que intentan acceder a la raíz hacia el dashboard
  if (pathname === '/' && accessToken) {
    const { data: { user } } = await supabase.auth.getUser(accessToken)
    if (user) {
      return redirect('/dashboard')
    }
  }

  const isProtected = protectedRoutes.some(route => pathname.startsWith(route))

  if (!isProtected) {
    return next()
  }

  if (!accessToken || !refreshToken) {
    console.warn('[Middleware] Sin tokens en cookies para ruta protegida:', pathname)
    return redirect(`/?redirect=${encodeURIComponent(pathname)}&error=${encodeURIComponent('Debe iniciar sesión para acceder al panel.')}`)
  }

  let user = null
  let error: any = null

  try {
    const res = await supabase.auth.getUser(accessToken)
    user = res.data?.user || null
    error = res.error || null
  } catch (e) {
    error = e
  }

  // Si falló la validación del token pero existe refresh_token, intentar renovar la sesión
  if ((error || !user) && refreshToken) {
    try {
      console.log('[Middleware] Intentando renovar sesión con refresh_token...')
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession({ refresh_token: refreshToken })
      if (!refreshError && refreshData.session && refreshData.user) {
        user = refreshData.user
        error = null

        const sessionCookieOptions = {
          httpOnly: true,
          secure: import.meta.env.PROD,
          sameSite: 'lax' as const,
          path: '/',
          maxAge: 60 * 60 * 24 * 7,
        }

        cookies.set('sb-access-token', refreshData.session.access_token, sessionCookieOptions)
        cookies.set('sb-refresh-token', refreshData.session.refresh_token, sessionCookieOptions)
      } else if (refreshError) {
        console.error('[Middleware] Error al renovar token:', refreshError.message)
      }
    } catch (refreshErr) {
      console.error('[Middleware] Excepción al renovar sesión:', refreshErr)
    }
  }

  if (error || !user) {
    const reason = error ? (error.message || String(error)) : 'Usuario no encontrado'
    console.warn('[Middleware] Acceso denegado:', reason)
    cookies.delete('sb-access-token', { path: '/' })
    cookies.delete('sb-refresh-token', { path: '/' })
    return redirect(`/?redirect=${encodeURIComponent(pathname)}&error=${encodeURIComponent('Sesión no válida: ' + reason)}`)
  }

  if (pathname.startsWith('/admin')) {
    const adminPermitted = await isUserAdmin(user)
    if (!adminPermitted) {
      return redirect('/dashboard')
    }
  }

  context.locals.user = user
  return next()
}