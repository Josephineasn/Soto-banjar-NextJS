"use client";

import React, { useEffect, useState } from "react";

interface OrderItem {
  id: string;
  customerName?: string;
  customerPhone?: string;
  address?: string;
  area?: string;
  service?: string;
  paymentMethod?: string;
  status: string;
  totalPrice: number;
  createdAt: string;
  items?: { name: string; qty: number; price: number }[];
}

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: { name: string; role: string } | null;
}

export default function OrderHistoryModal({
  isOpen,
  onClose,
  currentUser,
}: OrderHistoryModalProps) {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    async function fetchOrders() {
      try {
        setLoading(true);
        const res = await fetch("/api/orders", { cache: "no-store" });
        if (res.ok) {
          const allOrders: OrderItem[] = await res.json();

          // Saring pesanan HANYA milik akun yang sedang login
          const activeUser =
            currentUser?.name || localStorage.getItem("soto_customer_user");

          if (activeUser && Array.isArray(allOrders)) {
            const userOrders = allOrders.filter((ord) => {
              const nameMatch = ord.customerName
                ?.toLowerCase()
                .includes(activeUser.toLowerCase());
              return Boolean(nameMatch);
            });
            setOrders(userOrders);
          } else {
            setOrders([]);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    void fetchOrders();
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.65)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "520px",
          maxHeight: "85vh",
          backgroundColor: "#FFFFFF",
          borderRadius: "20px",
          border: "1.5px solid #E8D1A7",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.25)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #FAF6EE",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "#FAF6EE",
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "900", color: "#734F31" }}>
              Riwayat Pesanan
            </h3>
            {currentUser && (
              <span style={{ fontSize: "11px", color: "#9D9167", fontWeight: "700" }}>
                Akun: {currentUser.name}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "18px",
              color: "#734F31",
              cursor: "pointer",
              fontWeight: "900",
            }}
          >
            ✕
          </button>
        </div>

        {/* List Riwayat Pesanan */}
        <div style={{ padding: "20px 24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#9D9167", fontSize: "13px" }}>
              Memuat riwayat transaksi Anda...
            </div>
          ) : orders.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "#64748B", fontSize: "13px" }}>
              Belum ada riwayat pesanan untuk akun <strong>{currentUser?.name || "ini"}</strong>.
            </div>
          ) : (
            orders.map((ord) => (
              <div
                key={ord.id}
                style={{
                  border: "1.5px solid #E8D1A7",
                  borderRadius: "14px",
                  padding: "18px",
                  backgroundColor: "#FFFFFF",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                  <div>
                    <span style={{ fontSize: "10px", color: "#94A3B8", textTransform: "uppercase", fontWeight: "800", display: "block" }}>
                      ID PESANAN
                    </span>
                    <strong style={{ fontSize: "13px", color: "#1E293B" }}>{ord.id}</strong>
                    <span style={{ fontSize: "10px", color: "#64748B", display: "block", marginTop: "2px" }}>
                      {ord.createdAt}
                    </span>
                  </div>

                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: "900",
                      padding: "3px 10px",
                      borderRadius: "6px",
                      backgroundColor: ord.status === "SELESAI" ? "#DCFCE7" : "#E0F2FE",
                      color: ord.status === "SELESAI" ? "#166534" : "#0284C7",
                    }}
                  >
                    {ord.status}
                  </span>
                </div>

                <div style={{ borderTop: "1px dashed #E2E8F0", paddingTop: "10px", marginBottom: "10px", fontSize: "12px", color: "#475569" }}>
                  <span style={{ fontSize: "10px", fontWeight: "800", color: "#94A3B8", textTransform: "uppercase" }}>
                    DAFTAR MENU:
                  </span>
                  {ord.items && ord.items.length > 0 ? (
                    ord.items.map((it, idx) => (
                      <div key={idx} style={{ marginTop: "4px" }}>
                        • {it.qty}x {it.name} — Rp {(it.price * it.qty).toLocaleString("id-ID")}
                      </div>
                    ))
                  ) : (
                    <div style={{ marginTop: "4px" }}>• Paket Menu Soto Banjar</div>
                  )}
                </div>

                <div style={{ fontSize: "11px", color: "#64748B", lineHeight: "1.6", borderTop: "1px dashed #E2E8F0", paddingTop: "8px" }}>
                  <div>Penerima: <strong>{ord.customerName}</strong> {ord.customerPhone && `(${ord.customerPhone})`}</div>
                  {ord.address && <div>Alamat: {ord.address}</div>}
                  {ord.area && <div>Area: {ord.area}</div>}
                </div>

                <div style={{ marginTop: "12px", borderTop: "1.5px solid #F1F5F9", paddingTop: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "11px", fontWeight: "700", color: "#734F31" }}>
                    Metode: {ord.paymentMethod || "QRIS / VA"}
                  </span>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "10px", color: "#94A3B8", display: "block" }}>Total Biaya</span>
                    <strong style={{ fontSize: "15px", color: "#734F31", fontWeight: "900" }}>
                      Rp {ord.totalPrice.toLocaleString("id-ID")}
                    </strong>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}