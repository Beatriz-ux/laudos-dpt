"use server"

import { cookies } from "next/headers"
import { JWTPayload, SignJWT, jwtVerify } from "jose"
import type { User } from "@/types"

const secretKey = process.env.AUTHENTICATION_SECRET_KEY
const key = new TextEncoder().encode(secretKey)

const COOKIE_NAME = "session"
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 24 * 7, // 1 week
  path: "/",
}

/**
 * Encrypt user session data into JWT
 */
export async function encrypt(payload: any): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1 week from now")
    .sign(key)
}

/**
 * Decrypt JWT into session data
 */
export async function decrypt(input: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ["HS256"],
    })
    return payload
  } catch (error) {
    return null
  }
}

/**
 * Create authenticated session for user
 */
export async function createSession(user: User): Promise<void> {
  const session = await encrypt({ user })
  cookies().set(COOKIE_NAME, session, COOKIE_OPTIONS)
}

/**
 * Destroy user session (logout)
 */
export async function destroySession(): Promise<void> {
  cookies().set(COOKIE_NAME, "", {
    ...COOKIE_OPTIONS,
    expires: new Date(0),
  })
}

/**
 * Get current session data
 */
export async function getSession(): Promise<JWTPayload | null> {
  const session = cookies().get(COOKIE_NAME)
  if (!session || !session.value) return null

  const payload = await decrypt(session.value)

  if (!payload || !payload.exp || payload.exp < Date.now() / 1000) {
    return null
  }

  return payload
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession()
  if (!session || !session.user) return null
  return session.user as User
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession()
  return !!session
}

/**
 * Check if user has specific role
 */
export async function hasRole(role: "AGENT" | "OFFICER"): Promise<boolean> {
  const user = await getCurrentUser()
  return user?.role === role
}

/**
 * Require authentication - throws if not authenticated
 */
export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error("Não autenticado")
  }
  return user
}

/**
 * Require specific role - throws if user doesn't have role
 */
export async function requireRole(role: "AGENT" | "OFFICER"): Promise<User> {
  const user = await requireAuth()
  if (user.role !== role) {
    throw new Error("Acesso negado")
  }
  return user
}
