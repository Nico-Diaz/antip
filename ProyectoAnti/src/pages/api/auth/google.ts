import type { APIRoute } from 'astro'
import { supabase } from '../../../lib/supabase'

export const prerender = false

export const GET: APIRoute = async ({ url, redirect }) => {
  try {
    const next = url.searchParams.get('next') || '/dashboard'
    const origin = url.origin.replace(/\/$/, '')
    const callbackUrl = `${origin}/api/auth/callback?next=${encodeURIComponent(next)}`

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: callbackUrl,
        skipBrowserRedirect: true,
      },
    })

    if (error) {
      console.error('Google OAuth error:', error)
      return redirect(`/?error=${encodeURIComponent(error.message)}`)
    }

    if (data?.url) {
      return redirect(data.url)
    }

    return redirect('/?error=No+se+pudo+generar+la+URL+de+autenticacion')
  } catch (err) {
    console.error('Google endpoint error:', err)
    const msg = err instanceof Error ? err.message : 'Error al conectar con Google'
    return redirect(`/?error=${encodeURIComponent(msg)}`)
  }
}