"use client";

import React, { useEffect, useState } from "react";

interface OrderItem {
  id?: number;
  name?: string;
  title?: string;
  price?: number;
  qty?: number;
  quantity?: number;
}

interface OrderRecord {
  id: number | string;
  orderNumber?: string;
  customerName?: string;
  name?: string;
  customerPhone?: string;
  phone?: string;
  phoneNumber?: string;
  telp?: string;
  area?: string;
  shippingService?: string;
  address?: string;
  subtotal?: number;
  shippingCost?: number;
  totalAmount?: number;
  totalPrice?: number;
  grandTotal?: number;
  total?: number;
  paymentMethod?: string;
  status?: string;
  createdAt?: string;
  items?: OrderItem[];
}

export default function AdminOmsetPage() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterPeriod, setFilterPeriod] = useState<string>("ALL");

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch("/api/orders", { cache: "no-store" });
        if (res.ok) {
          const data = (await res.json()) as OrderRecord[];
          setOrders(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Gagal memuat omset:", err);
      } finally {
        setLoading(false);
      }
    }

    void fetchOrders();
  }, []);

  // Hitung total omset
  const totalOmset = orders.reduce((sum, ord) => {
    const amt = Number(ord.totalAmount ?? ord.subtotal ?? ord.totalPrice ?? ord.total ?? 0);
    return sum + amt;
  }, 0);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", backgroundColor: "#FAF6EE" }}>
      {/* Header Halaman */}
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
          <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 900, color: "#2A1A11" }}>
            Laporan &amp; Rincian Omset
          </h1>
          <p style={{ margin: "3px 0 0", fontSize: "12.5px", color: "#6D4C30" }}>
            Penyaringan data omset per periode serta daftar rincian pemesanan.
          </p>
        </div>
      </header>

      {/* Konten Utama */}
      <div style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "20px" }}>
        
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "20px",
            padding: "24px",
            border: "1.5px solid #E5DEC9",
            boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
          }}
        >
          {/* Header Tabel & Filter */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 900, color: "#2A1A11" }}>
                Rincian Omset &amp; Daftar Pemesanan
              </h3>
              <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#6D4C30" }}>
                Pantau omset berdasarkan rentang waktu beserta data pelanggan yang melakukan pemesanan.
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "12.5px", fontWeight: 800, color: "#6D4C30" }}>Filter Periode:</span>
              <select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value)}
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
                <option value="ALL">Semua Waktu</option>
                <option value="TODAY">Hari Ini</option>
                <option value="MONTH">Bulan Ini</option>
              </select>
            </div>
          </div>

          {/* Bar Info Total Omset */}
          <div
            style={{
              backgroundColor: "#FAF6EE",
              border: "1.5px solid #E5DEC9",
              borderRadius: "14px",
              padding: "14px 20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ backgroundColor: "#2A1A11", color: "#EFE3C8", padding: "6px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 900 }}>
                Semua Waktu
              </span>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "#6D4C30" }}>
                Menampilkan <strong>{orders.length}</strong> pesanan
              </span>
            </div>
            <div style={{ fontSize: "14px", fontWeight: 900, color: "#166534" }}>
              Total Omset Periode: <span style={{ fontSize: "18px" }}>Rp {totalOmset.toLocaleString("id-ID")}</span>
            </div>
          </div>

          {/* Tabel Rincian Omset */}
          {loading ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#6D4C30", fontWeight: 700 }}>
              Memuat data omset...
            </div>
          ) : orders.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#8A6B47", fontWeight: 700 }}>
              Belum ada data transaksi omset.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #E5DEC9", color: "#6D4C30", fontSize: "12px", fontWeight: 900 }}>
                    <th style={{ padding: "12px 10px" }}>Waktu &amp; Tanggal</th>
                    <th style={{ padding: "12px 10px" }}>ID Order</th>
                    <th style={{ padding: "12px 10px" }}>Nama Pemesan</th>
                    <th style={{ padding: "12px 10px" }}>Kota / Area</th>
                    <th style={{ padding: "12px 10px" }}>Menu yang Dipesan</th>
                    <th style={{ padding: "12px 10px" }}>Total Bayar</th>
                    <th style={{ padding: "12px 10px" }}>Metode</th>
                    <th style={{ padding: "12px 10px" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((ord) => {
                    const timeStr = ord.createdAt
                      ? new Date(ord.createdAt).toLocaleString("id-ID", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Baru saja";
                    
                    const orderIdText = ord.orderNumber || `#SBN-${ord.id}`;
                    const custName = ord.customerName || ord.name || "Customer";
                    const areaName = ord.area || "Jakarta";
                    const totalAmt = Number(ord.totalAmount ?? ord.subtotal ?? ord.totalPrice ?? ord.total ?? 0);
                    const payMethod = ord.paymentMethod || "BCA Virtual Account";
                    const currentStatus = (ord.status || "PENDING").toUpperCase();

                    return (
                      <tr key={ord.id} style={{ borderBottom: "1px solid #EFE3C8", color: "#2A1A11", verticalAlign: "middle" }}>
                        {/* Waktu & Tanggal */}
                        <td style={{ padding: "14px 10px", fontWeight: 700, whiteSpace: "nowrap", color: "#6D4C30" }}>
                          ⏱️ {timeStr}
                        </td>

                        {/* ID Order */}
                        <td style={{ padding: "14px 10px", fontWeight: 900, whiteSpace: "nowrap" }}>
                          {orderIdText}
                        </td>

                        {/* Nama Pemesan */}
                        <td style={{ padding: "14px 10px", fontWeight: 900, color: "#2A1A11" }}>
                          {custName}
                        </td>

                        {/* Kota / Area (Tanpa Kontak) */}
                        <td style={{ padding: "14px 10px" }}>
                          <span
                            style={{
                              backgroundColor: "#FEF3C7",
                              color: "#92400E",
                              padding: "3px 10px",
                              borderRadius: "6px",
                              fontSize: "11.5px",
                              fontWeight: 800,
                            }}
                          >
                            {areaName}
                          </span>
                        </td>

                        {/* Menu yang Dipesan */}
                        <td style={{ padding: "14px 10px", minWidth: "220px" }}>
                          {ord.items && ord.items.length > 0 ? (
                            ord.items.map((it, i) => (
                              <div key={i} style={{ marginBottom: "3px", fontSize: "12px" }}>
                                <span style={{ backgroundColor: "#E5DEC9", padding: "1px 6px", borderRadius: "4px", fontWeight: 800, marginRight: "6px" }}>
                                  {it.qty || it.quantity || 1}x
                                </span>
                                <span style={{ fontWeight: 700 }}>{it.name || it.title || "Menu"}</span>
                              </div>
                            ))
                          ) : (
                            <span style={{ fontSize: "12px", color: "#8A6B47" }}>Pesanan Dapur</span>
                          )}
                        </td>

                        {/* Total Bayar */}
                        <td style={{ padding: "14px 10px", fontWeight: 900, color: "#166534", whiteSpace: "nowrap" }}>
                          Rp {totalAmt.toLocaleString("id-ID")}
                        </td>

                        {/* Metode Pembayaran */}
                        <td style={{ padding: "14px 10px", whiteSpace: "nowrap" }}>
                          <span style={{ backgroundColor: "#FAF6EE", border: "1px solid #D6C7B2", padding: "4px 10px", borderRadius: "8px", fontSize: "11.5px", fontWeight: 800, color: "#432818" }}>
                            {payMethod}
                          </span>
                        </td>

                        {/* Status */}
                        <td style={{ padding: "14px 10px", whiteSpace: "nowrap" }}>
                          <span
                            style={{
                              padding: "5px 12px",
                              borderRadius: "20px",
                              fontSize: "11px",
                              fontWeight: 900,
                              backgroundColor: currentStatus.includes("SELESAI") ? "#DCFCE7" : "#FEF3C7",
                              color: currentStatus.includes("SELESAI") ? "#166534" : "#D97706",
                            }}
                          >
                            {currentStatus}
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