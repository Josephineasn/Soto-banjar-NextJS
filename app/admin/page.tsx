"use client";

import React, { useEffect, useState } from "react";

interface RawOrder {
  id: number | string;
  totalAmount?: number;
  subtotal?: number;
  totalPrice?: number;
  grandTotal?: number;
  total?: number;
  status?: string;
  createdAt?: string;
}

export default function AdminDashboardPage() {
  const [totalOmset, setTotalOmset] = useState<number>(0);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [pendingOrders, setPendingOrders] = useState<number>(0);
  const [completedOrders, setCompletedOrders] = useState<number>(0);
  const [chartData, setChartData] = useState<{ date: string; amount: number }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await fetch("/api/orders", { cache: "no-store" });
        if (res.ok) {
          const data = (await res.json()) as RawOrder[];
          if (Array.isArray(data)) {
            setTotalOrders(data.length);

            let sumOmset = 0;
            let pendingCount = 0;
            let completedCount = 0;
            const dateMap: Record<string, number> = {};

            data.forEach((ord) => {
              const amount = Number(
                ord.totalAmount ??
                ord.subtotal ??
                ord.totalPrice ??
                ord.grandTotal ??
                ord.total ??
                0
              );

              sumOmset += amount;

              // Perbaikan logika status pesanan dari database
              const status = (ord.status || "").trim().toUpperCase();
              if (
                status === "PENDING" ||
                status === "PROSES" ||
                status === "PERLU_DIMASAK" ||
                status === "MENUNGGU_PEMBAYARAN"
              ) {
                pendingCount++;
              } else if (
                status === "SELESAI" ||
                status === "COMPLETED" ||
                status === "TERKIRIM"
              ) {
                completedCount++;
              } else {
                // Default jika status lain tapi belum selesai
                pendingCount++;
              }

              // Kelompokkan per tanggal
              const dateStr = ord.createdAt
                ? new Date(ord.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })
                : "Hari Ini";

              dateMap[dateStr] = (dateMap[dateStr] || 0) + amount;
            });

            setTotalOmset(sumOmset);
            setPendingOrders(pendingCount);
            setCompletedOrders(completedCount);

            const formatted = Object.entries(dateMap).map(([date, amount]) => ({
              date,
              amount,
            }));

            setChartData(
              formatted.length > 0
                ? formatted
                : [
                    { date: "13 Nov", amount: 0 },
                    { date: "14 Nov", amount: sumOmset > 0 ? sumOmset / 2 : 0 },
                    { date: "15 Nov", amount: sumOmset },
                  ]
            );
          }
        }
      } catch (err) {
        console.error("Gagal memuat dashboard:", err);
      } finally {
        setLoading(false);
      }
    }

    void loadDashboard();
  }, []);

  // Perhitungan koordinat untuk Grafik Garis (Line Chart SVG)
  const maxVal = Math.max(...chartData.map((d) => d.amount), 100000);
  const svgWidth = 500;
  const svgHeight = 150;
  const points = chartData.map((item, idx) => {
    const x = chartData.length === 1 ? svgWidth / 2 : (idx / (chartData.length - 1)) * (svgWidth - 40) + 20;
    const y = svgHeight - (item.amount / maxVal) * (svgHeight - 30) - 15;
    return { x, y, ...item };
  });

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", backgroundColor: "#FAF6EE" }}>
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
            Panel Operasional Toko
          </h1>
          <p style={{ margin: "3px 0 0", fontSize: "12.5px", color: "#6D4C30" }}>
            Kelola menu sajian, pantau omset harian, dan konfirmasi ulasan customer.
          </p>
        </div>
        <div
          style={{
            backgroundColor: "#DCFCE7",
            color: "#166534",
            padding: "6px 14px",
            borderRadius: "20px",
            fontSize: "12px",
            fontWeight: 800,
            border: "1px solid #86EFAC",
          }}
        >
          ● Admin Utama
        </div>
      </header>

      <div style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Banner */}
        <div
          style={{
            backgroundColor: "#2A1A11",
            borderRadius: "20px",
            padding: "24px 32px",
            color: "#EFE3C8",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
          }}
        >
          <div>
            <h2 style={{ margin: "0 0 6px", fontSize: "20px", fontWeight: 900 }}>
              Selamat Datang, Admin Dapur!
            </h2>
            <p style={{ margin: 0, fontSize: "13px", color: "#D6C7B2", opacity: 0.9 }}>
              Dapur Soto Banjar Selera Nusantara siap melayani pesanan delivery online wilayah Jabodetabek.
            </p>
          </div>
          <a
            href="/admin/pesanan"
            style={{
              backgroundColor: "#EFE3C8",
              color: "#2A1A11",
              padding: "10px 20px",
              borderRadius: "12px",
              fontSize: "13px",
              fontWeight: 900,
              textDecoration: "none",
              boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
            }}
          >
            🔍 Cek Pesanan Masuk
          </a>
        </div>

        {/* Statistik */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
          <div style={cardStyle}>
            <div style={{ fontSize: "13px", color: "#6D4C30", fontWeight: 800 }}>Total Menu Aktif</div>
            <div style={{ fontSize: "32px", fontWeight: 900, color: "#2A1A11", marginTop: "8px" }}>23</div>
          </div>

          <div style={cardStyle}>
            <div style={{ fontSize: "13px", color: "#6D4C30", fontWeight: 800 }}>Total Pesanan Online</div>
            <div style={{ fontSize: "32px", fontWeight: 900, color: "#2A1A11", marginTop: "8px" }}>
              {loading ? "..." : totalOrders}
            </div>
          </div>

          <div style={cardStyle}>
            <div style={{ fontSize: "13px", color: "#6D4C30", fontWeight: 800 }}>Total Omset Delivery</div>
            <div style={{ fontSize: "32px", fontWeight: 900, color: "#166534", marginTop: "8px" }}>
              Rp {totalOmset.toLocaleString("id-ID")}
            </div>
          </div>
        </div>

        {/* Grafik Garis & Status */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px" }}>
          
          {/* Grafik Garis (Line Chart) */}
          <div style={{ ...cardStyle, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div style={{ fontSize: "15px", fontWeight: 900, color: "#2A1A11" }}>
                📈 Grafik Pemasukan (Garis)
              </div>
              <span style={{ fontSize: "11px", backgroundColor: "#EFE3C8", color: "#593922", padding: "4px 10px", borderRadius: "6px", fontWeight: 800 }}>
                Real-time Database
              </span>
            </div>

            <div style={{ position: "relative", width: "100%", height: "160px" }}>
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ width: "100%", height: "100%", overflow: "visible" }}>
                {/* Garis tren */}
                {polylinePoints && (
                  <polyline
                    fill="none"
                    stroke="#6B4A31"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={polylinePoints}
                  />
                )}

                {/* Titik data pada grafik */}
                {points.map((pt, idx) => (
                  <g key={idx}>
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="5"
                      fill="#FFFFFF"
                      stroke="#6B4A31"
                      strokeWidth="3"
                    />
                    <text
                      x={pt.x}
                      y={pt.y - 10}
                      fontSize="10"
                      fontWeight="bold"
                      fill="#432818"
                      textAnchor="middle"
                    >
                      {pt.amount > 0 ? `Rp ${(pt.amount / 1000).toFixed(0)}k` : "0"}
                    </text>
                    <text
                      x={pt.x}
                      y={svgHeight + 15}
                      fontSize="11"
                      fontWeight="bold"
                      fill="#6D4C30"
                      textAnchor="middle"
                    >
                      {pt.date}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </div>

          {/* Status Alur Pesanan */}
          <div style={{ ...cardStyle, display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ fontSize: "15px", fontWeight: 900, color: "#2A1A11" }}>
              📦 Status Alur Pesanan
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", flex: 1, justifyContent: "center" }}>
              <div style={subBoxStyle}>
                <span style={{ fontSize: "13px", color: "#6D4C30", fontWeight: 800 }}>Perlu Dimasak &amp; Diantar</span>
                <span style={{ fontSize: "20px", fontWeight: 900, color: "#D97706" }}>
                  {loading ? "..." : pendingOrders}
                </span>
              </div>
              <div style={subBoxStyle}>
                <span style={{ fontSize: "13px", color: "#6D4C30", fontWeight: 800 }}>Selesai Terkirim</span>
                <span style={{ fontSize: "20px", fontWeight: 900, color: "#166534" }}>
                  {loading ? "..." : completedOrders}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  backgroundColor: "#FFFFFF",
  borderRadius: "20px",
  padding: "24px",
  border: "1.5px solid #E5DEC9",
  boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
};

const subBoxStyle: React.CSSProperties = {
  backgroundColor: "#FAF6EE",
  border: "1.5px solid #E5DEC9",
  borderRadius: "14px",
  padding: "14px 18px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};