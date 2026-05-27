import { buildSparepartCsv } from "@/lib/csv";
import { applyBranchScope, canExportData } from "@/lib/access-control";
import { getSessionUser } from "@/lib/auth";
import { toSparepartDTO } from "@/lib/mappers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = getSessionUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  if (!canExportData(user)) return new Response("Forbidden", { status: 403 });

  const spareparts = await prisma.sparepart.findMany({
    where: applyBranchScope(user, {}),
    include: {
      branch: true
    },
    orderBy: [{ removedDate: "desc" }, { createdAt: "desc" }, { name: "asc" }]
  });

  const csv = buildSparepartCsv(spareparts.map(toSparepartDTO));

  return new Response(`\uFEFF${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="BARKAS+_Indopaket_2026.csv"'
    }
  });
}
