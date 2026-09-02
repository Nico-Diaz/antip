import type { APIRoute } from 'astro'
import { supabase } from '../../../lib/supabase'

export const prerender = false

// Definir el email del admin
const ADMIN_EMAIL = 'admin@antipobreza.org'

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Verificar que el usuario está autenticado
    const accessToken = cookies.get('sb-access-token')?.value

    if (!accessToken) {
      return new Response(JSON.stringify({ error: 'No autenticado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Obtener el usuario actual
    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken)

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Usuario no válido' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Verificar que es el admin
    if (user.email !== ADMIN_EMAIL) {
      return new Response(JSON.stringify({ error: 'No tienes permisos para crear usuarios' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Parsear el body
    const rawText = await request.text()
    if (!rawText) {
      return new Response(JSON.stringify({ error: 'Cuerpo de solicitud vacío' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const { email, password, full_name } = JSON.parse(rawText)

    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email y contraseña son requeridos' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (typeof password !== 'string' || password.length < 6) {
      return new Response(JSON.stringify({ error: 'La contraseña debe tener al menos 6 caracteres' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Crear usuario con Supabase Auth Admin API
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Confirmar email automáticamente
      user_metadata: {
        full_name: full_name || '',
      },
    })

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: data.user?.id,
          email: data.user?.email,
          full_name: full_name || '',
        },
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Error desconocido'
    return new Response(JSON.stringify({ error }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
