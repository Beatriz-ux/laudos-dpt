"use server"

import { destroySession } from "@/modules/auth"
import type { ActionResponse } from "@/types"

export async function logout(): Promise<ActionResponse<void>> {
  try {
    await destroySession()
    return { success: true }
  } catch (error: any) {
    console.error("Logout error:", error)
    return { success: false, error: "Erro ao fazer logout" }
  }
}
