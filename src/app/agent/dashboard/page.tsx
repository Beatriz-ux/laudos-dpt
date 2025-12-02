import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getDashboardStats } from "@/actions/dashboard/get-stats";
import { getReports } from "@/actions/reports/get-reports";
import { getOfficers } from "@/actions/officers/get-officers";
import { getCurrentUser } from "@/modules/auth";
import { AgentDashboardClient } from "./client";

export const metadata: Metadata = {
  title: "Dashboard do Agente",
  description: "Painel de controle para gerenciamento de laudos",
};

export default async function AgentDashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  if (user.role !== "AGENT") {
    redirect("/officer/dashboard");
  }

  const [statsResponse, reportsResponse, officersResponse] = await Promise.all([
    getDashboardStats(),
    getReports(),
    getOfficers(),
  ]);

  const stats = statsResponse.success && statsResponse.data ? statsResponse.data : null;
  const allReports = reportsResponse.success ? reportsResponse.data : [];
  const recentReports = allReports?.slice(0, 5) || [];
  const officers = officersResponse.success ? officersResponse.data || [] : [];

  return (
    <AgentDashboardClient
      user={user}
      stats={stats}
      recentReports={recentReports}
      officers={officers}
    />
  );
}
