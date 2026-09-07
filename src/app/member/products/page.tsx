export const dynamic = "force-dynamic";
import prisma from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { Eye, MousePointerClick, ShoppingCart, Coins } from "lucide-react";
import Link from "next/link";

async function getProducts() {
  return prisma.product.findMany({
    where: { isActive: true },
    include: { images: { where: { isPrimary: true }, take: 1 } },
    orderBy: { sortOrder: "asc" },
  });
}

export default async function MemberProductsPage() {
  const products = await getProducts();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Etalase Produk</h2>
        <p className="text-gray-500 text-sm mt-1">Daftar paket jasa yang tersedia</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => {
          const image = product.images[0];
          return (
            <div key={product.id} className="card overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-40 bg-gradient-to-br from-slate-700 to-slate-900 relative">
                {image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={image.url} alt={image.alt || product.name} className="w-full h-full object-cover" />
                )}
                {product.isFeatured && (
                  <span className="absolute top-2 right-2 bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    UNGGULAN
                  </span>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 text-sm line-clamp-1">{product.name}</h3>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{product.shortDesc}</p>

                <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Eye size={12} /> {product.viewCount}</span>
                  <span className="flex items-center gap-1"><MousePointerClick size={12} /> {product.clickCount}</span>
                  <span className="flex items-center gap-1"><ShoppingCart size={12} /> {product.orderCount}</span>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                  <div>
                    <p className="text-lg font-bold text-gray-800">{formatCurrency(product.price)}</p>
                    <div className="flex items-center gap-1 text-amber-600 text-xs">
                      <Coins size={12} />
                      <span>+{product.tokenReward} token</span>
                    </div>
                  </div>
                  <Link
                    href={`/api/products/${product.id}/click`}
                    className="btn btn-primary text-xs py-2"
                  >
                    Detail
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
