"use client";

import React, { useEffect, useMemo, useState } from "react";

interface LoginLogItem {
  id: number | string;
  logCode: string;
  username: string;
  role: string;
  status: string;
  device: string;
  createdAt: string;
  displayTime?: string;
}

const FALLBACK_INITIAL_LOGS: LoginLogItem[] = [
  {
    id: 1,
    logCode: "LOG-1115",
    username: "josephine",
    role: "Customer",
    status: "Berhasil",
    device: "127.0.0.1 (Web Local)",
    createdAt: new Date().toISOString(),
    displayTime: "14 Nov 2026, 22.23",
  },
  {
    id: 2,
    logCode: "LOG-2259",
    username: "josephine",
    role: "Customer",
    status: "Berhasil",
    device: "127.0.0.1 (Web Local)",
    createdAt: new Date().toISOString(),
    displayTime: "14 Nov 2026, 21.20",
  },
  {
    id: 3,
    logCode: "LOG-3164",
    username: "josephine",
    role: "Customer Baru",
    status: "Gagal (Data registrasi belum lengkap.)",
    device: "127.0.0.1 (Web Local)",
    createdAt: new Date().toISOString(),
    displayTime: "9 Nov 2026, 12.07",
  },
  {
    id: 4,
    logCode: "LOG-1468",
    username: "shesherly",
    role: "Customer",
    status: "Gagal (Email atau kata sandi salah.)",
    device: "127.0.0.1 (Web Local)",
    createdAt: new Date().toISOString(),
    displayTime: "9 Nov 2026, 12.06",
  },
  {
    id: 5,
    logCode: "LOG-7143",
    username: "shersherly",
    role: "Customer Baru",
    status: "Berhasil",
    device: "127.0.0.1 (Web Local)",
    createdAt: new Date().toISOString(),
    displayTime: "9 Nov 2026, 10.23",
  },
];

function formatWaktuLog(dateStr?: string, fallbackTime?: string): string {
  if (fallbackTime) return fallbackTime;
  if (!dateStr) return "Baru saja";
  const parsed = new Date(dateStr);
  if (isNaN(parsed.getTime())) return dateStr;

  const tgl = parsed.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const jam = parsed
    .toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    })
    .replace(":", ".");
  return `${tgl}, ${jam}`;
}

export default function AdminLoginHistoryPage() {
  const [logs, setLogs] = useState<LoginLogItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "SUCCESS" | "FAILED">(
    "ALL"
  );

  useEffect(() => {
    async function fetchAndSyncLogs() {
      setLoading(true);
      try {
        // Cek apakah ada log lama di localStorage untuk disinkronkan ke Prisma
        let localLogs: LoginLogItem[] = [];
        const rawLocal =
          localStorage.getItem("soto_login_logs") ||
          localStorage.getItem("login_history") ||
          localStorage.getItem("soto_login_history");

        if (rawLocal) {
          try {
            const parsed: unknown = JSON.parse(rawLocal);
            if (Array.isArray(parsed)) {
              localLogs = parsed.map((item: Record<string, unknown>, idx) => ({
                id: Number(item.id ?? idx + 1),
                logCode: String(
                  item.logCode || item.id || `LOG-${1000 + idx}`
                ).startsWith("LOG-")
                  ? String(item.logCode || item.id)
                  : `LOG-${item.id || 1000 + idx}`,
                username: String(
                  item.username || item.name || item.user || "josephine"
                ),
                role: String(item.role || "Customer"),
                status: String(item.status || "Berhasil"),
                device: String(
                  item.device || item.ip || "127.0.0.1 (Web Local)"
                ),
                createdAt: String(
                  item.createdAt || item.time || new Date().toISOString()
                ),
                displayTime: typeof item.time === "string" ? item.time : undefined,
              }));
            }
          } catch {
            // Abaikan
          }
        }

        const res = await fetch("/api/login-history", { cache: "no-store" });
        if (res.ok) {
          const dbLogs = (await res.json()) as LoginLogItem[];

          // Jika tabel Prisma masih kosong, dorong data localStorage / initial ke Prisma agar muncul di Prisma Studio
          if (dbLogs.length === 0) {
            const seedData =
              localLogs.length > 0 ? localLogs : FALLBACK_INITIAL_LOGS;
            const syncRes = await fetch("/api/login-history", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ syncLogs: seedData }),
            });
            if (syncRes.ok) {
              const synced = (await syncRes.json()) as LoginLogItem[];
              setLogs(synced);
              setLoading(false);
              return;
            }
          } else {
            setLogs(dbLogs);
            setLoading(false);
            return;
          }
        }

        // Fallback jika API belum siap
        setLogs(localLogs.length > 0 ? localLogs : FALLBACK_INITIAL_LOGS);
      } catch {
        setLogs(FALLBACK_INITIAL_LOGS);
      } finally {
        setLoading(false);
      }
    }

    void fetchAndSyncLogs();
  }, []);

  function syncRemainingToLocalStorage(updated: LoginLogItem[]) {
    try {
      localStorage.setItem("soto_login_logs", JSON.stringify(updated));
    } catch {
      // Abaikan
    }
  }

  // Hapus 1 Baris Log
  async function handleDeleteSingleLog(item: LoginLogItem) {
    const nextLogs = logs.filter(
      (l) => l.id !== item.id && l.logCode !== item.logCode
    );
    setLogs(nextLogs);
    syncRemainingToLocalStorage(nextLogs);

    try {
      await fetch(
        `/api/login-history?id=${encodeURIComponent(
          String(item.id)
        )}&logCode=${encodeURIComponent(item.logCode)}`,
        { method: "DELETE" }
      );
    } catch (err) {
      console.error("Gagal menghapus log di database:", err);
    }
  }

  // Bersihkan Semua Log
  async function handleClearAllLogs() {
    if (
      !confirm(
        "Apakah Anda yakin ingin menghapus seluruh riwayat aktivitas login (termasuk di database Prisma)?"
      )
    ) {
      return;
    }

    setLogs([]);
    localStorage.removeItem("soto_login_logs");
    localStorage.removeItem("login_history");
    localStorage.removeItem("soto_login_history");

    try {
      await fetch("/api/login-history?all=true", { method: "DELETE" });
    } catch (err) {
      console.error("Gagal membersihkan semua log:", err);
    }
  }

  // Tambah Simulasi Log Baru ke Prisma (Opsional untuk tes cepat)
  async function handleAddTestLog() {
    try {
      const res = await fetch("/api/login-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "Admin Soto Banjar",
          role: "Admin",
          status: "Berhasil",
          device: "127.0.0.1 (Web Local)",
        }),
      });
      if (res.ok) {
        const created = (await res.json()) as LoginLogItem;
        setLogs((prev) => [created, ...prev]);
      }
    } catch {
      // Abaikan
    }
  }

  const filteredLogs = useMemo(() => {
    return logs.filter((item) => {
      const isSuccess = item.status.toLowerCase().startsWith("berhasil");
      const matchStatus =
        statusFilter === "ALL" ||
        (statusFilter === "SUCCESS" && isSuccess) ||
        (statusFilter === "FAILED" && !isSuccess);

      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        item.username.toLowerCase().includes(q) ||
        item.logCode.toLowerCase().includes(q) ||
        item.role.toLowerCase().includes(q) ||
        item.status.toLowerCase().includes(q);

      return matchStatus && matchSearch;
    });
  }, [logs, statusFilter, searchQuery]);

  const successCount = useMemo(
    () =>
      logs.filter((l) => l.status.toLowerCase().startsWith("berhasil")).length,
    [logs]
  );
  const failedCount = logs.length - successCount;

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#FAF6EE",
        minHeight: "100vh",
      }}
    >
      {/* HEADER HALAMAN SERAGAM DENGAN HALAMAN ADMIN LAINNYA */}
      <header
        style={{
          backgroundColor: "#FFFFFF",
          borderBottom: "1px solid #E5DEC9",
          padding: "20px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "22px",
              fontWeight: 900,
              color: "#2A1A11",
            }}
          >
            Riwayat Aktivitas Login
          </h1>
          <p
            style={{
              margin: "4px 0 0",
              fontSize: "13px",
              color: "#6D4C30",
            }}
          >
            Pencatatan sesi masuk customer dan pengelola admin secara otomatis (Tersinkronisasi dengan Prisma Database).
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => void handleAddTestLog()}
            style={{
              backgroundColor: "#FAF6EE",
              color: "#2A1A11",
              border: "1.5px solid #D6C7B2",
              padding: "10px 16px",
              borderRadius: "12px",
              fontSize: "12.5px",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            + Catat Sesi Saat Ini
          </button>

          {logs.length > 0 && (
            <button
              type="button"
              onClick={() => void handleClearAllLogs()}
              style={{
                backgroundColor: "#DC2626",
                color: "#FFFFFF",
                border: "none",
                padding: "10px 18px",
                borderRadius: "12px",
                fontSize: "12.5px",
                fontWeight: 800,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: "0 4px 12px rgba(220, 38, 38, 0.25)",
              }}
            >
              🗑️ Bersihkan Semua Log
            </button>
          )}
        </div>
      </header>

      <div
        style={{
          padding: "28px 32px 60px",
          display: "flex",
          flexDirection: "column",
          gap: "22px",
        }}
      >
        {/* 3 KARTU RINGKASAN STATISTIK LOGIN */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
            gap: "16px",
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              padding: "18px 20px",
              border: "1.5px solid #E5DEC9",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{ fontSize: "12px", fontWeight: 800, color: "#8A6B47" }}
              >
                Total Aktivitas Tercatat
              </div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: 900,
                  color: "#2A1A11",
                  marginTop: "4px",
                }}
              >
                {logs.length}{" "}
                <span style={{ fontSize: "13px", fontWeight: 700 }}>Sesi</span>
              </div>
            </div>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                backgroundColor: "#FEF3C7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
              }}
            >
              🕒
            </div>
          </div>

          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              padding: "18px 20px",
              border: "1.5px solid #E5DEC9",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{ fontSize: "12px", fontWeight: 800, color: "#8A6B47" }}
              >
                Login Berhasil
              </div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: 900,
                  color: "#166534",
                  marginTop: "4px",
                }}
              >
                {successCount}{" "}
                <span style={{ fontSize: "13px", fontWeight: 700 }}>
                  Berhasil
                </span>
              </div>
            </div>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                backgroundColor: "#DCFCE7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
              }}
            >
              ✓
            </div>
          </div>

          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              padding: "18px 20px",
              border: "1.5px solid #E5DEC9",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{ fontSize: "12px", fontWeight: 800, color: "#8A6B47" }}
              >
                Percobaan Gagal
              </div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: 900,
                  color: "#B45309",
                  marginTop: "4px",
                }}
              >
                {failedCount}{" "}
                <span style={{ fontSize: "13px", fontWeight: 700 }}>Gagal</span>
              </div>
            </div>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                backgroundColor: "#FEF3C7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
              }}
            >
              ⚠️
            </div>
          </div>
        </div>

        {/* KARTU TABEL RIWAYAT LOGIN */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "20px",
            border: "1.5px solid #E5DEC9",
            padding: "24px",
            boxShadow: "0 6px 24px rgba(42, 26, 17, 0.04)",
          }}
        >
          {/* Bar Filter & Pencarian */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "14px",
              marginBottom: "20px",
              paddingBottom: "16px",
              borderBottom: "1.5px solid #F4EFE6",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              {[
                { key: "ALL", label: `Semua Log (${logs.length})` },
                { key: "SUCCESS", label: `Berhasil (${successCount})` },
                { key: "FAILED", label: `Gagal (${failedCount})` },
              ].map((tab) => {
                const active = statusFilter === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() =>
                      setStatusFilter(tab.key as "ALL" | "SUCCESS" | "FAILED")
                    }
                    style={{
                      padding: "8px 16px",
                      borderRadius: "30px",
                      border: active
                        ? "1.5px solid #2A1A11"
                        : "1px solid #D6C7B2",
                      backgroundColor: active ? "#2A1A11" : "#FAF6EE",
                      color: active ? "#EFE3C8" : "#432818",
                      fontSize: "12px",
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <input
              type="text"
              placeholder="🔍 Cari ID Log, nama akun, atau status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: "9px 14px",
                borderRadius: "12px",
                border: "1.5px solid #D6C7B2",
                backgroundColor: "#FAF6EE",
                fontSize: "13px",
                color: "#2A1A11",
                minWidth: "260px",
                outline: "none",
              }}
            />
          </div>

          {/* Tabel Daftar Log */}
          {loading ? (
            <div
              style={{
                padding: "50px",
                textAlign: "center",
                color: "#6D4C30",
                fontWeight: 800,
              }}
            >
              Memuat riwayat aktivitas login dari Prisma...
            </div>
          ) : filteredLogs.length === 0 ? (
            <div
              style={{
                padding: "50px",
                textAlign: "center",
                color: "#8A6B47",
                fontWeight: 700,
                border: "1.5px dashed #D6C7B2",
                borderRadius: "14px",
              }}
            >
              Belum ada catatan riwayat login yang sesuai filter.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  textAlign: "left",
                  fontSize: "13px",
                }}
              >
                <thead>
                  <tr
                    style={{
                      borderBottom: "1.5px solid #E5DEC9",
                      color: "#8A6B47",
                      fontSize: "12px",
                      fontWeight: 900,
                      textTransform: "uppercase",
                      letterSpacing: "0.4px",
                    }}
                  >
                    <th style={{ padding: "12px 10px" }}>ID Log</th>
                    <th style={{ padding: "12px 10px" }}>Waktu Masuk</th>
                    <th style={{ padding: "12px 10px" }}>Nama / Akun</th>
                    <th style={{ padding: "12px 10px" }}>Peran (Role)</th>
                    <th style={{ padding: "12px 10px" }}>Status Login</th>
                    <th style={{ padding: "12px 10px" }}>Perangkat / IP</th>
                    <th style={{ padding: "12px 10px", textAlign: "right" }}>
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((item) => {
                    const isSuccess = item.status
                      .toLowerCase()
                      .startsWith("berhasil");
                    const isAdminRole = item.role
                      .toLowerCase()
                      .includes("admin");

                    return (
                      <tr
                        key={`${item.id}-${item.logCode}`}
                        style={{
                          borderBottom: "1px solid #F4EFE6",
                          transition: "background-color 0.15s",
                        }}
                      >
                        <td
                          style={{
                            padding: "14px 10px",
                            fontWeight: 800,
                            color: "#8A6B47",
                            fontFamily: "monospace",
                            fontSize: "12.5px",
                          }}
                        >
                          {item.logCode}
                        </td>

                        <td
                          style={{
                            padding: "14px 10px",
                            color: "#64748B",
                            fontSize: "12.5px",
                            whiteSpace: "nowrap",
                          }}
                        >
                          🕒 {formatWaktuLog(item.createdAt, item.displayTime)}
                        </td>

                        <td
                          style={{
                            padding: "14px 10px",
                            fontWeight: 900,
                            color: "#2A1A11",
                          }}
                        >
                          {item.username}
                        </td>

                        <td style={{ padding: "14px 10px" }}>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "4px 11px",
                              borderRadius: "20px",
                              fontSize: "11px",
                              fontWeight: 800,
                              backgroundColor: isAdminRole
                                ? "#FEF3C7"
                                : "#EFF6FF",
                              color: isAdminRole ? "#92400E" : "#1D4ED8",
                              border: isAdminRole
                                ? "1px solid #F59E0B"
                                : "1px solid #BFDBFE",
                            }}
                          >
                            {item.role}
                          </span>
                        </td>

                        <td style={{ padding: "14px 10px" }}>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "4px 12px",
                              borderRadius: "20px",
                              fontSize: "11.5px",
                              fontWeight: 800,
                              backgroundColor: isSuccess
                                ? "#DCFCE7"
                                : "#FEF3C7",
                              color: isSuccess ? "#166534" : "#92400E",
                            }}
                          >
                            {item.status}
                          </span>
                        </td>

                        <td
                          style={{
                            padding: "14px 10px",
                            color: "#64748B",
                            fontSize: "12px",
                          }}
                        >
                          {item.device}
                        </td>

                        {/* Tombol Hapus Satu per Satu */}
                        <td
                          style={{
                            padding: "14px 10px",
                            textAlign: "right",
                            whiteSpace: "nowrap",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => void handleDeleteSingleLog(item)}
                            title={`Hapus ${item.logCode}`}
                            style={{
                              padding: "6px 12px",
                              borderRadius: "8px",
                              border: "1px solid #FECACA",
                              backgroundColor: "#FEF2F2",
                              color: "#DC2626",
                              fontSize: "11.5px",
                              fontWeight: 800,
                              cursor: "pointer",
                            }}
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}