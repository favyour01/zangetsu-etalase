import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/providers/SessionProvider";

export const metadata: Metadata = {
  title: "Zangetsu Etalase - Platform Jasa Pembuatan Website",
  description: "Platform etalase jasa pembuatan website kampus profesional dengan sistem referral dan komisi",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
