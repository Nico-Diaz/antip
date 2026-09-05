import type { APIRoute } from 'astro'
import { supabase, getAuthClient } from '../../../lib/supabase'
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

    const isAdmin = await isUserAdmin(user, accessToken)
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

    const { section_id, title, description, video_url, thumbnail_url, duration } = JSON.parse(rawText)

    if (!section_id || !title || !video_url) {
      return new Response(JSON.stringify({ error: 'Faltan campos requeridos: section_id, title, video_url' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Verificar que la sección existe
    const { data: section, error: sectionError } = await getAuthClient(accessToken)
      .from('sections')
      .select('id')
      .eq('id', section_id)
      .single()

    if (sectionError || !section) {
      return new Response(JSON.stringify({ error: 'Sección no encontrada' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Obtener el orden máximo para esta sección
    const { data: videos } = await getAuthClient(accessToken)
      .from('videos')
      .select('display_order')
      .eq('section_id', section_id)
      .order('display_order', { ascending: false })
      .limit(1)

    const maxOrder = videos && videos.length > 0 ? videos[0].display_order : -1

    const { data, error } = await getAuthClient(accessToken)
      .from('videos')
      .insert({
        section_id,
        title,
        description: description || '',
        video_url,
        thumbnail_url: thumbnail_url || null,
        duration: duration || null,
        display_order: maxOrder + 1,
      })
      .select()

    if (error) {
      throw error
    }

    return new Response(JSON.stringify({ success: true, video: data?.[0] }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    console.error('[Error API Upload POST]:', err)
    const errorMessage = err?.message || String(err) || 'Error al publicar el video'
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export const GET: APIRoute = async ({ url, cookies }) => {
  try {
    const accessToken = cookies.get('sb-access-token')?.value
    if (!accessToken) {
      return new Response(JSON.stringify({ error: 'No autenticado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const sectionId = url.searchParams.get('section_id')

    let query = getAuthClient(accessToken).from('videos').select('*').order('display_order', { ascending: true })

    if (sectionId) {
      query = query.eq('section_id', sectionId)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    return new Response(JSON.stringify({ videos: data }), {
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

    const videoId = url.searchParams.get('id')

    if (!videoId) {
      return new Response(JSON.stringify({ error: 'ID de video requerido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const { error } = await getAuthClient(accessToken)
      .from('videos')
      .delete()
      .eq('id', videoId)

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
