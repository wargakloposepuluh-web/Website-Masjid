# SIMAS - Sistem Informasi Manajemen Administrasi Surat

Aplikasi web manajemen persuratan (surat masuk dan keluar) modern, responsif, dan repository-based yang siap dijalankan di localhost maupun dideploy ke Vercel, Docker, atau VPS.

## 🚀 Fitur Unggulan

1. **Generator Surat Keluar Otomatis (F4 / Folio Ready):**
   - Form ringkas: Perihal, Penerima, Inti pesan, Acara/Rincian Kegiatan (Hari/Tanggal, Waktu, Tempat, Agenda).
   - Penomoran surat otomatis dengan format dinamis (contoh: `{nomor}/DKM-AM/{romawi}/{tahun}`).
   - Live Preview interaktif lembar kertas F4 (215 mm x 330 mm) dengan kontrol zoom skala tampilan.
   - Siap cetak ke printer fisik atau simpan ke PDF dengan presisi margin standar Indonesia.

2. **Pengaturan & Kustomisasi Template Visual:**
   - Margin kertas F4 (Atas, Bawah, Kiri, Kanan dalam cm).
   - Pengaturan Tipografi (Font Family, Font Size, Line Spacing, Paragraf Spacing).
   - Kop Surat: Mode Teks Resmi dengan 2 Logo & garis pemisah ganda tebal-tipis, ATAU Upload Banner Gambar utuh.
   - Pengesahan: Input nama penandatangan (Ketua & Sekretaris), upload PNG tanda tangan dan stempel cap, serta slider penyesuaian posisi overlay stempel.

3. **Buku Agenda Surat Masuk:**
   - Pencatatan: Nomor agenda otomatis, nomor surat asal, instansi pengirim, tanggal surat, tanggal terima, perihal, dan disposisi pimpinan.
   - Upload berkas scan fisik surat masuk (PDF, JPG, PNG) ke folder lokal `public/uploads/`.
   - Filter tanggal penerimaan, status, dan pencarian cepat.

4. **Arsip & Riwayat:**
   - Tabel riwayat surat keluar dan masuk.
   - Modal pratinjau cepat langsung dari tabel.
   - Fitur edit ulang dan hapus data.

5. **Kemudahan Menjalankan:**
   - Shortcut sekali-klik: `Jalankan_Aplikasi.bat` untuk pengguna Windows.

---

## 💻 Tech Stack

- **Framework:** Next.js 14 (App Router) + React + TypeScript
- **Styling:** Tailwind CSS + Lucide Icons
- **Database:** SQLite via Prisma ORM (`prisma/dev.db`)
- **Penyimpanan Berkas:** Local storage di `public/uploads/`
- **Container:** Dockerfile & Docker Compose

---

## 🛠️ Menjalankan di Localhost

### Cara 1: Menggunakan Shortcut (Rekomendasi untuk Pengguna Windows)
Cukup klik dua kali file **`Jalankan_Aplikasi.bat`**. Browser akan terbuka secara otomatis di `http://localhost:3000`.

### Cara 2: Melalui Terminal / CLI
```bash
# 1. Install dependensi
npm install

# 2. Sinkronisasi database SQLite
npx prisma db push

# 3. Seed data awal
node prisma/seed.js

# 4. Jalankan development server
npm run dev
```
Buka browser di `http://localhost:3000`.

---

## 🐳 Menjalankan dengan Docker

```bash
docker-compose up -d --build
```
Aplikasi akan aktif di port `3000` dengan volume persisten untuk database dan file upload.

---

## ☁️ Deploy ke Vercel

1. Push kode ini ke repository Git (GitHub / GitLab).
2. Hubungkan repository ke dashboard Vercel.
3. Untuk deployment serverless seperti Vercel di mana file system bersifat ephemeral (read-only saat runtime), disarankan:
   - Mengalihkan `url` database Prisma di `prisma/schema.prisma` ke cloud database (misalnya Turso SQLite / Supabase PostgreSQL).
   - Mengalihkan folder upload ke Cloudinary, AWS S3, atau Vercel Blob.
   - ATAU deploy secara utuh di VPS murah (Ubuntu/Debian) menggunakan Docker atau PM2 agar SQLite dan folder upload lokal tetap berfungsi 100% tanpa biaya tambahan.
