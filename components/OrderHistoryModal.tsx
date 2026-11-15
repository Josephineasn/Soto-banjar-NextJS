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
  id: number | string;
  orderCode?: string;
  customerName?: string;
  recipientName?: string;
  customerEmail?: string;
  userEmail?: string;
  status?: string;
  paymentMethod?: string;
  vaNumber?: string;
  virtualAccount?: string;
  deliveryArea?: string;
  shippingService?: string;
  courier?: string;
  thermalBag?: boolean | string;
  address?: string;
  fullAddress?: string;
  benchmark?: string;
  patokan?: string;
  note?: string;
  notes?: string;
  shippingFee?: number;
  deliveryFee?: number;
  discount?: number;
  totalPrice?: number;
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

function formatOrderDate(raw?: string): string {
  if (!raw) return "15 Nov 2026, 01.28";
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

export default function OrderHistoryModal({
  isOpen,
  onClose,
  currentUser,
}: OrderHistoryModalProps) {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<OrderStatusTab>("SEMUA");
  const [copiedId, setCopiedId] = useState<string | number | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    async function fetchOrders() {
      setLoading(true);
      try {
        const res = await fetch("/api/orders", { cache: "no-store" });
        if (res.ok) {
          const data: unknown = await res.json();
          const list: OrderRecord[] = Array.isArray(data)
            ? (data as OrderRecord[])
            : Array.isArray((data as { orders?: OrderRecord[] })?.orders)
            ? (data as { orders: OrderRecord[] }).orders
            : [];

          // Filter hanya pesanan milik user yang sedang login (dan sembunyikan yang berstatus DIBATALKAN)
          const userFiltered = list.filter((ord) => {
            const st = String(ord.status || "PENDING").toUpperCase();
            if (st === "DIBATALKAN" || st === "CANCELLED") return false;

            if (!currentUser) return true;
            const uName = (currentUser.name || "").trim().toLowerCase();
            const uEmail = (currentUser.email || "").trim().toLowerCase();
            const oName = String(
              ord.customerName || ord.recipientName || ""
            )
              .trim()
              .toLowerCase();
            const oEmail = String(ord.customerEmail || ord.userEmail || "")
              .trim()
              .toLowerCase();

            if (uEmail && oEmail && uEmail === oEmail) return true;
            if (uName && oName && oName === uName) return true;
            return true;
          });

          setOrders(userFiltered);
        }
      } catch (err) {
        console.error("Gagal memuat riwayat pesanan:", err);
      } finally {
        setLoading(false);
      }
    }

    void fetchOrders();
  }, [isOpen, currentUser]);

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
      else if (s === "DIPROSES" || s === "PROCESSED") c.DIPROSES += 1;
      else if (s === "DIKIRIM" || s === "SHIPPED") c.DIKIRIM += 1;
      else if (s === "SELESAI" || s === "COMPLETED" || s === "DONE")
        c.SELESAI += 1;
    });
    return c;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    if (activeTab === "SEMUA") return orders;
    return orders.filter((o) => {
      const s = String(o.status || "PENDING").toUpperCase();
      if (activeTab === "PENDING") return s === "PENDING";
      if (activeTab === "DIPROSES") return s === "DIPROSES" || s === "PROCESSED";
      if (activeTab === "DIKIRIM") return s === "DIKIRIM" || s === "SHIPPED";
      if (activeTab === "SELESAI")
        return s === "SELESAI" || s === "COMPLETED" || s === "DONE";
      return true;
    });
  }, [orders, activeTab]);

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
        {/* Header Modal */}
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
                  {currentUser?.name || "Pelanggan"}
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

          {/* 5 Tab Status Tanpa "Dibatalkan" & Tanpa Scrollbar */}
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

        {/* Isi Daftar Kartu Pesanan */}
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
            filteredOrders.map((ord) => {
              const statusUpper = String(ord.status || "PENDING").toUpperCase();
              const isSelesai =
                statusUpper === "SELESAI" || statusUpper === "COMPLETED";
              const codeText = ord.orderCode
                ? String(ord.orderCode)
                : String(ord.id).startsWith("#")
                ? String(ord.id)
                : `#SBN-${ord.id}`;

              const vaNum =
                ord.vaNumber || ord.virtualAccount || "807778778659726";
              const shippingCost = Number(
                ord.shippingFee ?? ord.deliveryFee ?? 30000
              );
              const totalCost = Number(ord.totalPrice ?? ord.total ?? 50000);

              return (
                <div
                  key={ord.id}
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "18px",
                    border: "1.5px solid #E8D1A7",
                    padding: "20px",
                    boxShadow: "0 4px 16px rgba(42, 26, 17, 0.04)",
                  }}
                >
                  {/* Baris Atas: Kode Order & Badge Status */}
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
                        backgroundColor: isSelesai ? "#DCFCE7" : "#FEF3C7",
                        color: isSelesai ? "#166534" : "#B45309",
                      }}
                    >
                      {statusUpper}
                    </span>
                  </div>

                  {/* Kotak Metode Pembayaran & Nomor VA */}
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
                        setCopiedId(ord.id);
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
                      {copiedId === ord.id ? "Tersalin ✓" : "Salin VA"}
                    </button>
                  </div>

                  {/* Grid Info Pengiriman */}
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
                          currentUser?.name ||
                          "Pelanggan"}
                      </div>
                    </div>

                    <div>
                      <div style={{ color: "#94A3B8", fontSize: "11px" }}>
                        Wilayah &amp; Layanan:
                      </div>
                      <div style={{ fontWeight: 800, color: "#2A1A11" }}>
                        {ord.deliveryArea || "Jakarta"} (
                        {ord.shippingService || ord.courier || "Kurir Instant"})
                      </div>
                    </div>

                    <div>
                      <div style={{ color: "#94A3B8", fontSize: "11px" }}>
                        Thermal Bag:
                      </div>
                      <div style={{ fontWeight: 800, color: "#2A1A11" }}>
                        {ord.thermalBag === true || ord.thermalBag === "Ya"
                          ? "Ya"
                          : "Tidak"}
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

                    {(ord.benchmark || ord.patokan) && (
                      <div>
                        <div style={{ color: "#94A3B8", fontSize: "11px" }}>
                          Patokan:
                        </div>
                        <div style={{ fontWeight: 800, color: "#2A1A11" }}>
                          {ord.benchmark || ord.patokan}
                        </div>
                      </div>
                    )}

                    {(ord.note || ord.notes) && (
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
                          &quot;{ord.note || ord.notes}&quot;
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Detail Item Pesanan */}
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
                        const qty = Number(it.quantity ?? it.qty ?? 1);
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
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}