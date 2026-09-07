import clsx, { ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(amount: number | string | { toNumber(): number }): string {
  let num: number;
  if (typeof amount === "object" && amount !== null && "toNumber" in amount) {
    num = (amount as { toNumber(): number }).toNumber();
  } else {
    num = typeof amount === "string" ? parseFloat(amount) : amount;
  }
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("id-ID").format(num);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function generateOrderNumber(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rand = Math.floor(Math.random() * 9999).toString().padStart(4, "0");
  return `ORD-${y}${m}${d}-${rand}`;
}

export function generateReferralCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.substring(0, length) + "...";
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    // Order
    PENDING: "bg-yellow-100 text-yellow-800",
    PROCESSING: "bg-blue-100 text-blue-800",
    COMPLETED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
    REFUNDED: "bg-gray-100 text-gray-800",
    // Withdrawal
    APPROVED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
    PAID: "bg-emerald-100 text-emerald-800",
    // Commission
    OPEN: "bg-green-100 text-green-800",
    CLOSED: "bg-gray-100 text-gray-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: "Menunggu",
    PROCESSING: "Diproses",
    COMPLETED: "Selesai",
    CANCELLED: "Dibatalkan",
    REFUNDED: "Dikembalikan",
    APPROVED: "Disetujui",
    REJECTED: "Ditolak",
    PAID: "Dibayar",
    OPEN: "Aktif",
    CLOSED: "Ditutup",
  };
  return labels[status] || status;
}
