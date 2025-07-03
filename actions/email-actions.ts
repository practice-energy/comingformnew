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

// Database function - replace with your actual database implementation
async function insertEmailToDatabase(email: string) {
  // Simulate database delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Example database insertion logic:
  // For SQL databases (PostgreSQL, MySQL, etc.):
  // const result = await db.query('INSERT INTO emails (email, created_at) VALUES ($1, $2)', [email, new Date()])

  // For MongoDB:
  // const result = await db.collection('emails').insertOne({ email, createdAt: new Date() })

  // For Supabase:
  // const { data, error } = await supabase.from('emails').insert([{ email }])
  // if (error) throw error

  // For Neon:
  // const sql = neon(process.env.DATABASE_URL);
  // await sql`INSERT INTO emails (email, created_at) VALUES (${email}, ${new Date().toISOString()})`;

  console.log(`Email ${email} would be inserted into database`)

  // Simulate potential database error for testing
  if (email === "error@test.com") {
    throw new Error("Database error")
  }
}
