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

    // Configuración de Bunny.net desde variables de entorno
    const storageZone = import.meta.env.BUNNY_STORAGE_ZONE_NAME
    const accessKey = import.meta.env.BUNNY_STORAGE_API_KEY
    const storageEndpoint = import.meta.env.BUNNY_STORAGE_ENDPOINT || 'storage.bunnycdn.com'
    const pullZone = import.meta.env.BUNNY_PULL_ZONE_URL

    if (!storageZone || !accessKey || !pullZone) {
      return new Response(JSON.stringify({ error: 'Falta configuración de Bunny.net en las variables de entorno (.env)' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // URL de subida de Bunny Storage
    const uploadUrl = `https://${storageEndpoint}/${storageZone}/${fileName}`

    // Subir el archivo a Bunny Storage mediante la API HTTP
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'AccessKey': accessKey,
        'Content-Type': file.type || 'application/octet-stream',
      },
      body: fileBuffer,
    })

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text()
      console.error('[Bunny Storage Upload Error]:', uploadResponse.status, errorText)
      throw new Error(`Error al subir a Bunny.net: ${uploadResponse.statusText}`)
    }

    // Generar la URL pública del archivo a través de la CDN (Pull Zone)
    const cleanPullZone = pullZone.replace(/\/$/, '')
    const publicUrl = `${cleanPullZone}/${fileName}`

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
