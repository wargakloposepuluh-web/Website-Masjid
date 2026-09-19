import type { Metadata } from "next";
import "./globals.css";
import AppLayout from "@/components/AppLayout";

export const metadata: Metadata = {
  title: "Masjid Baitul Maghfirah - Sistem Informasi & Keuangan",
  description: "Aplikasi Persuratan & Keuangan Masjid Baitul Maghfirah Kloposepuluh Sukodono Sidoarjo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="scroll-smooth">
      <body className="antialiased bg-[#f8faf7] text-[#111317] min-h-screen selection:bg-emerald-600 selection:text-white relative">
        {/* Background Image Masjid - Kualitas Penuh 100%, Jernih, Tajam & Alami (Tanpa Overlay / Redup) */}
        <div
          className="fixed inset-0 pointer-events-none z-0 select-none bg-cover bg-center bg-no-repeat print:hidden"
          style={{
            backgroundImage: "url('/bg-tv-display.jpg')",
          }}
          aria-hidden="true"
        />

        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
