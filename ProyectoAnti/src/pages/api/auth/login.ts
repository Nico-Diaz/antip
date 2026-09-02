import type { APIRoute } from 'astro'
import { supabase } from '../../../lib/supabase'

export const prerender = false

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

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('[API Login Error] Supabase:', error)
      let msg = error.message
      if (msg.includes('Invalid login credentials')) {
        msg = 'Credenciales incorrectas. Verifique su correo electrónico y contraseña.'
      } else if (msg.includes('Email not confirmed')) {
        msg = 'Correo no confirmado. Por favor confirme su correo o desactive la confirmación en Supabase.'
      }
      return new Response(JSON.stringify({ error: msg }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (!data.session || !data.session.access_token) {
      return new Response(JSON.stringify({ error: 'No se pudo obtener la sesión. Verifique sus credenciales o confirme su cuenta.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    cookies.set('sb-access-token', data.session?.access_token || '', {
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })

    cookies.set('sb-refresh-token', data.session?.refresh_token || '', {
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })

    return new Response(JSON.stringify({ user: data.user, session: data.session }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Login error:', err)
    const errorMessage = err instanceof Error ? err.message : 'Error al iniciar sesión'
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}