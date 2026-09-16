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
      <body className="antialiased bg-[#f3f4f7] text-[#111317] min-h-screen selection:bg-emerald-600 selection:text-white relative">
        {/* Background Image Masjid - Full Halaman */}
        <div
          className="fixed inset-0 pointer-events-none z-0 select-none overflow-hidden print:hidden"
          aria-hidden="true"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/bg_masjid.jpg"
            alt="Background Masjid"
            className="w-full h-full object-cover object-center opacity-50 md:opacity-65 mix-blend-multiply transition-all duration-300"
          />
        </div>

        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
