import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/modules/auth";
import { AgentProfileClient } from "./client";

export const metadata: Metadata = {
  title: "Meu Perfil",
  description: "Gerenciar informações do perfil",
};

export default async function AgentProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  if (user.role !== "AGENT") {
    redirect("/officer/profile");
  }

  return <AgentProfileClient user={user} />;
}
