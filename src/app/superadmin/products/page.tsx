export const dynamic = "force-dynamic";
import prisma from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import StatusBadge from "@/components/ui/StatusBadge";
import { Package, Edit, Trash2, Eye, Plus, Star } from "lucide-react";
import Link from "next/link";

async function getProducts() {
  return prisma.product.findMany({
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      affiliator: { select: { name: true } },
      _count: { select: { orders: true, clicks: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function SuperAdminProductsPage() {
  const products = await getProducts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Package size={22} />
            Semua Produk
          </h2>
          <p className="text-gray-500 text-sm mt-1">Kelola seluruh produk di platform</p>
        </div>
        <Link href="/superadmin/products/new" className="btn btn-primary">
          <Plus size={16} /> Tambah Produk
        </Link>
      </div>

      <div className="card overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Produk</th>
              <th>Affiliator</th>
              <th>Harga</th>
              <th>Klik</th>
              <th>Order</th>
              <th>Komisi</th>
              <th>Token</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-12 text-gray-400">
                  Belum ada produk
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {p.images[0] && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.images[0].url} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm line-clamp-1">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-sm text-gray-500">{p.affiliator?.name || "-"}</td>
                  <td className="font-medium">{formatCurrency(p.price)}</td>
                  <td>{p._count.clicks}</td>
                  <td>{p._count.orders}</td>
                  <td className="text-emerald-600">{Number(p.commissionPercent)}%</td>
                  <td className="text-amber-600">+{p.tokenReward}</td>
                  <td>
                    <span className={`badge ${p.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                      {p.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                    {p.isFeatured && (
                      <span className="badge bg-amber-100 text-amber-700 ml-1">
                        <Star size={10} className="inline" /> Featured
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <Link href={`/superadmin/products/${p.id}`} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600">
                        <Eye size={16} />
                      </Link>
                      <Link href={`/superadmin/products/${p.id}/edit`} className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600">
                        <Edit size={16} />
                      </Link>
                      <button className="p-1.5 rounded-lg hover:bg-red-50 text-red-600">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
