"use client";

import React, { useEffect, useMemo, useState } from "react";

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
  customerName?: string;
  recipientName?: string;
  name?: string;
  area?: string;
  deliveryArea?: string;
  service?: string;
  shippingService?: string;
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
  paymentMethod?: string;
  status?: string;
  createdAt?: string;
  items?: OrderItem[];
}

interface TopMenuStat {
  name: string;
  totalQty: number;
  totalRevenue: number;
}

// Daftar opsi bulan (1-12) dan tanggal hari (1-31) untuk filter periode omset
const MONTH_OPTIONS = [
  { value: "ALL", label: "Semua Bulan" },
  { value: "1", label: "Januari" },
  { value: "2", label: "Februari" },
  { value: "3", label: "Maret" },
  { value: "4", label: "April" },
  { value: "5", label: "Mei" },
  { value: "6", label: "Juni" },
  { value: "7", label: "Juli" },
  { value: "8", label: "Agustus" },
  { value: "9", label: "September" },
  { value: "10", label: "Oktober" },
  { value: "11", label: "November" },
  { value: "12", label: "Desember" },
] as const;

const DAY_OPTIONS = Array.from({ length: 31 }, (_, i) => String(i + 1));

function normalizeMenuDisplayName(rawName: string): string {
  return rawName
    .trim()
    .replace(/\s+/g, " ")
    .replace(/Sate\s+AYam/gi, "Sate Ayam");
}

function normalizeOrderKey(ord: OrderRecord): string {
  const raw = String(ord.orderNumber || ord.orderCode || ord.id || "");
  return raw.replace(/^#/, "").trim().toUpperCase();
}

// Menghitung total pembayaran akhir dari item, ongkir, biaya thermal bag, dan diskon
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

// Menghitung subtotal penjualan menu murni di luar ongkir
function getItemsSubtotal(ord: OrderRecord): number {
  if (Array.isArray(ord.items) && ord.items.length > 0) {
    return ord.items.reduce(
      (sum, it) =>
        sum + Number(it.price ?? 0) * Number(it.qty ?? it.quantity ?? 1),
      0
    );
  }
  return Number(ord.subtotal ?? getOrderTotal(ord));
}

// Membungkus isi kolom CSV dengan tanda kutip ganda agar aman terhadap karakter koma
function escapeOmsetCsvField(value: unknown): string {
  const str = String(value ?? "");
  return `"${str.replace(/"/g, '""')}"`;
}

// Menyusun ringkasan daftar item terjual dalam satu baris teks untuk kolom CSV
function formatItemsSummaryForCsv(ord: OrderRecord): string {
  if (!Array.isArray(ord.items) || ord.items.length === 0) {
    return "Paket Soto Banjar";
  }
  return ord.items
    .map((it) => {
      const cleanName = normalizeMenuDisplayName(
        String(it.name || it.title || "Menu")
      );
      return `${it.qty || it.quantity || 1}x ${cleanName}`;
    })
    .join("; ");
}

// Mengunduh laporan rincian omset yang sedang tampil ke dalam file CSV
function exportOmsetCsv(orderList: OrderRecord[], filterLabel: string) {
  if (!orderList.length) {
    alert("Tidak ada data transaksi omset untuk di-export.");
    return;
  }

  const headers = [
    "No",
    "Tanggal & Waktu",
    "ID Order",
    "Pelanggan",
    "Item Terjual",
    "Metode Bayar",
    "Subtotal Menu (Rp)",
    "Ongkir & Layanan (Rp)",
    "Total Masuk (Rp)",
    "Status",
  ];

  const rows = orderList.map((ord, idx) => {
    const key = normalizeOrderKey(ord);
    const codeText = key.startsWith("SBN-") ? `#${key}` : `#SBN-${key}`;
    const custName =
      ord.customerName || ord.recipientName || ord.name || "Pelanggan";
    const menuSub = getItemsSubtotal(ord);
    const shipFee = Number(ord.shippingCost ?? ord.shippingFee ?? 0);
    const totalAmt = getOrderTotal(ord);
    const st = String(ord.status || "PENDING").toUpperCase();
    const dateLabel = ord.createdAt
      ? new Date(ord.createdAt).toLocaleString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "Baru saja";

    return [
      idx + 1,
      dateLabel,
      codeText,
      custName,
      formatItemsSummaryForCsv(ord),
      ord.paymentMethod || "BCA Virtual Account",
      menuSub,
      shipFee,
      totalAmt,
      st,
    ]
      .map(escapeOmsetCsvField)
      .join(",");
  });

  const totalMasukSum = orderList.reduce((acc, o) => acc + getOrderTotal(o), 0);
  rows.push(
    ["", "", "", "", "", `TOTAL (${filterLabel})`, "", "", totalMasukSum, ""]
      .map(escapeOmsetCsvField)
      .join(",")
  );

  const csvContent =
    "\uFEFF" + [headers.map(escapeOmsetCsvField).join(","), ...rows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  const dateStamp = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.setAttribute("download", `omset-soto-banjar-${dateStamp}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Membuka dialog cetak / simpan PDF browser untuk laporan omset
function printOmsetPage() {
  window.print();
}

export default function AdminOmsetPage() {
  // State daftar pesanan, loading, filter status transaksi, filter hari/bulan/tahun, dan rentang tanggal
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [dayFilter, setDayFilter] = useState<string>("ALL");
  const [monthFilter, setMonthFilter] = useState<string>("ALL");
  const [yearFilter, setYearFilter] = useState<string>("ALL");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Memuat dan menggabungkan data pesanan dari API database
  useEffect(() => {
    let isCancelled = false;

    async function loadOrdersForOmset() {
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

        const mergedMap = new Map<string, OrderRecord>();

        for (const dbOrd of dbOrders) {
          const key = normalizeOrderKey(dbOrd);
          if (key) mergedMap.set(key, dbOrd);
        }

        for (const locOrd of localOrders) {
          const key = normalizeOrderKey(locOrd);
          if (key && !mergedMap.has(key)) {
            mergedMap.set(key, {
              ...locOrd,
              id: key,
              orderNumber: `#${key}`,
            });
          }
        }

        const combined = Array.from(mergedMap.values()).sort((a, b) => {
          const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return tB - tA;
        });

        if (!isCancelled) {
          setOrders(combined);
        }
      } catch (err) {
        console.error("Gagal memuat data omset:", err);
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    void loadOrdersForOmset();

    const handleSync = () => {
      void loadOrdersForOmset();
    };
    window.addEventListener("ordersUpdated", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      isCancelled = true;
      window.removeEventListener("ordersUpdated", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  // Mengeluarkan pesanan yang dibatalkan dari perhitungan omset
  const validOrders = useMemo(
    () =>
      orders.filter((o) => {
        const st = String(o.status || "PENDING").toUpperCase();
        return st !== "DIBATALKAN" && st !== "CANCELLED";
      }),
    [orders]
  );

  // Mengumpulkan daftar tahun dari transaksi yang tersedia untuk dropdown filter tahun
  const availableYears = useMemo(() => {
    const yearSet = new Set<string>();
    yearSet.add(String(new Date().getFullYear()));
    for (const ord of validOrders) {
      if (!ord.createdAt) continue;
      const d = new Date(ord.createdAt);
      if (!Number.isNaN(d.getTime())) {
        yearSet.add(String(d.getFullYear()));
      }
    }
    return Array.from(yearSet).sort((a, b) => Number(b) - Number(a));
  }, [validOrders]);

  // Mengecek apakah minimal satu filter periode (hari, bulan, tahun, atau rentang tanggal) sedang aktif
  const hasActiveDateFilter =
    dayFilter !== "ALL" ||
    monthFilter !== "ALL" ||
    yearFilter !== "ALL" ||
    startDate !== "" ||
    endDate !== "";

  // Menyaring transaksi valid berdasarkan hari, bulan, tahun, serta rentang Dari Tanggal - Sampai Tanggal
  const dateFilteredOrders = useMemo(() => {
    const startMs = startDate
      ? new Date(`${startDate}T00:00:00`).getTime()
      : null;
    const endMs = endDate
      ? new Date(`${endDate}T23:59:59.999`).getTime()
      : null;

    return validOrders.filter((ord) => {
      if (!hasActiveDateFilter) return true;

      if (!ord.createdAt) return false;
      const d = new Date(ord.createdAt);
      const ordMs = d.getTime();
      if (Number.isNaN(ordMs)) return false;

      if (startMs !== null && !Number.isNaN(startMs) && ordMs < startMs) {
        return false;
      }
      if (endMs !== null && !Number.isNaN(endMs) && ordMs > endMs) {
        return false;
      }

      const matchDay =
        dayFilter === "ALL" || String(d.getDate()) === dayFilter;
      const matchMonth =
        monthFilter === "ALL" || String(d.getMonth() + 1) === monthFilter;
      const matchYear =
        yearFilter === "ALL" || String(d.getFullYear()) === yearFilter;

      return matchDay && matchMonth && matchYear;
    });
  }, [
    validOrders,
    hasActiveDateFilter,
    dayFilter,
    monthFilter,
    yearFilter,
    startDate,
    endDate,
  ]);

  // Mengembalikan seluruh filter periode (hari, bulan, tahun, dan rentang tanggal) ke kondisi awal
  function handleResetDateFilter() {
    setDayFilter("ALL");
    setMonthFilter("ALL");
    setYearFilter("ALL");
    setStartDate("");
    setEndDate("");
  }

  // Menghitung ringkasan angka omset keseluruhan, selesai, berjalan, dan penjualan menu
  const summary = useMemo(() => {
    let totalGross = 0;
    let completedRevenue = 0;
    let pendingRevenue = 0;
    let totalMenuSales = 0;
    let totalShipping = 0;
    let completedCount = 0;
    let activeCount = 0;

    for (const ord of dateFilteredOrders) {
      const grand = getOrderTotal(ord);
      const menuSub = getItemsSubtotal(ord);
      const ship = Number(ord.shippingCost ?? ord.shippingFee ?? 0);
      const st = String(ord.status || "PENDING").toUpperCase();

      totalGross += grand;
      totalMenuSales += menuSub;
      totalShipping += ship;

      if (st === "SELESAI" || st === "COMPLETED" || st === "TERKIRIM") {
        completedRevenue += grand;
        completedCount += 1;
      } else {
        pendingRevenue += grand;
        activeCount += 1;
      }
    }

    return {
      totalGross,
      completedRevenue,
      pendingRevenue,
      totalMenuSales,
      totalShipping,
      totalCount: dateFilteredOrders.length,
      completedCount,
      activeCount,
    };
  }, [dateFilteredOrders]);

  // Menghitung peringkat 5 menu terlaris berdasarkan total porsi terjual pada periode aktif
  const topSellingMenus = useMemo<TopMenuStat[]>(() => {
    const map = new Map<string, TopMenuStat>();

    for (const ord of dateFilteredOrders) {
      if (!Array.isArray(ord.items)) continue;
      for (const it of ord.items) {
        const cleanName = normalizeMenuDisplayName(
          String(it.name || it.title || "")
        );
        if (!cleanName) continue;
        const qty = Number(it.qty ?? it.quantity ?? 1);
        const unitPrice = Number(it.price ?? 0);
        const key = cleanName.toLowerCase();

        const existing = map.get(key);
        if (existing) {
          existing.totalQty += qty;
          existing.totalRevenue += qty * unitPrice;
        } else {
          map.set(key, {
            name: cleanName,
            totalQty: qty,
            totalRevenue: qty * unitPrice,
          });
        }
      }
    }

    return Array.from(map.values())
      .sort((a, b) => b.totalQty - a.totalQty || b.totalRevenue - a.totalRevenue)
      .slice(0, 5);
  }, [dateFilteredOrders]);

  const maxTopQty = topSellingMenus[0]?.totalQty || 1;

  // Menyaring daftar transaksi yang ditampilkan di tabel sesuai filter status
  const displayedOrders = useMemo(() => {
    if (statusFilter === "ALL") return dateFilteredOrders;
    return dateFilteredOrders.filter((ord) => {
      const st = String(ord.status || "PENDING").toUpperCase();
      if (statusFilter === "SELESAI") {
        return st === "SELESAI" || st === "COMPLETED" || st === "TERKIRIM";
      }
      if (statusFilter === "PROSES") {
        return (
          st === "PENDING" ||
          st === "PROSES" ||
          st === "DIPROSES" ||
          st === "DIANTAR" ||
          st === "DIKIRIM"
        );
      }
      return true;
    });
  }, [dateFilteredOrders, statusFilter]);

  const activeFilterLabel = useMemo(() => {
    const statusText =
      statusFilter === "SELESAI"
        ? "Selesai"
        : statusFilter === "PROSES"
        ? "Berjalan"
        : "Semua";
    if (startDate && endDate) {
      return `${statusText} ${startDate} sd ${endDate}`;
    }
    if (startDate) {
      return `${statusText} mulai ${startDate}`;
    }
    if (endDate) {
      return `${statusText} sampai ${endDate}`;
    }
    return statusText;
  }, [statusFilter, startDate, endDate]);

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#FAF6EE",
        minHeight: "100vh",
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
            Rincian Omset &amp; Pendapatan
          </h1>
          <p
            style={{ margin: "3px 0 0", fontSize: "12.5px", color: "#6D4C30" }}
          >
            Laporan pendapatan real-time dari seluruh pesanan masuk Soto Banjar
            Selera Nusantara.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => exportOmsetCsv(displayedOrders, activeFilterLabel)}
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
            onClick={printOmsetPage}
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
            Cetak Laporan
          </button>
        </div>
      </header>

      <div
        style={{
          padding: "32px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        {/* Panel filter periode omset (Hari/Bulan/Tahun + Dari Tanggal - Sampai Tanggal) */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "18px",
            padding: "16px 20px",
            border: "1.5px solid #E5DEC9",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div
              style={{
                fontSize: "13px",
                fontWeight: 900,
                color: "#2A1A11",
              }}
            >
              Filter Periode Omset
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <select
                value={dayFilter}
                onChange={(e) => setDayFilter(e.target.value)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "10px",
                  border: "1.5px solid #D6C7B2",
                  backgroundColor: "#FAF6EE",
                  fontSize: "13px",
                  fontWeight: 800,
                  color: "#2A1A11",
                  cursor: "pointer",
                }}
              >
                <option value="ALL">Semua Hari</option>
                {DAY_OPTIONS.map((d) => (
                  <option key={d} value={d}>
                    Tanggal {d}
                  </option>
                ))}
              </select>

              <select
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "10px",
                  border: "1.5px solid #D6C7B2",
                  backgroundColor: "#FAF6EE",
                  fontSize: "13px",
                  fontWeight: 800,
                  color: "#2A1A11",
                  cursor: "pointer",
                }}
              >
                {MONTH_OPTIONS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>

              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "10px",
                  border: "1.5px solid #D6C7B2",
                  backgroundColor: "#FAF6EE",
                  fontSize: "13px",
                  fontWeight: 800,
                  color: "#2A1A11",
                  cursor: "pointer",
                }}
              >
                <option value="ALL">Semua Tahun</option>
                {availableYears.map((yr) => (
                  <option key={yr} value={yr}>
                    Tahun {yr}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Baris filter rentang tanggal Dari Tanggal - Sampai Tanggal */}
          <div
            style={{
              borderTop: "1px dashed #E5DEC9",
              paddingTop: "12px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <label
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "12.5px",
                  fontWeight: 800,
                  color: "#6D4C30",
                }}
              >
                <span>Dari Tanggal:</span>
                <input
                  type="date"
                  value={startDate}
                  max={endDate || undefined}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{
                    padding: "7px 11px",
                    borderRadius: "10px",
                    border: "1.5px solid #D6C7B2",
                    backgroundColor: "#FAF6EE",
                    fontSize: "12.5px",
                    fontWeight: 800,
                    color: "#2A1A11",
                    cursor: "pointer",
                  }}
                />
              </label>

              <label
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "12.5px",
                  fontWeight: 800,
                  color: "#6D4C30",
                }}
              >
                <span>Sampai Tanggal:</span>
                <input
                  type="date"
                  value={endDate}
                  min={startDate || undefined}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{
                    padding: "7px 11px",
                    borderRadius: "10px",
                    border: "1.5px solid #D6C7B2",
                    backgroundColor: "#FAF6EE",
                    fontSize: "12.5px",
                    fontWeight: 800,
                    color: "#2A1A11",
                    cursor: "pointer",
                  }}
                />
              </label>
            </div>

            {hasActiveDateFilter && (
              <button
                type="button"
                onClick={handleResetDateFilter}
                style={{
                  padding: "8px 14px",
                  borderRadius: "10px",
                  border: "1.5px solid #8A6B47",
                  backgroundColor: "#2A1A11",
                  color: "#EFE3C8",
                  fontSize: "12.5px",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Reset Semua Filter Tanggal
              </button>
            )}
          </div>
        </div>

        {/* Ringkasan angka omset */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
          }}
        >
          <div
            style={{
              backgroundColor: "#2A1A11",
              color: "#FAF6EE",
              borderRadius: "18px",
              padding: "20px",
              boxShadow: "0 8px 20px rgba(42,26,17,0.12)",
            }}
          >
            <div
              style={{
                fontSize: "11.5px",
                fontWeight: 800,
                color: "#D6C7B2",
                textTransform: "uppercase",
              }}
            >
              Total Omset Keseluruhan
            </div>
            <div
              style={{
                fontSize: "24px",
                fontWeight: 900,
                color: "#FDE68A",
                marginTop: "6px",
              }}
            >
              Rp {summary.totalGross.toLocaleString("id-ID")}
            </div>
            <div
              style={{ fontSize: "11.5px", color: "#E5DEC9", marginTop: "6px" }}
            >
              Dari <strong>{summary.totalCount}</strong> total transaksi masuk
            </div>
          </div>

          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "18px",
              padding: "20px",
              border: "1.5px solid #BBF7D0",
            }}
          >
            <div
              style={{
                fontSize: "11.5px",
                fontWeight: 800,
                color: "#166534",
                textTransform: "uppercase",
              }}
            >
              Omset Pesanan Selesai
            </div>
            <div
              style={{
                fontSize: "24px",
                fontWeight: 900,
                color: "#15803D",
                marginTop: "6px",
              }}
            >
              Rp {summary.completedRevenue.toLocaleString("id-ID")}
            </div>
            <div
              style={{ fontSize: "11.5px", color: "#64748B", marginTop: "6px" }}
            >
              <strong>{summary.completedCount}</strong> pesanan telah selesai
            </div>
          </div>

          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "18px",
              padding: "20px",
              border: "1.5px solid #FDE68A",
            }}
          >
            <div
              style={{
                fontSize: "11.5px",
                fontWeight: 800,
                color: "#B45309",
                textTransform: "uppercase",
              }}
            >
              Pesanan Berjalan (Pending/Diantar)
            </div>
            <div
              style={{
                fontSize: "24px",
                fontWeight: 900,
                color: "#D97706",
                marginTop: "6px",
              }}
            >
              Rp {summary.pendingRevenue.toLocaleString("id-ID")}
            </div>
            <div
              style={{ fontSize: "11.5px", color: "#64748B", marginTop: "6px" }}
            >
              <strong>{summary.activeCount}</strong> pesanan sedang diproses
            </div>
          </div>

          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "18px",
              padding: "20px",
              border: "1.5px solid #E5DEC9",
            }}
          >
            <div
              style={{
                fontSize: "11.5px",
                fontWeight: 800,
                color: "#6D4C30",
                textTransform: "uppercase",
              }}
            >
              Penjualan Makanan Murni
            </div>
            <div
              style={{
                fontSize: "24px",
                fontWeight: 900,
                color: "#2A1A11",
                marginTop: "6px",
              }}
            >
              Rp {summary.totalMenuSales.toLocaleString("id-ID")}
            </div>
            <div
              style={{ fontSize: "11.5px", color: "#6D4C30", marginTop: "6px" }}
            >
              Total Ongkir: Rp {summary.totalShipping.toLocaleString("id-ID")}
            </div>
          </div>
        </div>

        {/* Kartu statistik 5 menu terlaris berdasarkan total porsi terjual */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "20px",
            padding: "22px 24px",
            border: "1.5px solid #E5DEC9",
            boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "14px",
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: "15.5px",
                fontWeight: 900,
                color: "#2A1A11",
              }}
            >
              Menu Terlaris (Berdasarkan Porsi Terjual)
            </h3>
            <span
              style={{
                fontSize: "11.5px",
                fontWeight: 800,
                color: "#6D4C30",
              }}
            >
              Top {topSellingMenus.length} Sajian Periode Ini
            </span>
          </div>

          {topSellingMenus.length === 0 ? (
            <div
              style={{
                padding: "16px 0",
                fontSize: "12.5px",
                color: "#8A6B47",
                fontWeight: 700,
              }}
            >
              Belum ada data item terjual pada periode ini.
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              {topSellingMenus.map((stat, idx) => {
                const widthPercent = Math.max(
                  10,
                  Math.round((stat.totalQty / maxTopQty) * 100)
                );
                return (
                  <div
                    key={stat.name}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "5px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: "12.5px",
                        gap: "10px",
                      }}
                    >
                      <div style={{ fontWeight: 800, color: "#2A1A11" }}>
                        <span
                          style={{
                            display: "inline-block",
                            minWidth: "22px",
                            padding: "1px 6px",
                            marginRight: "8px",
                            borderRadius: "6px",
                            backgroundColor: idx === 0 ? "#2A1A11" : "#EFE3C8",
                            color: idx === 0 ? "#FDE68A" : "#2A1A11",
                            fontSize: "11px",
                            fontWeight: 900,
                            textAlign: "center",
                          }}
                        >
                          #{idx + 1}
                        </span>
                        {stat.name}
                      </div>
                      <div
                        style={{
                          fontWeight: 800,
                          color: "#166534",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {stat.totalQty} porsi • Rp{" "}
                        {stat.totalRevenue.toLocaleString("id-ID")}
                      </div>
                    </div>

                    <div
                      style={{
                        width: "100%",
                        height: "8px",
                        borderRadius: "999px",
                        backgroundColor: "#FAF6EE",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${widthPercent}%`,
                          height: "100%",
                          borderRadius: "999px",
                          backgroundColor: idx === 0 ? "#D97706" : "#8A6B47",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Rincian pendapatan per transaksi */}
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
              Rincian Pendapatan Per Transaksi
            </h3>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span
                style={{
                  fontSize: "12.5px",
                  fontWeight: 800,
                  color: "#6D4C30",
                }}
              >
                Filter Transaksi:
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
                <option value="ALL">Semua Transaksi Masuk</option>
                <option value="SELESAI">Hanya Pesanan Selesai</option>
                <option value="PROSES">Pesanan Berjalan (Pending/Diantar)</option>
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
              Memuat data omset...
            </div>
          ) : displayedOrders.length === 0 ? (
            <div
              style={{
                padding: "40px",
                textAlign: "center",
                color: "#8A6B47",
                fontWeight: 700,
              }}
            >
              Belum ada data transaksi untuk filter ini.
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
                    <th style={{ padding: "12px 10px" }}>Tanggal &amp; Waktu</th>
                    <th style={{ padding: "12px 10px" }}>ID Order</th>
                    <th style={{ padding: "12px 10px" }}>Pelanggan</th>
                    <th style={{ padding: "12px 10px" }}>Item Terjual</th>
                    <th style={{ padding: "12px 10px" }}>Metode Bayar</th>
                    <th style={{ padding: "12px 10px" }}>Subtotal Menu</th>
                    <th style={{ padding: "12px 10px" }}>Ongkir &amp; Layanan</th>
                    <th style={{ padding: "12px 10px" }}>Total Masuk</th>
                    <th style={{ padding: "12px 10px" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedOrders.map((ord) => {
                    const key = normalizeOrderKey(ord);
                    const codeText = key.startsWith("SBN-")
                      ? `#${key}`
                      : `#SBN-${key}`;
                    const custName =
                      ord.customerName ||
                      ord.recipientName ||
                      ord.name ||
                      "Pelanggan";
                    const menuSub = getItemsSubtotal(ord);
                    const shipFee = Number(
                      ord.shippingCost ?? ord.shippingFee ?? 0
                    );
                    const totalAmt = getOrderTotal(ord);
                    const st = String(ord.status || "PENDING").toUpperCase();
                    const isDone =
                      st === "SELESAI" ||
                      st === "COMPLETED" ||
                      st === "TERKIRIM";

                    const dateLabel = ord.createdAt
                      ? new Date(ord.createdAt).toLocaleString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Baru saja";

                    return (
                      <tr
                        key={codeText}
                        style={{
                          borderBottom: "1px solid #EFE3C8",
                          color: "#2A1A11",
                        }}
                      >
                        <td
                          style={{
                            padding: "14px 10px",
                            whiteSpace: "nowrap",
                            color: "#6D4C30",
                            fontWeight: 700,
                          }}
                        >
                          {dateLabel}
                        </td>
                        <td
                          style={{
                            padding: "14px 10px",
                            fontWeight: 900,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {codeText}
                        </td>
                        <td style={{ padding: "14px 10px", fontWeight: 800 }}>
                          {custName}
                        </td>
                        <td style={{ padding: "14px 10px" }}>
                          {Array.isArray(ord.items) && ord.items.length > 0 ? (
                            ord.items.map((it, idx) => (
                              <div
                                key={idx}
                                style={{ fontSize: "12px", fontWeight: 700 }}
                              >
                                {it.qty || it.quantity || 1}x{" "}
                                {normalizeMenuDisplayName(
                                  String(it.name || it.title || "Menu")
                                )}
                              </div>
                            ))
                          ) : (
                            <span style={{ fontSize: "12px", color: "#8A6B47" }}>
                              Paket Soto Banjar
                            </span>
                          )}
                        </td>
                        <td style={{ padding: "14px 10px", fontWeight: 700 }}>
                          {ord.paymentMethod || "BCA Virtual Account"}
                        </td>
                        <td
                          style={{
                            padding: "14px 10px",
                            fontWeight: 700,
                            whiteSpace: "nowrap",
                          }}
                        >
                          Rp {menuSub.toLocaleString("id-ID")}
                        </td>
                        <td
                          style={{
                            padding: "14px 10px",
                            fontSize: "12px",
                            color: "#6D4C30",
                            whiteSpace: "nowrap",
                          }}
                        >
                          Rp {shipFee.toLocaleString("id-ID")}
                        </td>
                        <td
                          style={{
                            padding: "14px 10px",
                            fontWeight: 900,
                            color: "#166534",
                            whiteSpace: "nowrap",
                          }}
                        >
                          Rp {totalAmt.toLocaleString("id-ID")}
                        </td>
                        <td style={{ padding: "14px 10px" }}>
                          <span
                            style={{
                              padding: "4px 10px",
                              borderRadius: "999px",
                              fontSize: "11px",
                              fontWeight: 900,
                              backgroundColor: isDone ? "#DCFCE7" : "#FEF3C7",
                              color: isDone ? "#166534" : "#B45309",
                            }}
                          >
                            {st}
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