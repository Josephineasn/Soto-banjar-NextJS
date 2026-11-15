"use client";

import React, { useEffect, useState } from "react";

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
  accountName?: string;
  customerEmail?: string;
  customerName?: string;
  recipientName?: string;
  name?: string;
  customerPhone?: string;
  phone?: string;
  phoneNumber?: string;
  telp?: string;
  area?: string;
  deliveryArea?: string;
  service?: string;
  shippingService?: string;
  address?: string;
  addressBenchmark?: string;
  landmark?: string;
  patokan?: string;
  note?: string;
  notes?: string;
  orderNotes?: string;
  catatan?: string;
  description?: string;
  useThermalBag?: boolean;
  thermalBagCost?: number;
  serviceFee?: number;
  voucherCode?: string;
  discount?: number;
  subtotal?: number;
  shippingCost?: number;
  shippingFee?: number;
  totalAmount?: number;
  totalPrice?: number;
  grandTotal?: number;
  total?: number;
  paymentMethod?: string;
  vaNumber?: string;
  virtualAccount?: string;
  status?: string;
  createdAt?: string;
  items?: OrderItem[];
}

function normalizeOrderKey(ord: OrderRecord): string {
  const raw = String(ord.orderNumber || ord.orderCode || ord.id || "");
  return raw.replace(/^#/, "").trim().toUpperCase();
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);

  const [modalAlert, setModalAlert] = useState<{
    show: boolean;
    title: string;
    message: string;
    isSuccess: boolean;
  }>({
    show: false,
    title: "",
    message: "",
    isSuccess: true,
  });

  useEffect(() => {
    let isCancelled = false;

    async function fetchAndSyncOrders() {
      try {
        // 1. Ambil pesanan dari Database Prisma (/api/orders)
        let dbOrders: OrderRecord[] = [];
        try {
          const res = await fetch("/api/orders", { cache: "no-store" });
          if (res.ok) {
            const data: unknown = await res.json();
            if (Array.isArray(data)) {
              dbOrders = data as OrderRecord[];
            }
          }
        } catch (err) {
          console.error("Gagal mengambil dari /api/orders:", err);
        }

        // 2. Ambil pesanan baru dari localStorage ("soto_complete_orders")
        let localOrders: OrderRecord[] = [];
        if (typeof window !== "undefined") {
          try {
            const rawLocal = window.localStorage.getItem("soto_complete_orders");
            if (rawLocal) {
              const parsed: unknown = JSON.parse(rawLocal);
              if (Array.isArray(parsed)) {
                localOrders = parsed as OrderRecord[];
              }
            }
          } catch {
            // Abaikan jika JSON tidak valid
          }
        }

        // 3. Gabungkan & sinkronkan otomatis pesanan yang belum masuk ke Prisma
        const mergedMap = new Map<string, OrderRecord>();

        for (const dbOrd of dbOrders) {
          const key = normalizeOrderKey(dbOrd);
          if (key) {
            mergedMap.set(key, dbOrd);
          }
        }

        for (const locOrd of localOrders) {
          const key = normalizeOrderKey(locOrd);
          if (!key) continue;

          if (!mergedMap.has(key)) {
            const normalizedLocal: OrderRecord = {
              ...locOrd,
              id: key,
              orderNumber: `#${key}`,
            };
            mergedMap.set(key, normalizedLocal);

            // Auto-sync ke database Prisma di background agar masuk ke Prisma Studio juga
            void fetch("/api/orders", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(normalizedLocal),
            }).catch(() => {});
          }
        }

        // 4. Urutkan dari pesanan paling baru
        const combined = Array.from(mergedMap.values()).sort((a, b) => {
          const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return tB - tA;
        });

        if (!isCancelled) {
          setOrders(combined);
        }
      } catch (err) {
        console.error("Gagal memuat pesanan:", err);
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    void fetchAndSyncOrders();

    // Dengarkan perubahan dari tab lain atau saat customer checkout
    const handleSyncEvent = () => {
      void fetchAndSyncOrders();
    };
    window.addEventListener("ordersUpdated", handleSyncEvent);
    window.addEventListener("storage", handleSyncEvent);

    return () => {
      isCancelled = true;
      window.removeEventListener("ordersUpdated", handleSyncEvent);
      window.removeEventListener("storage", handleSyncEvent);
    };
  }, []);

  async function handleStatusChange(
    orderId: number | string,
    newStatus: string
  ) {
    const cleanTargetKey = String(orderId).replace(/^#/, "").trim().toUpperCase();

    try {
      // 1. Update di state Admin saat ini
      setOrders((prev) =>
        prev.map((ord) =>
          normalizeOrderKey(ord) === cleanTargetKey || ord.id === orderId
            ? { ...ord, status: newStatus }
            : ord
        )
      );

      // 2. Update juga di localStorage ("soto_complete_orders") agar Customer History langsung sinkron
      if (typeof window !== "undefined") {
        try {
          const rawLocal = window.localStorage.getItem("soto_complete_orders");
          if (rawLocal) {
            const parsed = JSON.parse(rawLocal) as OrderRecord[];
            if (Array.isArray(parsed)) {
              const updatedLocal = parsed.map((ord) =>
                normalizeOrderKey(ord) === cleanTargetKey || ord.id === orderId
                  ? { ...ord, status: newStatus }
                  : ord
              );
              window.localStorage.setItem(
                "soto_complete_orders",
                JSON.stringify(updatedLocal)
              );
            }
          }
        } catch {
          // Abaikan
        }
      }

      // 3. Update ke Database Prisma melalui API PATCH
      const encodedId = encodeURIComponent(String(orderId).replace(/^#/, ""));
      await fetch(`/api/orders/${encodedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      }).catch(() => {});

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("ordersUpdated"));
      }

      setModalAlert({
        show: true,
        title: "Berhasil!",
        message: `Status pesanan berhasil diubah menjadi "${newStatus}".`,
        isSuccess: true,
      });
    } catch {
      setModalAlert({
        show: true,
        title: "Kesalahan Jaringan!",
        message: "Terjadi kesalahan koneksi saat memperbarui status.",
        isSuccess: false,
      });
    }
  }

  function cleanOrderNote(rawNote?: string): string {
    if (!rawNote) return "-";
    const cleaned = rawNote
      .replace(/\[VA:[^\]]*\]/gi, "")
      .replace(/\[HP:[^\]]*\]/gi, "")
      .replace(/\[EMAIL:[^\]]*\]/gi, "")
      .replace(/\[USER:[^\]]*\]/gi, "")
      .trim();
    return cleaned || "-";
  }

  function extractPhone(ord: OrderRecord): string {
    const directPhone =
      ord.customerPhone || ord.phone || ord.phoneNumber || ord.telp;
    if (directPhone && directPhone !== "-") return directPhone;

    const rawNote =
      ord.orderNotes || ord.note || ord.notes || ord.catatan || "";
    const matchHp = rawNote.match(/\[HP:\s*([^\]]+)\]/i);
    if (matchHp && matchHp[1]) {
      return matchHp[1].trim();
    }
    return "-";
  }

  const filteredOrders = orders.filter((ord) => {
    const st = (ord.status || "PENDING").toUpperCase();
    if (filterStatus === "ALL") return true;
    if (filterStatus === "PENDING")
      return (
        st === "PENDING" ||
        st === "PROSES" ||
        st === "DIPROSES" ||
        st === "PERLU_DIMASAK"
      );
    if (filterStatus === "DIANTAR") return st === "DIANTAR" || st === "DIKIRIM";
    if (filterStatus === "SELESAI")
      return st === "SELESAI" || st === "COMPLETED" || st === "TERKIRIM";
    return true;
  });

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#FAF6EE",
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
            Daftar Pesanan Online Masuk
          </h1>
          <p
            style={{ margin: "3px 0 0", fontSize: "12.5px", color: "#6D4C30" }}
          >
            Pantau rincian alamat pengantaran customer dan update status
            pengiriman.
          </p>
        </div>
      </header>

      <div
        style={{
          padding: "32px",
          display: "flex",
          flexDirection: "column",
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
              Pesanan Online Delivery
            </h3>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span
                style={{
                  fontSize: "12.5px",
                  fontWeight: 800,
                  color: "#6D4C30",
                }}
              >
                Filter Status:
              </span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
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
                <option value="ALL">Semua Status</option>
                <option value="PENDING">Pending / Proses</option>
                <option value="DIANTAR">Sedang Diantar</option>
                <option value="SELESAI">Selesai</option>
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
              Memuat data pesanan...
            </div>
          ) : filteredOrders.length === 0 ? (
            <div
              style={{
                padding: "40px",
                textAlign: "center",
                color: "#8A6B47",
                fontWeight: 700,
              }}
            >
              Belum ada pesanan masuk dalam kategori ini.
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
                    <th style={{ padding: "12px 10px" }}>Waktu Masuk</th>
                    <th style={{ padding: "12px 10px" }}>ID Order</th>
                    <th style={{ padding: "12px 10px" }}>
                      Penerima &amp; Kontak
                    </th>
                    <th style={{ padding: "12px 10px" }}>Alamat Pengiriman</th>
                    <th style={{ padding: "12px 10px" }}>Rincian Menu (Qty)</th>
                    <th style={{ padding: "12px 10px" }}>Total Bayar</th>
                    <th style={{ padding: "12px 10px" }}>Pembayaran</th>
                    <th style={{ padding: "12px 10px" }}>Status</th>
                    <th style={{ padding: "12px 10px" }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((ord) => {
                    const timeStr = ord.createdAt
                      ? new Date(ord.createdAt).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        }) + " WIB"
                      : "Baru saja";

                    const rawCode = String(
                      ord.orderNumber || ord.orderCode || ord.id
                    ).replace(/^#/, "");
                    const orderIdText = rawCode.startsWith("SBN-")
                      ? `#${rawCode}`
                      : `#SBN-${rawCode}`;

                    const custName =
                      ord.customerName ||
                      ord.recipientName ||
                      ord.name ||
                      "Customer";
                    const custPhone = extractPhone(ord);
                    const areaName =
                      ord.area || ord.deliveryArea || "Jabodetabek";
                    const addressText = ord.address || "-";
                    const totalAmt = Number(
                      ord.totalAmount ??
                        ord.totalPrice ??
                        ord.subtotal ??
                        ord.grandTotal ??
                        ord.total ??
                        0
                    );
                    const payMethod =
                      ord.paymentMethod || "BCA Virtual Account";
                    const currentStatus = ord.status || "PENDING";
                    const courierName =
                      ord.shippingService || ord.service || "Standar";

                    return (
                      <tr
                        key={orderIdText}
                        style={{
                          borderBottom: "1px solid #EFE3C8",
                          color: "#2A1A11",
                          verticalAlign: "top",
                        }}
                      >
                        <td
                          style={{
                            padding: "14px 10px",
                            fontWeight: 700,
                            whiteSpace: "nowrap",
                            color: "#6D4C30",
                          }}
                        >
                          ⏱️ {timeStr}
                        </td>
                        <td
                          style={{
                            padding: "14px 10px",
                            fontWeight: 900,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {orderIdText}
                        </td>
                        <td
                          style={{ padding: "14px 10px", minWidth: "150px" }}
                        >
                          <div style={{ fontWeight: 900, color: "#2A1A11" }}>
                            {custName}
                          </div>
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#6D4C30",
                              fontWeight: 700,
                              marginTop: "3px",
                            }}
                          >
                            {custPhone}
                          </div>
                        </td>
                        <td
                          style={{
                            padding: "14px 10px",
                            minWidth: "200px",
                            maxWidth: "240px",
                          }}
                        >
                          <div
                            style={{
                              display: "inline-block",
                              backgroundColor: "#FEF3C7",
                              color: "#92400E",
                              padding: "2px 8px",
                              borderRadius: "6px",
                              fontSize: "11px",
                              fontWeight: 800,
                              marginBottom: "4px",
                            }}
                          >
                            {areaName}
                          </div>
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#2A1A11",
                              lineHeight: "1.4",
                              fontWeight: 600,
                            }}
                          >
                            {addressText}
                          </div>
                        </td>
                        <td
                          style={{ padding: "14px 10px", minWidth: "180px" }}
                        >
                          {ord.items && ord.items.length > 0 ? (
                            ord.items.map((it, i) => (
                              <div
                                key={i}
                                style={{
                                  marginBottom: "4px",
                                  fontSize: "12px",
                                }}
                              >
                                <span
                                  style={{
                                    backgroundColor: "#E5DEC9",
                                    padding: "1px 6px",
                                    borderRadius: "4px",
                                    fontWeight: 800,
                                    marginRight: "6px",
                                  }}
                                >
                                  {it.qty || it.quantity || 1}x
                                </span>
                                <span style={{ fontWeight: 700 }}>
                                  {it.name || it.title || "Menu"}
                                </span>
                              </div>
                            ))
                          ) : (
                            <span
                              style={{ fontSize: "12px", color: "#8A6B47" }}
                            >
                              Pesanan Dapur
                            </span>
                          )}
                        </td>
                        <td
                          style={{ padding: "14px 10px", whiteSpace: "nowrap" }}
                        >
                          <div style={{ fontWeight: 900, color: "#166534" }}>
                            Rp {totalAmt.toLocaleString("id-ID")}
                          </div>
                          <div
                            style={{
                              fontSize: "11px",
                              color: "#6D4C30",
                              marginTop: "2px",
                            }}
                          >
                            Kurir: {courierName}
                          </div>
                        </td>
                        <td
                          style={{ padding: "14px 10px", whiteSpace: "nowrap" }}
                        >
                          <span
                            style={{
                              backgroundColor: "#FAF6EE",
                              border: "1px solid #D6C7B2",
                              padding: "4px 8px",
                              borderRadius: "8px",
                              fontSize: "11.5px",
                              fontWeight: 800,
                              color: "#432818",
                            }}
                          >
                            {payMethod}
                          </span>
                        </td>
                        <td
                          style={{ padding: "14px 10px", whiteSpace: "nowrap" }}
                        >
                          <select
                            value={currentStatus}
                            onChange={(e) =>
                              void handleStatusChange(
                                ord.orderNumber || ord.id,
                                e.target.value
                              )
                            }
                            style={{
                              padding: "6px 10px",
                              borderRadius: "8px",
                              border: "1.5px solid #D6C7B2",
                              backgroundColor:
                                currentStatus
                                  .toUpperCase()
                                  .includes("SELESAI") ||
                                currentStatus
                                  .toUpperCase()
                                  .includes("TERKIRIM")
                                  ? "#DCFCE7"
                                  : currentStatus
                                      .toUpperCase()
                                      .includes("DIANTAR") ||
                                    currentStatus
                                      .toUpperCase()
                                      .includes("DIKIRIM")
                                  ? "#FEF3C7"
                                  : "#FEE2E2",
                              color:
                                currentStatus
                                  .toUpperCase()
                                  .includes("SELESAI") ||
                                currentStatus
                                  .toUpperCase()
                                  .includes("TERKIRIM")
                                  ? "#166534"
                                  : currentStatus
                                      .toUpperCase()
                                      .includes("DIANTAR") ||
                                    currentStatus
                                      .toUpperCase()
                                      .includes("DIKIRIM")
                                  ? "#92400E"
                                  : "#DC2626",
                              fontSize: "12px",
                              fontWeight: 900,
                              cursor: "pointer",
                            }}
                          >
                            <option value="PENDING">Pending</option>
                            <option value="PROSES">Diproses / Dimasak</option>
                            <option value="DIANTAR">Sedang Diantar</option>
                            <option value="SELESAI">Selesai</option>
                          </select>
                        </td>
                        <td
                          style={{ padding: "14px 10px", whiteSpace: "nowrap" }}
                        >
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(ord)}
                            style={{
                              backgroundColor: "#2A1A11",
                              color: "#EFE3C8",
                              border: "none",
                              padding: "7px 16px",
                              borderRadius: "8px",
                              fontSize: "12px",
                              fontWeight: 900,
                              cursor: "pointer",
                            }}
                          >
                            Detail
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

      {/* MODAL DETAIL PESANAN */}
      {selectedOrder &&
        (() => {
          const subtotalCalc = selectedOrder.items
            ? selectedOrder.items.reduce(
                (sum, it) =>
                  sum + (it.price || 0) * (it.qty || it.quantity || 1),
                0
              )
            : Number(selectedOrder.subtotal ?? 0);

          const shippingFee = Number(
            selectedOrder.shippingCost ?? selectedOrder.shippingFee ?? 0
          );
          const hasThermal =
            selectedOrder.useThermalBag ||
            Number(selectedOrder.serviceFee ?? selectedOrder.thermalBagCost ?? 0) > 0;
          const thermalCost = hasThermal
            ? Number(
                selectedOrder.thermalBagCost ?? selectedOrder.serviceFee ?? 5000
              )
            : 0;
          const discountAmt = Number(selectedOrder.discount ?? 0);
          const finalTotal = Number(
            selectedOrder.totalAmount ??
              selectedOrder.totalPrice ??
              selectedOrder.grandTotal ??
              selectedOrder.total ??
              subtotalCalc + shippingFee + thermalCost - discountAmt
          );

          const rawSelectedId = String(
            selectedOrder.orderNumber || selectedOrder.id
          ).replace(/^#/, "");
          const displaySelectedId = rawSelectedId.startsWith("SBN-")
            ? `#${rawSelectedId}`
            : `#SBN-${rawSelectedId}`;

          return (
            <div
              style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(0,0,0,0.65)",
                zIndex: 1000,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px",
              }}
            >
              <div
                style={{
                  width: "100%",
                  maxWidth: "520px",
                  backgroundColor: "#FFFFFF",
                  borderRadius: "26px",
                  padding: "28px 26px",
                  boxShadow: "0 25px 60px rgba(0,0,0,0.35)",
                  border: "1px solid #E5DEC9",
                  maxHeight: "90vh",
                  overflowY: "auto",
                  position: "relative",
                }}
              >
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  style={{
                    position: "absolute",
                    top: "22px",
                    right: "24px",
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    border: "1px solid #D6C7B2",
                    backgroundColor: "#FAF6EE",
                    fontSize: "15px",
                    fontWeight: 900,
                    cursor: "pointer",
                    color: "#2A1A11",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  ✕
                </button>

                <h2
                  style={{
                    margin: "0 0 2px",
                    fontSize: "20px",
                    fontWeight: 900,
                    color: "#1E293B",
                  }}
                >
                  Rincian Detail Pesanan
                </h2>
                <p
                  style={{
                    margin: "0 0 16px",
                    fontSize: "13px",
                    color: "#64748B",
                    fontWeight: 700,
                  }}
                >
                  ID:{" "}
                  <strong style={{ color: "#0F172A" }}>
                    {displaySelectedId}
                  </strong>
                </p>

                {/* Informasi Penerima */}
                <div
                  style={{
                    backgroundColor: "#FCFBF7",
                    border: "1.5px solid #E5DEC9",
                    borderRadius: "16px",
                    padding: "16px",
                    marginBottom: "14px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "11.5px",
                      fontWeight: 900,
                      color: "#78350F",
                      textTransform: "uppercase",
                      marginBottom: "8px",
                      letterSpacing: "0.5px",
                    }}
                  >
                    👤 INFORMASI PENERIMA
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                      fontSize: "13px",
                      color: "#1E293B",
                    }}
                  >
                    <div>
                      <strong>Nama:</strong>{" "}
                      {selectedOrder.customerName ||
                        selectedOrder.recipientName ||
                        selectedOrder.name ||
                        "-"}
                    </div>
                    <div>
                      <strong>No. Telp / WA:</strong>{" "}
                      <span style={{ color: "#1E293B", fontWeight: 400 }}>
                        {extractPhone(selectedOrder)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Lokasi & Pengiriman */}
                <div
                  style={{
                    backgroundColor: "#FCFBF7",
                    border: "1.5px solid #E5DEC9",
                    borderRadius: "16px",
                    padding: "16px",
                    marginBottom: "14px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "11.5px",
                      fontWeight: 900,
                      color: "#78350F",
                      textTransform: "uppercase",
                      marginBottom: "8px",
                      letterSpacing: "0.5px",
                    }}
                  >
                    🛵 LOKASI &amp; PENGIRIMAN
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                      fontSize: "13px",
                      color: "#1E293B",
                    }}
                  >
                    <div>
                      <strong>Area:</strong>{" "}
                      {selectedOrder.area || selectedOrder.deliveryArea || "-"}
                    </div>
                    <div>
                      <strong>Alamat Lengkap:</strong>{" "}
                      {selectedOrder.address || "-"}
                    </div>
                    <div>
                      <strong>Patokan Lokasi:</strong>{" "}
                      {selectedOrder.landmark ||
                        selectedOrder.patokan ||
                        selectedOrder.addressBenchmark ||
                        "-"}
                    </div>
                    <div>
                      <strong>Catatan Customer:</strong>{" "}
                      <span style={{ color: "#1E293B", fontWeight: 400 }}>
                        {cleanOrderNote(
                          selectedOrder.orderNotes ||
                            selectedOrder.note ||
                            selectedOrder.notes ||
                            selectedOrder.catatan
                        )}
                      </span>
                    </div>
                    <div>
                      <strong>Layanan Kurir:</strong>{" "}
                      {selectedOrder.shippingService ||
                        selectedOrder.service ||
                        "Standar"}
                    </div>
                  </div>
                </div>

                {/* Daftar Menu Dipesan */}
                <div
                  style={{
                    backgroundColor: "#FCFBF7",
                    border: "1.5px solid #E5DEC9",
                    borderRadius: "16px",
                    padding: "16px",
                    marginBottom: "14px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "11.5px",
                      fontWeight: 900,
                      color: "#78350F",
                      textTransform: "uppercase",
                      marginBottom: "10px",
                      letterSpacing: "0.5px",
                    }}
                  >
                    🍲 DAFTAR MENU DIPESAN
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      fontSize: "13px",
                      color: "#1E293B",
                    }}
                  >
                    {selectedOrder.items && selectedOrder.items.length > 0 ? (
                      selectedOrder.items.map((it, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            borderBottom: "1px dashed #E5DEC9",
                            paddingBottom: "6px",
                          }}
                        >
                          <span>
                            <strong
                              style={{
                                backgroundColor: "#E5DEC9",
                                padding: "1px 6px",
                                borderRadius: "4px",
                                marginRight: "6px",
                              }}
                            >
                              {it.qty || it.quantity || 1}x
                            </strong>
                            {it.name || it.title || "Menu"}
                          </span>
                          <span style={{ fontWeight: 800, color: "#166534" }}>
                            Rp{" "}
                            {(
                              (it.price || 0) * (it.qty || it.quantity || 1)
                            ).toLocaleString("id-ID")}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div>Tidak ada rincian item menu tercatat.</div>
                    )}
                  </div>
                </div>

                {/* Pembayaran & Rincian Tagihan */}
                <div
                  style={{
                    backgroundColor: "#FCFBF7",
                    border: "1.5px solid #E5DEC9",
                    borderRadius: "16px",
                    padding: "16px",
                    marginBottom: "20px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "11.5px",
                      fontWeight: 900,
                      color: "#78350F",
                      textTransform: "uppercase",
                      marginBottom: "8px",
                      letterSpacing: "0.5px",
                    }}
                  >
                    💳 PEMBAYARAN &amp; RINCIAN TAGIHAN
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                      fontSize: "13px",
                      color: "#1E293B",
                    }}
                  >
                    <div>
                      <strong>Metode Pembayaran:</strong>{" "}
                      {selectedOrder.paymentMethod || "-"}
                    </div>
                    <div>
                      <strong>Status Pesanan:</strong>{" "}
                      <span style={{ fontWeight: 800, color: "#166534" }}>
                        {selectedOrder.status || "PENDING"}
                      </span>
                    </div>

                    <div
                      style={{
                        borderTop: "1px dashed #D6C7B2",
                        marginTop: "6px",
                        paddingTop: "8px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "5px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          color: "#64748B",
                        }}
                      >
                        <span>Subtotal Makanan:</span>
                        <strong style={{ color: "#1E293B" }}>
                          Rp {subtotalCalc.toLocaleString("id-ID")}
                        </strong>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          color: "#64748B",
                        }}
                      >
                        <span>
                          Ongkos Kirim (
                          {selectedOrder.area ||
                            selectedOrder.deliveryArea ||
                            "Standard"}
                          ):
                        </span>
                        <strong style={{ color: "#1E293B" }}>
                          Rp {shippingFee.toLocaleString("id-ID")}
                        </strong>
                      </div>
                      {hasThermal && (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            color: "#64748B",
                          }}
                        >
                          <span>Add-on Thermal Bag:</span>
                          <strong style={{ color: "#1E293B" }}>
                            Rp {thermalCost.toLocaleString("id-ID")}
                          </strong>
                        </div>
                      )}
                      {discountAmt > 0 && (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            color: "#15803D",
                          }}
                        >
                          <span>
                            Diskon Voucher (
                            {selectedOrder.voucherCode || "PROMO"}):
                          </span>
                          <strong>
                            -Rp {discountAmt.toLocaleString("id-ID")}
                          </strong>
                        </div>
                      )}
                    </div>

                    <div
                      style={{
                        borderTop: "1.5px solid #D6C7B2",
                        paddingTop: "10px",
                        marginTop: "4px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: "16px",
                        fontWeight: 900,
                        color: "#163A24",
                      }}
                    >
                      <span>Total Pembayaran:</span>
                      <span style={{ fontSize: "18px" }}>
                        Rp {finalTotal.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  style={{
                    width: "100%",
                    padding: "14px",
                    borderRadius: "14px",
                    border: "none",
                    backgroundColor: "#2A1A11",
                    color: "#EFE3C8",
                    fontSize: "14px",
                    fontWeight: 900,
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  }}
                >
                  Tutup Rincian
                </button>
              </div>
            </div>
          );
        })()}

      {/* MODAL ALERT BOX */}
      {modalAlert.show && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "360px",
              backgroundColor: "#FFFFFF",
              borderRadius: "20px",
              padding: "24px",
              textAlign: "center",
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
              border: "1.5px solid #E5DEC9",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                backgroundColor: modalAlert.isSuccess ? "#DCFCE7" : "#FEE2E2",
                color: modalAlert.isSuccess ? "#166534" : "#DC2626",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 12px",
                fontSize: "22px",
                fontWeight: 900,
              }}
            >
              {modalAlert.isSuccess ? "✓" : "!"}
            </div>
            <h3
              style={{
                margin: "0 0 6px",
                fontSize: "18px",
                fontWeight: 900,
                color: "#2A1A11",
              }}
            >
              {modalAlert.title}
            </h3>
            <p
              style={{
                margin: "0 0 20px",
                fontSize: "13px",
                color: "#6D4C30",
                lineHeight: 1.5,
              }}
            >
              {modalAlert.message}
            </p>
            <button
              type="button"
              onClick={() => setModalAlert({ ...modalAlert, show: false })}
              style={{
                width: "100%",
                padding: "11px",
                borderRadius: "10px",
                border: "none",
                backgroundColor: "#2A1A11",
                color: "#EFE3C8",
                fontSize: "13px",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              OK, Mengerti
            </button>
          </div>
        </div>
      )}
    </div>
  );
}