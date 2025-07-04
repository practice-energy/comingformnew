"use server"

import { z } from "zod"

// Email validation schema
const EmailSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }).trim(),
})

export type FormState = {
  errors?: {
    email?: string[]
  }
  message?: string
  success?: boolean
}

export async function submitEmail(prevState: FormState, formData: FormData): Promise<FormState> {
  // Validate the email
  const validatedFields = EmailSchema.safeParse({
    email: formData.get("email"),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    }
  }

  const { email } = validatedFields.data

  try {
    // Store email in database
    await insertEmailToDatabase(email)

    return {
      message: "Вскоре вы получите приглашение: адрес принят",
      success: true,
    }
  } catch (error) {
    console.error("Database error:", error)
    return {
      message: "Ошибка при отправке. Попробуйте снова.",
      success: false,
    }
  }
}

// Database function using Neon
async function insertEmailToDatabase(email: string) {
  const { neon } = await import("@neondatabase/serverless")
  const sql = neon(process.env.DATABASE_URL!)

  try {
    // Insert into the existing users_sync table
    const result = await sql`
      INSERT INTO neon_auth.users_sync (
        id, 
        email, 
        name, 
        created_at, 
        updated_at,
        raw_json
      ) VALUES (
        gen_random_uuid()::text,
        ${email},
        NULL,
        NOW(),
        NOW(),
        jsonb_build_object('source', 'coming_soon_signup', 'ip_address', NULL)
      )
      ON CONFLICT (email) DO UPDATE SET
        updated_at = NOW(),
        raw_json = jsonb_set(
          COALESCE(users_sync.raw_json, '{}'::jsonb),
          '{last_signup_attempt}',
          to_jsonb(NOW())
        )
      RETURNING id, email, created_at
    `

    return result[0]
  } catch (error) {
    console.error("Database insertion error:", error)
    throw new Error("Failed to save email to database")
  }
}
