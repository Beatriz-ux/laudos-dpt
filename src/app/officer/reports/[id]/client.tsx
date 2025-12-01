"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  MapPin,
  Car,
  User as UserIcon,
  Calendar,
  AlertCircle,
  CheckCircle,
  Save,
  ArrowLeft,
} from "lucide-react";
import { updateReport } from "@/actions/reports/update-report";
import { updateReportStatus } from "@/actions/reports/update-report";
import type { User, Report } from "@/types";
import { STATUS_LABELS, PRIORITY_LABELS, DEPARTMENT_LABELS } from "@/types";
import { Button } from "@/components/ui/button";

interface OfficerReportDetailClientProps {
  user: User;
  report: Report;
}

export function OfficerReportDetailClient({
  user,
  report,
}: OfficerReportDetailClientProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(report.status === "IN_PROGRESS");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    vehicle: {
      chassi: report.vehicle?.chassi || "",
      brand: report.vehicle?.brand || "",
      model: report.vehicle?.model || "",
      year: report.vehicle?.year?.toString() || "",
      color: report.vehicle?.color || "",
    },
    analysis: {
      justification: report.analysis?.justification || "",
      observations: report.analysis?.observations || "",
    },
  });

  const canEdit = report.status === "IN_PROGRESS" || report.status === "RECEIVED";
  const isCompleted = report.status === "COMPLETED";

  const handleInputChange = (field: string, value: string) => {
    const [parent, child] = field.split(".");
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...(prev[parent as keyof typeof prev] as any),
        [child]: value,
      },
    }));
    if (error) setError("");
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");
    setIsSaving(true);

    try {
      const result = await updateReport(report.id, {
        vehicle: {
          chassi: formData.vehicle.chassi,
          brand: formData.vehicle.brand,
          model: formData.vehicle.model,
          year: formData.vehicle.year ? parseInt(formData.vehicle.year) : undefined,
          color: formData.vehicle.color,
        },
        analysis: {
          justification: formData.analysis.justification,
          observations: formData.analysis.observations,
        },
      });

      if (result.success) {
        setSuccess("Laudo salvo com sucesso!");
        setTimeout(() => setSuccess(""), 3000);
        router.refresh();
      } else {
        setError(result.error || "Erro ao salvar laudo");
      }
    } catch (err: any) {
      setError(err.message || "Erro ao salvar laudo");
    } finally {
      setIsSaving(false);
    }
  };

  const handleComplete = async () => {
    if (!formData.analysis.justification) {
      setError("A justificativa é obrigatória para finalizar o laudo");
      return;
    }

    setError("");
    setIsSaving(true);

    try {
      // First save current data
      await handleSave();

      // Then update status to completed
      const result = await updateReportStatus(
        report.id,
        "COMPLETED",
        "Laudo finalizado pelo policial"
      );

      if (result.success) {
        router.push("/officer/reports/completed");
      } else {
        setError(result.error || "Erro ao finalizar laudo");
        setIsSaving(false);
      }
    } catch (err: any) {
      setError(err.message || "Erro ao finalizar laudo");
      setIsSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-700";
      case "RECEIVED":
        return "bg-blue-100 text-blue-700";
      case "IN_PROGRESS":
        return "bg-orange-100 text-orange-700";
      case "COMPLETED":
        return "bg-green-100 text-green-700";
      case "CANCELLED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-100 text-red-700";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-700";
      case "LOW":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Laudo {report.number}
            </h1>
            <p className="text-muted-foreground">
              {isCompleted ? "Visualizar laudo" : "Preencher dados do laudo"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
              report.status
            )}`}
          >
            {STATUS_LABELS[report.status]}
          </span>
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${getPriorityColor(
              report.priority
            )}`}
          >
            {PRIORITY_LABELS[report.priority]}
          </span>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-500 bg-green-50 p-4 flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-green-700 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Vehicle Information */}
          <div className="rounded-lg border bg-card">
            <div className="p-6 border-b">
              <div className="flex items-center gap-3">
                <Car className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Dados do Veículo</h2>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Placa *</label>
                  <input
                    type="text"
                    value={report.vehicle?.plate || ""}
                    disabled
                    className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Chassi</label>
                  <input
                    type="text"
                    value={formData.vehicle.chassi}
                    onChange={(e) =>
                      handleInputChange("vehicle.chassi", e.target.value)
                    }
                    disabled={!canEdit || isSaving}
                    placeholder="Digite o chassi do veículo"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Marca</label>
                  <input
                    type="text"
                    value={formData.vehicle.brand}
                    onChange={(e) =>
                      handleInputChange("vehicle.brand", e.target.value)
                    }
                    disabled={!canEdit || isSaving}
                    placeholder="Ex: Toyota, Honda"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Modelo</label>
                  <input
                    type="text"
                    value={formData.vehicle.model}
                    onChange={(e) =>
                      handleInputChange("vehicle.model", e.target.value)
                    }
                    disabled={!canEdit || isSaving}
                    placeholder="Ex: Corolla, Civic"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Ano</label>
                  <input
                    type="text"
                    value={formData.vehicle.year}
                    onChange={(e) =>
                      handleInputChange("vehicle.year", e.target.value)
                    }
                    disabled={!canEdit || isSaving}
                    placeholder="Ex: 2020"
                    maxLength={4}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Cor</label>
                  <input
                    type="text"
                    value={formData.vehicle.color}
                    onChange={(e) =>
                      handleInputChange("vehicle.color", e.target.value)
                    }
                    disabled={!canEdit || isSaving}
                    placeholder="Ex: Preto, Branco"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>

              {report.vehicle?.isCloned && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">
                    <strong>Atenção:</strong> Veículo com suspeita de clonagem
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Analysis */}
          <div className="rounded-lg border bg-card">
            <div className="p-6 border-b">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Análise Técnica</h2>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Justificativa *</label>
                <textarea
                  value={formData.analysis.justification}
                  onChange={(e) =>
                    handleInputChange("analysis.justification", e.target.value)
                  }
                  disabled={!canEdit || isSaving}
                  placeholder="Descreva a justificativa da análise técnica"
                  rows={4}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
                <p className="text-xs text-muted-foreground">
                  Obrigatório para finalizar o laudo
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Observações</label>
                <textarea
                  value={formData.analysis.observations}
                  onChange={(e) =>
                    handleInputChange("analysis.observations", e.target.value)
                  }
                  disabled={!canEdit || isSaving}
                  placeholder="Observações adicionais (opcional)"
                  rows={4}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          {canEdit && (
            <div className="flex gap-3">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                variant="outline"
                className="flex-1"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Salvando..." : "Salvar Rascunho"}
              </Button>
              <Button
                onClick={handleComplete}
                disabled={isSaving || !formData.analysis.justification}
                className="flex-1"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Finalizar Laudo
              </Button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Location Info */}
          <div className="rounded-lg border bg-card">
            <div className="p-6 border-b">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Localização</h2>
              </div>
            </div>
            <div className="p-6 space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Endereço
                </p>
                <p className="text-sm">{report.location?.address || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Cidade/Estado
                </p>
                <p className="text-sm">
                  {report.location?.city || "-"} - {report.location?.state || "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Report Info */}
          <div className="rounded-lg border bg-card">
            <div className="p-6 border-b">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Informações</h2>
              </div>
            </div>
            <div className="p-6 space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Criado por
                </p>
                <p className="text-sm">{report.creator?.name || "-"}</p>
                <p className="text-xs text-muted-foreground">
                  {report.creator?.badge || "-"} •{" "}
                  {report.creator?.department
                    ? DEPARTMENT_LABELS[report.creator.department]
                    : "-"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Criado em
                </p>
                <p className="text-sm">
                  {new Date(report.createdAt).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              {report.assignedAt && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Atribuído em
                  </p>
                  <p className="text-sm">
                    {new Date(report.assignedAt).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
