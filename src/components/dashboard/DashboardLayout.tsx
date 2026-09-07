"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/ui/Sidebar";
import Header from "@/components/ui/Header";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  role: "member" | "affiliator" | "superadmin";
}

export default function DashboardLayout({ children, title, role }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-500">Memuat...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar - desktop */}
      <div className="hidden lg:block">
        <Sidebar
          role={role}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Sidebar - mobile overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10">
            <Sidebar
              role={role}
              collapsed={false}
              onToggle={() => setMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main content */}
      <div
        className="transition-all duration-300"
        style={{
          marginLeft: typeof window !== "undefined" && window.innerWidth >= 1024
            ? sidebarCollapsed ? "70px" : "260px"
            : "0",
        }}
      >
        <Header
          title={title}
          user={{
            name: session?.user?.name || "",
            role: (session?.user as Record<string, unknown>)?.role as string || "MEMBER",
            email: session?.user?.email || "",
          }}
          onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        />
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
