"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";
  const [authorized, setAuthorized] = useState<boolean>(false);

  const adminNavItems = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/menu", label: "Kelola Menu" },
    { href: "/admin/orders", label: "Pesanan Masuk" },
    { href: "/admin/omset", label: "Rincian Omset" },
    { href: "/admin/ongkir", label: "Kelola Ongkir & Wilayah" },
    { href: "/admin/reviews", label: "Kelola Ulasan" },
    { href: "/admin/content", label: "Edit Header & Konten" },
    { href: "/admin/login-history", label: "Riwayat Login" },
  ];

  useEffect(() => {
    let active = true;

    const verifyAuth = async () => {
      await Promise.resolve();
      if (!active) return;

      if (isLoginPage) {
        setAuthorized(true);
        return;
      }

      const raw = localStorage.getItem("soto_admin_auth");
      if (!raw) {
        window.location.replace("/admin/login");
        return;
      }

      try {
        const parsed = JSON.parse(raw);
        if (parsed?.role === "ADMIN") {
          setAuthorized(true);
        } else {
          window.location.replace("/admin/login");
        }
      } catch {
        window.location.replace("/admin/login");
      }
    };

    void verifyAuth();

    return () => {
      active = false;
    };
  }, [isLoginPage]);

  const handleLogoutAdmin = () => {
    localStorage.removeItem("soto_admin_auth");
    window.location.replace("/admin/login");
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!authorized) {
    return null;
  }

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
            <img
              src="/logo.jpeg"
              alt="Logo Soto Banjar"
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                objectFit: "cover",
                border: "1.5px solid #EFE3C8",
                flexShrink: 0,
              }}
            />
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
            {adminNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "11px 14px",
                    borderRadius: "10px",
                    backgroundColor: isActive ? "#4A3222" : "transparent",
                    color: isActive ? "#EFE3C8" : "#D5C5B3",
                    fontSize: "13.5px",
                    fontWeight: isActive ? 800 : 600,
                    textDecoration: "none",
                  }}
                >
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div>
          <button
            type="button"
            onClick={handleLogoutAdmin}
            style={{
              width: "100%",
              display: "block",
              textAlign: "center",
              padding: "10px",
              borderRadius: "10px",
              backgroundColor: "#451A1A",
              color: "#FCA5A5",
              fontSize: "12px",
              fontWeight: 800,
              border: "none",
              cursor: "pointer",
            }}
          >
            ← Keluar ke Login Admin
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {children}
      </main>
    </div>
  );
}