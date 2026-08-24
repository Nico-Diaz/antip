import type { APIRoute } from 'astro'
import { supabase } from '../../../lib/supabase'

export const GET: APIRoute = async ({ url, cookies, redirect }) => {
  const code = url.searchParams.get('code')
  const next = url.searchParams.get('next') || '/dashboard'

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.session) {
      cookies.set('sb-access-token', data.session.access_token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      })

      cookies.set('sb-refresh-token', data.session.refresh_token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      })

      return redirect(next)
    }
  }

  return redirect('/?error=oauth_failed')
}