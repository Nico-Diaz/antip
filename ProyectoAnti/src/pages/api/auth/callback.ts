import type { APIRoute } from 'astro'
import { supabase } from '../../../lib/supabase'

export const prerender = false

export const GET: APIRoute = async ({ url, cookies, redirect }) => {
  const code = url.searchParams.get('code')
  const errorParam = url.searchParams.get('error_description') || url.searchParams.get('error')
  const next = url.searchParams.get('next') || '/dashboard'

  if (errorParam) {
    console.error('Callback error:', errorParam)
    return redirect(`/?error=${encodeURIComponent(errorParam)}`)
  }

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.session) {
      cookies.set('sb-access-token', data.session.access_token, {
        httpOnly: true,
        secure: url.protocol === 'https:',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      })

      cookies.set('sb-refresh-token', data.session.refresh_token, {
        httpOnly: true,
        secure: url.protocol === 'https:',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      })

      return redirect(next)
    }

    if (error) {
      console.error('Exchange code error:', error)
      return redirect(`/?error=${encodeURIComponent(error.message)}`)
    }
  }

  return redirect('/?error=No+se+recibio+el+codigo+de+autenticacion')
}