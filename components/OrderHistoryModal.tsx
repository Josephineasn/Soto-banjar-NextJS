"use client";

import React, { useEffect, useState } from "react";

interface OrderHistoryItem {
  id: string;
  customerName: string;
  customerPhone?: string;
  address: string;
  area?: string;
  service?: string;
  paymentMethod: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  items: {
    id: number;
    name: string;
    price: number;
    qty: number;
  }[];
}

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OrderHistoryModal({ isOpen, onClose }: OrderHistoryModalProps) {
  const [orders, setOrders] = useState<OrderHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchOrders() {
      if (!isOpen) return;
      try {
        setLoading(true);
        setError("");
        const res = await fetch("/api/orders", { cache: "no-store" });
        if (!res.ok) throw new Error("Gagal mengambil data pesanan.");
        const data = await res.json();
        setOrders(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Terjadi kesalahan saat memuat pesanan.");
        }
      } finally {
        setLoading(false);
      }
    }

    void fetchOrders();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        zIndex: 110,
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
          maxWidth: "600px",
          maxHeight: "85vh",
          backgroundColor: "#ffffff",
          borderRadius: "20px",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1.5px solid #EFE6D8",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "#FAF6EE",
          }}
        >
          <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "900", color: "#734F31" }}>
            Riwayat Pesanan
          </h3>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              border: "1.5px solid #E8D1A7",
              background: "#ffffff",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "bold",
              color: "#734F31",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "50px 0", color: "#9D9167", fontWeight: "700" }}>
              Memuat riwayat pesanan...
            </div>
          ) : error ? (
            <div
              style={{
                padding: "16px",
                backgroundColor: "#FEF2F2",
                border: "1px solid #FECACA",
                borderRadius: "12px",
                color: "#DC2626",
                fontSize: "13px",
                textAlign: "center",
              }}
            >
              {error}
            </div>
          ) : orders.length === 0 ? (
            <div style={{ textAlign: "center", padding: "50px 10px", color: "#9D9167" }}>
              <h4 style={{ margin: "0 0 6px", color: "#734F31", fontWeight: "800", fontSize: "16px" }}>
                Belum Ada Riwayat Pesanan
              </h4>
              <p style={{ margin: 0, fontSize: "13px" }}>
                Pesanan yang Anda buat akan tercatat di sini.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {orders.map((order) => {
                const dateFormatted = new Date(order.createdAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div
                    key={order.id}
                    style={{
                      border: "1.5px solid #E8D1A7",
                      borderRadius: "16px",
                      padding: "18px",
                      backgroundColor: "#FAF6EE",
                      boxShadow: "0 4px 12px rgba(115, 79, 49, 0.04)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "12px",
                        borderBottom: "1px dashed #E8D1A7",
                        paddingBottom: "10px",
                      }}
                    >
                      <div>
                        <span style={{ fontSize: "11px", fontWeight: "800", color: "#9D9167", display: "block" }}>
                          ID PESANAN
                        </span>
                        <strong style={{ fontSize: "14px", color: "#734F31" }}>
                          {order.id}
                        </strong>
                        <span style={{ fontSize: "11px", color: "#8C7A6B", display: "block", marginTop: "2px" }}>
                          {dateFormatted} WIB
                        </span>
                      </div>

                      <span
                        style={{
                          backgroundColor:
                            order.status === "SELESAI"
                              ? "#DCFCE7"
                              : order.status === "DIPROSES"
                              ? "#FEF3C7"
                              : "#DBEAFE",
                          color:
                            order.status === "SELESAI"
                              ? "#166534"
                              : order.status === "DIPROSES"
                              ? "#92400E"
                              : "#1E40AF",
                          padding: "4px 10px",
                          borderRadius: "20px",
                          fontSize: "11px",
                          fontWeight: "800",
                          textTransform: "uppercase",
                        }}
                      >
                        {order.status}
                      </span>
                    </div>

                    <div style={{ marginBottom: "12px" }}>
                      <span style={{ fontSize: "11px", fontWeight: "800", color: "#9D9167", textTransform: "uppercase" }}>
                        Daftar Menu:
                      </span>
                      <ul style={{ margin: "6px 0 0", paddingLeft: "18px", fontSize: "13px", color: "#734F31" }}>
                        {order.items?.map((item) => (
                          <li key={item.id} style={{ marginBottom: "4px" }}>
                            <strong>{item.qty}x</strong> {item.name} — Rp {(item.price * item.qty).toLocaleString("id-ID")}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div
                      style={{
                        fontSize: "12px",
                        color: "#734F31",
                        backgroundColor: "#ffffff",
                        padding: "10px 14px",
                        borderRadius: "10px",
                        border: "1px solid #EFE6D8",
                        marginBottom: "12px",
                        lineHeight: "1.6",
                      }}
                    >
                      <div><strong>Penerima:</strong> {order.customerName} {order.customerPhone ? `(${order.customerPhone})` : ""}</div>
                      <div><strong>Alamat:</strong> {order.address}</div>
                      {order.area && <div><strong>Area:</strong> {order.area}</div>}
                      {order.service && <div><strong>Layanan:</strong> {order.service}</div>}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderTop: "1px solid #E8D1A7",
                        paddingTop: "10px",
                      }}
                    >
                      <span style={{ fontSize: "12px", color: "#9D9167", fontWeight: "700" }}>
                        Metode: <strong style={{ color: "#734F31" }}>{order.paymentMethod.toUpperCase()}</strong>
                      </span>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontSize: "11px", color: "#9D9167", display: "block" }}>Total Biaya</span>
                        <strong style={{ fontSize: "16px", color: "#734F31", fontWeight: "900" }}>
                          Rp {order.totalPrice.toLocaleString("id-ID")}
                        </strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}