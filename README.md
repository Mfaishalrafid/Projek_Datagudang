# BARKAS+

BARKAS+ adalah aplikasi fullstack pendataan sparepart ex-service dan barang bekas / material INDOPAKET 2026. UI dibuat mengikuti file referensi BARKAS+ dengan sidebar navy, topbar putih, tabel compact, card putih, badge kondisi, drawer/detail modal, input chooser, order jual, export CSV, print, search, dan filter.

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
AUTH_SECRET="ganti-dengan-secret-lokal-yang-panjang"
```

3. Jalankan migration dan seed:

```bash
npx prisma migrate dev
npm run prisma:seed
```

Seed berisi cabang awal, cabang/lokasi tambahan dari data v3, 30 sparepart dari array `DB`, 4 barang bekas dari array `BB` referensi, dan akun demo v4 dengan password yang tersimpan sebagai hash.

- `SPI RANGKASBITUNG`
- `IGR CIPUTAT`
- `IGR CIKOKOL`
- `IGRSMG`
- `Sirclo`
- `GW Cargo TGR`
- `GW Ecomm`
- `HUB JKT 1`

Jumlah awal setelah seed:

- 30 sparepart
- 6 `LAYAK JUAL`
- 24 `RUSAK`
- 4 barang bekas

Akun demo setelah seed:

- `superadmin@barkas.local` / `SuperAdmin123!`
- `adminpusat@barkas.local` / `AdminPusat123!`
- `admin.ciputat@barkas.local` / `AdminCabang123!`
- `karyawan.ciputat@barkas.local` / `Karyawan123!`

Ganti password demo sebelum dipakai untuk data operasional.

4. Jalankan aplikasi:

```bash
npm run dev
```

Buka `http://localhost:3000`.

## Fitur

- Login, logout, session cookie, dan role `SUPER_ADMIN`, `ADMIN_PUSAT`, `ADMIN_CABANG`, `KARYAWAN_CABANG`.
- Dashboard Pusat untuk `SUPER_ADMIN` dan `ADMIN_PUSAT`; Dashboard Cabang untuk role cabang.
- Data scope pusat/cabang di server action dan API route, sehingga user cabang hanya memakai `branchId` dari session.
- Manajemen cabang dasar dan manajemen user dasar sesuai batasan role.
- Dashboard stat dan distribusi kondisi, cabang, kategori, jenis kendaraan.
- Pendataan sparepart dengan search, filter kondisi/kategori/cabang/jenis kendaraan, tambah, edit, hapus, drawer detail.
- Pendataan barang bekas dengan statistik, filter kondisi/kategori/cabang, search, detail, tambah, hapus.
- Inventori & Stok dengan rekap kategori, cabang, dan jenis kendaraan.
- Inventori barang bekas dengan rekap kategori, cabang, dan satuan.
- Layak Jual dengan form order jual dan pipeline status `Approval`, `Terjual`, `Batal`.
- Data per Cabang dengan tab sparepart dan barang bekas.
- Laporan & Analitik dengan rekap kategori/cabang, tren bulanan, tabel lengkap.
- Export CSV sparepart di `/api/export`.
- Export CSV barang bekas di `/api/export/used-goods`.
- Print mode otomatis menyembunyikan sidebar, topbar, modal, drawer, toast, dan action button.

Role cabang tidak melihat menu Layak Jual dan tidak bisa membuat order jual dari server action/API.

## Server Actions

Fungsi utama ada di `src/app/actions.ts`:

- `loginAction(formData)`
- `logoutAction()`
- `getDashboardStats()`
- `listSpareparts(filters)`
- `createSparepart(data)`
- `updateSparepart(id, data)`
- `deleteSparepart(id)`
- `listSaleableSpareparts()`
- `createSaleOrder(data)`
- `listSaleOrders()`
- `getReportData()`
- `listUsedGoods(filters)`
- `createUsedGoods(data)`
- `deleteUsedGoods(id)`
- `getUsedGoodsStats()`
- `getUsedGoodsReportData()`
- `exportUsedGoodsCsv()`
- `createBranch(data)`
- `updateBranch(id, data)`
- `createUser(data)`
- `updateUser(id, data)`
- `resetUserPassword(id, data)`

## Validasi

Validasi form dan server memakai Zod di `src/lib/validations.ts`. Field wajib untuk tambah sparepart mengikuti requirement: `pjpp`, `nama`, `nopol`, dan `cabang`. `vehicleType` otomatis mengikuti `vehicleCode`:

- `CDE` -> `ENGKEL`
- `CDD` -> `DOUBLE`
- `BV` -> `BLIND VAN`
- `L300` -> `L300`

Validasi barang bekas mewajibkan `inputDate`, `branchId`, `name`, `category`, `condition`, `qty > 0`, dan `unit`. Jika tanggal input kosong pada server action, default-nya tanggal hari ini.
