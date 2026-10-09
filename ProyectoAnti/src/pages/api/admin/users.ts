import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { isUserAdmin } from '../../../lib/auth';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Inicializar cliente admin de Supabase (requiere Service Role Key)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export const GET: APIRoute = async ({ cookies }) => {
  const accessToken = cookies.get('sb-access-token')?.value;

  if (!accessToken) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
  }

  // Usamos el cliente regular para verificar la sesión del admin
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(supabaseUrl, import.meta.env.PUBLIC_SUPABASE_ANON_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY || '');
  
  const { data: { user } } = await supabase.auth.getUser(accessToken);

  if (!await isUserAdmin(user, accessToken)) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
  }

  // Obtener lista de usuarios desde la base de datos de Auth usando el admin
  const { data: users, error } = await supabaseAdmin.auth.admin.listUsers();
  
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  // Opcionalmente podemos enriquecer con public.profiles, pero
  // listUsers ya nos da el email, created_at, y user_metadata.
  return new Response(JSON.stringify({ users: users.users }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};

export const POST: APIRoute = async ({ request, cookies }) => {
  const accessToken = cookies.get('sb-access-token')?.value;

  if (!accessToken) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
  }

  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(supabaseUrl, import.meta.env.PUBLIC_SUPABASE_ANON_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY || '');
  const { data: { user } } = await supabase.auth.getUser(accessToken);

  if (!await isUserAdmin(user, accessToken)) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
  }

  try {
    const { email, password, full_name } = await request.json();

    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email y contraseña son obligatorios' }), { status: 400 });
    }

    // Crear el usuario. El trigger on_auth_user_created creará su profile automáticamente.
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: full_name || ''
      }
    });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ user: data.user, success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ request, cookies, url }) => {
  const accessToken = cookies.get('sb-access-token')?.value;

  if (!accessToken) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
  }

  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(supabaseUrl, import.meta.env.PUBLIC_SUPABASE_ANON_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY || '');
  const { data: { user } } = await supabase.auth.getUser(accessToken);

  if (!await isUserAdmin(user, accessToken)) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
  }

  const id = url.searchParams.get('id');
  if (!id) {
    return new Response(JSON.stringify({ error: 'ID de usuario requerido' }), { status: 400 });
  }

  // Prevenir que el admin se borre a sí mismo accidentalmente
  if (id === user?.id) {
    return new Response(JSON.stringify({ error: 'No puedes eliminar tu propia cuenta' }), { status: 403 });
  }

  const { error } = await supabaseAdmin.auth.admin.deleteUser(id);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
