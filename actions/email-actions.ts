"use server"

import { z } from "zod"
import { insertEmailSupabase } from "../lib/database"

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

export async function submitEmail(prevState: any, formData: FormData) {
  const validatedFields = emailSchema.safeParse({
    email: formData.get("email"),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { email } = validatedFields.data

  try {
    await insertEmailToDatabase(email)

    return {
      success: true,
      message: "Email submitted successfully!",
    }
  } catch (error) {
    console.error("Error submitting email:", error)
    return {
      errors: {
        email: ["Failed to submit email. Please try again."],
      },
    }
  }
}

async function insertEmailToDatabase(email: string) {
  return await insertEmailSupabase(email)
}
