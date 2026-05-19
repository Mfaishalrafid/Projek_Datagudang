# BARKAS+

BARKAS+ adalah aplikasi fullstack pendataan sparepart ex-service INDOPAKET 2026. UI dibuat mengikuti file referensi `BARKAS_Plus_Dashboard.html`: sidebar navy, topbar putih, tabel compact, card putih, badge kondisi, drawer detail, modal input, order jual, export CSV, print, search, dan filter.

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL
- Zod validation
- Server Actions dan API route CSV

## Setup

1. Install dependency:

```bash
npm install
```

2. Buat file `.env` dari `.env.example`, lalu isi koneksi PostgreSQL:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/barkas_plus?schema=public"
```

3. Jalankan migration dan seed:

```bash
npm run prisma:migrate -- --name init
npm run prisma:seed
```

Seed berisi 3 cabang awal dan 19 sparepart dari array `DB` referensi:

- `SPI RANGKASBITUNG`
- `IGR CIPUTAT`
- `IGR CIKOKOL`

Jumlah awal setelah seed:

- 19 sparepart
- 6 `LAYAK JUAL`
- 13 `RUSAK`

4. Jalankan aplikasi:

```bash
npm run dev
```

Buka `http://localhost:3000`.

## Fitur

- Dashboard stat dan distribusi kondisi, cabang, kategori, jenis kendaraan.
- Pendataan sparepart dengan search, filter kondisi/kategori/cabang/jenis kendaraan, tambah, edit, hapus, drawer detail.
- Inventori & Stok dengan rekap kategori, cabang, dan jenis kendaraan.
- Layak Jual dengan form order jual dan pipeline status `Approval`, `Terjual`, `Batal`.
- Data per Cabang dengan ringkasan, kategori dominan, dan daftar sparepart.
- Laporan & Analitik dengan rekap kategori/cabang, tren bulanan, tabel lengkap.
- Export CSV di `/api/export`.
- Print mode otomatis menyembunyikan sidebar, topbar, modal, drawer, toast, dan action button.

## Server Actions

Fungsi utama ada di `src/app/actions.ts`:

- `getDashboardStats()`
- `listSpareparts(filters)`
- `createSparepart(data)`
- `updateSparepart(id, data)`
- `deleteSparepart(id)`
- `listSaleableSpareparts()`
- `createSaleOrder(data)`
- `listSaleOrders()`
- `getReportData()`

## Validasi

Validasi form dan server memakai Zod di `src/lib/validations.ts`. Field wajib untuk tambah sparepart mengikuti requirement: `pjpp`, `nama`, `nopol`, dan `cabang`. `vehicleType` otomatis mengikuti `vehicleCode`:

- `CDE` -> `ENGKEL`
- `CDD` -> `DOUBLE`
- `BV` -> `BLIND VAN`
- `L300` -> `L300`
