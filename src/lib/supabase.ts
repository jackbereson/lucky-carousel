import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return url.startsWith('http')
  } catch {
    return false
  }
}

export const supabaseReady = isValidUrl(supabaseUrl) && supabaseAnonKey.length > 10

export const supabase: SupabaseClient = supabaseReady
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (null as unknown as SupabaseClient)

export type Program = {
  id: string
  name: string
  created_at: string
}

export type Participant = {
  id: string
  program_id: string
  full_name: string
  cccd: string
  phone: string | null
  created_at: string
}

export type Prize = {
  id: string
  program_id: string
  name: string
  color: string
  icon: string
  total_quantity: number
  remaining_quantity: number
}

export type Winner = {
  id: string
  program_id: string
  participant_id: string
  prize_id: string
  created_at: string
  participant?: Participant
  prize?: Prize
}
