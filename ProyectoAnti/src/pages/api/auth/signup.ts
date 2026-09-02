import type { APIRoute } from 'astro'
import { supabase } from '../../../lib/supabase'

export const prerender = false

const sessionCookieOptions = {
  httpOnly: true,
  secure: import.meta.env.PROD,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7,
}

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const rawText = await request.text()
    if (!rawText) {
      return new Response(JSON.stringify({ error: 'Cuerpo de solicitud vacío' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const { email, password } = JSON.parse(rawText)

    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Complete todos los campos' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (typeof email !== 'string' || typeof password !== 'string' || password.length < 6) {
      return new Response(JSON.stringify({ error: 'La contraseña debe tener al menos 6 caracteres' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const requestUrl = new URL(request.url)
    const origin = requestUrl.origin.replace(/\/$/, '')

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: origin,
      },
    })

    if (error) {
      let friendlyError = error.message
      const msgLower = error.message.toLowerCase()
      if (
        msgLower.includes('already registered') ||
        msgLower.includes('already exists') ||
        msgLower.includes('unique constraint')
      ) {
        friendlyError = 'Ya existe una cuenta registrada con este correo electrónico.'
      }
      return new Response(JSON.stringify({ error: friendlyError }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Supabase returns identities: [] when the user already exists
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Ya existe una cuenta registrada con este correo electrónico.' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    if (data.session) {
      cookies.set('sb-access-token', data.session.access_token, sessionCookieOptions)
      cookies.set('sb-refresh-token', data.session.refresh_token, sessionCookieOptions)
    }

    return new Response(JSON.stringify({ user: data.user, session: data.session }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Signup error:', err)
    const errorMessage = err instanceof Error ? err.message : 'Error al procesar el registro'
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}