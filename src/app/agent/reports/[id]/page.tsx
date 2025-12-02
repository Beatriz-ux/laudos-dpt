import type { Metadata } from "next";
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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const reportResponse = await getReportById(params.id);

  if (reportResponse.success && reportResponse.data) {
    return {
      title: `Laudo ${reportResponse.data.number}`,
      description: `Detalhes do laudo pericial ${reportResponse.data.number}`,
    };
  }

  return {
    title: "Detalhes do Laudo",
    description: "Visualizar detalhes do laudo pericial",
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
