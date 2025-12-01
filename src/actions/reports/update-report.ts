"use server"

import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/modules/auth"
import { ReportStatus } from "@prisma/client"
import type { ActionResponse } from "@/types"

export async function updateReportStatus(
  reportId: string,
  status: ReportStatus,
  details?: string
): Promise<ActionResponse<void>> {
  try {
    const currentUser = await requireAuth()

    // Verificar se o laudo existe
    const report = await prisma.report.findUnique({
      where: { id: reportId },
    })

    if (!report) {
      return { success: false, error: "Laudo não encontrado" }
    }

    // Verificar permissões
    if (currentUser.role === "OFFICER" && report.assignedTo !== currentUser.id) {
      return { success: false, error: "Você não tem permissão para atualizar este laudo" }
    }

    // Atualizar laudo
    await prisma.report.update({
      where: { id: reportId },
      data: {
        status,
        updatedAt: new Date(),
      },
    })

    // Criar log de auditoria
    await prisma.reportAuditLog.create({
      data: {
        reportId,
        action: "UPDATED",
        userId: currentUser.id,
        userName: currentUser.name,
        details: details || `Status alterado para ${status}`,
      },
    })

    return { success: true }
  } catch (error: any) {
    console.error("Update report error:", error)
    return { success: false, error: error.message || "Erro ao atualizar laudo" }
  }
}
