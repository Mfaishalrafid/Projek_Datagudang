import { describe, expect, it } from "vitest";
import { buildSparepartCsv, buildUsedGoodsCsv } from "@/lib/csv";
import { spareparts, usedGoods } from "../fixtures";

describe("CSV exports", () => {
  it("builds used goods CSV with the required v3 header", () => {
    const csv = buildUsedGoodsCsv([usedGoods[0]]);
    const [header] = csv.split("\n");

    expect(header).toBe(
      '"No","Kode Barang","Cabang","Tanggal Input","Nama Barang","Kategori","Qty","Satuan","Estimasi Berat Kg","Estimasi Harga Jual","Kondisi","Lokasi Penyimpanan","PIC","Keterangan"'
    );
    expect(csv).toContain('"BB-20260521-0001","Sirclo","2026-05-21","Kardus Bekas","Kardus & Karton"');
  });

  it("keeps the existing sparepart CSV header intact", () => {
    const csv = buildSparepartCsv([spareparts[0]]);
    const [header] = csv.split("\n");

    expect(header).toBe(
      '"No","No PJPP","Cabang","Tanggal Lepas Sparepart","Nama Sparepart","Kategori","Nopol","Jenis Mobil","Jenis Mobil Lengkap","Kondisi Sparepart","Lokasi Penyimpanan","Keterangan"'
    );
    expect(csv).toContain('"R3/RJPP/DMS/BON/111/2026"');
  });
});
