import prisma from "@/lib/prisma";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Link2, Users, TrendingUp } from "lucide-react";

async function getReferralsData() {
  const usersWithReferrals = await prisma.user.findMany({
    where: { referredById: { not: null } },
    include: {
      referredBy: { select: { name: true, referralCode: true } },
      _count: { select: { orders: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalReferrals = usersWithReferrals.length;
  const totalCommission = await prisma.commission.aggregate({
    where: { status: "PAID" },
    _sum: { amount: true },
  });

  return { usersWithReferrals, totalReferrals, totalCommission: totalCommission._sum.amount || 0 };
}

export default async function SuperAdminReferralsPage() {
  const data = await getReferralsData();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Link2 size={22} />
          Referral System
        </h2>
        <p className="text-gray-500 text-sm mt-1">Monitor seluruh referral</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{data.totalReferrals}</p>
          <p className="text-xs text-gray-500 mt-1">Total Referral</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-emerald-600">{formatCurrency(data.totalCommission)}</p>
          <p className="text-xs text-gray-500 mt-1">Komisi Referral</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">
            {data.totalReferrals > 0 ? Math.round((data.totalReferrals / (data.totalReferrals + 10)) * 100) : 0}%
          </p>
          <p className="text-xs text-gray-500 mt-1">Rate Konversi</p>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Direferral oleh</th>
              <th>Kode Ref</th>
              <th>Order</th>
              <th>Bergabung</th>
            </tr>
          </thead>
          <tbody>
            {data.usersWithReferrals.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-gray-400">
                  Belum ada referral
                </td>
              </tr>
            ) : (
              data.usersWithReferrals.map((u) => (
                <tr key={u.id}>
                  <td>
                    <p className="font-medium text-sm">{u.name}</p>
                    <p className="text-xs text-gray-400">@{u.username}</p>
                  </td>
                  <td>{u.referredBy?.name || "-"}</td>
                  <td className="font-mono text-blue-600">{u.referredBy?.referralCode || "-"}</td>
                  <td>{u._count.orders}</td>
                  <td className="text-gray-500 text-xs">{formatDateTime(u.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
