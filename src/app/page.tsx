export const dynamic = "force-dynamic";
import Link from "next/link";
import { Shield, Star, Users, Award, ArrowRight, CheckCircle, Coins, TrendingUp, Package, MessageCircle } from "lucide-react";
import prisma from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

async function getProducts() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: { images: { where: { isPrimary: true }, take: 1 } },
    orderBy: { sortOrder: "asc" },
  });
  return products;
}

async function getStats() {
  const [productCount, orderCount, affiliatorCount] = await Promise.all([
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.count({ where: { status: "COMPLETED" } }),
    prisma.user.count({ where: { role: "AFFILIATOR" } }),
  ]);
  return { productCount, orderCount, affiliatorCount };
}

export default async function HomePage() {
  const [products, stats] = await Promise.all([getProducts(), getStats()]);

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <Shield size={18} className="text-white" />
            </div>
            <span className="font-bold text-lg text-gray-800">Zangetsu</span>
          </div>
          <div className="hidden sm:flex items-center gap-6 text-sm font-medium text-gray-600">
            <Link href="#produk" className="hover:text-blue-600 transition-colors">Produk</Link>
            <Link href="#fitur" className="hover:text-blue-600 transition-colors">Fitur</Link>
            <Link href="#referral" className="hover:text-blue-600 transition-colors">Referral</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-blue-600">
              Masuk
            </Link>
            <Link href="/register" className="btn btn-primary text-sm py-2">
              Daftar
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-20 sm:py-28">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full blur-[100px]" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-500 rounded-full blur-[120px]" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
            <Star size={14} className="text-amber-400 fill-amber-400" />
            <span className="text-sm text-blue-100">Platform #1 Jasa Website Kampus</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight max-w-4xl mx-auto">
            Website Kampus{" "}
            <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              Modern & Profesional
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-blue-100/80 mt-6 max-w-2xl mx-auto">
            Solusi digital lengkap dari profil kampus dasar sampai sistem PMB online.
            Hasilkan komisi dengan referral program kami.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <Link href="#produk" className="btn btn-primary text-base px-8 py-3.5">
              Lihat Paket <ArrowRight size={18} />
            </Link>
            <Link href="/register" className="btn bg-white/10 text-white border border-white/20 backdrop-blur-sm hover:bg-white/20 text-base px-8 py-3.5">
              Daftar Gratis
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-lg mx-auto mt-16">
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-white">{stats.productCount}+</p>
              <p className="text-xs sm:text-sm text-blue-200 mt-1">Paket Layanan</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-white">{stats.orderCount}+</p>
              <p className="text-xs sm:text-sm text-blue-200 mt-1">Order Selesai</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-white">{stats.affiliatorCount}+</p>
              <p className="text-xs sm:text-sm text-blue-200 mt-1">Affiliator Aktif</p>
            </div>
          </div>
        </div>
      </section>

      {/* Products */}
      <section id="produk" className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-800">Pilih Paket yang Sesuai</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">
              Semua paket sudah termasuk domain, hosting, SSL, dan token reward yang bisa ditukarkan.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => {
              const primaryImage = product.images[0];
              return (
                <div
                  key={product.id}
                  className={`bg-white rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                    product.isFeatured ? "border-amber-300 ring-2 ring-amber-100" : "border-gray-200"
                  }`}
                >
                  {/* Image */}
                  <div className="relative h-48 bg-gradient-to-br from-slate-800 to-slate-900">
                    {primaryImage && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={primaryImage.url}
                        alt={primaryImage.alt || product.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                    {product.isFeatured && (
                      <div className="absolute top-3 right-3 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        PALING DIMINATI
                      </div>
                    )}
                    {product.originalPrice && (
                      <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                        -{Math.round((1 - Number(product.price) / Number(product.originalPrice)) * 100)}%
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        {product.category}
                      </span>
                      <span className="text-xs text-gray-400">
                        {product.clickCount} views
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">{product.name}</h3>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">{product.shortDesc}</p>

                    {/* Features */}
                    <ul className="space-y-2 mb-5">
                      {product.features.slice(0, 5).map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                          <CheckCircle size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                      {product.features.length > 5 && (
                        <li className="text-sm text-blue-600 font-medium">
                          +{product.features.length - 5} fitur lainnya
                        </li>
                      )}
                    </ul>

                    {/* Price */}
                    <div className="border-t border-gray-100 pt-4">
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-2xl font-bold text-gray-800">
                            {formatCurrency(product.price)}
                          </p>
                          {product.originalPrice && (
                            <p className="text-sm text-gray-400 line-through">
                              {formatCurrency(product.originalPrice)}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-amber-600 text-sm">
                            <Coins size={14} />
                            <span>+{product.tokenReward} token</span>
                          </div>
                          <div className="flex items-center gap-1 text-emerald-600 text-xs mt-0.5">
                            <TrendingUp size={12} />
                            <span>{Number(product.commissionPercent)}% komisi</span>
                          </div>
                        </div>
                      </div>
                      <Link
                        href={`/register?ref=etalase`}
                        className={`btn w-full mt-4 text-sm ${
                          product.isFeatured ? "btn-primary" : "btn-outline"
                        }`}
                      >
                        Pilih Paket Ini
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-800">Bandingkan Paket</h2>
            <p className="text-gray-500 mt-3">Ringkasan fitur utama setiap paket dalam satu tabel</p>
          </div>
          <div className="overflow-x-auto card">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="bg-slate-800 text-white">
                  <th className="text-left px-4 py-3 text-sm font-semibold">Fitur</th>
                  {products.map((p) => (
                    <th key={p.id} className="px-4 py-3 text-center text-sm font-semibold">
                      <span className="block text-xs text-slate-300 uppercase tracking-wider">Paket</span>
                      <span className="block mt-1">{p.name.replace("Paket ", "").split(" - ")[0]}</span>
                      <span className="block text-amber-400 font-bold mt-1">{formatCurrency(p.price)}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr className="bg-blue-50">
                  <td colSpan={products.length + 1} className="px-4 py-2 text-sm font-bold text-blue-800">💰 Harga & Token</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 text-sm text-gray-700">Harga</td>
                  {products.map((p) => (
                    <td key={p.id} className="px-4 py-2.5 text-center text-sm font-bold">{formatCurrency(p.price)}</td>
                  ))}
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 text-sm text-gray-700">Token Reward</td>
                  {products.map((p) => (
                    <td key={p.id} className="px-4 py-2.5 text-center text-sm">
                      <span className="inline-flex items-center gap-1 text-amber-600 font-medium">
                        <Coins size={14} /> +{p.tokenReward} ZGT
                      </span>
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 text-sm text-gray-700">Komisi Referral</td>
                  {products.map((p) => (
                    <td key={p.id} className="px-4 py-2.5 text-center text-sm text-emerald-600 font-medium">
                      {Number(p.commissionPercent)}%
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 text-sm text-gray-700">Harga Asli</td>
                  {products.map((p) => (
                    <td key={p.id} className="px-4 py-2.5 text-center text-sm text-gray-400 line-through">
                      {p.originalPrice ? formatCurrency(p.originalPrice) : "-"}
                    </td>
                  ))}
                </tr>
                <tr className="bg-blue-50">
                  <td colSpan={products.length + 1} className="px-4 py-2 text-sm font-bold text-blue-800">📄 Halaman</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 text-sm text-gray-700">Jumlah Halaman</td>
                  {products.map((p) => (
                    <td key={p.id} className="px-4 py-2.5 text-center text-sm">
                      {p.slug.includes("starter") ? "5-8" : p.slug.includes("professional") ? "15-25" : "30+"}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 text-sm text-gray-700">Halaman per Fakultas</td>
                  {products.map((p) => (
                    <td key={p.id} className="px-4 py-2.5 text-center text-sm">
                      {p.slug.includes("starter") ? "–" : "✓"}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 text-sm text-gray-700">Halaman per Prodi</td>
                  {products.map((p) => (
                    <td key={p.id} className="px-4 py-2.5 text-center text-sm">
                      {p.slug.includes("starter") ? "–" : p.slug.includes("professional") ? "15 prodi" : "15+ prodi"}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 text-sm text-gray-700">Sistem PMB Online</td>
                  {products.map((p) => (
                    <td key={p.id} className="px-4 py-2.5 text-center text-sm">
                      {p.slug.includes("enterprise") ? (
                        <span className="text-emerald-600 font-medium">✓ Lengkap</span>
                      ) : p.slug.includes("professional") ? (
                        <span className="text-amber-600">Info</span>
                      ) : "–"}
                    </td>
                  ))}
                </tr>
                <tr className="bg-blue-50">
                  <td colSpan={products.length + 1} className="px-4 py-2 text-sm font-bold text-blue-800">🎁 Termasuk</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 text-sm text-gray-700">Domain</td>
                  {products.map((p) => (
                    <td key={p.id} className="px-4 py-2.5 text-center text-sm">1 Tahun</td>
                  ))}
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 text-sm text-gray-700">Hosting SSD</td>
                  {products.map((p) => (
                    <td key={p.id} className="px-4 py-2.5 text-center text-sm">
                      {p.slug.includes("starter") ? "2GB" : p.slug.includes("professional") ? "5GB" : "10GB"}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 text-sm text-gray-700">Training Admin</td>
                  {products.map((p) => (
                    <td key={p.id} className="px-4 py-2.5 text-center text-sm">
                      {p.slug.includes("starter") ? "2 jam" : p.slug.includes("professional") ? "4 jam" : "8 jam"}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 text-sm text-gray-700">Maintenance</td>
                  {products.map((p) => (
                    <td key={p.id} className="px-4 py-2.5 text-center text-sm">
                      {p.slug.includes("starter") ? "3 bln" : p.slug.includes("professional") ? "6 bln" : "12 bln"}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 text-sm text-gray-700">Free Revisi</td>
                  {products.map((p) => (
                    <td key={p.id} className="px-4 py-2.5 text-center text-sm">
                      {p.slug.includes("enterprise") ? "3x" : "–"}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 text-sm text-gray-700">Priority Support</td>
                  {products.map((p) => (
                    <td key={p.id} className="px-4 py-2.5 text-center text-sm">
                      {p.slug.includes("enterprise") ? (
                        <span className="text-emerald-600 font-medium">✓</span>
                      ) : "–"}
                    </td>
                  ))}
                </tr>
                <tr className="bg-blue-50">
                  <td colSpan={products.length + 1} className="px-4 py-2 text-sm font-bold text-blue-800">⏱ Waktu</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 text-sm text-gray-700">Estimasi Pengerjaan</td>
                  {products.map((p) => (
                    <td key={p.id} className="px-4 py-2.5 text-center text-sm">
                      {p.slug.includes("starter") ? "2-3 minggu" : p.slug.includes("professional") ? "4-6 minggu" : "8-12 minggu"}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-center text-sm text-gray-400 mt-4 italic">* Harga dan cakupan dapat disesuaikan sesuai kebutuhan</p>
        </div>
      </section>

      {/* Features */}
      <section id="fitur" className="py-16 sm:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-800">Fitur Unggulan</h2>
            <p className="text-gray-500 mt-3">Semua yang Anda butuhkan dalam satu platform</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Package, title: "Etalase Lengkap", desc: "Berbagai paket jasa website untuk berbagai kebutuhan kampus" },
              { icon: Coins, title: "Token Reward", desc: "Dapatkan token setiap pembelian yang bisa ditukarkan" },
              { icon: TrendingUp, title: "Komisi Referral", desc: "Hasilkan komisi dari setiap referral yang berhasil" },
              { icon: MessageCircle, title: "Chat Support", desc: "Tim support siap membantu kapan saja Anda butuhkan" },
            ].map((f, i) => (
              <div key={i} className="card p-6 text-center hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <f.icon size={24} className="text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Referral */}
      <section id="referral" className="py-16 sm:py-24 bg-gradient-to-br from-blue-600 to-blue-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <Award size={48} className="text-blue-200 mx-auto mb-6" />
          <h2 className="text-2xl sm:text-4xl font-bold text-white">Program Referral</h2>
          <p className="text-blue-100 mt-4 max-w-2xl mx-auto text-lg">
            Ajak teman atau kampus lain untuk menggunakan layanan kami dan dapatkan komisi hingga 25% dari setiap transaksi!
          </p>
          <div className="grid sm:grid-cols-3 gap-6 mt-12 max-w-3xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <p className="text-3xl font-bold text-white">15%</p>
              <p className="text-blue-200 text-sm mt-1">Komisi Starter</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <p className="text-3xl font-bold text-white">20%</p>
              <p className="text-blue-200 text-sm mt-1">Komisi Professional</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <p className="text-3xl font-bold text-white">25%</p>
              <p className="text-blue-200 text-sm mt-1">Komisi Enterprise</p>
            </div>
          </div>
          <Link href="/register" className="btn bg-white text-blue-700 hover:bg-blue-50 mt-10 text-base px-8 py-3.5">
            Mulai Hasilkan Komisi <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Shield size={16} className="text-white" />
              </div>
              <span className="font-bold text-white">Zangetsu Etalase</span>
            </div>
            <p className="text-sm text-slate-400">
              © 2026 Zangetsu Web. Jasa Pembuatan Website Kampus Profesional.
            </p>
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm text-slate-400 hover:text-white">Masuk</Link>
              <Link href="/register" className="text-sm text-slate-400 hover:text-white">Daftar</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
