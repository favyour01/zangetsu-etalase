"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";
import { formatCurrency } from "@/lib/utils";

interface WithdrawalFormProps {
  userId: string;
  balance: number;
}

export default function WithdrawalForm({ userId, balance }: WithdrawalFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    amount: "",
    bankName: "",
    bankAccount: "",
    accountHolder: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          amount: parseFloat(form.amount),
          userId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success("Permintaan withdrawal berhasil diajukan!");
      setOpen(false);
      window.location.reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengajukan withdrawal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn btn-primary">
        <Plus size={16} /> Ajukan Withdrawal
      </button>

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Ajukan Withdrawal" size="md">
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            Saldo tersedia: <strong>{formatCurrency(balance)}</strong>
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">Jumlah (min. Rp 100.000)</label>
            <input
              type="number"
              min={100000}
              max={balance}
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="form-input"
              placeholder="100000"
              required
            />
          </div>
          <div>
            <label className="form-label">Nama Bank</label>
            <input
              type="text"
              value={form.bankName}
              onChange={(e) => setForm({ ...form, bankName: e.target.value })}
              className="form-input"
              placeholder="BCA, Mandiri, BNI..."
              required
            />
          </div>
          <div>
            <label className="form-label">No. Rekening</label>
            <input
              type="text"
              value={form.bankAccount}
              onChange={(e) => setForm({ ...form, bankAccount: e.target.value })}
              className="form-input"
              placeholder="1234567890"
              required
            />
          </div>
          <div>
            <label className="form-label">Nama Pemilik Rekening</label>
            <input
              type="text"
              value={form.accountHolder}
              onChange={(e) => setForm({ ...form, accountHolder: e.target.value })}
              className="form-input"
              placeholder="Nama lengkap"
              required
            />
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-xs text-amber-700">
              Biaya admin: Rp 5.000 akan dipotong dari jumlah withdrawal.
            </p>
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary w-full">
            {loading ? "Mengajukan..." : "Ajukan Sekarang"}
          </button>
        </form>
      </Modal>
    </>
  );
}
