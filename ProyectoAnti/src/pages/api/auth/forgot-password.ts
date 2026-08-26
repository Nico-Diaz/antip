import type { APIRoute } from 'astro'
import { supabase } from '../../../lib/supabase'

export const prerender = false

export const POST: APIRoute = async ({ request }) => {
  try {
    const rawText = await request.text()
    if (!rawText) {
      return new Response(JSON.stringify({ error: 'Cuerpo de solicitud vacío' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const { email } = JSON.parse(rawText)

    if (!email || typeof email !== 'string') {
      return new Response(JSON.stringify({ error: 'Ingrese un correo electrónico válido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const requestUrl = new URL(request.url)
    const origin = requestUrl.origin.replace(/\/$/, '')
    const redirectTo = `${origin}/reset-password`

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    })

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(
      JSON.stringify({ message: 'Instrucciones para restablecer la contraseña enviadas al correo.' }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (err) {
    console.error('Forgot password error:', err)
    const errorMessage = err instanceof Error ? err.message : 'Error al solicitar restablecimiento'
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
