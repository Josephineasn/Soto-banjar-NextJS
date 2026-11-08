"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";

interface DeliveryAreaItem {
  id: number;
  name: string;
  price: number;
  isActive: boolean;
}

export default function AdminDashboardPage() {
  const [totalMenu, setTotalMenu] = useState(23);
  const [totalOrders, setTotalOrders] = useState(2);
  const [totalOmset, setTotalOmset] = useState(47500);

  // State Delivery Areas dari Prisma
  const [deliveryAreas, setDeliveryAreas] = useState<DeliveryAreaItem[]>([]);
  const [loadingAreas, setLoadingAreas] = useState(true);

  // State Edit Mode
  const [isEditingRates, setIsEditingRates] = useState(false);
  const [tempPrices, setTempPrices] = useState<{ [id: number]: number }>({});
  const [saving, setSaving] = useState(false);

  async function loadDeliveryAreas() {
    try {
      setLoadingAreas(true);
      const res = await fetch("/api/delivery-areas", { cache: "no-store" });
      if (res.ok) {
        const data: DeliveryAreaItem[] = await res.json();
        setDeliveryAreas(data);

        const priceMap: { [id: number]: number } = {};
        data.forEach((item) => {
          priceMap[item.id] = item.price;
        });
        setTempPrices(priceMap);
      }
    } catch (err) {
      console.error("Gagal load delivery area:", err);
    } finally {
      setLoadingAreas(false);
    }
  }

  useEffect(() => {
    queueMicrotask(() => {
      void loadDeliveryAreas();

      async function loadStats() {
        try {
          const resMenu = await fetch("/api/menu", { cache: "no-store" });
          if (resMenu.ok) {
            const data = await resMenu.json();
            if (Array.isArray(data)) setTotalMenu(data.length);
          }

          const resOrders = await fetch("/api/orders", { cache: "no-store" });
          if (resOrders.ok) {
            const orders = await resOrders.json();
            if (Array.isArray(orders)) {
              setTotalOrders(orders.length);
              const sum = orders.reduce(
                (acc: number, curr: { totalPrice?: number }) =>
                  acc + (curr.totalPrice || 0),
                0
              );
              if (sum > 0) setTotalOmset(sum);
            }
          }
        } catch {}
      }
      void loadStats();
    });
  }, []);

  function handleStartEdit() {
    const priceMap: { [id: number]: number } = {};
    deliveryAreas.forEach((item) => {
      priceMap[item.id] = item.price;
    });
    setTempPrices(priceMap);
    setIsEditingRates(true);
  }

  function handleCancelEdit() {
    setIsEditingRates(false);
  }

  async function handleSaveRates() {
    try {
      setSaving(true);
      const updatePromises = deliveryAreas.map((area) => {
        const newPrice = Number(tempPrices[area.id]);
        if (!isNaN(newPrice) && newPrice !== area.price) {
          return fetch("/api/delivery-areas", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: area.id, price: newPrice }),
          });
        }
        return Promise.resolve(null);
      });

      await Promise.all(updatePromises);
      await loadDeliveryAreas();
      setIsEditingRates(false);
      alert("Tarif ongkir berhasil diperbarui langsung ke database Prisma!");
    } catch {
      alert("Terjadi kendala saat memperbarui tarif.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Banner Selamat Datang */}
      <div
        style={{
          background: "linear-gradient(135deg, #734F31 0%, #2E1C14 100%)",
          borderRadius: "18px",
          padding: "24px 28px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          border: "1.5px solid #E8D1A7",
          boxShadow: "0 8px 24px rgba(46, 28, 20, 0.15)",
        }}
      >
        <div>
          <h2 style={{ margin: "0 0 6px", fontSize: "20px", fontWeight: "900", color: "#FEF3C7" }}>
            Selamat Datang, Admin Dapur!
          </h2>
          <p style={{ margin: "0 0 14px", fontSize: "13px", color: "#FAF6EE", opacity: 0.9 }}>
            Dapur Soto Banjar Selera Nusantara siap melayani pesanan delivery online wilayah Jabodetabek.
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                backgroundColor: "rgba(232, 209, 167, 0.2)",
                border: "1px solid #E8D1A7",
                color: "#FEF3C7",
                fontSize: "11px",
                fontWeight: "800",
                padding: "4px 12px",
                borderRadius: "20px",
              }}
            >
              <span style={{ width: "7px", height: "7px", borderRadius: "50%", backgroundColor: "#10B981" }} />
              Dapur Delivery Buka
            </span>
            <span
              style={{
                backgroundColor: "rgba(250, 246, 238, 0.15)",
                color: "#FAF6EE",
                fontSize: "11px",
                fontWeight: "700",
                padding: "4px 12px",
                borderRadius: "20px",
              }}
            >
              Jam Layanan: 08.00 - 21.00 WIB
            </span>
          </div>
        </div>

        <Link
          href="/admin/orders"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: "#E8D1A7",
            color: "#734F31",
            padding: "11px 20px",
            borderRadius: "10px",
            fontSize: "12px",
            fontWeight: "900",
            textDecoration: "none",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            border: "1px solid #FAF6EE",
          }}
        >
          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span>Cek Pesanan Masuk</span>
        </Link>
      </div>

      {/* Kotak Statistik Ringkasan */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px" }}>
        {/* Total Menu Aktif */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "16px",
            border: "1.5px solid #E8D1A7",
            padding: "20px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            boxShadow: "0 4px 15px rgba(115, 79, 49, 0.04)",
          }}
        >
          <div
            style={{
              width: "50px",
              height: "50px",
              borderRadius: "12px",
              backgroundColor: "#FAF6EE",
              border: "1px solid #E8D1A7",
              color: "#734F31",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: "28px", fontWeight: "900", color: "#734F31" }}>
              {totalMenu}
            </h3>
            <span style={{ fontSize: "12px", color: "#9D9167", fontWeight: "700" }}>Total Menu Aktif</span>
          </div>
        </div>

        {/* Total Pesanan Online */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "16px",
            border: "1.5px solid #E8D1A7",
            padding: "20px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            boxShadow: "0 4px 15px rgba(115, 79, 49, 0.04)",
          }}
        >
          <div
            style={{
              width: "50px",
              height: "50px",
              borderRadius: "12px",
              backgroundColor: "#FAF6EE",
              border: "1px solid #E8D1A7",
              color: "#734F31",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
            </svg>
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: "28px", fontWeight: "900", color: "#734F31" }}>
              {totalOrders}
            </h3>
            <span style={{ fontSize: "12px", color: "#9D9167", fontWeight: "700" }}>Total Pesanan Online</span>
          </div>
        </div>

        {/* Total Omset Delivery */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "16px",
            border: "1.5px solid #E8D1A7",
            padding: "20px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            boxShadow: "0 4px 15px rgba(115, 79, 49, 0.04)",
          }}
        >
          <div
            style={{
              width: "50px",
              height: "50px",
              borderRadius: "12px",
              backgroundColor: "#FAF6EE",
              border: "1px solid #E8D1A7",
              color: "#734F31",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <line x1="6" y1="12" x2="6" y2="12" />
              <line x1="18" y1="12" x2="18" y2="12" />
            </svg>
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: "24px", fontWeight: "900", color: "#734F31" }}>
              Rp {totalOmset.toLocaleString("id-ID")}
            </h3>
            <span style={{ fontSize: "12px", color: "#9D9167", fontWeight: "700" }}>Total Omset Delivery</span>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "24px" }}>
        {/* Status Pesanan */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "16px",
            border: "1.5px solid #E8D1A7",
            padding: "24px",
            boxShadow: "0 4px 15px rgba(115, 79, 49, 0.04)",
          }}
        >
          <h4
            style={{
              margin: "0 0 16px",
              fontSize: "15px",
              fontWeight: "900",
              color: "#734F31",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
            Status Alur Pesanan
          </h4>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div
              style={{
                backgroundColor: "#FAF6EE",
                border: "1px solid #E8D1A7",
                borderRadius: "12px",
                padding: "16px",
              }}
            >
              <span style={{ fontSize: "11px", fontWeight: "800", color: "#734F31", display: "block", marginBottom: "4px" }}>
                Perlu Dimasak &amp; Diantar
              </span>
              <strong style={{ fontSize: "28px", fontWeight: "900", color: "#734F31", display: "block" }}>
                1
              </strong>
              <span style={{ fontSize: "11px", color: "#9D9167", fontWeight: "700" }}>Status: Diproses</span>
            </div>

            <div
              style={{
                backgroundColor: "#FAF6EE",
                border: "1px solid #E8D1A7",
                borderRadius: "12px",
                padding: "16px",
              }}
            >
              <span style={{ fontSize: "11px", fontWeight: "800", color: "#734F31", display: "block", marginBottom: "4px" }}>
                Selesai Terkirim
              </span>
              <strong style={{ fontSize: "28px", fontWeight: "900", color: "#734F31", display: "block" }}>
                0
              </strong>
              <span style={{ fontSize: "11px", color: "#9D9167", fontWeight: "700" }}>Tiba di Customer</span>
            </div>
          </div>
        </div>

        {/* Jangkauan Kurir & Tarif */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "16px",
            border: "1.5px solid #E8D1A7",
            padding: "24px",
            boxShadow: "0 4px 15px rgba(115, 79, 49, 0.04)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <h4
              style={{
                margin: 0,
                fontSize: "15px",
                fontWeight: "900",
                color: "#734F31",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <svg
                width="18"
                height="18"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Jangkauan Kurir &amp; Tarif
            </h4>

            {/* Tombol elola Tarif */}
            {!isEditingRates ? (
              <button
                type="button"
                onClick={handleStartEdit}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  backgroundColor: "#734F31",
                  color: "#FAF6EE",
                  border: "1px solid #E8D1A7",
                  fontSize: "12px",
                  fontWeight: "800",
                  cursor: "pointer",
                  padding: "7px 14px",
                  borderRadius: "8px",
                  boxShadow: "0 3px 10px rgba(115, 79, 49, 0.2)",
                  transition: "all 0.2s ease",
                }}
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
                <span>Kelola Daerah &amp; Tarif</span>
              </button>
            ) : (
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSaveRates}
                  style={{
                    backgroundColor: "#166534",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: "8px",
                    padding: "7px 14px",
                    fontSize: "12px",
                    fontWeight: "800",
                    cursor: saving ? "not-allowed" : "pointer",
                    boxShadow: "0 2px 8px rgba(22, 101, 52, 0.2)",
                  }}
                >
                  {saving ? "Menyimpan..." : "✓ Simpan Tarif"}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  style={{
                    backgroundColor: "#FAF6EE",
                    color: "#734F31",
                    border: "1px solid #E8D1A7",
                    borderRadius: "8px",
                    padding: "7px 12px",
                    fontSize: "12px",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  Batal
                </button>
              </div>
            )}
          </div>

          <p style={{ margin: "0 0 14px", fontSize: "12px", color: "#9D9167" }}>
            {isEditingRates
              ? "Ubah angka tarif ongkir di bawah ini lalu klik Simpan Tarif untuk menyinkronkan ke database Prisma:"
              : "Tarif standar ongkos kirim delivery per area yang aktif di database:"}
          </p>

          {loadingAreas ? (
            <div style={{ padding: "20px", textAlign: "center", fontSize: "12px", color: "#9D9167" }}>
              Memuat data daerah pengiriman...
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "10px",
                maxHeight: "260px",
                overflowY: "auto",
                paddingRight: "4px",
              }}
            >
              {deliveryAreas.map((area) => (
                <div
                  key={area.id}
                  style={{
                    backgroundColor: "#FAF6EE",
                    border: "1px solid #E8D1A7",
                    borderRadius: "8px",
                    padding: "10px 12px",
                    fontSize: "12px",
                    color: "#734F31",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  {!isEditingRates ? (
                    <div>
                      • {area.name} (<strong>Rp {area.price.toLocaleString("id-ID")}</strong>)
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <span style={{ fontWeight: "700", fontSize: "11px", color: "#734F31" }}>
                        • {area.name}:
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <span style={{ fontSize: "11px", fontWeight: "700" }}>Rp</span>
                        <input
                          type="number"
                          value={tempPrices[area.id] ?? area.price}
                          onChange={(e) =>
                            setTempPrices({
                              ...tempPrices,
                              [area.id]: Number(e.target.value),
                            })
                          }
                          style={{
                            width: "100%",
                            padding: "4px 6px",
                            borderRadius: "6px",
                            border: "1px solid #734F31",
                            backgroundColor: "#FFFFFF",
                            fontSize: "12px",
                            fontWeight: "800",
                            color: "#734F31",
                            outline: "none",
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}