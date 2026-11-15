"use client";

import React, { useEffect, useState, useMemo } from "react";

interface OrderItem {
  id?: number | string;
  name?: string;
  title?: string;
  price?: number;
  qty?: number;
  quantity?: number;
}

interface OrderRecord {
  id: number | string;
  orderNumber?: string;
  orderCode?: string;
  customerName?: string;
  recipientName?: string;
  name?: string;
  customerPhone?: string;
  phone?: string;
  area?: string;
  deliveryArea?: string;
  shippingService?: string;
  service?: string;
  address?: string;
  paymentMethod?: string;
  status?: string;
  totalPrice?: number;
  totalAmount?: number;
  subtotal?: number;
  grandTotal?: number;
  total?: number;
  shippingCost?: number;
  shippingFee?: number;
  createdAt?: string;
  items?: OrderItem[];
}

interface MenuItemRecord {
  id: number | string;
  name?: string;
  isAvailable?: boolean;
}

function normalizeOrderKey(ord: OrderRecord): string {
  const raw = String(ord.orderNumber || ord.orderCode || ord.id || "");
  return raw.replace(/^#/, "").trim().toUpperCase();
}

function getOrderTotal(ord: OrderRecord): number {
  const itemsSub = Array.isArray(ord.items)
    ? ord.items.reduce(
        (sum, it) =>
          sum + Number(it.price ?? 0) * Number(it.qty ?? it.quantity ?? 1),
        0
      )
    : Number(ord.subtotal ?? 0);
  const ship = Number(ord.shippingCost ?? ord.shippingFee ?? 0);
  return Number(
    ord.totalAmount ??
      ord.totalPrice ??
      ord.grandTotal ??
      ord.total ??
      itemsSub + ship
  );
}

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [menuCount, setMenuCount] = useState<number>(23);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isCancelled = false;

    async function loadDashboardData() {
      try {
        let dbOrders: OrderRecord[] = [];
        try {
          const res = await fetch("/api/orders", { cache: "no-store" });
          if (res.ok) {
            const data: unknown = await res.json();
            if (Array.isArray(data)) {
              dbOrders = data as OrderRecord[];
            }
          }
        } catch {
          // Lanjut ke lokal
        }

        let localOrders: OrderRecord[] = [];
        if (typeof window !== "undefined") {
          try {
            const rawLocal = window.localStorage.getItem(
              "soto_complete_orders"
            );
            if (rawLocal) {
              const parsed: unknown = JSON.parse(rawLocal);
              if (Array.isArray(parsed)) {
                localOrders = parsed as OrderRecord[];
              }
            }
          } catch {
            // Abaikan
          }
        }

        // Ambil jumlah menu aktif
        try {
          const menuRes = await fetch("/api/menu", { cache: "no-store" });
          if (menuRes.ok) {
            const menuData: unknown = await menuRes.json();
            if (Array.isArray(menuData)) {
              const activeMenus = (menuData as MenuItemRecord[]).filter(
                (m) => m.isAvailable !== false
              );
              if (activeMenus.length > 0) {
                setMenuCount(activeMenus.length);
              }
            }
          }
        } catch {
          // Abaikan
        }

        const mergedMap = new Map<string, OrderRecord>();

        for (const dbOrd of dbOrders) {
          const key = normalizeOrderKey(dbOrd);
          if (key) mergedMap.set(key, dbOrd);
        }

        for (const locOrd of localOrders) {
          const key = normalizeOrderKey(locOrd);
          if (key && !mergedMap.has(key)) {
            mergedMap.set(key, {
              ...locOrd,
              id: key,
              orderNumber: `#${key}`,
            });
          }
        }

        const combined = Array.from(mergedMap.values()).sort((a, b) => {
          const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return tB - tA;
        });

        if (!isCancelled) {
          setOrders(combined);
        }
      } catch (err) {
        console.error("Gagal memuat dashboard:", err);
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    void loadDashboardData();

    const handleSync = () => {
      void loadDashboardData();
    };
    window.addEventListener("ordersUpdated", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      isCancelled = true;
      window.removeEventListener("ordersUpdated", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  const stats = useMemo(() => {
    let totalOmset = 0;
    let pendingCount = 0;
    let shippingCount = 0;
    let completedCount = 0;

    const validOrders = orders.filter((o) => {
      const st = String(o.status || "PENDING").toUpperCase();
      return st !== "DIBATALKAN" && st !== "CANCELLED";
    });

    for (const ord of validOrders) {
      const st = String(ord.status || "PENDING").toUpperCase();
      totalOmset += getOrderTotal(ord);

      if (st === "PENDING" || st === "PROSES" || st === "DIPROSES") {
        pendingCount += 1;
      } else if (st === "DIANTAR" || st === "DIKIRIM") {
        shippingCount += 1;
      } else if (
        st === "SELESAI" ||
        st === "COMPLETED" ||
        st === "TERKIRIM"
      ) {
        completedCount += 1;
      } else {
        pendingCount += 1;
      }
    }

    return {
      totalRevenue: totalOmset,
      totalOrders: validOrders.length,
      perluDimasak: pendingCount + shippingCount,
      completedOrders: completedCount,
    };
  }, [orders]);

  // Data Grafik Pemasukan per Tanggal
  const chartData = useMemo(() => {
    const map = new Map<string, number>();
    const validOrders = orders.filter((o) => {
      const st = String(o.status || "PENDING").toUpperCase();
      return st !== "DIBATALKAN" && st !== "CANCELLED";
    });

    // Urutkan dari yang terlama ke terbaru untuk grafik
    const chronological = [...validOrders].reverse();

    for (const ord of chronological) {
      const dateKey = ord.createdAt
        ? new Date(ord.createdAt).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
          })
        : "Hari Ini";
      const current = map.get(dateKey) || 0;
      map.set(dateKey, current + getOrderTotal(ord));
    }

    const result = Array.from(map.entries()).map(([date, amount]) => ({
      date,
      amount,
    }));
    if (result.length === 0) {
      return [{ date: "Hari Ini", amount: 0 }];
    }
    return result;
  }, [orders]);

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
            Panel Operasional Toko
          </h1>
          <p
            style={{ margin: "3px 0 0", fontSize: "12.5px", color: "#6D4C30" }}
          >
            Kelola menu sajian, pantau omset harian, dan konfirmasi ulasan
            customer.
          </p>
        </div>

        <div
          style={{
            backgroundColor: "#DCFCE7",
            color: "#166534",
            padding: "6px 14px",
            borderRadius: "999px",
            fontSize: "12px",
            fontWeight: 800,
            border: "1px solid #86EFAC",
          }}
        >
          ● Admin Utama Online
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
        {/* BANNER SELAMAT DATANG */}
        <div
          style={{
            backgroundColor: "#2A1A11",
            borderRadius: "20px",
            padding: "24px 28px",
            color: "#FAF6EE",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "0 10px 30px rgba(42,26,17,0.15)",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <h2
              style={{
                margin: "0 0 6px",
                fontSize: "20px",
                fontWeight: 900,
                color: "#EFE3C8",
              }}
            >
              Selamat Datang, Admin Dapur!
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: "13px",
                color: "#D5C5B3",
                lineHeight: 1.5,
              }}
            >
              Dapur Soto Banjar Selera Nusantara siap melayani pesanan delivery
              online wilayah Jabodetabek.
            </p>
          </div>

          <a
            href="/admin/orders"
            style={{
              backgroundColor: "#EFE3C8",
              color: "#2A1A11",
              padding: "11px 20px",
              borderRadius: "12px",
              fontSize: "13px",
              fontWeight: 900,
              textDecoration: "none",
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>🔍 Cek Pesanan Masuk</span>
          </a>
        </div>

        {/* 3 KARTU STATISTIK UTAMA */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "20px",
              padding: "24px",
              border: "1.5px solid #E5DEC9",
              boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                fontWeight: 800,
                color: "#6D4C30",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Total Menu Aktif
            </div>
            <div
              style={{
                fontSize: "32px",
                fontWeight: 900,
                color: "#2A1A11",
                marginTop: "10px",
              }}
            >
              {menuCount}
            </div>
          </div>

          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "20px",
              padding: "24px",
              border: "1.5px solid #E5DEC9",
              boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                fontWeight: 800,
                color: "#6D4C30",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Total Pesanan Online
            </div>
            <div
              style={{
                fontSize: "32px",
                fontWeight: 900,
                color: "#2A1A11",
                marginTop: "10px",
              }}
            >
              {stats.totalOrders}
            </div>
          </div>

          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "20px",
              padding: "24px",
              border: "1.5px solid #E5DEC9",
              boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                fontWeight: 800,
                color: "#166534",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Total Omset Delivery
            </div>
            <div
              style={{
                fontSize: "32px",
                fontWeight: 900,
                color: "#15803D",
                marginTop: "10px",
              }}
            >
              Rp {stats.totalRevenue.toLocaleString("id-ID")}
            </div>
          </div>
        </div>

        {/* GRAFIK & STATUS ALUR PESANAN */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.8fr 1fr",
            gap: "20px",
            alignItems: "start",
          }}
        >
          {/* Kotak Grafik Pemasukan */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "20px",
              padding: "24px",
              border: "1.5px solid #E5DEC9",
              boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "15px",
                  fontWeight: 900,
                  color: "#2A1A11",
                }}
              >
                📈 Grafik Pemasukan (Tren Harian)
              </h3>
              <span
                style={{
                  backgroundColor: "#FEF3C7",
                  color: "#92400E",
                  padding: "3px 10px",
                  borderRadius: "8px",
                  fontSize: "11px",
                  fontWeight: 800,
                }}
              >
                Real-time Database
              </span>
            </div>

            {loading ? (
              <div
                style={{
                  padding: "60px",
                  textAlign: "center",
                  color: "#6D4C30",
                  fontWeight: 700,
                }}
              >
                Memuat grafik...
              </div>
            ) : (
              <div style={{ height: "180px", display: "flex", alignItems: "flex-end", gap: "16px", padding: "10px 0 0 10px", borderBottom: "2px solid #E5DEC9" }}>
                {chartData.map((item, idx) => {
                  const maxAmt = Math.max(...chartData.map((d) => d.amount), 50000);
                  const heightPercent = Math.max(15, Math.round((item.amount / maxAmt) * 100));

                  return (
                    <div
                      key={idx}
                      style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "6px",
                        height: "100%",
                        justifyContent: "flex-end",
                      }}
                    >
                      <span style={{ fontSize: "10px", fontWeight: 800, color: "#15803D" }}>
                        {item.amount > 0 ? `Rp ${(item.amount / 1000).toFixed(0)}k` : ""}
                      </span>
                      <div
                        style={{
                          width: "100%",
                          maxWidth: "48px",
                          height: `${heightPercent}%`,
                          backgroundColor: "#166534",
                          borderRadius: "8px 8px 0 0",
                          transition: "height 0.4s ease",
                        }}
                      />
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "#6D4C30" }}>
                        {item.date}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Kotak Status Alur Pesanan */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "20px",
              padding: "24px",
              border: "1.5px solid #E5DEC9",
              boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: "15px",
                fontWeight: 900,
                color: "#2A1A11",
              }}
            >
              📦 Status Alur Pesanan
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div
                style={{
                  backgroundColor: "#FFFBEB",
                  border: "1.5px solid #FDE68A",
                  borderRadius: "14px",
                  padding: "16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 900, color: "#92400E" }}>
                    Perlu Dimasak &amp; Diantar
                  </div>
                  <div style={{ fontSize: "11px", color: "#B45309", marginTop: "2px" }}>
                    Status Pending / Proses / Kurir
                  </div>
                </div>
                <div style={{ fontSize: "22px", fontWeight: 900, color: "#D97706" }}>
                  {stats.perluDimasak}
                </div>
              </div>

              <div
                style={{
                  backgroundColor: "#DCFCE7",
                  border: "1.5px solid #86EFAC",
                  borderRadius: "14px",
                  padding: "16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 900, color: "#166534" }}>
                    Selesai Terkirim
                  </div>
                  <div style={{ fontSize: "11px", color: "#15803D", marginTop: "2px" }}>
                    Pesanan telah sampai tujuan
                  </div>
                </div>
                <div style={{ fontSize: "22px", fontWeight: 900, color: "#15803D" }}>
                  {stats.completedOrders}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}