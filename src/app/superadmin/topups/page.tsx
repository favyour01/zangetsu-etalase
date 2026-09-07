export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import StatusBadge from "@/components/ui/StatusBadge";
import TopupActions from "@/components/dashboard/TopupActions";
import { Wallet, Clock, CheckCircle, XCircle, TrendingUp } from "lucide-react";

export default async function SuperadminTopupsPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SUPERADMIN") return null;

  const topups = await prisma.topup.findMany({
    include: {
      user: {
        select: { id: true, name: true, email: true, username: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const pendingCount = topups.filter((t) => t.status === "PENDING").length;
  const approvedCount = topups.filter((t) => t.status === "APPROVED").length;
  const rejectedCount = topups.filter((t) => t.status === "REJECTED").length;
  const totalApproved = topups
    .filter((t) => t.status === "APPROVED")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const totalPending = topups
    .filter((t) => t.status === "PENDING")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Topup</h1>
        <p className="text-gray-500 mt-1">Verifikasi dan kelola topup saldo user</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Disetujui</p>
              <p className="text-lg font-bold text-gray-900">
                {formatCurrency(totalApproved)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock size={20} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-lg font-bold text-gray-900">
                {formatCurrency(totalPending)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock size={20} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Menunggu</p>
              <p className="text-lg font-bold text-gray-900">{pendingCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Disetujui</p>
              <p className="text-lg font-bold text-gray-900">{approvedCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle size={20} className="text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Ditolak</p>
              <p className="text-lg font-bold text-gray-900">{rejectedCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Topup List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold">Semua Topup</h2>
        </div>
        {topups.length === 0 ? (
          <div className="p-12 text-center">
            <Wallet size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Belum ada data topup</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Jumlah
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Metode
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {topups.map((topup) => (
                  <tr key={topup.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {topup.user.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          @{topup.user.username}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDateTime(topup.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {formatCurrency(topup.amount)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {topup.paymentMethod}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={topup.status} type="topup" />
                    </td>
                    <td className="px-6 py-4">
                      {topup.status === "PENDING" ? (
                        <TopupActions topupId={topup.id} />
                      ) : (
                        <span className="text-xs text-gray-400">
                          {topup.processedAt
                            ? formatDateTime(topup.processedAt)
                            : "-"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
