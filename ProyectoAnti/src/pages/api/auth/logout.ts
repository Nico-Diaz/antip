import type { APIRoute } from 'astro'
import { supabase } from '../../../lib/supabase'

export const POST: APIRoute = async ({ cookies }) => {
  const accessToken = cookies.get('sb-access-token')?.value
  const refreshToken = cookies.get('sb-refresh-token')?.value

  if (accessToken && refreshToken) {
    await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    })
    await supabase.auth.signOut()
  }

  cookies.delete('sb-access-token', { path: '/' })
  cookies.delete('sb-refresh-token', { path: '/' })

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}