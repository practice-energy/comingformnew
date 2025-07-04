// Database configuration examples
// Uncomment and configure the database you want to use

// For Supabase
import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Example function for Supabase
export async function insertEmailSupabase(email: string) {
  const { data, error } = await supabase
    .from('emails')
    .insert([
      {
        email,
       source: 'coming_soon_signup',
       created_at: new Date().toISOString()
       }
     ])
  
   if (error) throw error
   return data
}
