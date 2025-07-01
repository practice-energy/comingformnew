"use server"

import { drizzle } from "drizzle-orm/d1"
import { eq } from "drizzle-orm"
import { subscribers } from "@/src/schema"

export async function submitEmail(prevState: any, formData: FormData) {
  const email = formData.get("email") as string

  // Валидация email
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { errors: { email: ["Введите корректный email"] } }
  }

  try {
    // Проверка наличия DB в окружении
    if (!process.env.DB) {
      throw new Error("DB environment variable is not defined")
    }

    // Инициализация Drizzle ORM с D1
    const db = drizzle(process.env.DB as unknown as D1Database)

    // Проверка существующего email
    const existing = await db
        .select()
        .from(subscribers)
        .where(eq(subscribers.email, email))
        .execute()

    if (existing.length > 0) {
      return { errors: { email: ["Этот email уже зарегистрирован"] } }
    }

    // Вставка нового email
    await db
        .insert(subscribers)
        .values({ email, createdAt: new Date() })
        .execute()

    return { success: true }
  } catch (error) {
    console.error("Database error:", error)
    return {
      errors: {
        general: ["Произошла ошибка. Пожалуйста, попробуйте снова."]
      }
    }
  }
}