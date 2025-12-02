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
      if (input.vehicle.vin !== undefined) updateData.vehicleVin = input.vehicle.vin
      if (input.vehicle.brand !== undefined) updateData.vehicleBrand = input.vehicle.brand
      if (input.vehicle.model !== undefined) updateData.vehicleModel = input.vehicle.model
      if (input.vehicle.year !== undefined) updateData.vehicleYear = input.vehicle.year
      if (input.vehicle.category !== undefined) updateData.vehicleCategory = input.vehicle.category
      if (input.vehicle.color !== undefined) updateData.vehicleColor = input.vehicle.color
      if (input.vehicle.serieMotor !== undefined) updateData.vehicleSerieMotor = input.vehicle.serieMotor
      if (input.vehicle.licensedTo !== undefined) updateData.vehicleLicensedTo = input.vehicle.licensedTo
      if (input.vehicle.technicalCondition !== undefined) updateData.vehicleTechnicalCondition = input.vehicle.technicalCondition
      if (input.vehicle.isAdulterated !== undefined) updateData.vehicleIsAdulterated = input.vehicle.isAdulterated
    }

    if (input.info) {
      if (input.info.glassInfo !== undefined) updateData.glassInfo = input.info.glassInfo
      if (input.info.plateInfo !== undefined) updateData.plateInfo = input.info.plateInfo
      if (input.info.motorInfo !== undefined) updateData.motorInfo = input.info.motorInfo
      if (input.info.centralEletronicaInfo !== undefined) updateData.centralEletronicaInfo = input.info.centralEletronicaInfo
      if (input.info.seriesAuxiliares !== undefined) updateData.seriesAuxiliares = input.info.seriesAuxiliares
    }

    if (input.analysis) {
      if (input.analysis.isConclusive !== undefined) {
        updateData.analysisIsConclusive = input.analysis.isConclusive
      }
      if (input.analysis.conclusion !== undefined) {
        updateData.analysisConclusion = input.analysis.conclusion
      }
      if (input.analysis.justification !== undefined) {
        updateData.analysisJustification = input.analysis.justification
      }
      if (input.analysis.observations !== undefined) {
        updateData.analysisObservations = input.analysis.observations
      }
    }

    if (input.original) {
      if (input.original.plate !== undefined) updateData.originalPlate = input.original.plate
      if (input.original.brand !== undefined) updateData.originalBrand = input.original.brand
      if (input.original.model !== undefined) updateData.originalModel = input.original.model
      if (input.original.species !== undefined) updateData.originalSpecies = input.original.species
      if (input.original.type !== undefined) updateData.originalType = input.original.type
      if (input.original.color !== undefined) updateData.originalColor = input.original.color
      if (input.original.chassi !== undefined) updateData.originalChassi = input.original.chassi
      if (input.original.motor !== undefined) updateData.originalMotor = input.original.motor
      if (input.original.licensedTo !== undefined) updateData.originalLicensedTo = input.original.licensedTo
      if (input.original.analysisDetails !== undefined) updateData.originalAnalysisDetails = input.original.analysisDetails
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

    // Processar fotos se fornecidas
    if (input.photos && input.photos.length > 0) {
      // Deletar fotos antigas deste laudo
      await prisma.vehiclePhoto.deleteMany({
        where: { reportId },
      })

      // Criar novas fotos
      await prisma.vehiclePhoto.createMany({
        data: input.photos.map(photo => ({
          reportId,
          category: photo.category,
          subtype: photo.subtype,
          photoData: photo.photoData,
          description: photo.description,
        })),
      })
    }

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
