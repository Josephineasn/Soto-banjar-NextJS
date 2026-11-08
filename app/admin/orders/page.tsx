"use client";

import React, { useEffect, useState } from "react";

interface AdminOrder {
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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadOrders() {
    try {
      setLoading(true);
      const res = await fetch("/api/orders", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadOrders();
  }, []);

  async function updateOrderStatus(orderId: string, newStatus: string) {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Gagal update status");

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch {
      alert("Gagal memperbarui status pesanan.");
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: "28px", fontWeight: "900", color: "#734F31", margin: "0 0 8px" }}>
        Pesanan Masuk
      </h1>
      <p style={{ fontSize: "14px", color: "#9D9167", margin: "0 0 32px" }}>
        Kelola pengiriman Jabodetabek dan status pesanan dapur[cite: 16].
      </p>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#9D9167" }}>Memuat daftar pesanan...</div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#9D9167" }}>Belum ada pesanan masuk.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {orders.map((order) => (
            <div
              key={order.id}
              style={{
                backgroundColor: "#ffffff",
                border: "1.5px solid #E8D1A7",
                borderRadius: "16px",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px dashed #E8D1A7", paddingBottom: "10px" }}>
                <div>
                  <span style={{ fontSize: "11px", fontWeight: "800", color: "#9D9167" }}>ID PESANAN</span>
                  <strong style={{ display: "block", fontSize: "14px", color: "#734F31" }}>{order.id}</strong>
                  <span style={{ fontSize: "11px", color: "#8C7A6B" }}>
                    {new Date(order.createdAt).toLocaleDateString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
                  </span>
                </div>

                {/* Dropdown Update Status */}
                <select
                  value={order.status}
                  onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "8px",
                    fontWeight: "800",
                    fontSize: "12px",
                    border: "1px solid #E8D1A7",
                    backgroundColor: order.status === "SELESAI" ? "#DCFCE7" : order.status === "DIPROSES" ? "#FEF3C7" : "#DBEAFE",
                    color: order.status === "SELESAI" ? "#166534" : order.status === "DIPROSES" ? "#92400E" : "#1E40AF",
                    cursor: "pointer",
                  }}
                >
                  <option value="PENDING">PENDING</option>
                  <option value="DIPROSES">DIPROSES</option>
                  <option value="SELESAI">SELESAI</option>
                </select>
              </div>

              {/* Rincian Menu & Alamat */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", fontSize: "13px", color: "#734F31" }}>
                <div>
                  <strong>Item Pesanan:</strong>
                  <ul style={{ margin: "4px 0 0", paddingLeft: "18px" }}>
                    {order.items?.map((item) => (
                      <li key={item.id}>
                        {item.qty}x {item.name} (Rp {(item.price * item.qty).toLocaleString("id-ID")})
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div><strong>Penerima:</strong> {order.customerName} ({order.customerPhone})</div>
                  <div><strong>Alamat:</strong> {order.address}</div>
                  <div><strong>Kurir & Area:</strong> {order.area} - {order.service}</div>
                  <div><strong>Metode Bayar:</strong> {order.paymentMethod.toUpperCase()}</div>
                </div>
              </div>

              <div style={{ textAlign: "right", borderTop: "1px solid #FAF6EE", paddingTop: "8px" }}>
                <span style={{ fontSize: "12px", color: "#9D9167" }}>Total Transaksi: </span>
                <strong style={{ fontSize: "15px", color: "#734F31" }}>
                  Rp {order.totalPrice.toLocaleString("id-ID")}
                </strong>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}