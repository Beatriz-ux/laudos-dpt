import { redirect } from "next/navigation"
import { getReports } from "@/actions/reports/get-reports"
import { getOfficers } from "@/actions/officers/get-officers"
import { getCurrentUser } from "@/modules/auth"
import { AgentReportsClient } from "./client"

export default async function AgentReportsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  if (user.role !== "AGENT") {
    redirect("/officer/dashboard")
  }

  const [reportsResponse, officersResponse] = await Promise.all([
    getReports(),
    getOfficers(),
  ])

  const reports = reportsResponse.success ? reportsResponse.data : []
  const officers = officersResponse.success ? officersResponse.data : []

  return <AgentReportsClient user={user} reports={reports || []} officers={officers || []} />
}
