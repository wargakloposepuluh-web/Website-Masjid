# 📖 PANDUAN PENGGUNAAN SISTEM PERSURATAN (SIMAS)
**Aplikasi Administrasi Surat Masuk & Surat Keluar (Standar Kertas F4 / Folio)**

Panduan ini dibuat khusus agar Anda dapat menggunakan aplikasi ini dengan sangat mudah tanpa perlu memahami pemrograman (coding).

---

## 🚀 1. Cara Menjalankan Aplikasi (Sangat Mudah!)

Anda tidak perlu membuka terminal atau mengetik perintah apapun. Cukup:

1. Buka folder proyek ini di komputer Anda (`d:\Website Masjid`).
2. Temukan file bernama:
   👉 **`Jalankan_Aplikasi.bat`**
3. **Klik ganda (Double-Click)** file tersebut.
4. Sebuah jendela hitam akan muncul mempersiapkan sistem, dan **Google Chrome / Microsoft Edge akan terbuka secara otomatis** menuju alamat:
   👉 `http://localhost:3000`
5. **Selesai!** Aplikasi sudah langsung siap Anda gunakan.

> 💡 **Catatan Penting:**  
> Selama Anda menggunakan aplikasi, **jangan tutup jendela hitam tersebut**. Jika Anda sudah selesai bekerja dan ingin mematikan aplikasi, barulah tutup jendela hitam itu.

---

## ✉️ 2. Cara Membuat Surat Keluar Otomatis (Format F4)

1. Klik menu **"Buat Surat Keluar"** pada menu di sebelah kiri.
2. Anda akan melihat dua bagian tampilan:
   - **Sisi Kiri:** Formulir pengisian data sederhana.
   - **Sisi Kanan:** Lembar surat F4 yang langsung berubah secara *live* saat Anda mengetik.
3. Isi informasi penting:
   - **Nomor Surat:** Otomatis dihitung oleh sistem. Jika Anda ingin nomor urut baru, klik tombol *Refresh Nomor*.
   - **Perihal & Tujuan:** Masukkan perihal surat dan kepada siapa surat ditujukan (misal: *Yth. Pengurus DKM*, *di Tempat*).
   - **Isi Surat:** Tulis pesan atau inti surat Anda.
   - **Rincian Acara:** Jika surat berisi undangan rapat/kegiatan, centang kotak *"Sertakan Rincian Acara"* lalu isi Hari, Waktu, Tempat, dan Agenda.
   - **Pengesahan:** Centang opsi apakah ingin menyertakan Scan Tanda Tangan dan Cap Stempel.
4. Klik tombol **"Cetak / Simpan PDF"** di atas lembar preview untuk langsung mencetak atau menyimpannya sebagai file PDF di komputer Anda.
5. Klik **"Simpan ke Arsip"** agar surat tersimpan rapi di riwayat aplikasi.

---

## 📥 3. Cara Mencatat Surat Masuk (Buku Agenda)

1. Klik menu **"Surat Masuk"** pada menu sebelah kiri.
2. Klik tombol **"+ Catat Surat Masuk Baru"**.
3. Isi formulir:
   - **Nomor Surat Asal:** Nomor yang tertera pada surat fisik yang Anda terima.
   - **Pengirim:** Nama instansi, kantor, atau perorangan yang mengirim surat.
   - **Perihal:** Ringkasan isi surat.
   - **Disposisi:** Masukkan instruksi pimpinan (misal: *"Diteruskan ke Sie Dakwah untuk ditindaklanjuti"*).
   - **Unggah Berkas Fisik:** Anda dapat mengunggah file hasil foto atau scan surat (format PDF, JPG, atau PNG).
4. Klik **"Simpan Catatan"**.
5. Surat akan langsung masuk ke tabel buku agenda. Anda dapat mencari surat kapan saja berdasarkan nomor, nama pengirim, atau tanggal penerimaan.

---

## ⚙️ 4. Cara Mengatur Kop Surat, Margin, Tanda Tangan & Cap

Buka menu **"Pengaturan Template"**:

1. **Kop Surat (Banner Gambar Utuh):**
   - Anda dapat mengunggah file gambar kop surat utuh (JPG, PNG, atau SVG) yang telah dibuat (misal dari Canva, Word, atau Photoshop).
   - Gambar kop banner ini akan otomatis dipasang di bagian atas lembar F4 saat membuat surat dan mencetak.
2. **Margin Kertas F4:**
   - Standar yang disediakan sudah pas untuk map jilid (Kiri: 2.5 cm, Atas: 2.0 cm, Kanan: 2.0 cm, Bawah: 2.0 cm). Anda bebas mengubahnya.
3. **Format Nomor Dinamis:**
   - Anda dapat mengubah rumus nomor surat sesuai selera (contoh: `{nomor}/DKM-AM/{romawi}/{tahun}`). Sistem otomatis mengganti `{romawi}` menjadi bulan Romawi berjalan (misal: IX untuk September).
4. **Tanda Tangan & Stempel Cap:**
   - Masukkan nama ketua dan sekretaris.
   - Unggah scan tanda tangan (PNG transparan).
   - Unggah gambar cap stempel (PNG transparan).
   - Gunakan slider untuk **menggeser posisi stempel** agar menimpa tanda tangan secara natural seperti stempel basah aslinya.

---

## 🖨️ 5. Tips Mencetak ke Kertas F4 / Folio di Printer

Saat Anda menekan tombol **"Cetak / Simpan PDF"**, dialog cetak browser akan muncul:

1. Pada pilihan **Destination (Tujuan)**:
   - Pilih nama printer Anda (untuk cetak langsung ke kertas), ATAU
   - Pilih **"Save as PDF"** (untuk menyimpan sebagai dokumen PDF).
2. Pada pilihan **Paper size (Ukuran kertas)**:
   - Pilih **F4** atau **Folio** (jika ada di daftar).
   - Jika tidak ada opsi F4, pilih **Legal**, atau buat ukuran kustom: `215 x 330 mm`.
3. Pada opsi **Margins (Batas tepi)**:
   - Pilih **"None"** atau **"Default"** (karena margin resmi sudah diatur rapi oleh sistem di dalam lembar kerja).
4. Centang **"Background graphics"** agar warna kop dan stempel tercetak sempurna.

---

## 💾 6. Cara Cadangkan (Backup) Data Anda

Aplikasi ini menggunakan sistem penyimpanan lokal berbasis file tunggal yang sangat aman dan mudah dipindahkan:
- Semua data surat dan template Anda tersimpan di file:  
  📁 `prisma/dev.db`
- Semua file foto, scan tanda tangan, dan lampiran tersimpan di folder:  
  📁 `public/uploads/`

Cukup copy folder proyek ini ke flashdisk jika Anda ingin membuat cadangan data atau memindahkannya ke laptop lain.
