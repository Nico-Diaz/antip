import type { APIRoute } from 'astro'
import { supabase } from '../../../lib/supabase'

export const prerender = false

const handleLogout: APIRoute = async ({ cookies, redirect, request }) => {
  const accessToken = cookies.get('sb-access-token')?.value
  const refreshToken = cookies.get('sb-refresh-token')?.value

  if (accessToken && refreshToken) {
    try {
      await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      })
      await supabase.auth.signOut()
    } catch (e) {
      console.error('Error in signOut:', e)
    }
  }

  // Eliminar cookies de sesión en el navegador
  cookies.delete('sb-access-token', { path: '/' })
  cookies.delete('sb-refresh-token', { path: '/' })

  // Si la petición proviene de fetch o pide JSON
  if (request.headers.get('accept')?.includes('application/json')) {
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // HTTP 303 See Other obliga al navegador a usar GET al redirigir a '/'
  // evitando el error '405 Method Not Allowed' o reenvío de POST en servidores proxy/cPanel
  return redirect('/', 303)
}

export const POST: APIRoute = handleLogout
export const GET: APIRoute = handleLogout
export const ALL: APIRoute = handleLogout