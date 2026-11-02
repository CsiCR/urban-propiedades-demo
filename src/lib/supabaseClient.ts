import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL || 'https://demo-urban.supabase.co'
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-anon-key'

export const supabase = createClient(url, anon, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
})
