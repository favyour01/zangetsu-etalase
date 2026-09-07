"use client";

import { useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface TopupActionsProps {
  topupId: string;
}

export default function TopupActions({ topupId }: TopupActionsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();

  const handleAction = async (status: "APPROVED" | "REJECTED") => {
    setLoading(status);
    try {
      const res = await fetch(`/api/superadmin/topups/${topupId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Gagal memproses topup");
      } else {
        toast.success(
          status === "APPROVED"
            ? "Topup disetujui! Saldo user telah ditambahkan."
            : "Topup ditolak."
        );
        router.refresh();
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleAction("APPROVED")}
        disabled={loading !== null}
        className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
        title="Setujui"
      >
        {loading === "APPROVED" ? (
          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <CheckCircle size={14} />
        )}
        Setujui
      </button>
      <button
        onClick={() => handleAction("REJECTED")}
        disabled={loading !== null}
        className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
        title="Tolak"
      >
        {loading === "REJECTED" ? (
          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <XCircle size={14} />
        )}
        Tolak
      </button>
    </div>
  );
}
