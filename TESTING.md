# Testing BARKAS+

Dokumen ini mencatat setup test untuk fitur v3: Sparepart Ex-Service + Barang Bekas / Material.

## Command

- `npm run test` menjalankan seluruh test Vitest.
- `npm run test:watch` menjalankan Vitest watch mode.
- `npm run test:unit` menjalankan test unit, integration, dan component yang ada di folder `tests`.
- `npm run lint` menjalankan lint Next.js.
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

## Environment

Test saat ini tidak membutuhkan koneksi PostgreSQL karena server actions memakai mock Prisma. Tidak ada test yang menulis ke database development.

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
