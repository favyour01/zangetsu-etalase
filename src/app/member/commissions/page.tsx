export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import StatusBadge from "@/components/ui/StatusBadge";
import StatCard from "@/components/ui/StatCard";
import { TrendingUp, Wallet, Clock } from "lucide-react";

async function getCommissionData(userId: string) {
  const [commissions, totals] = await Promise.all([
    prisma.commission.findMany({
      where: { affiliatorId: userId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.commission.groupBy({
      by: ["status"],
      where: { affiliatorId: userId },
      _sum: { amount: true },
    }),
  ]);

  const paid = totals.find((t) => t.status === "PAID")?._sum.amount || 0;
  const pending = totals.find((t) => t.status === "PENDING")?._sum.amount || 0;

  return { commissions, paid, pending };
}

export default async function MemberCommissionsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const data = await getCommissionData((session.user as Record<string, unknown>).id as string);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <TrendingUp size={22} />
          Komisi
        </h2>
        <p className="text-gray-500 text-sm mt-1">Riwayat komisi dari referral</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard title="Total Dibayar" value={formatCurrency(data.paid)} icon={Wallet} color="green" />
        <StatCard title="Menunggu" value={formatCurrency(data.pending)} icon={Clock} color="amber" />
      </div>

      <div className="card overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>No. Order</th>
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
                <td colSpan={7} className="text-center py-12 text-gray-400">
                  Belum ada komisi
                </td>
              </tr>
            ) : (
              data.commissions.map((c) => (
                <tr key={c.id}>
                  <td className="font-medium text-blue-600">{c.orderNumber || "-"}</td>
                  <td className="max-w-[200px] truncate">{c.productName}</td>
                  <td>{formatCurrency(c.baseAmount)}</td>
                  <td>{Number(c.commissionRate)}%</td>
                  <td className="font-bold text-emerald-600">{formatCurrency(c.amount)}</td>
                  <td><StatusBadge status={c.status} /></td>
                  <td className="text-gray-500">{formatDateTime(c.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
