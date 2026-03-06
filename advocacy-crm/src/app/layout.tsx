import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Navigation from "@/components/Navigation";

export const metadata: Metadata = {
  title: "Advocacy CRM",
  description: "Customer advocacy relationship management",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <Script src="https://cdn.tailwindcss.com" strategy="beforeInteractive" />
        <Navigation />
        <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
