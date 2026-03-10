import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey
)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string | null
          role: 'teacher' | 'admin'
          subscription_status: 'active' | 'inactive' | 'trial'
          plans_used_this_month: number
          burst_plans: number
          referral_code: string
          referred_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      lesson_plans: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          grade: string
          subject: string
          standards_state: string
          topic: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['lesson_plans']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['lesson_plans']['Insert']>
      }
      referrals: {
        Row: {
          id: string
          referrer_id: string
          referred_email: string
          status: 'pending' | 'completed'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['referrals']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['referrals']['Insert']>
      }
    }
  }
}
