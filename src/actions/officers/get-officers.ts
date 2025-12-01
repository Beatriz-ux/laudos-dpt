"use server"

import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/modules/auth"
import type { ActionResponse, User } from "@/types"

export async function getOfficers(): Promise<ActionResponse<User[]>> {
  try {
    const currentUser = await requireAuth()

    // Apenas AGENTs podem listar policiais
    if (currentUser.role !== "AGENT") {
      return { success: false, error: "Acesso negado" }
    }

    const profiles = await prisma.profile.findMany({
      where: {
        roles: {
          some: {
            role: "OFFICER",
          },
        },
      },
      include: {
        roles: true,
      },
      orderBy: { createdAt: "desc" },
    })

    const officers: User[] = profiles.map((profile) => ({
      id: profile.id,
      username: profile.username,
      email: profile.email,
      name: profile.name,
      department: profile.department,
      badge: profile.badge,
      role: profile.roles[0]?.role || "OFFICER",
      isActive: profile.isActive,
      mustChangePassword: profile.mustChangePassword,
      lastLogin: profile.lastLogin,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    }))

    return { success: true, data: officers }
  } catch (error: any) {
    console.error("Get officers error:", error)
    return { success: false, error: error.message || "Erro ao buscar policiais" }
  }
}
