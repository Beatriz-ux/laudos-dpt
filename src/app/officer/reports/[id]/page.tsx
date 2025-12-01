import { redirect } from "next/navigation";
import { getCurrentUser } from "@/modules/auth";
import { getReportById } from "@/actions/reports/get-report-by-id";
import { OfficerReportDetailClient } from "./client";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function OfficerReportDetailPage({ params }: PageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  if (user.role !== "OFFICER") {
    redirect("/agent/dashboard");
  }

  const reportResponse = await getReportById(params.id);

  if (!reportResponse.success || !reportResponse.data) {
    redirect("/officer/reports/received");
  }

  return <OfficerReportDetailClient user={user} report={reportResponse.data} />;
}
