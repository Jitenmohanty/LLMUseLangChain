import { db } from "../db";
import { users } from "../db/schema";
import { eq, or } from "drizzle-orm";
import { hashPassword, verifyPassword } from "../auth/password";
import { createAccessToken } from "../auth/jwt";

export class AuthService {
  static async createUser(email: string, username: string, password: string) {
    const existing = await db.select().from(users).where(or(eq(users.email, email), eq(users.username, username)));
    if (existing.length) {
      if (existing[0].email === email) throw new Error("Email already registered");
      if (existing[0].username === username) throw new Error("Username already taken");
    }
    const hashed = await hashPassword(password);
    const [user] = await db.insert(users).values({ email, username, password: hashed }).returning();
    return user;
  }

  static async authenticate(email: string, password: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user) return null;
    const ok = await verifyPassword(password, user.password);
    return ok ? user : null;
  }

  static async getProfile(userId: number) {
  const [user] = await db.select().from(users).where(eq(users.id, userId))
  if (!user) throw new Error("User not found")
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    created_at: user.created_at,
  }
}


  static createTokenForUser(user: any) {
    return createAccessToken({ sub: user.email, userId: user.id });
  }
}
