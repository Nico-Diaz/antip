import type { MiddlewareHandler } from 'astro'
import { supabase } from './lib/supabase'

const protectedRoutes = ['/dashboard']

export const onRequest: MiddlewareHandler = async (context, next) => {
  const { url, cookies, redirect } = context
  const pathname = url.pathname

  const isProtected = protectedRoutes.some(route => pathname.startsWith(route))

  if (!isProtected) {
    return next()
  }

  const accessToken = cookies.get('sb-access-token')?.value
  const refreshToken = cookies.get('sb-refresh-token')?.value

  if (!accessToken || !refreshToken) {
    return redirect(`/?redirect=${encodeURIComponent(pathname)}`)
  }

  const { data: { user }, error } = await supabase.auth.getUser(accessToken)

  if (error || !user) {
    cookies.delete('sb-access-token', { path: '/' })
    cookies.delete('sb-refresh-token', { path: '/' })
    return redirect(`/?redirect=${encodeURIComponent(pathname)}`)
  }

  context.locals.user = user
  return next()
}