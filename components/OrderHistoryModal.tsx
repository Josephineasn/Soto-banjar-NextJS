"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { UserSession } from "@/app/page";

interface OrderItemDetail {
  id?: number | string;
  name?: string;
  menuName?: string;
  price?: number;
  qty?: number;
  quantity?: number;
  menu?: {
    name?: string;
    price?: number;
  };
}

interface OrderRecord {
  id?: number | string;
  orderNumber?: string;
  orderCode?: string;
  accountName?: string;
  customerName?: string;
  recipientName?: string;
  customerEmail?: string;
  userEmail?: string;
  status?: string;
  paymentMethod?: string;
  vaNumber?: string;
  virtualAccount?: string;
  area?: string;
  deliveryArea?: string;
  service?: string;
  shippingService?: string;
  courier?: string;
  serviceFee?: number;
  thermalBagCost?: number;
  useThermalBag?: boolean;
  thermalBag?: boolean | string;
  address?: string;
  fullAddress?: string;
  addressBenchmark?: string;
  benchmark?: string;
  landmark?: string;
  patokan?: string;
  orderNotes?: string;
  note?: string;
  notes?: string;
  shippingFee?: number;
  shippingCost?: number;
  deliveryFee?: number;
  discount?: number;
  totalPrice?: number;
  totalAmount?: number;
  total?: number;
  createdAt?: string;
  date?: string;
  items?: OrderItemDetail[];
}

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserSession | null;
}

type OrderStatusTab = "SEMUA" | "PENDING" | "DIPROSES" | "DIKIRIM" | "SELESAI";

const CUSTOMER_CONFIRMED_STORAGE_KEY = "soto_customer_confirmed_orders";

// Membaca daftar ID pesanan yang sudah dikonfirmasi diterima oleh customer
function readCustomerConfirmedOrders(): Set<string> {
  if (typeof window === "undefined") return new Set<string>();
  try {
    const raw = window.localStorage.getItem(CUSTOMER_CONFIRMED_STORAGE_KEY);
    if (!raw) return new Set<string>();
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return new Set(parsed.map((x) => String(x).trim().toUpperCase()));
    }
  } catch {}
  return new Set<string>();
}

// Menyimpan ID pesanan yang telah dikonfirmasi diterima oleh customer ke localStorage
function saveCustomerConfirmedOrder(orderKey: string) {
  if (typeof window === "undefined") return;
  try {
    const current = readCustomerConfirmedOrders();
    current.add(orderKey.trim().toUpperCase());
    window.localStorage.setItem(
      CUSTOMER_CONFIRMED_STORAGE_KEY,
      JSON.stringify(Array.from(current))
    );
  } catch {}
}

// Memformat tanggal dan waktu pesanan menjadi format Indonesia yang mudah dibaca
function formatOrderDate(raw?: string): string {
  if (!raw) return "Baru saja";
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  const datePart = d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const timePart = d
    .toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    })
    .replace(":", ".");
  return `${datePart}, ${timePart}`;
}

function normalizeId(ord: OrderRecord): string {
  const raw = String(ord.orderNumber || ord.orderCode || ord.id || "");
  return raw.replace(/^#/, "").trim().toUpperCase();
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Membuka tampilan faktur / nota resmi siap simpan sebagai PDF pada jendela cetak browser
function downloadOrPrintInvoicePdf(ord: OrderRecord, fallbackName: string) {
  const rawCode = String(
    ord.orderCode || ord.orderNumber || ord.id || "SBN-ORDER"
  );
  const codeText = rawCode.startsWith("#") ? rawCode : `#${rawCode}`;
  const dateText = formatOrderDate(ord.createdAt || ord.date);
  const statusText = String(ord.status || "PENDING").toUpperCase();
  const recipient =
    ord.recipientName || ord.customerName || fallbackName || "Pelanggan";
  const area = ord.area || ord.deliveryArea || "Jakarta";
  const service =
    ord.service || ord.shippingService || ord.courier || "Kurir Instant";
  const payment = ord.paymentMethod || "BCA VIRTUAL ACCOUNT";
  const vaNum = ord.vaNumber || ord.virtualAccount || "-";
  const address = ord.address || ord.fullAddress || "-";

  const shippingCost = Number(
    ord.shippingFee ?? ord.shippingCost ?? ord.deliveryFee ?? 0
  );
  const discount = Number(ord.discount ?? 0);
  const totalCost = Number(
    ord.totalPrice ?? ord.totalAmount ?? ord.total ?? 0
  );

  const itemRowsHtml =
    Array.isArray(ord.items) && ord.items.length > 0
      ? ord.items
          .map((it) => {
            const itemName = escapeHtml(
              it.name || it.menuName || it.menu?.name || "Menu"
            );
            const qty = Number(it.qty ?? it.quantity ?? 1);
            const unitPrice = Number(it.price ?? it.menu?.price ?? 0);
            const lineTotal = unitPrice * qty;
            return `
              <tr>
                <td style="padding:8px 0;border-bottom:1px solid #EFE3C8;">
                  <strong>${itemName}</strong><br/>
                  <span style="font-size:11px;color:#6D4C30;">${qty} x Rp ${unitPrice.toLocaleString("id-ID")}</span>
                </td>
                <td style="padding:8px 0;border-bottom:1px solid #EFE3C8;text-align:right;font-weight:700;">
                  Rp ${lineTotal.toLocaleString("id-ID")}
                </td>
              </tr>
            `;
          })
          .join("")
      : `<tr><td colspan="2" style="padding:8px 0;">Rincian menu sesuai pesanan</td></tr>`;

  const printWin = window.open("", "_blank", "width=520,height=720");
  if (!printWin) {
    window.print();
    return;
  }

  printWin.document.write(`
    <!DOCTYPE html>
    <html lang="id">
      <head>
        <meta charset="UTF-8" />
        <title>Faktur Pesanan ${escapeHtml(codeText)}</title>
        <style>
          * { box-sizing: border-box; }
          body {
            font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
            padding: 28px;
            color: #2A1A11;
            background: #FFFFFF;
            margin: 0;
          }
          .invoice-box {
            max-width: 460px;
            margin: 0 auto;
            border: 1.5px solid #D6C7B2;
            border-radius: 16px;
            padding: 24px;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #2A1A11;
            padding-bottom: 14px;
            margin-bottom: 16px;
          }
          .header h1 {
            margin: 0;
            font-size: 18px;
            font-weight: 900;
            letter-spacing: 0.4px;
          }
          .header p {
            margin: 4px 0 0;
            font-size: 11.5px;
            color: #6D4C30;
            font-weight: 700;
          }
          .meta {
            width: 100%;
            font-size: 12px;
            margin-bottom: 16px;
            border-collapse: collapse;
          }
          .meta td {
            padding: 3px 0;
            vertical-align: top;
          }
          .meta td:first-child {
            color: #6D4C30;
            width: 120px;
          }
          .meta td:last-child {
            font-weight: 700;
          }
          .items {
            width: 100%;
            font-size: 12.5px;
            border-collapse: collapse;
            margin-bottom: 14px;
          }
          .summary {
            width: 100%;
            font-size: 12.5px;
            border-collapse: collapse;
          }
          .summary td {
            padding: 4px 0;
          }
          .summary .grand td {
            border-top: 2px solid #2A1A11;
            padding-top: 10px;
            margin-top: 6px;
            font-size: 15px;
            font-weight: 900;
          }
          .footer {
            margin-top: 20px;
            padding-top: 12px;
            border-top: 1px dashed #D6C7B2;
            text-align: center;
            font-size: 11px;
            color: #6D4C30;
          }
          @media print {
            body { padding: 0; }
            .invoice-box { border: none; max-width: 100%; }
          }
        </style>
      </head>
      <body>
        <div class="invoice-box">
          <div class="header">
            <h1>SOTO BANJAR SELERA NUSANTARA</h1>
            <p>FAKTUR / NOTA PESANAN RESMI</p>
          </div>

          <table class="meta">
            <tr><td>No. Faktur</td><td>${escapeHtml(codeText)}</td></tr>
            <tr><td>Tanggal</td><td>${escapeHtml(dateText)}</td></tr>
            <tr><td>Status</td><td>${escapeHtml(statusText)}</td></tr>
            <tr><td>Penerima</td><td>${escapeHtml(recipient)}</td></tr>
            <tr><td>Wilayah &amp; Kurir</td><td>${escapeHtml(area)} (${escapeHtml(service)})</td></tr>
            <tr><td>Alamat</td><td>${escapeHtml(address)}</td></tr>
            <tr><td>Pembayaran</td><td>${escapeHtml(payment)}</td></tr>
            <tr><td>No. VA</td><td>${escapeHtml(String(vaNum))}</td></tr>
          </table>

          <table class="items">
            <thead>
              <tr>
                <th style="text-align:left;padding-bottom:6px;border-bottom:1.5px solid #2A1A11;font-size:11px;">ITEM PESANAN</th>
                <th style="text-align:right;padding-bottom:6px;border-bottom:1.5px solid #2A1A11;font-size:11px;">SUBTOTAL</th>
              </tr>
            </thead>
            <tbody>
              ${itemRowsHtml}
            </tbody>
          </table>

          <table class="summary">
            <tr>
              <td style="color:#6D4C30;">Ongkos Kirim</td>
              <td style="text-align:right;font-weight:700;">Rp ${shippingCost.toLocaleString("id-ID")}</td>
            </tr>
            ${
              discount > 0
                ? `<tr>
                    <td style="color:#166534;">Diskon Voucher</td>
                    <td style="text-align:right;font-weight:700;color:#166534;">-Rp ${discount.toLocaleString("id-ID")}</td>
                  </tr>`
                : ""
            }
            <tr class="grand">
              <td>TOTAL BAYAR</td>
              <td style="text-align:right;">Rp ${totalCost.toLocaleString("id-ID")}</td>
            </tr>
          </table>

          <div class="footer">
            Terima kasih telah memesan di Soto Banjar Selera Nusantara.<br/>
            Simpan dokumen ini sebagai bukti transaksi yang sah.
          </div>
        </div>
        <script>
          window.onload = function () {
            window.print();
          };
        </script>
      </body>
    </html>
  `);
  printWin.document.close();
}

// Memastikan pesanan yang ditampilkan hanya milik akun customer yang sedang login
function isOrderOwnedByCurrentUser(
  ord: OrderRecord,
  uNameLower: string,
  uEmailLower: string
): boolean {
  if (!uNameLower && !uEmailLower) return false;

  const rawNotes = String(ord.orderNotes || ord.note || ord.notes || "");
  const userTagMatch = rawNotes.match(/\[USER:\s*([^\]]+)\]/i);
  const emailTagMatch = rawNotes.match(/\[EMAIL:\s*([^\]]+)\]/i);

  const ordAccountName = String(ord.accountName || userTagMatch?.[1] || "")
    .trim()
    .toLowerCase();
  const ordEmail = String(
    ord.customerEmail || ord.userEmail || emailTagMatch?.[1] || ""
  )
    .trim()
    .toLowerCase();
  const ordCustomerName = String(ord.customerName || ord.recipientName || "")
    .trim()
    .toLowerCase();

  if (ordAccountName) {
    if (uNameLower && ordAccountName === uNameLower) return true;
    if (uEmailLower && ordAccountName === uEmailLower.split("@")[0]) return true;
    return false;
  }

  if (ordEmail && uEmailLower) {
    return ordEmail === uEmailLower;
  }

  if (uNameLower && ordCustomerName) {
    if (ordCustomerName === uNameLower) return true;
    if (
      ordCustomerName.length >= 4 &&
      uNameLower.startsWith(ordCustomerName)
    ) {
      return true;
    }
  }

  return false;
}

export default function OrderHistoryModal({
  isOpen,
  onClose,
  currentUser,
}: OrderHistoryModalProps) {
  // State daftar pesanan, loading, tab status, salin VA, konfirmasi penerimaan customer, dan alert sukses
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<OrderStatusTab>("SEMUA");
  const [copiedId, setCopiedId] = useState<string | number | null>(null);
  const [confirmedKeys, setConfirmedKeys] = useState<Set<string>>(() =>
    readCustomerConfirmedOrders()
  );
  const [pendingConfirmOrder, setPendingConfirmOrder] =
    useState<OrderRecord | null>(null);
  const [confirmingKey, setConfirmingKey] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string>("");
  const [syncTick, setSyncTick] = useState<number>(0);

  const activeUserName = (currentUser?.name || "").trim();
  const activeUserEmail = (currentUser?.email || "").trim().toLowerCase();

  useEffect(() => {
    const triggerReload = () => {
      setConfirmedKeys(readCustomerConfirmedOrders());
      setSyncTick((prev) => prev + 1);
    };
    window.addEventListener("ordersUpdated", triggerReload);
    window.addEventListener("storage", triggerReload);
    return () => {
      window.removeEventListener("ordersUpdated", triggerReload);
      window.removeEventListener("storage", triggerReload);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    let isCancelled = false;

    async function fetchOrders() {
      setLoading(true);
      try {
        const uNameLower = activeUserName.toLowerCase();
        const uEmailLower = activeUserEmail.toLowerCase();

        if (!uNameLower && !uEmailLower) {
          if (!isCancelled) {
            setOrders([]);
            setLoading(false);
          }
          return;
        }

        let dbList: OrderRecord[] = [];
        try {
          const res = await fetch("/api/orders", { cache: "no-store" });
          if (res.ok) {
            const data: unknown = await res.json();
            dbList = Array.isArray(data)
              ? (data as OrderRecord[])
              : Array.isArray((data as { orders?: OrderRecord[] })?.orders)
              ? (data as { orders: OrderRecord[] }).orders
              : [];
          }
        } catch {}

        let localList: OrderRecord[] = [];
        if (typeof window !== "undefined") {
          try {
            const rawLocal = window.localStorage.getItem(
              "soto_complete_orders"
            );
            if (rawLocal) {
              const parsed = JSON.parse(rawLocal) as OrderRecord[];
              if (Array.isArray(parsed)) {
                localList = parsed;
              }
            }
          } catch {}
        }

        const mergedMap = new Map<string, OrderRecord>();

        for (const item of dbList) {
          const key = normalizeId(item);
          if (key) mergedMap.set(key, item);
        }

        for (const localItem of localList) {
          const key = normalizeId(localItem);
          if (key && !mergedMap.has(key)) {
            mergedMap.set(key, localItem);
          }
        }

        const combinedList = Array.from(mergedMap.values());

        const userFiltered = combinedList.filter((ord) => {
          const st = String(ord.status || "PENDING").toUpperCase();
          if (st === "DIBATALKAN" || st === "CANCELLED") return false;
          return isOrderOwnedByCurrentUser(ord, uNameLower, uEmailLower);
        });

        if (!isCancelled) {
          setOrders(userFiltered);
        }
      } catch (err) {
        console.error("Gagal memuat riwayat pesanan:", err);
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    void fetchOrders();

    return () => {
      isCancelled = true;
    };
  }, [isOpen, activeUserName, activeUserEmail, syncTick]);

  // Memproses konfirmasi customer setelah menyetujui alert dialog "Yakin sudah diterima"
  async function handleConfirmOrderReceived(ord: OrderRecord) {
    const targetKey = normalizeId(ord);
    if (!targetKey) return;

    const cleanId = targetKey.startsWith("SBN-")
      ? targetKey
      : `SBN-${targetKey}`;
    setConfirmingKey(targetKey);

    try {
      saveCustomerConfirmedOrder(targetKey);
      setConfirmedKeys(readCustomerConfirmedOrders());

      setOrders((prev) =>
        prev.map((item) =>
          normalizeId(item) === targetKey
            ? { ...item, status: "SELESAI" }
            : item
        )
      );

      if (typeof window !== "undefined") {
        try {
          const rawLocal = window.localStorage.getItem("soto_complete_orders");
          if (rawLocal) {
            const parsed = JSON.parse(rawLocal) as OrderRecord[];
            if (Array.isArray(parsed)) {
              const updatedLocal = parsed.map((item) =>
                normalizeId(item) === targetKey
                  ? { ...item, status: "SELESAI" }
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

      await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...ord,
          id: cleanId,
          status: "SELESAI",
        }),
      }).catch(() => {});

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("ordersUpdated"));
      }

      setPendingConfirmOrder(null);
      setSuccessNotice(
        `Pesanan #${cleanId} telah dikonfirmasi diterima dan selesai.`
      );
      setTimeout(() => setSuccessNotice(""), 4000);
    } finally {
      setConfirmingKey(null);
    }
  }

  // Menghitung jumlah pesanan per kategori status (Semua, Pending, Diproses, Dikirim, Selesai)
  const counts = useMemo(() => {
    const c = {
      SEMUA: orders.length,
      PENDING: 0,
      DIPROSES: 0,
      DIKIRIM: 0,
      SELESAI: 0,
    };
    orders.forEach((o) => {
      const s = String(o.status || "PENDING").toUpperCase();
      if (s === "PENDING") c.PENDING += 1;
      else if (s === "DIPROSES" || s === "PROSES" || s === "PROCESSED")
        c.DIPROSES += 1;
      else if (s === "DIKIRIM" || s === "DIANTAR" || s === "SHIPPED")
        c.DIKIRIM += 1;
      else if (
        s === "SELESAI" ||
        s === "COMPLETED" ||
        s === "DONE" ||
        s === "TERKIRIM"
      )
        c.SELESAI += 1;
    });
    return c;
  }, [orders]);

  // Menyaring daftar pesanan sesuai tab status yang sedang dipilih customer
  const filteredOrders = useMemo(() => {
    if (activeTab === "SEMUA") return orders;
    return orders.filter((o) => {
      const s = String(o.status || "PENDING").toUpperCase();
      if (activeTab === "PENDING") return s === "PENDING";
      if (activeTab === "DIPROSES")
        return s === "DIPROSES" || s === "PROSES" || s === "PROCESSED";
      if (activeTab === "DIKIRIM")
        return s === "DIKIRIM" || s === "DIANTAR" || s === "SHIPPED";
      if (activeTab === "SELESAI")
        return (
          s === "SELESAI" ||
          s === "COMPLETED" ||
          s === "DONE" ||
          s === "TERKIRIM"
        );
      return true;
    });
  }, [orders, activeTab]);

  // Jika modal riwayat sedang tertutup, komponen tidak dirender
  if (!isOpen) return null;

  const tabs: { key: OrderStatusTab; label: string; count: number }[] = [
    { key: "SEMUA", label: "Semua", count: counts.SEMUA },
    { key: "PENDING", label: "Pending", count: counts.PENDING },
    { key: "DIPROSES", label: "Diproses", count: counts.DIPROSES },
    { key: "DIKIRIM", label: "Dikirim", count: counts.DIKIRIM },
    { key: "SELESAI", label: "Selesai", count: counts.SELESAI },
  ];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.65)",
        zIndex: 180,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "600px",
          maxHeight: "88vh",
          backgroundColor: "#FAF6EE",
          borderRadius: "22px",
          border: "1.5px solid #E5DEC9",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 25px 60px rgba(0, 0, 0, 0.35)",
        }}
      >
        {/* Header modal riwayat pesanan beserta tab filter status */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            padding: "20px 24px 16px",
            borderBottom: "1px solid #E5DEC9",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "16px",
            }}
          >
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: "20px",
                  fontWeight: 900,
                  color: "#2A1A11",
                  fontFamily: "Georgia, serif",
                }}
              >
                Riwayat Pesanan Saya
              </h3>
              <p
                style={{
                  margin: "4px 0 0",
                  fontSize: "12px",
                  color: "#8A6B47",
                  fontWeight: 600,
                }}
              >
                Akun Login:{" "}
                <strong style={{ color: "#2A1A11" }}>
                  {activeUserName || activeUserEmail || "Belum Login"}
                </strong>{" "}
                •{" "}
                <span style={{ color: "#166534", fontWeight: 700 }}>
                  Sinkron Real-Time
                </span>
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                border: "1px solid #E5DEC9",
                backgroundColor: "#FAF6EE",
                color: "#2A1A11",
                fontSize: "14px",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            {tabs.map((t) => {
              const active = activeTab === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setActiveTab(t.key)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "7px 14px",
                    borderRadius: "999px",
                    border: active
                      ? "1.5px solid #734F31"
                      : "1px solid #E5DEC9",
                    backgroundColor: active ? "#734F31" : "#FAF6EE",
                    color: active ? "#FFFFFF" : "#432818",
                    fontSize: "12px",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  <span>{t.label}</span>
                  <span
                    style={{
                      backgroundColor: active
                        ? "rgba(255,255,255,0.22)"
                        : "#E5DEC9",
                      color: active ? "#FFFFFF" : "#432818",
                      padding: "1px 6px",
                      borderRadius: "999px",
                      fontSize: "10.5px",
                      fontWeight: 900,
                    }}
                  >
                    {t.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Banner notifikasi setelah customer mengonfirmasi pesanan diterima */}
        {successNotice && (
          <div
            style={{
              margin: "14px 24px 0",
              padding: "10px 14px",
              borderRadius: "12px",
              backgroundColor: "#DCFCE7",
              border: "1.5px solid #86EFAC",
              color: "#166534",
              fontSize: "12.5px",
              fontWeight: 800,
            }}
          >
            ✓ {successNotice}
          </div>
        )}

        {/* Daftar kartu pesanan beserta tombol konfirmasi selesai & simpan/cetak faktur PDF */}
        <div
          style={{
            padding: "20px 24px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {loading ? (
            <div
              style={{
                padding: "40px",
                textAlign: "center",
                color: "#6D4C30",
                fontWeight: 800,
              }}
            >
              Memuat riwayat pesanan...
            </div>
          ) : filteredOrders.length === 0 ? (
            <div
              style={{
                padding: "40px",
                textAlign: "center",
                backgroundColor: "#FFFFFF",
                borderRadius: "16px",
                border: "1.5px dashed #D6C7B2",
                color: "#8A6B47",
                fontWeight: 700,
                fontSize: "13px",
              }}
            >
              Belum ada riwayat pesanan pada status ini.
            </div>
          ) : (
            filteredOrders.map((ord, index) => {
              const statusUpper = String(ord.status || "PENDING").toUpperCase();
              const isAdminMarkedDone =
                statusUpper === "SELESAI" ||
                statusUpper === "COMPLETED" ||
                statusUpper === "DONE" ||
                statusUpper === "TERKIRIM";

              const normalizedKey = normalizeId(ord);
              const isCustomerConfirmed = confirmedKeys.has(normalizedKey);

              const rawId = String(
                ord.orderCode || ord.orderNumber || ord.id || `SBN-${index}`
              );
              const codeText = rawId.startsWith("#") ? rawId : `#${rawId}`;

              const vaNum =
                ord.vaNumber || ord.virtualAccount || "807778778659726";
              const shippingCost = Number(
                ord.shippingFee ?? ord.shippingCost ?? ord.deliveryFee ?? 0
              );
              const totalCost = Number(
                ord.totalPrice ?? ord.totalAmount ?? ord.total ?? 0
              );

              const cleanNote = String(
                ord.note || ord.notes || ord.orderNotes || ""
              )
                .replace(/\[VA:[^\]]*\]/gi, "")
                .replace(/\[HP:[^\]]*\]/gi, "")
                .replace(/\[EMAIL:[^\]]*\]/gi, "")
                .replace(/\[USER:[^\]]*\]/gi, "")
                .trim();

              const patokanText =
                ord.benchmark ||
                ord.patokan ||
                ord.landmark ||
                ord.addressBenchmark ||
                "";

              const hasThermal =
                ord.useThermalBag === true ||
                ord.thermalBag === true ||
                ord.thermalBag === "Ya" ||
                Number(ord.serviceFee ?? ord.thermalBagCost ?? 0) > 0;

              return (
                <div
                  key={codeText}
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "18px",
                    border: "1.5px solid #E8D1A7",
                    padding: "20px",
                    boxShadow: "0 4px 16px rgba(42, 26, 17, 0.04)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "14px",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: "15px",
                          fontWeight: 900,
                          color: "#2A1A11",
                        }}
                      >
                        {codeText}
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#94A3B8",
                          marginTop: "2px",
                        }}
                      >
                        {formatOrderDate(ord.createdAt || ord.date)}
                      </div>
                    </div>

                    <span
                      style={{
                        padding: "5px 12px",
                        borderRadius: "999px",
                        fontSize: "10.5px",
                        fontWeight: 900,
                        textTransform: "uppercase",
                        backgroundColor: isAdminMarkedDone
                          ? "#DCFCE7"
                          : "#FEF3C7",
                        color: isAdminMarkedDone ? "#166534" : "#B45309",
                      }}
                    >
                      {statusUpper}
                    </span>
                  </div>

                  {/* Informasi nomor Virtual Account beserta tombol salin cepat */}
                  <div
                    style={{
                      backgroundColor: "#FAF6EE",
                      border: "1px dashed #D6C7B2",
                      borderRadius: "12px",
                      padding: "12px 14px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "16px",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: "10px",
                          fontWeight: 900,
                          color: "#734F31",
                          textTransform: "uppercase",
                        }}
                      >
                        {ord.paymentMethod || "BCA VIRTUAL ACCOUNT"}
                      </div>
                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: 900,
                          color: "#2A1A11",
                          marginTop: "2px",
                        }}
                      >
                        VA: {vaNum}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        void navigator.clipboard.writeText(String(vaNum));
                        setCopiedId(codeText);
                        setTimeout(() => setCopiedId(null), 2000);
                      }}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "8px",
                        border: "1px solid #D6C7B2",
                        backgroundColor: "#FFFFFF",
                        color: "#2A1A11",
                        fontSize: "11px",
                        fontWeight: 800,
                        cursor: "pointer",
                      }}
                    >
                      {copiedId === codeText ? "Tersalin ✓" : "Salin VA"}
                    </button>
                  </div>

                  {/* Rincian penerima, wilayah, kurir, alamat, dan catatan */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1.2fr",
                      gap: "12px",
                      fontSize: "12px",
                      marginBottom: "16px",
                    }}
                  >
                    <div>
                      <div style={{ color: "#94A3B8", fontSize: "11px" }}>
                        Nama Penerima:
                      </div>
                      <div style={{ fontWeight: 800, color: "#2A1A11" }}>
                        {ord.recipientName ||
                          ord.customerName ||
                          activeUserName ||
                          "Pelanggan"}
                      </div>
                    </div>

                    <div>
                      <div style={{ color: "#94A3B8", fontSize: "11px" }}>
                        Wilayah &amp; Layanan:
                      </div>
                      <div style={{ fontWeight: 800, color: "#2A1A11" }}>
                        {ord.area || ord.deliveryArea || "Jakarta"} (
                        {ord.service ||
                          ord.shippingService ||
                          ord.courier ||
                          "Kurir Instant"}
                        )
                      </div>
                    </div>

                    <div>
                      <div style={{ color: "#94A3B8", fontSize: "11px" }}>
                        Thermal Bag:
                      </div>
                      <div style={{ fontWeight: 800, color: "#2A1A11" }}>
                        {hasThermal ? "Ya" : "Tidak"}
                      </div>
                    </div>

                    <div>
                      <div style={{ color: "#94A3B8", fontSize: "11px" }}>
                        Alamat Lengkap:
                      </div>
                      <div style={{ fontWeight: 800, color: "#2A1A11" }}>
                        {ord.address || ord.fullAddress || "-"}
                      </div>
                    </div>

                    {patokanText && (
                      <div>
                        <div style={{ color: "#94A3B8", fontSize: "11px" }}>
                          Patokan:
                        </div>
                        <div style={{ fontWeight: 800, color: "#2A1A11" }}>
                          {patokanText}
                        </div>
                      </div>
                    )}

                    {cleanNote && (
                      <div>
                        <div style={{ color: "#94A3B8", fontSize: "11px" }}>
                          Catatan Pengiriman:
                        </div>
                        <div
                          style={{
                            fontWeight: 700,
                            fontStyle: "italic",
                            color: "#432818",
                          }}
                        >
                          &quot;{cleanNote}&quot;
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Daftar item menu, ongkir, total bayar, serta tombol aksi customer */}
                  <div
                    style={{
                      borderTop: "1px solid #F1F5F9",
                      paddingTop: "12px",
                      fontSize: "12px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "10.5px",
                        fontWeight: 900,
                        color: "#64748B",
                        textTransform: "uppercase",
                        marginBottom: "8px",
                      }}
                    >
                      DETAIL PESANAN:
                    </div>

                    {Array.isArray(ord.items) &&
                      ord.items.map((it, idx) => {
                        const itemName =
                          it.name || it.menuName || it.menu?.name || "Menu";
                        const qty = Number(it.qty ?? it.quantity ?? 1);
                        const itemPrice =
                          Number(it.price ?? it.menu?.price ?? 0) * qty;

                        return (
                          <div
                            key={it.id ?? idx}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              marginBottom: "5px",
                              color: "#2A1A11",
                            }}
                          >
                            <span>
                              {itemName} <strong>x{qty}</strong>
                            </span>
                            <strong>
                              Rp {itemPrice.toLocaleString("id-ID")}
                            </strong>
                          </div>
                        );
                      })}

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        color: "#64748B",
                        marginTop: "4px",
                      }}
                    >
                      <span>Ongkos Kirim:</span>
                      <span>Rp {shippingCost.toLocaleString("id-ID")}</span>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        borderTop: "1px solid #E5DEC9",
                        marginTop: "10px",
                        paddingTop: "10px",
                        fontSize: "14px",
                        fontWeight: 900,
                        color: "#2A1A11",
                      }}
                    >
                      <span>Total Pembayaran:</span>
                      <span>Rp {totalCost.toLocaleString("id-ID")}</span>
                    </div>

                    {/* Tombol konfirmasi pesanan selesai (hanya aktif setelah admin mengubah status menjadi SELESAI) & simpan faktur PDF */}
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        marginTop: "14px",
                        flexWrap: "wrap",
                        alignItems: "center",
                      }}
                    >
                      {isAdminMarkedDone ? (
                        isCustomerConfirmed ? (
                          <span
                            style={{
                              padding: "7px 12px",
                              borderRadius: "9px",
                              backgroundColor: "#DCFCE7",
                              border: "1px solid #86EFAC",
                              color: "#166534",
                              fontSize: "11.5px",
                              fontWeight: 800,
                            }}
                          >
                            ✓ Pesanan Sudah Diterima
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setPendingConfirmOrder(ord)}
                            style={{
                              padding: "7px 14px",
                              borderRadius: "9px",
                              border: "none",
                              backgroundColor: "#166534",
                              color: "#FFFFFF",
                              fontSize: "11.5px",
                              fontWeight: 800,
                              cursor: "pointer",
                            }}
                          >
                            Pesanan Selesai / Diterima
                          </button>
                        )
                      ) : (
                        <span
                          style={{
                            padding: "6px 11px",
                            borderRadius: "9px",
                            backgroundColor: "#FAF6EE",
                            border: "1px dashed #D6C7B2",
                            color: "#8A6B47",
                            fontSize: "11px",
                            fontWeight: 700,
                          }}
                        >
                          Menunggu admin menyelesaikan pesanan
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          downloadOrPrintInvoicePdf(ord, activeUserName)
                        }
                        style={{
                          padding: "7px 14px",
                          borderRadius: "9px",
                          border: "1.5px solid #2A1A11",
                          backgroundColor: "#2A1A11",
                          color: "#EFE3C8",
                          fontSize: "11.5px",
                          fontWeight: 800,
                          cursor: "pointer",
                        }}
                      >
                        Download / Cetak Faktur (PDF)
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal alert konfirmasi sebelum customer menandai pesanan sudah diterima */}
      {pendingConfirmOrder && (
        <div
          onClick={() => setPendingConfirmOrder(null)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            zIndex: 250,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "400px",
              backgroundColor: "#FAF6EE",
              borderRadius: "20px",
              border: "2px solid #D6C7B2",
              overflow: "hidden",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.35)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                backgroundColor: "#2A1A11",
                color: "#EFE3C8",
                padding: "14px 20px",
                fontSize: "15px",
                fontWeight: 900,
              }}
            >
              Konfirmasi Penerimaan Pesanan
            </div>

            <div style={{ padding: "22px 20px" }}>
              <h4
                style={{
                  margin: "0 0 8px",
                  fontSize: "16px",
                  fontWeight: 900,
                  color: "#2A1A11",
                }}
              >
                Yakin pesanan sudah diterima?
              </h4>
              <p
                style={{
                  margin: "0 0 20px",
                  fontSize: "13px",
                  color: "#6D4C30",
                  lineHeight: 1.5,
                }}
              >
                Pastikan sajian{" "}
                <strong>#{normalizeId(pendingConfirmOrder)}</strong> telah
                sampai dan sesuai dengan pesanan Anda sebelum menyelesaikan
                transaksi.
              </p>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setPendingConfirmOrder(null)}
                  style={{
                    flex: 1,
                    padding: "10px 14px",
                    borderRadius: "10px",
                    border: "1.5px solid #D6C7B2",
                    backgroundColor: "#FFFFFF",
                    color: "#2A1A11",
                    fontSize: "13px",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  Belum, Batal
                </button>

                <button
                  type="button"
                  disabled={
                    confirmingKey === normalizeId(pendingConfirmOrder)
                  }
                  onClick={() =>
                    void handleConfirmOrderReceived(pendingConfirmOrder)
                  }
                  style={{
                    flex: 1,
                    padding: "10px 14px",
                    borderRadius: "10px",
                    border: "none",
                    backgroundColor: "#166534",
                    color: "#FFFFFF",
                    fontSize: "13px",
                    fontWeight: 900,
                    cursor: "pointer",
                  }}
                >
                  {confirmingKey === normalizeId(pendingConfirmOrder)
                    ? "Menyimpan..."
                    : "Ya, Sudah Diterima"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}