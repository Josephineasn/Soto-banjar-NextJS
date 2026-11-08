"use client";

import React, { useEffect, useState } from "react";

interface LoginLogItem {
    id: string;
    time: string;
    name: string;
    role: string;
    status: string;
    device: string;
}

    export default function AdminLoginHistoryPage() {
    const [logs, setLogs] = useState<LoginLogItem[]>([]);

    function loadLogs() {
        const stored = localStorage.getItem("soto_login_logs");
        if (stored) {
        try {
            const parsed: LoginLogItem[] = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
            setLogs(parsed);
            return;
            }
        } catch {}
        }

        const initial: LoginLogItem[] = [
        {
            id: "LOG-8261",
            time: "8 Nov 2026, 20.13",
            name: "Admin Utama (admin)",
            role: "Admin",
            status: "Berhasil",
            device: "127.0.0.1 (Panel Dashboard)",
        },
        {
            id: "LOG-8924",
            time: "8 Nov 2026, 21.05",
            name: "josephine",
            role: "Customer",
            status: "Berhasil",
            device: "127.0.0.1 (Web Local)",
        },
        ];
        setLogs(initial);
        localStorage.setItem("soto_login_logs", JSON.stringify(initial));
    }

    useEffect(() => {
        queueMicrotask(() => {
        loadLogs();
        });

        const handleStorageChange = () => loadLogs();
        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);

    function handleClearLogs() {
        if (confirm("Bersihkan seluruh catatan riwayat login?")) {
        setLogs([]);
        localStorage.removeItem("soto_login_logs");
        }
    }

    return (
        <div>
        <div style={{ marginBottom: "24px" }}>
            <h2
            style={{
                fontSize: "24px",
                fontWeight: "900",
                color: "#734F31",
                margin: "0 0 6px",
                fontFamily: "serif",
            }}
            >
            Riwayat Aktivitas Login
            </h2>
            <p style={{ fontSize: "13px", color: "#9D9167", margin: 0 }}>
            Pencatatan sesi masuk customer dan pengelola admin secara otomatis.
            </p>
        </div>

        <div
            style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "16px",
            border: "1.5px solid #E8D1A7",
            padding: "26px",
            boxShadow: "0 4px 20px rgba(115, 79, 49, 0.04)",
            }}
        >
            <div
            style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
            }}
            >
            <h3
                style={{
                margin: 0,
                fontSize: "16px",
                fontWeight: "800",
                color: "#734F31",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                }}
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#734F31" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
                </svg>
                Riwayat Login Pengguna &amp; Admin
            </h3>

            <button
                type="button"
                onClick={handleClearLogs}
                style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "7px 14px",
                backgroundColor: "#DC2626",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "8px",
                fontSize: "11px",
                fontWeight: "800",
                cursor: "pointer",
                }}
            >
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                Bersihkan Log
            </button>
            </div>

            {logs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#9D9167", fontSize: "13px" }}>
                Tidak ada riwayat aktivitas login.
            </div>
            ) : (
            <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
                <thead>
                    <tr style={{ borderBottom: "1.5px solid #E8D1A7", color: "#9D9167" }}>
                    <th style={{ padding: "12px 10px", fontWeight: "800" }}>ID Log</th>
                    <th style={{ padding: "12px 10px", fontWeight: "800" }}>Waktu Masuk</th>
                    <th style={{ padding: "12px 10px", fontWeight: "800" }}>Nama / Akun</th>
                    <th style={{ padding: "12px 10px", fontWeight: "800" }}>Peran (Role)</th>
                    <th style={{ padding: "12px 10px", fontWeight: "800" }}>Status Login</th>
                    <th style={{ padding: "12px 10px", fontWeight: "800" }}>Perangkat / IP</th>
                    </tr>
                </thead>
                <tbody>
                    {logs.map((item) => (
                    <tr key={item.id} style={{ borderBottom: "1px solid #FAF6EE", color: "#2E1C14" }}>
                        <td style={{ padding: "12px 10px", color: "#9D9167", whiteSpace: "nowrap" }}>
                        {item.id}
                        </td>
                        <td style={{ padding: "12px 10px", color: "#64748B", whiteSpace: "nowrap" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                            </svg>
                            {item.time}
                        </span>
                        </td>
                        <td style={{ padding: "12px 10px", fontWeight: "800", color: "#734F31" }}>
                        {item.name}
                        </td>
                        <td style={{ padding: "12px 10px", whiteSpace: "nowrap" }}>
                        <span
                            style={{
                            backgroundColor: item.role.includes("Admin") ? "#FEE2E2" : "#E0F2FE",
                            color: item.role.includes("Admin") ? "#991B1B" : "#0369A1",
                            fontSize: "11px",
                            fontWeight: "700",
                            padding: "2px 8px",
                            borderRadius: "6px",
                            }}
                        >
                            {item.role}
                        </span>
                        </td>
                        <td style={{ padding: "12px 10px", whiteSpace: "nowrap" }}>
                        <span
                            style={{
                            backgroundColor: item.status.includes("Gagal") ? "#FEF3C7" : "#DCFCE7",
                            color: item.status.includes("Gagal") ? "#92400E" : "#166534",
                            fontSize: "11px",
                            fontWeight: "800",
                            padding: "3px 8px",
                            borderRadius: "6px",
                            }}
                        >
                            {item.status}
                        </span>
                        </td>
                        <td style={{ padding: "12px 10px", color: "#64748B", fontSize: "11px" }}>
                        {item.device}
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
            )}
        </div>
        </div>
    );
}