import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || (typeof process !== 'undefined' ? process.env.PUBLIC_SUPABASE_URL : '') || ''
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || (typeof process !== 'undefined' ? process.env.PUBLIC_SUPABASE_ANON_KEY : '') || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[Supabase Config Warning]: Faltan las variables de entorno PUBLIC_SUPABASE_URL y PUBLIC_SUPABASE_ANON_KEY en Vercel.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)