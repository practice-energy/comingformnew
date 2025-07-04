import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function insertEmailSupabase(email: string) {
  const { data, error } = await supabase.from("emails").insert([{ email }]).select().single()

  if (error) {
    if (error.code === "23505") {
      // unique constraint violation
      throw new Error("Email already exists")
    }
    throw error
  }

  return data
}
