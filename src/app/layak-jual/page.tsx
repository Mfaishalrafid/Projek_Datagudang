import { getReportData } from "@/app/actions";
import { BarkasApp } from "@/components/BarkasApp";
import { canAccessSales } from "@/lib/access-control";
import { requirePageUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function LayakJualPage() {
  const user = requirePageUser();
  if (!canAccessSales(user)) redirect("/dashboard");

  const initialData = await getReportData(user);
  return <BarkasApp initialData={initialData} initialPage="penjualan" />;
}
