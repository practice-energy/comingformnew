"use server"

import { z } from "zod"
import { insertEmailSupabase } from "../lib/database"

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
    // Store email in database using Supabase
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

// Database function using Supabase
async function insertEmailToDatabase(email: string) {
  try {
    const result = await insertEmailSupabase(email)
    return result
  } catch (error) {
    console.error("Database insertion error:", error)
    throw new Error("Failed to save email to database")
  }
}
