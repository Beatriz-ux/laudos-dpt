import { redirect } from "next/navigation";
import { getCurrentUser } from "@/modules/auth";
import { getReportById } from "@/actions/reports/get-report-by-id";
import { getOfficers } from "@/actions/officers/get-officers";
import { AgentReportDetailClient } from "./client";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function AgentReportDetailPage({ params }: PageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  if (user.role !== "AGENT") {
    redirect("/officer/dashboard");
  }

  const [reportResponse, officersResponse] = await Promise.all([
    getReportById(params.id),
    getOfficers(),
  ]);

  if (!reportResponse.success || !reportResponse.data) {
    redirect("/agent/reports");
  }

  const officers = officersResponse.success ? officersResponse.data || [] : [];

  return (
    <AgentReportDetailClient
      user={user}
      report={reportResponse.data}
      officers={officers}
    />
  );
}
