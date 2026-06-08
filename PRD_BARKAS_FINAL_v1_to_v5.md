# PRD FINAL — BARKAS+ v1 sampai v5

**Produk:** BARKAS+ — Sistem Pendataan Sparepart Ex-Service, Barang Bekas/Material, dan SGA INDOPAKET  
**Dokumen:** PRD final gabungan dari kebutuhan awal sampai revisi v5  
**Target pembaca:** Klien, developer, dan Codex/AI coding assistant  
**Status:** Final acuan implementasi  
**Catatan penting:** Jika ada perbedaan antara PRD lama, prototype HTML, prompt lama, atau catatan chat, maka dokumen final ini menjadi acuan utama.

---

## 1. Ringkasan Produk

BARKAS+ adalah aplikasi internal INDOPAKET untuk mengelola pendataan dan monitoring aset/barang operasional dari banyak cabang.

Aplikasi ini digunakan untuk mencatat, memantau, dan melaporkan:

1. **Sparepart Ex-Service**  
   Sparepart kendaraan yang dilepas dari kendaraan operasional, misalnya ban, aki, filter, kampas rem, komponen mesin, dan komponen kendaraan lainnya.

2. **Barang Bekas / Material**  
   Barang non-sparepart yang sudah tidak digunakan, misalnya kardus, palet, plastik, besi/logam, kertas arsip, elektronik bekas, dan material operasional lainnya.

3. **SGA**  
   Barang SGA yang didata berdasarkan **Nomor TLS** sebagai identitas unik. SGA dijual secara **borongan**, sehingga tidak memakai satuan dan tidak memakai sistem jual sebagian.

BARKAS+ harus mendukung multi-cabang, login, role user, pembatasan akses pusat/cabang, dashboard pusat, dashboard cabang, inventori, pendataan, laporan, export CSV, dan fitur layak jual/order jual untuk role pusat.

---

## 2. Riwayat Scope v1 sampai v5

### 2.1 v1 — Core Pendataan Sparepart Ex-Service

Scope awal aplikasi berfokus pada pendataan sparepart ex-service.

Fitur utama:

- Dashboard dasar.
- Pendataan sparepart ex-service.
- Tabel data sparepart.
- Filter/search data sparepart.
- Kondisi sparepart: `LAYAK JUAL` dan `RUSAK`.
- Kategori sparepart, misalnya Ban, Filter & Oli, Rem & Kampas, Transmisi, Mesin, Elektrikal, Others.
- Informasi PJPP, cabang, tanggal lepas, nama sparepart, nopol, jenis kendaraan, lokasi penyimpanan, dan keterangan.
- Export CSV.

### 2.2 v2 — Inventori, Layak Jual, Data per Cabang, dan Laporan

Scope berkembang menjadi sistem monitoring inventori sparepart.

Fitur utama:

- Inventori & Stok sparepart.
- Ringkasan stok per kategori.
- Ringkasan stok per cabang.
- Ringkasan stok per jenis kendaraan.
- Menu Layak Jual untuk sparepart dengan kondisi `LAYAK JUAL`.
- Data per Cabang.
- Laporan dan analitik.
- Dashboard visual berbasis card, tabel, badge, dan progress bar.

### 2.3 v3 — Barang Bekas/Material dan Testing

Scope ditambah dengan modul Barang Bekas/Material.

Fitur utama:

- Pendataan Barang Bekas / Material.
- Inventori Barang Bekas.
- Layak Jual Barang Bekas.
- Dashboard Barang Bekas.
- Laporan Barang Bekas.
- Export CSV Barang Bekas.
- Testing TDD menggunakan Vitest/RTL.
- Order jual barang bekas mendukung qty dijual dan qty tersedia.
- Barang Bekas bisa dijual sebagian.

### 2.4 v4 — Login, Role, Multi-Branch, dan Access Control

Scope v4 berfokus pada keamanan akses dan multi-cabang.

Fitur utama:

- Login/logout.
- Password hash, bukan plaintext.
- Role user:
  - `SUPER_ADMIN`
  - `ADMIN_PUSAT`
  - `ADMIN_CABANG`
  - `KARYAWAN_CABANG`
- Dashboard pusat untuk pusat.
- Dashboard cabang untuk cabang.
- Manajemen cabang.
- Manajemen user.
- Pemisahan akses data pusat dan cabang.
- Role cabang hanya dapat melihat dan mengelola data cabangnya sendiri.
- Role pusat dapat melihat semua cabang.
- Menu Layak Jual dan Order Jual hanya untuk role pusat.

### 2.5 v5 — Modul SGA

Scope v5 menambahkan modul SGA sebagai modul ketiga yang sejajar dengan Sparepart dan Barang Bekas.

Fitur utama:

- Pendataan SGA.
- Dashboard tab SGA.
- Inventori tab SGA.
- Layak Jual tab SGA untuk role pusat.
- Data per Cabang tab SGA.
- Laporan tab SGA.
- SGA tersedia untuk role pusat dan role cabang.
- Nomor TLS menjadi kode unik utama.
- Tidak ada field Kode SGA tambahan.
- Tidak ada field Satuan karena SGA dijual borongan.
- Jika Nomor TLS sudah pernah terdata, sistem wajib menolak input dan menampilkan notifikasi.

---

## 3. Tujuan Produk

Tujuan utama BARKAS+ adalah menyediakan sistem internal yang aman, rapi, dan mudah digunakan untuk mendata serta memantau sparepart ex-service, barang bekas/material, dan SGA di seluruh cabang INDOPAKET.

Target utama:

1. Mengurangi pendataan manual berbasis file terpisah.
2. Mempermudah pusat memantau semua cabang.
3. Mempermudah cabang mendata barang cabangnya sendiri.
4. Memastikan data antar cabang tidak tercampur.
5. Memastikan proses layak jual/order jual hanya dilakukan role pusat.
6. Memastikan laporan bisa dipakai untuk review operasional.
7. Membuat sistem mudah dikembangkan dan tidak sulit dipahami developer lain.
8. Menjaga UI tetap sederhana untuk target user operasional usia 25–50 tahun.

---

## 4. Non-Goals / Tidak Dikerjakan Dulu

Agar scope tetap aman, fitur berikut tidak dikerjakan dulu kecuali diminta eksplisit di revisi berikutnya:

- Approval workflow kompleks.
- Audit log lengkap.
- Backup/restore database dari UI.
- Multi-tenant multi-perusahaan.
- Notifikasi email/WhatsApp.
- Upload foto barang.
- Export Excel multi-sheet.
- Mobile app native.
- Integrasi payment.
- Integrasi marketplace/penjualan eksternal.
- Redesign total UI.
- Mengubah total arsitektur aplikasi tanpa kebutuhan.

Jika diperlukan placeholder, boleh dibuat TODO tanpa mengganggu fitur utama.

---

## 5. Platform dan Teknologi

Stack project:

- Framework: Next.js 14 App Router.
- Bahasa: TypeScript.
- Database: PostgreSQL.
- ORM: Prisma.
- Testing: Vitest dan React Testing Library.
- UI: style existing BARKAS+ dengan sidebar navy, topbar putih, card putih, background abu muda, border lembut, tab, badge, dan tabel.

Catatan teknis:

- Jangan upgrade ke Next.js versi yang membutuhkan Node lebih tinggi jika environment belum siap.
- Jangan reset database tanpa izin.
- Jangan menghapus migration lama.
- Gunakan migration baru yang aman.

---

## 6. Role User

Role yang digunakan hanya 4:

```ts
SUPER_ADMIN
ADMIN_PUSAT
ADMIN_CABANG
KARYAWAN_CABANG
```

Tidak ada role lain kecuali klien meminta revisi baru.

---

## 7. Definisi Hak Akses per Role

### 7.1 SUPER_ADMIN

Role tertinggi untuk owner, tim IT core, CEO, direksi, atau pengelola utama sistem.

Akses:

- Dapat mengakses semua fitur dan data di sistem.
- Dapat melihat dashboard pusat.
- Dapat melihat dashboard cabang mana pun.
- Dapat melihat semua data semua cabang.
- Dapat input sparepart, barang bekas, dan SGA untuk semua cabang.
- Dapat edit data operasional semua cabang sesuai aturan lock transaksi.
- Dapat hapus/arsip data sesuai aturan aplikasi.
- Dapat mengakses menu Layak Jual dan membuat order jual.
- Dapat mengelola cabang.
- Dapat mengelola user.
- Dapat reset password user.
- Dapat export semua laporan.
- Tidak terikat pada cabang tertentu.

Batasan:

- SUPER_ADMIN awal dibuat melalui seed/manual database.
- Jangan membuat fitur pembuatan SUPER_ADMIN baru dari UI jika belum diminta.

### 7.2 ADMIN_PUSAT

Role operasional pusat. Admin Pusat memiliki akses all untuk kebutuhan operasional, tetapi bukan akses sistem tertinggi.

Akses:

- Masuk ke dashboard pusat.
- Dapat melihat semua cabang.
- Dapat melihat semua data sparepart, barang bekas, SGA, inventori, laporan, dan data per cabang.
- Dapat input sparepart, barang bekas, dan SGA untuk semua cabang.
- Dapat edit data operasional semua cabang sesuai aturan lock transaksi.
- Dapat hapus/arsip data operasional sesuai aturan aplikasi.
- Dapat mengakses menu Layak Jual dan membuat order jual untuk semua cabang.
- Dapat export semua laporan.
- Dapat menambah, mengedit, dan menonaktifkan cabang untuk kebutuhan operasional.
- Dapat melihat dan mengelola user cabang/admin biasa.
- Dapat reset password user cabang/admin biasa.
- Dapat mengatur branch user cabang.

Batasan:

- Tidak boleh membuat user dengan role `SUPER_ADMIN`.
- Tidak boleh melihat detail sensitif user `SUPER_ADMIN`.
- Tidak boleh mengubah, menonaktifkan, menghapus, atau reset password user `SUPER_ADMIN`.
- Tidak boleh mengubah role user menjadi `SUPER_ADMIN`.
- Tidak boleh mengakses setting sistem sensitif.
- Tidak boleh reset database.

### 7.3 ADMIN_CABANG

Role pengelola cabang/PIC cabang. Semua akses data dibatasi hanya untuk cabang miliknya.

Akses:

- Masuk ke dashboard cabang miliknya.
- Melihat data sparepart cabangnya sendiri.
- Melihat data barang bekas cabangnya sendiri.
- Melihat data SGA cabangnya sendiri.
- Input sparepart untuk cabangnya sendiri.
- Input barang bekas untuk cabangnya sendiri.
- Input SGA untuk cabangnya sendiri.
- Edit data cabangnya sendiri jika belum dikunci oleh status transaksi.
- Hapus/arsip data cabangnya sendiri jika belum dikunci pusat dan aturan role mengizinkan.
- Export laporan cabangnya sendiri.
- Melihat laporan cabangnya sendiri.
- Melihat profil cabangnya.
- Dapat melihat user KARYAWAN_CABANG di cabangnya sendiri jika fitur ini diaktifkan.

Batasan:

- Tidak boleh melihat data cabang lain.
- Tidak boleh input data untuk cabang lain.
- Tidak boleh mengubah `branchId` data.
- Tidak boleh memindahkan data ke cabang lain.
- Tidak boleh mengubah data master cabang seperti nama, kode, lokasi, status cabang.
- Tidak boleh melihat dashboard pusat.
- Tidak boleh mengakses menu Layak Jual.
- Tidak boleh membuat order jual sparepart, barang bekas, atau SGA.
- Tidak boleh mengubah status transaksi menjadi `DALAM_ORDER` atau `TERJUAL` secara manual.

### 7.4 KARYAWAN_CABANG

Role operasional harian di level cabang. Akses paling terbatas.

Akses:

- Masuk ke dashboard cabang miliknya.
- Melihat data cabangnya sendiri.
- Input sparepart untuk cabangnya sendiri.
- Input barang bekas untuk cabangnya sendiri.
- Input SGA untuk cabangnya sendiri.
- Melihat inventori cabangnya sendiri.
- Melihat laporan cabang sendiri jika diizinkan.

Batasan:

- Tidak boleh melihat data cabang lain.
- Tidak boleh melihat dashboard pusat.
- Tidak boleh mengakses menu Layak Jual.
- Tidak boleh membuat order jual.
- Tidak boleh hapus data.
- Tidak boleh mengelola user.
- Tidak boleh mengubah data cabang.
- Tidak boleh export laporan global/besar.
- Edit data untuk KARYAWAN_CABANG sebaiknya dibatasi. Untuk tahap aman: karyawan cukup input dan lihat.

---

## 8. Permission Matrix Final

| Fitur | SUPER_ADMIN | ADMIN_PUSAT | ADMIN_CABANG | KARYAWAN_CABANG |
|---|---:|---:|---:|---:|
| Login/logout | Ya | Ya | Ya | Ya |
| Dashboard pusat | Ya | Ya | Tidak | Tidak |
| Dashboard cabang sendiri | Ya | Ya | Ya | Ya |
| Lihat dashboard cabang mana pun | Ya | Ya | Tidak | Tidak |
| Lihat semua cabang | Ya | Ya | Tidak | Tidak |
| Lihat data semua cabang | Ya | Ya | Tidak | Tidak |
| Lihat data cabang sendiri | Ya | Ya | Ya | Ya |
| Input sparepart | Semua cabang | Semua cabang | Cabang sendiri | Cabang sendiri |
| Input barang bekas | Semua cabang | Semua cabang | Cabang sendiri | Cabang sendiri |
| Input SGA | Semua cabang | Semua cabang | Cabang sendiri | Cabang sendiri |
| Edit sparepart | Semua cabang | Semua cabang | Cabang sendiri terbatas | Tidak / terbatas |
| Edit barang bekas | Semua cabang | Semua cabang | Cabang sendiri terbatas | Tidak / terbatas |
| Edit SGA | Semua cabang | Semua cabang | Cabang sendiri terbatas | Tidak / terbatas |
| Hapus/arsip data | Ya | Ya | Terbatas cabang sendiri | Tidak |
| Menu Layak Jual | Ya | Ya | Tidak | Tidak |
| Buat order jual sparepart | Ya | Ya | Tidak | Tidak |
| Buat order jual barang bekas | Ya | Ya | Tidak | Tidak |
| Buat order jual SGA | Ya | Ya | Tidak | Tidak |
| Export semua laporan | Ya | Ya | Tidak | Tidak |
| Export laporan cabang sendiri | Ya | Ya | Ya | Opsional |
| Kelola cabang | Ya | Ya, operasional | Tidak | Tidak |
| Kelola user | Semua user | User cabang/admin biasa | Opsional karyawan cabang sendiri | Tidak |
| Reset password | Semua user | User cabang/admin biasa | Opsional karyawan cabang sendiri | Tidak |
| Setting sistem | Ya | Tidak | Tidak | Tidak |

---

## 9. Aturan Data Scope

Semua server action/API wajib menerapkan branch scope.

Aturan:

- `SUPER_ADMIN` dapat mengakses semua cabang.
- `ADMIN_PUSAT` dapat mengakses semua cabang.
- `ADMIN_CABANG` hanya dapat mengakses data dengan `branchId = session.user.branchId`.
- `KARYAWAN_CABANG` hanya dapat mengakses data dengan `branchId = session.user.branchId`.

Untuk role cabang:

- Server action wajib mengabaikan `branchId` dari client.
- `branchId` selalu diambil dari `session.user.branchId`.
- Jika `session.user.branchId` kosong, request wajib ditolak.
- Jika role cabang mencoba akses data cabang lain, request wajib ditolak.

Untuk role pusat:

- Server action boleh menerima `branchId` dari client.
- `branchId` wajib divalidasi ke master `Branch` aktif.
- Jika `branchId` tidak valid atau cabang nonaktif, request wajib ditolak.

Contoh helper:

```ts
function applyBranchScope(user, where) {
  if (user.role === "ADMIN_CABANG" || user.role === "KARYAWAN_CABANG") {
    if (!user.branchId) {
      throw new Error("User cabang tidak memiliki branchId.");
    }
    return { ...where, branchId: user.branchId };
  }
  return where;
}
```

Jangan hanya menyembunyikan menu di frontend. Backend/server action wajib aman.

---

## 10. Authentication

Minimal fitur authentication:

- Login page.
- Logout.
- Session user.
- Proteksi halaman dashboard.
- Redirect berdasarkan role.
- User inactive tidak boleh login.
- Password tidak boleh disimpan plaintext.
- Password harus disimpan dalam bentuk hash.
- Input password di login dan form user harus memiliki icon mata untuk show/hide password.

Rekomendasi:

- Auth.js / NextAuth.
- bcrypt untuk hash password.
- Session berbasis cookie.
- Prisma adapter jika cocok.

Redirect setelah login:

- `SUPER_ADMIN` → `/dashboard` mode pusat.
- `ADMIN_PUSAT` → `/dashboard` mode pusat.
- `ADMIN_CABANG` → `/dashboard` mode cabang.
- `KARYAWAN_CABANG` → `/dashboard` mode cabang.

Jika user belum login dan membuka halaman protected, redirect ke `/login`.

---

## 11. Route Minimal

Route minimal:

- `/login`
- `/dashboard`
- `/pendataan/sparepart`
- `/pendataan/barang-bekas`
- `/pendataan/sga`
- `/inventori`
- `/layak-jual`
- `/cabang`
- `/users`
- `/laporan`

Aturan:

- `/layak-jual` hanya boleh diakses `SUPER_ADMIN` dan `ADMIN_PUSAT`.
- User cabang yang mencoba membuka `/layak-jual` harus mendapat 403 atau redirect ke dashboard cabang.
- Route pusat wajib memfilter akses role.
- Route cabang wajib menampilkan data cabang sendiri.

---

## 12. Struktur Sidebar Final

### 12.1 Sidebar Pusat

Untuk `SUPER_ADMIN` dan `ADMIN_PUSAT`:

```text
MENU UTAMA
- Dashboard Pusat
- Pendataan Sparepart
- Pendataan Barang Bekas
- Pendataan SGA
- Inventori Semua Cabang
- Layak Jual

REFERENSI
- Data per Cabang
- Laporan

MANAJEMEN
- Manajemen Cabang
- Manajemen User

TOOLS
- Export CSV
- Cetak Laporan
```

Tambahan khusus `SUPER_ADMIN` jika fitur tersedia:

- Audit Log.
- Setting Sistem.

Jika audit log dan setting belum dibuat, jangan tampilkan aktif. Boleh placeholder disabled jika diminta.

### 12.2 Sidebar Cabang

Untuk `ADMIN_CABANG` dan `KARYAWAN_CABANG`:

```text
MENU UTAMA
- Dashboard Cabang
- Pendataan Sparepart
- Pendataan Barang Bekas
- Pendataan SGA
- Inventori Cabang

REFERENSI
- Laporan Cabang
- Profil Cabang

TOOLS
- Export CSV
- Cetak Laporan
```

Aturan sidebar cabang:

- Jangan tampilkan menu Layak Jual.
- Jangan tampilkan Manajemen Cabang.
- Jangan tampilkan Manajemen User untuk KARYAWAN_CABANG.
- Jangan tampilkan Tools > Input Barang Baru di sidebar.
- Tombol `+ Input Barang` di topbar tetap boleh ada.

---

## 13. Topbar `+ Input Barang`

Tombol `+ Input Barang` di topbar harus menampilkan pilihan:

- Sparepart Ex-Service.
- Barang Bekas / Material.
- SGA.

Untuk role pusat:

- Jika memilih Sparepart, user pusat wajib memilih cabang.
- Jika memilih Barang Bekas, user pusat wajib memilih cabang.
- Jika memilih SGA, user pusat wajib memilih cabang.

Untuk role cabang:

- Cabang otomatis dari `session.user.branchId`.
- Field cabang tidak perlu ditampilkan, atau tampil readonly.
- User cabang tidak boleh memilih cabang lain.

---

## 14. Modul Sparepart Ex-Service

### 14.1 Tujuan

Mencatat sparepart kendaraan yang dilepas dari kendaraan operasional dan menentukan apakah sparepart tersebut layak jual atau rusak/scrap.

### 14.2 Field Minimal

- No. PJPP.
- Cabang.
- Tanggal Lepas.
- Nama Sparepart.
- Kategori.
- Nopol Kendaraan.
- Kode Jenis Kendaraan.
- Jenis Kendaraan Lengkap.
- Kondisi Sparepart.
- Lokasi Penyimpanan.
- Keterangan.
- Status Transaksi.

### 14.3 Kategori Sparepart

Contoh kategori:

- Ban.
- Filter & Oli.
- Rem & Kampas.
- Transmisi.
- Mesin.
- Elektrikal.
- Others.

### 14.4 Status Kondisi Sparepart

- `LAYAK_JUAL`
- `RUSAK`

Label UI:

- LAYAK JUAL.
- RUSAK.

### 14.5 Status Transaksi Sparepart

- `TERSEDIA`
- `DALAM_ORDER`
- `TERJUAL`

Aturan:

- Sparepart `LAYAK_JUAL` + `TERSEDIA` bisa dijual oleh role pusat.
- Sparepart `RUSAK` tidak masuk Layak Jual.
- Sparepart `DALAM_ORDER` tidak bisa dijual ulang.
- Sparepart `TERJUAL` tidak bisa dijual ulang.
- Sparepart `DALAM_ORDER` atau `TERJUAL` tidak boleh diedit bebas.
- Server/API wajib menolak perubahan status/condition yang melanggar aturan.

---

## 15. Modul Barang Bekas / Material

### 15.1 Tujuan

Mencatat barang non-sparepart/material operasional yang sudah tidak digunakan dan bisa dipantau status kelayakannya.

### 15.2 Field Minimal

- Kode Barang Bekas.
- Tanggal Input.
- Cabang/Lokasi Asal.
- Nama/Deskripsi Barang.
- Kategori.
- Jumlah/Qty.
- Satuan.
- Estimasi Berat.
- Estimasi Harga Jual.
- Kondisi.
- Lokasi Penyimpanan.
- PIC Input.
- Keterangan.
- Status Transaksi.

### 15.3 Kategori Barang Bekas

Contoh kategori:

- Kardus & Karton.
- Plastik.
- Besi & Logam.
- Kertas & Arsip.
- Kayu & Palet.
- Elektronik Bekas.
- Tekstil & Kain.
- Kaca.
- Lainnya.

### 15.4 Status Kondisi Barang Bekas

- `LAYAK_JUAL`
- `TIDAK_LAYAK`

### 15.5 Aturan Jual Barang Bekas

Barang Bekas bisa dijual sebagian.

Aturan:

- Qty dijual tidak boleh melebihi qty tersedia.
- Jika sebagian terjual, sisa qty tetap tersedia.
- Jika semua qty habis, status menjadi `TERJUAL` atau `HABIS` sesuai implementasi existing.
- Tombol aksi dapat berupa `Jual`, `Jual Sisa`, `Dalam Order`, atau `Terjual` sesuai status.
- Menu Layak Jual hanya untuk role pusat.
- Role cabang tidak boleh membuat order jual barang bekas.

---

## 16. Modul SGA

### 16.1 Tujuan

Mencatat barang SGA berdasarkan Nomor TLS sebagai identitas unik, memantau status kelayakan, dan memungkinkan pusat memproses order jual jika SGA layak jual.

SGA menjadi modul ketiga yang sejajar dengan:

1. Sparepart.
2. Barang Bekas.
3. SGA.

### 16.2 Field Final Pendataan SGA

Field SGA final:

- Tanggal Input.
- Nomor TLS.
- Cabang.
- Nama Barang.
- Jumlah.
- PIC Input.
- Status Kelayakan.
- Keterangan.
- Status Transaksi.

Field yang tidak boleh dibuat:

- Kode SGA.
- Satuan.

Keputusan:

- Nomor TLS adalah kode unik utama untuk SGA.
- Tidak perlu field Kode SGA karena Nomor TLS sudah menjadi identitas unik.
- Satuan tidak perlu karena SGA dijual borongan.
- Jumlah hanya informasi jumlah barang dalam satu data SGA, bukan untuk jual sebagian.

### 16.3 Validasi Nomor TLS

Nomor TLS wajib unik secara global.

Validasi:

- Nomor TLS wajib diisi.
- Nomor TLS harus unik di database.
- Nomor TLS tidak boleh duplikat meskipun cabangnya berbeda.
- Jika user memasukkan Nomor TLS yang sudah ada, data tidak boleh disimpan.
- Sistem menampilkan notifikasi/toast:

```text
Nomor TLS sudah terdata. Silakan gunakan Nomor TLS lain.
```

Normalisasi Nomor TLS:

- Trim spasi awal/akhir.
- Ubah menjadi uppercase.
- Duplikat beda kapital tetap dianggap sama.

Contoh yang harus dianggap sama:

```text
tls-2026-001
TLS-2026-001
 TLS-2026-001 
```

### 16.4 Status SGA

Status Kelayakan:

```ts
LAYAK_JUAL
TIDAK_LAYAK
```

Label UI:

- LAYAK JUAL.
- TIDAK LAYAK.

Status Transaksi:

```ts
TERSEDIA
DALAM_ORDER
TERJUAL
```

Label UI:

- Tersedia.
- Dalam Order.
- Terjual.

Default saat data SGA baru dibuat:

```text
Status Transaksi = TERSEDIA
```

### 16.5 Aturan Jual SGA

SGA dijual borongan.

Artinya:

- Tidak ada jual sebagian.
- Tidak ada jual sisa.
- Tidak ada qty tersedia.
- Tidak ada satuan.
- Satu Nomor TLS hanya bisa memiliki satu status transaksi aktif.

Aturan aksi:

| Status Kelayakan | Status Transaksi | Aksi |
|---|---|---|
| LAYAK_JUAL | TERSEDIA | Tampilkan tombol Jual untuk role pusat |
| LAYAK_JUAL | DALAM_ORDER | Tampilkan badge/tombol disabled Dalam Order |
| LAYAK_JUAL | TERJUAL | Tampilkan badge/tombol disabled Terjual |
| TIDAK_LAYAK | TERSEDIA | Tidak ada tombol Jual dan tidak masuk Layak Jual |

Server action/API wajib menolak:

- SGA `TIDAK_LAYAK` dijual.
- SGA `DALAM_ORDER` dijual ulang.
- SGA `TERJUAL` dijual ulang.
- Role cabang membuat order jual SGA.

### 16.6 Hak Akses SGA per Role

#### SUPER_ADMIN

- Melihat semua SGA semua cabang.
- Input SGA untuk semua cabang.
- Edit SGA semua cabang jika belum `DALAM_ORDER` / `TERJUAL`.
- Hapus SGA semua cabang jika belum `DALAM_ORDER` / `TERJUAL`.
- Membuat order jual SGA.
- Melihat Dashboard, Inventori, Data per Cabang, Layak Jual, dan Laporan tab SGA semua cabang.

#### ADMIN_PUSAT

- Melihat semua SGA semua cabang.
- Input SGA untuk semua cabang.
- Edit SGA semua cabang jika belum `DALAM_ORDER` / `TERJUAL`.
- Hapus SGA semua cabang jika belum `DALAM_ORDER` / `TERJUAL`.
- Membuat order jual SGA.
- Melihat Dashboard, Inventori, Data per Cabang, Layak Jual, dan Laporan tab SGA semua cabang.

#### ADMIN_CABANG

- Melihat SGA cabangnya sendiri.
- Input SGA untuk cabangnya sendiri.
- Edit SGA cabangnya sendiri jika belum `DALAM_ORDER` / `TERJUAL`.
- Hapus SGA cabangnya sendiri jika belum `DALAM_ORDER` / `TERJUAL` dan aturan role mengizinkan.
- Tidak boleh melihat SGA cabang lain.
- Tidak boleh memilih cabang lain saat input.
- Tidak boleh membuat order jual SGA.
- Tidak boleh mengubah status transaksi menjadi `DALAM_ORDER` / `TERJUAL` secara manual.

#### KARYAWAN_CABANG

- Melihat SGA cabangnya sendiri.
- Input SGA untuk cabangnya sendiri.
- Melihat dashboard/inventori/laporan SGA cabangnya sendiri.
- Tidak boleh melihat SGA cabang lain.
- Tidak boleh memilih cabang lain saat input.
- Tidak boleh membuat order jual SGA.
- Tidak boleh hapus SGA.
- Untuk tahap aman, karyawan cukup input dan lihat.

---

## 17. Dashboard Pusat

Dashboard pusat digunakan oleh:

- `SUPER_ADMIN`
- `ADMIN_PUSAT`

Tujuan: menjadi command center untuk monitoring semua cabang.

### 17.1 Tab Dashboard Pusat

Dashboard Pusat wajib menggunakan tab:

```text
[Sparepart] [Barang Bekas] [SGA]
```

Saat tab Sparepart aktif:

- Tampilkan statistik sparepart.
- Tampilkan tabel sparepart terbaru.
- Tampilkan distribusi kondisi sparepart.
- Tampilkan ringkasan per cabang, kategori, dan jenis kendaraan.

Saat tab Barang Bekas aktif:

- Tampilkan statistik barang bekas.
- Tampilkan tabel barang bekas terbaru.
- Tampilkan distribusi kondisi barang bekas.
- Tampilkan ringkasan per kategori, cabang, dan satuan.

Saat tab SGA aktif:

- Tampilkan statistik SGA.
- Tampilkan tabel SGA terbaru.
- Tampilkan distribusi status kelayakan SGA.
- Tampilkan ringkasan per cabang dan per PIC Input.

### 17.2 Stat Card Dashboard Pusat tab SGA

Stat card SGA:

- Total Data SGA.
- Total Jumlah Barang.
- Layak Jual.
- Tidak Layak.
- Dalam Order.
- Terjual.

Jika layout terlalu padat, boleh digabung menjadi 5 card:

- Total SGA.
- Total Jumlah.
- Layak Jual.
- Tidak Layak.
- Dalam Order / Terjual.

### 17.3 Tabel Data SGA Terbaru

Kolom:

- Tanggal Input.
- Nomor TLS.
- Cabang.
- Nama Barang.
- Jumlah.
- PIC Input.
- Status Kelayakan.
- Status Transaksi.

---

## 18. Dashboard Cabang

Dashboard cabang digunakan oleh:

- `ADMIN_CABANG`
- `KARYAWAN_CABANG`

Tujuan: menjadi panel operasional cabang sendiri.

### 18.1 Tab Dashboard Cabang

Dashboard Cabang wajib menggunakan tab:

```text
[Sparepart] [Barang Bekas] [SGA]
```

Data yang tampil hanya data cabang login.

### 18.2 Identitas Cabang

Tampilkan:

- Nama cabang.
- Kode cabang.
- Regional.
- Kota/alamat jika ada.
- Status cabang aktif.

### 18.3 Stat Card Cabang

Wajib tampil sesuai tab aktif.

Untuk tab Sparepart:

- Total Sparepart Cabang.
- Kondisi Layak.
- Rusak.
- Input Bulan Ini.

Untuk tab Barang Bekas:

- Total Barang Bekas Cabang.
- Total Qty.
- Kondisi Layak.
- Tidak Layak.

Untuk tab SGA:

- Total SGA.
- Total Jumlah.
- Layak Jual.
- Tidak Layak.
- Dalam Order.
- Terjual.

Catatan:

- Gunakan istilah `Kondisi Layak`, bukan `Layak Jual Cabang`, agar tidak terlihat seperti cabang bisa menjual.
- Cabang tidak memiliki tombol jual.

### 18.4 Quick Input Cabang

Tampilkan tombol:

- Input Sparepart.
- Input Barang Bekas.
- Input SGA.

Cabang tidak memilih cabang saat input. `branchId` otomatis dari session user.

---

## 19. Pendataan

### 19.1 Pendataan Sparepart

Fitur:

- Tambah sparepart.
- Edit sparepart jika belum terkunci transaksi.
- Detail sparepart.
- Hapus/arsip sesuai role dan status.
- Filter kondisi, kategori, cabang, jenis kendaraan, search.
- Export CSV.

### 19.2 Pendataan Barang Bekas

Fitur:

- Tambah barang bekas.
- Edit barang bekas jika belum terkunci transaksi.
- Detail barang bekas.
- Hapus/arsip sesuai role dan status.
- Filter kondisi, kategori, cabang, search.
- Export CSV.

### 19.3 Pendataan SGA

Fitur:

- Tambah SGA.
- Edit SGA jika belum `DALAM_ORDER` / `TERJUAL`.
- Detail SGA.
- Hapus SGA jika belum `DALAM_ORDER` / `TERJUAL` dan role mengizinkan.
- Filter status kelayakan.
- Filter status transaksi.
- Filter cabang untuk role pusat.
- Search Nomor TLS.
- Search nama barang / PIC Input.
- Export CSV SGA.

Kolom tabel:

- No.
- Tanggal Input.
- Nomor TLS.
- Cabang.
- Nama Barang.
- Jumlah.
- PIC Input.
- Status Kelayakan.
- Status Transaksi.
- Keterangan.
- Aksi.

Form Tambah/Edit SGA:

- Tanggal Input wajib.
- Nomor TLS wajib dan unik.
- Cabang wajib untuk role pusat.
- Cabang otomatis untuk role cabang.
- Nama Barang wajib.
- Jumlah wajib > 0.
- PIC Input wajib.
- Status Kelayakan wajib.
- Keterangan opsional.
- Status Transaksi default `TERSEDIA`.

---

## 20. Inventori

### 20.1 Inventori Semua Cabang

Digunakan oleh role pusat.

Tab:

```text
[Sparepart] [Barang Bekas] [SGA]
```

Data yang tampil adalah semua cabang.

### 20.2 Inventori Cabang

Digunakan oleh role cabang.

Tab:

```text
[Sparepart] [Barang Bekas] [SGA]
```

Data yang tampil hanya cabang login.

### 20.3 Inventori tab SGA

Stat card:

- Total SGA.
- Total Jumlah.
- Layak Jual.
- Tidak Layak.
- Dalam Order.
- Terjual.

Tabel/ringkasan pusat:

1. Rekap SGA per Cabang:
   - Cabang.
   - Total Data SGA.
   - Total Jumlah.
   - Layak Jual.
   - Tidak Layak.
   - Dalam Order.
   - Terjual.

2. Rekap SGA per PIC Input:
   - PIC Input.
   - Total Data.
   - Total Jumlah.
   - Layak Jual.
   - Tidak Layak.

3. Tabel Semua SGA:
   - Tanggal Input.
   - Nomor TLS.
   - Cabang.
   - Nama Barang.
   - Jumlah.
   - PIC Input.
   - Status Kelayakan.
   - Status Transaksi.

Tabel cabang tidak menampilkan data cabang lain.

---

## 21. Layak Jual dan Order Jual

### 21.1 Aturan Umum

Menu Layak Jual hanya untuk:

- `SUPER_ADMIN`
- `ADMIN_PUSAT`

Menu Layak Jual tidak boleh tampil untuk:

- `ADMIN_CABANG`
- `KARYAWAN_CABANG`

Role cabang tidak boleh membuat order jual walaupun mencoba manipulasi request/API.

### 21.2 Tab Layak Jual

Menu Layak Jual wajib menggunakan tab:

```text
[Sparepart] [Barang Bekas] [SGA]
```

Tab Sparepart:

- Menampilkan sparepart `LAYAK_JUAL`.
- Aksi sesuai status transaksi.

Tab Barang Bekas:

- Menampilkan barang bekas `LAYAK_JUAL`.
- Mendukung jual sebagian dan jual sisa.

Tab SGA:

- Menampilkan SGA `LAYAK_JUAL`.
- SGA dijual borongan.
- Tidak ada jual sebagian.
- Tidak ada jual sisa.

### 21.3 Tabel Layak Jual SGA

Kolom:

- Tanggal Input.
- Nomor TLS.
- Cabang.
- Nama Barang.
- Jumlah.
- PIC Input.
- Keterangan.
- Status Transaksi.
- Aksi.

Aksi:

- Jika `TERSEDIA`: tombol Jual.
- Jika `DALAM_ORDER`: badge/tombol disabled Dalam Order.
- Jika `TERJUAL`: badge/tombol disabled Terjual.

### 21.4 Modal Order Jual SGA

Field readonly:

- Nomor TLS.
- Nama Barang.
- Cabang.
- Jumlah.
- PIC Input.

Field input:

- Nama Pembeli wajib.
- Tipe Pembeli opsional.
- Harga Jual wajib > 0.
- Tanggal Penjualan wajib/default hari ini.
- Catatan opsional.

Saat order dibuat:

- Status transaksi SGA berubah menjadi `DALAM_ORDER` atau mengikuti pola pipeline existing.
- Jika order disetujui/selesai, status transaksi menjadi `TERJUAL`.
- SGA yang sudah `DALAM_ORDER` atau `TERJUAL` tidak boleh dibuat order lagi.

---

## 22. Data per Cabang

Data per Cabang digunakan oleh role pusat untuk melihat ringkasan tiap cabang.

Tab:

```text
[Sparepart] [Barang Bekas] [SGA]
```

### 22.1 Data per Cabang tab Sparepart

Tampilkan ringkasan:

- Nama Cabang.
- Total Sparepart.
- Layak Jual.
- Rusak.
- Update Terakhir.

### 22.2 Data per Cabang tab Barang Bekas

Tampilkan ringkasan:

- Nama Cabang.
- Total Barang Bekas.
- Total Qty.
- Layak Jual.
- Tidak Layak.
- Update Terakhir.

### 22.3 Data per Cabang tab SGA

Tampilkan ringkasan per cabang:

- Nama Cabang.
- Total Data SGA.
- Total Jumlah Barang.
- Layak Jual.
- Tidak Layak.
- Dalam Order.
- Terjual.
- Update Terakhir.

Jika detail cabang dibuka, tabel SGA cabang:

- Tanggal Input.
- Nomor TLS.
- Nama Barang.
- Jumlah.
- PIC Input.
- Status Kelayakan.
- Status Transaksi.
- Aksi.

---

## 23. Laporan

### 23.1 Laporan Pusat

Digunakan oleh:

- `SUPER_ADMIN`
- `ADMIN_PUSAT`

Tab:

```text
[Sparepart] [Barang Bekas] [SGA]
```

Data yang tampil adalah semua cabang.

### 23.2 Laporan Cabang

Digunakan oleh:

- `ADMIN_CABANG`
- `KARYAWAN_CABANG` jika diizinkan.

Tab:

```text
[Sparepart] [Barang Bekas] [SGA]
```

Data yang tampil hanya cabang login.

### 23.3 Laporan tab SGA

Stat card:

- Total SGA.
- Total Jumlah.
- Layak Jual.
- Tidak Layak.
- Dalam Order.
- Terjual.

Rekap:

- Rekap per Cabang.
- Rekap per PIC Input.
- Rekap per Status Kelayakan.
- Rekap per Status Transaksi.
- Tren input SGA per bulan.

Tabel lengkap:

- Tanggal Input.
- Nomor TLS.
- Cabang.
- Nama Barang.
- Jumlah.
- PIC Input.
- Status Kelayakan.
- Status Transaksi.
- Keterangan.

Export CSV:

- Role pusat export semua data sesuai tab aktif.
- Role cabang export data cabangnya sendiri sesuai tab aktif.
- Minimal tersedia export CSV untuk data SGA.

Cetak:

- Cetak laporan mengikuti tab aktif jika memungkinkan.

---

## 24. Manajemen Cabang

Untuk:

- `SUPER_ADMIN`
- `ADMIN_PUSAT`

Fitur:

- List cabang.
- Tambah cabang.
- Edit cabang.
- Nonaktifkan cabang.
- Search cabang.
- Filter aktif/nonaktif.

Field form cabang final:

- Kode Cabang.
- Nama Cabang.
- Regional.
- Kota.
- Status aktif.

Catatan revisi:

- Field Telepon dan Alamat cabang tidak perlu ditampilkan di form tambah/edit jika klien meminta dihapus.
- Jika field masih ada di database, boleh dibiarkan untuk kompatibilitas, tapi tidak perlu tampil di UI.
- Cabang yang sudah punya data tidak boleh dihapus permanen.
- Gunakan nonaktif/soft delete.

---

## 25. Manajemen User

Untuk:

- `SUPER_ADMIN`
- `ADMIN_PUSAT`

Fitur:

- List user.
- Tambah user.
- Edit user.
- Nonaktifkan user.
- Reset password.
- Assign role.
- Assign branch untuk user cabang.

Aturan:

- Email wajib unik.
- Email dinormalisasi lowercase dan trim.
- Password wajib di-hash.
- `ADMIN_CABANG` dan `KARYAWAN_CABANG` wajib punya `branchId`.
- `ADMIN_PUSAT` dan `SUPER_ADMIN` tidak wajib punya `branchId`.
- UI create user tidak menyediakan opsi role `SUPER_ADMIN` untuk `ADMIN_PUSAT`.
- `ADMIN_PUSAT` tidak boleh melihat/mengedit/reset password/menonaktifkan `SUPER_ADMIN`.
- Field password di login, tambah user, edit/reset password wajib punya icon mata show/hide.

---

## 26. Model Database Minimal

Gunakan model existing `Branch`. Jangan membuat model baru bernama `Cabang`.

### 26.1 User

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

enum Role {
  SUPER_ADMIN
  ADMIN_PUSAT
  ADMIN_CABANG
  KARYAWAN_CABANG
}
```

### 26.2 Branch

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
  sgaItems   SgaItem[]
}
```

### 26.3 SGA

```prisma
model SgaItem {
  id                 String   @id @default(cuid())
  tlsNumber          String   @unique
  inputDate          DateTime
  branchId           String
  itemName           String
  quantity           Int
  picName            String
  eligibilityStatus  SgaEligibilityStatus
  transactionStatus  SgaTransactionStatus @default(TERSEDIA)
  note               String?
  createdById        String?
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  branch             Branch   @relation(fields: [branchId], references: [id])
  createdBy          User?    @relation(fields: [createdById], references: [id])
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

### 26.4 Order Jual SGA

```prisma
model SgaSaleOrder {
  id          String   @id @default(cuid())
  sgaItemId   String
  buyerName   String
  buyerType   String?
  salePrice   Int
  saleDate    DateTime
  status      SaleOrderStatus
  note        String?
  createdById String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  sgaItem     SgaItem @relation(fields: [sgaItemId], references: [id])
  createdBy   User?   @relation(fields: [createdById], references: [id])
}
```

Jika sudah ada enum `SaleOrderStatus` untuk sparepart/barang bekas, gunakan ulang jika cocok. Jangan membuat enum duplikat tanpa kebutuhan.

---

## 27. Seed Data

Seed harus idempotent.

Aturan:

- Jangan gunakan `deleteMany` destruktif untuk data existing.
- Gunakan `upsert` berdasarkan key unik.
- Untuk SGA, gunakan `tlsNumber` sebagai key unik.

Contoh seed SGA:

1. `TLS-2026-001`
   - Cabang: IGR CIPUTAT
   - Nama Barang: Meja kantor bekas
   - Jumlah: 5
   - PIC: Ardi
   - Status Kelayakan: LAYAK_JUAL
   - Status Transaksi: TERSEDIA

2. `TLS-2026-002`
   - Cabang: IGR BANDUNG KOTA
   - Nama Barang: Kursi tunggu bekas
   - Jumlah: 10
   - PIC: Budi
   - Status Kelayakan: LAYAK_JUAL
   - Status Transaksi: TERSEDIA

3. `TLS-2026-003`
   - Cabang: GW Cargo TGR
   - Nama Barang: Rak arsip rusak
   - Jumlah: 2
   - PIC: Sari
   - Status Kelayakan: TIDAK_LAYAK
   - Status Transaksi: TERSEDIA

---

## 28. UX dan UI Guidelines

Target user aplikasi adalah pengguna operasional usia 25–50 tahun.

Aturan UX:

- Mudah dibaca.
- Tidak terlalu ramai.
- Navigasi tab jelas.
- Button aksi jelas.
- Warna status konsisten.
- Tabel mudah discan.
- Hindari animasi berlebihan.
- Jangan membuat user scroll terlalu jauh untuk melihat ringkasan utama.
- Hindari chart kompleks.
- Gunakan teks jelas, bukan label terlalu teknis.

Style existing yang harus dipertahankan:

- Sidebar navy.
- Topbar putih.
- Background abu muda.
- Card putih.
- Border lembut.
- Badge status.
- Tab switch.
- Soft shadow.
- Rounded corners.

Aturan spacing card:

- Card padding 20–24px untuk card analitik yang padat.
- Gap antar progress row 12–14px.
- Margin sebelum summary box 16–20px.
- Hindari fixed height yang terlalu kecil.
- Gunakan `font-variant-numeric: tabular-nums;` untuk angka statistik agar digit rata.
- Pastikan angka seperti `182` tampil sebagai satu value utuh, bukan per digit.

---

## 29. Export dan Print

Export CSV:

- Sparepart.
- Barang Bekas.
- SGA.
- Laporan sesuai tab aktif jika memungkinkan.

Aturan role:

- Pusat bisa export semua data.
- Cabang hanya export data cabangnya sendiri.
- KARYAWAN_CABANG export besar/global tidak diizinkan kecuali diputuskan klien.

Print/Cetak:

- Cetak laporan mengikuti tab aktif jika memungkinkan.
- Jika belum bisa, cetak halaman aktif saja.

---

## 30. Testing Requirements

Project wajib menjaga test existing tetap passed.

Command verifikasi:

```bash
npm run test
npm run lint
npm run typecheck
npm run build
```

### 30.1 Unit Test

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
- Normalisasi Nomor TLS.
- Validasi Nomor TLS duplikat.
- Validasi jumlah SGA > 0.

### 30.2 Integration Test

Wajib test:

- User cabang hanya dapat data `branchId` miliknya.
- Admin pusat dapat semua data.
- Super admin dapat semua data.
- Karyawan cabang tidak bisa hapus data.
- Admin cabang tidak bisa akses data cabang lain.
- Admin pusat tidak bisa mengubah akun super admin.
- Admin cabang tidak bisa mengakses `/layak-jual`.
- Karyawan cabang tidak bisa mengakses `/layak-jual`.
- Admin cabang tidak bisa membuat order jual melalui server action/API.
- Karyawan cabang tidak bisa membuat order jual melalui server action/API.
- SUPER_ADMIN bisa membuat SGA.
- ADMIN_PUSAT bisa membuat SGA.
- ADMIN_CABANG bisa membuat SGA untuk cabangnya sendiri.
- KARYAWAN_CABANG bisa membuat SGA untuk cabangnya sendiri.
- Role cabang tidak bisa membuat SGA untuk cabang lain.
- TLS duplikat ditolak walaupun beda kapital/spasi.
- SGA baru default `TERSEDIA`.
- SGA `LAYAK_JUAL` + `TERSEDIA` muncul di Layak Jual tab SGA untuk pusat.
- SGA `TIDAK_LAYAK` tidak muncul di Layak Jual tab SGA.
- SGA `DALAM_ORDER` tidak bisa dijual ulang.
- SGA `TERJUAL` tidak bisa dijual ulang.
- SGA `TERJUAL` tidak bisa diedit bebas.

### 30.3 Component/UI Test

Wajib test:

- Login form.
- Login password memiliki icon mata.
- Tambah user password memiliki icon mata.
- Sidebar pusat menampilkan Pendataan SGA.
- Sidebar cabang menampilkan Pendataan SGA.
- Sidebar cabang tidak menampilkan Layak Jual.
- Dashboard Pusat punya tab SGA.
- Dashboard Cabang punya tab SGA.
- Inventori punya tab SGA.
- Data per Cabang punya tab SGA.
- Laporan punya tab SGA.
- Form Tambah SGA tidak menampilkan Kode SGA.
- Form Tambah SGA tidak menampilkan Satuan.
- Field Nomor TLS wajib tampil.
- Field Cabang untuk role cabang readonly/auto-filled.
- Jika TLS duplikat, muncul notifikasi error.

---

## 31. Acceptance Criteria Final

Update dianggap berhasil jika:

- User tidak bisa membuka dashboard tanpa login.
- User bisa login dan logout.
- Password disimpan dalam bentuk hash.
- Role tersedia: `SUPER_ADMIN`, `ADMIN_PUSAT`, `ADMIN_CABANG`, `KARYAWAN_CABANG`.
- SUPER_ADMIN dapat melihat semua data.
- ADMIN_PUSAT dapat mengakses semua data operasional semua cabang.
- ADMIN_CABANG hanya dapat melihat/mengelola data cabangnya sendiri.
- KARYAWAN_CABANG hanya dapat input dan melihat data cabangnya sendiri.
- User cabang tidak bisa melihat data cabang lain walaupun mencoba manipulasi request.
- Menu Layak Jual hanya tampil untuk SUPER_ADMIN dan ADMIN_PUSAT.
- ADMIN_CABANG dan KARYAWAN_CABANG tidak melihat menu Layak Jual.
- ADMIN_CABANG dan KARYAWAN_CABANG tidak dapat membuat order jual.
- Cabang tetap dapat melihat status kondisi barang melalui Pendataan, Dashboard, Inventori, dan Laporan.
- Dashboard pusat memiliki tab Sparepart, Barang Bekas, dan SGA.
- Dashboard cabang memiliki tab Sparepart, Barang Bekas, dan SGA.
- Inventori pusat/cabang memiliki tab Sparepart, Barang Bekas, dan SGA.
- Data per Cabang memiliki tab Sparepart, Barang Bekas, dan SGA.
- Laporan pusat/cabang memiliki tab Sparepart, Barang Bekas, dan SGA.
- Pendataan SGA tersedia untuk pusat dan cabang sesuai scope role.
- Nomor TLS menjadi identitas unik SGA.
- Form SGA tidak memiliki field Kode SGA.
- Form SGA tidak memiliki field Satuan.
- TLS duplikat ditolak dengan notifikasi jelas.
- SGA dijual borongan, tidak ada jual sebagian/jual sisa.
- Layak Jual tab SGA hanya tersedia untuk role pusat.
- Fitur sparepart dan barang bekas existing tetap berjalan.
- UI tidak berubah besar-besaran.
- Test existing dan test baru passed.
- Build production berhasil.

---

## 32. Instruksi Khusus untuk Codex

Sebelum coding:

1. Baca PRD final ini sampai selesai.
2. Audit struktur project.
3. Baca file testing existing.
4. Buat implementation plan singkat.
5. Jangan implement fitur di luar scope.
6. Jangan redesign besar-besaran.
7. Jangan menghapus data/migration.
8. Jaga fitur sparepart dan barang bekas tetap aman.
9. Tambahkan test sebelum/selama implementasi.
10. Setelah selesai jalankan test, lint, typecheck, dan build.

Jika ada bagian ambigu:

- Pilih solusi paling kecil dan aman.
- Jangan membuat fitur tambahan tanpa diminta.
- Tambahkan TODO jika fitur belum masuk scope.
- Jangan menebak nama model/tabel tanpa mengecek schema Prisma.
- Jangan menebak route tanpa mengecek struktur project.

---

## 33. Command yang Dilarang Tanpa Izin

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

```bash
npx prisma migrate dev --name add_sga_module_v5
```

Jangan hapus migration lama.

---

## 34. Command Verifikasi Akhir

Setelah implementasi:

```bash
npm run test
npm run lint
npm run typecheck
npm run build
```

Semua harus passed sebelum fitur dianggap selesai.

---

## 35. Ringkasan Keputusan Final v5

Keputusan final yang wajib diikuti:

1. Modul utama: Sparepart, Barang Bekas, SGA.
2. SGA tersedia untuk pusat dan cabang.
3. Pusat melihat semua cabang.
4. Cabang hanya melihat data cabangnya sendiri.
5. Pendataan SGA menjadi menu sendiri.
6. Dashboard, Inventori, Layak Jual, Data per Cabang, dan Laporan memakai tab SGA.
7. Layak Jual hanya untuk role pusat.
8. Cabang tidak boleh membuat order jual.
9. Nomor TLS adalah kode unik SGA.
10. Tidak ada Kode SGA.
11. Tidak ada Satuan SGA.
12. SGA dijual borongan.
13. TLS duplikat wajib ditolak.
14. Status transaksi SGA: `TERSEDIA`, `DALAM_ORDER`, `TERJUAL`.
15. Status kelayakan SGA: `LAYAK_JUAL`, `TIDAK_LAYAK`.
16. Jangan reset database.
17. Jangan redesign total aplikasi.
18. Jaga fitur existing tetap berjalan.
