"use client";

import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  return (
    <DashboardLayout title="Member Dashboard" role="member">
      {children}
    </DashboardLayout>
  );
}
