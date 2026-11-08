"use client";

import React, { useEffect, useMemo, useState } from "react";

interface OrderItemDetail {
    id: number;
    name: string;
    qty: number;
    price: number;
}

interface OrderData {
    id: string;
    customerName: string;
    customerPhone?: string;
    customerAddress?: string;
    totalPrice: number;
    status: string;
    paymentMethod: string;
    createdAt: string;
    items: OrderItemDetail[];
}

    export default function AdminOmsetPage() {
    const [orders, setOrders] = useState<OrderData[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterPeriod, setFilterPeriod] = useState("Semua Waktu");

    useEffect(() => {
        queueMicrotask(() => {
        async function fetchOrders() {
            try {
            setLoading(true);
            const res = await fetch("/api/orders", { cache: "no-store" });
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            }
            } catch (err) {
            console.error("Gagal mengambil pesanan:", err);
            } finally {
            setLoading(false);
            }
        }
        void fetchOrders();
        });
    }, []);

    // Filter berdasarkan rentang waktu
    const filteredOrders = useMemo(() => {
        const now = new Date();
        return orders.filter((o) => {
        const orderDate = new Date(o.createdAt);
        if (filterPeriod === "Hari Ini") {
            return (
            orderDate.getDate() === now.getDate() &&
            orderDate.getMonth() === now.getMonth() &&
            orderDate.getFullYear() === now.getFullYear()
            );
        }
        if (filterPeriod === "Minggu Ini (7 Hari)") {
            const diffDays =
            (now.getTime() - orderDate.getTime()) / (1000 * 3600 * 24);
            return diffDays <= 7;
        }
        if (filterPeriod === "Bulan Ini") {
            return (
            orderDate.getMonth() === now.getMonth() &&
            orderDate.getFullYear() === now.getFullYear()
            );
        }
        if (filterPeriod === "Tahun Ini") {
            return orderDate.getFullYear() === now.getFullYear();
        }
        return true;
        });
    }, [orders, filterPeriod]);

    const totalOmset = useMemo(() => {
        return filteredOrders.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
    }, [filteredOrders]);

    return (
        <div>
        <div style={{ marginBottom: "24px" }}>
            <h2
            style={{
                fontSize: "24px",
                fontWeight: "900",
                color: "#1E293B",
                margin: "0 0 6px",
                fontFamily: "serif",
            }}
            >
            Laporan &amp; Rincian Omset
            </h2>
            <p style={{ fontSize: "13px", color: "#64748B", margin: 0 }}>
            Penyaringan data omset per periode serta daftar rincian pemesan.
            </p>
        </div>

        <div
            style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "16px",
            border: "1px solid #E2E8F0",
            padding: "26px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
            }}
        >
            <div
            style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "14px",
                marginBottom: "20px",
            }}
            >
            <div>
                <h3
                style={{
                    margin: "0 0 4px",
                    fontSize: "16px",
                    fontWeight: "800",
                    color: "#1E293B",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                }}
                >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1E293B" strokeWidth={2}>
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    <path d="M2 12h20" />
                </svg>
                Rincian Omset &amp; Daftar Pemesan
                </h3>
                <p style={{ margin: 0, fontSize: "12px", color: "#64748B" }}>
                Pantau omset berdasarkan rentang waktu beserta data pelanggan yang melakukan pemesanan.
                </p>
            </div>

            {/* Filter Dropdown */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span
                style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    color: "#1E293B",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                }}
                >
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                Filter Periode:
                </span>
                <select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value)}
                style={{
                    padding: "8px 14px",
                    borderRadius: "8px",
                    border: "1px solid #CBD5E1",
                    backgroundColor: "#FFFFFF",
                    fontSize: "12px",
                    color: "#1E293B",
                    fontWeight: "700",
                    outline: "none",
                    cursor: "pointer",
                }}
                >
                <option value="Semua Waktu">Semua Waktu</option>
                <option value="Hari Ini">Hari Ini</option>
                <option value="Minggu Ini (7 Hari)">Minggu Ini (7 Hari)</option>
                <option value="Bulan Ini">Bulan Ini</option>
                <option value="Tahun Ini">Tahun Ini</option>
                </select>
            </div>
            </div>

            <div
            style={{
                backgroundColor: "#F8FAFC",
                border: "1px solid #E2E8F0",
                borderRadius: "10px",
                padding: "12px 18px",
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
            }}
            >
            <span
                style={{
                backgroundColor: "#C28955",
                color: "#FFFFFF",
                fontSize: "11px",
                fontWeight: "800",
                padding: "4px 10px",
                borderRadius: "6px",
                }}
            >
                {filterPeriod}
            </span>
            <span style={{ fontSize: "12px", color: "#475569" }}>
                Menampilkan <strong>{filteredOrders.length} pesanan</strong>
            </span>
            <span style={{ fontSize: "12px", color: "#64748B", marginLeft: "14px" }}>
                Total Omset Periode:{" "}
                <strong style={{ color: "#1E293B", fontSize: "14px" }}>
                Rp {totalOmset.toLocaleString("id-ID")}
                </strong>
            </span>
            </div>

            {/* Tabel Rincian */}
            {loading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#64748B", fontSize: "13px" }}>
                Memuat data transaksi omset...
            </div>
            ) : filteredOrders.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#64748B", fontSize: "13px" }}>
                Tidak ada transaksi pada periode yang dipilih.
            </div>
            ) : (
            <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
                <thead>
                    <tr style={{ borderBottom: "1.5px solid #F1F5F9", color: "#64748B" }}>
                    <th style={{ padding: "12px 10px", fontWeight: "700" }}>Waktu &amp; Tanggal</th>
                    <th style={{ padding: "12px 10px", fontWeight: "700" }}>ID Order</th>
                    <th style={{ padding: "12px 10px", fontWeight: "700" }}>Nama Pemesan</th>
                    <th style={{ padding: "12px 10px", fontWeight: "700" }}>Kontak &amp; Kota</th>
                    <th style={{ padding: "12px 10px", fontWeight: "700" }}>Menu yang Dipesan</th>
                    <th style={{ padding: "12px 10px", fontWeight: "700" }}>Total Bayar</th>
                    <th style={{ padding: "12px 10px", fontWeight: "700" }}>Metode</th>
                    <th style={{ padding: "12px 10px", fontWeight: "700" }}>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredOrders.map((order) => {
                    const orderDate = new Date(order.createdAt);
                    const timeFormatted = `${String(orderDate.getHours()).padStart(2, "0")}.${String(orderDate.getMinutes()).padStart(2, "0")} (${orderDate.getDate()} ${orderDate.toLocaleString("id-ID", { month: "short" })})`;

                    return (
                        <tr key={order.id} style={{ borderBottom: "1px solid #F1F5F9", color: "#1E293B" }}>
                        <td style={{ padding: "12px 10px", color: "#64748B", whiteSpace: "nowrap" }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                            </svg>
                            {timeFormatted}
                            </span>
                        </td>
                        <td style={{ padding: "12px 10px", fontWeight: "800", color: "#0F172A", whiteSpace: "nowrap" }}>
                            #{order.id.slice(0, 10).toUpperCase()}
                        </td>
                        <td style={{ padding: "12px 10px", fontWeight: "800" }}>
                            {order.customerName}
                        </td>
                        <td style={{ padding: "12px 10px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "#334155" }}>
                            <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                            </svg>
                            <span>{order.customerPhone || "081234567890"}</span>
                            </div>
                            <span
                            style={{
                                display: "inline-block",
                                marginTop: "3px",
                                backgroundColor: "#FEF3C7",
                                color: "#92400E",
                                fontSize: "10px",
                                fontWeight: "700",
                                padding: "1px 6px",
                                borderRadius: "4px",
                            }}
                            >
                            Jakarta
                            </span>
                        </td>
                        <td style={{ padding: "12px 10px", fontSize: "12px", color: "#334155" }}>
                            {order.items && order.items.length > 0 ? (
                            order.items.map((it, idx) => (
                                <div key={idx} style={{ lineHeight: "1.4" }}>
                                <span style={{ fontWeight: "700", color: "#0F172A" }}>{it.qty}x</span> {it.name}
                                </div>
                            ))
                            ) : (
                            <span>Soto Banjar Komplit</span>
                            )}
                        </td>
                        <td style={{ padding: "12px 10px", fontWeight: "900", color: "#0F172A", whiteSpace: "nowrap" }}>
                            Rp {order.totalPrice.toLocaleString("id-ID")}
                        </td>
                        <td style={{ padding: "12px 10px", whiteSpace: "nowrap" }}>
                            <span
                            style={{
                                border: "1px solid #CBD5E1",
                                padding: "3px 10px",
                                borderRadius: "14px",
                                fontSize: "11px",
                                fontWeight: "700",
                                color: "#475569",
                            }}
                            >
                            {order.paymentMethod || "GoPay"}
                            </span>
                        </td>
                        <td style={{ padding: "12px 10px", whiteSpace: "nowrap" }}>
                            <span
                            style={{
                                backgroundColor: "#FEF3C7",
                                color: "#92400E",
                                padding: "4px 10px",
                                borderRadius: "12px",
                                fontSize: "11px",
                                fontWeight: "800",
                            }}
                            >
                            {order.status || "Diproses"}
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
    );
}