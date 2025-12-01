import { redirect } from "next/navigation"
import { getOfficers } from "@/actions/officers/get-officers"
import { getCurrentUser } from "@/modules/auth"
import { AgentOfficersClient } from "./client"

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
