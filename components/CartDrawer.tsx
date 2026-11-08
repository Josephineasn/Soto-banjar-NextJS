"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { CartItem } from "@/types";

interface DeliveryArea {
  id: number;
  name: string;
  price: number;
  isActive?: boolean;
}

interface ShippingServiceItem {
  id: number;
  name: string;
  price: number;
  isActive?: boolean;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQty: (id: number, delta: number) => void;
  onRemoveItem: (id: number) => void;
  onClearCart: () => void;
}

const defaultAreas: DeliveryArea[] = [
  { id: 1, name: "Jakarta Utara", price: 8000 },
  { id: 2, name: "Jakarta Barat", price: 10000 },
  { id: 3, name: "Jakarta Selatan", price: 22000 },
  { id: 4, name: "Jakarta Pusat", price: 15000 },
  { id: 5, name: "Bekasi Kota / Bekasi Barat", price: 18000 },
  { id: 6, name: "Kabupaten Bekasi", price: 20000 },
  { id: 7, name: "Tangerang / Tangerang Selatan", price: 25000 },
  { id: 8, name: "Bogor", price: 30000 },
  { id: 9, name: "Depok", price: 32000 },
];

const defaultServices: ShippingServiceItem[] = [
  { id: 1, name: "Kurir Instant (Termasuk)", price: 0 },
  { id: 2, name: "Kurir Sameday / Cepat", price: 5000 },
  { id: 3, name: "Kurir Reguler Hemat", price: 0 },
];

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
}: CartDrawerProps) {
  const [areas, setAreas] = useState<DeliveryArea[]>(defaultAreas);
  const [services, setServices] = useState<ShippingServiceItem[]>(defaultServices);

  const [selectedAreaId, setSelectedAreaId] = useState<number>(1);
  const [selectedServiceId, setSelectedServiceId] = useState<number>(1);

  // Form Fields
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [fullAddress, setFullAddress] = useState("");
  const [addressBenchmark, setAddressBenchmark] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [voucherCode, setVoucherCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [voucherApplied, setVoucherApplied] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("GOPAY");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [resArea, resService] = await Promise.all([
          fetch("/api/delivery-areas", { cache: "no-store" }),
          fetch("/api/shipping-services", { cache: "no-store" }),
        ]);

        if (resArea.ok) {
          const areaData = await resArea.json();
          if (Array.isArray(areaData) && areaData.length > 0) {
            setAreas(areaData);
            setSelectedAreaId(areaData[0].id);
          }
        }

        if (resService.ok) {
          const serviceData = await resService.json();
          if (Array.isArray(serviceData) && serviceData.length > 0) {
            setServices(serviceData);
            setSelectedServiceId(serviceData[0].id);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }

    if (isOpen) {
      void loadData();
      queueMicrotask(() => {
        const savedUser = localStorage.getItem("soto_customer_user");
        if (savedUser) {
          setRecipientName((prev) => (prev ? prev : savedUser));
        }
      });
    }
  }, [isOpen]);

  // Perhitungan Subtotal, Ongkir, dan Grand Total
  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + (Number(item.price) || 0) * (Number(item.qty) || 0), 0);
  }, [cart]);

  const currentArea = useMemo(() => {
    return areas.find((a) => Number(a.id) === Number(selectedAreaId)) || areas[0] || { name: "Jakarta", price: 8000 };
  }, [areas, selectedAreaId]);

  const currentService = useMemo(() => {
    return services.find((s) => Number(s.id) === Number(selectedServiceId)) || services[0] || { name: "Kurir Instant", price: 0 };
  }, [services, selectedServiceId]);

  const areaPrice = Number(currentArea?.price) || 0;
  const servicePrice = Number(currentService?.price) || 0;
  const deliveryFee = areaPrice + servicePrice;
  const grandTotal = Math.max(0, subtotal + deliveryFee - discount);

  function handleApplyVoucher() {
    const code = voucherCode.trim().toUpperCase();
    if (code === "ONGKIRHEMAT" || code === "SOTOBANJAR") {
      setDiscount(areaPrice > 0 ? areaPrice : 5000);
      setVoucherApplied(true);
      alert("Voucher berhasil digunakan!");
    } else {
      alert("Kode voucher tidak valid.");
    }
  }

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    if (cart.length === 0) {
      alert("Keranjang pesanan masih kosong.");
      return;
    }

    if (!recipientName.trim() || !recipientPhone.trim() || !fullAddress.trim()) {
      alert("Mohon lengkapi nama penerima, nomor kontak, dan alamat pengiriman.");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        customerName: recipientName.trim(),
        customerPhone: recipientPhone.trim(),
        address: `${fullAddress.trim()}${addressBenchmark ? ` (Patokan: ${addressBenchmark.trim()})` : ""}`,
        area: currentArea.name,
        service: currentService.name,
        notes: orderNotes.trim(),
        paymentMethod,
        totalPrice: grandTotal,
        items: cart.map((c) => ({
          id: c.id,
          name: c.name,
          qty: c.qty,
          price: c.price,
        })),
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("Pesanan berhasil dibuat! Dapur Soto Banjar segera memproses sajian Anda.");
        onClearCart();
        onClose();
      } else {
        alert("Gagal memproses pesanan.");
      }
    } catch {
      alert("Terjadi kendala jaringan.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.65)",
        zIndex: 130,
        display: "flex",
        justifyContent: "flex-end",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "460px",
          height: "100%",
          backgroundColor: "#FAF6EE",
          display: "flex",
          flexDirection: "column",
          boxShadow: "-8px 0 25px rgba(0, 0, 0, 0.15)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #EFE6D8",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "#FAF6EE",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "20px",
              fontWeight: "900",
              color: "#4A2F1C",
            }}
          >
            Keranjang Belanja
          </h2>

          <button
            type="button"
            onClick={onClose}
            style={{
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#FFFFFF",
              border: "1px solid #D5C7B7",
              borderRadius: "8px",
              color: "#4A2F1C",
              fontSize: "14px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
          {/* Daftar Item Menu */}
          {cart.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#8D6E63" }}>
              <p style={{ margin: 0, fontSize: "14px", fontWeight: "700" }}>Keranjang Anda masih kosong.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "20px" }}>
              {cart.map((item) => (
                <div
                  key={item.id}
                  style={{
                    borderBottom: "1px solid #EFE6D8",
                    paddingBottom: "16px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                    <strong style={{ fontSize: "14px", color: "#2E1C14" }}>
                      {item.name}
                    </strong>
                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.id)}
                      style={{
                        backgroundColor: "#FEE2E2",
                        color: "#DC2626",
                        border: "none",
                        borderRadius: "6px",
                        padding: "2px 8px",
                        fontSize: "11px",
                        fontWeight: "700",
                        cursor: "pointer",
                      }}
                    >
                      Hapus
                    </button>
                  </div>

                  <span style={{ fontSize: "12px", color: "#8D6E63", display: "block", marginBottom: "10px" }}>
                    Rp {Number(item.price).toLocaleString("id-ID")}
                  </span>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    {/* Tombol Kuantitas [- 1 +] */}
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #E5D9C5",
                        borderRadius: "8px",
                        padding: "2px 6px",
                        gap: "10px",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => onUpdateQty(item.id, -1)}
                        style={{ background: "none", border: "none", color: "#4A2F1C", cursor: "pointer", fontWeight: "bold", fontSize: "14px", padding: "0 4px" }}
                      >
                        -
                      </button>
                      <span style={{ fontSize: "12px", fontWeight: "800", color: "#2E1C14", minWidth: "14px", textAlign: "center" }}>
                        {item.qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUpdateQty(item.id, 1)}
                        style={{ background: "none", border: "none", color: "#4A2F1C", cursor: "pointer", fontWeight: "bold", fontSize: "14px", padding: "0 4px" }}
                      >
                        +
                      </button>
                    </div>

                    <strong style={{ fontSize: "13px", color: "#2E1C14" }}>
                      Rp {(Number(item.price) * Number(item.qty)).toLocaleString("id-ID")}
                    </strong>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Form Checkout */}
          {cart.length > 0 && (
            <form onSubmit={handleCheckout} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {/* Nama Lengkap Penerima */}
              <div>
                <input
                  type="text"
                  required
                  placeholder="Nama lengkap penerima"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: "10px",
                    border: "1px solid #E5D9C5",
                    backgroundColor: "#FFFFFF",
                    fontSize: "12px",
                    color: "#2E1C14",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Nomor WhatsApp */}
              <div>
                <input
                  type="tel"
                  required
                  placeholder="Nomor WhatsApp / telepon penerima"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: "10px",
                    border: "1px solid #E5D9C5",
                    backgroundColor: "#FFFFFF",
                    fontSize: "12px",
                    color: "#2E1C14",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Alamat Lengkap */}
              <div>
                <textarea
                  rows={3}
                  required
                  placeholder="Alamat lengkap"
                  value={fullAddress}
                  onChange={(e) => setFullAddress(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: "10px",
                    border: "1px solid #E5D9C5",
                    backgroundColor: "#FFFFFF",
                    fontSize: "12px",
                    color: "#2E1C14",
                    outline: "none",
                    boxSizing: "border-box",
                    resize: "none",
                  }}
                />
              </div>

              {/* Patokan Alamat */}
              <div>
                <input
                  type="text"
                  placeholder="Patokan alamat (opsional)"
                  value={addressBenchmark}
                  onChange={(e) => setAddressBenchmark(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: "10px",
                    border: "1px solid #E5D9C5",
                    backgroundColor: "#FFFFFF",
                    fontSize: "12px",
                    color: "#2E1C14",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Area Pengiriman */}
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "800", color: "#4A2F1C", marginBottom: "6px" }}>
                  Area Pengiriman
                </label>
                <select
                  value={selectedAreaId}
                  onChange={(e) => setSelectedAreaId(Number(e.target.value))}
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: "10px",
                    border: "1px solid #E5D9C5",
                    backgroundColor: "#FFFFFF",
                    fontSize: "12px",
                    color: "#2E1C14",
                    fontWeight: "600",
                    outline: "none",
                  }}
                >
                  {areas.map((area) => (
                    <option key={area.id} value={area.id}>
                      {area.name} (Rp {Number(area.price).toLocaleString("id-ID")})
                    </option>
                  ))}
                </select>
              </div>

              {/* Layanan Pengiriman */}
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "800", color: "#4A2F1C", marginBottom: "6px" }}>
                  Layanan Pengiriman
                </label>
                <select
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(Number(e.target.value))}
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: "10px",
                    border: "1px solid #E5D9C5",
                    backgroundColor: "#FFFFFF",
                    fontSize: "12px",
                    color: "#2E1C14",
                    fontWeight: "600",
                    outline: "none",
                  }}
                >
                  {services.map((srv) => (
                    <option key={srv.id} value={srv.id}>
                      {srv.name} {Number(srv.price) > 0 ? `(+Rp ${Number(srv.price).toLocaleString("id-ID")})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Catatan Pesanan */}
              <div>
                <input
                  type="text"
                  placeholder="Catatan pesanan (opsional)"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: "10px",
                    border: "1px solid #E5D9C5",
                    backgroundColor: "#FFFFFF",
                    fontSize: "12px",
                    color: "#2E1C14",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Voucher Promo */}
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "800", color: "#4A2F1C", marginBottom: "6px" }}>
                  Voucher Promo
                </label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    placeholder="SOTOBANJAR / ONGKIRHEMAT"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                    style={{
                      flex: 1,
                      padding: "10px 14px",
                      borderRadius: "10px",
                      border: "1px solid #E5D9C5",
                      backgroundColor: "#FFFFFF",
                      fontSize: "12px",
                      color: "#2E1C14",
                      outline: "none",
                      textTransform: "uppercase",
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleApplyVoucher}
                    style={{
                      padding: "10px 18px",
                      backgroundColor: "#958156",
                      color: "#FFFFFF",
                      border: "none",
                      borderRadius: "10px",
                      fontSize: "12px",
                      fontWeight: "700",
                      cursor: "pointer",
                    }}
                  >
                    Gunakan
                  </button>
                </div>
              </div>

              {/* Pilihan Pembayaran */}
              <div style={{ marginTop: "10px" }}>
                <h4 style={{ margin: "0 0 4px", fontSize: "13px", fontWeight: "900", color: "#4A2F1C", letterSpacing: "0.5px" }}>
                  PILIHAN PEMBAYARAN
                </h4>
                <span style={{ fontSize: "11px", fontWeight: "800", color: "#958156", display: "block", marginBottom: "8px" }}>
                  E-WALLET
                </span>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "12px 14px",
                      borderRadius: "10px",
                      border: paymentMethod === "GOPAY" ? "1.5px solid #734F31" : "1px solid #E5D9C5",
                      backgroundColor: "#FFFFFF",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: "800",
                      color: "#2E1C14",
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="GOPAY"
                      checked={paymentMethod === "GOPAY"}
                      onChange={() => setPaymentMethod("GOPAY")}
                      style={{ accentColor: "#734F31" }}
                    />
                    Dana
                  </label>

                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "12px 14px",
                      borderRadius: "10px",
                      border: paymentMethod === "GOPAY" ? "1.5px solid #734F31" : "1px solid #E5D9C5",
                      backgroundColor: "#FFFFFF",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: "800",
                      color: "#2E1C14",
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="GOPAY"
                      checked={paymentMethod === "GOPAY"}
                      onChange={() => setPaymentMethod("GOPAY")}
                      style={{ accentColor: "#734F31" }}
                    />
                    Ovo
                  </label>

                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "12px 14px",
                      borderRadius: "10px",
                      border: paymentMethod === "GOPAY" ? "1.5px solid #734F31" : "1px solid #E5D9C5",
                      backgroundColor: "#FFFFFF",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: "800",
                      color: "#2E1C14",
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="GOPAY"
                      checked={paymentMethod === "GOPAY"}
                      onChange={() => setPaymentMethod("GOPAY")}
                      style={{ accentColor: "#734F31" }}
                    />
                    GoPay
                  </label>

                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "12px 14px",
                      borderRadius: "10px",
                      border: paymentMethod === "SPAY" ? "1.5px solid #734F31" : "1px solid #E5D9C5",
                      backgroundColor: "#FFFFFF",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: "800",
                      color: "#2E1C14",
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="SPAY"
                      checked={paymentMethod === "SPAY"}
                      onChange={() => setPaymentMethod("SPAY")}
                      style={{ accentColor: "#734F31" }}
                    />
                    ShopeePay (SPAY)
                  </label>

                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "12px 14px",
                      borderRadius: "10px",
                      border: paymentMethod === "QRIS" ? "1.5px solid #734F31" : "1px solid #E5D9C5",
                      backgroundColor: "#FFFFFF",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: "800",
                      color: "#2E1C14",
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="QRIS"
                      checked={paymentMethod === "QRIS"}
                      onChange={() => setPaymentMethod("QRIS")}
                      style={{ accentColor: "#734F31" }}
                    />
                    QRIS All Payment
                  </label>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: "#FFFFFF",
                  padding: "16px",
                  borderRadius: "12px",
                  border: "1px solid #E5D9C5",
                  marginTop: "8px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  fontSize: "12px",
                  color: "#64748B",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Subtotal Pesanan:</span>
                  <span style={{ fontWeight: "700", color: "#2E1C14" }}>
                    Rp {subtotal.toLocaleString("id-ID")}
                  </span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Ongkos Kirim ({currentArea.name}):</span>
                  <span style={{ fontWeight: "700", color: "#2E1C14" }}>
                    Rp {deliveryFee.toLocaleString("id-ID")}
                  </span>
                </div>

                {voucherApplied && discount > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#166534" }}>
                    <span>Diskon Promo:</span>
                    <span style={{ fontWeight: "700" }}>- Rp {discount.toLocaleString("id-ID")}</span>
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    borderTop: "1px dashed #E5D9C5",
                    paddingTop: "8px",
                    marginTop: "4px",
                  }}
                >
                  <strong style={{ fontSize: "14px", color: "#4A2F1C" }}>Total Pembayaran:</strong>
                  <strong style={{ fontSize: "16px", color: "#4A2F1C" }}>
                    Rp {grandTotal.toLocaleString("id-ID")}
                  </strong>
                </div>
              </div>

              {/* Tombol Konfirmasi Pesanan */}
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: "100%",
                  padding: "13px",
                  backgroundColor: "#734F31",
                  color: "#FAF6EE",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "13px",
                  fontWeight: "800",
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  marginTop: "8px",
                  marginBottom: "16px",
                  boxShadow: "0 4px 12px rgba(115, 79, 49, 0.2)",
                }}
              >
                {isSubmitting ? "Memproses Pesanan..." : "Konfirmasi & Pesan Sekarang →"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}