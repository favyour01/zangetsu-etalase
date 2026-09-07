export const dynamic = "force-dynamic";
import prisma from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { Coins, Plus, Edit, TrendingUp, Users } from "lucide-react";

async function getTokensData() {
  const [tokens, totalDistributed, totalHolders] = await Promise.all([
    prisma.token.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.user.aggregate({ _sum: { tokenBalance: true } }),
    prisma.user.count({ where: { tokenBalance: { gt: 0 } } }),
  ]);

  return { tokens, totalDistributed: totalDistributed._sum.tokenBalance || 0, totalHolders };
}

export default async function SuperAdminTokensPage() {
  const data = await getTokensData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Coins size={22} />
            Token Management
          </h2>
          <p className="text-gray-500 text-sm mt-1">Kelola token reward sistem</p>
        </div>
        <button className="btn btn-primary">
          <Plus size={16} /> Tambah Token
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{data.tokens.length}</p>
          <p className="text-xs text-gray-500 mt-1">Jenis Token</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{data.totalDistributed}</p>
          <p className="text-xs text-gray-500 mt-1">Total Beredar</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-emerald-600">{data.totalHolders}</p>
          <p className="text-xs text-gray-500 mt-1">Pemilik Token</p>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Token</th>
              <th>Simbol</th>
              <th>Nilai</th>
              <th>Status</th>
              <th>Dibuat</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.tokens.map((t) => (
              <tr key={t.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-amber-100 rounded-full flex items-center justify-center">
                      <Coins size={16} className="text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{t.name}</p>
                      <p className="text-xs text-gray-400 line-clamp-1">{t.description}</p>
                    </div>
                  </div>
                </td>
                <td className="font-mono font-bold text-amber-600">{t.symbol}</td>
                <td className="font-medium">{formatCurrency(t.value)}</td>
                <td>
                  <span className={`badge ${t.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                    {t.isActive ? "Aktif" : "Nonaktif"}
                  </span>
                </td>
                <td className="text-gray-500 text-xs">{t.createdAt.toLocaleDateString("id-ID")}</td>
                <td>
                  <button className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600">
                    <Edit size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
