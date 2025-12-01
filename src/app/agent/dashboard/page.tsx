import { redirect } from "next/navigation"
import { getDashboardStats } from "@/actions/dashboard/get-stats"
import { getReports } from "@/actions/reports/get-reports"
import { getCurrentUser } from "@/modules/auth"
import { AgentDashboardClient } from "./client"

export default async function AgentDashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  if (user.role !== "AGENT") {
    redirect("/officer/dashboard")
  }

  const [statsResponse, reportsResponse] = await Promise.all([
    getDashboardStats(),
    getReports(),
  ])

  const stats = statsResponse.success ? statsResponse.data : null
  const allReports = reportsResponse.success ? reportsResponse.data : []
  const recentReports = allReports?.slice(0, 5) || []

  return (
    <AgentDashboardClient
      user={user}
      stats={stats}
      recentReports={recentReports}
    />
  )
}
