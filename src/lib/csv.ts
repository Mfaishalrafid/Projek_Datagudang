import type { SgaItemDTO, SparepartDTO, UsedGoodsDTO } from "@/lib/types";

const headers = [
  "No",
  "No PJPP",
  "Cabang",
  "Tanggal Lepas Sparepart",
  "Nama Sparepart",
  "Kategori",
  "Nopol",
  "Jenis Mobil",
  "Jenis Mobil Lengkap",
  "Kondisi Sparepart",
  "Lokasi Penyimpanan",
  "Keterangan"
];

const usedGoodsHeaders = [
  "No",
  "Kode Barang",
  "Cabang",
  "Tanggal Input",
  "Nama Barang",
  "Kategori",
  "Qty",
  "Satuan",
  "Estimasi Berat Kg",
  "Estimasi Harga Jual",
  "Kondisi",
  "Lokasi Penyimpanan",
  "PIC",
  "Keterangan"
];

const sgaHeaders = [
  "No",
  "Tanggal Input",
  "Nomor TLS",
  "Cabang",
  "Nama Barang",
  "Jumlah",
  "PIC Input",
  "Status Kelayakan",
  "Status Transaksi",
  "Keterangan"
];

function escapeCsv(value: string | number | null | undefined) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

export function buildSparepartCsv(spareparts: SparepartDTO[]) {
  const rows = spareparts.map((item, index) => [
    index + 1,
    item.pjpp,
    item.branchName,
    item.removedDate ? item.removedDate.slice(0, 10) : "",
    item.name,
    item.categoryLabel,
    item.plateNumber,
    item.vehicleCode,
    item.vehicleTypeLabel,
    item.conditionLabel,
    item.storageLocation,
    item.notes || ""
  ]);

  return [headers, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\n");
}

export function buildUsedGoodsCsv(items: UsedGoodsDTO[]) {
  const rows = items.map((item, index) => [
    index + 1,
    item.code,
    item.branchName,
    item.inputDate.slice(0, 10),
    item.name,
    item.categoryLabel,
    item.qty,
    item.unitLabel,
    item.estimatedWeightKg ?? "",
    item.estimatedPrice ?? "",
    item.conditionLabel,
    item.storageLocation || "",
    item.pic || "",
    item.notes || ""
  ]);

  return [usedGoodsHeaders, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\n");
}

export function buildSgaCsv(items: SgaItemDTO[]) {
  const rows = items.map((item, index) => [
    index + 1,
    item.inputDate.slice(0, 10),
    item.tlsNumber,
    item.branchName,
    item.itemName,
    item.quantity,
    item.picName,
    item.eligibilityStatusLabel,
    item.transactionStatusLabel,
    item.note || ""
  ]);

  return [sgaHeaders, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\n");
}

export function csvDownloadResponse(csv: string, filename: string) {
  return new Response(`\uFEFF${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`
    }
  });
}

export function downloadCsv(csv: string, filename: string) {
  const blob = new Blob([`\uFEFF${csv}`], {
    type: "text/csv;charset=utf-8"
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
