"use server"

import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/modules/auth"
import type { ActionResponse } from "@/types"

export async function cancelReport(
  reportId: string,
  reason: string
): Promise<ActionResponse<void>> {
  try {
    const currentUser = await requireAuth()

    // Apenas AGENTs podem cancelar laudos
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

    // Não permitir cancelar laudos já concluídos
    if (report.status === "COMPLETED") {
      return { success: false, error: "Não é possível cancelar um laudo concluído" }
    }

    // Atualizar laudo
    await prisma.report.update({
      where: { id: reportId },
      data: {
        status: "CANCELLED",
        updatedAt: new Date(),
      },
    })

    // Criar log de auditoria
    await prisma.reportAuditLog.create({
      data: {
        reportId,
        action: "CANCELLED",
        userId: currentUser.id,
        userName: currentUser.name,
        details: reason,
      },
    })

    return { success: true }
  } catch (error: any) {
    console.error("Cancel report error:", error)
    return { success: false, error: error.message || "Erro ao cancelar laudo" }
  }
}
