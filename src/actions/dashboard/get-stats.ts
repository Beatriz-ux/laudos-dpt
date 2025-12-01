"use server"

import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/modules/auth"
import type { ActionResponse, DashboardStats } from "@/types"

export async function getDashboardStats(userId?: string): Promise<ActionResponse<DashboardStats>> {
  try {
    const currentUser = await requireAuth()

    // Para AGENT: estatísticas gerais do sistema
    // Para OFFICER: apenas seus próprios laudos
    const where: any = {}

    if (currentUser.role === "OFFICER") {
      where.assignedTo = currentUser.id
    } else if (userId) {
      where.assignedTo = userId
    }

    const [
      totalReports,
      pendingReports,
      receivedReports,
      inProgressReports,
      completedReports,
      cancelledReports,
    ] = await Promise.all([
      prisma.report.count({ where }),
      prisma.report.count({ where: { ...where, status: "PENDING" } }),
      prisma.report.count({ where: { ...where, status: "RECEIVED" } }),
      prisma.report.count({ where: { ...where, status: "IN_PROGRESS" } }),
      prisma.report.count({ where: { ...where, status: "COMPLETED" } }),
      prisma.report.count({ where: { ...where, status: "CANCELLED" } }),
    ])

    const stats: DashboardStats = {
      totalReports,
      pendingReports,
      receivedReports,
      inProgressReports,
      completedReports,
      cancelledReports,
      myReports: currentUser.role === "OFFICER" ? totalReports : undefined,
    }

    return { success: true, data: stats }
  } catch (error: any) {
    console.error("Get dashboard stats error:", error)
    return { success: false, error: error.message || "Erro ao buscar estatísticas" }
  }
}
