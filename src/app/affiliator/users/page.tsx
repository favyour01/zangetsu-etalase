export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Users, ShoppingCart, TrendingUp } from "lucide-react";

async function getReferralUsers(userId: string) {
  const users = await prisma.user.findMany({
    where: { referredById: userId },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      createdAt: true,
      _count: { select: { orders: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Calculate commission earned from each user
  const userIds = users.map((u) => u.id);
  const commissions = await prisma.commission.findMany({
    where: { orderId: { in: await prisma.order.findMany({ where: { buyerId: { in: userIds } }, select: { id: true } }).then(orders => orders.map(o => o.id)) } },
    select: { amount: true, orderId: true },
  });

  const orderToBuyer = new Map<string, string>();
  const orders = await prisma.order.findMany({
    where: { buyerId: { in: userIds } },
    select: { id: true, buyerId: true },
  });
  orders.forEach((o) => orderToBuyer.set(o.id, o.buyerId));

  const commissionMap = new Map<string, number>();
  commissions.forEach((c) => {
    const buyerId = c.orderId ? orderToBuyer.get(c.orderId) : undefined;
    if (buyerId) {
      commissionMap.set(buyerId, (commissionMap.get(buyerId) || 0) + Number(c.amount));
    }
  });

  return users.map((u) => ({
    ...u,
    commission: commissionMap.get(u.id) || 0,
  }));
}

export default async function AffiliatorUsersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const users = await getReferralUsers((session.user as Record<string, unknown>).id as string);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Users size={22} />
          User Referral
        </h2>
        <p className="text-gray-500 text-sm mt-1">User yang mendaftar dengan kode referral Anda</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{users.length}</p>
          <p className="text-xs text-gray-500 mt-1">Total Referral</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-emerald-600">
            {users.reduce((sum, u) => sum + u._count.orders, 0)}
          </p>
          <p className="text-xs text-gray-500 mt-1">Total Order</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">
            {formatCurrency(users.reduce((sum, u) => sum + u.commission, 0))}
          </p>
          <p className="text-xs text-gray-500 mt-1">Total Komisi</p>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Bergabung</th>
              <th>Order</th>
              <th>Komisi</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-gray-400">
                  Belum ada referral
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div>
                      <p className="font-medium text-sm">{u.name}</p>
                      <p className="text-xs text-gray-400">@{u.username}</p>
                    </div>
                  </td>
                  <td className="text-gray-500">{u.email}</td>
                  <td className="text-gray-500">{formatDateTime(u.createdAt)}</td>
                  <td>{u._count.orders}</td>
                  <td className="text-emerald-600 font-medium">{formatCurrency(u.commission)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
