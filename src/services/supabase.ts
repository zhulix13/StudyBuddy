import { createClient } from "@supabase/supabase-js";


const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Auth helpers
export const auth = supabase.auth

// Database helpers
export const db = supabase

// Storage helpers
export const storage = supabase.storage