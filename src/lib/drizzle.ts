import { drizzle } from "drizzle-orm/d1"

export function getDB(d1: D1Database) {
    return drizzle(d1)
}