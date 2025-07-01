// env.d.ts
/// <reference types="@cloudflare/workers-types" />

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            DB: D1Database
        }
    }

    // Добавьте это объявление для глобальной доступности
    interface D1Database extends D1Database {}
}