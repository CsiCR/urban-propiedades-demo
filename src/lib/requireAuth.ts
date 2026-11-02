// src/lib/requireAuth.ts
import { supabase } from './supabaseClient'

export async function requireAuth() {
  const { data, error } = await supabase.auth.getSession()
  if (error || !data.session) {
    window.location.hash = '#/admin/login'
  }
}