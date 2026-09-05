import type { APIRoute } from 'astro'
import { supabase, getAuthClient } from '../../../lib/supabase'

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
    const { video_id } = body

    if (!video_id) {
      return new Response(JSON.stringify({ error: 'video_id requerido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Toggle favorite
    // 1. Check if exists
    const { data: existing, error: findError } = await getAuthClient(accessToken)
      .from('user_favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('video_id', video_id)
      .maybeSingle()

    if (existing) {
      // Remove
      await getAuthClient(accessToken).from('user_favorites').delete().eq('id', existing.id)
      return new Response(JSON.stringify({ success: true, action: 'removed' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    } else {
      // Add
      await getAuthClient(accessToken).from('user_favorites').insert({
        user_id: user.id,
        video_id
      })
      return new Response(JSON.stringify({ success: true, action: 'added' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  } catch (err: any) {
    console.error('[Error POST Favorites]:', err)
    return new Response(JSON.stringify({ error: err.message || 'Error desconocido' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
