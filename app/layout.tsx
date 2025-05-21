import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "İstanbul Elektrikli Araç Şarj İstasyonları Haritası",
  description: "İBB'nin paylaştığı elektrikli araç şarj istasyonlarının interaktif haritası",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${inter.className} w-full h-screen overflow-hidden`}>
        {children}
      </body>
    </html>
  );
}
