import prisma from "@/lib/prisma";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import StatusBadge from "@/components/ui/StatusBadge";
import StatCard from "@/components/ui/StatCard";
import { ShoppingCart, DollarSign, Clock, CheckCircle } from "lucide-react";

async function getOrdersData() {
  const [orders, stats] = await Promise.all([
    prisma.order.findMany({
      include: {
        product: { select: { name: true } },
        buyer: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.groupBy({
      by: ["status"],
      _count: { id: true },
      _sum: { totalPrice: true, commissionAmount: true },
    }),
  ]);

  const completed = stats.find((s) => s.status === "COMPLETED");
  const pending = stats.find((s) => s.status === "PENDING");

  return {
    orders,
    totalRevenue: completed?._sum?.totalPrice || 0,
    totalCommission: completed?._sum?.commissionAmount || 0,
    completedCount: completed?._count?.id || 0,
    pendingCount: pending?._count?.id || 0,
  };
}

export default async function SuperAdminOrdersPage() {
  const data = await getOrdersData();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <ShoppingCart size={22} />
          Semua Pesanan
        </h2>
        <p className="text-gray-500 text-sm mt-1">Monitor seluruh transaksi</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value={formatCurrency(data.totalRevenue)} icon={DollarSign} color="green" />
        <StatCard title="Total Komisi" value={formatCurrency(data.totalCommission)} icon={ShoppingCart} color="blue" />
        <StatCard title="Selesai" value={data.completedCount.toString()} icon={CheckCircle} color="green" />
        <StatCard title="Pending" value={data.pendingCount.toString()} icon={Clock} color="amber" />
      </div>

      <div className="card overflow-x-auto">
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
              <th>Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {data.orders.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-gray-400">
                  Belum ada pesanan
                </td>
              </tr>
            ) : (
              data.orders.map((o) => (
                <tr key={o.id}>
                  <td className="font-medium text-blue-600">{o.orderNumber}</td>
                  <td className="max-w-[180px] truncate">{o.product.name}</td>
                  <td>
                    <div>
                      <p className="text-sm">{o.buyer.name}</p>
                      <p className="text-xs text-gray-400">{o.buyer.email}</p>
                    </div>
                  </td>
                  <td className="font-medium">{formatCurrency(o.totalPrice)}</td>
                  <td className="text-emerald-600">{formatCurrency(o.commissionAmount)}</td>
                  <td className="text-amber-600">+{o.tokenReward}</td>
                  <td><StatusBadge status={o.status} /></td>
                  <td className="text-gray-500 text-xs">{formatDateTime(o.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
