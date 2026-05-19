import type { SparepartDTO } from "@/lib/types";

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
