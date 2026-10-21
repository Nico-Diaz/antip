import type { APIRoute } from 'astro'
import { supabase, getAuthClient } from '../../../lib/supabase'
import { getSignedStreamUrl, isHostedVideo } from '../../../lib/videoAccess'

export const prerender = false

const noStoreHeaders = {
  'Cache-Control': 'no-store, private',
  'Referrer-Policy': 'no-referrer',
  'X-Robots-Tag': 'noindex, nofollow',
}

export const GET: APIRoute = async ({ url, cookies, request }) => {
  const accessToken = cookies.get('sb-access-token')?.value
  if (!accessToken) {
    return new Response('No autenticado', { status: 401, headers: noStoreHeaders })
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken)
  if (userError || !user) {
    return new Response('No autenticado', { status: 401, headers: noStoreHeaders })
  }

  // Solo se permite la carga desde el propio reproductor de la plataforma
  const fetchDest = request.headers.get('sec-fetch-dest')
  if (fetchDest && fetchDest !== 'video' && fetchDest !== 'empty') {
    return new Response('Acceso no permitido', { status: 403, headers: noStoreHeaders })
  }

  const videoId = url.searchParams.get('id')
  if (!videoId) {
    return new Response('ID de video requerido', { status: 400, headers: noStoreHeaders })
  }

  const { data: video, error } = await getAuthClient(accessToken)
    .from('videos')
    .select('video_url')
    .eq('id', videoId)
    .maybeSingle()

  if (error || !video || !isHostedVideo(video.video_url)) {
    return new Response('Video no encontrado', { status: 404, headers: noStoreHeaders })
  }

  const signedUrl = await getSignedStreamUrl(video.video_url)
  if (!signedUrl) {
    console.error('[Stream API]: No se pudo firmar la URL del video', videoId)
    return new Response('No se pudo generar el acceso al video', { status: 500, headers: noStoreHeaders })
  }

  return new Response(null, {
    status: 302,
    headers: { ...noStoreHeaders, Location: signedUrl },
  })
}
