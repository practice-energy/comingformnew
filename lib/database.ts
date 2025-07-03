// Database configuration examples
// Uncomment and configure the database you want to use

// For Supabase
import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// For Neon
import { neon } from '@neondatabase/serverless'
export const sql = neon(process.env.DATABASE_URL!)

For MongoDB
import { MongoClient } from 'mongodb'
const client = new MongoClient(process.env.MONGODB_URI!)
export const db = client.db('coming_soon')

// For Prisma (if you're using Prisma)
// import { PrismaClient } from '@prisma/client'
// export const prisma = new PrismaClient()

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

// Example function for Neon
export async function insertEmailNeon(email: string) {
  const result = await sql`
    INSERT INTO emails (email, source, created_at)
     VALUES (${email}, 'coming_soon_signup', ${new Date().toISOString()})
     RETURNING id, email, created_at
   `
 return result[0]
}

// Example function for MongoDB
export async function insertEmailMongo(email: string) {
   const result = await db.collection('emails').insertOne({
    email,
     source: 'coming_soon_signup',
     createdAt: new Date(),
     isVerified: false
   })
   return result
}
