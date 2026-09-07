"use client";

import { useState, useEffect } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import Modal from "@/components/ui/Modal";
import { Plus, Edit, Trash2, Eye, Coins, TrendingUp } from "lucide-react";
import toast from "react-hot-toast";

type Product = {
  id: string;
  name: string;
  slug: string;
  price: { toNumber(): number };
  clickCount: number;
  orderCount: number;
  isActive: boolean;
  isFeatured: boolean;
  commissionPercent: { toNumber(): number };
  tokenReward: number;
  images: { url: string; alt: string | null }[];
};

async function getProducts(userId: string) {
  return prisma.product.findMany({
    where: { OR: [{ affiliatorId: userId }, { createdById: userId }] },
    include: { images: { where: { isPrimary: true }, take: 1 } },
    orderBy: { createdAt: "desc" },
  });
}

function ProductForm({ product, onClose, onSave }: { product?: Product | null; onClose: () => void; onSave: () => void }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: product?.name || "",
    slug: product?.slug || "",
    shortDesc: "",
    description: "",
    price: product?.price?.toString() || "",
    originalPrice: "",
    category: "Website Kampus",
    features: "",
    commissionPercent: product?.commissionPercent?.toString() || "10",
    tokenReward: product?.tokenReward?.toString() || "0",
    isFeatured: product?.isFeatured || false,
    isActive: product?.isActive !== false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = product ? `/api/affiliator/products/${product.id}` : "/api/affiliator/products";
      const method = product ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price),
          originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : null,
          commissionPercent: parseFloat(form.commissionPercent),
          tokenReward: parseInt(form.tokenReward),
          features: form.features.split("\n").filter(Boolean),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success(product ? "Produk berhasil diperbarui!" : "Produk berhasil ditambahkan!");
      onSave();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan produk");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={product ? "Edit Produk" : "Tambah Produk"} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Nama Produk</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
              className="form-input"
              required
            />
          </div>
          <div>
            <label className="form-label">Slug</label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="form-input"
              required
            />
          </div>
        </div>

        <div>
          <label className="form-label">Deskripsi Singkat</label>
          <input
            type="text"
            value={form.shortDesc}
            onChange={(e) => setForm({ ...form, shortDesc: e.target.value })}
            className="form-input"
          />
        </div>

        <div>
          <label className="form-label">Deskripsi Lengkap</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="form-input min-h-[100px]"
            rows={4}
          />
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="form-label">Harga</label>
            <input
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="form-input"
              required
            />
          </div>
          <div>
            <label className="form-label">Harga Asli (opsional)</label>
            <input
              type="number"
              value={form.originalPrice}
              onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
              className="form-input"
            />
          </div>
          <div>
            <label className="form-label">Kategori</label>
            <input
              type="text"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="form-input"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Komisi (%)</label>
            <input
              type="number"
              value={form.commissionPercent}
              onChange={(e) => setForm({ ...form, commissionPercent: e.target.value })}
              className="form-input"
              min="0"
              max="100"
            />
          </div>
          <div>
            <label className="form-label">Token Reward</label>
            <input
              type="number"
              value={form.tokenReward}
              onChange={(e) => setForm({ ...form, tokenReward: e.target.value })}
              className="form-input"
              min="0"
            />
          </div>
        </div>

        <div>
          <label className="form-label">Fitur (1 per baris)</label>
          <textarea
            value={form.features}
            onChange={(e) => setForm({ ...form, features: e.target.value })}
            className="form-input min-h-[80px]"
            rows={3}
            placeholder="Responsive design&#10;SEO basic&#10;SSL certificate"
          />
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="w-4 h-4 rounded"
            />
            Aktif
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
              className="w-4 h-4 rounded"
            />
            Unggulan
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button type="button" onClick={onClose} className="btn btn-outline">Batal</button>
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default async function AffiliatorProductsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const userId = (session.user as Record<string, unknown>).id as string;
  const products = await getProducts(userId);

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productList, setProductList] = useState<Product[]>(products);

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus produk ini?")) return;
    try {
      const res = await fetch(`/api/affiliator/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus");
      toast.success("Produk berhasil dihapus");
      setProductList(productList.filter((p) => p.id !== id));
    } catch {
      toast.error("Gagal menghapus produk");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Produk</h2>
          <p className="text-gray-500 text-sm mt-1">Kelola produk jasa Anda</p>
        </div>
        <button onClick={() => { setEditingProduct(null); setShowForm(true); }} className="btn btn-primary">
          <Plus size={16} /> Tambah Produk
        </button>
      </div>

      <div className="card overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Produk</th>
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
            {productList.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-gray-400">
                  Belum ada produk
                </td>
              </tr>
            ) : (
              productList.map((p) => (
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
                        <p className="text-xs text-gray-400">{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="font-medium">{formatCurrency(p.price)}</td>
                  <td>{p.clickCount}</td>
                  <td>{p.orderCount}</td>
                  <td className="text-emerald-600">{Number(p.commissionPercent)}%</td>
                  <td className="text-amber-600">+{p.tokenReward}</td>
                  <td>
                    <span className={`badge ${p.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                      {p.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => { setEditingProduct(p); setShowForm(true); }}
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-600"
                        title="Hapus"
                      >
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

      {showForm && (
        <ProductForm
          product={editingProduct}
          onClose={() => setShowForm(false)}
          onSave={() => window.location.reload()}
        />
      )}
    </div>
  );
}
