"use client"

import Link from "next/link"
import { Inbox, FileEdit, CheckCircle, AlertTriangle, PlayCircle } from "lucide-react"
import type { User, DashboardStats, Report } from "@/types"
import { PRIORITY_LABELS } from "@/types"
import { useMemo } from "react"

interface OfficerDashboardClientProps {
  user: User
  stats: DashboardStats | null
  myReports: Report[]
}

export function OfficerDashboardClient({
  user,
  stats,
  myReports,
}: OfficerDashboardClientProps) {
  const receivedReports = useMemo(
    () => myReports.filter((r) => r.status === "RECEIVED"),
    [myReports]
  )
  const draftReports = useMemo(
    () => myReports.filter((r) => r.status === "IN_PROGRESS"),
    [myReports]
  )
  const completedReports = useMemo(
    () => myReports.filter((r) => r.status === "COMPLETED"),
    [myReports]
  )

  const getDaysCount = (assignedAt: Date | null | undefined, status: string) => {
    if (!assignedAt || status === "PENDING") return null
    const days = Math.floor(
      (new Date().getTime() - new Date(assignedAt).getTime()) / (1000 * 60 * 60 * 24)
    )
    return days
  }

  const ReportCard = ({ report }: { report: Report }) => {
    const daysCount = getDaysCount(report.assignedAt, report.status)
    return (
      <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs border px-2 py-0.5 rounded">{report.number}</span>
            <span className="text-xs px-2 py-0.5 rounded bg-muted">
              {PRIORITY_LABELS[report.priority]}
            </span>
          </div>
          <p className="text-sm font-medium">{report.vehicle?.plate || "-"}</p>
        </div>
        <div className="flex flex-col items-end space-y-1">
          {daysCount !== null && (
            <p className="text-xs font-medium">
              {daysCount === 0 ? "Hoje" : `${daysCount}d`}
            </p>
          )}
          <Link
            href={`/officer/reports/${report.id}`}
            className="text-xs px-2 py-1 rounded border hover:bg-muted"
          >
            Ver
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Meus Laudos</h1>
          <p className="text-muted-foreground">
            Bem-vindo, {user.name} • {user.badge}
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-lg border bg-card p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">Recebidos</h3>
                <Inbox className="h-4 w-4 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-600">{receivedReports.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Aguardando início</p>
            </div>

            <div className="rounded-lg border bg-card p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">Rascunhos</h3>
                <FileEdit className="h-4 w-4 text-yellow-600" />
              </div>
              <div className="text-2xl font-bold text-yellow-600">{draftReports.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Em andamento</p>
            </div>

            <div className="rounded-lg border bg-card p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">Concluídos</h3>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-600">{completedReports.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Finalizados</p>
            </div>

            <div className="rounded-lg border bg-card p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">Total</h3>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">{stats.myReports || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Meus laudos</p>
            </div>
          </div>
        )}

        {/* Reports by Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Received Reports */}
          <div className="rounded-lg border bg-card">
            <div className="p-6 pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Inbox className="h-5 w-5 text-blue-600" />
                  <h2 className="text-lg font-semibold">Recebidos</h2>
                </div>
                {receivedReports.length > 0 && (
                  <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">
                    {receivedReports.length}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Laudos prontos para iniciar</p>
            </div>
            <div className="p-6 pt-3 space-y-3">
              {receivedReports.length === 0 ? (
                <p className="text-muted-foreground text-center py-4 text-sm">
                  Nenhum laudo recebido
                </p>
              ) : (
                <>
                  {receivedReports.slice(0, 3).map((report) => (
                    <ReportCard key={report.id} report={report} />
                  ))}
                  {receivedReports.length > 3 && (
                    <Link
                      href="/officer/reports/received"
                      className="block w-full text-center py-2 border rounded-lg hover:bg-muted/50 transition-colors text-sm"
                    >
                      Ver Todos ({receivedReports.length})
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Draft Reports */}
          <div className="rounded-lg border bg-card">
            <div className="p-6 pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileEdit className="h-5 w-5 text-yellow-600" />
                  <h2 className="text-lg font-semibold">Rascunhos</h2>
                </div>
                {draftReports.length > 0 && (
                  <span className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-700">
                    {draftReports.length}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Laudos em andamento</p>
            </div>
            <div className="p-6 pt-3 space-y-3">
              {draftReports.length === 0 ? (
                <p className="text-muted-foreground text-center py-4 text-sm">Nenhum rascunho</p>
              ) : (
                <>
                  {draftReports.slice(0, 3).map((report) => (
                    <ReportCard key={report.id} report={report} />
                  ))}
                  {draftReports.length > 3 && (
                    <Link
                      href="/officer/reports/draft"
                      className="block w-full text-center py-2 border rounded-lg hover:bg-muted/50 transition-colors text-sm"
                    >
                      Ver Todos ({draftReports.length})
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Completed Reports */}
          <div className="rounded-lg border bg-card">
            <div className="p-6 pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h2 className="text-lg font-semibold">Concluídos</h2>
                </div>
                {completedReports.length > 0 && (
                  <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700">
                    {completedReports.length}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Laudos finalizados</p>
            </div>
            <div className="p-6 pt-3 space-y-3">
              {completedReports.length === 0 ? (
                <p className="text-muted-foreground text-center py-4 text-sm">
                  Nenhum laudo concluído
                </p>
              ) : (
                <>
                  {completedReports.slice(0, 3).map((report) => (
                    <ReportCard key={report.id} report={report} />
                  ))}
                  {completedReports.length > 3 && (
                    <Link
                      href="/officer/reports/completed"
                      className="block w-full text-center py-2 border rounded-lg hover:bg-muted/50 transition-colors text-sm"
                    >
                      Ver Todos ({completedReports.length})
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
