import type { APIRoute } from 'astro'
import { supabase } from '../../../lib/supabase'
import { isUserAdmin } from '../../../lib/auth'

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const accessToken = cookies.get('sb-access-token')?.value

    if (!accessToken) {
      return new Response(JSON.stringify({ error: 'No autenticado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken)

    const isAdmin = await isUserAdmin(user)
    if (userError || !user || !isAdmin) {
      return new Response(JSON.stringify({ error: 'No tienes permisos' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const rawText = await request.text()
    if (!rawText) {
      return new Response(JSON.stringify({ error: 'Cuerpo de solicitud vacío' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const { title, description } = JSON.parse(rawText)

    if (!title) {
      return new Response(JSON.stringify({ error: 'El título es requerido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Obtener el orden máximo actual
    const { data: sections, error: orderError } = await supabase
      .from('sections')
      .select('display_order')
      .order('display_order', { ascending: false })
      .limit(1)

    const maxOrder = sections && sections.length > 0 ? sections[0].display_order : -1

    const { data, error } = await supabase
      .from('sections')
      .insert({
        title,
        description: description || '',
        display_order: maxOrder + 1,
      })
      .select()

    if (error) {
      throw error
    }

    return new Response(JSON.stringify({ success: true, section: data?.[0] }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    console.error('[Error API Sections POST]:', err)
    const errorMessage = err?.message || String(err) || 'Error al crear la sección'
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export const GET: APIRoute = async ({ cookies }) => {
  try {
    const { data, error } = await supabase
      .from('sections')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) {
      throw error
    }

    return new Response(JSON.stringify({ sections: data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Error desconocido'
    return new Response(JSON.stringify({ error }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export const DELETE: APIRoute = async ({ cookies, url }) => {
  try {
    const accessToken = cookies.get('sb-access-token')?.value

    if (!accessToken) {
      return new Response(JSON.stringify({ error: 'No autenticado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken)

    const isAdmin = await isUserAdmin(user)
    if (userError || !user || !isAdmin) {
      return new Response(JSON.stringify({ error: 'No tienes permisos' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const sectionId = url.searchParams.get('id')

    if (!sectionId) {
      return new Response(JSON.stringify({ error: 'ID de sección requerido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Eliminar videos asociados a la sección
    await supabase
      .from('videos')
      .delete()
      .eq('section_id', sectionId)

    // Eliminar la sección
    const { error } = await supabase
      .from('sections')
      .delete()
      .eq('id', sectionId)

    if (error) {
      throw error
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Error desconocido'
    return new Response(JSON.stringify({ error }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
