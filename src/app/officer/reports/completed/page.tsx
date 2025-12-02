import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/modules/auth";
import { getReports } from "@/actions/reports/get-reports";
import { OfficerReportsCompletedClient } from "./client";

export const metadata: Metadata = {
  title: "Laudos Concluídos",
  description: "Laudos finalizados",
};

export default async function OfficerReportsCompletedPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  if (user.role !== "OFFICER") {
    redirect("/agent/dashboard");
  }

  const reportsResponse = await getReports(user.id);
  const allReports = reportsResponse.success ? reportsResponse.data || [] : [];

  // Filter only COMPLETED reports
  const completedReports = allReports.filter(
    (report) => report.status === "COMPLETED"
  );

  return (
    <OfficerReportsCompletedClient user={user} reports={completedReports} />
  );
}
