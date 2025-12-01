import { redirect } from "next/navigation"
import { getDashboardStats } from "@/actions/dashboard/get-stats"
import { getReports } from "@/actions/reports/get-reports"
import { getCurrentUser } from "@/modules/auth"
import { OfficerDashboardClient } from "./client"

export default async function OfficerDashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  if (user.role !== "OFFICER") {
    redirect("/agent/dashboard")
  }

  const [statsResponse, reportsResponse] = await Promise.all([
    getDashboardStats(user.id),
    getReports(user.id),
  ])

  const stats = statsResponse.success ? statsResponse.data : null
  const myReports = reportsResponse.success ? reportsResponse.data : []

  return <OfficerDashboardClient user={user} stats={stats} myReports={myReports || []} />
}
