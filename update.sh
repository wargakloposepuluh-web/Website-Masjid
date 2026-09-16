#!/usr/bin/env bash
# ==============================================================================
# SCRIPT UPDATE APLIKASI SIMAS MASJID DI VPS
# ==============================================================================

set -e

echo "=== Memulai Update SIMAS Masjid ==="

# 1. Tarik pembaruan dari Git jika menggunakan repository
if [ -d .git ]; then
  echo "Menarik kode terbaru dari Git..."
  git pull origin main || git pull
fi

# 2. Pastikan permission folder tetap aman
chmod -R 777 prisma public/uploads storage 2>/dev/null || true

# 3. Build ulang dan restart container
echo "Membangun ulang container..."
docker-compose up -d --build

# 4. Tunggu container aktif
echo "Menunggu container aktif..."
sleep 8

# 5. Jalankan sinkronisasi database jika ada perubahan skema prisma
echo "Sinkronisasi skema database..."
docker exec -i simas_persuratan npx prisma db push --accept-data-loss || true

echo "=== Update Selesai! Aplikasi berjalan normal. ==="
