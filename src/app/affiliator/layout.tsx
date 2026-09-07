"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default function AffiliatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout title="Affiliator Panel" role="affiliator">
      {children}
    </DashboardLayout>
  );
}
