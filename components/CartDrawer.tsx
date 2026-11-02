"use client";

import React, { useEffect, useState } from "react";
import type { CartItem } from "@/types";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQty: (id: number, change: number) => void;
  onRemoveItem: (id: number) => void;
  onClearCart: () => void;
}

interface DeliveryAreaItem {
  id: number;
  name: string;
  price: number;
}

interface ShippingServiceItem {
  id: number;
  name: string;
  extraPrice: number;
}

const paymentCategories = [
  {
    category: "E-WALLET",
    options: [
      { id: "gopay", label: "GoPay" },
      { id: "ovo", label: "OVO" },
      { id: "spay", label: "ShopeePay (SPay)" },
      { id: "dana", label: "DANA" },
    ],
  },
  {
    category: "VIRTUAL ACCOUNT (VA)",
    options: [
      { id: "bca_va", label: "BCA Virtual Account" },
      { id: "mandiri_va", label: "Mandiri Virtual Account" },
      { id: "blu_va", label: "Blu Virtual Account" },
    ],
  },
];

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
}: CartDrawerProps) {
  // Input Kontak & Alamat
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [address, setAddress] = useState("");
  const [addressBenchmark, setAddressBenchmark] = useState("");
  const [orderNotes, setOrderNotes] = useState("");

  // Data Ongkir Murni dari Database SQLite (Tanpa Data Hardcode)
  const [areas, setAreas] = useState<DeliveryAreaItem[]>([]);
  const [services, setServices] = useState<ShippingServiceItem[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState<number | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [loadingShipping, setLoadingShipping] = useState(true);

  // Voucher & Pembayaran
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<{ code: string; discount: number } | null>(null);
  const [voucherMsg, setVoucherMsg] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("gopay");

  // State Submit & Transaksi Sukses
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccessId, setOrderSuccessId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Mengambil Data Area & Layanan Langsung dari Database SQLite via API
  useEffect(() => {
    async function fetchShippingData() {
      try {
        setLoadingShipping(true);
        const res = await fetch("/api/shipping", { cache: "no-store" });
        if (!res.ok) throw new Error();
        const data = await res.json();

        if (data.areas && data.areas.length > 0) {
          setAreas(data.areas);
          setSelectedAreaId(data.areas[0].id);
        }
        if (data.services && data.services.length > 0) {
          setServices(data.services);
          setSelectedServiceId(data.services[0].id);
        }
      } catch {
        setErrorMsg("Gagal memuat tarif ongkir dari database.");
      } finally {
        setLoadingShipping(false);
      }
    }

    if (isOpen) {
      void fetchShippingData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Kalkulasi Harga
  const subtotal = cart.reduce((total, item) => total + item.price * item.qty, 0);

  const selectedArea = areas.find((a) => a.id === selectedAreaId);
  const selectedService = services.find((s) => s.id === selectedServiceId);

  const baseShipping = selectedArea ? selectedArea.price : 0;
  const extraShipping = selectedService ? selectedService.extraPrice : 0;
  const totalShipping = cart.length > 0 ? baseShipping + extraShipping : 0;
  const serviceFee = cart.length > 0 ? 2000 : 0;

  const discountAmount = appliedVoucher ? appliedVoucher.discount : 0;
  const grandTotal = Math.max(0, subtotal + totalShipping + serviceFee - discountAmount);

  // Logika 2 Voucher
  const handleApplyVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = voucherCode.trim().toUpperCase();

    if (!cleanCode) {
      setVoucherMsg("Masukkan kode voucher terlebih dahulu.");
      return;
    }

    if (cleanCode === "ONGKIRHEMAT") {
      const discount = Math.min(10000, totalShipping);
      setAppliedVoucher({ code: cleanCode, discount });
      setVoucherMsg(`Kupon "${cleanCode}" berhasil! Potongan ongkir Rp ${discount.toLocaleString("id-ID")}`);
    } else if (cleanCode === "SOTOBANJAR") {
      const discount = Math.round(subtotal * 0.1);
      setAppliedVoucher({ code: cleanCode, discount });
      setVoucherMsg(`Kupon "${cleanCode}" berhasil! Diskon 10% (Rp ${discount.toLocaleString("id-ID")})`);
    } else {
      setAppliedVoucher(null);
      setVoucherMsg("Kode voucher tidak valid.");
    }
  };

  // Reset Form untuk Pesan Lagi
  const handleOrderAgain = () => {
    onClearCart();
    setOrderSuccessId(null);
    setCustomerName("");
    setCustomerPhone("");
    setAddress("");
    setAddressBenchmark("");
    setOrderNotes("");
    setVoucherCode("");
    setAppliedVoucher(null);
    setVoucherMsg("");
    setErrorMsg("");
    onClose();
  };

  // Checkout Pesanan
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    if (!customerName.trim() || !customerPhone.trim() || !address.trim()) {
      setErrorMsg("Mohon lengkapi nama penerima, nomor WhatsApp, dan alamat lengkap.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg("");

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerPhone,
          address,
          addressBenchmark,
          area: selectedArea?.name || "Standar",
          service: selectedService?.name || "Standar",
          orderNotes,
          voucher: appliedVoucher?.code || null,
          discount: discountAmount,
          paymentMethod,
          shippingFee: totalShipping,
          serviceFee,
          items: cart.map((item) => ({
            menuId: item.id,
            name: item.name,
            price: item.price,
            qty: item.qty,
          })),
          totalPrice: grandTotal,
        }),
      });

      if (!response.ok) {
        throw new Error("Gagal menyimpan pesanan.");
      }

      const data = await response.json();
      setOrderSuccessId(data.id || "INV-" + Date.now());
      onClearCart();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Terjadi kesalahan saat memproses checkout.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        zIndex: 100,
        display: "flex",
        justifyContent: "flex-end",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "460px",
          height: "100%",
          backgroundColor: "#ffffff",
          display: "flex",
          flexDirection: "column",
          boxShadow: "-6px 0 25px rgba(0,0,0,0.25)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Drawer */}
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
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "22px" }}>🛍️</span>
            <h2 style={{ fontSize: "18px", fontWeight: "900", color: "#734F31", margin: 0 }}>
              Keranjang Belanja
            </h2>
          </div>
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

        {/* Konten Scrollable */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
          {orderSuccessId ? (
            <div style={{ textAlign: "center", padding: "30px 10px" }}>
              <div
                style={{
                  width: "65px",
                  height: "65px",
                  borderRadius: "50%",
                  background: "#DCFCE7",
                  color: "#166534",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "32px",
                  margin: "0 auto 18px",
                }}
              >
                ✓
              </div>

              <h3 style={{ fontSize: "20px", fontWeight: "900", color: "#166534", margin: "0 0 8px" }}>
                Pesanan Berhasil Dibuat!
              </h3>
              <p style={{ fontSize: "13px", color: "#4B5563", margin: "0 0 20px" }}>
                Pesanan Anda telah diterima dapur dan sedang dipersiapkan.
              </p>

              <div
                style={{
                  backgroundColor: "#F0FDF4",
                  border: "1.5px dashed #86EFAC",
                  borderRadius: "14px",
                  padding: "16px",
                  marginBottom: "20px",
                  wordBreak: "break-all",
                }}
              >
                <span style={{ fontSize: "11px", fontWeight: "800", color: "#166534", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                  ID Pesanan Anda
                </span>
                <strong style={{ fontSize: "15px", color: "#14532D" }}>
                  {orderSuccessId}
                </strong>
              </div>

              <div
                style={{
                  fontSize: "12px",
                  color: "#6B7280",
                  marginBottom: "28px",
                  lineHeight: "1.7",
                  textAlign: "left",
                  background: "#FAF6EE",
                  padding: "14px",
                  borderRadius: "10px",
                }}
              >
                <div>Penerima: <strong style={{ color: "#734F31" }}>{customerName}</strong> ({customerPhone})</div>
                <div>Area: <strong style={{ color: "#734F31" }}>{selectedArea?.name}</strong></div>
                <div>Layanan: <strong style={{ color: "#734F31" }}>{selectedService?.name}</strong></div>
                <div>Metode Bayar: <strong style={{ color: "#734F31", textTransform: "uppercase" }}>{paymentMethod.replace("_", " ")}</strong></div>
                <div>Total Dibayar: <strong style={{ color: "#734F31" }}>Rp {grandTotal.toLocaleString("id-ID")}</strong></div>
              </div>

              <button
                type="button"
                onClick={handleOrderAgain}
                style={{
                  width: "100%",
                  padding: "14px",
                  background: "linear-gradient(135deg, #9D9167, #734F31)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "14px",
                  fontWeight: "800",
                  cursor: "pointer",
                  boxShadow: "0 6px 18px rgba(115, 79, 49, 0.25)",
                }}
              >
                🍲 Pesan Menu Lain / Pesan Lagi
              </button>
            </div>
          ) : cart.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 10px", color: "#9D9167" }}>
              <div style={{ fontSize: "50px", marginBottom: "12px" }}>🛒</div>
              <h4 style={{ fontSize: "16px", fontWeight: "800", color: "#734F31", margin: "0 0 6px" }}>
                Keranjang Masih Kosong
              </h4>
              <p style={{ fontSize: "13px", margin: 0 }}>
                Silakan pilih sajian Soto Banjar favoritmu terlebih dahulu.
              </p>
            </div>
          ) : (
            <div>
              {/* LIST ITEM PESANAN */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
                {cart.map((item) => (
                  <div key={item.id} style={{ borderBottom: "1px solid #F3EDE2", paddingBottom: "14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: "15px", fontWeight: "800", color: "#734F31" }}>
                          {item.name}
                        </h4>
                        <span style={{ fontSize: "12px", color: "#9D9167" }}>
                          Rp {item.price.toLocaleString("id-ID")}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.id)}
                        style={{
                          background: "#FEF2F2",
                          border: "none",
                          color: "#DC2626",
                          fontSize: "11px",
                          fontWeight: "700",
                          cursor: "pointer",
                          padding: "3px 8px",
                          borderRadius: "6px",
                        }}
                      >
                        Hapus
                      </button>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "8px",
                          background: "#FAF6EE",
                          border: "1px solid #E8D1A7",
                          borderRadius: "8px",
                          padding: "2px 6px",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => onUpdateQty(item.id, -1)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#734F31",
                            fontWeight: "bold",
                            fontSize: "14px",
                            cursor: "pointer",
                            width: "20px",
                          }}
                        >
                          -
                        </button>
                        <span style={{ fontSize: "13px", fontWeight: "800", color: "#734F31" }}>
                          {item.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQty(item.id, 1)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#734F31",
                            fontWeight: "bold",
                            fontSize: "14px",
                            cursor: "pointer",
                            width: "20px",
                          }}
                        >
                          +
                        </button>
                      </div>

                      <strong style={{ fontSize: "14px", color: "#734F31", fontWeight: "800" }}>
                        Rp {(item.price * item.qty).toLocaleString("id-ID")}
                      </strong>
                    </div>
                  </div>
                ))}
              </div>

              {/* FORM PENGIRIMAN & KONTAK LENGKAP */}
              <form onSubmit={handleCheckout}>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "22px" }}>
                  {/* Nama Penerima */}
                  <input
                    type="text"
                    required
                    placeholder="Nama lengkap penerima *"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "11px 14px",
                      borderRadius: "10px",
                      border: "1px solid #E8D1A7",
                      backgroundColor: "#ffffff",
                      fontSize: "13px",
                      outline: "none",
                      color: "#734F31",
                      boxSizing: "border-box",
                    }}
                  />

                  {/* Nomor WhatsApp */}
                  <input
                    type="tel"
                    required
                    placeholder="Nomor WhatsApp / telepon penerima *"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "11px 14px",
                      borderRadius: "10px",
                      border: "1px solid #E8D1A7",
                      backgroundColor: "#ffffff",
                      fontSize: "13px",
                      outline: "none",
                      color: "#734F31",
                      boxSizing: "border-box",
                    }}
                  />

                  {/* Alamat Lengkap */}
                  <textarea
                    required
                    rows={3}
                    placeholder="Alamat lengkap *"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: "10px",
                      border: "1px solid #E8D1A7",
                      backgroundColor: "#ffffff",
                      fontSize: "13px",
                      outline: "none",
                      color: "#734F31",
                      resize: "none",
                      boxSizing: "border-box",
                    }}
                  />

                  {/* Patokan Alamat */}
                  <input
                    type="text"
                    placeholder="Patokan alamat (opsional)"
                    value={addressBenchmark}
                    onChange={(e) => setAddressBenchmark(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "11px 14px",
                      borderRadius: "10px",
                      border: "1px solid #E8D1A7",
                      backgroundColor: "#ffffff",
                      fontSize: "13px",
                      outline: "none",
                      color: "#734F31",
                      boxSizing: "border-box",
                    }}
                  />

                  {/* Area Pengiriman Dropdown (Data Murni dari SQLite) */}
                  <div>
                    <label style={{ fontSize: "14px", fontWeight: "800", color: "#734F31", display: "block", marginBottom: "6px" }}>
                      Area Pengiriman
                    </label>
                    <select
                      value={selectedAreaId ?? ""}
                      disabled={loadingShipping || areas.length === 0}
                      onChange={(e) => setSelectedAreaId(Number(e.target.value))}
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        borderRadius: "10px",
                        border: "1px solid #E8D1A7",
                        backgroundColor: "#ffffff",
                        fontSize: "13px",
                        outline: "none",
                        color: "#734F31",
                        cursor: "pointer",
                        boxSizing: "border-box",
                      }}
                    >
                      {loadingShipping ? (
                        <option>Memuat area dari database...</option>
                      ) : (
                        areas.map((area) => (
                          <option key={area.id} value={area.id}>
                            {area.name} - Rp {area.price.toLocaleString("id-ID")}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  {/* Layanan Pengiriman Dropdown (Data Murni dari SQLite) */}
                  <div>
                    <label style={{ fontSize: "14px", fontWeight: "800", color: "#734F31", display: "block", marginBottom: "6px" }}>
                      Layanan Pengiriman
                    </label>
                    <select
                      value={selectedServiceId ?? ""}
                      disabled={loadingShipping || services.length === 0}
                      onChange={(e) => setSelectedServiceId(Number(e.target.value))}
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        borderRadius: "10px",
                        border: "1px solid #E8D1A7",
                        backgroundColor: "#ffffff",
                        fontSize: "13px",
                        outline: "none",
                        color: "#734F31",
                        cursor: "pointer",
                        boxSizing: "border-box",
                      }}
                    >
                      {loadingShipping ? (
                        <option>Memuat layanan dari database...</option>
                      ) : (
                        services.map((service) => (
                          <option key={service.id} value={service.id}>
                            {service.name} - Tambahan Rp {service.extraPrice.toLocaleString("id-ID")}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  {/* Catatan Pesanan */}
                  <textarea
                    rows={2}
                    placeholder="Catatan pesanan (opsional)"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: "10px",
                      border: "1px solid #E8D1A7",
                      backgroundColor: "#ffffff",
                      fontSize: "13px",
                      outline: "none",
                      color: "#734F31",
                      resize: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                {/* VOUCHER PROMO */}
                <div style={{ marginBottom: "24px" }}>
                  <label style={{ fontSize: "13px", fontWeight: "800", color: "#734F31", display: "block", marginBottom: "6px" }}>
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
                        padding: "10px 12px",
                        borderRadius: "8px",
                        border: "1px solid #E8D1A7",
                        fontSize: "13px",
                        outline: "none",
                        color: "#734F31",
                        textTransform: "uppercase",
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleApplyVoucher}
                      style={{
                        padding: "10px 16px",
                        backgroundColor: "#9D9167",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "12px",
                        fontWeight: "800",
                        cursor: "pointer",
                      }}
                    >
                      Gunakan
                    </button>
                  </div>
                  {voucherMsg && (
                    <span
                      style={{
                        fontSize: "11px",
                        display: "block",
                        marginTop: "6px",
                        fontWeight: "700",
                        color: appliedVoucher ? "#166534" : "#DC2626",
                      }}
                    >
                      {voucherMsg}
                    </span>
                  )}
                </div>

                {/* PILIHAN PEMBAYARAN */}
                <h4 style={{ fontSize: "14px", fontWeight: "900", color: "#734F31", margin: "0 0 12px", letterSpacing: "0.5px" }}>
                  PILIHAN PEMBAYARAN
                </h4>

                <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "22px" }}>
                  {paymentCategories.map((group, groupIdx) => (
                    <div key={groupIdx}>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: "800",
                          color: "#9D9167",
                          display: "block",
                          marginBottom: "8px",
                          letterSpacing: "0.5px",
                        }}
                      >
                        {group.category}
                      </span>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "8px" }}>
                        {group.options.map((opt) => {
                          const isSelected = paymentMethod === opt.id;
                          return (
                            <label
                              key={opt.id}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                padding: "12px 14px",
                                borderRadius: "10px",
                                border: isSelected ? "2px solid #734F31" : "1.5px solid #E8D1A7",
                                backgroundColor: isSelected ? "#FAF6EE" : "#ffffff",
                                cursor: "pointer",
                                transition: "all 0.15s ease",
                              }}
                            >
                              <input
                                type="radio"
                                name="paymentMethod"
                                value={opt.id}
                                checked={isSelected}
                                onChange={() => setPaymentMethod(opt.id)}
                                style={{
                                  accentColor: "#734F31",
                                  cursor: "pointer",
                                  width: "16px",
                                  height: "16px",
                                }}
                              />
                              <span style={{ fontSize: "13px", fontWeight: isSelected ? "800" : "600", color: "#734F31" }}>
                                {opt.label}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* RINCIAN PEMBAYARAN */}
                <div style={{ backgroundColor: "#FAF6EE", borderRadius: "16px", padding: "18px 20px", marginBottom: "20px" }}>
                  <h4 style={{ fontSize: "15px", fontWeight: "900", color: "#734F31", margin: "0 0 14px" }}>
                    Rincian Pembayaran
                  </h4>

                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", color: "#6B7280" }}>
                      <span>Subtotal</span>
                      <span style={{ fontWeight: "600", color: "#4B5563" }}>
                        Rp {subtotal.toLocaleString("id-ID")}
                      </span>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", color: "#6B7280" }}>
                      <span>Ongkos Kirim</span>
                      <span style={{ fontWeight: "600", color: "#4B5563" }}>
                        Rp {totalShipping.toLocaleString("id-ID")}
                      </span>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", color: "#6B7280" }}>
                      <span>Biaya Layanan</span>
                      <span style={{ fontWeight: "600", color: "#4B5563" }}>
                        Rp {serviceFee.toLocaleString("id-ID")}
                      </span>
                    </div>

                    {discountAmount > 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between", color: "#166534" }}>
                        <span>Diskon ({appliedVoucher?.code})</span>
                        <span style={{ fontWeight: "700" }}>
                          - Rp {discountAmount.toLocaleString("id-ID")}
                        </span>
                      </div>
                    )}

                    <div
                      style={{
                        borderTop: "1.5px solid #E8D1A7",
                        paddingTop: "12px",
                        marginTop: "4px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <strong style={{ fontSize: "17px", color: "#734F31", fontWeight: "900" }}>
                        Total
                      </strong>
                      <strong style={{ fontSize: "18px", color: "#734F31", fontWeight: "900" }}>
                        Rp {grandTotal.toLocaleString("id-ID")}
                      </strong>
                    </div>

                    <span style={{ fontSize: "12px", color: "#6B7280", marginTop: "4px" }}>
                      Metode pembayaran: {paymentMethod.replace("_", " ").toUpperCase()}
                    </span>
                  </div>
                </div>

                {errorMsg && (
                  <div
                    style={{
                      padding: "10px 14px",
                      backgroundColor: "#FEF2F2",
                      border: "1px solid #FECACA",
                      borderRadius: "8px",
                      color: "#DC2626",
                      fontSize: "12px",
                      marginBottom: "16px",
                    }}
                  >
                    ⚠️ {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || loadingShipping}
                  style={{
                    width: "100%",
                    padding: "14px",
                    background: isSubmitting || loadingShipping
                      ? "#9CA3AF"
                      : "linear-gradient(135deg, #9D9167, #734F31)",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "12px",
                    fontSize: "14px",
                    fontWeight: "800",
                    cursor: isSubmitting || loadingShipping ? "not-allowed" : "pointer",
                    boxShadow: "0 6px 18px rgba(115, 79, 49, 0.25)",
                  }}
                >
                  {isSubmitting ? "Memproses Pesanan..." : "Konfirmasi & Bayar Pesanan"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}