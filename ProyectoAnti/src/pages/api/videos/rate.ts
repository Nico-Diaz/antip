import type { APIRoute } from 'astro'
import { supabase, getAuthClient } from '../../../lib/supabase'

const jsonHeaders = { 'Content-Type': 'application/json' }

export const GET: APIRoute = async ({ url, cookies }) => {
  try {
    const accessToken = cookies.get('sb-access-token')?.value
    if (!accessToken) {
      return new Response(JSON.stringify({ error: 'No autenticado' }), { status: 401, headers: jsonHeaders })
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken)
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'No autenticado' }), { status: 401, headers: jsonHeaders })
    }

    const videoId = url.searchParams.get('video_id')
    if (!videoId) {
      return new Response(JSON.stringify({ error: 'Video ID es requerido' }), { status: 400, headers: jsonHeaders })
    }

    const { data, error } = await getAuthClient(accessToken)
      .from('user_video_ratings')
      .select('rating')
      .eq('user_id', user.id)
      .eq('video_id', videoId)
      .maybeSingle()

    if (error) {
      throw error
    }

    return new Response(JSON.stringify({ rating: data?.rating || null }), { status: 200, headers: jsonHeaders })
  } catch (err: any) {
    console.error('[Error API Rate GET]:', err)
    return new Response(JSON.stringify({ error: err?.message || 'Error al obtener la valoración' }), {
      status: 500,
      headers: jsonHeaders,
    })
  }
}

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const accessToken = cookies.get('sb-access-token')?.value
    if (!accessToken) {
      return new Response(JSON.stringify({ error: 'No autenticado' }), { status: 401, headers: jsonHeaders })
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken)
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'No autenticado' }), { status: 401, headers: jsonHeaders })
    }

    const { video_id, rating } = await request.json()

    if (!video_id || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      return new Response(JSON.stringify({ error: 'Datos inválidos' }), { status: 400, headers: jsonHeaders })
    }

    const { data, error } = await getAuthClient(accessToken)
      .from('user_video_ratings')
      .upsert(
        {
          user_id: user.id,
          video_id,
          rating,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,video_id' }
      )
      .select()
      .single()

    if (error) {
      throw error
    }

    return new Response(JSON.stringify({ success: true, data }), { status: 200, headers: jsonHeaders })
  } catch (err: any) {
    console.error('[Error API Rate POST]:', err)
    return new Response(JSON.stringify({ error: err?.message || 'Error al guardar la valoración' }), {
      status: 500,
      headers: jsonHeaders,
    })
  }
}
