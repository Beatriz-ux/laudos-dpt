import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getReports } from "@/actions/reports/get-reports"
import { getCurrentUser } from "@/modules/auth"
import { OfficerReportsReceivedClient } from "./client"

export const metadata: Metadata = {
  title: "Laudos Recebidos",
  description: "Laudos atribuídos aguardando início",
}

export default async function OfficerReportsReceivedPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  if (user.role !== "OFFICER") {
    redirect("/agent/dashboard")
  }

  const reportsResponse = await getReports(user.id)
  const allReports = reportsResponse.success ? reportsResponse.data : []
  const receivedReports = allReports?.filter((r) => r.status === "RECEIVED") || []

  return <OfficerReportsReceivedClient user={user} reports={receivedReports} />
}
