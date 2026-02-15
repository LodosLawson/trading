import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import AppShell from "@/components/layout/AppShell";
import { AuthProvider } from "@/context/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#3b82f6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "MarketPulse — AI Financial Intelligence",
  description: "AI-Native Financial Intelligence Platform — Powered by LockTrace",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MarketPulse",
  },
  icons: {
    icon: "/icons/icon-192.svg",
    apple: [
      { url: "/icons/icon-192.svg" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#050508] text-white selection:bg-blue-500/30`}
      >
        <AuthProvider>
          <AppShell>
            {children}
          </AppShell>
          <Script
            src="/sw.js"
            strategy="afterInteractive"
          />
        </AuthProvider>
      </body>
    </html>
  );
}
