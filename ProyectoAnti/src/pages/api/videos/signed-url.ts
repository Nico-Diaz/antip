import type { APIRoute } from 'astro'
import { createClient } from '@supabase/supabase-js'
import { supabase } from '../../../lib/supabase'
import { isUserAdmin } from '../../../lib/auth'

export const prerender = false

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

    const body = await request.json()
    const { fileName } = body || {}

    if (!fileName) {
      return new Response(JSON.stringify({ error: 'Nombre de archivo requerido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Sanitizar el nombre del archivo
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_')
    const path = `${Date.now()}_${cleanFileName}`

    // Cliente Supabase autenticado con el token del usuario
    const authSupabase = createClient(
      import.meta.env.PUBLIC_SUPABASE_URL,
      import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
      {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      }
    )

    // Crear URL firmada para subida directa desde el navegador
    const { data: signedData, error: signedError } = await authSupabase.storage
      .from('videos')
      .createSignedUploadUrl(path)

    if (signedError || !signedData) {
      console.error('[Supabase Signed URL Error]:', signedError)
      return new Response(
        JSON.stringify({ error: signedError?.message || 'Error al generar la URL de subida a Supabase Storage. Verifique que exista el bucket "videos".' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const { data: publicUrlData } = authSupabase.storage
      .from('videos')
      .getPublicUrl(path)

    return new Response(
      JSON.stringify({
        success: true,
        signedUrl: signedData.signedUrl,
        token: signedData.token,
        path,
        publicUrl: publicUrlData.publicUrl,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (err: any) {
    console.error('[Error Signed URL API]:', err)
    const errorMessage = err?.message || String(err) || 'Error al procesar la subida'
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
