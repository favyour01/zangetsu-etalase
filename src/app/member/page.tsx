import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { formatCurrency, formatNumber } from "@/lib/utils";
import StatCard from "@/components/ui/StatCard";
import StatusBadge from "@/components/ui/StatusBadge";
import { ShoppingCart, TrendingUp, MousePointerClick, Wallet, Package, Coins } from "lucide-react";
import Link from "next/link";

async function getDashboardData(userId: string) {
  const [orders, commissions, clicks, user] = await Promise.all([
    prisma.order.findMany({
      where: { buyerId: userId },
      include: { product: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.commission.findMany({
      where: { affiliatorId: userId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.click.count({ where: { userId } }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { balance: true, tokenBalance: true },
    }),
  ]);

  const [orderCount, commissionTotal, pendingWithdrawals] = await Promise.all([
    prisma.order.count({ where: { buyerId: userId } }),
    prisma.commission.aggregate({
      where: { affiliatorId: userId, status: "PAID" },
      _sum: { amount: true },
    }),
    prisma.withdrawal.count({
      where: { userId, status: "PENDING" },
    }),
  ]);

  return {
    orders,
    commissions,
    clicks,
    user,
    orderCount,
    commissionTotal: commissionTotal._sum.amount || 0,
    pendingWithdrawals,
  };
}

export default async function MemberDashboard() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const data = await getDashboardData((session.user as Record<string, unknown>).id as string);

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="card p-6">
        <h2 className="text-xl font-bold text-gray-800">
          Selamat datang, {session.user.name}! 👋
        </h2>
        <p className="text-gray-500 mt-1">Berikut ringkasan aktivitas Anda hari ini.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Pesanan"
          value={formatNumber(data.orderCount)}
          icon={ShoppingCart}
          color="blue"
        />
        <StatCard
          title="Total Komisi"
          value={formatCurrency(data.commissionTotal)}
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          title="Total Klik"
          value={formatNumber(data.clicks)}
          icon={MousePointerClick}
          color="purple"
        />
        <StatCard
          title="Saldo"
          value={formatCurrency(data.user?.balance || 0)}
          icon={Wallet}
          color="amber"
        />
      </div>

      {/* Token balance */}
      <div className="card p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
            <Coins size={20} className="text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Token Balance</p>
            <p className="text-xl font-bold text-gray-800">{data.user?.tokenBalance || 0} ZGT</p>
          </div>
        </div>
        <span className="text-xs text-gray-400">Reward dari setiap pembelian</span>
      </div>

      {/* Recent Orders */}
      <div className="card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <Package size={18} />
            Pesanan Terakhir
          </h3>
          <Link href="/member/orders" className="text-sm text-blue-600 hover:underline">
            Lihat semua
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>No. Order</th>
                <th>Produk</th>
                <th>Total</th>
                <th>Status</th>
                <th>Token</th>
              </tr>
            </thead>
            <tbody>
              {data.orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-400">
                    Belum ada pesanan
                  </td>
                </tr>
              ) : (
                data.orders.map((order) => (
                  <tr key={order.id}>
                    <td className="font-medium text-blue-600">{order.orderNumber}</td>
                    <td>{order.product.name}</td>
                    <td className="font-medium">{formatCurrency(order.totalPrice)}</td>
                    <td><StatusBadge status={order.status} /></td>
                    <td className="text-amber-600 font-medium">+{order.tokenReward}</td>
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
