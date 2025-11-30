"use server"

import { getCurrentUser } from "@/modules/auth"
import type { ActionResponse, User } from "@/types"

/**
 * Get current authenticated user
 */
export async function getAuthenticatedUser(): Promise<ActionResponse<User | null>> {
  try {
    const user = await getCurrentUser()

    return {
      success: true,
      data: user,
    }
  } catch (error: any) {
    console.error("Get user error:", error)
    return {
      success: false,
      error: "Erro ao buscar usuário autenticado",
    }
  }
}
