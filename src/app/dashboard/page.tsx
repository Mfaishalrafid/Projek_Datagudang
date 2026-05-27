import { getReportData } from "@/app/actions";
import { requirePageUser } from "@/lib/auth";
import { BarkasApp } from "@/components/BarkasApp";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = requirePageUser();
  const initialData = await getReportData(user);
  return <BarkasApp initialData={initialData} />;
}
