import prisma from "@/lib/prisma";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { BarChart3, TrendingUp, Users, ShoppingCart, MousePointerClick, DollarSign } from "lucide-react";

async function getAnalytics() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [
    totalProducts, totalUsers, totalOrders, totalClicks,
    monthlyOrders, lastMonthOrders,
    monthlyRevenue, lastMonthRevenue,
    topProducts, recentClicks,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.user.count(),
    prisma.order.count(),
    prisma.click.count(),
    prisma.order.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.order.count({ where: { createdAt: { gte: startOfLastMonth, lt: startOfMonth } } }),
    prisma.order.aggregate({ where: { status: "COMPLETED", createdAt: { gte: startOfMonth } }, _sum: { totalPrice: true } }),
    prisma.order.aggregate({ where: { status: "COMPLETED", createdAt: { gte: startOfLastMonth, lt: startOfMonth } }, _sum: { totalPrice: true } }),
    prisma.product.findMany({
      select: { name: true, clickCount: true, orderCount: true },
      orderBy: { orderCount: "desc" },
      take: 5,
    }),
    prisma.click.count({ where: { createdAt: { gte: startOfMonth } } }),
  ]);

  const orderGrowth = lastMonthOrders > 0
    ? ((monthlyOrders - lastMonthOrders) / lastMonthOrders) * 100
    : monthlyOrders > 0 ? 100 : 0;

  const revenueGrowth = lastMonthRevenue._sum.totalPrice && monthlyRevenue._sum.totalPrice
    ? ((Number(monthlyRevenue._sum.totalPrice) - Number(lastMonthRevenue._sum.totalPrice)) / Number(lastMonthRevenue._sum.totalPrice)) * 100
    : monthlyRevenue._sum.totalPrice ? 100 : 0;

  return {
    totalProducts, totalUsers, totalOrders, totalClicks,
    monthlyOrders, monthlyRevenue: monthlyRevenue._sum.totalPrice || 0,
    orderGrowth, revenueGrowth, recentClicks,
    topProducts,
  };
}

export default async function SuperAdminAnalyticsPage() {
  const data = await getAnalytics();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <BarChart3 size={22} />
          Statistik & Analytics
        </h2>
        <p className="text-gray-500 text-sm mt-1">Performa keseluruhan platform</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <ShoppingCart size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Order Bulan Ini</p>
              <p className="text-xl font-bold text-gray-800">{data.monthlyOrders}</p>
              <p className={`text-xs ${data.orderGrowth >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                {data.orderGrowth >= 0 ? "↑" : "↓"} {Math.abs(data.orderGrowth).toFixed(1)}% dari bulan lalu
              </p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <DollarSign size={20} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Revenue Bulan Ini</p>
              <p className="text-xl font-bold text-gray-800">{formatCurrency(data.monthlyRevenue)}</p>
              <p className={`text-xs ${data.revenueGrowth >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                {data.revenueGrowth >= 0 ? "↑" : "↓"} {Math.abs(data.revenueGrowth).toFixed(1)}% dari bulan lalu
              </p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <MousePointerClick size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Klik Bulan Ini</p>
              <p className="text-xl font-bold text-gray-800">{formatNumber(data.recentClicks)}</p>
              <p className="text-xs text-gray-400">Total: {formatNumber(data.totalClicks)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="card">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <TrendingUp size={18} />
            Produk Terlaris
          </h3>
        </div>
        <div className="p-5">
          <div className="space-y-3">
            {data.topProducts.map((p, i) => {
              const maxOrders = Math.max(...data.topProducts.map((x) => x.orderCount), 1);
              const width = (p.orderCount / maxOrders) * 100;
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-400 w-6">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-700 line-clamp-1">{p.name}</p>
                      <span className="text-xs text-gray-500">{p.orderCount} order · {p.clickCount} klik</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${width}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Platform Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-gray-800">{data.totalProducts}</p>
          <p className="text-xs text-gray-500 mt-1">Produk</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-gray-800">{data.totalUsers}</p>
          <p className="text-xs text-gray-500 mt-1">User</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-gray-800">{data.totalOrders}</p>
          <p className="text-xs text-gray-500 mt-1">Order</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-gray-800">{data.totalClicks}</p>
          <p className="text-xs text-gray-500 mt-1">Klik</p>
        </div>
      </div>
    </div>
  );
}
