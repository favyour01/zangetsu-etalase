import prisma from "@/lib/prisma";
import { formatCurrency, formatNumber } from "@/lib/utils";
import StatCard from "@/components/ui/StatCard";
import StatusBadge from "@/components/ui/StatusBadge";
import {
  Package, ShoppingCart, Users, TrendingUp, Wallet, Coins, MousePointerClick, DollarSign,
} from "lucide-react";
import Link from "next/link";

async function getDashboardData() {
  const [
    productCount, orderCount, userCount, affiliatorCount,
    totalRevenue, totalCommission, totalClicks,
    recentOrders, pendingWithdrawals,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.user.count(),
    prisma.user.count({ where: { role: "AFFILIATOR" } }),
    prisma.order.aggregate({ where: { status: "COMPLETED" }, _sum: { totalPrice: true } }),
    prisma.commission.aggregate({ where: { status: "PAID" }, _sum: { amount: true } }),
    prisma.click.count(),
    prisma.order.findMany({
      include: { product: { select: { name: true } }, buyer: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.withdrawal.count({ where: { status: "PENDING" } }),
  ]);

  return {
    productCount, orderCount, userCount, affiliatorCount,
    totalRevenue: totalRevenue._sum.totalPrice || 0,
    totalCommission: totalCommission._sum.amount || 0,
    totalClicks,
    recentOrders,
    pendingWithdrawals,
  };
}

export default async function SuperAdminDashboard() {
  const data = await getDashboardData();

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="card p-6 bg-gradient-to-r from-slate-800 to-slate-900 text-white border-none">
        <h2 className="text-xl font-bold">Super Admin Dashboard 🛡️</h2>
        <p className="text-slate-300 mt-1">Kelola seluruh sistem dari satu tempat.</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Produk" value={formatNumber(data.productCount)} icon={Package} color="blue" />
        <StatCard title="Total Pesanan" value={formatNumber(data.orderCount)} icon={ShoppingCart} color="green" />
        <StatCard title="Total User" value={formatNumber(data.userCount)} icon={Users} color="purple" />
        <StatCard title="Affiliator" value={formatNumber(data.affiliatorCount)} icon={TrendingUp} color="indigo" />
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value={formatCurrency(data.totalRevenue)} icon={DollarSign} color="green" />
        <StatCard title="Total Komisi" value={formatCurrency(data.totalCommission)} icon={Wallet} color="amber" />
        <StatCard title="Total Klik" value={formatNumber(data.totalClicks)} icon={MousePointerClick} color="purple" />
        <StatCard title="WD Pending" value={formatNumber(data.pendingWithdrawals)} icon={Coins} color="red" />
      </div>

      {/* Recent Orders */}
      <div className="card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <ShoppingCart size={18} />
            Pesanan Terbaru
          </h3>
          <Link href="/superadmin/orders" className="text-sm text-blue-600 hover:underline">
            Lihat semua
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>No. Order</th>
                <th>Produk</th>
                <th>Pembeli</th>
                <th>Total</th>
                <th>Komisi</th>
                <th>Token</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.recentOrders.map((o) => (
                <tr key={o.id}>
                  <td className="font-medium text-blue-600">{o.orderNumber}</td>
                  <td className="max-w-[180px] truncate">{o.product.name}</td>
                  <td>{o.buyer.name}</td>
                  <td className="font-medium">{formatCurrency(o.totalPrice)}</td>
                  <td className="text-emerald-600">{formatCurrency(o.commissionAmount)}</td>
                  <td className="text-amber-600">+{o.tokenReward}</td>
                  <td><StatusBadge status={o.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
