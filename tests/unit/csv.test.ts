import { describe, expect, it } from "vitest";
import { buildSgaCsv, buildSparepartCsv, buildUsedGoodsCsv, csvDownloadResponse } from "@/lib/csv";
import { sgaItems, spareparts, usedGoods } from "../fixtures";

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

  it("builds SGA CSV with the required v5 header", () => {
    const csv = buildSgaCsv([sgaItems[0]]);
    const [header] = csv.split("\n");

    expect(header).toBe(
      '"No","Tanggal Input","Nomor TLS","Cabang","Nama Barang","Jumlah","PIC Input","Status Kelayakan","Status Transaksi","Keterangan"'
    );
    expect(csv).toContain('"2026-05-23","TLS-2026-001","Sirclo","Meja kantor bekas","5","Ardi","LAYAK JUAL","Tersedia"');
  });

  it("builds a consistent CSV download response", async () => {
    const response = csvDownloadResponse("a,b", "report.csv");

    expect(response.headers.get("Content-Type")).toBe("text/csv; charset=utf-8");
    expect(response.headers.get("Content-Disposition")).toBe('attachment; filename="report.csv"');
    const bytes = new Uint8Array(await response.arrayBuffer());
    expect(Array.from(bytes.slice(0, 3))).toEqual([0xef, 0xbb, 0xbf]);
    expect(new TextDecoder().decode(bytes.slice(3))).toBe("a,b");
  });
});
