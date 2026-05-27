# PRD — BARKAS+ v4 Multi-Branch Auth & Access Control

## 1. Ringkasan Produk

BARKAS+ adalah aplikasi internal INDOPAKET untuk mengelola data sparepart ex-service dan barang bekas/material dari banyak cabang.

Versi saat ini sudah mendukung:
- Dashboard
- Pendataan sparepart
- Pendataan barang bekas/material
- Inventori
- Layak jual
- Data per cabang
- Laporan
- Export CSV
- Testing TDD untuk fitur v3

Update v4 ini fokus pada:
- Login
- Role user
- Pemisahan akses pusat dan cabang
- Dashboard pusat dan dashboard cabang
- Manajemen cabang
- Manajemen user dasar

## 2. Tujuan Update v4

Tujuan utama update ini adalah membuat aplikasi siap digunakan oleh pusat dan cabang dengan akses yang aman.

Target:
1. User wajib login sebelum masuk dashboard.
2. Role menentukan menu, fitur, dan data yang boleh diakses.
3. Admin pusat dapat mengakses semua data operasional semua cabang.
4. User cabang hanya dapat melihat dan mengelola data cabangnya sendiri.
5. Cabang tidak boleh bisa mengakses data cabang lain, baik dari UI maupun server action/API.
6. Data cabang tidak lagi hardcode, tetapi dikelola melalui master cabang.
7. Dashboard pusat menjadi command center untuk monitoring semua cabang.
8. Dashboard cabang menjadi panel operasional untuk cabang sendiri.
9. Fitur Layak Jual / Order Jual hanya tersedia untuk role pusat.

## 3. Non-Goals / Tidak Dikerjakan Dulu

Untuk menjaga scope tetap aman, jangan implement fitur berikut pada update ini:

- Approval workflow
- Audit log lengkap
- Backup/restore database
- Multi-tenant per perusahaan
- Notifikasi email/WhatsApp
- Upload foto barang
- Export Excel multi-sheet
- Mobile app native
- Redesign besar-besaran
- Perubahan style total dari design BARKAS+ existing
- Integrasi payment atau penjualan eksternal

Jika ada kebutuhan kecil yang berhubungan dengan fitur di atas, buat placeholder atau catatan TODO saja.

## 4. Role User

Role yang digunakan hanya 4:

```ts
SUPER_ADMIN
ADMIN_PUSAT
ADMIN_CABANG
KARYAWAN_CABANG
```

## 5. Definisi Hak Akses per Role

### 5.1 SUPER_ADMIN

Role tertinggi untuk owner, tim IT core, CEO, direksi, atau pengelola utama sistem.

Akses:
- Dapat mengakses semua fitur dan data di sistem.
- Dapat melihat dashboard pusat dan dashboard cabang mana pun.
- Dapat melihat, membuat, mengedit, menonaktifkan, dan mengelola semua cabang.
- Dapat melihat, membuat, mengedit, menonaktifkan, dan reset password semua user.
- Dapat mengubah role user, termasuk role pusat dan cabang.
- Dapat mengakses fitur Layak Jual / Order Jual untuk semua cabang.
- Dapat export semua laporan.
- Dapat mengakses setting sistem jika fitur ini tersedia.
- Tidak terikat pada cabang tertentu.

Batasan:
- Jangan membuat fitur untuk membuat SUPER_ADMIN baru dari UI pada update v4.
- SUPER_ADMIN awal dibuat melalui seed/manual database.

### 5.2 ADMIN_PUSAT

Role operasional pusat. Sesuai permintaan klien, Admin Pusat memiliki akses all untuk kebutuhan operasional, tetapi bukan akses sistem tertinggi.

Akses:
- Hanya masuk ke dashboard pusat.
- Dapat melihat semua cabang.
- Dapat melihat semua data sparepart, barang bekas/material, inventori, laporan, dan data per cabang.
- Dapat input sparepart dan barang bekas untuk semua cabang.
- Dapat edit data operasional semua cabang.
- Dapat hapus/arsip data operasional sesuai aturan aplikasi.
- Dapat mengakses fitur Layak Jual / Order Jual untuk semua cabang.
- Dapat export semua laporan.
- Dapat menambah, mengedit, dan menonaktifkan cabang untuk kebutuhan operasional.
- Dapat melihat dan mengelola user cabang/admin biasa.
- Dapat reset password user cabang/admin biasa.
- Dapat mengatur branch user cabang.

Batasan:
- Tidak boleh membuat user dengan role SUPER_ADMIN.
- Tidak boleh melihat detail sensitif user SUPER_ADMIN.
- Tidak boleh mengubah, menonaktifkan, menghapus, atau reset password user SUPER_ADMIN.
- Tidak boleh mengubah role user menjadi SUPER_ADMIN.
- Tidak boleh mengakses setting sistem sensitif.
- Tidak boleh menghapus permanen cabang.
- Tidak boleh reset database.

### 5.3 ADMIN_CABANG

Role pengelola cabang/PIC cabang. Semua akses dibatasi hanya untuk cabang miliknya.

Akses:
- Hanya boleh mengakses dashboard cabang yang menjadi miliknya.
- Hanya dapat melihat data sparepart, barang bekas/material, inventori, dan laporan dari cabangnya sendiri.
- Dapat input sparepart dan barang bekas untuk cabangnya sendiri.
- Dapat edit data cabangnya sendiri sesuai aturan aplikasi.
- Dapat hapus/arsip data cabangnya sendiri jika belum dikunci pusat.
- Dapat export laporan cabangnya sendiri.
- Dapat melihat user KARYAWAN_CABANG di cabangnya sendiri jika fitur ini diaktifkan.
- Dapat membuat dan reset password KARYAWAN_CABANG untuk cabangnya sendiri jika fitur ini diaktifkan.

Batasan:
- Tidak boleh melihat data cabang lain.
- Tidak boleh input data untuk cabang lain.
- Tidak boleh mengubah branchId user.
- Tidak boleh memindahkan user ke cabang lain.
- Tidak boleh mengubah role user menjadi ADMIN_PUSAT atau SUPER_ADMIN.
- Tidak boleh mengelola ADMIN_CABANG cabang lain.
- Tidak boleh mengubah data master cabang seperti nama, kode, alamat, lokasi, atau status cabang.
- Tidak boleh melihat dashboard pusat.
- Tidak boleh mengakses menu Layak Jual / Order Jual.
- Tidak boleh membuat order jual.

### 5.4 KARYAWAN_CABANG

Role operasional harian di level cabang. Akses paling terbatas.

Akses:
- Hanya boleh mengakses dashboard cabang yang menjadi miliknya.
- Hanya dapat melihat data cabang sendiri.
- Dapat input sparepart dan barang bekas untuk cabangnya sendiri.
- Dapat edit data yang dia input sendiri jika aturan aplikasi mengizinkan.

Batasan:
- Tidak boleh melihat data cabang lain.
- Tidak boleh melihat user mana pun.
- Tidak boleh melakukan CRUD user.
- Tidak boleh mengubah data cabang.
- Tidak boleh hapus data.
- Tidak boleh export laporan besar/global.
- Tidak boleh melihat dashboard pusat.
- Tidak boleh mengakses menu Layak Jual / Order Jual.
- Tidak boleh membuat order jual.

## 6. Permission Matrix

| Fitur | SUPER_ADMIN | ADMIN_PUSAT | ADMIN_CABANG | KARYAWAN_CABANG |
|---|---:|---:|---:|---:|
| Login/logout | Ya | Ya | Ya | Ya |
| Dashboard pusat | Ya | Ya | Tidak | Tidak |
| Dashboard cabang sendiri | Ya | Ya | Ya | Ya |
| Lihat semua cabang | Ya | Ya | Tidak | Tidak |
| Lihat data cabang sendiri | Ya | Ya | Ya | Ya |
| Lihat data semua cabang | Ya | Ya | Tidak | Tidak |
| Input sparepart | Semua cabang | Semua cabang | Cabang sendiri | Cabang sendiri |
| Input barang bekas | Semua cabang | Semua cabang | Cabang sendiri | Cabang sendiri |
| Edit data | Semua | Semua | Cabang sendiri | Data sendiri terbatas |
| Hapus/arsip data | Ya | Ya | Terbatas cabang sendiri | Tidak |
| Menu Layak Jual | Ya | Ya | Tidak | Tidak |
| Buat order jual | Ya | Ya | Tidak | Tidak |
| Export semua laporan | Ya | Ya | Tidak | Tidak |
| Export laporan cabang sendiri | Ya | Ya | Ya | Tidak |
| Kelola cabang | Ya | Ya, operasional | Tidak | Tidak |
| Kelola user | Semua user | User cabang/admin biasa | Karyawan cabang sendiri, opsional | Tidak |
| Reset password | Semua user | User cabang/admin biasa | Karyawan cabang sendiri, opsional | Tidak |
| Setting sistem | Ya | Tidak | Tidak | Tidak |

### Catatan Fitur Layak Jual

Pada halaman Pendataan Barang Bekas, jika barang memiliki kondisi `LAYAK JUAL`, maka tampilkan tombol aksi `Jual`.

Tombol `Jual` hanya boleh tampil untuk:
- SUPER_ADMIN
- ADMIN_PUSAT

Tombol `Jual` tidak boleh tampil untuk:
- ADMIN_CABANG
- KARYAWAN_CABANG

Menu Layak Jual tetap satu menu utama, tetapi isi halaman menggunakan tab:
- Sparepart
- Barang Bekas

Tab Sparepart menampilkan item sparepart dengan kondisi `LAYAK JUAL`.
Tab Barang Bekas menampilkan barang bekas/material dengan kondisi `LAYAK JUAL`.

Jangan menggabungkan sparepart dan barang bekas dalam satu tabel karena struktur datanya berbeda.

Saat user pusat klik tombol `Jual` pada barang bekas:
- Buka modal order jual barang bekas.
- Isi readonly data barang: kode, nama, kategori, cabang, qty tersedia, satuan.
- User mengisi qty dijual, pembeli, harga jual, tanggal jual, dan catatan.
- Qty dijual tidak boleh melebihi qty tersedia.

## 7. Model Database yang Dibutuhkan

Gunakan model existing `Branch`. Jangan membuat model baru bernama `Cabang`. Istilah “cabang” di UI sama dengan model `Branch` di database.

### 7.1 User

Tambahkan model `User`.

Field minimal:

```prisma
model User {
  id           String   @id @default(cuid())
  name         String
  email        String   @unique
  passwordHash String
  role         Role
  branchId     String?
  branch       Branch?  @relation(fields: [branchId], references: [id])
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

Catatan:
- `email` harus unique.
- Email harus dinormalisasi lowercase dan trim sebelum disimpan.
- Password tidak boleh disimpan plaintext.
- Gunakan `passwordHash`.

### 7.2 Role Enum

Tambahkan enum `Role`:

```prisma
enum Role {
  SUPER_ADMIN
  ADMIN_PUSAT
  ADMIN_CABANG
  KARYAWAN_CABANG
}
```

### 7.3 Branch

Jika `Branch` sudah ada, perluas agar siap untuk 100 cabang.

Field disarankan:

```prisma
model Branch {
  id        String   @id @default(cuid())
  code      String   @unique
  name      String
  regional  String?
  city      String?
  address   String?
  phone     String?
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  users      User[]
  spareparts Sparepart[]
  usedGoods  UsedGoods[]
}
```

Jika struktur existing berbeda, jangan rusak data existing. Lakukan migration aman.

### 7.4 Relasi Branch pada Data Operasional

Pastikan data operasional memiliki relasi ke `Branch`.

- `Sparepart.branchId` harus mengarah ke `Branch.id`.
- `UsedGoods.branchId` harus mengarah ke `Branch.id`.
- Jika data existing masih menyimpan cabang sebagai text, lakukan migrasi aman tanpa menghapus data lama.
- Jika perlu, pertahankan field lama sementara sebagai fallback, lalu buat TODO untuk cleanup.

## 8. Aturan Relasi User dan Branch

Aturan:
- SUPER_ADMIN: `branchId` boleh null.
- ADMIN_PUSAT: `branchId` boleh null.
- ADMIN_CABANG: `branchId` wajib ada.
- KARYAWAN_CABANG: `branchId` wajib ada.

Validasi ini harus dijaga di server, bukan hanya UI.

## 9. Aturan Data Scope

Ini bagian paling penting.

Semua server action/API yang mengambil data sparepart, barang bekas, laporan, inventori, layak jual, dan cabang harus melewati helper pengecekan akses.

Aturan:
- SUPER_ADMIN dapat mengakses semua cabang.
- ADMIN_PUSAT dapat mengakses semua cabang.
- ADMIN_CABANG hanya dapat mengakses `branchId` miliknya.
- KARYAWAN_CABANG hanya dapat mengakses `branchId` miliknya.

Untuk user cabang:
- Server action wajib mengabaikan `branchId` dari client.
- `branchId` selalu diambil dari `session.user.branchId`.
- Jika `session.user.branchId` kosong, request harus ditolak.

Untuk user pusat:
- Server action boleh menerima `branchId` dari client saat input data.
- `branchId` wajib divalidasi ke master `Branch` yang aktif.
- Jika `branchId` tidak valid atau cabang nonaktif, request harus ditolak.

Contoh logic:

```ts
function applyBranchScope(user, where) {
  if (user.role === "ADMIN_CABANG" || user.role === "KARYAWAN_CABANG") {
    if (!user.branchId) {
      throw new Error("User cabang tidak memiliki branchId.");
    }

    return {
      ...where,
      branchId: user.branchId
    };
  }

  return where;
}
```

Jangan hanya sembunyikan menu di frontend. Backend/server action wajib aman.

## 10. Authentication

Gunakan sistem login yang cocok untuk Next.js App Router.

Rekomendasi:
- Auth.js / NextAuth
- bcrypt untuk hash password
- Session berbasis cookie
- Prisma adapter jika cocok

Minimal fitur:
- Login page
- Logout
- Session user
- Proteksi halaman dashboard
- Redirect berdasarkan role
- User inactive tidak boleh login
- Password tidak boleh disimpan plaintext

## 11. Route dan Navigasi

### 11.1 Route Minimal

Boleh tetap menggunakan struktur route existing jika project sekarang belum banyak route. Yang penting role dan data scope benar.

Route minimal:
- `/login`
- `/dashboard`
- `/pendataan/sparepart`
- `/pendataan/barang-bekas`
- `/inventori`
- `/layak-jual`
- `/cabang`
- `/users`
- `/laporan`

Catatan:
- `/layak-jual` hanya boleh diakses oleh SUPER_ADMIN dan ADMIN_PUSAT.
- User cabang yang mencoba membuka `/layak-jual` harus mendapat 403 atau redirect ke dashboard cabang.

### 11.2 Redirect Setelah Login

Aturan:
- SUPER_ADMIN -> `/dashboard` dengan mode pusat.
- ADMIN_PUSAT -> `/dashboard` dengan mode pusat.
- ADMIN_CABANG -> `/dashboard` dengan mode cabang.
- KARYAWAN_CABANG -> `/dashboard` dengan mode cabang.

Jika user belum login dan membuka halaman protected:
- Redirect ke `/login`.

Jika user cabang mencoba akses halaman pusat:
- Tampilkan 403 atau redirect ke dashboard cabang.

## 12. Dashboard Pusat

Dashboard pusat digunakan oleh:
- SUPER_ADMIN
- ADMIN_PUSAT

Tujuan:
Menjadi command center untuk monitoring semua cabang.

### 12.1 Stat Card Pusat

Wajib tampil:
- Total Cabang
- Total Sparepart
- Total Barang Bekas
- Layak Jual
- Rusak / Tidak Layak
- Estimasi Nilai

Jika estimasi nilai belum akurat, tetap tampilkan berdasarkan field estimasi harga barang yang tersedia.

### 12.2 Ringkasan Per Cabang

Tampilkan tabel:

Kolom:
- Cabang
- Total Sparepart
- Total Barang Bekas
- Layak Jual
- Rusak / Tidak Layak
- Update Terakhir
- Status

Status contoh:
- Aktif
- Perlu Cek
- Belum Update

### 12.3 Aktivitas Terbaru Semua Cabang

Tampilkan list aktivitas terbaru:
- Input sparepart baru
- Input barang bekas baru
- Update status barang
- Export laporan
- Perubahan data penting

Jika audit log belum dibuat, aktivitas bisa diambil dari data terbaru berdasarkan `createdAt` atau `updatedAt`.

### 12.4 Filter Pusat

Filter yang disiapkan:
- Semua Cabang
- Tanggal/periode
- Jenis data: Sparepart / Barang Bekas / Semua
- Kondisi
- Search

### 12.5 Shortcut Pusat

Tampilkan shortcut:
- Input Sparepart
- Input Barang Bekas
- Tambah Cabang
- Tambah User
- Export Laporan

### 12.6 UX Dashboard Pusat

Dashboard pusat wajib mengikuti pola dari file referensi klien `BARKAS_Plus_v4_rev2_modified.html`, yaitu memiliki switch tab utama:

- Dashboard Sparepart
- Dashboard Barang Bekas

Tab Sparepart dan Barang Bekas tidak boleh dihapus atau digabung menjadi satu tampilan besar.

Saat tab Sparepart aktif:
- Tampilkan statistik sparepart.
- Tampilkan tabel data sparepart terbaru.
- Tampilkan distribusi kondisi sparepart.
- Tampilkan ringkasan per cabang, kategori, dan jenis kendaraan.

Saat tab Barang Bekas aktif:
- Tampilkan statistik barang bekas.
- Tampilkan tabel barang bekas terbaru.
- Tampilkan distribusi kondisi barang bekas.
- Tampilkan ringkasan per kategori, cabang, dan satuan.

Target user dashboard adalah umur 25–50 tahun, sehingga UX harus:
- Mudah dibaca.
- Tidak terlalu ramai.
- Menggunakan tombol yang jelas.
- Menggunakan warna status yang konsisten.
- Memiliki navigasi tab yang mudah dipahami.
- Menghindari animasi berlebihan.
- Memiliki tabel yang sederhana dan tidak terlalu padat.

Dashboard pusat harus mempertahankan style existing BARKAS+:
- Sidebar navy.
- Topbar putih.
- Background abu muda.
- Card putih.
- Border lembut.
- Badge status.
- Tab switch Sparepart / Barang Bekas.

## UX Guidelines untuk Dashboard Pusat

Target user aplikasi adalah pengguna operasional berumur 25–50 tahun. Oleh karena itu dashboard harus mengutamakan keterbacaan, kejelasan alur, dan kemudahan penggunaan.

Aturan UX:
- Gunakan teks yang jelas, bukan label terlalu teknis.
- Font minimal 12px untuk tabel dan 14px untuk label penting.
- Gunakan kontras tinggi: navy, putih, abu muda, biru, hijau, merah, amber.
- Jangan gunakan animasi berlebihan.
- Jangan gunakan chart yang terlalu kompleks.
- Tampilkan angka utama dalam stat card besar.
- Tabel harus mudah discan, dengan kolom yang tidak terlalu banyak.
- Setiap tab harus punya icon dan label.
- Tombol aksi utama harus jelas: Export, Input Barang, Lihat Semua.
- Hindari menyembunyikan filter terlalu dalam.
- Gunakan badge warna untuk kondisi: Layak Jual, Rusak, Tidak Layak.
- Jangan membuat user harus scroll terlalu jauh untuk melihat ringkasan utama.
- Dashboard pusat harus terasa seperti command center, bukan hanya tabel data.
Dashboard Pusat
├── Tab Sparepart
│   ├── Stat Card Sparepart
│   ├── Tabel Sparepart Terbaru
│   ├── Kondisi Sparepart
│   └── Ringkasan Cabang/Kategori/Jenis
│
└── Tab Barang Bekas
    ├── Stat Card Barang Bekas
    ├── Tabel Barang Bekas Terbaru
    ├── Kondisi Barang Bekas
    └── Ringkasan Kategori/Cabang/Satuan

## 13. Dashboard Cabang

Dashboard cabang digunakan oleh:
- ADMIN_CABANG
- KARYAWAN_CABANG

Tujuan:
Menjadi panel operasional cabang sendiri.

### 13.1 Identitas Cabang

Tampilkan:
- Nama cabang
- Kode cabang
- Regional
- Kota/alamat jika ada
- Status cabang aktif

### 13.2 Stat Card Cabang

Wajib tampil:
- Total Sparepart Cabang
- Total Barang Bekas Cabang
- Kondisi Layak
- Rusak / Tidak Layak Cabang
- Input Bulan Ini
- Estimasi Nilai Cabang

Catatan:
- Gunakan istilah `Kondisi Layak`, bukan `Layak Jual Cabang`, agar tidak terlihat seperti fitur penjualan cabang.

### 13.3 Quick Input Cabang

Tampilkan tombol:
- Input Sparepart
- Input Barang Bekas

Aturan:
- Cabang tidak memilih cabang saat input.
- `branchId` otomatis dari session user.

### 13.4 Data Terbaru Cabang

Tampilkan data terbaru cabang sendiri:
- Tanggal
- Jenis Data
- Nama Barang
- Kategori
- Kondisi
- Aksi

## 14. Sidebar Berdasarkan Role

### 14.1 Sidebar Pusat

Untuk SUPER_ADMIN dan ADMIN_PUSAT:
- Dashboard Pusat
- Pendataan Sparepart
- Pendataan Barang Bekas
- Inventori Semua Cabang
- Layak Jual
- Data per Cabang
- Manajemen Cabang
- Manajemen User
- Laporan
- Export Data

Tambahan khusus SUPER_ADMIN:
- Audit Log
- Setting Sistem

Jika audit log dan setting belum dibuat, tampilkan hanya jika sudah siap atau buat placeholder disabled.

### 14.2 Sidebar Cabang

Untuk ADMIN_CABANG dan KARYAWAN_CABANG:
- Dashboard Cabang
- Input Barang
- Pendataan Sparepart
- Pendataan Barang Bekas
- Inventori Cabang
- Laporan Cabang
- Profil Cabang

Catatan:
- Cabang tidak memiliki menu Layak Jual terpisah.
- Cabang hanya melihat status kondisi barang melalui Pendataan dan Inventori.
- Proses Layak Jual dan Order Jual hanya tersedia untuk role pusat.

Untuk KARYAWAN_CABANG:
- Sembunyikan fitur hapus.
- Sembunyikan manajemen user.
- Sembunyikan export besar jika tidak diizinkan.

## 15. Manajemen Cabang

Untuk SUPER_ADMIN dan ADMIN_PUSAT.

### Fitur
- List cabang
- Tambah cabang
- Edit cabang
- Nonaktifkan cabang
- Search cabang
- Filter aktif/nonaktif

### Field Form
- Kode cabang
- Nama cabang
- Regional
- Kota
- Alamat
- Telepon
- Status aktif

### Aturan
- Kode cabang wajib unik.
- Nama cabang wajib.
- Cabang yang sudah punya data tidak boleh dihapus permanen.
- Gunakan soft delete/nonaktifkan.

## 16. Manajemen User

Untuk SUPER_ADMIN dan ADMIN_PUSAT.

### Fitur
- List user
- Tambah user
- Edit user
- Nonaktifkan user
- Reset password
- Assign role
- Assign branch untuk user cabang

### Aturan
- Email wajib unik.
- Password wajib di-hash.
- ADMIN_CABANG dan KARYAWAN_CABANG wajib punya branchId.
- ADMIN_PUSAT dan SUPER_ADMIN tidak wajib punya branchId.
- ADMIN_PUSAT tidak boleh membuat SUPER_ADMIN.
- ADMIN_PUSAT tidak boleh melihat detail sensitif, mengedit, reset password, menonaktifkan, atau menghapus SUPER_ADMIN.
- UI create user tidak menyediakan opsi role SUPER_ADMIN.
- SUPER_ADMIN awal dibuat melalui seed/manual database.

## 17. Form Input Data Setelah Role

### 17.1 Input oleh Pusat

Jika user pusat input sparepart/barang bekas:
- Field cabang wajib dipilih.
- Cabang berasal dari master cabang aktif.
- Jangan pakai input teks bebas untuk cabang.
- Gunakan dropdown/searchable select.

### 17.2 Input oleh Cabang

Jika user cabang input sparepart/barang bekas:
- Field cabang tidak perlu ditampilkan, atau tampil sebagai readonly.
- `branchId` otomatis dari session user.
- User tidak bisa memilih cabang lain.

## 18. Testing Requirements

Project sudah punya Vitest dan testing untuk fitur v3.

Tambahkan/ubah test untuk v4.

### 18.1 Unit Test

Wajib test:
- Role permission helper.
- Branch scope helper.
- Auth validation.
- User validation.
- Branch validation.
- Sidebar menu generator berdasarkan role.
- Dashboard stats pusat.
- Dashboard stats cabang.
- Layak Jual permission helper.

### 18.2 Integration Test

Wajib test:
- User cabang hanya dapat data branchId miliknya.
- Admin pusat dapat semua data.
- Super admin dapat semua data.
- Karyawan cabang tidak bisa hapus data.
- Admin cabang tidak bisa akses data cabang lain.
- Admin pusat tidak bisa mengubah akun super admin.
- Admin cabang tidak bisa mengakses `/layak-jual`.
- Karyawan cabang tidak bisa mengakses `/layak-jual`.
- Admin cabang tidak bisa membuat order jual melalui server action/API.
- Karyawan cabang tidak bisa membuat order jual melalui server action/API.

### 18.3 Component Test

Wajib test:
- Login form.
- Sidebar pusat.
- Sidebar cabang.
- Sidebar cabang tidak menampilkan menu Layak Jual.
- Dashboard pusat menampilkan card utama.
- Dashboard cabang menampilkan identitas cabang.
- Form input cabang otomatis readonly untuk user cabang.

### 18.4 Command Verifikasi

Setelah implementasi:

```bash
npm run test
npm run lint
npm run typecheck
npm run build
```

Semua harus passed.

## 19. Command yang Dilarang Tanpa Izin

Jangan menjalankan command berikut tanpa izin:

```bash
prisma migrate reset
npm run db:reset
prisma db push --force-reset
rm -rf prisma/migrations
rm -rf node_modules
```

Jangan reset database development.

Jika perlu migration:
- Gunakan `npx prisma migrate dev`.
- Jangan hapus migration lama.

## 20. Acceptance Criteria

Update dianggap berhasil jika:
- User tidak bisa membuka dashboard tanpa login.
- User bisa login dan logout.
- Password disimpan dalam bentuk hash.
- Role tersedia:
  - SUPER_ADMIN
  - ADMIN_PUSAT
  - ADMIN_CABANG
  - KARYAWAN_CABANG
- SUPER_ADMIN dapat melihat semua data.
- ADMIN_PUSAT dapat mengakses semua data operasional semua cabang.
- ADMIN_CABANG hanya dapat melihat/mengelola data cabangnya sendiri.
- KARYAWAN_CABANG hanya dapat input dan melihat data cabangnya sendiri.
- User cabang tidak bisa melihat data cabang lain walaupun mencoba manipulasi request.
- Menu Layak Jual hanya tampil untuk SUPER_ADMIN dan ADMIN_PUSAT.
- ADMIN_CABANG dan KARYAWAN_CABANG tidak melihat menu Layak Jual.
- ADMIN_CABANG dan KARYAWAN_CABANG tidak dapat membuat order jual.
- Cabang tetap dapat melihat status kondisi barang melalui Pendataan dan Inventori.
- Dashboard pusat menampilkan ringkasan semua cabang.
- Dashboard cabang menampilkan data cabang sendiri.
- Sidebar berubah sesuai role.
- Cabang bisa dikelola dari master cabang.
- User bisa dikelola dari manajemen user.
- Fitur v3 sparepart dan barang bekas tetap berjalan.
- Test existing tetap passed.
- Build production berhasil.

## 21. Instruksi untuk Codex

### Sebelum coding
- Baca PRD.md ini.
- Baca TESTING.md.
- Audit struktur project.
- Buat implementation plan singkat.
- Jangan implement fitur di luar scope.
- Jangan redesign besar-besaran.
- Jangan menghapus data/migration.
- Jaga fitur v3 tetap aman.
- Tambahkan test sebelum/selama implementasi.
- Setelah selesai, jalankan test, lint, typecheck, dan build.

### Jika ada bagian yang ambigu
- Pilih solusi paling kecil dan aman.
- Jangan membuat fitur tambahan tanpa diminta.
- Tambahkan TODO jika fitur belum masuk scope.
