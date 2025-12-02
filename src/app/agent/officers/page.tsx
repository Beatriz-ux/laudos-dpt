import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getOfficers } from "@/actions/officers/get-officers"
import { getCurrentUser } from "@/modules/auth"
import { AgentOfficersClient } from "./client"

export const metadata: Metadata = {
  title: "Gerenciar Policiais",
  description: "Gerenciar policiais e peritos do sistema",
}

export default async function AgentOfficersPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  if (user.role !== "AGENT") {
    redirect("/officer/dashboard")
  }

  const officersResponse = await getOfficers()
  const officers = officersResponse.success ? officersResponse.data : []

  return <AgentOfficersClient user={user} officers={officers || []} />
}
