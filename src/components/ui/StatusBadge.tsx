import { getStatusColor, getStatusLabel } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md";
}

export default function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const sizeClass = size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1";
  return (
    <span className={`badge ${getStatusColor(status)} ${sizeClass}`}>
      {getStatusLabel(status)}
    </span>
  );
}
