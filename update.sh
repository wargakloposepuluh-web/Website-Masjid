#!/usr/bin/env bash
# ==============================================================================
# SCRIPT UPDATE APLIKASI SIMAS MASJID DI VPS (PM2)
# ==============================================================================

set -e

echo "=== Memulai Update SIMAS Masjid ==="

# 1. Tarik pembaruan dari Git jika menggunakan repository
if [ -d .git ]; then
  echo "Menarik kode terbaru dari Git..."
  git pull origin main || git pull
fi

# 2. Pastikan permission folder tetap aman
mkdir -p prisma public/uploads backups
chmod -R 775 prisma public/uploads backups 2>/dev/null || true

# 3. Update paket & skema database Prisma
echo "Memeriksa dependensi..."
npm install --production=false

echo "Memperbarui skema Prisma..."
npx prisma generate
npx prisma db push --accept-data-loss

# 4. Build ulang Next.js dengan alokasi memory yang aman
echo "Melakukan compile Next.js..."
NODE_OPTIONS="--max-old-space-size=1536" npm run build

# 5. Reload PM2 tanpa downtime
echo "Me-reload aplikasi di PM2..."
pm2 reload simas-masjid || pm2 restart simas-masjid

echo "=== Update Selesai! Aplikasi berjalan dengan versi terbaru. ==="