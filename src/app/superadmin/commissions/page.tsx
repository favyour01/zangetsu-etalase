export const dynamic = "force-dynamic";
import prisma from "@/lib/prisma";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import StatusBadge from "@/components/ui/StatusBadge";
import StatCard from "@/components/ui/StatCard";
import { TrendingUp, DollarSign, Clock, CheckCircle } from "lucide-react";

async function getCommissionsData() {
  const [commissions, stats] = await Promise.all([
    prisma.commission.findMany({
      include: { affiliator: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.commission.groupBy({
      by: ["status"],
      _sum: { amount: true },
    }),
  ]);

  const paid = stats.find((s) => s.status === "PAID")?._sum.amount || 0;
  const pending = stats.find((s) => s.status === "PENDING")?._sum.amount || 0;

  return { commissions, paid, pending };
}

export default async function SuperAdminCommissionsPage() {
  const data = await getCommissionsData();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <TrendingUp size={22} />
          Semua Komisi
        </h2>
        <p className="text-gray-500 text-sm mt-1">Kelola komisi affiliator</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Dibayar" value={formatCurrency(data.paid)} icon={CheckCircle} color="green" />
        <StatCard title="Menunggu" value={formatCurrency(data.pending)} icon={Clock} color="amber" />
        <StatCard title="Total" value={formatCurrency(Number(data.paid) + Number(data.pending))} icon={DollarSign} color="blue" />
      </div>

      <div className="card overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Affiliator</th>
              <th>Order</th>
              <th>Produk</th>
              <th>Dasar</th>
              <th>Rate</th>
              <th>Jumlah</th>
              <th>Status</th>
              <th>Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {data.commissions.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-gray-400">
                  Belum ada komisi
                </td>
              </tr>
            ) : (
              data.commissions.map((c) => (
                <tr key={c.id}>
                  <td className="font-medium">{c.affiliator.name}</td>
                  <td className="text-blue-600">{c.orderNumber || "-"}</td>
                  <td className="max-w-[180px] truncate">{c.productName}</td>
                  <td>{formatCurrency(c.baseAmount)}</td>
                  <td>{Number(c.commissionRate)}%</td>
                  <td className="font-bold text-emerald-600">{formatCurrency(c.amount)}</td>
                  <td><StatusBadge status={c.status} /></td>
                  <td className="text-gray-500 text-xs">{formatDateTime(c.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
