
"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import type { CartItem } from "@/types";

import {
  DELIVERY_AREAS,
  COURIER_SERVICES,
} from "@/data/menu";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQty: (id: number, change: number) => void;
  onRemoveItem: (id: number) => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQty,
  onRemoveItem,
}: CartDrawerProps) {
  // State data pemesan
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [benchmark, setBenchmark] = useState("");
  const [notes, setNotes] = useState("");

  // State pengiriman
  const [areaId, setAreaId] = useState(
    DELIVERY_AREAS[0]?.id ?? ""
  );

  const [courierId, setCourierId] = useState(
    COURIER_SERVICES[0]?.id ?? ""
  );

  // State checkout
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");

  // Mengambil area dan kurir yang dipilih
  const selectedArea = DELIVERY_AREAS.find(
    (area) => area.id === areaId
  );

  const selectedCourier = COURIER_SERVICES.find(
    (courier) => courier.id === courierId
  );

  // Perhitungan pembayaran
  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.qty,
    0
  );

  const shippingFee =
    (selectedArea?.fee ?? 0) +
    (selectedCourier?.extra ?? 0);

  const serviceFee = 2000;

  const total = subtotal + shippingFee + serviceFee;

  // Format harga Rupiah
  function formatRupiah(value: number) {
    return `Rp ${value.toLocaleString("id-ID")}`;
  }

  // Styling input
  const inputStyle: CSSProperties = {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #fdba74",
    backgroundColor: "#ffffff",
    color: "#431407",
    outline: "none",
    fontSize: "14px",
  };

  // Proses checkout ke database Prisma
  async function checkout() {
    if (loading || success || cart.length === 0) return;

    if (!name.trim() || !phone.trim() || !address.trim()) {
      setMessage(
        "Lengkapi nama, nomor HP, dan alamat pengiriman."
      );
      return;
    }

    if (!/^\+?[0-9 -]{8,18}$/.test(phone.trim())) {
      setMessage("Format nomor HP tidak valid.");
      return;
    }

    if (!selectedArea || !selectedCourier) {
      setMessage("Silakan pilih area dan kurir pengiriman.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          recipientName: name.trim(),
          recipientPhone: phone.trim(),
          fullAddress: address.trim(),
          addressBenchmark: benchmark.trim(),

          areaId: areaId,
          courierId: courierId,

          deliveryTime: "Secepatnya",
          paymentMethod: "COD",
          notes: notes.trim(),

          items: cart.map((item) => ({
            id: item.id,
            qty: item.qty,
          })),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Gagal membuat pesanan."
        );
      }

      setOrderId(result.id);
      setSuccess(true);
      setMessage("Pesanan berhasil dibuat!");

    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat checkout."
      );
    } finally {
      setLoading(false);
    }
  }

  // Drawer tidak ditampilkan jika ditutup
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "flex-end",
      }}
    >
      {/* Panel Keranjang */}
      <div
        style={{
          width: "100%",
          maxWidth: "450px",
          height: "100%",
          backgroundColor: "#fffdf7",
          padding: "24px",
          overflowY: "auto",
          color: "#431407",
          boxShadow: "-5px 0 20px rgba(0,0,0,0.15)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "25px",
          }}
        >
          <h2
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: "#9a3412",
            }}
          >
            Keranjang Belanja
          </h2>

          <button
            type="button"
            onClick={onClose}
            style={{
              backgroundColor: "#ffedd5",
              padding: "8px 12px",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        {/* Daftar Produk */}
        {cart.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "30px",
              color: "#92400e",
            }}
          >
            Keranjang masih kosong.
          </div>
        ) : (
          cart.map((item) => (
            <div
              key={item.id}
              style={{
                borderBottom: "1px solid #fed7aa",
                padding: "15px 0",
              }}
            >
              <h3 style={{ fontWeight: "bold" }}>
                {item.name}
              </h3>

              <p style={{ marginTop: "5px" }}>
                {formatRupiah(item.price)}
              </p>

              {/* Tombol jumlah produk */}
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  marginTop: "12px",
                  alignItems: "center",
                }}
              >
                <button
                  type="button"
                  disabled={success || loading}
                  onClick={() => onUpdateQty(item.id, -1)}
                  style={{
                    backgroundColor: "#ffedd5",
                    padding: "5px 12px",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  −
                </button>

                <strong>{item.qty}</strong>

                <button
                  type="button"
                  disabled={success || loading}
                  onClick={() => onUpdateQty(item.id, 1)}
                  style={{
                    backgroundColor: "#ffedd5",
                    padding: "5px 12px",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  +
                </button>

                <button
                  type="button"
                  disabled={success || loading}
                  onClick={() => onRemoveItem(item.id)}
                  style={{
                    marginLeft: "auto",
                    color: "#dc2626",
                    cursor: "pointer",
                  }}
                >
                  Hapus
                </button>
              </div>

              <p
                style={{
                  marginTop: "10px",
                  fontWeight: "bold",
                }}
              >
                {formatRupiah(item.price * item.qty)}
              </p>
            </div>
          ))
        )}

        {/* Form Checkout */}
        {cart.length > 0 && !success && (
          <>
            <h3
              style={{
                fontSize: "20px",
                fontWeight: "bold",
                marginTop: "30px",
                marginBottom: "15px",
              }}
            >
              Data Pemesan
            </h3>

            <div
              style={{
                display: "grid",
                gap: "12px",
              }}
            >
              {/* Nama */}
              <input
                style={inputStyle}
                placeholder="Nama penerima"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              {/* Nomor HP */}
              <input
                type="tel"
                style={inputStyle}
                placeholder="Nomor HP"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />

              {/* Alamat */}
              <textarea
                style={inputStyle}
                placeholder="Alamat lengkap"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
              />

              {/* Patokan alamat */}
              <input
                style={inputStyle}
                placeholder="Patokan alamat (opsional)"
                value={benchmark}
                onChange={(e) => setBenchmark(e.target.value)}
              />

              {/* Area Pengiriman */}
              <label style={{ fontWeight: "bold" }}>
                Area Pengiriman
              </label>

              <select
                style={inputStyle}
                value={areaId}
                onChange={(e) => setAreaId(e.target.value)}
              >
                {DELIVERY_AREAS.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.name} - {formatRupiah(area.fee)}
                  </option>
                ))}
              </select>

              {/* Kurir */}
              <label style={{ fontWeight: "bold" }}>
                Layanan Pengiriman
              </label>

              <select
                style={inputStyle}
                value={courierId}
                onChange={(e) => setCourierId(e.target.value)}
              >
                {COURIER_SERVICES.map((courier) => (
                  <option key={courier.id} value={courier.id}>
                    {courier.name} - Tambahan{" "}
                    {formatRupiah(courier.extra)}
                  </option>
                ))}
              </select>

              {/* Catatan */}
              <textarea
                style={inputStyle}
                placeholder="Catatan pesanan (opsional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>

            {/* Rincian Pembayaran */}
            <div
              style={{
                marginTop: "30px",
                padding: "18px",
                backgroundColor: "#fff7ed",
                borderRadius: "12px",
                border: "1px solid #fed7aa",
              }}
            >
              <h3
                style={{
                  fontWeight: "bold",
                  marginBottom: "15px",
                }}
              >
                Rincian Pembayaran
              </h3>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "10px",
                }}
              >
                <span>Subtotal</span>
                <span>{formatRupiah(subtotal)}</span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "10px",
                }}
              >
                <span>Ongkos Kirim</span>
                <span>{formatRupiah(shippingFee)}</span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "10px",
                }}
              >
                <span>Biaya Layanan</span>
                <span>{formatRupiah(serviceFee)}</span>
              </div>

              <hr
                style={{
                  margin: "15px 0",
                  borderColor: "#fed7aa",
                }}
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontWeight: "bold",
                  fontSize: "20px",
                  color: "#9a3412",
                }}
              >
                <span>Total</span>
                <span>{formatRupiah(total)}</span>
              </div>

              <p
                style={{
                  marginTop: "12px",
                  fontSize: "12px",
                }}
              >
                Metode pembayaran: Cash on Delivery (COD)
              </p>
            </div>

            {/* Tombol Checkout */}
            <button
              type="button"
              disabled={loading}
              onClick={checkout}
              style={{
                width: "100%",
                backgroundColor: "#ea580c",
                color: "white",
                padding: "15px",
                borderRadius: "10px",
                marginTop: "20px",
                fontWeight: "bold",
                cursor: loading ? "wait" : "pointer",
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading
                ? "Memproses Pesanan..."
                : `Checkout - ${formatRupiah(total)}`}
            </button>
          </>
        )}

        {/* Notifikasi */}
        {message && (
          <div
            style={{
              marginTop: "20px",
              padding: "15px",
              borderRadius: "10px",
              backgroundColor: success
                ? "#dcfce7"
                : "#fee2e2",
              color: success ? "#166534" : "#991b1b",
              overflowWrap: "anywhere",
            }}
          >
            <p>{message}</p>

            {success && (
              <p
                style={{
                  marginTop: "10px",
                  fontWeight: "bold",
                }}
              >
                ID Pesanan: {orderId}
              </p>
            )}
          </div>
        )}

        {success && (
          <p
            style={{
              marginTop: "12px",
              fontSize: "13px",
            }}
          >
            Simpan ID pesanan untuk melihat status pesanan.
          </p>
        )}
      </div>
    </div>
  );
}
