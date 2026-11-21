"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function AdminLoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const inputUser = username.trim().toLowerCase();
        const inputPass = password.trim();

        if (inputUser !== "admin" || inputPass !== "admin123") {
        setError("Username atau password admin salah.");
        setLoading(false);
        return;
        }

        const adminSession = {
        id: "admin-1",
        name: "Admin Utama",
        username: "admin",
        email: "admin@sotobanjar.com",
        role: "ADMIN",
        isAdmin: true,
        };

        try {
        await fetch("/api/login-history", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
            name: "Admin Utama",
            email: "admin",
            role: "ADMIN",
            }),
        }).catch(() => {});
        } finally {
        localStorage.setItem("soto_admin_auth", JSON.stringify(adminSession));
        window.location.replace("/admin");
        }
    };

    return (
        <div
        style={{
            minHeight: "100vh",
            backgroundColor: "#2A1A11",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            fontFamily:
            "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
        >
        <div
            style={{
            width: "100%",
            maxWidth: "410px",
            backgroundColor: "#FAF6EE",
            borderRadius: "24px",
            padding: "36px 32px",
            boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
            border: "1.5px solid #E5DEC9",
            }}
        >
            <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                marginBottom: "28px",
            }}
            >
            <img
                src="/logo.jpeg"
                alt="Logo Soto Banjar"
                style={{
                width: "64px",
                height: "64px",
                borderRadius: "16px",
                objectFit: "cover",
                border: "2px solid #2A1A11",
                marginBottom: "14px",
                }}
            />
            <span
                style={{
                backgroundColor: "#6D4C30",
                color: "#EFE3C8",
                fontSize: "10px",
                fontWeight: 800,
                padding: "3px 10px",
                borderRadius: "999px",
                letterSpacing: "0.8px",
                marginBottom: "8px",
                }}
            >
                PORTAL KHUSUS ADMIN
            </span>
            <h1
                style={{
                margin: 0,
                fontSize: "22px",
                fontWeight: 900,
                color: "#2A1A11",
                }}
            >
                Login Admin
            </h1>
            <p
                style={{
                margin: "6px 0 0",
                fontSize: "12.5px",
                color: "#6D4C30",
                }}
            >
                Soto Banjar Selera Nusantara
            </p>
            </div>

            {error && (
            <div
                style={{
                backgroundColor: "#FEE2E2",
                border: "1px solid #FCA5A5",
                color: "#991B1B",
                padding: "10px 14px",
                borderRadius: "12px",
                fontSize: "12.5px",
                fontWeight: 700,
                marginBottom: "18px",
                }}
            >
                {error}
            </div>
            )}

            <form
            onSubmit={handleLogin}
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
            <div>
                <label
                style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 800,
                    color: "#2A1A11",
                    marginBottom: "6px",
                }}
                >
                Username Admin
                </label>
                <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username"
                style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: "12px",
                    border: "1.5px solid #D5C5B3",
                    backgroundColor: "#FFFFFF",
                    fontSize: "13.5px",
                    color: "#2A1A11",
                    boxSizing: "border-box",
                    outline: "none",
                }}
                />
            </div>

            <div>
                <label
                style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 800,
                    color: "#2A1A11",
                    marginBottom: "6px",
                }}
                >
                Password
                </label>
                <div style={{ position: "relative" }}>
                <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password"
                    style={{
                    width: "100%",
                    padding: "12px 44px 12px 14px",
                    borderRadius: "12px",
                    border: "1.5px solid #D5C5B3",
                    backgroundColor: "#FFFFFF",
                    fontSize: "13.5px",
                    color: "#2A1A11",
                    boxSizing: "border-box",
                    outline: "none",
                    }}
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    fontSize: "11px",
                    fontWeight: 800,
                    color: "#6D4C30",
                    cursor: "pointer",
                    }}
                >
                    {showPassword ? "Tutup" : "Lihat"}
                </button>
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                style={{
                marginTop: "6px",
                width: "100%",
                padding: "13px",
                borderRadius: "12px",
                backgroundColor: "#2A1A11",
                color: "#EFE3C8",
                fontSize: "14px",
                fontWeight: 900,
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                }}
            >
                {loading ? "Memverifikasi..." : "Masuk ke Panel Admin"}
            </button>
            </form>

            <div
            style={{
                marginTop: "22px",
                paddingTop: "16px",
                borderTop: "1px solid #E5DEC9",
                textAlign: "center",
            }}
            >
            <Link
                href="/"
                style={{
                fontSize: "12.5px",
                fontWeight: 700,
                color: "#6D4C30",
                textDecoration: "none",
                }}
            >
                ← Kembali ke Halaman Customer
            </Link>
            </div>
        </div>
        </div>
    );
}