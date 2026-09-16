#!/usr/bin/env bash
# ==============================================================================
# SCRIPT BACKUP DATABASE & FILE UPLOAD SIMAS MASJID
# ==============================================================================

set -e

BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/simas_backup_${TIMESTAMP}.tar.gz"

mkdir -p "$BACKUP_DIR"

echo "Membuat arsip backup: $BACKUP_FILE"

tar -czf "$BACKUP_FILE" prisma/dev.db public/uploads storage 2>/dev/null || {
  tar -czf "$BACKUP_FILE" prisma public/uploads storage
}

echo "Backup berhasil disimpan di: $BACKUP_FILE"
echo "Ukuran file: $(du -sh "$BACKUP_FILE" | awk '{print $1}')"

# Hapus backup yang lebih lama dari 30 hari (opsional)
find "$BACKUP_DIR" -name "simas_backup_*.tar.gz" -mtime +30 -delete 2>/dev/null || true
