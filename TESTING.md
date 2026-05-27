# Testing BARKAS+

Dokumen ini mencatat setup test untuk fitur v3 dan v4: Sparepart Ex-Service, Barang Bekas / Material, login, session, role, dan data scope pusat/cabang.

## Command

- `npm run test` menjalankan seluruh test Vitest.
- `npm run test:watch` menjalankan Vitest watch mode.
- `npm run test:unit` menjalankan test unit, integration, dan component yang ada di folder `tests`.
- `npm run lint` menjalankan lint Next.js.
- `npm run typecheck` menjalankan TypeScript check tanpa emit.
- `npm run build` menjalankan build production Next.js.

## Coverage Fitur

Test yang ditambahkan mencakup:

- Seed v3: 30 sparepart, 4 barang bekas awal, cabang tambahan seperti `IGRSMG`, dan split kondisi sparepart.
- Validasi barang bekas: nama, cabang, qty positif, default `inputDate`, condition, category, dan unit.
- Mapper dan tipe DTO barang bekas.
- CSV sparepart lama dan CSV barang bekas dengan header v3.
- Kalkulasi statistik barang bekas: total item, total qty, layak jual, tidak layak, estimasi berat, cabang aktif.
- Server actions barang bekas dengan Prisma mock: list, create, delete, stats, report/export CSV, filter, dan search kategori.
- UI React: tab Dashboard, Inventori, Data per Cabang, Pendataan Barang Bekas, input chooser, modal barang bekas, detail, delete, filter, search, empty state, dan global search.
- Validasi v4: login, branch, user, role, dan pembatasan pembuatan user `SUPER_ADMIN` dari UI/action.
- Permission helper: akses pusat/cabang, menu sidebar berdasarkan role, Layak Jual hanya untuk `SUPER_ADMIN` dan `ADMIN_PUSAT`.
- Branch scope helper: user pusat bisa membaca semua data, user cabang hanya membaca/menulis data `branchId` dari session.
- Server actions v4: user cabang tidak bisa manipulasi `branchId`, `KARYAWAN_CABANG` tidak bisa hapus data, role cabang tidak bisa membuat order jual, dan `ADMIN_PUSAT` tidak bisa mengelola user `SUPER_ADMIN`.
- UI v4: login form, Dashboard Cabang, penyembunyian menu Layak Jual untuk role cabang, dan readonly cabang saat input oleh user cabang.

## Environment

Test saat ini tidak membutuhkan koneksi PostgreSQL karena server actions memakai mock Prisma. Tidak ada test yang menulis ke database development.

Untuk runtime lokal, siapkan:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/barkas_plus?schema=public"
AUTH_SECRET="ganti-dengan-secret-lokal-yang-panjang"
```

Jika nanti ditambahkan integration test database sungguhan, gunakan environment terpisah:

```bash
DATABASE_URL_TEST="postgresql://user:password@localhost:5432/barkas_plus_test"
```

Pastikan test DB berbeda dari `DATABASE_URL` development.

## Command Aman

- `npm run test`
- `npm run test:watch`
- `npm run test:unit`
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npx prisma validate`

## Command yang Tidak Boleh Dijalankan Tanpa Izin

- `prisma migrate reset`
- `npm run db:reset`
- `prisma db push --force-reset`
- Command lain yang menghapus atau reset database utama

## Catatan

- Test component memakai React Testing Library dan jsdom.
- Test action mock `@/lib/prisma` dan `next/cache`, sehingga aman dijalankan tanpa PostgreSQL.
- Playwright belum ditambahkan karena coverage utama v3 sudah tercakup oleh unit, integration, dan component test tanpa dependency E2E tambahan.
