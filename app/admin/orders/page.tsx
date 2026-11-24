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
  accountName?: string;
  customerName?: string;
  recipientName?: string;
  name?: string;
  customerPhone?: string;
  phone?: string;
  customerEmail?: string;
  area?: string;
  deliveryArea?: string;
  service?: string;
  shippingService?: string;
  address?: string;
  addressBenchmark?: string;
  landmark?: string;
  patokan?: string;
  paymentMethod?: string;
  vaNumber?: string;
  virtualAccount?: string;
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
  note?: string;
  notes?: string;
  orderNotes?: string;
  status?: string;
  createdAt?: string;
  items?: OrderItem[];
}

interface AlertBoxState {
  visible: boolean;
  title: string;
  message: string;
  type: "success" | "error" | "info";
}

// Menyeragamkan ID order tanpa tanda pagar di awal
function normalizeOrderKey(ord: OrderRecord): string {
  const raw = String(ord.orderNumber || ord.orderCode || ord.id || "");
  return raw.replace(/^#/, "").trim().toUpperCase();
}

// Menghitung total bayar pesanan termasuk ongkir, thermal bag, dan diskon
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

// Mengamankan nilai teks kolom CSV dengan kutip ganda
function escapeOrderListCsvCell(value: unknown): string {
  const str = String(value ?? "");
  return `"${str.replace(/"/g, '""')}"`;
}

// Menggabungkan daftar menu dalam satu pesanan menjadi teks ringkas untuk CSV
function formatOrderItemsForCsv(ord: OrderRecord): string {
  if (!Array.isArray(ord.items) || ord.items.length === 0) {
    return "Paket Soto Banjar";
  }
  return ord.items
    .map(
      (it) =>
        `${it.qty ?? it.quantity ?? 1}x ${it.name || it.title || "Menu"}`
    )
    .join("; ");
}

// Mengekspor daftar pesanan ke file CSV
function exportOrdersListCsv(orderList: OrderRecord[]) {
  if (!orderList.length) {
    alert("Belum ada data pesanan untuk di-export.");
    return;
  }

  const headers = [
    "No",
    "Waktu Masuk",
    "ID Order",
    "Penerima",
    "No HP",
    "Wilayah",
    "Alamat Pengiriman",
    "Rincian Menu",
    "Kurir",
    "Pembayaran",
    "Total Bayar (Rp)",
    "Status",
  ];

  const rows = orderList.map((ord, idx) => {
    const key = normalizeOrderKey(ord);
    const codeText = key.startsWith("SBN-") ? `#${key}` : `#SBN-${key}`;
    const custName =
      ord.customerName || ord.recipientName || ord.name || "Pelanggan";
    const phoneText = ord.customerPhone || ord.phone || "-";
    const areaText = ord.area || ord.deliveryArea || "Jabodetabek";
    const courierText = ord.shippingService || ord.service || "Kurir Instant";
    const totalAmt = getOrderTotal(ord);
    const rawStatus = String(ord.status || "PENDING").toUpperCase();
    const timeStr = ord.createdAt
      ? new Date(ord.createdAt).toLocaleString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }) + " WIB"
      : "Baru saja";

    return [
      idx + 1,
      timeStr,
      codeText,
      custName,
      phoneText,
      areaText,
      ord.address || "-",
      formatOrderItemsForCsv(ord),
      courierText,
      ord.paymentMethod || "BCA Virtual Account",
      totalAmt,
      rawStatus,
    ]
      .map(escapeOrderListCsvCell)
      .join(",");
  });

  const csvContent =
    "\uFEFF" +
    [headers.map(escapeOrderListCsvCell).join(","), ...rows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  const dateStamp = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.setAttribute("download", `daftar-pesanan-soto-banjar-${dateStamp}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function printOrdersPage() {
  window.print();
}

export default function AdminOrdersPage() {
  // State daftar pesanan, loading, filter status, detail pesanan terpilih, dan alert notifikasi
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [alertBox, setAlertBox] = useState<AlertBoxState>({
    visible: false,
    title: "",
    message: "",
    type: "success",
  });

  // Menampilkan alert notifikasi kustom saat status pesanan berhasil/gagal diubah
  const showCustomAlert = (
    title: string,
    message: string,
    type: "success" | "error" | "info" = "success"
  ) => {
    setAlertBox({ visible: true, title, message, type });
  };

  // Menutup alert notifikasi
  const closeCustomAlert = () => {
    setAlertBox((prev) => ({ ...prev, visible: false }));
  };

  // Memuat pesanan dari API database
  useEffect(() => {
    let isCancelled = false;

    async function loadAndSyncOrders() {
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
        } catch {}

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
          } catch {}
        }

        const dbMap = new Map<string, OrderRecord>();
        for (const dbOrd of dbOrders) {
          const key = normalizeOrderKey(dbOrd);
          if (key) dbMap.set(key, dbOrd);
        }

        for (const locOrd of localOrders) {
          const key = normalizeOrderKey(locOrd);
          if (key && !dbMap.has(key)) {
            const normalizedLocal: OrderRecord = {
              ...locOrd,
              id: key.startsWith("SBN-") ? key : `SBN-${key}`,
              orderNumber: key.startsWith("SBN-") ? `#${key}` : `#SBN-${key}`,
            };
            dbMap.set(key, normalizedLocal);

            void fetch("/api/orders", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(normalizedLocal),
            }).catch(() => {});
          }
        }

        const combined = Array.from(dbMap.values()).sort((a, b) => {
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

    void loadAndSyncOrders();

    const handleSync = () => {
      void loadAndSyncOrders();
    };
    window.addEventListener("ordersUpdated", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      isCancelled = true;
      window.removeEventListener("ordersUpdated", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  // Memperbarui status pesanan
  const handleStatusChange = async (ord: OrderRecord, newStatus: string) => {
    const targetKey = normalizeOrderKey(ord);
    const cleanId = targetKey.startsWith("SBN-")
      ? targetKey
      : `SBN-${targetKey}`;
    const custName =
      ord.customerName || ord.recipientName || ord.name || "Pelanggan";

    setUpdatingId(targetKey);

    try {
      setOrders((prev) =>
        prev.map((item) =>
          normalizeOrderKey(item) === targetKey
            ? { ...item, status: newStatus }
            : item
        )
      );

      if (typeof window !== "undefined") {
        try {
          const rawLocal = window.localStorage.getItem("soto_complete_orders");
          if (rawLocal) {
            const parsed: unknown = JSON.parse(rawLocal);
            if (Array.isArray(parsed)) {
              const updatedLocal = (parsed as OrderRecord[]).map((item) =>
                normalizeOrderKey(item) === targetKey
                  ? { ...item, status: newStatus }
                  : item
              );
              window.localStorage.setItem(
                "soto_complete_orders",
                JSON.stringify(updatedLocal)
              );
            }
          }
        } catch {}
      }

      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...ord,
          id: cleanId,
          status: newStatus,
        }),
      });

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("ordersUpdated"));
      }

      if (res.ok) {
        showCustomAlert(
          "Status Pesanan Diperbarui",
          `Status pesanan #${cleanId} atas nama ${custName} berhasil diubah menjadi "${newStatus}".`,
          "success"
        );
      } else {
        showCustomAlert(
          "Tersimpan di Lokal",
          `Status pesanan #${cleanId} (${custName}) telah diperbarui menjadi "${newStatus}".`,
          "info"
        );
      }
    } catch (error) {
      console.error("Gagal mengubah status:", error);
      showCustomAlert(
        "Gagal Memperbarui Status",
        "Terjadi kendala saat menghubungi server database.",
        "error"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // Menyaring daftar pesanan sesuai status yang dipilih
  const filteredOrders = useMemo(() => {
    if (statusFilter === "ALL") return orders;
    return orders.filter(
      (o) => String(o.status || "PENDING").toUpperCase() === statusFilter
    );
  }, [orders, statusFilter]);

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
      {/* Header */}
      <header
        style={{
          backgroundColor: "#FFFFFF",
          borderBottom: "1px solid #E5DEC9",
          padding: "18px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "14px",
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
          <p style={{ margin: "3px 0 0", fontSize: "12.5px", color: "#6D4C30" }}>
            Pantau rincian alamat pengantaran customer dan update status
            pengiriman.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => exportOrdersListCsv(filteredOrders)}
            style={{
              backgroundColor: "#166534",
              color: "#FFFFFF",
              border: "none",
              padding: "10px 16px",
              borderRadius: "12px",
              fontSize: "12.5px",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Export CSV
          </button>

          <button
            type="button"
            onClick={printOrdersPage}
            style={{
              backgroundColor: "#2A1A11",
              color: "#EFE3C8",
              border: "none",
              padding: "10px 16px",
              borderRadius: "12px",
              fontSize: "12.5px",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Cetak Daftar Pesanan
          </button>
        </div>
      </header>

      <div style={{ padding: "32px" }}>
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
            <h2
              style={{
                margin: 0,
                fontSize: "16px",
                fontWeight: 900,
                color: "#2A1A11",
              }}
            >
              Pesanan Online Delivery
            </h2>

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
                <option value="ALL">Semua Status</option>
                <option value="PENDING">Pending</option>
                <option value="DIPROSES">Diproses</option>
                <option value="DIKIRIM">Dikirim</option>
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
              Memuat daftar pesanan...
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
              Belum ada pesanan untuk status ini.
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
                    <th style={{ padding: "12px 10px" }}>Penerima &amp; Kontak</th>
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
                    const key = normalizeOrderKey(ord);
                    const codeText = key.startsWith("SBN-")
                      ? `#${key}`
                      : `#SBN-${key}`;
                    const custName =
                      ord.customerName ||
                      ord.recipientName ||
                      ord.name ||
                      "Pelanggan";
                    const phoneText = ord.customerPhone || ord.phone || "-";
                    const areaText =
                      ord.area || ord.deliveryArea || "Jabodetabek";
                    const courierText = ord.shippingService || ord.service || "Kurir Instant";
                    const totalAmt = getOrderTotal(ord);
                    const rawStatus = String(
                      ord.status || "PENDING"
                    ).toUpperCase();

                    const isSelesai =
                      rawStatus === "SELESAI" ||
                      rawStatus === "COMPLETED" ||
                      rawStatus === "TERKIRIM";
                    const isProses =
                      rawStatus === "DIPROSES" ||
                      rawStatus === "PROSES" ||
                      rawStatus === "DIKIRIM" ||
                      rawStatus === "DIANTAR";

                    const timeStr = ord.createdAt
                      ? new Date(ord.createdAt).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        }) + " WIB"
                      : "Baru saja";

                    return (
                      <tr
                        key={codeText}
                        style={{
                          borderBottom: "1px solid #EFE3C8",
                          color: "#2A1A11",
                          verticalAlign: "top",
                        }}
                      >
                        <td
                          style={{
                            padding: "16px 10px",
                            whiteSpace: "nowrap",
                            color: "#475569",
                            fontWeight: 700,
                          }}
                        >
                          ⏱ {timeStr}
                        </td>
                        <td
                          style={{
                            padding: "16px 10px",
                            fontWeight: 900,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {codeText}
                        </td>
                        <td style={{ padding: "16px 10px" }}>
                          <div style={{ fontWeight: 900 }}>{custName}</div>
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#6D4C30",
                              marginTop: "2px",
                            }}
                          >
                            {phoneText}
                          </div>
                        </td>
                        <td style={{ padding: "16px 10px", maxWidth: "220px" }}>
                          <span
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
                            {areaText}
                          </span>
                          <div
                            style={{
                              fontSize: "12.5px",
                              color: "#334155",
                              lineHeight: 1.4,
                            }}
                          >
                            {ord.address || "-"}
                          </div>
                        </td>
                        <td style={{ padding: "16px 10px" }}>
                          {Array.isArray(ord.items) && ord.items.length > 0 ? (
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "4px",
                              }}
                            >
                              {ord.items.map((it, idx) => (
                                <div
                                  key={idx}
                                  style={{
                                    fontSize: "12.5px",
                                    fontWeight: 800,
                                  }}
                                >
                                  <span
                                    style={{
                                      backgroundColor: "#EFE3C8",
                                      padding: "1px 6px",
                                      borderRadius: "4px",
                                      marginRight: "6px",
                                      fontSize: "11px",
                                    }}
                                  >
                                    {it.qty ?? it.quantity ?? 1}x
                                  </span>
                                  {it.name || it.title || "Menu"}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span style={{ fontSize: "12px", color: "#8A6B47" }}>
                              Paket Soto Banjar
                            </span>
                          )}
                        </td>
                        <td
                          style={{
                            padding: "16px 10px",
                            whiteSpace: "nowrap",
                          }}
                        >
                          <div
                            style={{
                              fontWeight: 900,
                              color: "#15803D",
                              fontSize: "13.5px",
                            }}
                          >
                            Rp {totalAmt.toLocaleString("id-ID")}
                          </div>
                          <div
                            style={{
                              fontSize: "11px",
                              color: "#6D4C30",
                              marginTop: "2px",
                            }}
                          >
                            Kurir: {courierText}
                          </div>
                        </td>
                        <td style={{ padding: "16px 10px" }}>
                          <span
                            style={{
                              display: "inline-block",
                              border: "1px solid #D6C7B2",
                              backgroundColor: "#FAF6EE",
                              padding: "4px 10px",
                              borderRadius: "8px",
                              fontSize: "11.5px",
                              fontWeight: 800,
                              color: "#2A1A11",
                            }}
                          >
                            {ord.paymentMethod || "BCA Virtual Account"}
                          </span>
                        </td>
                        <td style={{ padding: "16px 10px" }}>
                          <select
                            value={
                              isSelesai
                                ? "SELESAI"
                                : rawStatus === "DIKIRIM"
                                ? "DIKIRIM"
                                : rawStatus === "DIPROSES"
                                ? "DIPROSES"
                                : "PENDING"
                            }
                            disabled={updatingId === key}
                            onChange={(e) =>
                              void handleStatusChange(ord, e.target.value)
                            }
                            style={{
                              padding: "6px 12px",
                              borderRadius: "8px",
                              fontSize: "12px",
                              fontWeight: 900,
                              cursor: "pointer",
                              border: isSelesai
                                ? "1.5px solid #86EFAC"
                                : isProses
                                ? "1.5px solid #FDE68A"
                                : "1.5px solid #FCA5A5",
                              backgroundColor: isSelesai
                                ? "#DCFCE7"
                                : isProses
                                ? "#FEF3C7"
                                : "#FEE2E2",
                              color: isSelesai
                                ? "#166534"
                                : isProses
                                ? "#B45309"
                                : "#DC2626",
                            }}
                          >
                            <option value="PENDING">Pending</option>
                            <option value="DIPROSES">Diproses</option>
                            <option value="DIKIRIM">Dikirim</option>
                            <option value="SELESAI">Selesai</option>
                          </select>
                        </td>
                        <td style={{ padding: "16px 10px" }}>
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(ord)}
                            style={{
                              backgroundColor: "#2A1A11",
                              color: "#FAF6EE",
                              border: "none",
                              padding: "7px 14px",
                              borderRadius: "8px",
                              fontSize: "12px",
                              fontWeight: 800,
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

      {/* Notifikasi status pesanan */}
      {alertBox.visible && (
        <div
          onClick={closeCustomAlert}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.55)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "#FAF6EE",
              borderRadius: "22px",
              maxWidth: "400px",
              width: "100%",
              border: "2px solid #D6C7B2",
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.35)",
              overflow: "hidden",
              textAlign: "center",
            }}
          >
            <div
              style={{
                backgroundColor: "#2A1A11",
                color: "#EFE3C8",
                padding: "16px 20px",
                fontWeight: 900,
                fontSize: "16px",
              }}
            >
              {alertBox.type === "success"
                ? "✅ Berhasil"
                : alertBox.type === "error"
                ? "⚠️ Peringatan"
                : "ℹ️ Informasi"}
            </div>
            <div style={{ padding: "24px 22px" }}>
              <h4
                style={{
                  margin: "0 0 8px",
                  fontSize: "16px",
                  fontWeight: 900,
                  color: "#2A1A11",
                }}
              >
                {alertBox.title}
              </h4>
              <p
                style={{
                  margin: "0 0 20px",
                  fontSize: "13.5px",
                  color: "#6D4C30",
                  lineHeight: 1.5,
                }}
              >
                {alertBox.message}
              </p>
              <button
                type="button"
                onClick={closeCustomAlert}
                style={{
                  width: "100%",
                  padding: "11px 18px",
                  borderRadius: "12px",
                  border: "none",
                  backgroundColor:
                    alertBox.type === "success"
                      ? "#166534"
                      : alertBox.type === "error"
                      ? "#DC2626"
                      : "#2A1A11",
                  color: "#FFFFFF",
                  fontSize: "13.5px",
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                Oke, Mengerti
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rincian lengkap pesanan */}
      {selectedOrder && (
        <div
          onClick={() => setSelectedOrder(null)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "#FAF6EE",
              borderRadius: "20px",
              maxWidth: "500px",
              width: "100%",
              border: "2px solid #D6C7B2",
              overflow: "hidden",
              boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
            }}
          >
            <div
              style={{
                backgroundColor: "#2A1A11",
                color: "#EFE3C8",
                padding: "16px 22px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 900 }}>
                  Detail Pesanan #{normalizeOrderKey(selectedOrder)}
                </h3>
                <p
                  style={{
                    margin: "2px 0 0",
                    fontSize: "11.5px",
                    color: "#D5C5B3",
                  }}
                >
                  Status:{" "}
                  {String(selectedOrder.status || "PENDING").toUpperCase()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "none",
                  color: "#EFE3C8",
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  cursor: "pointer",
                  fontWeight: 900,
                }}
              >
                ✕
              </button>
            </div>

            <div
              style={{
                padding: "20px 22px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                fontSize: "13px",
                color: "#2A1A11",
                maxHeight: "75vh",
                overflowY: "auto",
              }}
            >
              <div
                style={{
                  backgroundColor: "#FFFFFF",
                  padding: "12px 14px",
                  borderRadius: "12px",
                  border: "1px solid #E5DEC9",
                }}
              >
                <div style={{ fontWeight: 900, marginBottom: "6px" }}>
                  👤 Informasi Penerima
                </div>
                <div>
                  <strong>Nama:</strong>{" "}
                  {selectedOrder.customerName ||
                    selectedOrder.recipientName ||
                    selectedOrder.name ||
                    "Pelanggan"}
                </div>
                <div>
                  <strong>No. HP:</strong>{" "}
                  {selectedOrder.customerPhone || selectedOrder.phone || "-"}
                </div>
                <div>
                  <strong>Wilayah:</strong>{" "}
                  {selectedOrder.area || selectedOrder.deliveryArea || "-"}
                </div>
                <div>
                  <strong>Alamat:</strong> {selectedOrder.address || "-"}
                </div>
                {(selectedOrder.landmark ||
                  selectedOrder.addressBenchmark ||
                  selectedOrder.patokan) && (
                  <div>
                    <strong>Patokan:</strong>{" "}
                    {selectedOrder.landmark ||
                      selectedOrder.addressBenchmark ||
                      selectedOrder.patokan}
                  </div>
                )}
              </div>

              <div
                style={{
                  backgroundColor: "#FFFFFF",
                  padding: "12px 14px",
                  borderRadius: "12px",
                  border: "1px solid #E5DEC9",
                }}
              >
                <div style={{ fontWeight: 900, marginBottom: "6px" }}>
                  🍲 Rincian Menu Pesanan
                </div>
                {Array.isArray(selectedOrder.items) &&
                selectedOrder.items.length > 0 ? (
                  selectedOrder.items.map((it, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "4px 0",
                        borderBottom: "1px dashed #E5DEC9",
                      }}
                    >
                      <span>
                        {it.qty ?? it.quantity ?? 1}x {it.name || it.title}
                      </span>
                      <span style={{ fontWeight: 800 }}>
                        Rp{" "}
                        {(
                          Number(it.price ?? 0) *
                          Number(it.qty ?? it.quantity ?? 1)
                        ).toLocaleString("id-ID")}
                      </span>
                    </div>
                  ))
                ) : (
                  <div>Paket Soto Banjar</div>
                )}

                <div
                  style={{
                    marginTop: "8px",
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "12px",
                    color: "#6D4C30",
                  }}
                >
                  <span>
                    Ongkir (
                    {selectedOrder.shippingService ||
                      selectedOrder.service ||
                      "Kurir"}
                    )
                  </span>
                  <span>
                    Rp{" "}
                    {Number(
                      selectedOrder.shippingCost ??
                        selectedOrder.shippingFee ??
                        0
                    ).toLocaleString("id-ID")}
                  </span>
                </div>

                <div
                  style={{
                    marginTop: "6px",
                    paddingTop: "6px",
                    borderTop: "2px solid #E5DEC9",
                    display: "flex",
                    justifyContent: "space-between",
                    fontWeight: 900,
                    fontSize: "14px",
                    color: "#15803D",
                  }}
                >
                  <span>Total Pembayaran</span>
                  <span>
                    Rp {getOrderTotal(selectedOrder).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              {(selectedOrder.note ||
                selectedOrder.notes ||
                selectedOrder.orderNotes) && (
                <div
                  style={{
                    backgroundColor: "#FFFBEB",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    border: "1px solid #FDE68A",
                    fontSize: "12px",
                    color: "#92400E",
                  }}
                >
                  <strong>Catatan Pesanan:</strong>{" "}
                  {selectedOrder.note ||
                    selectedOrder.notes ||
                    selectedOrder.orderNotes}
                </div>
              )}

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                style={{
                  width: "100%",
                  padding: "11px",
                  borderRadius: "10px",
                  border: "none",
                  backgroundColor: "#2A1A11",
                  color: "#EFE3C8",
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                Tutup Detail
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}