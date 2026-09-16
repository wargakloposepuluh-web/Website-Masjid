"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";
  const isDisplayPage = pathname.startsWith("/display");

  if (isLoginPage || isDisplayPage) {
    return <main className="min-h-screen w-full relative z-10">{children}</main>;
  }

  return (
    <div className="flex min-h-screen relative z-10">
      <Sidebar />
      <div className="flex-1 lg:ml-64 min-h-screen w-full transition-all print:m-0 print:p-0 flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
