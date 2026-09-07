import { PrismaClient, Role, OrderStatus, CommissionStatus, WithdrawalStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create Super Admin
  const superAdminPass = await bcrypt.hash("admin123", 12);
  const superAdmin = await prisma.user.upsert({
    where: { email: "superadmin@zangetsu.com" },
    update: {},
    create: {
      email: "superadmin@zangetsu.com",
      username: "superadmin",
      password: superAdminPass,
      name: "Super Admin",
      role: Role.SUPERADMIN,
      isVerified: true,
      balance: 0,
      tokenBalance: 9999,
      referralCode: "SUPERADMIN001",
    },
  });
  console.log("✅ Super Admin created: superadmin@zangetsu.com / admin123");

  // Create Affiliator
  const affiliatorPass = await bcrypt.hash("aff123", 12);
  const affiliator = await prisma.user.upsert({
    where: { email: "affiliator@zangetsu.com" },
    update: {},
    create: {
      email: "affiliator@zangetsu.com",
      username: "affiliator",
      password: affiliatorPass,
      name: "Affiliator Demo",
      role: Role.AFFILIATOR,
      isVerified: true,
      balance: 2500000,
      tokenBalance: 100,
      referralCode: "AFFDEMO001",
    },
  });
  console.log("✅ Affiliator created: affiliator@zangetsu.com / aff123");

  // Create Member
  const memberPass = await bcrypt.hash("member123", 12);
  const member = await prisma.user.upsert({
    where: { email: "member@zangetsu.com" },
    update: {},
    create: {
      email: "member@zangetsu.com",
      username: "member",
      password: memberPass,
      name: "Member Demo",
      role: Role.MEMBER,
      isVerified: true,
      balance: 500000,
      tokenBalance: 10,
      referralCode: "MEMBER001",
      referredById: affiliator.id,
    },
  });
  console.log("✅ Member created: member@zangetsu.com / member123");

  // Create Token
  const token = await prisma.token.upsert({
    where: { symbol: "ZGT" },
    update: {},
    create: {
      name: "Zangetsu Token",
      symbol: "ZGT",
      description: "Token reward untuk setiap pembelian paket",
      value: 10000,
      isActive: true,
    },
  });
  console.log("✅ Token created: ZGT");

  // Create Products (Paket Jasa Website)
  const products = [
    {
      name: "Paket Starter - Website Profil Kampus",
      slug: "paket-starter-website-kampus",
      description: "Website profil kampus dasar dengan tampil profesional. Cocok untuk kampus yang baru mulai digitalisasi. Sudah termasuk domain, hosting, dan SSL selama 1 tahun.",
      shortDesc: "Website profil kampus dasar — 5-8 halaman profesional",
      price: 6900000,
      originalPrice: 8500000,
      category: "Website Kampus",
      tags: ["starter", "kampus", "profil", "responsive"],
      features: [
        "Homepage (hero, sambutan, counter, berita, galeri, kontak)",
        "Profil (sejarah, visi-misi, struktur organisasi)",
        "Akademik (info fakultas & prodi)",
        "Berita & artikel (blog system)",
        "Kontak (form, Google Maps, sosmed)",
        "Galeri (foto & video)",
        "Responsive design",
        "SEO basic",
        "Tombol WhatsApp mengambang",
        "Google Analytics & SSL",
      ],
      isFeatured: false,
      commissionPercent: 15,
      tokenReward: 5,
      sortOrder: 1,
      imageUrl: "https://placehold.co/600x400/1e40af/ffffff?text=Paket+Starter",
    },
    {
      name: "Paket Professional - Website Kampus Lengkap",
      slug: "paket-professional-website-kampus",
      description: "Website kampus lengkap dengan halaman per fakultas dan program studi. Termasuk FAQ interaktif, popup promosi, dan manajemen konten lanjutan.",
      shortDesc: "Website kampus lengkap dengan multi-fakultas & prodi",
      price: 15500000,
      originalPrice: 19000000,
      category: "Website Kampus",
      tags: ["professional", "kampus", "fakultas", "prodi", "lengkap"],
      features: [
        "Semua fitur Paket Starter",
        "Homepage premium (slider, counter animasi, FAQ, testimoni)",
        "Profil pimpinan (foto, jabatan, deskripsi)",
        "Halaman per fakultas (6 fakultas)",
        "Halaman per program studi (15+ prodi)",
        "Akreditasi & fasilitas (gallery)",
        "Kalender akademik & biaya pendidikan",
        "Manajemen berita per kategori",
        "Filter berita AJAX",
        "Event/agenda + countdown timer",
        "FAQ interaktif",
        "Popup promosi",
        "Download manager",
        "Newsletter & social share",
      ],
      isFeatured: true,
      commissionPercent: 20,
      tokenReward: 15,
      sortOrder: 2,
      imageUrl: "https://placehold.co/600x400/f59e0b/ffffff?text=Paket+Professional",
    },
    {
      name: "Paket Enterprise - Solusi Digital Kampus",
      slug: "paket-enterprise-solusi-digital",
      description: "Solusi digital kampus menyeluruh dengan sistem PMB online, subdomain per fakultas, flipbook digital, dan multi-user admin.",
      shortDesc: "Solusi digital menyeluruh + PMB online",
      price: 29500000,
      originalPrice: 35000000,
      category: "Website Kampus",
      tags: ["enterprise", "kampus", "pmb", "digital", "lengkap"],
      features: [
        "Semua fitur Paket Professional",
        "Sistem PMB online (form + pembayaran + notifikasi)",
        "Website per fakultas (subdomain terpisah)",
        "Flipbook digital (katalog, jurnal, brosur)",
        "Integrasi Google Ads + AdSense",
        "Tracer study system",
        "Multi-user admin (per fakultas)",
        "SEO lanjutan (schema, OG, Twitter card)",
        "Custom post type (dosen, penelitian, pengabdian)",
        "Form builder & API integration ready",
        "Optimasi performa & keamanan",
        "Priority support",
      ],
      isFeatured: false,
      commissionPercent: 25,
      tokenReward: 30,
      sortOrder: 3,
      imageUrl: "https://placehold.co/600x400/059669/ffffff?text=Paket+Enterprise",
    },
  ];

  for (const p of products) {
    const { imageUrl, ...productData } = p;
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: { ...productData, affiliatorId: affiliator.id, createdById: superAdmin.id },
      create: { ...productData, affiliatorId: affiliator.id, createdById: superAdmin.id },
    });

    // Create primary image for each product
    await prisma.productImage.upsert({
      where: { id: `img-${product.id}-primary` },
      update: { url: imageUrl },
      create: {
        id: `img-${product.id}-primary`,
        productId: product.id,
        url: imageUrl,
        alt: p.name,
        isPrimary: true,
        sortOrder: 0,
      },
    });
  }
  console.log("✅ Products created:", products.length);

  // Create Theme
  await prisma.theme.upsert({
    where: { id: "default-theme" },
    update: {},
    create: {
      id: "default-theme",
      name: "Default Dark Sidebar",
      description: "Default theme dengan sidebar gelap",
      primaryColor: "#1a1f2e",
      accentColor: "#3b82f6",
      bgColor: "#f8fafc",
      isActive: true,
      isDefault: true,
      createdById: superAdmin.id,
    },
  });
  console.log("✅ Default theme created");

  // Create sample orders
  const existingOrders = await prisma.order.count();
  if (existingOrders === 0) {
    const product = await prisma.product.findFirst({ where: { slug: "paket-starter-website-kampus" } });
    if (product) {
      await prisma.order.create({
        data: {
          orderNumber: "ORD-20260101-001",
          productId: product.id,
          buyerId: member.id,
          affiliatorId: affiliator.id,
          quantity: 1,
          basePrice: product.price,
          totalPrice: product.price,
          commissionAmount: product.price.mul(product.commissionPercent).div(100),
          tokenReward: product.tokenReward,
          status: OrderStatus.COMPLETED,
          paidAt: new Date("2026-01-15"),
          completedAt: new Date("2026-02-01"),
        },
      });

      // Create commission
      await prisma.commission.create({
        data: {
          affiliatorId: affiliator.id,
          orderNumber: "ORD-20260101-001",
          productName: product.name,
          baseAmount: product.price,
          commissionRate: product.commissionPercent,
          amount: product.price.mul(product.commissionPercent).div(100),
          status: CommissionStatus.PAID,
          approvedAt: new Date("2026-02-01"),
          paidAt: new Date("2026-02-05"),
        },
      });

      // Create earning
      await prisma.earning.create({
        data: {
          userId: affiliator.id,
          type: "commission",
          amount: product.price.mul(product.commissionPercent).div(100),
          description: `Komisi dari order ORD-20260101-001 - ${product.name}`,
        },
      });

      // Create withdrawal
      await prisma.withdrawal.create({
        data: {
          userId: affiliator.id,
          amount: 1000000,
          fee: 5000,
          netAmount: 995000,
          bankName: "BCA",
          bankAccount: "1234567890",
          accountHolder: "Affiliator Demo",
          status: WithdrawalStatus.PAID,
          processedAt: new Date("2026-02-10"),
          paidAt: new Date("2026-02-10"),
        },
      });

      // Create clicks
      await prisma.click.createMany({
        data: [
          { productId: product.id, userId: member.id, source: "referral" },
          { productId: product.id, source: "direct" },
          { productId: product.id, source: "social" },
        ],
      });

      console.log("✅ Sample orders, commissions, earnings, withdrawals created");
    }
  }

  // Create settings
  const settings = [
    { key: "app_name", value: "Zangetsu Etalase", group: "general" },
    { key: "app_description", value: "Platform etalase jasa pembuatan website kampus profesional", group: "general" },
    { key: "contact_whatsapp", value: "6281234567890", group: "contact" },
    { key: "contact_email", value: "favyour01@gmail.com", group: "contact" },
    { key: "min_withdrawal", value: "100000", group: "finance" },
    { key: "withdrawal_fee", value: "5000", group: "finance" },
    { key: "default_commission_percent", value: "10", group: "finance" },
  ];

  for (const s of settings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }
  console.log("✅ Settings created");

  console.log("\n🎉 Seed completed!");
  console.log("\n📋 Login credentials:");
  console.log("  Super Admin: superadmin@zangetsu.com / admin123");
  console.log("  Affiliator:  affiliator@zangetsu.com / aff123");
  console.log("  Member:      member@zangetsu.com / member123");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
