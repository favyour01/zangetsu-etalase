"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  MessageSquare,
  Wallet,
  TrendingUp,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
  Link2,
  Palette,
  Coins,
  BarChart3,
  Shield,
  CircleDollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  role: "member" | "affiliator" | "superadmin";
  collapsed: boolean;
  onToggle: () => void;
}

const navItems: Record<string, NavItem[]> = {
  member: [
    { label: "Dashboard", href: "/member", icon: <LayoutDashboard size={20} /> },
    { label: "Etalase Produk", href: "/member/products", icon: <Package size={20} /> },
    { label: "Pesanan Saya", href: "/member/orders", icon: <ShoppingCart size={20} /> },
    { label: "Komisi", href: "/member/commissions", icon: <TrendingUp size={20} /> },
    { label: "Topup Saldo", href: "/member/topups", icon: <CircleDollarSign size={20} /> },
    { label: "Withdrawal", href: "/member/withdrawals", icon: <Wallet size={20} /> },
    { label: "Chat Support", href: "/member/chat", icon: <MessageSquare size={20} /> },
    { label: "Profil", href: "/member/profile", icon: <User size={20} /> },
  ],
  affiliator: [
    { label: "Dashboard", href: "/affiliator", icon: <LayoutDashboard size={20} /> },
    { label: "Produk", href: "/affiliator/products", icon: <Package size={20} /> },
    { label: "Pesanan", href: "/affiliator/orders", icon: <ShoppingCart size={20} /> },
    { label: "User Referral", href: "/affiliator/users", icon: <Users size={20} /> },
    { label: "Referral", href: "/affiliator/referrals", icon: <Link2 size={20} /> },
    { label: "Withdrawal", href: "/affiliator/withdrawals", icon: <Wallet size={20} /> },
    { label: "Pengaturan", href: "/affiliator/settings", icon: <Settings size={20} /> },
  ],
  superadmin: [
    { label: "Dashboard", href: "/superadmin", icon: <LayoutDashboard size={20} /> },
    { label: "Produk", href: "/superadmin/products", icon: <Package size={20} /> },
    { label: "Pesanan", href: "/superadmin/orders", icon: <ShoppingCart size={20} /> },
    { label: "Users", href: "/superadmin/users", icon: <Users size={20} /> },
    { label: "Referrals", href: "/superadmin/referrals", icon: <Link2 size={20} /> },
    { label: "Komisi", href: "/superadmin/commissions", icon: <TrendingUp size={20} /> },
    { label: "Withdrawals", href: "/superadmin/withdrawals", icon: <Wallet size={20} /> },
    { label: "Topup", href: "/superadmin/topups", icon: <CircleDollarSign size={20} /> },
    { label: "Tokens", href: "/superadmin/tokens", icon: <Coins size={20} /> },
    { label: "Tema", href: "/superadmin/themes", icon: <Palette size={20} /> },
    { label: "Statistik", href: "/superadmin/analytics", icon: <BarChart3 size={20} /> },
    { label: "Pengaturan", href: "/superadmin/settings", icon: <Settings size={20} /> },
  ],
};

export default function Sidebar({ role, collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const items = navItems[role] || [];

  return (
    <aside
      className={cn(
        "sidebar fixed left-0 top-0 h-screen bg-sidebar text-white flex flex-col z-40",
        collapsed && "collapsed"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/10 flex-shrink-0">
        {!collapsed && (
          <Link href={`/${role}`} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Shield size={18} />
            </div>
            <span className="font-bold text-lg">Zangetsu</span>
          </Link>
        )}
        {collapsed && (
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mx-auto">
            <Shield size={18} />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-3">
          {items.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                      : "text-gray-300 hover:bg-sidebar-hover hover:text-white"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-white/10 flex-shrink-0">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-red-600/20 hover:text-red-400 w-full transition-all"
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut size={20} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      {/* Toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 w-6 h-6 bg-sidebar-active border border-white/10 rounded-full flex items-center justify-center text-gray-300 hover:text-white hover:bg-blue-600 transition-all shadow-lg"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </aside>
  );
}
