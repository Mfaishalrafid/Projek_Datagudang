import { buildUsedGoodsCsv } from "@/lib/csv";
import { toUsedGoodsDTO } from "@/lib/mappers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const items = await prisma.usedGoods.findMany({
    include: {
      branch: true
    },
    orderBy: [{ inputDate: "desc" }, { createdAt: "desc" }, { name: "asc" }]
  });

  const csv = buildUsedGoodsCsv(items.map(toUsedGoodsDTO));

  return new Response(`\uFEFF${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="BARKAS+_Barang_Bekas_2026.csv"'
    }
  });
}
