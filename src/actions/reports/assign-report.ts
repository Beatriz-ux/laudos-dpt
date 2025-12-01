"use server"

import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/modules/auth"
import type { ActionResponse } from "@/types"

export async function assignReport(
  reportId: string,
  officerId: string
): Promise<ActionResponse<void>> {
  try {
    const currentUser = await requireAuth()

    // Apenas AGENTs podem atribuir laudos
    if (currentUser.role !== "AGENT") {
      return { success: false, error: "Acesso negado" }
    }

    // Verificar se o laudo existe
    const report = await prisma.report.findUnique({
      where: { id: reportId },
    })

    if (!report) {
      return { success: false, error: "Laudo não encontrado" }
    }

    // Verificar se o policial existe
    const officer = await prisma.profile.findUnique({
      where: { id: officerId },
      include: { roles: true },
    })

    if (!officer || !officer.roles.some((r) => r.role === "OFFICER")) {
      return { success: false, error: "Policial não encontrado" }
    }

    // Atualizar laudo
    await prisma.report.update({
      where: { id: reportId },
      data: {
        assignedTo: officerId,
        assignedAt: new Date(),
        status: "RECEIVED",
      },
    })

    // Criar log de auditoria
    await prisma.reportAuditLog.create({
      data: {
        reportId,
        action: "ASSIGNED",
        userId: currentUser.id,
        userName: currentUser.name,
        details: `Laudo atribuído a ${officer.name} (${officer.badge})`,
      },
    })

    return { success: true }
  } catch (error: any) {
    console.error("Assign report error:", error)
    return { success: false, error: error.message || "Erro ao atribuir laudo" }
  }
}
