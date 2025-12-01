"use server"

import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/modules/auth"
import { ReportStatus } from "@prisma/client"
import type { ActionResponse, UpdateReportInput } from "@/types"

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

export async function updateReport(
  reportId: string,
  input: UpdateReportInput
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

    // Construir dados de atualização
    const updateData: any = {
      updatedAt: new Date(),
    }

    if (input.status) {
      updateData.status = input.status
    }

    if (input.priority) {
      updateData.priority = input.priority
    }

    if (input.location) {
      if (input.location.address) updateData.locationAddress = input.location.address
      if (input.location.city) updateData.locationCity = input.location.city
      if (input.location.state) updateData.locationState = input.location.state
    }

    if (input.vehicle) {
      if (input.vehicle.chassi !== undefined) updateData.vehicleChassi = input.vehicle.chassi
      if (input.vehicle.brand !== undefined) updateData.vehicleBrand = input.vehicle.brand
      if (input.vehicle.model !== undefined) updateData.vehicleModel = input.vehicle.model
      if (input.vehicle.year !== undefined) updateData.vehicleYear = input.vehicle.year
      if (input.vehicle.color !== undefined) updateData.vehicleColor = input.vehicle.color
    }

    if (input.analysis) {
      if (input.analysis.isConclusive !== undefined) {
        updateData.analysisIsConclusive = input.analysis.isConclusive
      }
      if (input.analysis.justification !== undefined) {
        updateData.analysisJustification = input.analysis.justification
      }
      if (input.analysis.observations !== undefined) {
        updateData.analysisObservations = input.analysis.observations
      }
    }

    if (input.assignedTo !== undefined) {
      updateData.assignedTo = input.assignedTo
      if (input.assignedTo && !report.assignedAt) {
        updateData.assignedAt = new Date()
      }
    }

    // Atualizar laudo
    await prisma.report.update({
      where: { id: reportId },
      data: updateData,
    })

    // Criar log de auditoria
    await prisma.reportAuditLog.create({
      data: {
        reportId,
        action: "UPDATED",
        userId: currentUser.id,
        userName: currentUser.name,
        details: "Laudo atualizado",
      },
    })

    return { success: true }
  } catch (error: any) {
    console.error("Update report error:", error)
    return { success: false, error: error.message || "Erro ao atualizar laudo" }
  }
}
