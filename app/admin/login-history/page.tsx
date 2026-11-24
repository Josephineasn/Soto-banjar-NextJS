"use client";

import React, { useEffect, useState, useMemo } from "react";

interface LoginLogRecord {
  id: string | number;
  logCode?: string;
  username?: string;
  name?: string;
  email?: string;
  role?: string;
  status?: string;
  action?: string;
  device?: string;
  ipAddress?: string;
  createdAt?: string;
}

const DELETED_LOGS_STORAGE_KEY = "soto_deleted_login_logs";

// Membaca daftar ID atau logCode yang sudah dihapus
function readDeletedLogIds(): Set<string> {
  if (typeof window === "undefined") return new Set<string>();
  try {
    const raw = window.localStorage.getItem(DELETED_LOGS_STORAGE_KEY);
    if (!raw) return new Set<string>();
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return new Set(parsed.map((x) => String(x).trim()));
    }
  } catch {}
  return new Set<string>();
}

// Menandai ID atau logCode
function markLogAsDeleted(idOrCode: string | number) {
  if (typeof window === "undefined") return;
  try {
    const current = readDeletedLogIds();
    current.add(String(idOrCode).trim());
    window.localStorage.setItem(
      DELETED_LOGS_STORAGE_KEY,
      JSON.stringify(Array.from(current))
    );
  } catch {}
}

function clearDeletedLogMarkers() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(DELETED_LOGS_STORAGE_KEY);
  } catch {}
}

function getLogIdentifier(item: LoginLogRecord): string {
  return String(item.logCode ?? item.id ?? "").trim();
}

function normalizeRole(
  rawRole?: string,
  rawUsername?: string
): "ADMIN" | "CUSTOMER" {
  const r = String(rawRole || "").toUpperCase();
  const u = String(rawUsername || "").toLowerCase();
  if (r.includes("ADMIN") || u.includes("admin")) {
    return "ADMIN";
  }
  return "CUSTOMER";
}

// Mendeteksi percobaan login gagal dari status, action, maupun kode FAIL-
function isFailedStatus(
  rawStatus?: string,
  rawAction?: string,
  rawCode?: string | number
): boolean {
  const combined = `${String(rawStatus || "")} ${String(
    rawAction || ""
  )} ${String(rawCode || "")}`.toUpperCase();
  return (
    combined.includes("GAGAL") ||
    combined.includes("FAIL") ||
    combined.includes("SALAH") ||
    combined.includes("WRONG") ||
    combined.includes("INVALID") ||
    combined.includes("ERROR")
  );
}

// Mendeteksi aktivitas logout
function isLogoutStatus(rawStatus?: string, rawId?: string | number): boolean {
  const s = String(rawStatus || "").toUpperCase();
  const idStr = String(rawId || "").toUpperCase();
  return (
    s.includes("LOGOUT") || s.includes("KELUAR") || idStr.startsWith("OUT-")
  );
}

export default function AdminLoginHistoryPage() {
  // State daftar log login, status loading, tab filter
  const [logs, setLogs] = useState<LoginLogRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [tabFilter, setTabFilter] = useState<"ALL" | "SUCCESS" | "FAILED">(
    "ALL"
  );
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Memuat riwayat login langsung dari API database Prisma
  useEffect(() => {
    let isCancelled = false;

    async function loadLogs() {
      try {
        const deletedIds = readDeletedLogIds();

        let dbLogs: LoginLogRecord[] = [];
        try {
          const res = await fetch("/api/login-history", { cache: "no-store" });
          if (res.ok) {
            const data: unknown = await res.json();
            if (Array.isArray(data)) {
              dbLogs = data as LoginLogRecord[];
            }
          }
        } catch {}

        const cleaned: LoginLogRecord[] = [];
        const seenCodes = new Set<string>();

        for (const item of dbLogs) {
          const code = String(item.logCode || item.id || "").trim();
          const idStr = item.id !== undefined ? String(item.id).trim() : "";
          const key = code || idStr;
          if (!key || seenCodes.has(key)) continue;

          if (
            (code && deletedIds.has(code)) ||
            (idStr && deletedIds.has(idStr))
          ) {
            continue;
          }

          seenCodes.add(key);

          const userLabel =
            item.username ||
            (item.name
              ? `${item.name}${item.email ? ` (${item.email})` : ""}`
              : "Pelanggan");

          cleaned.push({
            ...item,
            id: item.id ?? key,
            logCode: code || idStr,
            username: userLabel,
            role: normalizeRole(item.role, userLabel),
            status: String(item.status || item.action || "LOGIN BERHASIL")
              .trim()
              .toUpperCase(),
            device: item.device || item.ipAddress || "Web Browser",
            createdAt: item.createdAt || new Date().toISOString(),
          });
        }

        cleaned.sort((a, b) => {
          const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return tB - tA;
        });

        if (!isCancelled) {
          setLogs(cleaned);
          if (typeof window !== "undefined") {
            try {
              window.localStorage.setItem(
                "soto_login_logs",
                JSON.stringify(cleaned)
              );
            } catch {}
          }
        }
      } catch (err) {
        console.error("Gagal memuat riwayat login:", err);
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    void loadLogs();

    const handleSync = () => {
      void loadLogs();
    };
    window.addEventListener("authChanged", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      isCancelled = true;
      window.removeEventListener("authChanged", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  // Menghitung ringkasan total sesi, login berhasil, dan percobaan gagal
  const stats = useMemo(() => {
    let successCount = 0;
    let failedCount = 0;

    for (const log of logs) {
      if (isFailedStatus(log.status, log.action, log.logCode ?? log.id)) {
        failedCount += 1;
      } else {
        successCount += 1;
      }
    }

    return {
      total: logs.length,
      success: successCount,
      failed: failedCount,
    };
  }, [logs]);

  // Menyaring log
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const failed = isFailedStatus(log.status, log.action, log.logCode ?? log.id);
      if (tabFilter === "SUCCESS" && failed) return false;
      if (tabFilter === "FAILED" && !failed) return false;

      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const code = String(log.logCode || log.id || "").toLowerCase();
        const user = String(log.username || "").toLowerCase();
        const st = String(log.status || "").toLowerCase();
        const rl = String(log.role || "").toLowerCase();
        return (
          code.includes(q) ||
          user.includes(q) ||
          st.includes(q) ||
          rl.includes(q)
        );
      }

      return true;
    });
  }, [logs, tabFilter, searchQuery]);

  // Mencatat akun saat ini ke database Prisma
  const handleRecordCurrentSession = async () => {
    if (typeof window === "undefined") return;

    let activeUser = {
      name: "Admin Utama",
      email: "admin@sotobanjar.com",
      role: "ADMIN",
    };

    try {
      const rawUser =
        window.sessionStorage.getItem("soto_active_user") ||
        window.localStorage.getItem("soto_user");
      if (rawUser) {
        const parsed = JSON.parse(rawUser) as {
          name?: string;
          email?: string;
          role?: string;
        };
        activeUser = {
          name: parsed.name || "Admin Utama",
          email: parsed.email || "admin@sotobanjar.com",
          role: normalizeRole(parsed.role, parsed.name),
        };
      }
    } catch {}

    const usernameText = `${activeUser.name} (${activeUser.email})`;
    const roleText = normalizeRole(activeUser.role, activeUser.name);

    try {
      const res = await fetch("/api/login-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: usernameText,
          role: roleText,
          action: "LOGIN",
          status: "LOGIN BERHASIL",
          device: navigator.userAgent,
        }),
      });
      if (res.ok) {
        const created = (await res.json()) as LoginLogRecord;
        setLogs((prev) => {
          const exists = prev.some(
            (p) => String(p.logCode || p.id) === String(created.logCode || created.id)
          );
          return exists ? prev : [created, ...prev];
        });
      }
    } catch {}
  };

  // Menghapus satu log di state, localStorage, dan database Prisma
  const handleDeleteLog = (targetLog: LoginLogRecord) => {
    const code = getLogIdentifier(targetLog);
    const rawId = targetLog.id !== undefined ? String(targetLog.id).trim() : code;

    if (code) markLogAsDeleted(code);
    if (rawId) markLogAsDeleted(rawId);

    const updated = logs.filter((item) => {
      const itemCode = getLogIdentifier(item);
      const itemId =
        item.id !== undefined ? String(item.id).trim() : itemCode;
      return itemCode !== code && itemId !== rawId;
    });

    setLogs(updated);

    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem("soto_login_logs", JSON.stringify(updated));
      } catch {}
    }

    const queryParam = encodeURIComponent(rawId || code);
    void fetch(
      `/api/login-history?id=${queryParam}&code=${encodeURIComponent(code)}`,
      {
        method: "DELETE",
      }
    ).catch(() => {});
  };

  // Menghapus semua riwayat login di klien dan database Prisma
  const handleClearAllLogs = () => {
    clearDeletedLogMarkers();
    setLogs([]);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem("soto_login_logs");
      } catch {}
    }
    void fetch("/api/login-history", { method: "DELETE" }).catch(() => {});
  };

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#FAF6EE",
        minHeight: "100vh",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <header
        style={{
          backgroundColor: "#FFFFFF",
          borderBottom: "1px solid #E5DEC9",
          padding: "18px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
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
            style={{ margin: "3px 0 0", fontSize: "12.5px", color: "#6D4C30" }}
          >
            Pencatatan sesi masuk customer dan pengelola admin secara otomatis
            (Tersinkronisasi dengan Prisma Database).
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="button"
            onClick={() => void handleRecordCurrentSession()}
            style={{
              padding: "9px 16px",
              borderRadius: "999px",
              border: "1.5px solid #D6C7B2",
              backgroundColor: "#FAF6EE",
              color: "#2A1A11",
              fontSize: "12px",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            + Catat Sesi Saat Ini
          </button>
          <button
            type="button"
            onClick={handleClearAllLogs}
            style={{
              padding: "9px 16px",
              borderRadius: "999px",
              border: "none",
              backgroundColor: "#DC2626",
              color: "#FFFFFF",
              fontSize: "12px",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            🗑 Bersihkan Semua Log
          </button>
        </div>
      </header>

      <div
        style={{
          padding: "32px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "18px",
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "18px",
              padding: "20px 24px",
              border: "1.5px solid #E5DEC9",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{ fontSize: "12px", fontWeight: 700, color: "#6D4C30" }}
              >
                Total Aktivitas Tercatat
              </div>
              <div
                style={{
                  fontSize: "26px",
                  fontWeight: 900,
                  color: "#2A1A11",
                  marginTop: "6px",
                }}
              >
                {stats.total}{" "}
                <span style={{ fontSize: "13px", fontWeight: 700 }}>Sesi</span>
              </div>
            </div>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                backgroundColor: "#FEF3C7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
              }}
            >
              🕒
            </div>
          </div>

          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "18px",
              padding: "20px 24px",
              border: "1.5px solid #E5DEC9",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{ fontSize: "12px", fontWeight: 700, color: "#6D4C30" }}
              >
                Login Berhasil
              </div>
              <div
                style={{
                  fontSize: "26px",
                  fontWeight: 900,
                  color: "#15803D",
                  marginTop: "6px",
                }}
              >
                {stats.success}{" "}
                <span style={{ fontSize: "13px", fontWeight: 700 }}>
                  Berhasil
                </span>
              </div>
            </div>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                backgroundColor: "#DCFCE7",
                color: "#166534",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                fontWeight: 900,
              }}
            >
              ✓
            </div>
          </div>

          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "18px",
              padding: "20px 24px",
              border: "1.5px solid #E5DEC9",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{ fontSize: "12px", fontWeight: 700, color: "#6D4C30" }}
              >
                Percobaan Gagal
              </div>
              <div
                style={{
                  fontSize: "26px",
                  fontWeight: 900,
                  color: "#D97706",
                  marginTop: "6px",
                }}
              >
                {stats.failed}{" "}
                <span style={{ fontSize: "13px", fontWeight: 700 }}>Gagal</span>
              </div>
            </div>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                backgroundColor: "#FEF3C7",
                color: "#D97706",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
              }}
            >
              ⚠️
            </div>
          </div>
        </div>

        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "20px",
            padding: "24px",
            border: "1.5px solid #E5DEC9",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                type="button"
                onClick={() => setTabFilter("ALL")}
                style={{
                  padding: "8px 16px",
                  borderRadius: "999px",
                  border:
                    tabFilter === "ALL" ? "none" : "1.5px solid #E5DEC9",
                  backgroundColor: tabFilter === "ALL" ? "#2A1A11" : "#FAF6EE",
                  color: tabFilter === "ALL" ? "#EFE3C8" : "#6D4C30",
                  fontSize: "12px",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Semua Log ({stats.total})
              </button>
              <button
                type="button"
                onClick={() => setTabFilter("SUCCESS")}
                style={{
                  padding: "8px 16px",
                  borderRadius: "999px",
                  border:
                    tabFilter === "SUCCESS" ? "none" : "1.5px solid #E5DEC9",
                  backgroundColor:
                    tabFilter === "SUCCESS" ? "#166534" : "#FAF6EE",
                  color: tabFilter === "SUCCESS" ? "#FFFFFF" : "#6D4C30",
                  fontSize: "12px",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Berhasil ({stats.success})
              </button>
              <button
                type="button"
                onClick={() => setTabFilter("FAILED")}
                style={{
                  padding: "8px 16px",
                  borderRadius: "999px",
                  border:
                    tabFilter === "FAILED" ? "none" : "1.5px solid #E5DEC9",
                  backgroundColor:
                    tabFilter === "FAILED" ? "#DC2626" : "#FAF6EE",
                  color: tabFilter === "FAILED" ? "#FFFFFF" : "#6D4C30",
                  fontSize: "12px",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Gagal ({stats.failed})
              </button>
            </div>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 Cari ID Log, nama akun, atau status..."
              style={{
                padding: "9px 16px",
                borderRadius: "999px",
                border: "1.5px solid #E5DEC9",
                backgroundColor: "#FAF6EE",
                fontSize: "12.5px",
                width: "260px",
                color: "#2A1A11",
              }}
            />
          </div>

          {loading ? (
            <div
              style={{
                padding: "40px",
                textAlign: "center",
                color: "#6D4C30",
                fontWeight: 700,
              }}
            >
              Memuat riwayat login...
            </div>
          ) : filteredLogs.length === 0 ? (
            <div
              style={{
                padding: "40px",
                textAlign: "center",
                color: "#8A6B47",
                fontWeight: 700,
              }}
            >
              Tidak ada data log aktivitas untuk filter ini.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  textAlign: "left",
                  fontSize: "12.5px",
                }}
              >
                <thead>
                  <tr
                    style={{
                      borderBottom: "2px solid #E5DEC9",
                      color: "#6D4C30",
                      fontSize: "11px",
                      fontWeight: 900,
                      textTransform: "uppercase",
                    }}
                  >
                    <th style={{ padding: "12px 10px" }}>ID Log</th>
                    <th style={{ padding: "12px 10px" }}>Waktu Masuk</th>
                    <th style={{ padding: "12px 10px" }}>Nama / Akun</th>
                    <th style={{ padding: "12px 10px" }}>Peran (Role)</th>
                    <th style={{ padding: "12px 10px" }}>Status Login</th>
                    <th style={{ padding: "12px 10px" }}>Perangkat / IP</th>
                    <th style={{ padding: "12px 10px" }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log, idx) => {
                    const code = String(log.logCode || log.id || idx);
                    const rowKey = `${code}-${log.createdAt || idx}`;
                    const roleText = normalizeRole(log.role, log.username);
                    const isAdmin = roleText === "ADMIN";
                    const failed = isFailedStatus(
                      log.status,
                      log.action,
                      code
                    );
                    const isLogout = isLogoutStatus(log.status, code);

                    const timeStr = log.createdAt
                      ? new Date(log.createdAt).toLocaleString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Baru saja";

                    return (
                      <tr
                        key={rowKey}
                        style={{
                          borderBottom: "1px solid #EFE3C8",
                          color: "#2A1A11",
                        }}
                      >
                        <td
                          style={{
                            padding: "14px 10px",
                            fontWeight: 800,
                            color: "#6D4C30",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {code}
                        </td>
                        <td
                          style={{
                            padding: "14px 10px",
                            whiteSpace: "nowrap",
                            color: "#64748B",
                          }}
                        >
                          🕒 {timeStr}
                        </td>
                        <td style={{ padding: "14px 10px", fontWeight: 900 }}>
                          {log.username}
                        </td>
                        <td style={{ padding: "14px 10px" }}>
                          <span
                            style={{
                              padding: "4px 10px",
                              borderRadius: "6px",
                              fontSize: "10.5px",
                              fontWeight: 900,
                              backgroundColor: isAdmin ? "#FEF3C7" : "#DBEAFE",
                              color: isAdmin ? "#92400E" : "#1D4ED8",
                            }}
                          >
                            {roleText}
                          </span>
                        </td>
                        <td style={{ padding: "14px 10px" }}>
                          <span
                            style={{
                              padding: "4px 10px",
                              borderRadius: "6px",
                              fontSize: "10.5px",
                              fontWeight: 900,
                              backgroundColor: failed
                                ? "#FEE2E2"
                                : isLogout
                                ? "#F1F5F9"
                                : "#DCFCE7",
                              color: failed
                                ? "#DC2626"
                                : isLogout
                                ? "#475569"
                                : "#166534",
                            }}
                          >
                            {log.status}
                          </span>
                        </td>
                        <td
                          style={{
                            padding: "14px 10px",
                            fontSize: "11.5px",
                            color: "#64748B",
                            maxWidth: "280px",
                          }}
                        >
                          {log.device}
                        </td>
                        <td style={{ padding: "14px 10px" }}>
                          <button
                            type="button"
                            onClick={() => handleDeleteLog(log)}
                            style={{
                              padding: "5px 12px",
                              borderRadius: "6px",
                              border: "1px solid #FCA5A5",
                              backgroundColor: "#FEF2F2",
                              color: "#DC2626",
                              fontSize: "11px",
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