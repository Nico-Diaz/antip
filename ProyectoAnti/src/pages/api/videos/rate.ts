import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

export const GET: APIRoute = async ({ request, cookies }) => {
  const url = new URL(request.url);
  const videoId = url.searchParams.get('video_id');

  if (!videoId) {
    return new Response(JSON.stringify({ error: 'Video ID es requerido' }), { status: 400 });
  }

  // Verificar autenticación
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
  }

  try {
    const { data, error } = await supabase
      .from('user_video_ratings')
      .select('rating')
      .eq('user_id', user.id)
      .eq('video_id', videoId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows found"
      throw error;
    }

    return new Response(JSON.stringify({ rating: data?.rating || null }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};

export const POST: APIRoute = async ({ request }) => {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
  }

  try {
    const body = await request.json();
    const { video_id, rating } = body;

    if (!video_id || !rating || rating < 1 || rating > 5) {
      return new Response(JSON.stringify({ error: 'Datos inválidos' }), { status: 400 });
    }

    const { data, error } = await supabase
      .from('user_video_ratings')
      .upsert({
        user_id: user.id,
        video_id: video_id,
        rating: rating,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id, video_id'
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
