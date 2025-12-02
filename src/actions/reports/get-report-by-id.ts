"use server"

import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/modules/auth"
import type { ActionResponse, Report } from "@/types"

export async function getReportById(
  reportId: string
): Promise<ActionResponse<Report>> {
  try {
    const currentUser = await requireAuth()

    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: {
        creator: { include: { roles: true } },
        assignee: { include: { roles: true } },
        photos: true,
      },
    })

    if (!report) {
      return { success: false, error: "Laudo não encontrado" }
    }

    // Verificar permissões
    if (currentUser.role === "OFFICER" && report.assignedTo !== currentUser.id) {
      return { success: false, error: "Você não tem permissão para ver este laudo" }
    }

    // Map to Report type
    const mappedReport: Report = {
      id: report.id,
      number: report.number,
      status: report.status,
      priority: report.priority,
      createdBy: report.createdBy,
      assignedTo: report.assignedTo,
      assignedAt: report.assignedAt,
      deadline: report.deadline,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,

      // Campos do Agente
      oficio: report.oficio ?? undefined,
      orgaoRequisitante: report.orgaoRequisitante ?? undefined,
      autoridadeRequisitante: report.autoridadeRequisitante ?? undefined,
      guiaOficio: report.guiaOficio ?? undefined,
      dataGuiaOficio: report.dataGuiaOficio,
      ocorrenciaPolicial: report.ocorrenciaPolicial ?? undefined,
      objetivoPericia: report.objetivoPericia ?? undefined,
      preambulo: report.preambulo ?? undefined,
      historico: report.historico ?? undefined,
      placaPortada: report.placaPortada ?? undefined,
      especieTipo: report.especieTipo ?? undefined,
      vidro: report.vidro ?? undefined,
      outrasNumeracoes: report.outrasNumeracoes ?? undefined,

      location: {
        address: report.locationAddress ?? undefined,
        city: report.locationCity ?? undefined,
        state: report.locationState ?? undefined,
        coordinates: report.locationCoordinates
          ? JSON.parse(report.locationCoordinates)
          : undefined,
      },
      vehicle: {
        plate: report.vehiclePlate ?? undefined,
        chassi: report.vehicleChassi ?? undefined,
        vin: report.vehicleVin ?? undefined,
        motor: report.vehicleMotor ?? undefined,
        serieMotor: report.vehicleSerieMotor ?? undefined,
        brand: report.vehicleBrand ?? undefined,
        model: report.vehicleModel ?? undefined,
        year: report.vehicleYear ?? undefined,
        category: report.vehicleCategory ?? undefined,
        color: report.vehicleColor ?? undefined,
        isCloned: report.vehicleIsCloned ?? undefined,
        isAdulterated: report.vehicleIsAdulterated ?? undefined,
        licensedTo: report.vehicleLicensedTo ?? undefined,
        technicalCondition: report.vehicleTechnicalCondition ?? undefined,
      },

      // Informações Adicionais do Policial
      glassInfo: report.glassInfo ?? undefined,
      plateInfo: report.plateInfo ?? undefined,
      motorInfo: report.motorInfo ?? undefined,
      centralEletronicaInfo: report.centralEletronicaInfo ?? undefined,
      seriesAuxiliares: report.seriesAuxiliares ?? undefined,

      analysis: report.analysisIsConclusive !== null || report.analysisJustification !== null || report.analysisConclusion !== null
        ? {
            isConclusive: report.analysisIsConclusive ?? undefined,
            conclusion: report.analysisConclusion ?? undefined,
            justification: report.analysisJustification ?? undefined,
            observations: report.analysisObservations ?? undefined,
          }
        : undefined,

      expertSignature: report.expertSignature ?? undefined,

      creator: report.creator
        ? {
            id: report.creator.id,
            name: report.creator.name,
            email: report.creator.email,
            username: report.creator.username,
            department: report.creator.department,
            badge: report.creator.badge,
            role: report.creator.roles[0]?.role || "AGENT",
            isActive: report.creator.isActive,
            mustChangePassword: report.creator.mustChangePassword,
            lastLogin: report.creator.lastLogin,
            createdAt: report.creator.createdAt,
            updatedAt: report.creator.updatedAt,
          }
        : undefined,
      assignee: report.assignee
        ? {
            id: report.assignee.id,
            name: report.assignee.name,
            email: report.assignee.email,
            username: report.assignee.username,
            department: report.assignee.department,
            badge: report.assignee.badge,
            role: report.assignee.roles[0]?.role || "OFFICER",
            isActive: report.assignee.isActive,
            mustChangePassword: report.assignee.mustChangePassword,
            lastLogin: report.assignee.lastLogin,
            createdAt: report.assignee.createdAt,
            updatedAt: report.assignee.updatedAt,
          }
        : undefined,
      photos: report.photos?.map(photo => ({
        id: photo.id,
        reportId: photo.reportId,
        category: photo.category,
        subtype: photo.subtype ?? undefined,
        photoData: photo.photoData,
        description: photo.description ?? undefined,
        createdAt: photo.createdAt,
      })),
    }

    return { success: true, data: mappedReport }
  } catch (error: any) {
    console.error("Get report by id error:", error)
    return { success: false, error: error.message || "Erro ao buscar laudo" }
  }
}
