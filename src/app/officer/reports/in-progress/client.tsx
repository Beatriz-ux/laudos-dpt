"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Edit, Eye, FileEdit, Search } from "lucide-react"
import type { User, Report } from "@/types"
import { PRIORITY_LABELS } from "@/types"

interface OfficerReportsInProgressClientProps {
  user: User
  reports: Report[]
}

export function OfficerReportsInProgressClient({
  user,
  reports,
}: OfficerReportsInProgressClientProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL")

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesSearch =
        !searchQuery ||
        report.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.vehicle?.plate?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.vehicle?.chassi?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.location?.address?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesPriority = priorityFilter === "ALL" || report.priority === priorityFilter

      return matchesSearch && matchesPriority
    })
  }, [reports, searchQuery, priorityFilter])

  const getDaysCount = (assignedAt: Date | null | undefined) => {
    if (!assignedAt) return null
    const days = Math.floor(
      (new Date().getTime() - new Date(assignedAt).getTime()) / (1000 * 60 * 60 * 24)
    )
    return days
  }

  return (
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileEdit className="h-8 w-8 text-orange-600" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Laudos Em Andamento</h1>
              <p className="text-muted-foreground">Laudos sendo preenchidos</p>
            </div>
          </div>
          <span className="text-lg px-3 py-1 rounded bg-orange-100 text-orange-700 font-medium">
            {filteredReports.length} em andamento
          </span>
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
            <h2 className="text-lg font-semibold">Laudos Em Andamento ({filteredReports.length})</h2>
            <p className="text-sm text-muted-foreground">
              Continue o preenchimento dos seus laudos
            </p>
          </div>
          <div className="overflow-x-auto">
            {filteredReports.length === 0 ? (
              <div className="text-center py-12">
                <FileEdit className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Nenhum laudo em andamento
                </h3>
                <p className="text-muted-foreground">
                  Você não possui laudos em andamento no momento
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left text-sm text-muted-foreground">
                    <th className="p-4">Número</th>
                    <th className="p-4">Prioridade</th>
                    <th className="p-4">Placa</th>
                    <th className="p-4">Local</th>
                    <th className="p-4">Iniciado há</th>
                    <th className="p-4">Criado em</th>
                    <th className="p-4">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map((report) => {
                    const daysCount = getDaysCount(report.assignedAt)
                    return (
                      <tr key={report.id} className="border-b hover:bg-muted/50">
                        <td className="p-4">
                          <span className="font-mono text-xs border px-2 py-1 rounded">
                            {report.number}
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
                        <td className="p-4 text-sm">
                          {daysCount !== null ? (
                            <span className="font-medium">
                              {daysCount === 0 ? "Hoje" : `${daysCount} dias`}
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
                              href={`/officer/reports/${report.id}`}
                              className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-1 text-xs text-primary-foreground hover:bg-primary/90"
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Continuar
                            </Link>
                            <Link
                              href={`/officer/reports/${report.id}`}
                              className="inline-flex items-center justify-center rounded-md border px-3 py-1 text-xs hover:bg-muted"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Ver
                            </Link>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
  )
}
