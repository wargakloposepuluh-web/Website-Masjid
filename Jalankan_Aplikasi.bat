@echo off
title SIMAS - Sistem Informasi Manajemen Administrasi Surat
color 0A

echo ====================================================================
echo             SIMAS - SISTEM MANAJEMEN PERSURATAN
echo              (Surat Masuk, Surat Keluar & F4 Ready)
echo ====================================================================
echo.

:: 1. Cek instalasi Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [PERINGATAN] Node.js belum terdeteksi di komputer ini.
    echo Silakan unduh dan instal Node.js terlebih dahulu dari: https://nodejs.org
    echo Setelah instal, jalankan kembali file ini.
    echo.
    pause
    exit /b
)

:: 2. Masuk ke direktori file batch berada
cd /d "%~dp0"

:: 3. Cek node_modules, jika belum ada otomatis install
if not exist "node_modules\" (
    echo [INFO] Menyiapkan paket dan dependensi aplikasi (hanya sekali di awal)...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Gagal memasang dependensi.
        pause
        exit /b
    )
)

:: 4. Cek database SQLite lokal
if not exist "prisma\dev.db" (
    echo [INFO] Menginisialisasi database lokal SQLite...
    call npx prisma db push
    echo [INFO] Menyiapkan template dan data awal...
    call node prisma\seed.js
)

:: 5. Buka Browser otomatis setelah jeda singkat
echo [INFO] Membuka peramban (browser) ke http://localhost:3000 ...
start "" "http://localhost:3000"

:: 6. Jalankan Server Aplikasi
echo.
echo ====================================================================
echo  APLIKASI SEDANG BERJALAN!
echo  Alamat: http://localhost:3000
echo.
echo  PENTING: Jangan tutup jendela hitam ini selama Anda menggunakan
echo  aplikasi. Untuk berhenti, cukup tutup jendela ini atau tekan Ctrl+C.
echo ====================================================================
echo.

call npm run dev

pause
