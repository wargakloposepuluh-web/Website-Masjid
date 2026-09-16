const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Hash password with PBKDF2 using Node.js crypto
const crypto = require('crypto');

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, Buffer.from(salt, 'hex'), 100000, 32, 'sha256').toString('hex');
  return salt + ':' + hash;
}

async function main() {
  console.log('Seeding initial users...');

  const users = [
    {
      username: 'admin',
      password: hashPassword('admin123'),
      nama: 'Ketua / Admin Utama',
      role: 'SUPER_ADMIN',
    },
    {
      username: 'sekretaris',
      password: hashPassword('surat123'),
      nama: 'Sekretaris Masjid',
      role: 'ADMIN_SURAT',
    },
    {
      username: 'bendahara',
      password: hashPassword('keuangan123'),
      nama: 'Bendahara Masjid',
      role: 'ADMIN_KEUANGAN',
    },
  ];

  for (const u of users) {
    const existing = await prisma.user.findUnique({ where: { username: u.username } });
    if (!existing) {
      await prisma.user.create({ data: u });
      console.log('Created user:', u.username, '(' + u.role + ')');
    } else {
      console.log('User already exists:', u.username);
    }
  }

  // Also seed some initial financial transactions for demonstration if table is empty
  const countTransaksi = await prisma.transaksiKeuangan.count();
  if (countTransaksi === 0) {
    console.log('Seeding initial transactions...');
    await prisma.transaksiKeuangan.createMany({
      data: [
        {
          tanggal: new Date('2026-09-01T08:00:00Z'),
          jenis: 'MASUK',
          kategoriKas: 'JARIYAH',
          nominal: 15000000,
          keterangan: 'Infaq Jariyah Pembangunan Menara dari H. Ahmad Fauzi',
          dicatatOleh: 'Bendahara Masjid',
        },
        {
          tanggal: new Date('2026-09-02T10:30:00Z'),
          jenis: 'MASUK',
          kategoriKas: 'INFAQ',
          nominal: 3850000,
          keterangan: 'Kotak Amal Jumat & Tromol Masjid (Minggu I September)',
          dicatatOleh: 'Bendahara Masjid',
        },
        {
          tanggal: new Date('2026-09-04T14:15:00Z'),
          jenis: 'KELUAR',
          kategoriKas: 'INFAQ',
          nominal: 650000,
          keterangan: 'Pembayaran Tagihan Listrik PLN & Air Masjid',
          dicatatOleh: 'Bendahara Masjid',
        },
        {
          tanggal: new Date('2026-09-05T09:00:00Z'),
          jenis: 'KELUAR',
          kategoriKas: 'JARIYAH',
          nominal: 4200000,
          keterangan: 'Pembelian 2 Unit AC Split 1.5 PK Ruang Sholat Utama',
          dicatatOleh: 'Bendahara Masjid',
        },
        {
          tanggal: new Date('2026-09-07T11:00:00Z'),
          jenis: 'MASUK',
          kategoriKas: 'INFAQ',
          nominal: 2500000,
          keterangan: 'Sedekah Jamaah Pengajian Ahad Pagi',
          dicatatOleh: 'Bendahara Masjid',
        },
      ],
    });
    console.log('Initial transactions seeded successfully');
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
