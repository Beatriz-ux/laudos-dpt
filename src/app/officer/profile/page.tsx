import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/modules/auth";
import { OfficerProfileClient } from "./client";

export const metadata: Metadata = {
  title: "Meu Perfil",
  description: "Gerenciar informações do perfil",
};

export default async function OfficerProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  if (user.role !== "OFFICER") {
    redirect("/agent/profile");
  }

  return <OfficerProfileClient user={user} />;
}
