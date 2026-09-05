import type { APIRoute } from 'astro'
import { supabase, getAuthClient } from '../../../lib/supabase'

export const GET: APIRoute = async ({ cookies }) => {
  try {
    const accessToken = cookies.get('sb-access-token')?.value

    if (!accessToken) {
      return new Response(JSON.stringify({ progress: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken)

    if (userError || !user) {
      return new Response(JSON.stringify({ progress: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const { data, error } = await getAuthClient(accessToken)
      .from('user_video_progress')
      .select('video_id, watched_time, is_completed')
      .eq('user_id', user.id)

    if (error) throw error

    return new Response(JSON.stringify({ progress: data || [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('[Error GET Progress]:', err)
    return new Response(JSON.stringify({ progress: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

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

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Usuario no encontrado' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const body = await request.json()
    const { video_id, watched_time, is_completed } = body

    if (!video_id) {
      return new Response(JSON.stringify({ error: 'video_id requerido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Upsert progress
    const { error } = await getAuthClient(accessToken)
      .from('user_video_progress')
      .upsert({
        user_id: user.id,
        video_id,
        watched_time: watched_time || 0,
        is_completed: is_completed !== undefined ? is_completed : false,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,video_id'
      })

    if (error) throw error

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    console.error('[Error POST Progress]:', err)
    return new Response(JSON.stringify({ error: err.message || 'Error desconocido' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
