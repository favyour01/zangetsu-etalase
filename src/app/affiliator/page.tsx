export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { formatCurrency, formatNumber } from "@/lib/utils";
import StatCard from "@/components/ui/StatCard";
import StatusBadge from "@/components/ui/StatusBadge";
import { Package, ShoppingCart, Users, TrendingUp, Link2, Coins } from "lucide-react";
import Link from "next/link";

async function getDashboardData(userId: string) {
  const [products, orders, referrals, commissions] = await Promise.all([
    prisma.product.findMany({
      where: { affiliatorId: userId },
      include: { images: { where: { isPrimary: true }, take: 1 } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.order.findMany({
      where: { affiliatorId: userId },
      include: { product: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.user.count({ where: { referredById: userId } }),
    prisma.commission.aggregate({
      where: { affiliatorId: userId, status: "PAID" },
      _sum: { amount: true },
    }),
  ]);

  const [productCount, orderCount, pendingCommission] = await Promise.all([
    prisma.product.count({ where: { affiliatorId: userId } }),
    prisma.order.count({ where: { affiliatorId: userId } }),
    prisma.commission.aggregate({
      where: { affiliatorId: userId, status: "PENDING" },
      _sum: { amount: true },
    }),
  ]);

  return {
    products,
    orders,
    referrals,
    commissionTotal: commissions._sum.amount || 0,
    productCount,
    orderCount,
    pendingCommission: pendingCommission._sum.amount || 0,
  };
}

export default async function AffiliatorDashboard() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const userId = (session.user as Record<string, unknown>).id as string;
  const data = await getDashboardData(userId);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { balance: true, tokenBalance: true, referralCode: true },
  });

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="card p-6">
        <h2 className="text-xl font-bold text-gray-800">
          Affiliator Dashboard 🚀
        </h2>
        <p className="text-gray-500 mt-1">Kelola produk dan pantau performa referral Anda.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Produk" value={formatNumber(data.productCount)} icon={Package} color="blue" />
        <StatCard title="Total Pesanan" value={formatNumber(data.orderCount)} icon={ShoppingCart} color="green" />
        <StatCard title="Referral Aktif" value={formatNumber(data.referrals)} icon={Users} color="purple" />
        <StatCard title="Komisi Dibayar" value={formatCurrency(data.commissionTotal)} icon={TrendingUp} color="amber" />
      </div>

      {/* Referral Link */}
      <div className="card p-5">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-3">
          <Link2 size={18} />
          Link Referral Anda
        </h3>
        <div className="flex items-center gap-3">
          <code className="flex-1 bg-gray-100 px-4 py-2.5 rounded-lg text-sm font-mono text-blue-600">
            {process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/register?ref={user?.referralCode}
          </code>
          <button className="btn btn-outline text-sm">Salin</button>
        </div>
        <p className="text-xs text-gray-400 mt-2">Bagikan link ini untuk mendapatkan referral baru</p>
      </div>

      {/* Recent Products */}
      <div className="card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <Package size={18} />
            Produk Terbaru
          </h3>
          <Link href="/affiliator/products" className="text-sm text-blue-600 hover:underline">
            Kelola semua
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Produk</th>
                <th>Harga</th>
                <th>Klik</th>
                <th>Order</th>
                <th>Komisi</th>
              </tr>
            </thead>
            <tbody>
              {data.products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-400">
                    Belum ada produk
                  </td>
                </tr>
              ) : (
                data.products.map((p) => (
                  <tr key={p.id}>
                    <td className="font-medium">{p.name}</td>
                    <td>{formatCurrency(p.price)}</td>
                    <td>{p.clickCount}</td>
                    <td>{p.orderCount}</td>
                    <td className="text-emerald-600 font-medium">{Number(p.commissionPercent)}%</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
