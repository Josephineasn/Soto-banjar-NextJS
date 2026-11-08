"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Form login admin
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navItems = [
    {
      label: "Dashboard",
      href: "/admin",
      icon: (
        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      ),
    },
    {
      label: "Kelola Menu",
      href: "/admin/menu",
      icon: (
        <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      ),
    },
    {
      label: "Pesanan Masuk",
      href: "/admin/orders",
      icon: (
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      ),
    },
    {
      label: "Rincian Omset",
      href: "/admin/omset",
      icon: (
        <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      ),
    },
    {
      label: "Kelola Ulasan",
      href: "/admin/reviews",
      icon: (
        <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      ),
    },
    {
      label: "Edit Header & Konten Web",
      href: "/admin/content",
      icon: (
        <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      ),
    },
    {
      label: "Riwayat Login",
      href: "/admin/login-history",
      icon: (
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      ),
    },
  ];

  useEffect(() => {
    queueMicrotask(() => {
      const session = localStorage.getItem("soto_admin_auth");
      if (session === "true") {
        setIsAdminLoggedIn(true);
      }
      setCheckingAuth(false);
    });
  }, []);

  function handleAdminLogin(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setIsSubmitting(true);

    const cleanUser = adminUsername.trim();

    if (cleanUser === "admin" && adminPassword === "admin123") {
      localStorage.setItem("soto_admin_auth", "true");
      setIsAdminLoggedIn(true);
      setAdminUsername("");
      setAdminPassword("");
    } else {
      setErrorMsg("Username atau kata sandi admin salah.");
    }
    setIsSubmitting(false);
  }

  function handleAdminLogout() {
    localStorage.removeItem("soto_admin_auth");
    setIsAdminLoggedIn(false);
  }

  if (checkingAuth) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#FAF6EE",
          color: "#734F31",
          fontSize: "14px",
          fontWeight: "700",
        }}
      >
        Memeriksa hak akses panel pengelola...
      </div>
    );
  }

  // Tampilan Login Admin
  if (!isAdminLoggedIn) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          backgroundColor: "#FAF6EE",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "420px",
            backgroundColor: "#FFFFFF",
            borderRadius: "20px",
            overflow: "hidden",
            border: "1.5px solid #E8D1A7",
            boxShadow: "0 20px 50px rgba(115, 79, 49, 0.12)",
          }}
        >
          <div
            style={{
              height: "140px",
              backgroundColor: "#2E1C14",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "16px",
              textAlign: "center",
              borderBottom: "2px solid #E8D1A7",
            }}
          >
            <div
              style={{
                backgroundColor: "rgba(232, 209, 167, 0.2)",
                border: "1px solid #E8D1A7",
                color: "#E8D1A7",
                fontSize: "10px",
                fontWeight: "800",
                letterSpacing: "0.8px",
                padding: "3px 12px",
                borderRadius: "20px",
                textTransform: "uppercase",
                marginBottom: "10px",
              }}
            >
              AREA KHUSUS PENGELOLA
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "50%",
                  backgroundColor: "#FFFFFF",
                  border: "2px solid #E8D1A7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    backgroundColor: "#734F31",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#FAF6EE",
                    fontSize: "11px",
                    fontWeight: "900",
                  }}
                >
                  SB
                </div>
              </div>
              <div style={{ textAlign: "left" }}>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "900", color: "#FEF3C7" }}>
                  Soto Banjar
                </h3>
                <span style={{ fontSize: "11px", color: "#E8D1A7", fontWeight: "600" }}>
                  Selera Nusantara • Admin Panel
                </span>
              </div>
            </div>
          </div>

          <div style={{ padding: "28px" }}>
            <h4 style={{ margin: "0 0 6px", fontSize: "18px", fontWeight: "900", color: "#734F31" }}>
              Selamat Datang!
            </h4>
            <p style={{ margin: "0 0 20px", fontSize: "12px", color: "#9D9167" }}>
              Silakan masuk dengan kredensial pengelola admin.
            </p>

            <form onSubmit={handleAdminLogin} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#734F31", marginBottom: "6px" }}>
                  Username Admin
                </label>
                <input
                  type="text"
                  required
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  placeholder="admin"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "10px",
                    border: "1px solid #E8D1A7",
                    backgroundColor: "#FAF6EE",
                    fontSize: "13px",
                    color: "#734F31",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#734F31", marginBottom: "6px" }}>
                  Kata Sandi
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{
                      width: "100%",
                      padding: "10px 75px 10px 12px",
                      borderRadius: "10px",
                      border: "1px solid #E8D1A7",
                      backgroundColor: "#FAF6EE",
                      fontSize: "13px",
                      color: "#734F31",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      fontSize: "11px",
                      fontWeight: "700",
                      color: "#9D9167",
                      cursor: "pointer",
                    }}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div style={{ padding: "8px 12px", borderRadius: "8px", backgroundColor: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626", fontSize: "12px" }}>
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "10px",
                  backgroundColor: "#734F31",
                  color: "#FAF6EE",
                  border: "none",
                  fontSize: "13px",
                  fontWeight: "800",
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  marginTop: "6px",
                  boxShadow: "0 4px 12px rgba(115, 79, 49, 0.25)",
                }}
              >
                {isSubmitting ? "Memproses..." : "Masuk ke Dashboard →"}
              </button>
            </form>

            <div style={{ marginTop: "18px", textAlign: "center" }}>
              <Link href="/" style={{ fontSize: "12px", color: "#9D9167", textDecoration: "none", fontWeight: "700" }}>
                ← Kembali ke Halaman Web Customer
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Tampilan Utama
  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#FAF6EE", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <aside
        style={{
          width: "240px",
          backgroundColor: "#2E1C14",
          color: "#FAF6EE",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          borderRight: "1px solid rgba(232, 209, 167, 0.25)",
        }}
      >
        <div style={{ padding: "20px 18px", display: "flex", alignItems: "center", gap: "12px", borderBottom: "1px solid rgba(232, 209, 167, 0.2)" }}>
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "50%",
              backgroundColor: "#FAF6EE",
              border: "2px solid #E8D1A7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: "26px",
                height: "26px",
                borderRadius: "50%",
                backgroundColor: "#734F31",
                color: "#FAF6EE",
                fontSize: "10px",
                fontWeight: "900",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              SB
            </div>
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <strong style={{ fontSize: "14px", color: "#FEF3C7" }}>Soto Banjar</strong>
              <span style={{ fontSize: "9px", backgroundColor: "#734F31", color: "#E8D1A7", padding: "1px 5px", borderRadius: "4px", fontWeight: "800", border: "1px solid #E8D1A7" }}>
                ADMIN
              </span>
            </div>
            <span style={{ fontSize: "10px", color: "#D4C5B9", letterSpacing: "0.5px" }}>
              PANEL DELIVERY
            </span>
          </div>
        </div>

        {/* Menu Navigasi*/}
        <nav style={{ padding: "16px 12px", display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  textDecoration: "none",
                  fontSize: "13px",
                  fontWeight: isActive ? "800" : "600",
                  backgroundColor: isActive ? "#734F31" : "transparent",
                  color: isActive ? "#FAF6EE" : "#D4C5B9",
                  border: isActive ? "1px solid #E8D1A7" : "1px solid transparent",
                  transition: "all 0.15s ease",
                  cursor: "pointer",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ flexShrink: 0, color: isActive ? "#E8D1A7" : "#D4C5B9" }}
                >
                  {item.icon}
                </svg>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Tombol Logout */}
        <div style={{ padding: "14px 12px", borderTop: "1px solid rgba(232, 209, 167, 0.2)" }}>
          <button
            type="button"
            onClick={handleAdminLogout}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 14px",
              borderRadius: "8px",
              backgroundColor: "rgba(220, 38, 38, 0.15)",
              color: "#FCA5A5",
              border: "1px solid rgba(220, 38, 38, 0.4)",
              fontSize: "13px",
              fontWeight: "700",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Keluar Admin</span>
          </button>
        </div>
      </aside>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <header
          style={{
            backgroundColor: "#FFFFFF",
            borderBottom: "1.5px solid #E8D1A7",
            padding: "16px 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: "20px", fontWeight: "900", color: "#734F31" }}>
              Panel Operasional Toko
            </h1>
            <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#9D9167" }}>
              Kelola menu sajian, pantau omset harian, dan konfirmasi ulasan customer.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "#FAF6EE",
              padding: "6px 14px",
              borderRadius: "50px",
              border: "1px solid #E8D1A7",
            }}
          >
            <div
              style={{
                width: "22px",
                height: "22px",
                borderRadius: "50%",
                backgroundColor: "#734F31",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FAF6EE",
              }}
            >
              <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
            <span style={{ fontSize: "12px", fontWeight: "800", color: "#734F31" }}>Admin Utama</span>
          </div>
        </header>

        <main style={{ flex: 1, padding: "26px 32px", overflowY: "auto" }}>
          {children}
        </main>
      </div>
    </div>
  );
}