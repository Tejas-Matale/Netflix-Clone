import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import AuthProvider from "@/components/auth-provider";
import ToastHub from "@/components/toast-hub";
import TitleModalHost from "@/components/title-modal-host";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Netflix Clone",
  description: "Browse and watch movies & TV shows with a modern Netflix-style UI.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  openGraph: {
    title: "Netflix Clone",
    description: "Browse and watch movies & TV shows with a modern Netflix-style UI.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Netflix Clone",
    description: "Browse and watch movies & TV shows with a modern Netflix-style UI.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white`}>
        <AuthProvider>{children}</AuthProvider>
        <ToastHub />
        <TitleModalHost />
      </body>
    </html>
  );
}
