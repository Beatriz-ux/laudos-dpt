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
  XCircle,
  UserCheck,
  ArrowLeft,
  Clock,
} from "lucide-react";
import { assignReport } from "@/actions/reports/assign-report";
import { cancelReport } from "@/actions/reports/cancel-report";
import type { User, Report } from "@/types";
import { STATUS_LABELS, PRIORITY_LABELS, DEPARTMENT_LABELS } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AgentReportDetailClientProps {
  user: User;
  report: Report;
  officers: User[];
}

export function AgentReportDetailClient({
  user,
  report,
  officers,
}: AgentReportDetailClientProps) {
  const router = useRouter();
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const canAssign = report.status === "PENDING" || report.status === "RECEIVED";
  const canCancel = report.status !== "COMPLETED" && report.status !== "CANCELLED";

  const handleAssign = async () => {
    if (!selectedOfficer) {
      setError("Selecione um policial");
      return;
    }

    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const result = await assignReport(report.id, selectedOfficer);

      if (result.success) {
        setIsAssignDialogOpen(false);
        setSuccess("Laudo atribuído com sucesso!");
        setTimeout(() => {
          router.refresh();
        }, 1000);
      } else {
        setError(result.error || "Erro ao atribuir laudo");
      }
    } catch (err: any) {
      setError(err.message || "Erro ao atribuir laudo");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelReason) {
      setError("Informe o motivo do cancelamento");
      return;
    }

    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const result = await cancelReport(report.id, cancelReason);

      if (result.success) {
        setIsCancelDialogOpen(false);
        router.push("/agent/reports");
      } else {
        setError(result.error || "Erro ao cancelar laudo");
      }
    } catch (err: any) {
      setError(err.message || "Erro ao cancelar laudo");
    } finally {
      setIsSubmitting(false);
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

  const getDaysCount = (assignedAt: Date | null | undefined) => {
    if (!assignedAt) return null;
    const days = Math.floor(
      (new Date().getTime() - new Date(assignedAt).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    return days;
  };

  const daysCount = getDaysCount(report.assignedAt);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Laudo {report.number}
            </h1>
            <p className="text-muted-foreground">
              Visualizar detalhes e gerenciar laudo
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

      {/* Action Buttons */}
      <div className="flex gap-3">
        {canAssign && (
          <Dialog
            open={isAssignDialogOpen}
            onOpenChange={setIsAssignDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <UserCheck className="h-4 w-4 mr-2" />
                {report.assignedTo ? "Reatribuir" : "Atribuir"} Laudo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {report.assignedTo ? "Reatribuir" : "Atribuir"} Laudo
                </DialogTitle>
                <DialogDescription>
                  Selecione o policial que ficará responsável por este laudo
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Policial Responsável
                  </label>
                  <Select
                    value={selectedOfficer}
                    onValueChange={setSelectedOfficer}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um policial" />
                    </SelectTrigger>
                    <SelectContent>
                      {officers.map((officer) => (
                        <SelectItem key={officer.id} value={officer.id}>
                          {officer.name} - {officer.badge} (
                          {DEPARTMENT_LABELS[officer.department]})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {error && (
                  <div className="rounded-lg border border-destructive bg-destructive/10 p-3">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAssignDialogOpen(false)}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleAssign}
                    disabled={isSubmitting || !selectedOfficer}
                    className="flex-1"
                  >
                    {isSubmitting ? "Atribuindo..." : "Atribuir"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {canCancel && (
          <Dialog
            open={isCancelDialogOpen}
            onOpenChange={setIsCancelDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="destructive">
                <XCircle className="h-4 w-4 mr-2" />
                Cancelar Laudo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cancelar Laudo</DialogTitle>
                <DialogDescription>
                  Informe o motivo do cancelamento deste laudo
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Motivo do Cancelamento *
                  </label>
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    disabled={isSubmitting}
                    placeholder="Descreva o motivo do cancelamento"
                    rows={4}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                {error && (
                  <div className="rounded-lg border border-destructive bg-destructive/10 p-3">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCancelDialogOpen(false)}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    Voltar
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleCancel}
                    disabled={isSubmitting || !cancelReason}
                    className="flex-1"
                  >
                    {isSubmitting ? "Cancelando..." : "Confirmar Cancelamento"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

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
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Placa
                  </p>
                  <p className="text-sm font-mono font-bold">
                    {report.vehicle?.plate || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Chassi
                  </p>
                  <p className="text-sm font-mono">
                    {report.vehicle?.chassi || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Marca
                  </p>
                  <p className="text-sm">{report.vehicle?.brand || "-"}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Modelo
                  </p>
                  <p className="text-sm">{report.vehicle?.model || "-"}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Ano
                  </p>
                  <p className="text-sm">{report.vehicle?.year || "-"}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Cor
                  </p>
                  <p className="text-sm">{report.vehicle?.color || "-"}</p>
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
          {report.analysis && (
            <div className="rounded-lg border bg-card">
              <div className="p-6 border-b">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold">Análise Técnica</h2>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {report.analysis.justification && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      Justificativa
                    </p>
                    <p className="text-sm whitespace-pre-wrap">
                      {report.analysis.justification}
                    </p>
                  </div>
                )}

                {report.analysis.observations && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      Observações
                    </p>
                    <p className="text-sm whitespace-pre-wrap">
                      {report.analysis.observations}
                    </p>
                  </div>
                )}

                {report.analysis.isConclusive !== undefined && (
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-sm">
                      <strong>Análise Conclusiva:</strong>{" "}
                      {report.analysis.isConclusive ? "Sim" : "Não"}
                    </p>
                  </div>
                )}
              </div>
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
                  {report.location?.city || "-"} -{" "}
                  {report.location?.state || "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Assignment Info */}
          <div className="rounded-lg border bg-card">
            <div className="p-6 border-b">
              <div className="flex items-center gap-3">
                <UserIcon className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Atribuição</h2>
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

              {report.assignee && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Atribuído a
                  </p>
                  <p className="text-sm">{report.assignee.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {report.assignee.badge} •{" "}
                    {DEPARTMENT_LABELS[report.assignee.department]}
                  </p>
                </div>
              )}

              {daysCount !== null && report.status !== "COMPLETED" && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Tempo em análise
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span
                      className={`text-sm font-medium ${
                        daysCount > 3
                          ? "text-red-600"
                          : daysCount > 1
                          ? "text-yellow-600"
                          : "text-green-600"
                      }`}
                    >
                      {daysCount === 0
                        ? "Hoje"
                        : `${daysCount} dia${daysCount > 1 ? "s" : ""}`}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Report Info */}
          <div className="rounded-lg border bg-card">
            <div className="p-6 border-b">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Datas</h2>
              </div>
            </div>
            <div className="p-6 space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Criado em
                </p>
                <p className="text-sm">
                  {new Date(report.createdAt).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
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
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              )}
              {report.status === "COMPLETED" && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Concluído em
                  </p>
                  <p className="text-sm">
                    {new Date(report.updatedAt).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
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
