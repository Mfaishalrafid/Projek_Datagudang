import { buildSgaCsv, csvDownloadResponse } from "@/lib/csv";
import { applyBranchScope, canAccessSga, canExportData } from "@/lib/access-control";
import { getSessionUser } from "@/lib/auth";
import { toSgaItemDTO } from "@/lib/mappers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = getSessionUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  if (!canExportData(user) || !canAccessSga(user)) return new Response("Forbidden", { status: 403 });

  const items = await prisma.sgaItem.findMany({
    where: applyBranchScope(user, {}),
    include: {
      branch: true
    },
    orderBy: [{ inputDate: "desc" }, { createdAt: "desc" }, { tlsNumber: "asc" }]
  });

  const csv = buildSgaCsv(items.map(toSgaItemDTO));

  return csvDownloadResponse(csv, "BARKAS+_SGA_2026.csv");
}
