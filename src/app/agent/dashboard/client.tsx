"use client"

import Link from "next/link"
import { Plus, FileText, Clock, CheckCircle, AlertTriangle, Users } from "lucide-react"
import type { User, DashboardStats, Report } from "@/types"
import { STATUS_LABELS, PRIORITY_LABELS } from "@/types"

interface AgentDashboardClientProps {
  user: User
  stats: DashboardStats | null
  recentReports: Report[]
}

export function AgentDashboardClient({
  user,
  stats,
  recentReports,
}: AgentDashboardClientProps) {
  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "-"
    return new Date(date).toLocaleDateString("pt-BR")
  }

  const getDaysCount = (assignedAt: Date | null | undefined, status: string) => {
    if (!assignedAt || status === "PENDING") return null
    const days = Math.floor(
      (new Date().getTime() - new Date(assignedAt).getTime()) / (1000 * 60 * 60 * 24)
    )
    return days
  }

  return (
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">
              Bem-vindo, {user.name} • Central de Controle
            </p>
          </div>
          <Link
            href="/agent/reports/create"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Laudo
          </Link>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-lg border bg-card p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">Total de Laudos</h3>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">{stats.totalReports}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Todos os laudos no sistema
              </p>
            </div>

            <div className="rounded-lg border bg-card p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">Pendentes</h3>
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingReports}</div>
              <p className="text-xs text-muted-foreground mt-1">Aguardando atribuição</p>
            </div>

            <div className="rounded-lg border bg-card p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">Em Andamento</h3>
                <AlertTriangle className="h-4 w-4 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-600">{stats.inProgressReports}</div>
              <p className="text-xs text-muted-foreground mt-1">Sendo processados</p>
            </div>

            <div className="rounded-lg border bg-card p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">Concluídos</h3>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-600">{stats.completedReports}</div>
              <p className="text-xs text-muted-foreground mt-1">Finalizados este mês</p>
            </div>
          </div>
        )}

        {/* Recent Reports & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Reports */}
          <div className="rounded-lg border bg-card">
            <div className="p-6 pb-3">
              <h2 className="text-lg font-semibold">Laudos Recentes</h2>
              <p className="text-sm text-muted-foreground">
                Últimos laudos criados no sistema
              </p>
            </div>
            <div className="p-6 pt-3 space-y-4">
              {recentReports.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Nenhum laudo encontrado
                </p>
              ) : (
                <>
                  {recentReports.map((report) => {
                    const daysCount = getDaysCount(report.assignedAt, report.status)
                    return (
                      <Link
                        key={report.id}
                        href={`/agent/reports/${report.id}`}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs border px-2 py-0.5 rounded">
                              {report.number}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded bg-muted">
                              {STATUS_LABELS[report.status]}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded bg-muted">
                              {PRIORITY_LABELS[report.priority]}
                            </span>
                          </div>
                          <p className="text-sm font-medium">{report.vehicle?.plate || "-"}</p>
                          <p className="text-xs text-muted-foreground">
                            {report.location?.address || "-"}
                          </p>
                        </div>
                        <div className="text-right space-y-1">
                          {daysCount !== null && (
                            <p className="text-xs font-medium">
                              {daysCount === 0 ? "Hoje" : `${daysCount}d`}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {formatDate(report.createdAt)}
                          </p>
                        </div>
                      </Link>
                    )
                  })}
                  <Link
                    href="/agent/reports"
                    className="block w-full text-center py-2 border rounded-lg hover:bg-muted/50 transition-colors text-sm"
                  >
                    Ver Todos os Laudos
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-lg border bg-card">
            <div className="p-6 pb-3">
              <h2 className="text-lg font-semibold">Ações Rápidas</h2>
              <p className="text-sm text-muted-foreground">
                Acesso rápido às funcionalidades principais
              </p>
            </div>
            <div className="p-6 pt-3 space-y-3">
              <Link
                href="/agent/reports/create"
                className="flex items-center justify-start w-full p-4 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Plus className="h-5 w-5 mr-3" />
                Criar Novo Laudo
              </Link>

              <Link
                href="/agent/reports"
                className="flex items-center justify-start w-full p-4 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <FileText className="h-5 w-5 mr-3" />
                Gerenciar Laudos
              </Link>

              <Link
                href="/agent/officers"
                className="flex items-center justify-start w-full p-4 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <Users className="h-5 w-5 mr-3" />
                Gerenciar Policiais
              </Link>
            </div>
          </div>
        </div>
      </div>
  )
}
