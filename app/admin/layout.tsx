import React from "react";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adminNavItems = [
    { href: "/admin", label: "Dashboard"},
    { href: "/admin/menu", label: "Kelola Menu"},
    { href: "/admin/orders", label: "Pesanan Masuk"},
    { href: "/admin/omset", label: "Rincian Omset"},
    { href: "/admin/ongkir", label: "Kelola Ongkir & Wilayah"},
    { href: "/admin/reviews", label: "Kelola Ulasan"},
    { href: "/admin/content", label: "Edit Header & Konten"},
    { href: "/admin/login-history", label: "Riwayat Login"},
  ];

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#FAF6EE",
        color: "#2A1A11",
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* SIDEBAR KIRI */}
      <aside
        style={{
          width: "260px",
          backgroundColor: "#2A1A11",
          borderRight: "1px solid #4A3222",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "24px 16px",
          position: "sticky",
          top: 0,
          height: "100vh",
          boxSizing: "border-box",
          flexShrink: 0,
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "32px",
              paddingLeft: "8px",
            }}
          >
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "10px",
                backgroundColor: "#EFE3C8",
                color: "#2A1A11",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
              }}
            >
              SB
            </div>
            <div>
              <div style={{ fontSize: "16px", fontWeight: 900, color: "#FFFFFF" }}>
                Soto Banjar
              </div>
              <span
                style={{
                  backgroundColor: "#6D4C30",
                  color: "#EFE3C8",
                  fontSize: "9px",
                  fontWeight: 800,
                  padding: "2px 6px",
                  borderRadius: "4px",
                }}
              >
                ADMIN PANEL
              </span>
            </div>
          </div>

          <nav style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {adminNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "11px 14px",
                  borderRadius: "10px",
                  backgroundColor: "transparent",
                  color: "#D5C5B3",
                  fontSize: "13.5px",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div>
          <Link
            href="/"
            style={{
              display: "block",
              textAlign: "center",
              padding: "10px",
              borderRadius: "10px",
              backgroundColor: "#451A1A",
              color: "#FCA5A5",
              fontSize: "12px",
              fontWeight: 800,
              textDecoration: "none",
            }}
          >
            ← Keluar ke Toko Utama
          </Link>
        </div>
      </aside>

      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {children}
      </main>
    </div>
  );
}