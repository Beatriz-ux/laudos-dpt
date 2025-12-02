import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/modules/auth";
import { getReports } from "@/actions/reports/get-reports";
import { OfficerReportsInProgressClient } from "./client";

export const metadata: Metadata = {
  title: "Laudos em Andamento",
  description: "Laudos sendo preenchidos",
};

export default async function OfficerReportsInProgressPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  if (user.role !== "OFFICER") {
    redirect("/agent/dashboard");
  }

  const reportsResponse = await getReports(user.id);
  const allReports = reportsResponse.success ? reportsResponse.data || [] : [];

  // Filter only IN_PROGRESS reports
  const inProgressReports = allReports.filter(
    (report) => report.status === "IN_PROGRESS"
  );

  return (
    <OfficerReportsInProgressClient user={user} reports={inProgressReports} />
  );
}
