## Code Quality & Client Handover Rules

- Kode harus mudah dibaca oleh developer lain.
- Hindari duplikasi logic antar modul Sparepart, Barang Bekas, dan SGA.
- Gunakan reusable component/helper jika ada pola yang sama.
- Jangan mengubah business rules tanpa alasan jelas.
- Jangan menghapus fitur lama tanpa persetujuan.
- Setelah perubahan besar, jalankan test/build/lint jika tersedia.
- Setiap perubahan harus dijelaskan: file yang diubah, alasan, risiko, dan cara mengecek manual.

## Change Tracking Rules

Every time files are modified, Codex must update:

```txt
docs/CHANGELOG_CODEX.md