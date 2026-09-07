import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import StatusBadge from "@/components/ui/StatusBadge";
import { ShoppingCart } from "lucide-react";

async function getOrders(userId: string) {
  return prisma.order.findMany({
    where: { buyerId: userId },
    include: { product: { select: { name: true, images: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export default async function MemberOrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const orders = await getOrders((session.user as Record<string, unknown>).id as string);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <ShoppingCart size={22} />
          Pesanan Saya
        </h2>
        <p className="text-gray-500 text-sm mt-1">Riwayat pesanan Anda</p>
      </div>

      <div className="card overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>No. Order</th>
              <th>Produk</th>
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
                <td colSpan={7} className="text-center py-12 text-gray-400">
                  Belum ada pesanan
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id}>
                  <td className="font-medium text-blue-600">{order.orderNumber}</td>
                  <td className="max-w-[200px] truncate">{order.product.name}</td>
                  <td className="font-medium">{formatCurrency(order.totalPrice)}</td>
                  <td className="text-emerald-600">{formatCurrency(order.commissionAmount)}</td>
                  <td className="text-amber-600 font-medium">+{order.tokenReward}</td>
                  <td><StatusBadge status={order.status} /></td>
                  <td className="text-gray-500">{formatDateTime(order.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
