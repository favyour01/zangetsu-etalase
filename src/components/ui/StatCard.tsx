import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    positive: boolean;
  };
  color?: "blue" | "green" | "amber" | "red" | "purple" | "indigo";
}

const colorMap = {
  blue: {
    bg: "bg-blue-50",
    icon: "bg-blue-100 text-blue-600",
    border: "border-blue-100",
  },
  green: {
    bg: "bg-emerald-50",
    icon: "bg-emerald-100 text-emerald-600",
    border: "border-emerald-100",
  },
  amber: {
    bg: "bg-amber-50",
    icon: "bg-amber-100 text-amber-600",
    border: "border-amber-100",
  },
  red: {
    bg: "bg-red-50",
    icon: "bg-red-100 text-red-600",
    border: "border-red-100",
  },
  purple: {
    bg: "bg-purple-50",
    icon: "bg-purple-100 text-purple-600",
    border: "border-purple-100",
  },
  indigo: {
    bg: "bg-indigo-50",
    icon: "bg-indigo-100 text-indigo-600",
    border: "border-indigo-100",
  },
};

export default function StatCard({ title, value, icon: Icon, trend, color = "blue" }: StatCardProps) {
  const colors = colorMap[color];

  return (
    <div className={`stat-card ${colors.border}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
          {trend && (
            <p className={`text-xs mt-1 font-medium ${trend.positive ? "text-emerald-600" : "text-red-500"}`}>
              {trend.positive ? "↑" : "↓"} {trend.value}
            </p>
          )}
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${colors.icon}`}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}
