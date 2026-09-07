import prisma from "@/lib/prisma";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import StatusBadge from "@/components/ui/StatusBadge";
import StatCard from "@/components/ui/StatCard";
import { Wallet, CheckCircle, Clock, XCircle } from "lucide-react";

async function getWithdrawalsData() {
  const [withdrawals, stats] = await Promise.all([
    prisma.withdrawal.findMany({
      include: { user: { select: { name: true, role: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.withdrawal.groupBy({
      by: ["status"],
      _sum: { amount: true },
    }),
  ]);

  const paid = stats.find((s) => s.status === "PAID")?._sum.amount || 0;
  const pending = stats.find((s) => s.status === "PENDING")?._sum.amount || 0;
  const rejected = stats.find((s) => s.status === "REJECTED")?._sum.amount || 0;

  return { withdrawals, paid, pending, rejected };
}

export default async function SuperAdminWithdrawalsPage() {
  const data = await getWithdrawalsData();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Wallet size={22} />
          Semua Withdrawal
        </h2>
        <p className="text-gray-500 text-sm mt-1">Proses permintaan penarikan</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Dibayar" value={formatCurrency(data.paid)} icon={CheckCircle} color="green" />
        <StatCard title="Menunggu" value={formatCurrency(data.pending)} icon={Clock} color="amber" />
        <StatCard title="Ditolak" value={formatCurrency(data.rejected)} icon={XCircle} color="red" />
      </div>

      <div className="card overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Jumlah</th>
              <th>Biaya</th>
              <th>Net</th>
              <th>Bank</th>
              <th>Rekening</th>
              <th>Status</th>
              <th>Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {data.withdrawals.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-12 text-gray-400">
                  Belum ada withdrawal
                </td>
              </tr>
            ) : (
              data.withdrawals.map((w) => (
                <tr key={w.id}>
                  <td>
                    <div>
                      <p className="font-medium text-sm">{w.user.name}</p>
                      <p className="text-xs text-gray-400">{w.accountHolder}</p>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${w.user.role === "AFFILIATOR" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}`}>
                      {w.user.role === "AFFILIATOR" ? "Affiliator" : "Member"}
                    </span>
                  </td>
                  <td className="font-medium">{formatCurrency(w.amount)}</td>
                  <td className="text-red-500">{formatCurrency(w.fee)}</td>
                  <td className="font-bold">{formatCurrency(w.netAmount)}</td>
                  <td>{w.bankName}</td>
                  <td className="font-mono text-sm">{w.bankAccount}</td>
                  <td><StatusBadge status={w.status} /></td>
                  <td className="text-gray-500 text-xs">{formatDateTime(w.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
