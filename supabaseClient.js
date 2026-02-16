import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// GANTI dengan Supabase URL dan Anon Key Anda dari https://supabase.com/dashboard/project/_/settings/api
const SUPABASE_URL = 'https://ldpkomfiyhdkslpygnds.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_DSdWRDQkwKfJGZSEJHEFlQ_Y34ocR4P'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
