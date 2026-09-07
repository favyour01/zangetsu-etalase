export const dynamic = "force-dynamic";
import prisma from "@/lib/prisma";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Users, Shield, Star, User } from "lucide-react";

async function getUsers() {
  return prisma.user.findMany({
    select: {
      id: true, name: true, email: true, username: true, role: true,
      isActive: true, balance: true, tokenBalance: true, createdAt: true,
      _count: { select: { orders: true, referrals: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

function RoleBadge({ role }: { role: string }) {
  const colors: Record<string, string> = {
    SUPERADMIN: "bg-red-100 text-red-700",
    AFFILIATOR: "bg-blue-100 text-blue-700",
    MEMBER: "bg-gray-100 text-gray-700",
  };
  return (
    <span className={`badge ${colors[role] || "bg-gray-100 text-gray-600"}`}>
      {role === "SUPERADMIN" ? "Super Admin" : role === "AFFILIATOR" ? "Affiliator" : "Member"}
    </span>
  );
}

export default async function SuperAdminUsersPage() {
  const users = await getUsers();

  const stats = {
    total: users.length,
    members: users.filter((u) => u.role === "MEMBER").length,
    affiliators: users.filter((u) => u.role === "AFFILIATOR").length,
    admins: users.filter((u) => u.role === "SUPERADMIN").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Users size={22} />
          Semua User
        </h2>
        <p className="text-gray-500 text-sm mt-1">Kelola seluruh user di platform</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
          <p className="text-xs text-gray-500 mt-1">Total User</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{stats.affiliators}</p>
          <p className="text-xs text-gray-500 mt-1">Affiliator</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-gray-600">{stats.members}</p>
          <p className="text-xs text-gray-500 mt-1">Member</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{stats.admins}</p>
          <p className="text-xs text-gray-500 mt-1">Super Admin</p>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Saldo</th>
              <th>Token</th>
              <th>Order</th>
              <th>Referral</th>
              <th>Status</th>
              <th>Bergabung</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>
                  <div>
                    <p className="font-medium text-sm">{u.name}</p>
                    <p className="text-xs text-gray-400">@{u.username} · {u.email}</p>
                  </div>
                </td>
                <td><RoleBadge role={u.role} /></td>
                <td className="font-medium">{formatCurrency(u.balance)}</td>
                <td className="text-amber-600">{u.tokenBalance}</td>
                <td>{u._count.orders}</td>
                <td>{u._count.referrals}</td>
                <td>
                  <span className={`badge ${u.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {u.isActive ? "Aktif" : "Nonaktif"}
                  </span>
                </td>
                <td className="text-gray-500 text-xs">{formatDateTime(u.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
