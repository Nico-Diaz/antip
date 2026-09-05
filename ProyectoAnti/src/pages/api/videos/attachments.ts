import type { APIRoute } from 'astro'
import { supabase, getAuthClient } from '../../../lib/supabase'
import { isUserAdmin } from '../../../lib/auth'

export const GET: APIRoute = async ({ url, cookies }) => {
  try {
    const accessToken = cookies.get('sb-access-token')?.value
    if (!accessToken) {
      return new Response(JSON.stringify({ error: 'No autenticado' }), { status: 401 })
    }

    const videoId = url.searchParams.get('video_id')
    if (!videoId) {
      return new Response(JSON.stringify({ error: 'video_id requerido' }), { status: 400 })
    }

    const { data, error } = await getAuthClient(accessToken)
      .from('video_attachments')
      .select('*')
      .eq('video_id', videoId)
      .order('created_at', { ascending: true })

    if (error) throw error

    return new Response(JSON.stringify({ attachments: data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
}

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const accessToken = cookies.get('sb-access-token')?.value
    if (!accessToken) return new Response(JSON.stringify({ error: 'No autenticado' }), { status: 401 })

    const { data: { user } } = await supabase.auth.getUser(accessToken)
    const isAdmin = await isUserAdmin(user)
    if (!user || !isAdmin) return new Response(JSON.stringify({ error: 'Sin permisos' }), { status: 403 })

    const { video_id, title, file_url, file_type } = await request.json()
    if (!video_id || !title || !file_url) {
      return new Response(JSON.stringify({ error: 'Faltan campos' }), { status: 400 })
    }

    const { data, error } = await getAuthClient(accessToken)
      .from('video_attachments')
      .insert({ video_id, title, file_url, file_type })
      .select()

    if (error) throw error

    return new Response(JSON.stringify({ success: true, attachment: data[0] }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
}

export const DELETE: APIRoute = async ({ url, cookies }) => {
  try {
    const accessToken = cookies.get('sb-access-token')?.value
    if (!accessToken) return new Response(JSON.stringify({ error: 'No autenticado' }), { status: 401 })

    const { data: { user } } = await supabase.auth.getUser(accessToken)
    const isAdmin = await isUserAdmin(user)
    if (!user || !isAdmin) return new Response(JSON.stringify({ error: 'Sin permisos' }), { status: 403 })

    const id = url.searchParams.get('id')
    if (!id) return new Response(JSON.stringify({ error: 'id requerido' }), { status: 400 })

    const { error } = await getAuthClient(accessToken).from('video_attachments').delete().eq('id', id)
    if (error) throw error

    return new Response(JSON.stringify({ success: true }), { status: 200 })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
}
