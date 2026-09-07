import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Link2, Copy } from "lucide-react";

export default async function AffiliatorReferralsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const userId = (session.user as Record<string, unknown>).id as string;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { referralCode: true, _count: { select: { referrals: true } } },
  });

  const referralLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/register?ref=${user?.referralCode}`;

  const topReferrals = await prisma.user.findMany({
    where: { referredById: userId },
    select: {
      name: true,
      _count: { select: { orders: true } },
    },
    orderBy: { orders: { _count: "desc" } },
    take: 10,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Link2 size={22} />
          Referral
        </h2>
        <p className="text-gray-500 text-sm mt-1">Kelola link referral Anda</p>
      </div>

      {/* Referral Link */}
      <div className="card p-6">
        <h3 className="font-semibold text-gray-800 mb-3">Link Referral Anda</h3>
        <div className="flex items-center gap-3">
          <code className="flex-1 bg-blue-50 border border-blue-200 px-4 py-3 rounded-lg text-sm font-mono text-blue-700 break-all">
            {referralLink}
          </code>
          <button
            onClick={() => navigator.clipboard.writeText(referralLink)}
            className="btn btn-primary flex-shrink-0"
          >
            <Copy size={16} /> Salin
          </button>
        </div>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-gray-800">{user?._count.referrals || 0}</p>
            <p className="text-xs text-gray-500">Total Referral</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-emerald-600">15-25%</p>
            <p className="text-xs text-gray-500">Rate Komisi</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-blue-600">{user?.referralCode}</p>
            <p className="text-xs text-gray-500">Kode</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-amber-600">Aktif</p>
            <p className="text-xs text-gray-500">Status</p>
          </div>
        </div>
      </div>

      {/* Top Referrals */}
      <div className="card">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Referral Teratas</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Nama</th>
                <th>Jumlah Order</th>
              </tr>
            </thead>
            <tbody>
              {topReferrals.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-8 text-gray-400">
                    Belum ada referral
                  </td>
                </tr>
              ) : (
                topReferrals.map((r, i) => (
                  <tr key={i}>
                    <td className="text-gray-400">{i + 1}</td>
                    <td className="font-medium">{r.name}</td>
                    <td>{r._count.orders}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
