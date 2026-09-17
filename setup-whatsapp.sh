#!/usr/bin/env bash
# ==============================================================================
# SCRIPT SETUP OTOMATIS GO-WHATSAPP-WEB-MULTIDEVICE (GOWA) DI VPS
# Terintegrasi dengan SIMAS Masjid (Port 3001)
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
echo -e "${GREEN}     SETUP SERVICE WHATSAPP GATEWAY (GOWA) - SIMAS MASJID    ${NC}"
echo -e "${CYAN}   Stack: aldinokemal/go-whatsapp-web-multidevice + Systemd   ${NC}"
echo -e "${CYAN}==============================================================${NC}\n"

# 1. Validasi Akses Root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}[ERROR] Script ini harus dijalankan dengan hak akses root!${NC}"
  echo -e "Silakan jalankan: ${YELLOW}sudo bash setup-whatsapp.sh${NC}"
  exit 1
fi

# 2. Instalasi Dependensi Sistem
echo -e "${BLUE}[1/5] Memeriksa & Menginstal Paket Dependensi (ffmpeg, unzip, curl)...${NC}"
apt-get update -y
apt-get install -y curl unzip tar ffmpeg

# 3. Deteksi Arsitektur Mesin
echo -e "\n${BLUE}[2/5] Mendeteksi Arsitektur Sistem...${NC}"
ARCH=$(uname -m)
case "$ARCH" in
  x86_64)
    PKG_ARCH="linux_amd64"
    ;;
  aarch64|arm64)
    PKG_ARCH="linux_arm64"
    ;;
  i386|i686)
    PKG_ARCH="linux_386"
    ;;
  armv7l)
    PKG_ARCH="linux_armv7"
    ;;
  *)
    echo -e "${YELLOW}Arsitektur $ARCH tidak umum, menggunakan fallback linux_amd64...${NC}"
    PKG_ARCH="linux_amd64"
    ;;
esac
echo -e "Arsitektur terdeteksi: ${YELLOW}$ARCH${NC} -> Target paket: ${GREEN}$PKG_ARCH${NC}"

# 4. Unduh Binary GOWA
echo -e "\n${BLUE}[3/5] Mengunduh Binary Go WhatsApp Web Multidevice...${NC}"
INSTALL_DIR="/opt/gowhatsapp"
mkdir -p "$INSTALL_DIR"
cd "$INSTALL_DIR"

# Cari URL download rilis terbaru via GitHub API
DOWNLOAD_URL=$(curl -s https://api.github.com/repos/aldinokemal/go-whatsapp-web-multidevice/releases/latest \
  | grep "browser_download_url" \
  | grep "${PKG_ARCH}.zip" \
  | head -n 1 \
  | cut -d '"' -f 4)

# Fallback jika GitHub API terkena rate limit
if [ -z "$DOWNLOAD_URL" ]; then
  echo -e "${YELLOW}Koneksi GitHub API dibatasi, menggunakan fallback versi stabil v9.3.1...${NC}"
  DOWNLOAD_URL="https://github.com/aldinokemal/go-whatsapp-web-multidevice/releases/download/v9.3.1/whatsapp_9.3.1_${PKG_ARCH}.zip"
fi

echo -e "Mengunduh dari: ${CYAN}$DOWNLOAD_URL${NC}"
curl -L -f -o whatsapp.zip "$DOWNLOAD_URL"

echo "Mengekstrak paket..."
unzip -o whatsapp.zip
rm -f whatsapp.zip

# Pastikan binary executable dan ubah nama file menjadi 'whatsapp'
if [ -f "$INSTALL_DIR/whatsapp" ]; then
  chmod +x "$INSTALL_DIR/whatsapp"
elif [ -f "$INSTALL_DIR/linux-amd64" ]; then
  mv "$INSTALL_DIR/linux-amd64" "$INSTALL_DIR/whatsapp"
  chmod +x "$INSTALL_DIR/whatsapp"
elif [ -f "$INSTALL_DIR/linux-arm64" ]; then
  mv "$INSTALL_DIR/linux-arm64" "$INSTALL_DIR/whatsapp"
  chmod +x "$INSTALL_DIR/whatsapp"
elif [ -f "$INSTALL_DIR/$PKG_ARCH" ]; then
  mv "$INSTALL_DIR/$PKG_ARCH" "$INSTALL_DIR/whatsapp"
  chmod +x "$INSTALL_DIR/whatsapp"
else
  # Cari file non-markdown, non-zip apa pun yang ada di folder
  FOUND_BIN=$(find "$INSTALL_DIR" -maxdepth 1 -type f ! -name "*.md" ! -name "*.txt" ! -name "*.zip" ! -name "*.sh" | head -n 1)
  if [ -n "$FOUND_BIN" ]; then
    mv "$FOUND_BIN" "$INSTALL_DIR/whatsapp"
    chmod +x "$INSTALL_DIR/whatsapp"
  else
    echo -e "${RED}[ERROR] File binary tidak ditemukan di dalam paket!${NC}"
    exit 1
  fi
fi

BINARY_PATH="$INSTALL_DIR/whatsapp"
echo -e "${GREEN}Binary berhasil dipasang di: $BINARY_PATH${NC}"

# 5. Konfigurasi Systemd Service
echo -e "\n${BLUE}[4/5] Mengonfigurasi Systemd Service (Port 3001)...${NC}"
SERVICE_FILE="/etc/systemd/system/gowhatsapp.service"

cat <<EOF > "$SERVICE_FILE"
[Unit]
Description=Go WhatsApp Web Multidevice Service (SIMAS Masjid)
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$INSTALL_DIR
ExecStart=$BINARY_PATH rest --port=3001
Restart=always
RestartSec=5s
StandardOutput=journal
StandardError=journal
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
EOF

# Tanya apakah ingin membuka port 3001 untuk akses remote dari laptop lokal
echo -e "\n${BLUE}Konfigurasi Akses Firewall UFW:${NC}"
echo -e "Apakah Anda ingin membuka port ${YELLOW}3001${NC} ke publik agar laptop/PC lokal bisa mengakses service WhatsApp ini via IP VPS?"
read -rp "Buka port 3001 di firewall? (y/N - default: Tidak, hanya untuk VPS lokal): " OPEN_PORT
OPEN_PORT=$(echo "$OPEN_PORT" | tr '[:upper:]' '[:lower:]')

if [[ "$OPEN_PORT" =~ ^(y|yes)$ ]]; then
  if command -v ufw &> /dev/null; then
    ufw allow 3001/tcp
    echo -e "${GREEN}Port 3001/tcp berhasil dibuka di UFW Firewall.${NC}"
  fi
else
  echo -e "${GREEN}Port 3001 tetap tertutup dari luar (koneksi privat aman di dalam VPS localhost).${NC}"
fi

# 6. Aktifkan dan Jalankan Service
echo -e "\n${BLUE}[5/5] Menjalankan & Memverifikasi Service...${NC}"
systemctl daemon-reload
systemctl enable gowhatsapp
systemctl restart gowhatsapp

sleep 3

if systemctl is-active --quiet gowhatsapp; then
  echo -e "${GREEN}Service WhatsApp Gateway BERHASIL AKTIF (Running)!${NC}"
else
  echo -e "${RED}[PERINGATAN] Service WhatsApp belum aktif. Cek log dengan: journalctl -u gowhatsapp -n 20${NC}"
fi

# IP Publik
SERVER_IP=$(curl -s -4 ifconfig.me || hostname -I | awk '{print $1}')

echo -e "\n${CYAN}==============================================================${NC}"
echo -e "${GREEN}        INSTALASI SERVICE WHATSAPP BERHASIL!                  ${NC}"
echo -e "${CYAN}==============================================================${NC}"
echo -e "Status Gateway         : ${GREEN}Online di Port 3001${NC}"
echo -e "Internal URL (di VPS)  : ${YELLOW}http://127.0.0.1:3001${NC}"
if [[ "$OPEN_PORT" =~ ^(y|yes)$ ]]; then
  echo -e "Public URL (dari Lokal): ${CYAN}http://$SERVER_IP:3001${NC}"
fi
echo -e ""
echo -e "Langkah Selanjutnya:"
echo -e "1. Buka web SIMAS Masjid di browser Anda."
echo -e "2. Masuk ke menu ${YELLOW}Pengaturan${NC} > tab ${YELLOW}WhatsApp Gateway${NC}."
echo -e "3. Pastikan Gateway URL terisi: ${GREEN}http://127.0.0.1:3001${NC}"
echo -e "4. Klik ${GREEN}Hubungkan / Scan QR${NC} dan scan kode QR menggunakan aplikasi WhatsApp di HP Anda."
echo -e ""
echo -e "Perintah Pemeliharaan:"
echo -e "  - Cek Status Service : ${CYAN}sudo systemctl status gowhatsapp${NC}"
echo -e "  - Cek Log Realtime   : ${CYAN}sudo journalctl -u gowhatsapp -f${NC}"
echo -e "  - Restart Service    : ${CYAN}sudo systemctl restart gowhatsapp${NC}"
echo -e "  - Matikan Service    : ${CYAN}sudo systemctl stop gowhatsapp${NC}"
echo -e "${CYAN}==============================================================${NC}\n"
