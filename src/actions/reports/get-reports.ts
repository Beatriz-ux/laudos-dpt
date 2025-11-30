"use server"

import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/modules/auth"
import type { ActionResponse, Report } from "@/types"

export async function getReports(userId?: string): Promise<ActionResponse<Report[]>> {
  try {
    const currentUser = await requireAuth()

    const where: any = {}

    // AGENT can see all reports
    // OFFICER can only see reports assigned to them
    if (currentUser.role === "OFFICER") {
      where.assignedTo = currentUser.id
    } else if (userId) {
      where.assignedTo = userId
    }

    const reports = await prisma.report.findMany({
      where,
      include: {
        creator: {
          include: { roles: true },
        },
        assignee: {
          include: { roles: true },
        },
        auditLogs: {
          orderBy: { timestamp: "desc" },
        },
        photos: {
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    // Map to Report type
    const mappedReports: Report[] = reports.map((r) => ({
      id: r.id,
      number: r.number,
      status: r.status,
      priority: r.priority,
      createdBy: r.createdBy,
      assignedTo: r.assignedTo,
      assignedAt: r.assignedAt,
      location: {
        address: r.locationAddress || undefined,
        city: r.locationCity || undefined,
        state: r.locationState || undefined,
        coordinates: r.locationCoordinates
          ? JSON.parse(r.locationCoordinates)
          : undefined,
      },
      vehicle: {
        plate: r.vehiclePlate || undefined,
        chassi: r.vehicleChassi || undefined,
        motor: r.vehicleMotor || undefined,
        color: r.vehicleColor || undefined,
        brand: r.vehicleBrand || undefined,
        model: r.vehicleModel || undefined,
        year: r.vehicleYear || undefined,
        isCloned: r.vehicleIsCloned || undefined,
      },
      analysis: {
        isConclusive: r.analysisIsConclusive || undefined,
        justification: r.analysisJustification || undefined,
        observations: r.analysisObservations || undefined,
      },
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      creator: r.creator
        ? {
            id: r.creator.id,
            username: r.creator.username,
            email: r.creator.email,
            name: r.creator.name,
            department: r.creator.department,
            badge: r.creator.badge,
            role: r.creator.roles[0]?.role || "AGENT",
            isActive: r.creator.isActive,
            mustChangePassword: r.creator.mustChangePassword,
            lastLogin: r.creator.lastLogin,
            createdAt: r.creator.createdAt,
            updatedAt: r.creator.updatedAt,
          }
        : undefined,
      assignee: r.assignee
        ? {
            id: r.assignee.id,
            username: r.assignee.username,
            email: r.assignee.email,
            name: r.assignee.name,
            department: r.assignee.department,
            badge: r.assignee.badge,
            role: r.assignee.roles[0]?.role || "OFFICER",
            isActive: r.assignee.isActive,
            mustChangePassword: r.assignee.mustChangePassword,
            lastLogin: r.assignee.lastLogin,
            createdAt: r.assignee.createdAt,
            updatedAt: r.assignee.updatedAt,
          }
        : undefined,
      auditLogs: r.auditLogs.map((log) => ({
        id: log.id,
        reportId: log.reportId,
        action: log.action,
        userId: log.userId,
        userName: log.userName,
        details: log.details || undefined,
        timestamp: log.timestamp,
      })),
      photos: r.photos.map((photo) => ({
        id: photo.id,
        reportId: photo.reportId,
        part: photo.part,
        photoUrl: photo.photoUrl,
        createdAt: photo.createdAt,
      })),
    }))

    return { success: true, data: mappedReports }
  } catch (error: any) {
    console.error("Get reports error:", error)
    return { success: false, error: error.message || "Erro ao buscar laudos" }
  }
}
