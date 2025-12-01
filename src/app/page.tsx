import { redirect } from "next/navigation"
import { getCurrentUser } from "@/modules/auth"

export default async function Home() {
  const user = await getCurrentUser()

  if (user) {
    // Redireciona para o dashboard apropriado baseado na role
    if (user.role === "AGENT") {
      redirect("/agent/dashboard")
    } else if (user.role === "OFFICER") {
      redirect("/officer/dashboard")
    }
  }

  // Se não estiver logado, redireciona para login
  redirect("/auth/login")
}
