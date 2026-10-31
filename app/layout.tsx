import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Soto Banjar Selera Nusantara - Delivery Online",
  description: "Layanan Pesan Antar Soto Banjar & Wadai Asli Khas Banjar Panas Sampai Rumah.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body style={{ margin: 0, padding: 0, boxSizing: "border-box", backgroundColor: "#fffdf7", fontFamily: "sans-serif" }}>
        {children}
      </body>
    </html>
  );
}