#!/usr/bin/env bash
# ==============================================================================
# SCRIPT OTOMATIS DEPLOY SIMAS MASJID KE VPS (UBUNTU / DEBIAN)
# Stack: Node.js 20 LTS + PM2 + Nginx + Certbot SSL
# Cocok untuk VPS IDCloudHost (1GB - 4GB RAM)
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
echo -e "${CYAN}         Script Instalasi & Deploy VPS (PM2 + Nginx)          ${NC}"
echo -e "${CYAN}==============================================================${NC}\n"

# 1. Validasi Akses Root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}[ERROR] Script ini harus dijalankan dengan hak akses root!${NC}"
  echo -e "Silakan jalankan: ${YELLOW}sudo bash setup-vps.sh${NC}"
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

# 3. Setup Swap Memory (Sangat krusial jika RAM 1GB-2GB agar build Next.js tidak crash)
echo -e "\n${BLUE}[2/8] Memeriksa Memori & Menyiapkan Swap...${NC}"
TOTAL_RAM_KB=$(grep MemTotal /proc/meminfo | awk '{print $2}')
TOTAL_RAM_MB=$((TOTAL_RAM_KB / 1024))
echo -e "Total RAM terdeteksi: ${YELLOW}${TOTAL_RAM_MB} MB${NC}"

if [ "$TOTAL_RAM_MB" -lt 3000 ]; then
  if [ ! -f /swapfile ]; then
    echo -e "${YELLOW}RAM terbatas. Membuat swapfile 2GB otomatis...${NC}"
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

# 4. Update Paket Sistem & Dependensi Dasar
echo -e "\n${BLUE}[3/8] Mengupdate Sistem & Menginstal Paket (Nginx, Certbot, Git, Curl)...${NC}"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y curl git ufw nginx certbot python3-certbot-nginx build-essential

# 5. Instalasi Node.js 20 LTS & PM2
echo -e "\n${BLUE}[4/8] Memeriksa & Menginstal Node.js 20 LTS dan PM2...${NC}"
NEED_NODE=true
if command -v node &> /dev/null; then
  NODE_VER=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
  if [ "$NODE_VER" -ge 18 ]; then
    echo -e "${GREEN}Node.js versi $(node -v) sudah terpasang.${NC}"
    NEED_NODE=false
  fi
fi

if [ "$NEED_NODE" = true ]; then
  echo -e "${YELLOW}Mengunduh dan memasang Node.js 20 LTS dari NodeSource...${NC}"
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
  echo -e "${GREEN}Node.js $(node -v) dan npm $(npm -v) berhasil dipasang.${NC}"
fi

if ! command -v pm2 &> /dev/null; then
  echo -e "${YELLOW}Memasang PM2 Process Manager...${NC}"
  npm install -g pm2
  echo -e "${GREEN}PM2 $(pm2 -v) berhasil dipasang.${NC}"
else
  echo -e "${GREEN}PM2 sudah terpasang.${NC}"
fi

# 6. Setup Direktori, Database & Dependensi Proyek
echo -e "\n${BLUE}[5/8] Menyiapkan Dependensi, Database SQLite & Build Next.js...${NC}"
APP_DIR=$(pwd)
mkdir -p "$APP_DIR/prisma"
mkdir -p "$APP_DIR/public/uploads"
mkdir -p "$APP_DIR/backups"

chmod -R 775 "$APP_DIR/prisma"
chmod -R 775 "$APP_DIR/public/uploads"
chmod -R 775 "$APP_DIR/backups"

echo "Memasang modul dependensi (npm install)..."
npm install

echo "Menyiapkan skema database Prisma..."
npx prisma generate
npx prisma db push --accept-data-loss
npm run prisma:seed || true

echo "Melakukan compile Next.js (npm run build)..."
NODE_OPTIONS="--max-old-space-size=1536" npm run build

# 7. Konfigurasi & Jalankan Aplikasi dengan PM2
echo -e "\n${BLUE}[6/8] Menjalankan Aplikasi via PM2...${NC}"
pm2 delete simas-masjid 2>/dev/null || true
pm2 start ecosystem.config.js || pm2 start npm --name "simas-masjid" -- run start
pm2 save
pm2 startup systemd -u root --hp /root || true

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

    # Melayani file upload secara langsung via Nginx (cepat, no 404, hemat memory)
    location /uploads/ {
        alias $APP_DIR/public/uploads/;
        expires 30d;
        access_log off;
        add_header Cache-Control "public, max-age=2592000";
    }

    # Proxy ke aplikasi Next.js
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

        proxy_connect_timeout 90s;
        proxy_send_timeout 90s;
        proxy_read_timeout 90s;
    }
}
EOF

# Aktifkan site Nginx
rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true
ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/simas_masjid

nginx -t
systemctl restart nginx

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

# Firewall UFW
echo -e "\n${BLUE}Mengonfigurasi Firewall (UFW)...${NC}"
ufw allow OpenSSH >/dev/null 2>&1 || ufw allow 22 >/dev/null 2>&1
ufw allow 'Nginx Full' >/dev/null 2>&1 || { ufw allow 80 >/dev/null 2>&1; ufw allow 443 >/dev/null 2>&1; }
ufw --force enable >/dev/null 2>&1 || true

# IP Publik
SERVER_IP=$(curl -s -4 ifconfig.me || hostname -I | awk '{print $1}')

echo -e "\n${CYAN}==============================================================${NC}"
echo -e "${GREEN}             INSTALASI BERHASIL DILAKUKAN!                    ${NC}"
echo -e "${CYAN}==============================================================${NC}"
if [ -n "$DOMAIN_NAME" ]; then
  echo -e "Aplikasi dapat diakses di : ${GREEN}https://$DOMAIN_NAME${NC}"
fi
echo -e "Akses langsung via IP     : ${GREEN}http://$SERVER_IP${NC}"
echo -e ""
echo -e "Akun Login Bawaan (Super Admin):"
echo -e "  - Username : ${YELLOW}admin${NC}"
echo -e "  - Password : ${YELLOW}admin123${NC}"
echo -e ""
echo -e "Perintah Pemeliharaan & Integrasi:"
echo -e "  - Cek Status Aplikasi : ${CYAN}pm2 status${NC}"
echo -e "  - Cek Log Realtime    : ${CYAN}pm2 logs simas-masjid${NC}"
echo -e "  - Restart Aplikasi    : ${CYAN}pm2 restart simas-masjid${NC}"
echo -e "  - Update Aplikasi     : ${CYAN}bash update.sh${NC}"
echo -e "  - Backup Database     : ${CYAN}bash backup.sh${NC}"
echo -e "  - Setup WhatsApp Bot  : ${CYAN}sudo bash setup-whatsapp.sh${NC}"
echo -e "${CYAN}==============================================================${NC}\n"