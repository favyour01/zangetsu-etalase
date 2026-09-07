export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import StatusBadge from "@/components/ui/StatusBadge";
import { ShoppingCart } from "lucide-react";

async function getOrders(userId: string) {
  return prisma.order.findMany({
    where: { affiliatorId: userId },
    include: {
      product: { select: { name: true } },
      buyer: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function AffiliatorOrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const orders = await getOrders((session.user as Record<string, unknown>).id as string);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <ShoppingCart size={22} />
          Pesanan
        </h2>
        <p className="text-gray-500 text-sm mt-1">Pesanan dari referral Anda</p>
      </div>

      <div className="card overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>No. Order</th>
              <th>Produk</th>
              <th>Pembeli</th>
              <th>Total</th>
              <th>Komisi</th>
              <th>Token</th>
              <th>Status</th>
              <th>Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-gray-400">
                  Belum ada pesanan
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id}>
                  <td className="font-medium text-blue-600">{o.orderNumber}</td>
                  <td>{o.product.name}</td>
                  <td>{o.buyer.name}</td>
                  <td className="font-medium">{formatCurrency(o.totalPrice)}</td>
                  <td className="text-emerald-600 font-medium">{formatCurrency(o.commissionAmount)}</td>
                  <td className="text-amber-600">+{o.tokenReward}</td>
                  <td><StatusBadge status={o.status} /></td>
                  <td className="text-gray-500">{formatDateTime(o.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
