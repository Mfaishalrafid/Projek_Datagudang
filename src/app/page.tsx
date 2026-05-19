import { getReportData } from "@/app/actions";
import { BarkasApp } from "@/components/BarkasApp";

export const dynamic = "force-dynamic";

export default async function Home() {
  const initialData = await getReportData();
  return <BarkasApp initialData={initialData} />;
}
