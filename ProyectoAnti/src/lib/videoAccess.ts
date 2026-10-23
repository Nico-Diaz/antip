import { createHash } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'

// Duración de las URLs firmadas de reproducción (segundos)
const STREAM_URL_TTL = 60 * 60 * 3

// Astro solo inyecta las variables privadas referenciadas de forma estática (import.meta.env.NOMBRE)
const runtimeEnv = typeof process !== 'undefined' ? process.env : {}
const BUNNY_TOKEN_KEY = import.meta.env.BUNNY_TOKEN_KEY || runtimeEnv.BUNNY_TOKEN_KEY || ''
const BUNNY_PULL_ZONE_URL = import.meta.env.BUNNY_PULL_ZONE_URL || runtimeEnv.BUNNY_PULL_ZONE_URL || ''
const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL || runtimeEnv.PUBLIC_SUPABASE_URL || ''
const SUPABASE_SERVICE_ROLE_KEY = import.meta.env.SUPABASE_SERVICE_ROLE_KEY || runtimeEnv.SUPABASE_SERVICE_ROLE_KEY || ''

/**
 * Indica si la URL apunta a un archivo alojado por nosotros (Bunny / Supabase Storage)
 * en lugar de una plataforma externa embebida (YouTube, Vimeo, Drive).
 */
export function isHostedVideo(videoUrl: string | null | undefined): boolean {
  if (!videoUrl) return false
  return !/youtube\.com|youtu\.be|vimeo\.com|drive\.google\.com/i.test(videoUrl)
}

/**
 * Firma una URL del Pull Zone de Bunny con Token Authentication (SHA256).
 * Requiere activar "Token Authentication" en el Pull Zone y definir BUNNY_TOKEN_KEY.
 */
function signBunnyUrl(videoUrl: string): string | null {
  let url: URL
  try {
    url = new URL(videoUrl)
  } catch {
    return null
  }

  // Cualquier Pull Zone de Bunny (*.b-cdn.net o el configurado), excepto Bunny Stream (vz-*)
  const pullZoneHost = BUNNY_PULL_ZONE_URL ? new URL(BUNNY_PULL_ZONE_URL).host : ''
  const isBunnyPullZone =
    (url.host.endsWith('.b-cdn.net') && !url.host.startsWith('vz-')) || url.host === pullZoneHost
  if (!isBunnyPullZone) return null

  const tokenKey = BUNNY_TOKEN_KEY
  if (!tokenKey) {
    console.error('[Bunny Token]: Falta BUNNY_TOKEN_KEY')
    return null
  }

  const expires = Math.floor(Date.now() / 1000) + STREAM_URL_TTL
  const token = createHash('sha256')
    // Bunny calcula el token sobre la ruta decodificada (espacios, paréntesis, etc.)
    .update(tokenKey + decodeURIComponent(url.pathname) + expires)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

  return `${url.origin}${url.pathname}?token=${token}&expires=${expires}`
}

/**
 * Genera una URL firmada temporal para archivos del bucket privado "videos" de Supabase.
 */
async function signSupabaseUrl(videoUrl: string): Promise<string | null> {
  const match = videoUrl.match(/\/storage\/v1\/object\/(?:public|sign)\/videos\/([^?]+)/)
  if (!match || !SUPABASE_SERVICE_ROLE_KEY) return null

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
  const { data, error } = await admin.storage
    .from('videos')
    .createSignedUrl(decodeURIComponent(match[1]), STREAM_URL_TTL)

  if (error || !data) {
    console.error('[Supabase Signed Stream URL Error]:', error)
    return null
  }
  return data.signedUrl
}

/**
 * Devuelve una URL de reproducción temporal para un video alojado, o null si no se puede firmar.
 */
export async function getSignedStreamUrl(videoUrl: string): Promise<string | null> {
  return signBunnyUrl(videoUrl) ?? (await signSupabaseUrl(videoUrl))
}
