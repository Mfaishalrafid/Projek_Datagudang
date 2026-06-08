# PRD — BARKAS+ v5 Multi-Branch Auth, Access Control & SGA

## 1. Ringkasan Produk

BARKAS+ adalah aplikasi internal INDOPAKET untuk mengelola data sparepart ex-service, barang bekas/material, dan SGA dari banyak cabang.

Versi saat ini sudah mendukung:
- Dashboard
- Pendataan sparepart
- Pendataan barang bekas/material
- Pendataan SGA
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

Update v5 menambahkan modul SGA yang tersedia untuk role pusat dan role cabang:
- Pendataan SGA
- Dashboard tab SGA
- Inventori tab SGA
- Data per Cabang tab SGA
- Laporan tab SGA
- Layak Jual tab SGA khusus role pusat
- Validasi Nomor TLS unik sebagai identitas utama SGA

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

- Dapat mengakses semua fitur dan data di sistem.
- Dapat melihat dashboard pusat dan dashboard cabang mana pun.
- Dapat melakukan CRUD terhadap cabang.
- Dapat melakukan CRUD terhadap user (termasuk mengubah role dan cabang).
- Tidak terikat pada cabang tertentu.
- Dianggap sebagai user “luar sistem” yang memiliki wewenang penuh.
- Contoh: Tim IT core, CEO, atau direksi yang memegang master data.

### 5.2 ADMIN_PUSAT

- Hanya boleh mengakses dashboard pusat.
- Dapat melihat data operasional semua cabang, dmin Pusat boleh kelola cabang operasional, tapi tidak boleh setting sensitif/hapus permanen (misalnya: nama cabang, kode, alamat).
- Dapat melihat daftar semua user dan melakukan CRUD terhadap user, tetapi **tidak dapat mengubah role menjadi SUPER_ADMIN**.
- Dapat mengubah cabang user cabang (ADMIN_CABANG dan KARYAWAN_CABANG).
- Tidak dapat melihat user dengan role SUPER_ADMIN.
- Digunakan sebagai “administrator operasional pusat”.

### 5.3 ADMIN_CABANG

- Hanya boleh mengakses dashboard cabang yang menjadi miliknya.
- Hanya dapat melihat data (sparepart, barang bekas/material, inventori, layak jual, laporan) dari cabangnya sendiri.
- Tidak dapat melihat data cabang lain.
- Dapat melakukan CRUD terhadap user cabang (KARYAWAN_CABANG yang terhubung dengannya).
- Tidak dapat mengubah data cabang (seperti nama, kode, alamat, lokasi).
- Tidak dapat mengubah data admin cabang lain.
- Admin Cabang sebaiknya hanya bisa kelola karyawan cabangnya sendiri, tidak boleh mengubah branchId.

### 5.4 KARYAWAN_CABANG

- Hanya boleh mengakses dashboard cabang yang menjadi miliknya.
- Hanya dapat melihat data cabang sendiri.
- Tidak dapat melihat data cabang lain.
- Tidak dapat melihat user mana pun (bahkan admin cabang atau user lain).
- Tidak dapat melakukan CRUD user.
- Tidak dapat mengubah data cabang.
- Digunakan sebagai “user operasional harian” di level cabang.

##  6. Permission Matrix

| Fitur                         |  SUPER_ADMIN |             ADMIN_PUSAT |            ADMIN_CABANG |       KARYAWAN_CABANG |
| ----------------------------- | -----------: | ----------------------: | ----------------------: | --------------------: |
| Login/logout                  |           Ya |                      Ya |                      Ya |                    Ya |
| Dashboard pusat               |           Ya |                      Ya |                   Tidak |                 Tidak |
| Dashboard cabang sendiri      |           Ya |                      Ya |                      Ya |                    Ya |
| Lihat semua cabang            |           Ya |                      Ya |                   Tidak |                 Tidak |
| Lihat data cabang sendiri     |           Ya |                      Ya |                      Ya |                    Ya |
| Lihat data semua cabang       |           Ya |                      Ya |                   Tidak |                 Tidak |
| Input sparepart               | Semua cabang |            Semua cabang |          Cabang sendiri |        Cabang sendiri |
| Input barang bekas            | Semua cabang |            Semua cabang |          Cabang sendiri |        Cabang sendiri |
| Input SGA                     | Semua cabang |            Semua cabang |          Cabang sendiri |        Cabang sendiri |
| Edit data                     |        Semua |                   Semua |          Cabang sendiri | Data sendiri terbatas |
| Hapus/arsip data              |           Ya |                      Ya | Terbatas cabang sendiri |                 Tidak |
| Export semua laporan          |           Ya |                      Ya |                   Tidak |                 Tidak |
| Export laporan cabang sendiri |           Ya |                      Ya |                      Ya |              Opsional |
| Kelola cabang                 |           Ya |                      Ya |                   Tidak |                 Tidak |
| Kelola user                   |           Ya | User cabang/admin biasa |          Tidak/opsional |                 Tidak |
| Reset password                |           Ya | User cabang/admin biasa |          Tidak/opsional |                 Tidak |
| Setting sistem                |           Ya |                   Tidak |                   Tidak |                 Tidak |

##  7. Model Database yang Dibutuhkan

###  7.1 User

Tambahkan model User.

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

###  7.2 Role Enum

```ts
enum Role {
  SUPER_ADMIN
  ADMIN_PUSAT
  ADMIN_CABANG
  KARYAWAN_CABANG
}
```

###  7.3 Branch

Jika Branch sudah ada, perluas agar siap untuk 100 cabang.

Field disarankan:

```ts
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
  sgaItems   SgaItem[]
}
```
Jika struktur existing berbeda, jangan rusak data existing. Lakukan migration aman.


### 7.5 SGA

Tambahkan model baru untuk pendataan SGA. SGA menggunakan `Nomor TLS` sebagai identitas unik utama, sehingga tidak perlu field `Kode SGA`.

Field SGA:
- Tanggal Input
- Nomor TLS
- Branch/Cabang
- Nama Barang
- Jumlah
- PIC Input
- Status Kelayakan
- Keterangan
- Status Transaksi

Field yang tidak dibuat:
- Kode SGA
- Satuan

Alasan:
- Nomor TLS sudah menjadi kode unik utama.
- SGA dijual borongan, sehingga tidak membutuhkan satuan dan tidak ada jual sebagian.

Contoh model:

```prisma
model SgaItem {
  id                 String               @id @default(cuid())
  tlsNumber          String               @unique
  inputDate          DateTime
  branchId           String
  branch             Branch               @relation(fields: [branchId], references: [id])
  itemName           String
  quantity           Int
  picName            String
  eligibilityStatus  SgaEligibilityStatus
  transactionStatus  SgaTransactionStatus @default(TERSEDIA)
  note               String?
  createdById        String?
  createdAt          DateTime             @default(now())
  updatedAt          DateTime             @updatedAt

  saleOrders         SgaSaleOrder[]
}

enum SgaEligibilityStatus {
  LAYAK_JUAL
  TIDAK_LAYAK
}

enum SgaTransactionStatus {
  TERSEDIA
  DALAM_ORDER
  TERJUAL
}
```

Tambahkan model order jual SGA:

```prisma
model SgaSaleOrder {
  id          String   @id @default(cuid())
  sgaItemId   String
  sgaItem     SgaItem  @relation(fields: [sgaItemId], references: [id])
  buyerName   String
  buyerType   String?
  salePrice   Int
  saleDate    DateTime
  status      SaleOrderStatus
  note        String?
  createdById String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

Jika enum `SaleOrderStatus` sudah tersedia dan cocok, gunakan enum existing agar tidak membuat status duplikat.

Nomor TLS wajib dinormalisasi sebelum disimpan:
- trim spasi awal dan akhir
- uppercase
- TLS dengan beda kapital tetap dianggap duplikat

Jika user input Nomor TLS yang sudah ada, tampilkan notifikasi:

```text
Nomor TLS sudah terdata. Silakan gunakan Nomor TLS lain.
```

## 8. Aturan Relasi User dan Branch

Aturan:

SUPER_ADMIN: branchId boleh null
ADMIN_PUSAT: branchId boleh null
ADMIN_CABANG: branchId wajib ada
KARYAWAN_CABANG: branchId wajib ada

Validasi ini harus dijaga di server, bukan hanya UI.

## 9. Aturan Data Scope

Ini bagian paling penting.

Semua server action/API yang mengambil data sparepart, barang bekas, laporan, inventori, dan cabang harus melewati helper pengecekan akses.

Aturan:

SUPER_ADMIN -> boleh semua cabang
ADMIN_PUSAT -> boleh semua cabang
ADMIN_CABANG -> hanya branchId miliknya
KARYAWAN_CABANG -> hanya branchId miliknya

pusat boleh kirim branchId dari form, cabang wajib pakai session.user.branchId.

Contoh logic:

```ts
function applyBranchScope(user, where) {
  if (user.role === "ADMIN_CABANG" || user.role === "KARYAWAN_CABANG") {
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
Password tidak boleh disimpan plaintext

## 11. Route dan Navigasi

### 11.1 Route Minimal

- /login
- /dashboard
- /pendataan/sparepart
- /pendataan/barang-bekas
- /pendataan/SGA
- /inventori
- /layak-jual
- /cabang
- /users
- /laporan

Boleh tetap menggunakan struktur route existing jika project sekarang belum banyak route. Yang penting role dan data scope benar.

### 11.2 Redirect Setelah Login

Aturan:

SUPER_ADMIN -> /dashboard dengan mode pusat
ADMIN_PUSAT -> /dashboard dengan mode pusat
ADMIN_CABANG -> /dashboard dengan mode cabang
KARYAWAN_CABANG -> /dashboard dengan mode cabang

Jika user belum login dan membuka halaman protected:

Redirect ke /login

Jika user cabang mencoba akses halaman pusat:

Tampilkan 403 atau redirect ke dashboard cabang

## 12. Dashboard Pusat

Dashboard pusat digunakan oleh:

SUPER_ADMIN
ADMIN_PUSAT

Tujuan:
Menjadi command center untuk monitoring semua cabang.

### 12.1 Stat Card Pusat

Wajib tampil:

- Total Cabang
- Total Sparepart
- Total Barang Bekas
- Total SGA
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
- Total SGA
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
- Input SGA baru
- Update status layak jual
- Export laporan
- Perubahan data penting

Jika audit log belum dibuat, aktivitas bisa diambil dari data terbaru berdasarkan createdAt/updatedAt.

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
- Input SGA
- Tambah Cabang
- Tambah User
- Export Laporan

## 13. Dashboard Cabang

Dashboard cabang digunakan oleh:

ADMIN_CABANG
KARYAWAN_CABANG

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
- Total SGA Cabang
- Layak Jual Cabang
- Rusak / Tidak Layak Cabang
- Input Bulan Ini
- Estimasi Nilai Cabang

### 13.3 Quick Input Cabang

Tampilkan tombol:

- Input Sparepart
- Input Barang Bekas
- Input SGA

Aturan:

- Cabang tidak memilih cabang saat input
- branchId otomatis dari session user

###   13.4 Data Terbaru Cabang

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
- Pendataan SGA
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
- Pendataan SGA
- Inventori Cabang
- Layak Jual Cabang ( tidak usah di cabang)
- Laporan Cabang
- Profil Cabang

Untuk KARYAWAN_CABANG:

- Sembunyikan fitur hapus
- Sembunyikan manajemen user
- Sembunyikan export besar jika tidak diizinkan

## 15. Manajemen Cabang

Untuk SUPER_ADMIN dan ADMIN_PUSAT.

### Fitur:

- List cabang
- Tambah cabang
- Edit cabang
- Nonaktifkan cabang
- Search cabang
- Filter aktif/nonaktif

### Field form:

- Kode cabang
- Nama cabang
- Regional
- Kota
- Alamat
- Status aktif

### Aturan:

-   Kode cabang wajib unik
-   Nama cabang wajib
-   Cabang yang sudah punya data tidak boleh dihapus permanen
-   Gunakan soft delete/nonaktifkan

## 16. Manajemen User

Untuk SUPER_ADMIN dan ADMIN_PUSAT.

### Fitur:

- List user
- Tambah user
- Edit user
- Nonaktifkan user
- Reset password
- Assign role
- Assign branch untuk user cabang

### Aturan:

- Email wajib unik
- Password wajib di-hash
- ADMIN_CABANG dan KARYAWAN_CABANG wajib punya branchId
- ADMIN_PUSAT dan SUPER_ADMIN tidak wajib punya branchId
- ADMIN_PUSAT tidak boleh membuat SUPER_ADMIN jika tidak diizinkan
- ADMIN_PUSAT tidak boleh edit/menghapus SUPER_ADMIN

## 17. Form Input Data Setelah Role

### 17.1 Input oleh Pusat

Jika user pusat input sparepart/barang bekas/SGA:

- Field cabang wajib dipilih
- Cabang berasal dari master cabang aktif
- Jangan pakai input teks bebas untuk cabang
- Gunakan dropdown/searchable select

### 17.2 Input oleh Cabang

Jika user cabang input sparepart/barang bekas/SGA:

- Field cabang tidak perlu ditampilkan, atau tampil sebagai readonly
- branchId otomatis dari session user
- User tidak bisa memilih cabang lain


## 18. Fitur SGA v5

Fitur SGA tersedia untuk role pusat dan role cabang dengan scope data yang berbeda.

### 18.1 Tujuan Fitur SGA

SGA digunakan untuk mendata barang SGA berdasarkan Nomor TLS. Modul ini menjadi modul ketiga setelah Sparepart dan Barang Bekas/Material.

Modul utama:
- Sparepart
- Barang Bekas
- SGA

### 18.2 Field Pendataan SGA

Field final:
- Tanggal Input
- Nomor TLS
- Cabang
- Nama Barang
- Jumlah
- PIC Input
- Status Kelayakan
- Keterangan
- Status Transaksi

Field yang tidak perlu:
- Kode SGA
- Satuan

Aturan:
- Nomor TLS adalah kode unik utama.
- Jika Nomor TLS sudah ada, data tidak boleh disimpan.
- SGA dijual borongan, jadi tidak ada satuan, qty tersedia, atau jual sisa.
- Jumlah hanya menjadi informasi jumlah barang dalam satu data SGA.

### 18.3 Status SGA

Status Kelayakan:
- `LAYAK_JUAL`
- `TIDAK_LAYAK`

Status Transaksi:
- `TERSEDIA`
- `DALAM_ORDER`
- `TERJUAL`

Default saat membuat SGA baru:
- Status Transaksi = `TERSEDIA`

### 18.4 Akses SGA Role Pusat

Untuk `SUPER_ADMIN` dan `ADMIN_PUSAT`:
- Dapat melihat semua data SGA semua cabang.
- Dapat input SGA untuk semua cabang.
- Dapat edit SGA semua cabang jika belum `DALAM_ORDER` atau `TERJUAL`.
- Dapat hapus/arsip SGA semua cabang jika belum `DALAM_ORDER` atau `TERJUAL`.
- Dapat membuat order jual SGA.
- Dapat melihat Dashboard, Inventori, Data per Cabang, Layak Jual, dan Laporan tab SGA semua cabang.
- Dapat export CSV SGA semua cabang.

### 18.5 Akses SGA Role Cabang

Untuk `ADMIN_CABANG`:
- Dapat melihat data SGA cabangnya sendiri.
- Dapat input SGA untuk cabangnya sendiri.
- Dapat edit SGA cabangnya sendiri jika belum `DALAM_ORDER` atau `TERJUAL`.
- Dapat hapus/arsip SGA cabangnya sendiri jika belum `DALAM_ORDER` atau `TERJUAL`.
- Dapat export laporan SGA cabangnya sendiri.
- Tidak boleh melihat SGA cabang lain.
- Tidak boleh membuat order jual SGA.
- Tidak boleh mengubah status transaksi menjadi `DALAM_ORDER` atau `TERJUAL` secara manual.
- Tidak boleh mengubah `branchId` pada data SGA.

Untuk `KARYAWAN_CABANG`:
- Dapat melihat data SGA cabangnya sendiri.
- Dapat input SGA untuk cabangnya sendiri.
- Dapat melihat dashboard/inventori/laporan SGA cabangnya sendiri.
- Tidak boleh melihat SGA cabang lain.
- Tidak boleh membuat order jual SGA.
- Tidak boleh hapus SGA.
- Edit data SGA dibatasi sesuai aturan aplikasi. Rekomendasi tahap awal: input dan lihat saja.

### 18.6 Struktur Tab SGA

Tambahkan tab SGA pada halaman berikut:

Dashboard Pusat:
- Sparepart
- Barang Bekas
- SGA

Dashboard Cabang:
- Sparepart
- Barang Bekas
- SGA

Inventori Semua Cabang / Inventori Cabang:
- Sparepart
- Barang Bekas
- SGA

Layak Jual:
- Sparepart
- Barang Bekas
- SGA

Data per Cabang:
- Sparepart
- Barang Bekas
- SGA

Laporan / Laporan Cabang:
- Sparepart
- Barang Bekas
- SGA

Catatan:
- Menu Layak Jual hanya tampil untuk `SUPER_ADMIN` dan `ADMIN_PUSAT`.
- Role cabang tidak melihat menu Layak Jual, termasuk tab Layak Jual SGA.
- Role cabang tetap melihat status SGA melalui Pendataan, Dashboard, Inventori, dan Laporan cabang.

### 18.7 Pendataan SGA

Kolom tabel:
- No
- Tanggal Input
- Nomor TLS
- Cabang
- Nama Barang
- Jumlah
- PIC Input
- Status Kelayakan
- Status Transaksi
- Keterangan
- Aksi

Fitur:
- Tambah SGA
- Edit SGA
- Detail SGA
- Hapus/arsip SGA sesuai role dan status transaksi
- Filter berdasarkan status kelayakan, status transaksi, cabang, Nomor TLS, nama barang, dan PIC input
- Export CSV SGA

Untuk role cabang:
- Field cabang otomatis dari `session.user.branchId`.
- Cabang boleh tampil readonly atau tidak ditampilkan.
- Server wajib mengabaikan `branchId` dari client.

### 18.8 Dashboard SGA

Dashboard Pusat tab SGA menampilkan semua cabang.
Dashboard Cabang tab SGA hanya menampilkan cabang login.

Stat card:
- Total SGA
- Total Jumlah
- Layak Jual
- Tidak Layak
- Dalam Order
- Terjual

Section:
- Data SGA terbaru
- Distribusi status kelayakan SGA
- Distribusi SGA per cabang untuk pusat
- Distribusi SGA per PIC input
- Ringkasan status transaksi

### 18.9 Inventori SGA

Inventori Pusat tab SGA menampilkan semua cabang.
Inventori Cabang tab SGA hanya menampilkan cabang login.

Kolom tabel:
- Tanggal Input
- Nomor TLS
- Cabang untuk pusat
- Nama Barang
- Jumlah
- PIC Input
- Status Kelayakan
- Status Transaksi
- Aksi

Aksi cabang:
- Detail
- Edit jika belum `DALAM_ORDER` atau `TERJUAL` dan role mengizinkan
- Hapus hanya untuk `ADMIN_CABANG` jika belum `DALAM_ORDER` atau `TERJUAL`
- Jangan tampilkan tombol Jual untuk role cabang

### 18.10 Layak Jual SGA

Layak Jual tab SGA hanya untuk `SUPER_ADMIN` dan `ADMIN_PUSAT`.

Tabel:
- Tanggal Input
- Nomor TLS
- Cabang
- Nama Barang
- Jumlah
- PIC Input
- Keterangan
- Status Transaksi
- Aksi

Aturan tombol:
- `LAYAK_JUAL` + `TERSEDIA`: tampilkan tombol Jual.
- `LAYAK_JUAL` + `DALAM_ORDER`: tampilkan badge/tombol disabled Dalam Order.
- `LAYAK_JUAL` + `TERJUAL`: tampilkan badge/tombol disabled Terjual.
- `TIDAK_LAYAK`: tidak masuk tab Layak Jual SGA.

Modal order jual SGA:
- Nomor TLS readonly
- Nama Barang readonly
- Cabang readonly
- Jumlah readonly
- PIC Input readonly
- Nama Pembeli wajib
- Tipe Pembeli opsional
- Harga Jual wajib lebih dari 0
- Tanggal Penjualan wajib/default hari ini
- Catatan opsional

Saat order dibuat:
- Status transaksi SGA berubah menjadi `DALAM_ORDER` atau mengikuti flow order existing.
- Jika order disetujui/selesai, status transaksi menjadi `TERJUAL`.
- SGA yang sudah `DALAM_ORDER` atau `TERJUAL` tidak boleh dijual ulang.

### 18.11 Data per Cabang Tab SGA

Untuk pusat, Data per Cabang tab SGA menampilkan ringkasan semua cabang.

Ringkasan per cabang:
- Nama Cabang
- Total Data SGA
- Total Jumlah
- Layak Jual
- Tidak Layak
- Dalam Order
- Terjual
- Update Terakhir

Detail cabang menampilkan tabel:
- Tanggal Input
- Nomor TLS
- Nama Barang
- Jumlah
- PIC Input
- Status Kelayakan
- Status Transaksi
- Aksi

### 18.12 Laporan SGA

Laporan Pusat tab SGA menampilkan semua cabang.
Laporan Cabang tab SGA hanya menampilkan cabang login.

Isi laporan:
- Total SGA
- Total Jumlah
- Layak Jual
- Tidak Layak
- Dalam Order
- Terjual
- Rekap per cabang untuk pusat
- Rekap per PIC input
- Rekap per status kelayakan
- Rekap per status transaksi
- Tren input SGA per bulan
- Tabel lengkap SGA

Export CSV:
- Pusat mengekspor semua data SGA sesuai filter.
- Cabang hanya mengekspor data SGA cabangnya sendiri.

### 18.13 Topbar Input Barang

Tombol `+ Input Barang` di topbar menyediakan pilihan:
- Sparepart Ex-Service
- Barang Bekas / Material
- SGA

Jika user memilih SGA, buka form Tambah SGA.

### 18.14 Aturan Keamanan SGA

Server action/API wajib menjaga aturan:
- Nomor TLS unique global.
- Role pusat dapat mengakses semua cabang.
- Role cabang hanya dapat mengakses `branchId` miliknya.
- Role cabang tidak boleh membuat order jual SGA.
- Role cabang tidak boleh mengubah data SGA cabang lain.
- Role cabang tidak boleh mengirim `branchId` bebas dari client.
- SGA `DALAM_ORDER` atau `TERJUAL` tidak bisa diedit bebas.
- SGA `TERJUAL` tidak bisa dihapus.
- SGA `DALAM_ORDER` atau `TERJUAL` tidak bisa dijual ulang.

Backend/server action wajib aman. Jangan hanya mengandalkan hidden menu di frontend.

## 19. Testing Requirements

Project sudah punya Vitest dan testing untuk fitur v3.

Tambahkan/ubah test untuk v4:

### 19.1 Unit Test

Wajib test :

- Role permission helper
- Branch scope helper
- Auth validation
- User validation
- Branch validation
- Sidebar menu generator berdasarkan role
- Dashboard stats pusat
- Dashboard stats cabang

### 19.2 Integration Test

Wajib test:

- User cabang hanya dapat data branchId miliknya
- Admin pusat dapat semua data
- Super admin dapat semua data
- Karyawan cabang tidak bisa hapus data
- Admin cabang tidak bisa akses data cabang lain
- Admin pusat tidak bisa mengubah akun super admin jika dibatasi

### 19.3 Component Test

Wajib test:

- Login form
- Sidebar pusat
- Sidebar cabang
- Dashboard pusat menampilkan card utama
- Dashboard cabang menampilkan identitas cabang
- Form input cabang otomatis readonly untuk user cabang

### 19.4 Command Verifikasi

Setelah implementasi:

- npm run test
- npm run lint
- npm run typecheck
- npm run build

Semua harus passed.

## 20. Command yang Dilarang Tanpa Izin

Jangan menjalankan command berikut tanpa izin:

- prisma migrate reset
- npm run db:reset
- prisma db push --force-reset
- rm -rf prisma/migrations
- rm -rf node_modules

Jangan reset database development.

Jika perlu migration:

Gunakan npx prisma migrate dev
Jangan hapus migration lama

## 21. Acceptance Criteria

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
- Dashboard pusat menampilkan ringkasan semua cabang.
- Dashboard cabang menampilkan data cabang sendiri.
- Sidebar berubah sesuai role.
- Cabang bisa dikelola dari master cabang.
- User bisa dikelola dari manajemen user.
- Fitur v3 sparepart dan barang bekas tetap berjalan.
- Test existing tetap passed.
- Build production berhasil.


### 21.1 Acceptance Criteria SGA v5

Update SGA dianggap berhasil jika:
- Modul Pendataan SGA tersedia untuk semua role sesuai batasan akses.
- SUPER_ADMIN dan ADMIN_PUSAT dapat melihat semua data SGA semua cabang.
- SUPER_ADMIN dan ADMIN_PUSAT dapat input, edit, hapus/arsip, export, dan membuat order jual SGA sesuai aturan status transaksi.
- ADMIN_CABANG hanya dapat melihat dan mengelola SGA cabangnya sendiri.
- KARYAWAN_CABANG hanya dapat melihat dan input SGA cabangnya sendiri sesuai aturan role.
- Role cabang tidak dapat melihat SGA cabang lain walaupun mencoba manipulasi request.
- Role cabang tidak dapat membuat order jual SGA.
- Nomor TLS menjadi identitas unik utama SGA.
- Field Kode SGA tidak dibuat.
- Field Satuan tidak dibuat.
- Input Nomor TLS duplikat ditolak dengan notifikasi yang jelas.
- Nomor TLS dinormalisasi dengan trim dan uppercase.
- SGA baru otomatis memiliki status transaksi `TERSEDIA`.
- SGA dengan status kelayakan `LAYAK_JUAL` dan status transaksi `TERSEDIA` muncul pada Layak Jual tab SGA untuk role pusat.
- SGA `TIDAK_LAYAK` tidak muncul pada Layak Jual tab SGA.
- SGA `DALAM_ORDER` atau `TERJUAL` tidak bisa dijual ulang.
- SGA `DALAM_ORDER` atau `TERJUAL` tidak bisa diedit bebas oleh cabang.
- Dashboard Pusat memiliki tab Sparepart, Barang Bekas, dan SGA.
- Dashboard Cabang memiliki tab Sparepart, Barang Bekas, dan SGA.
- Inventori Semua Cabang / Inventori Cabang memiliki tab SGA.
- Data per Cabang memiliki tab SGA.
- Laporan / Laporan Cabang memiliki tab SGA.
- Menu Layak Jual tetap hanya tampil untuk role pusat, tetapi di dalamnya terdapat tab SGA.
- Export CSV SGA untuk pusat berisi data semua cabang sesuai filter.
- Export CSV SGA untuk cabang hanya berisi data cabang sendiri.
- Test existing sparepart dan barang bekas tetap passed.
- Build production berhasil.

## 22. Instruksi untuk Codex

### Sebelum coding:

- Baca PRD.md ini.
- Baca TESTING.md.
- Audit struktur project.
- Buat implementation plan singkat.
- Jangan implement fitur di luar scope.
- Jangan redesign besar-besaran.
- Jangan menghapus data/migration.
- Jaga fitur sparepart, barang bekas, dan auth/role existing tetap aman.
- Tambahkan test sebelum/selama implementasi.
- Setelah selesai, jalankan test, lint, typecheck, dan build.

### Jika ada bagian yang ambigu:

- Pilih solusi paling kecil dan aman.
- Jangan membuat fitur tambahan tanpa diminta.
- Tambahkan TODO jika fitur belum masuk scope.