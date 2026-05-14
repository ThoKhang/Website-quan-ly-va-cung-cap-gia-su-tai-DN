import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteHeader } from "@/component/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: "QLGS",
  description: "Frontend UI system for Quan Ly Gia Su",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Suspense fallback={null}>
          <SiteHeader />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
