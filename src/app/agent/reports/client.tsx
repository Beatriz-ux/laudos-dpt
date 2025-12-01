"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Eye, UserCheck, X, Search } from "lucide-react"
import { assignReport } from "@/actions/reports/assign-report"
import { cancelReport } from "@/actions/reports/cancel-report"
import type { User, Report } from "@/types"
import { STATUS_LABELS, PRIORITY_LABELS } from "@/types"
import { useRouter } from "next/navigation"
import { CreateReportDialog } from "@/components/create-report-dialog"

interface AgentReportsClientProps {
  user: User
  reports: Report[]
  officers: User[]
}

export function AgentReportsClient({ user, reports, officers }: AgentReportsClientProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL")
  const [isAssigning, setIsAssigning] = useState(false)
  const [selectedReport, setSelectedReport] = useState<string | null>(null)

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesSearch =
        !searchQuery ||
        report.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.vehicle?.plate?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.vehicle?.chassi?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.location?.address?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === "ALL" || report.status === statusFilter
      const matchesPriority = priorityFilter === "ALL" || report.priority === priorityFilter

      return matchesSearch && matchesStatus && matchesPriority
    })
  }, [reports, searchQuery, statusFilter, priorityFilter])

  const handleAssignOfficer = async (reportId: string, officerId: string) => {
    setIsAssigning(true)
    try {
      const result = await assignReport(reportId, officerId)
      if (result.success) {
        alert("Policial atribuído com sucesso!")
        router.refresh()
      } else {
        alert(result.error || "Erro ao atribuir policial")
      }
    } catch (error) {
      alert("Erro ao atribuir policial")
    } finally {
      setIsAssigning(false)
      setSelectedReport(null)
    }
  }

  const handleCancelReport = async (reportId: string) => {
    const reason = prompt("Digite o motivo do cancelamento:")
    if (!reason) return

    try {
      const result = await cancelReport(reportId, reason)
      if (result.success) {
        alert("Laudo cancelado com sucesso!")
        router.refresh()
      } else {
        alert(result.error || "Erro ao cancelar laudo")
      }
    } catch (error) {
      alert("Erro ao cancelar laudo")
    }
  }

  const getDaysCount = (assignedAt: Date | null | undefined, status: string) => {
    if (!assignedAt || status === "PENDING") return null
    const days = Math.floor(
      (new Date().getTime() - new Date(assignedAt).getTime()) / (1000 * 60 * 60 * 24)
    )
    return days
  }

  const getOfficerName = (officerId?: string | null) => {
    if (!officerId) return "-"
    const officer = officers.find((o) => o.id === officerId)
    return officer ? officer.name : "Policial não encontrado"
  }

  return (
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Laudos</h1>
            <p className="text-muted-foreground">Gerenciar todos os laudos do sistema</p>
          </div>
          <CreateReportDialog officers={officers} />
        </div>

        {/* Search and Filters */}
        <div className="rounded-lg border bg-card p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar por número, placa, chassi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border rounded-md bg-background"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border rounded-md bg-background"
            >
              <option value="ALL">Todos os Status</option>
              <option value="PENDING">Pendente</option>
              <option value="RECEIVED">Recebido</option>
              <option value="IN_PROGRESS">Em Andamento</option>
              <option value="COMPLETED">Concluído</option>
              <option value="CANCELLED">Cancelado</option>
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-2 border rounded-md bg-background"
            >
              <option value="ALL">Todas Prioridades</option>
              <option value="HIGH">Alta</option>
              <option value="MEDIUM">Média</option>
              <option value="LOW">Baixa</option>
            </select>
          </div>
        </div>

        {/* Reports Table */}
        <div className="rounded-lg border bg-card">
          <div className="p-6 pb-3">
            <h2 className="text-lg font-semibold">Laudos ({filteredReports.length})</h2>
            <p className="text-sm text-muted-foreground">
              Lista de todos os laudos com status e informações
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr className="text-left text-sm text-muted-foreground">
                  <th className="p-4">Número</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Prioridade</th>
                  <th className="p-4">Placa</th>
                  <th className="p-4">Local</th>
                  <th className="p-4">Policial</th>
                  <th className="p-4">Prazo</th>
                  <th className="p-4">Criado em</th>
                  <th className="p-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-muted-foreground">
                      Nenhum laudo encontrado
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((report) => {
                    const daysCount = getDaysCount(report.assignedAt, report.status)
                    return (
                      <tr key={report.id} className="border-b hover:bg-muted/50">
                        <td className="p-4">
                          <span className="font-mono text-xs border px-2 py-1 rounded">
                            {report.number}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="text-xs px-2 py-1 rounded bg-muted">
                            {STATUS_LABELS[report.status]}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="text-xs px-2 py-1 rounded bg-muted">
                            {PRIORITY_LABELS[report.priority]}
                          </span>
                        </td>
                        <td className="p-4 font-mono font-medium">
                          {report.vehicle?.plate || "-"}
                        </td>
                        <td className="p-4 text-sm">{report.location?.address || "-"}</td>
                        <td className="p-4 text-sm">{getOfficerName(report.assignedTo)}</td>
                        <td className="p-4 text-sm">
                          {daysCount !== null ? (
                            <span className="font-medium">
                              {daysCount === 0 ? "Hoje" : `${daysCount}d`}
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {new Date(report.createdAt).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/agent/reports/${report.id}`}
                              className="inline-flex items-center justify-center rounded-md border px-3 py-1 text-xs hover:bg-muted"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Ver
                            </Link>
                            {(report.status === "PENDING" || report.status === "RECEIVED") && (
                              <button
                                onClick={() => setSelectedReport(report.id)}
                                className="inline-flex items-center justify-center rounded-md border px-3 py-1 text-xs hover:bg-muted"
                              >
                                <UserCheck className="h-3 w-3 mr-1" />
                                Atribuir
                              </button>
                            )}
                            {report.status !== "COMPLETED" &&
                              report.status !== "CANCELLED" && (
                                <button
                                  onClick={() => handleCancelReport(report.id)}
                                  className="inline-flex items-center justify-center rounded-md border px-3 py-1 text-xs text-red-600 hover:bg-red-50"
                                >
                                  <X className="h-3 w-3 mr-1" />
                                  Cancelar
                                </button>
                              )}
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Assign Officer Modal */}
        {selectedReport && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Atribuir Policial</h3>
              <div className="space-y-2 mb-4">
                {officers.map((officer) => (
                  <button
                    key={officer.id}
                    onClick={() => handleAssignOfficer(selectedReport, officer.id)}
                    disabled={isAssigning}
                    className="w-full text-left p-3 border rounded-lg hover:bg-muted disabled:opacity-50"
                  >
                    <p className="font-medium">{officer.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {officer.badge} • {officer.department}
                    </p>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                disabled={isAssigning}
                className="w-full py-2 border rounded-lg hover:bg-muted"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
  )
}
