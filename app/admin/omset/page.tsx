"use client";

import React, { useEffect, useMemo, useState } from "react";

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
  area?: string;
  deliveryArea?: string;
  service?: string;
  shippingService?: string;
  useThermalBag?: boolean;
  thermalBagCost?: number;
  serviceFee?: number;
  discount?: number;
  subtotal?: number;
  shippingCost?: number;
  shippingFee?: number;
  totalAmount?: number;
  totalPrice?: number;
  grandTotal?: number;
  total?: number;
  paymentMethod?: string;
  status?: string;
  createdAt?: string;
  items?: OrderItem[];
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
  const thermal =
    ord.useThermalBag || Number(ord.serviceFee ?? ord.thermalBagCost ?? 0) > 0
      ? Number(ord.thermalBagCost ?? ord.serviceFee ?? 5000)
      : 0;
  const disc = Number(ord.discount ?? 0);

  return Number(
    ord.totalAmount ??
      ord.totalPrice ??
      ord.grandTotal ??
      ord.total ??
      Math.max(0, itemsSub + ship + thermal - disc)
  );
}

function getItemsSubtotal(ord: OrderRecord): number {
  if (Array.isArray(ord.items) && ord.items.length > 0) {
    return ord.items.reduce(
      (sum, it) =>
        sum + Number(it.price ?? 0) * Number(it.qty ?? it.quantity ?? 1),
      0
    );
  }
  return Number(ord.subtotal ?? getOrderTotal(ord));
}

export default function AdminOmsetPage() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  useEffect(() => {
    let isCancelled = false;

    async function loadOrdersForOmset() {
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
          }
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
        console.error("Gagal memuat data omset:", err);
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    void loadOrdersForOmset();

    const handleSync = () => {
      void loadOrdersForOmset();
    };
    window.addEventListener("ordersUpdated", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      isCancelled = true;
      window.removeEventListener("ordersUpdated", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  const validOrders = useMemo(
    () =>
      orders.filter((o) => {
        const st = String(o.status || "PENDING").toUpperCase();
        return st !== "DIBATALKAN" && st !== "CANCELLED";
      }),
    [orders]
  );

  const summary = useMemo(() => {
    let totalGross = 0;
    let completedRevenue = 0;
    let pendingRevenue = 0;
    let totalMenuSales = 0;
    let totalShipping = 0;
    let completedCount = 0;
    let activeCount = 0;

    for (const ord of validOrders) {
      const grand = getOrderTotal(ord);
      const menuSub = getItemsSubtotal(ord);
      const ship = Number(ord.shippingCost ?? ord.shippingFee ?? 0);
      const st = String(ord.status || "PENDING").toUpperCase();

      totalGross += grand;
      totalMenuSales += menuSub;
      totalShipping += ship;

      if (st === "SELESAI" || st === "COMPLETED" || st === "TERKIRIM") {
        completedRevenue += grand;
        completedCount += 1;
      } else {
        pendingRevenue += grand;
        activeCount += 1;
      }
    }

    return {
      totalGross,
      completedRevenue,
      pendingRevenue,
      totalMenuSales,
      totalShipping,
      totalCount: validOrders.length,
      completedCount,
      activeCount,
    };
  }, [validOrders]);

  const displayedOrders = useMemo(() => {
    if (statusFilter === "ALL") return validOrders;
    return validOrders.filter((ord) => {
      const st = String(ord.status || "PENDING").toUpperCase();
      if (statusFilter === "SELESAI") {
        return st === "SELESAI" || st === "COMPLETED" || st === "TERKIRIM";
      }
      if (statusFilter === "PROSES") {
        return (
          st === "PENDING" ||
          st === "PROSES" ||
          st === "DIPROSES" ||
          st === "DIANTAR" ||
          st === "DIKIRIM"
        );
      }
      return true;
    });
  }, [validOrders, statusFilter]);

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
            Rincian Omset &amp; Pendapatan
          </h1>
          <p
            style={{ margin: "3px 0 0", fontSize: "12.5px", color: "#6D4C30" }}
          >
            Laporan pendapatan real-time dari seluruh pesanan masuk Soto Banjar
            Selera Nusantara.
          </p>
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
        {/* RINGKASAN OMSET */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
          }}
        >
          <div
            style={{
              backgroundColor: "#2A1A11",
              color: "#FAF6EE",
              borderRadius: "18px",
              padding: "20px",
              boxShadow: "0 8px 20px rgba(42,26,17,0.12)",
            }}
          >
            <div
              style={{
                fontSize: "11.5px",
                fontWeight: 800,
                color: "#D6C7B2",
                textTransform: "uppercase",
              }}
            >
              Total Omset Keseluruhan
            </div>
            <div
              style={{
                fontSize: "24px",
                fontWeight: 900,
                color: "#FDE68A",
                marginTop: "6px",
              }}
            >
              Rp {summary.totalGross.toLocaleString("id-ID")}
            </div>
            <div
              style={{ fontSize: "11.5px", color: "#E5DEC9", marginTop: "6px" }}
            >
              Dari <strong>{summary.totalCount}</strong> total transaksi masuk
            </div>
          </div>

          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "18px",
              padding: "20px",
              border: "1.5px solid #BBF7D0",
            }}
          >
            <div
              style={{
                fontSize: "11.5px",
                fontWeight: 800,
                color: "#166534",
                textTransform: "uppercase",
              }}
            >
              Omset Pesanan Selesai
            </div>
            <div
              style={{
                fontSize: "24px",
                fontWeight: 900,
                color: "#15803D",
                marginTop: "6px",
              }}
            >
              Rp {summary.completedRevenue.toLocaleString("id-ID")}
            </div>
            <div
              style={{ fontSize: "11.5px", color: "#64748B", marginTop: "6px" }}
            >
              <strong>{summary.completedCount}</strong> pesanan telah selesai
            </div>
          </div>

          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "18px",
              padding: "20px",
              border: "1.5px solid #FDE68A",
            }}
          >
            <div
              style={{
                fontSize: "11.5px",
                fontWeight: 800,
                color: "#B45309",
                textTransform: "uppercase",
              }}
            >
              Pesanan Berjalan (Pending/Diantar)
            </div>
            <div
              style={{
                fontSize: "24px",
                fontWeight: 900,
                color: "#D97706",
                marginTop: "6px",
              }}
            >
              Rp {summary.pendingRevenue.toLocaleString("id-ID")}
            </div>
            <div
              style={{ fontSize: "11.5px", color: "#64748B", marginTop: "6px" }}
            >
              <strong>{summary.activeCount}</strong> pesanan sedang diproses
            </div>
          </div>

          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "18px",
              padding: "20px",
              border: "1.5px solid #E5DEC9",
            }}
          >
            <div
              style={{
                fontSize: "11.5px",
                fontWeight: 800,
                color: "#6D4C30",
                textTransform: "uppercase",
              }}
            >
              Penjualan Makanan Murni
            </div>
            <div
              style={{
                fontSize: "24px",
                fontWeight: 900,
                color: "#2A1A11",
                marginTop: "6px",
              }}
            >
              Rp {summary.totalMenuSales.toLocaleString("id-ID")}
            </div>
            <div
              style={{ fontSize: "11.5px", color: "#6D4C30", marginTop: "6px" }}
            >
              Total Ongkir: Rp {summary.totalShipping.toLocaleString("id-ID")}
            </div>
          </div>
        </div>

        {/* TABEL RINCIAN TRANSAKSI OMSET */}
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
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: "16px",
                fontWeight: 900,
                color: "#2A1A11",
              }}
            >
              Rincian Pendapatan Per Transaksi
            </h3>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span
                style={{
                  fontSize: "12.5px",
                  fontWeight: 800,
                  color: "#6D4C30",
                }}
              >
                Filter Transaksi:
              </span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  padding: "8px 14px",
                  borderRadius: "10px",
                  border: "1.5px solid #D6C7B2",
                  backgroundColor: "#FAF6EE",
                  fontSize: "13px",
                  fontWeight: 800,
                  color: "#2A1A11",
                  cursor: "pointer",
                }}
              >
                <option value="ALL">Semua Transaksi Masuk</option>
                <option value="SELESAI">Hanya Pesanan Selesai</option>
                <option value="PROSES">Pesanan Berjalan (Pending/Diantar)</option>
              </select>
            </div>
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
              Memuat data omset...
            </div>
          ) : displayedOrders.length === 0 ? (
            <div
              style={{
                padding: "40px",
                textAlign: "center",
                color: "#8A6B47",
                fontWeight: 700,
              }}
            >
              Belum ada data transaksi untuk filter ini.
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
                      borderBottom: "2px solid #E5DEC9",
                      color: "#6D4C30",
                      fontSize: "12px",
                      fontWeight: 900,
                    }}
                  >
                    <th style={{ padding: "12px 10px" }}>Tanggal &amp; Waktu</th>
                    <th style={{ padding: "12px 10px" }}>ID Order</th>
                    <th style={{ padding: "12px 10px" }}>Pelanggan</th>
                    <th style={{ padding: "12px 10px" }}>Item Terjual</th>
                    <th style={{ padding: "12px 10px" }}>Metode Bayar</th>
                    <th style={{ padding: "12px 10px" }}>Subtotal Menu</th>
                    <th style={{ padding: "12px 10px" }}>Ongkir &amp; Layanan</th>
                    <th style={{ padding: "12px 10px" }}>Total Masuk</th>
                    <th style={{ padding: "12px 10px" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedOrders.map((ord) => {
                    const key = normalizeOrderKey(ord);
                    const codeText = key.startsWith("SBN-")
                      ? `#${key}`
                      : `#SBN-${key}`;
                    const custName =
                      ord.customerName ||
                      ord.recipientName ||
                      ord.name ||
                      "Pelanggan";
                    const menuSub = getItemsSubtotal(ord);
                    const shipFee = Number(
                      ord.shippingCost ?? ord.shippingFee ?? 0
                    );
                    const totalAmt = getOrderTotal(ord);
                    const st = String(ord.status || "PENDING").toUpperCase();
                    const isDone =
                      st === "SELESAI" ||
                      st === "COMPLETED" ||
                      st === "TERKIRIM";

                    const dateLabel = ord.createdAt
                      ? new Date(ord.createdAt).toLocaleString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Baru saja";

                    return (
                      <tr
                        key={codeText}
                        style={{
                          borderBottom: "1px solid #EFE3C8",
                          color: "#2A1A11",
                        }}
                      >
                        <td
                          style={{
                            padding: "14px 10px",
                            whiteSpace: "nowrap",
                            color: "#6D4C30",
                            fontWeight: 700,
                          }}
                        >
                          {dateLabel}
                        </td>
                        <td
                          style={{
                            padding: "14px 10px",
                            fontWeight: 900,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {codeText}
                        </td>
                        <td style={{ padding: "14px 10px", fontWeight: 800 }}>
                          {custName}
                        </td>
                        <td style={{ padding: "14px 10px" }}>
                          {Array.isArray(ord.items) && ord.items.length > 0 ? (
                            ord.items.map((it, idx) => (
                              <div
                                key={idx}
                                style={{ fontSize: "12px", fontWeight: 700 }}
                              >
                                {it.qty || it.quantity || 1}x{" "}
                                {it.name || it.title || "Menu"}
                              </div>
                            ))
                          ) : (
                            <span style={{ fontSize: "12px", color: "#8A6B47" }}>
                              Paket Soto Banjar
                            </span>
                          )}
                        </td>
                        <td style={{ padding: "14px 10px", fontWeight: 700 }}>
                          {ord.paymentMethod || "BCA Virtual Account"}
                        </td>
                        <td
                          style={{
                            padding: "14px 10px",
                            fontWeight: 700,
                            whiteSpace: "nowrap",
                          }}
                        >
                          Rp {menuSub.toLocaleString("id-ID")}
                        </td>
                        <td
                          style={{
                            padding: "14px 10px",
                            fontSize: "12px",
                            color: "#6D4C30",
                            whiteSpace: "nowrap",
                          }}
                        >
                          Rp {shipFee.toLocaleString("id-ID")}
                        </td>
                        <td
                          style={{
                            padding: "14px 10px",
                            fontWeight: 900,
                            color: "#166534",
                            whiteSpace: "nowrap",
                          }}
                        >
                          Rp {totalAmt.toLocaleString("id-ID")}
                        </td>
                        <td style={{ padding: "14px 10px" }}>
                          <span
                            style={{
                              padding: "4px 10px",
                              borderRadius: "999px",
                              fontSize: "11px",
                              fontWeight: 900,
                              backgroundColor: isDone ? "#DCFCE7" : "#FEF3C7",
                              color: isDone ? "#166534" : "#B45309",
                            }}
                          >
                            {st}
                          </span>
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