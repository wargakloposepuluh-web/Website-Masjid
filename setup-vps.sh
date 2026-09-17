#!/usr/bin/env bash
# ==============================================================================
# SCRIPT OTOMATIS DEPLOY SIMAS MASJID KE VPS (UBUNTU / DEBIAN)
# IDCloudHost Cloud VPS
# ==============================================================================

set -e

# Warna Terminal
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

clear
echo -e "${CYAN}==============================================================${NC}"
echo -e "${GREEN}      SISTEM INFORMASI & PERSURATAN MASJID (SIMAS)           ${NC}"
echo -e "${CYAN}         Script Instalasi & Deploy Otomatis ke VPS             ${NC}"
echo -e "${CYAN}==============================================================${NC}\n"

# 1. Validasi Akses Root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}[ERROR] Script ini harus dijalankan dengan hak akses root!${NC}"
  echo -e "Silakan jalankan perintah: ${YELLOW}sudo bash setup-vps.sh${NC}"
  exit 1
fi

# 2. Pertanyaan Konfigurasi
echo -e "${BLUE}[1/8] Konfigurasi Domain & Akses${NC}"
read -rp "Masukkan Nama Domain / Subdomain (misal: masjid.domain.com atau kosongkan jika ingin pakai IP saja): " DOMAIN_NAME
DOMAIN_NAME=$(echo "$DOMAIN_NAME" | tr -d '[:space:]')

SSL_EMAIL=""
if [ -n "$DOMAIN_NAME" ]; then
  read -rp "Masukkan Email untuk Sertifikat SSL Let's Encrypt: " SSL_EMAIL
  SSL_EMAIL=$(echo "$SSL_EMAIL" | tr -d '[:space:]')
fi

# 3. Setup Swap Memory (Sangat penting jika RAM 1GB agar build tidak OOM)
echo -e "\n${BLUE}[2/8] Memeriksa Memori & Menyiapkan Swap...${NC}"
TOTAL_RAM_KB=$(grep MemTotal /proc/meminfo | awk '{print $2}')
TOTAL_RAM_MB=$((TOTAL_RAM_KB / 1024))
echo -e "Total RAM terdeteksi: ${YELLOW}${TOTAL_RAM_MB} MB${NC}"

if [ "$TOTAL_RAM_MB" -lt 2000 ]; then
  if [ ! -f /swapfile ]; then
    echo -e "${YELLOW}RAM kurang dari 2GB. Membuat swapfile 2GB otomatis...${NC}"
    fallocate -l 2G /swapfile 2>/dev/null || dd if=/dev/zero of=/swapfile bs=1M count=2048
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    if ! grep -q '/swapfile' /etc/fstab; then
      echo '/swapfile none swap sw 0 0' >> /etc/fstab
    fi
    echo -e "${GREEN}Swap 2GB berhasil diaktifkan.${NC}"
  else
    echo -e "${GREEN}Swapfile sudah ada dan aktif.${NC}"
  fi
else
  echo -e "${GREEN}RAM mencukupi (${TOTAL_RAM_MB} MB). Swap opsional.${NC}"
fi

# 4. Update Paket & Install Dependensi
echo -e "\n${BLUE}[3/8] Mengupdate Sistem & Menginstal Paket (Docker, Nginx, UFW, Git)...${NC}"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release git ufw nginx certbot python3-certbot-nginx

# Pastikan Docker & Docker Compose terinstall
if ! command -v docker &> /dev/null; then
  echo -e "${YELLOW}Menginstall Docker Engine...${NC}"
  apt-get install -y docker.io docker-compose-plugin docker-compose 2>/dev/null || apt-get install -y docker.io
fi

# Pastikan perintah docker-compose tersedia (buat wrapper ke 'docker compose' jika v2)
if ! command -v docker-compose &> /dev/null; then
  apt-get install -y docker-compose-plugin 2>/dev/null || true
  if ! command -v docker-compose &> /dev/null; then
    cat << 'WRAPPER' > /usr/local/bin/docker-compose
#!/bin/sh
exec docker compose "$@"
WRAPPER
    chmod +x /usr/local/bin/docker-compose
  fi
fi

# Nonaktifkan IPv6 pada Nginx default agar tidak error [::]:80
rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true
sed -i 's/listen \[::\]:80/#listen [::]:80/g' /etc/nginx/sites-available/default 2>/dev/null || true

systemctl enable docker
systemctl start docker
systemctl enable nginx
systemctl restart nginx 2>/dev/null || true

# 5. Persiapan Direktori & Permission Storage
echo -e "\n${BLUE}[4/8] Menyiapkan Folder Database & Upload...${NC}"
APP_DIR=$(pwd)
mkdir -p "$APP_DIR/prisma"
mkdir -p "$APP_DIR/public/uploads"
mkdir -p "$APP_DIR/storage/whatsapp-auth"
mkdir -p "$APP_DIR/backups"

# Berikan izin penuh pada folder yang di-mount agar container Next.js dapat menulis database SQLite
chmod -R 777 "$APP_DIR/prisma"
chmod -R 777 "$APP_DIR/public/uploads"
chmod -R 777 "$APP_DIR/storage"
echo -e "${GREEN}Folder persisten siap digunakan.${NC}"

# 6. Build & Jalankan Docker Container
echo -e "\n${BLUE}[5/8] Membangun (Build) & Menjalankan Docker Container...${NC}"
echo -e "${YELLOW}Proses ini memerlukan waktu 2 - 5 menit saat pertama kali build Next.js. Harap tunggu...${NC}"

docker-compose down 2>/dev/null || true
docker-compose up -d --build

# Tunggu container benar-benar aktif
echo -e "Menunggu service container aktif..."
sleep 10

# 7. Inisialisasi Database SQLite di Container
echo -e "\n${BLUE}[6/8] Menjalankan Migrasi & Seeding Database...${NC}"
docker exec -i simas_persuratan npx prisma db push --accept-data-loss || true
docker exec -i simas_persuratan npm run prisma:seed || true

# 8. Konfigurasi Nginx Reverse Proxy
echo -e "\n${BLUE}[7/8] Mengonfigurasi Nginx Web Server...${NC}"
NGINX_CONF="/etc/nginx/sites-available/simas_masjid"

if [ -n "$DOMAIN_NAME" ]; then
  SERVER_NAME_LINE="server_name $DOMAIN_NAME;"
else
  SERVER_NAME_LINE="server_name _;"
fi

cat <<EOF > "$NGINX_CONF"
server {
    listen 80;
    $SERVER_NAME_LINE

    client_max_body_size 50M;

    # Gzip Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF

# Aktifkan site
ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/simas_masjid
rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true

nginx -t
systemctl reload nginx
echo -e "${GREEN}Nginx berhasil dikonfigurasi.${NC}"

# Pasang SSL jika domain dan email diisi
if [ -n "$DOMAIN_NAME" ] && [ -n "$SSL_EMAIL" ]; then
  echo -e "\n${BLUE}[8/8] Memasang Sertifikat SSL Gratis (Let's Encrypt)...${NC}"
  certbot --nginx -d "$DOMAIN_NAME" --non-interactive --agree-tos -m "$SSL_EMAIL" --redirect || {
    echo -e "${YELLOW}[PERINGATAN] Gagal menerbitkan SSL otomatis.${NC}"
    echo -e "Pastikan DNS A Record domain ${CYAN}$DOMAIN_NAME${NC} sudah mengarah ke IP VPS ini."
    echo -e "Anda bisa mencoba pasang SSL manual nanti dengan: ${YELLOW}certbot --nginx -d $DOMAIN_NAME${NC}"
  }
else
  echo -e "\n${BLUE}[8/8] Melewati pemasangan SSL (Domain tidak dimasukkan). Akses via HTTP port 80 aktif.${NC}"
fi

# Konfigurasi Firewall UFW
echo -e "\n${BLUE}Mengonfigurasi Firewall (UFW)...${NC}"
ufw allow OpenSSH >/dev/null 2>&1 || ufw allow 22 >/dev/null 2>&1
ufw allow 'Nginx Full' >/dev/null 2>&1 || { ufw allow 80 >/dev/null 2>&1; ufw allow 443 >/dev/null 2>&1; }
ufw --force enable >/dev/null 2>&1 || true

# Dapatkan IP Publik VPS
SERVER_IP=$(curl -s -4 ifconfig.me || hostname -I | awk '{print $1}')

# ==============================================================================
# SELESAI
# ==============================================================================
echo -e "\n${CYAN}==============================================================${NC}"
echo -e "${GREEN}             INSTALASI BERHASIL DILAKUKAN!                    ${NC}"
echo -e "${CYAN}==============================================================${NC}"
if [ -n "$DOMAIN_NAME" ]; then
  echo -e "Aplikasi dapat diakses di: ${GREEN}https://$DOMAIN_NAME${NC} (atau http://$DOMAIN_NAME)"
fi
echo -e "Akses langsung via IP Server: ${GREEN}http://$SERVER_IP${NC}"
echo -e ""
echo -e "Akun Login Bawaan (Super Admin):"
echo -e "  - Username : ${YELLOW}admin${NC}"
echo -e "  - Password : ${YELLOW}admin123${NC}"
echo -e ""
echo -e "Akun Lainnya:"
echo -e "  - Sekretaris : ${YELLOW}sekretaris${NC} / ${YELLOW}surat123${NC}"
echo -e "  - Bendahara  : ${YELLOW}bendahara${NC} / ${YELLOW}keuangan123${NC}"
echo -e ""
echo -e "Perintah Pemeliharaan:"
echo -e "  - Cek Log Aplikasi : ${CYAN}docker logs -f simas_persuratan${NC}"
echo -e "  - Restart Aplikasi : ${CYAN}docker-compose restart${NC}"
echo -e "  - Update Aplikasi  : ${CYAN}bash update.sh${NC}"
echo -e "  - Backup Database  : ${CYAN}bash backup.sh${NC}"
echo -e "${CYAN}==============================================================${NC}\n"
