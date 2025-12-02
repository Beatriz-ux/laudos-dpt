"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/modules/auth";
import { generateReportNumber, stringifyCoordinates } from "@/lib/utils";
import type { ActionResponse, CreateReportInput, Report } from "@/types";

export async function createReport(
  input: CreateReportInput
): Promise<ActionResponse<Report>> {
  try {
    const currentUser = await requireRole("AGENT");

    // Get current count for today and department
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const { _count } = await prisma.report.aggregate({
      _count: true,
      where: {
        number: {
          startsWith: `${today}-${currentUser.department}`,
        },
      },
    });

    const sequence = (_count || 0) + 1;
    const reportNumber = generateReportNumber(currentUser.department, sequence);

    // Determine initial status
    const status = input.assignedTo ? "RECEIVED" : "PENDING";

    // Create report
    const report = await prisma.report.create({
      data: {
        number: reportNumber,
        status,
        priority: input.priority,
        createdBy: currentUser.id,
        assignedTo: input.assignedTo || null,
        assignedAt: input.assignedTo ? new Date() : null,
        deadline: input.deadline ? new Date(input.deadline) : null,

        // Campos do Agente
        oficio: input.oficio,
        orgaoRequisitante: input.orgaoRequisitante,
        autoridadeRequisitante: input.autoridadeRequisitante,
        guiaOficio: input.guiaOficio,
        dataGuiaOficio: input.dataGuiaOficio ? new Date(input.dataGuiaOficio) : null,
        ocorrenciaPolicial: input.ocorrenciaPolicial,
        objetivoPericia: input.objetivoPericia,
        preambulo: input.preambulo,
        placaPortada: input.placaPortada,
        vehicleSpecies: input.vehicleSpecies,
        vehicleType: input.vehicleType,
        vidro: input.vidro,
        outrasNumeracoes: input.outrasNumeracoes,

        // Dados do Veículo
        vehiclePlate: input.vehicle.plate,
        vehicleBrand: input.vehicle.brand,
        vehicleModel: input.vehicle.model,
        vehicleColor: input.vehicle.color,
        vehicleMotor: input.vehicle.motor,
        vehicleChassi: input.vehicle.chassi,
      },
      include: {
        creator: { include: { roles: true } },
        assignee: { include: { roles: true } },
      },
    });

    // Create audit log
    await prisma.reportAuditLog.create({
      data: {
        reportId: report.id,
        action: "CREATED",
        userId: currentUser.id,
        userName: currentUser.name,
        details: "Laudo criado",
      },
    });

    // If assigned, create assignment audit log
    if (input.assignedTo) {
      const assignee = await prisma.profile.findUnique({
        where: { id: input.assignedTo },
      });

      await prisma.reportAuditLog.create({
        data: {
          reportId: report.id,
          action: "ASSIGNED",
          userId: currentUser.id,
          userName: currentUser.name,
          details: `Laudo atribuído para ${assignee?.name}`,
        },
      });
    }

    // Map to Report type (simplified)
    const mappedReport: Report = {
      id: report.id,
      number: report.number,
      status: report.status,
      priority: report.priority,
      createdBy: report.createdBy,
      assignedTo: report.assignedTo,
      assignedAt: report.assignedAt,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
    };

    return { success: true, data: mappedReport };
  } catch (error: any) {
    console.error("Create report error:", error);
    return { success: false, error: error.message || "Erro ao criar laudo" };
  }
}
