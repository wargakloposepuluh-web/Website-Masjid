cat << 'EOF' > ~/update.sh
#!/bin/bash
set -e

echo "=========================================="
echo "   MEMULAI UPDATE WEBSITE MASJID (SIMAS)  "
echo "=========================================="

APP_DIR="/home/baitulmaghfirah"
BACKUP_DIR="$APP_DIR/db_backups"

cd "$APP_DIR"

mkdir -p "$BACKUP_DIR"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

if [ -f "prisma/dev.db" ]; then
    echo ">> [1/6] Mengamankan database server (Backup ke $BACKUP_DIR/dev_$TIMESTAMP.db)..."
    cp prisma/dev.db "$BACKUP_DIR/dev_$TIMESTAMP.db"
    cp prisma/dev.db "$BACKUP_DIR/dev_latest.db"
fi

echo ">> [2/6] Menyimpan perubahan sementara di server (git stash)..."
git stash

echo ">> [3/6] Menarik update dari GitHub (git pull origin main)..."
git pull origin main

if [ -f "$BACKUP_DIR/dev_latest.db" ]; then
    echo ">> [4/6] Mengembalikan database server asli..."
    cp "$BACKUP_DIR/dev_latest.db" prisma/dev.db
fi

echo ">> [5/6] Memperbarui struktur database (prisma db push)..."
npx prisma generate
npx prisma db push --skip-generate

chmod o+x /home/baitulmaghfirah
chmod -R 755 /home/baitulmaghfirah/public || true

echo ">> [6/6] Melakukan build Next.js dan restart PM2..."
npm run build
sudo pm2 restart simas-masjid --update-env

echo "=========================================="
echo "   UPDATE SELESAI & APLIKASI BERJALAN!    "
echo "=========================================="
EOF