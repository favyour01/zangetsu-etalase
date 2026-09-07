import { getStatusColor, getStatusLabel } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  type?: "default" | "withdrawal" | "order" | "commission" | "topup";
  size?: "sm" | "md";
}

export default function StatusBadge({ status, type = "default", size = "sm" }: StatusBadgeProps) {
  const sizeClass = size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1";
  return (
    <span className={`badge ${getStatusColor(status)} ${sizeClass}`}>
      {getStatusLabel(status)}
    </span>
  );
}
