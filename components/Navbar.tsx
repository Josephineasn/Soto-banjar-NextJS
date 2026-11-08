"use client";

import Link from "next/link";
import React from "react";

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenHistory?: () => void;
  onOpenAuth?: () => void;
  currentUser?: { name: string; role: string } | null;
  onLogout?: () => void;
}

export default function Navbar({
  cartCount,
  onOpenCart,
  onOpenHistory,
  onOpenAuth,
  currentUser,
  onLogout,
}: NavbarProps) {
  const scrollTo = (id: string) => {
    if (id === "top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Pengecekan login untuk Riwayat Pesanan
  const handleHistoryClick = () => {
    if (!currentUser) {
      if (onOpenAuth) onOpenAuth();
      return;
    }
    if (onOpenHistory) onOpenHistory();
  };

  return (
    <header
      style={{
        backgroundColor: "#2E1C14",
        borderBottom: "1px solid rgba(253, 230, 138, 0.2)",
        position: "sticky",
        top: 0,
        zIndex: 50,
        boxShadow: "0 4px 20px rgba(46, 28, 20, 0.15)",
      }}
    >
      <div
        style={{
          maxWidth: "1240px",
          margin: "0 auto",
          padding: "14px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "20px",
        }}
      >
        {/* Logo */}
        <div onClick={() => scrollTo("top")} style={{ cursor: "pointer" }}>
          <h1
            style={{
              fontSize: "18px",
              fontWeight: "900",
              color: "#FEF3C7",
              margin: 0,
              lineHeight: "1.2",
            }}
          >
            Soto Banjar
          </h1>
          <span
            style={{
              fontSize: "11px",
              fontWeight: "600",
              color: "#D97706",
              letterSpacing: "1px",
              textTransform: "uppercase",
            }}
          >
            Delivery Jabodetabek
          </span>
        </div>

        {/* Menu Navigasi */}
        <nav style={{ display: "flex", alignItems: "center", gap: "28px" }}>
          {[
            { label: "Beranda", id: "top" },
            { label: "Menu", id: "menu" },
            { label: "Ulasan", id: "ulasan" },
            { label: "Tentang Kami", id: "tentang-kami" },
            { label: "FAQ", id: "faq" },
            { label: "Lokasi", id: "lokasi" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollTo(item.id)}
              style={{
                background: "none",
                border: "none",
                color: item.id === "top" ? "#F59E0B" : "#E7D8C9",
                fontWeight: item.id === "top" ? "800" : "500",
                fontSize: "14px",
                cursor: "pointer",
                padding: "6px 0",
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Tombol Riwayat Pesanan (Hanya jika login) */}
          <button
            type="button"
            onClick={handleHistoryClick}
            style={{
              padding: "9px 14px",
              borderRadius: "12px",
              backgroundColor: "rgba(254, 243, 199, 0.1)",
              border: "1px solid rgba(254, 243, 199, 0.25)",
              color: "#FEF3C7",
              fontSize: "13px",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            Riwayat Pesanan
          </button>

          {/* Autentikasi Customer / Admin */}
          {currentUser ? (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span
                style={{
                  fontSize: "13px",
                  color: "#FEF3C7",
                  fontWeight: "800",
                  textTransform: "lowercase",
                }}
              >
                {currentUser.name}
              </span>

              {/* Tombol Logout Customer */}
              <button
                type="button"
                onClick={onLogout}
                style={{
                  padding: "7px 14px",
                  borderRadius: "10px",
                  backgroundColor: "#7F1D1D",
                  border: "1px solid #991B1B",
                  color: "#FEE2E2",
                  fontSize: "12px",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                Keluar
              </button>

              {/* Ikon Gembok Akses Panel Admin jika Role ADMIN */}
              {currentUser.role === "ADMIN" && (
                <Link
                  href="/admin"
                  title="Masuk ke Panel Pengelola Admin"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    backgroundColor: "rgba(254, 243, 199, 0.15)",
                    border: "1px solid rgba(254, 243, 199, 0.3)",
                    color: "#FEF3C7",
                    textDecoration: "none",
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </Link>
              )}
            </div>
          ) : (
            <button
              type="button"
              data-customer-auth-trigger="true"
              onClick={onOpenAuth}
              style={{
                padding: "9px 16px",
                borderRadius: "12px",
                backgroundColor: "#B45309",
                border: "none",
                color: "#FFFFFF",
                fontSize: "13px",
                fontWeight: "800",
                cursor: "pointer",
              }}
            >
              Masuk / Daftar
            </button>
          )}

          {/* Keranjang Belanja */}
          <button
            type="button"
            onClick={onOpenCart}
            style={{
              position: "relative",
              width: "42px",
              height: "42px",
              borderRadius: "12px",
              backgroundColor: "rgba(254, 243, 199, 0.1)",
              border: "1px solid rgba(254, 243, 199, 0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#FEF3C7",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="19"
              height="19"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            {cartCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-5px",
                  right: "-5px",
                  background: "#B45309",
                  color: "#FFFFFF",
                  fontSize: "10px",
                  fontWeight: "900",
                  borderRadius: "50%",
                  minWidth: "18px",
                  height: "18px",
                  padding: "0 4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}