# BARKAS+ Codex Change Log

## 2026-06-08 18:44:23 +07:00

### Request
Optimisasi kode dashboard untuk role pusat dan cabang menggunakan skill `$code-optimization` dan `$change-log-tracker`, dengan fokus pada dashboard, inventori, layak jual, data per cabang, laporan, modul Sparepart, Barang Bekas, SGA, query Prisma, helper reusable, role access, dan branch access.

### Ringkasan Perubahan
- Mengekstrak komponen `Card` reusable dari `BarkasApp.tsx` agar markup card dashboard tetap konsisten dan tidak terikat pada satu file besar.
- Menambahkan `AnalyticsChartCard` reusable untuk menggantikan tiga chart card yang sebelumnya identik untuk Sparepart, Barang Bekas, dan SGA.
- Menambahkan helper `dashboard-analytics` untuk grouping dan tren dashboard/inventori/laporan dengan kalkulasi satu lintasan per dataset.
- Mengganti helper analytics lokal di `BarkasApp.tsx` dengan helper reusable dari `src/lib/dashboard-analytics.ts`.
- Mengoptimalkan kalkulasi statistik `calculateDashboardStatsFromData`, `calculateUsedGoodsStats`, dan `calculateSgaStats` dari beberapa `filter/map/reduce` menjadi satu loop.
- Mengurangi query statistik Prisma:
  - `getUsedGoodsStats()` dari banyak `count/findMany distinct` menjadi satu `findMany select`.
  - `getSgaStats()` dari banyak `count/findMany distinct` menjadi satu `findMany select`.
  - `getDashboardStats()` dari banyak query count/distinct lintas modul menjadi satu query selected rows per modul.
- Menghindari pembacaan ulang data di `getUsedGoodsReportData()` dan `getSgaReportData()` dengan menghitung statistik dari list yang sudah diambil.
- Menambahkan test unit/integration untuk helper analytics dan query statistik dashboard.

### File / Folder yang Diubah
- `src/components/Card.tsx`
- `src/components/AnalyticsChartCard.tsx`
- `src/components/BarkasApp.tsx`
- `src/lib/dashboard-analytics.ts`
- `src/lib/dashboard-stats.ts`
- `src/lib/used-goods-analytics.ts`
- `src/lib/sga-analytics.ts`
- `src/app/actions.ts`
- `tests/unit/dashboard-analytics.test.ts`
- `tests/integration/dashboard-stats-actions.test.ts`
- `tests/integration/used-goods-actions.test.ts`
- `tests/integration/sga-actions.test.ts`
- `docs/CHANGELOG_CODEX.md`

### Jenis Perubahan
- Refactor
- Optimization
- UI Code Cleanup
- API Optimization
- Database Query Optimization
- Documentation

### Business Rules yang Terdampak / Dijaga
- Super Admin dan Admin Pusat tetap bisa melihat semua cabang.
- Admin Cabang dan Karyawan Cabang tetap hanya melihat data sesuai `branchId`.
- Modul utama tetap Sparepart, Barang Bekas, dan SGA.
- SGA tetap memakai Nomor TLS sebagai kode unik; tidak ada Kode SGA tambahan.
- Status transaksi dan status kelayakan tidak diubah.
- Aturan item/order/terjual tidak diubah.
- Tidak ada perubahan schema database, migration, role permission, atau tampilan besar.

### Command yang Dijalankan
- `npm run test` - passed, 122 tests.
- `npm run lint` - passed.
- `npm run typecheck` - passed.
- `npx prisma generate` - passed.
- `npm run build` - passed.

### Checklist Review Manual
- Buka Dashboard Pusat dan pastikan tab Sparepart, Barang Bekas, dan SGA tetap tampil sesuai desain existing.
- Buka Dashboard Cabang dan pastikan hanya data cabang login yang tampil.
- Cek Inventori Semua Cabang / Inventori Cabang untuk ketiga tab modul.
- Cek Data per Cabang dan Laporan untuk memastikan chart/rekap masih sama.
- Cek Layak Jual Sparepart, Barang Bekas, dan SGA untuk memastikan status aksi jual tidak berubah.
- Cek Export CSV yang relevan, terutama SGA dan Barang Bekas.
- Cek role cabang tetap tidak melihat data cabang lain.

### Risiko / Catatan Lanjutan
- `BarkasApp.tsx` masih sangat besar. Refactor aman berikutnya adalah memecah halaman besar seperti Dashboard, Inventori, Cabang, Laporan, dan modal menjadi file terpisah secara bertahap.
- Query statistik sekarang menghitung dari selected rows. Ini mengurangi query fan-out, tetapi untuk data yang sangat besar perlu dipertimbangkan pagination atau agregasi database khusus.
- Full `git diff --stat` masih memuat perubahan dari pekerjaan sebelumnya yang belum dicommit, sehingga review sebaiknya memisahkan commit per request bila memungkinkan.
- Test LoginForm masih menampilkan warning React Testing Library lama tentang prop `action`, tetapi tidak terkait optimasi ini dan semua test tetap passed.
