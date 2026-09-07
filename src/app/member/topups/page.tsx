export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import StatusBadge from "@/components/ui/StatusBadge";
import TopupForm from "@/components/dashboard/TopupForm";
import { Wallet, Plus, Clock, CheckCircle, XCircle } from "lucide-react";

export default async function MemberTopupsPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const [topups, user] = await Promise.all([
    prisma.topup.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { balance: true },
    }),
  ]);

  const pendingCount = topups.filter((t) => t.status === "PENDING").length;
  const approvedCount = topups.filter((t) => t.status === "APPROVED").length;
  const totalTopup = topups
    .filter((t) => t.status === "APPROVED")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Topup Saldo</h1>
          <p className="text-gray-500 mt-1">Isi saldo untuk membeli produk</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Wallet size={20} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Saldo Saat Ini</p>
              <p className="text-lg font-bold text-gray-900">
                {formatCurrency(user?.balance || 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <CheckCircle size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Topup</p>
              <p className="text-lg font-bold text-gray-900">
                {formatCurrency(totalTopup)}
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
              <p className="text-sm text-gray-500">Berhasil</p>
              <p className="text-lg font-bold text-gray-900">{approvedCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Topup Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Plus size={20} className="text-emerald-600" />
          <h2 className="text-lg font-semibold">Ajukan Topup Baru</h2>
        </div>
        <TopupForm />
      </div>

      {/* Topup History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold">Riwayat Topup</h2>
        </div>
        {topups.length === 0 ? (
          <div className="p-12 text-center">
            <Wallet size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Belum ada riwayat topup</p>
            <p className="text-sm text-gray-400 mt-1">Ajukan topup pertama Anda di atas</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
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
                    Catatan
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {topups.map((topup) => (
                  <tr key={topup.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(topup.createdAt)}
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
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {topup.adminNote || "-"}
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
