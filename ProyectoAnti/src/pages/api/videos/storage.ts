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

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return new Response(JSON.stringify({ error: 'No se envió ningún archivo de video' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Sanitizar nombre de archivo
    const cleanFileName = file.name.replace(/[^a border-zA-Z0-9._-]/g, '_')
    const fileName = `${Date.now()}_${cleanFileName}`
    const arrayBuffer = await file.arrayBuffer()
    const fileBuffer = new Uint8Array(arrayBuffer)

    // Crear cliente de Supabase autenticado con el token del usuario activo
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

    // Intentar subir al bucket 'videos' de Supabase Storage
    const { data: uploadData, error: uploadError } = await authSupabase.storage
      .from('videos')
      .upload(fileName, fileBuffer, {
        contentType: file.type || 'video/mp4',
        upsert: true,
      })

    if (uploadError) {
      console.error('[Supabase Storage Upload Error Details]:', uploadError)
      const details = uploadError.message || JSON.stringify(uploadError)
      throw new Error(`Error en Supabase Storage (${details}). Asegúrese de haber creado el bucket 'videos' con acceso público.`)
    }

    // Obtener la URL pública del archivo subido
    const { data: publicUrlData } = authSupabase.storage
      .from('videos')
      .getPublicUrl(fileName)

    const publicUrl = publicUrlData.publicUrl

    return new Response(
      JSON.stringify({
        success: true,
        publicUrl,
        fileName,
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (err: any) {
    console.error('[Error Storage API]:', err)
    const errorMessage = err?.message || String(err) || 'Error al subir el archivo'
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
