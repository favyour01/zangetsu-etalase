"use client";

import { useState } from "react";
import { Wallet, Upload, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

const PAYMENT_METHODS = [
  "BCA Virtual Account",
  "Mandiri Virtual Account",
  "BNI Virtual Account",
  "BRI Virtual Account",
  "GoPay",
  "OVO",
  "DANA",
  "LinkAja",
];

const QUICK_AMOUNTS = [50000, 100000, 200000, 500000, 1000000];

export default function TopupForm() {
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [loading, setLoading] = useState(false);

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString());
  };

  const formatInputAmount = (value: string) => {
    const num = value.replace(/\D/g, "");
    return num;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const numAmount = parseInt(amount);
    if (!numAmount || numAmount < 10000) {
      toast.error("Minimal topup Rp10.000");
      setLoading(false);
      return;
    }

    if (!paymentMethod) {
      toast.error("Pilih metode pembayaran");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/topups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: numAmount,
          paymentMethod,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Gagal mengajukan topup");
      } else {
        toast.success("Topup berhasil diajukan! Menunggu verifikasi admin.");
        setAmount("");
        setPaymentMethod("");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Quick Amount Buttons */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Pilih Nominal
        </label>
        <div className="flex flex-wrap gap-2">
          {QUICK_AMOUNTS.map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => handleQuickAmount(val)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                amount === val.toString()
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Rp{(val / 1000).toFixed(0)}K
            </button>
          ))}
        </div>
      </div>

      {/* Custom Amount */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Atau Masukkan Nominal
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
            Rp
          </span>
          <input
            type="text"
            value={amount ? Number(amount).toLocaleString("id-ID") : ""}
            onChange={(e) => setAmount(formatInputAmount(e.target.value))}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-lg"
            placeholder="10.000"
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">Minimal topup Rp10.000</p>
      </div>

      {/* Payment Method */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Metode Pembayaran
        </label>
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        >
          <option value="">-- Pilih Metode --</option>
          {PAYMENT_METHODS.map((method) => (
            <option key={method} value={method}>
              {method}
            </option>
          ))}
        </select>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-2">
          <AlertCircle size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium">Informasi Topup</p>
            <ul className="mt-1 list-disc list-inside space-y-1 text-blue-600">
              <li>Topup akan diverifikasi oleh admin dalam 1x24 jam</li>
              <li>Saldo otomatis masuk setelah topup disetujui</li>
              <li>Hubungi admin via chat jika ada kendala</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <Wallet size={18} />
            Ajukan Topup
          </>
        )}
      </button>
    </form>
  );
}
