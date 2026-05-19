import { buildSparepartCsv } from "@/lib/csv";
import { toSparepartDTO } from "@/lib/mappers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const spareparts = await prisma.sparepart.findMany({
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
