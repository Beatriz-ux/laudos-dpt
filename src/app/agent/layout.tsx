import { redirect } from "next/navigation"
import { getCurrentUser } from "@/modules/auth"
import { Sidebar } from "@/components/sidebar"

export default async function AgentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  if (user.role !== "AGENT") {
    redirect("/officer/dashboard")
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar user={user} />
      <main className="flex-1 overflow-y-auto bg-background">
        {children}
      </main>
    </div>
  )
}
