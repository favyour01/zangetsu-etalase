export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import StatusBadge from "@/components/ui/StatusBadge";
import StatCard from "@/components/ui/StatCard";
import { Wallet, CheckCircle, Clock } from "lucide-react";

async function getWithdrawalData(userId: string) {
  const [withdrawals, totals] = await Promise.all([
    prisma.withdrawal.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
    prisma.withdrawal.groupBy({
      by: ["status"],
      where: { userId },
      _sum: { amount: true },
    }),
  ]);

  const paid = totals.find((t) => t.status === "PAID")?._sum.amount || 0;
  const pending = totals.find((t) => t.status === "PENDING")?._sum.amount || 0;

  return { withdrawals, paid, pending };
}

export default async function AffiliatorWithdrawalsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const userId = (session.user as Record<string, unknown>).id as string;
  const data = await getWithdrawalData(userId);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Wallet size={22} />
          Withdrawal
        </h2>
        <p className="text-gray-500 text-sm mt-1">Riwayat penarikan saldo</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard title="Total Ditarik" value={formatCurrency(data.paid)} icon={CheckCircle} color="green" />
        <StatCard title="Menunggu" value={formatCurrency(data.pending)} icon={Clock} color="amber" />
      </div>

      <div className="card overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Jumlah</th>
              <th>Biaya</th>
              <th>Net</th>
              <th>Bank</th>
              <th>Rekening</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.withdrawals.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-gray-400">
                  Belum ada withdrawal
                </td>
              </tr>
            ) : (
              data.withdrawals.map((w) => (
                <tr key={w.id}>
                  <td className="text-gray-500">{formatDateTime(w.createdAt)}</td>
                  <td className="font-medium">{formatCurrency(w.amount)}</td>
                  <td className="text-red-500">{formatCurrency(w.fee)}</td>
                  <td className="font-bold">{formatCurrency(w.netAmount)}</td>
                  <td>{w.bankName}</td>
                  <td className="font-mono text-sm">{w.bankAccount}</td>
                  <td><StatusBadge status={w.status} /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
