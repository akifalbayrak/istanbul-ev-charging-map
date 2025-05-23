import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "İstanbul Elektrikli Araç Şarj İstasyonları Haritası",
  description: "İBB'nin paylaştığı elektrikli araç şarj istasyonlarının interaktif haritası",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "İstanbul Şarj İstasyonları"
  },
  formatDetection: {
    telephone: false
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className={`${inter.className} w-full h-screen overflow-hidden antialiased`}>
        {children}
      </body>
    </html>
  );
}
