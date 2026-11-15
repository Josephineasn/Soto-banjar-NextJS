"use client";

import React, { useState, useEffect, useRef } from "react";
import type { CartItem } from "@/types";

export interface SavedOrderRecord {
  id?: number | string;
  orderNumber: string;
  accountName?: string;
  customerEmail?: string;
  customerName: string;
  recipientName?: string;
  customerPhone: string;
  area: string;
  shippingService: string;
  address: string;
  landmark: string;
  note: string;
  useThermalBag: boolean;
  thermalBagCost: number;
  paymentMethod: string;
  vaNumber: string;
  voucherCode: string;
  subtotal: number;
  shippingCost: number;
  discount: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: {
    id: number;
    name: string;
    price: number;
    qty: number;
  }[];
}

interface DeliveryAreaOption {
  name: string;
  cost: number;
}

interface RawAreaFromApi {
  name?: string;
  area?: string;
  cost?: number;
  price?: number;
  fee?: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQty: (id: number, change: number) => void;
  onRemoveItem: (id: number) => void;
  onClearCart: () => void;
  currentUser?: { name: string; email?: string; role: string; phone?: string } | null;
  onOpenHistory?: () => void;
  onOpenAuth?: () => void;
}

export function generateVirtualAccount(method: string, phone = ""): string {
  const digits = phone.replace(/\D/g, "");
  const suffix = digits.length >= 8 ? digits.slice(-10) : "0812345678";

  switch (method) {
    case "BCA Virtual Account":
      return `80777${suffix}`;
    case "Mandiri Virtual Account":
      return `89508${suffix}`;
    case "GoPay":
      return `70001${suffix}`;
    case "OVO":
      return `39358${suffix}`;
    case "ShopeePay":
      return `128${suffix}`;
    case "DANA":
      return `8528${suffix}`;
    default:
      return `80777${suffix}`;
  }
}

const DEFAULT_AREAS: DeliveryAreaOption[] = [
  { name: "Jakarta Utara", cost: 8000 },
  { name: "Jakarta Barat", cost: 10000 },
  { name: "Jakarta Selatan", cost: 22000 },
  { name: "Jakarta Pusat", cost: 15000 },
  { name: "Bekasi Kota / Bekasi Barat", cost: 18000 },
  { name: "Kabupaten Bekasi", cost: 20000 },
  { name: "Tangerang / Tangerang Selatan", cost: 30000 },
  { name: "Bogor", cost: 30000 },
  { name: "Depok", cost: 32000 },
];

const THERMAL_BAG_PRICE = 5000;

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  currentUser,
  onOpenHistory,
  onOpenAuth,
}: CartDrawerProps) {
  const orderSeqRef = useRef<number>(420750);

  const [areas, setAreas] = useState<DeliveryAreaOption[]>(DEFAULT_AREAS);

  // State Form
  const [recipientName, setRecipientName] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [selectedArea, setSelectedArea] = useState<string>("");
  const [shippingCost, setShippingCost] = useState<number>(0);
  const [shippingService, setShippingService] = useState<string>("");
  const [useThermalBag, setUseThermalBag] = useState<boolean>(false);

  const [address, setAddress] = useState<string>("");
  const [landmark, setLandmark] = useState<string>("");
  const [orderNote, setOrderNote] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("");

  const [voucherInput, setVoucherInput] = useState<string>("");
  const [appliedVoucher, setAppliedVoucher] = useState<string>("");
  const [discount, setDiscount] = useState<number>(0);
  const [voucherMessage, setVoucherMessage] = useState<string>("");

  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [receiptData, setReceiptData] = useState<SavedOrderRecord | null>(null);
  const [copiedVA, setCopiedVA] = useState<boolean>(false);

  useEffect(() => {
    fetch("/api/delivery-areas")
      .then((res) => (res.ok ? (res.json() as Promise<RawAreaFromApi[]>) : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped: DeliveryAreaOption[] = data.map((d) => ({
            name: d.name || d.area || "Jakarta Utara",
            cost: Number(d.cost ?? d.price ?? d.fee ?? 8000),
          }));
          setAreas(mapped);
        }
      })
      .catch(() => {});
  }, []);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const thermalBagCost = useThermalBag ? THERMAL_BAG_PRICE : 0;
  const totalAmount = Math.max(
    0,
    subtotal + shippingCost + thermalBagCost - discount
  );

  function handleAreaChange(areaName: string) {
    setSelectedArea(areaName);
    if (!areaName) {
      setShippingCost(0);
      return;
    }
    const found = areas.find((a) => a.name === areaName);
    setShippingCost(found ? found.cost : 0);
  }

  function handleApplyVoucher() {
    const code = voucherInput.trim().toUpperCase();
    if (!code) return;

    if (code === "ONGKIRHEMAT") {
      if (!selectedArea) {
        setVoucherMessage("Pilih Area Pengiriman terlebih dahulu.");
        return;
      }
      const pot = Math.min(10000, shippingCost);
      setDiscount(pot);
      setAppliedVoucher(code);
      setVoucherMessage(`Voucher ONGKIRHEMAT aktif (-Rp ${pot.toLocaleString("id-ID")})`);
    } else if (code === "SOTOBANJAR") {
      const pot = Math.min(15000, Math.round(subtotal * 0.1));
      setDiscount(pot);
      setAppliedVoucher(code);
      setVoucherMessage(`Voucher SOTOBANJAR aktif (-Rp ${pot.toLocaleString("id-ID")})`);
    } else {
      setDiscount(0);
      setAppliedVoucher("");
      setVoucherMessage("Kode voucher tidak ditemukan.");
    }
  }

  function handlePreConfirm() {
    if (!currentUser) {
      alert("Silakan Masuk / Daftar akun terlebih dahulu!");
      onClose();
      onOpenAuth?.();
      return;
    }
    if (cart.length === 0) {
      alert("Keranjang belanja Anda masih kosong.");
      return;
    }
    if (!recipientName.trim()) {
      alert("Mohon isi Nama Lengkap Penerima terlebih dahulu.");
      return;
    }
    if (!customerPhone.trim()) {
      alert("Mohon isi Nomor HP / WhatsApp terlebih dahulu.");
      return;
    }
    if (!selectedArea) {
      alert("Silakan pilih Area Pengiriman terlebih dahulu.");
      return;
    }
    if (!shippingService) {
      alert("Silakan pilih Layanan Pengiriman terlebih dahulu.");
      return;
    }
    if (!address.trim()) {
      alert("Mohon isi Alamat Lengkap Pengiriman terlebih dahulu.");
      return;
    }
    if (!paymentMethod) {
      alert("Silakan pilih Metode Pembayaran pada dropdown terlebih dahulu.");
      return;
    }
    setShowConfirmModal(true);
  }

  async function handleConfirmOrder() {
    setIsSubmitting(true);
    const vaNumber = generateVirtualAccount(paymentMethod, customerPhone);

    orderSeqRef.current += 1 + cart.length + (totalAmount % 89);
    const orderNumber = `SBN-${orderSeqRef.current}`;
    const nowIso = new Date().toISOString();

    // Ambil juga email/nama akun yang sedang login dari prop maupun localStorage
    let activeAccountName = currentUser?.name?.trim() || "";
    let activeAccountEmail = currentUser?.email?.trim() || "";

    if (typeof window !== "undefined" && (!activeAccountName || !activeAccountEmail)) {
      const keys = ["soto_user", "currentUser", "user", "soto_banjar_user"];
      for (const key of keys) {
        const raw = localStorage.getItem(key);
        if (raw) {
          try {
            const parsed = JSON.parse(raw) as { name?: string; email?: string };
            if (!activeAccountName && parsed.name) activeAccountName = parsed.name.trim();
            if (!activeAccountEmail && parsed.email) activeAccountEmail = parsed.email.trim();
          } catch {
          }
        }
      }
    }

    const newRecord: SavedOrderRecord = {
      id: orderNumber,
      orderNumber,
      accountName: activeAccountName || recipientName.trim(),
      customerEmail: activeAccountEmail,
      customerName: recipientName.trim() || activeAccountName || "Pelanggan",
      recipientName: recipientName.trim() || activeAccountName || "Pelanggan",
      customerPhone: customerPhone.trim(),
      area: selectedArea,
      shippingService,
      address: address.trim(),
      landmark: landmark.trim(),
      note: orderNote.trim(),
      useThermalBag,
      thermalBagCost,
      paymentMethod,
      vaNumber,
      voucherCode: appliedVoucher,
      subtotal,
      shippingCost,
      discount,
      totalAmount,
      status: "PENDING",
      createdAt: nowIso,
      items: cart.map((c) => ({
        id: c.id,
        name: c.name,
        price: c.price,
        qty: c.qty,
      })),
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRecord),
      });

      if (res.ok) {
        const dbData = (await res.json()) as {
          id?: number | string;
          orderNumber?: string;
          status?: string;
        };
        if (dbData.id) {
          const cleanId = String(dbData.id).replace(/^#/, "");
          newRecord.id = cleanId;
          newRecord.orderNumber = cleanId.startsWith("SBN-")
            ? cleanId
            : `SBN-${cleanId}`;
        }
        if (dbData.status) {
          newRecord.status = dbData.status;
        }
      } else {
        const errJson = (await res.json().catch(() => ({}))) as { error?: string };
        console.error("Gagal simpan ke API /api/orders:", errJson);
      }
    } catch (err) {
      console.error("Network error saat simpan pesanan:", err);
    }

    try {
      const rawHistory = localStorage.getItem("soto_complete_orders");
      const existingHistory: SavedOrderRecord[] = rawHistory
        ? (JSON.parse(rawHistory) as SavedOrderRecord[])
        : [];
      existingHistory.unshift(newRecord);
      localStorage.setItem(
        "soto_complete_orders",
        JSON.stringify(existingHistory)
      );
    } catch {
    }

    // Beritahu OrderHistoryModal & Admin bahwa ada pesanan baru
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("ordersUpdated"));
    }

    setIsSubmitting(false);
    setShowConfirmModal(false);
    setReceiptData(newRecord);
    onClearCart();

    // Reset Form
    setRecipientName("");
    setCustomerPhone("");
    setSelectedArea("");
    setShippingCost(0);
    setShippingService("");
    setUseThermalBag(false);
    setAddress("");
    setLandmark("");
    setOrderNote("");
    setPaymentMethod("");
    setDiscount(0);
    setAppliedVoucher("");
    setVoucherInput("");
    setVoucherMessage("");
  }

  function handleCopyVA(va: string) {
    void navigator.clipboard.writeText(va);
    setCopiedVA(true);
    setTimeout(() => setCopiedVA(false), 2000);
  }

  if (!isOpen && !showConfirmModal && !receiptData) return null;

  return (
    <>
      {/* DRAWER KERANJANG */}
      {isOpen && !receiptData && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.55)",
            zIndex: 120,
            display: "flex",
            justifyContent: "flex-end",
          }}
          onClick={onClose}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "440px",
              height: "100%",
              backgroundColor: "#FAF6EE",
              display: "flex",
              flexDirection: "column",
              boxShadow: "-8px 0 30px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid #E5DEC9",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 900, color: "#432818" }}>
                Keranjang Belanja
              </h2>
              <button
                type="button"
                onClick={onClose}
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  border: "1px solid #D6C7B2",
                  backgroundColor: "#FFFFFF",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "#432818",
                }}
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "20px 24px",
                display: "flex",
                flexDirection: "column",
                gap: "15px",
              }}
            >
              {cart.length === 0 ? (
                <div
                  style={{
                    padding: "32px 16px",
                    textAlign: "center",
                    backgroundColor: "#FFFFFF",
                    borderRadius: "14px",
                    border: "1px dashed #D6C7B2",
                    color: "#734F31",
                    fontSize: "14px",
                    fontWeight: 600,
                  }}
                >
                  Keranjang belanja Anda masih kosong.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        backgroundColor: "#FFFFFF",
                        borderRadius: "12px",
                        padding: "12px 14px",
                        border: "1px solid #E5DEC9",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 800, fontSize: "14px", color: "#432818" }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: "12px", color: "#734F31", fontWeight: 700 }}>
                          Rp {item.price.toLocaleString("id-ID")}
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <button
                          type="button"
                          onClick={() => onUpdateQty(item.id, -1)}
                          style={{
                            width: "26px",
                            height: "26px",
                            borderRadius: "6px",
                            border: "1px solid #D6C7B2",
                            background: "#FAF6EE",
                            cursor: "pointer",
                            fontWeight: 800,
                          }}
                        >
                          -
                        </button>
                        <span style={{ fontSize: "13px", fontWeight: 800, minWidth: "18px", textAlign: "center" }}>
                          {item.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQty(item.id, 1)}
                          style={{
                            width: "26px",
                            height: "26px",
                            borderRadius: "6px",
                            border: "1px solid #D6C7B2",
                            background: "#FAF6EE",
                            cursor: "pointer",
                            fontWeight: 800,
                          }}
                        >
                          +
                        </button>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.id)}
                          style={{
                            marginLeft: "4px",
                            border: "none",
                            background: "none",
                            color: "#DC2626",
                            cursor: "pointer",
                            fontSize: "13px",
                            fontWeight: 700,
                          }}
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Nama Penerima */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 800, color: "#432818", marginBottom: "6px" }}>
                  Nama Lengkap Penerima *
                </label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Masukkan nama lengkap penerima"
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: "12px",
                    border: "1px solid #DFD5C3",
                    backgroundColor: "#FFFFFF",
                    fontSize: "14px",
                  }}
                />
              </div>

              {/* Nomor HP */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 800, color: "#432818", marginBottom: "6px" }}>
                  Nomor HP / WhatsApp Aktif *
                </label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: "12px",
                    border: "1px solid #DFD5C3",
                    backgroundColor: "#FFFFFF",
                    fontSize: "14px",
                  }}
                />
              </div>

              {/* Area Pengiriman */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 800, color: "#432818", marginBottom: "6px" }}>
                  Area Pengiriman *
                </label>
                <select
                  value={selectedArea}
                  onChange={(e) => handleAreaChange(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: "12px",
                    border: "1px solid #DFD5C3",
                    backgroundColor: "#FFFFFF",
                    fontSize: "14px",
                    color: selectedArea ? "#2B1B12" : "#64748B",
                  }}
                >
                  <option value="">-- Pilih Area Pengiriman --</option>
                  {areas.map((a) => (
                    <option key={a.name} value={a.name} style={{ color: "#2B1B12" }}>
                      {a.name} (Rp {a.cost.toLocaleString("id-ID")})
                    </option>
                  ))}
                </select>
              </div>

              {/* Layanan Pengiriman */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 800, color: "#432818", marginBottom: "6px" }}>
                  Layanan Pengiriman *
                </label>
                <select
                  value={shippingService}
                  onChange={(e) => setShippingService(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: "12px",
                    border: "1px solid #DFD5C3",
                    backgroundColor: "#FFFFFF",
                    fontSize: "14px",
                    color: shippingService ? "#2B1B12" : "#64748B",
                  }}
                >
                  <option value="">-- Pilih Layanan Pengiriman --</option>
                  <option value="Kurir Instant" style={{ color: "#2B1B12" }}>Kurir Instant</option>
                  <option value="Same Day" style={{ color: "#2B1B12" }}>Kurir Regular Hemat</option>
                </select>
              </div>

              {/* ADD-ON THERMAL BAG */}
              <div
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #DFD5C3",
                  borderRadius: "12px",
                  padding: "12px 14px",
                }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: 800,
                    color: "#432818",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={useThermalBag}
                    onChange={(e) => setUseThermalBag(e.target.checked)}
                    style={{
                      width: "18px",
                      height: "18px",
                      accentColor: "#6B4A31",
                      cursor: "pointer",
                    }}
                  />
                  <span>Add-on Thermal Bag (+Rp 5.000)</span>
                </label>
              </div>

              {/* Alamat Lengkap */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 800, color: "#432818", marginBottom: "6px" }}>
                  Alamat Lengkap Pengiriman *
                </label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan..."
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: "12px",
                    border: "1px solid #DFD5C3",
                    backgroundColor: "#FFFFFF",
                    fontSize: "14px",
                  }}
                />
              </div>

              {/* Patokan Alamat */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 800, color: "#432818", marginBottom: "6px" }}>
                  Patokan Lokasi (Opsional)
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="Contoh: Pagar hitam samping Indomaret"
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: "12px",
                    border: "1px solid #DFD5C3",
                    backgroundColor: "#FFFFFF",
                    fontSize: "14px",
                  }}
                />
              </div>

              {/* Catatan */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 800, color: "#432818", marginBottom: "6px" }}>
                  Catatan Pengiriman / Pesanan
                </label>
                <input
                  type="text"
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  placeholder="Catatan pesanan (opsional) - misal: kuah dipisah"
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: "12px",
                    border: "1px solid #DFD5C3",
                    backgroundColor: "#FFFFFF",
                    fontSize: "14px",
                  }}
                />
              </div>

              {/* Voucher Promo */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 800, color: "#432818", marginBottom: "6px" }}>
                  Voucher Promo
                </label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    value={voucherInput}
                    onChange={(e) => setVoucherInput(e.target.value)}
                    placeholder="SOTOBANJAR / ONGKIRHEMAT"
                    style={{
                      flex: 1,
                      padding: "11px 14px",
                      borderRadius: "12px",
                      border: "1px solid #DFD5C3",
                      backgroundColor: "#FFFFFF",
                      fontSize: "13px",
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleApplyVoucher}
                    style={{
                      padding: "0 18px",
                      borderRadius: "12px",
                      border: "none",
                      backgroundColor: "#8A7656",
                      color: "#FFFFFF",
                      fontWeight: 800,
                      fontSize: "13px",
                      cursor: "pointer",
                    }}
                  >
                    Gunakan
                  </button>
                </div>
                {voucherMessage && (
                  <p style={{ margin: "6px 0 0", fontSize: "12px", color: "#15803D", fontWeight: 700 }}>
                    {voucherMessage}
                  </p>
                )}
              </div>

              {/* Pembayaran */}
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 900, color: "#432818", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>
                  PILIHAN PEMBAYARAN *
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: "10px",
                    border: "1.5px solid #94A3B8",
                    backgroundColor: "#FFFFFF",
                    fontSize: "14px",
                    color: paymentMethod ? "#1E293B" : "#64748B",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <option value="">-- Pilih Bank VA / E-Wallet --</option>
                  <optgroup label="Virtual Account Bank">
                    <option value="BCA Virtual Account" style={{ color: "#1E293B" }}>BCA Virtual Account</option>
                    <option value="Mandiri Virtual Account" style={{ color: "#1E293B" }}>Mandiri Virtual Account</option>
                  </optgroup>
                  <optgroup label="E-Wallet">
                    <option value="GoPay" style={{ color: "#1E293B" }}>GoPay</option>
                    <option value="OVO" style={{ color: "#1E293B" }}>OVO</option>
                    <option value="ShopeePay" style={{ color: "#1E293B" }}>ShopeePay</option>
                    <option value="DANA" style={{ color: "#1E293B" }}>DANA</option>
                  </optgroup>
                </select>
              </div>

              {/* Ringkasan */}
              <div
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: "14px",
                  padding: "16px",
                  border: "1px solid #E5DEC9",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#64748B" }}>
                  <span>Subtotal Pesanan:</span>
                  <strong style={{ color: "#2B1B12" }}>Rp {subtotal.toLocaleString("id-ID")}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#64748B" }}>
                  <span>Ongkos Kirim ({selectedArea || "Belum dipilih"}):</span>
                  <strong style={{ color: "#2B1B12" }}>Rp {shippingCost.toLocaleString("id-ID")}</strong>
                </div>
                {useThermalBag && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#64748B" }}>
                    <span>Add-on Thermal Bag:</span>
                    <strong style={{ color: "#2B1B12" }}>Rp {thermalBagCost.toLocaleString("id-ID")}</strong>
                  </div>
                )}
                {discount > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#15803D" }}>
                    <span>Diskon Voucher:</span>
                    <strong>-Rp {discount.toLocaleString("id-ID")}</strong>
                  </div>
                )}
                <div
                  style={{
                    borderTop: "1px dashed #D6C7B2",
                    paddingTop: "10px",
                    marginTop: "4px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "16px",
                    fontWeight: 900,
                    color: "#432818",
                  }}
                >
                  <span>Total Pembayaran:</span>
                  <span style={{ fontSize: "18px" }}>Rp {totalAmount.toLocaleString("id-ID")}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: "16px 24px", borderTop: "1px solid #E5DEC9" }}>
              <button
                type="button"
                onClick={handlePreConfirm}
                style={{
                  width: "100%",
                  padding: "15px",
                  borderRadius: "12px",
                  border: "none",
                  backgroundColor: "#6B4A31",
                  color: "#FFFFFF",
                  fontSize: "14px",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Konfirmasi &amp; Pesan Sekarang →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KONFIRMASI */}
      {showConfirmModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.65)",
            zIndex: 150,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "400px",
              backgroundColor: "#FFFFFF",
              borderRadius: "22px",
              padding: "28px 24px",
              textAlign: "center",
              boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
            }}
          >
            <div
              style={{
                width: "54px",
                height: "54px",
                borderRadius: "50%",
                backgroundColor: "#FEF3C7",
                color: "#D97706",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 14px",
                fontSize: "26px",
                fontWeight: 900,
              }}
            >
              !
            </div>
            <h3 style={{ margin: "0 0 8px", fontSize: "19px", fontWeight: 900, color: "#1E293B" }}>
              Yakin Ingin Menyelesaikan Pesanan Ini?
            </h3>
            <p style={{ margin: "0 0 22px", fontSize: "13px", color: "#64748B", lineHeight: 1.6 }}>
              Pesanan atas nama <strong style={{ color: "#1E293B" }}>{recipientName}</strong> akan diproses dengan metode{" "}
              <strong style={{ color: "#1E293B" }}>{paymentMethod}</strong> dan total tagihan{" "}
              <strong style={{ color: "#166534" }}>Rp {totalAmount.toLocaleString("id-ID")}</strong>.
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setShowConfirmModal(false)}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "10px",
                  border: "1px solid #CBD5E1",
                  backgroundColor: "#FFFFFF",
                  color: "#475569",
                  fontWeight: 800,
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => void handleConfirmOrder()}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "10px",
                  border: "none",
                  backgroundColor: "#198754",
                  color: "#FFFFFF",
                  fontWeight: 800,
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                {isSubmitting ? "Memproses..." : "Ya, Selesaikan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STRUK */}
      {receiptData && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.65)",
            zIndex: 160,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "460px",
              backgroundColor: "#FFFFFF",
              borderRadius: "26px",
              padding: "28px 26px",
              boxShadow: "0 25px 60px rgba(0,0,0,0.35)",
              margin: "auto",
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                backgroundColor: "#198754",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 14px",
                fontSize: "32px",
                fontWeight: 900,
              }}
            >
              ✓
            </div>

            <h2 style={{ margin: "0 0 4px", textAlign: "center", fontSize: "24px", fontWeight: 900, color: "#163A24" }}>
              Pesanan Berhasil Dibuat!
            </h2>
            <p style={{ margin: "0 0 18px", textAlign: "center", fontSize: "13px", color: "#64748B" }}>
              ID Pesanan: <strong style={{ color: "#0F172A" }}>#{receiptData.orderNumber}</strong>
            </p>

            <div
              style={{
                border: "1.5px dashed #D4A373",
                backgroundColor: "#FCFBF7",
                borderRadius: "16px",
                padding: "16px",
                textAlign: "center",
                marginBottom: "16px",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  backgroundColor: "#EFECE6",
                  color: "#2B1B12",
                  padding: "4px 12px",
                  borderRadius: "6px",
                  fontSize: "11px",
                  fontWeight: 900,
                  textTransform: "uppercase",
                }}
              >
                {receiptData.paymentMethod}
              </span>
              <div style={{ fontSize: "12px", color: "#64748B", marginTop: "8px" }}>
                Nomor Rekening Virtual Account:
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  marginTop: "6px",
                }}
              >
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: "22px",
                    fontWeight: 900,
                    letterSpacing: "1.5px",
                    color: "#163A24",
                  }}
                >
                  {receiptData.vaNumber}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyVA(receiptData.vaNumber)}
                  style={{
                    padding: "5px 12px",
                    borderRadius: "8px",
                    border: "1px solid #198754",
                    backgroundColor: "#FFFFFF",
                    color: "#198754",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {copiedVA ? "Tersalin" : "Salin"}
                </button>
              </div>
            </div>

            <div
              style={{
                backgroundColor: "#F8FAFC",
                border: "1px solid #E2E8F0",
                borderRadius: "16px",
                padding: "16px",
                fontSize: "13px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                maxHeight: "260px",
                overflowY: "auto",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748B" }}>Penerima:</span>
                <strong style={{ color: "#0F172A" }}>
                  {receiptData.customerName} ({receiptData.customerPhone})
                </strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748B" }}>Wilayah &amp; Layanan:</span>
                <strong style={{ color: "#0F172A" }}>
                  {receiptData.area} ({receiptData.shippingService})
                </strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748B" }}>Add-on Thermal Bag:</span>
                <strong style={{ color: "#0F172A" }}>
                  {receiptData.useThermalBag ? "Ya (+Rp 5.000)" : "Tidak"}
                </strong>
              </div>
              <div>
                <span style={{ color: "#64748B" }}>Alamat Pengiriman:</span>
                <div style={{ fontWeight: 700, color: "#0F172A", marginTop: "2px" }}>
                  {receiptData.address}
                </div>
              </div>

              <div style={{ borderTop: "1px solid #E2E8F0", paddingTop: "8px", marginTop: "4px" }}>
                <div style={{ fontSize: "11px", fontWeight: 800, color: "#64748B", textTransform: "uppercase", marginBottom: "6px" }}>
                  Detail Pesanan:
                </div>
                {receiptData.items.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "12px",
                      marginBottom: "4px",
                      color: "#1E293B",
                    }}
                  >
                    <span>
                      {item.name} <strong>x{item.qty}</strong>
                    </span>
                    <span style={{ fontWeight: 700 }}>
                      Rp {(item.price * item.qty).toLocaleString("id-ID")}
                    </span>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#64748B", marginTop: "6px" }}>
                  <span>Ongkos Kirim:</span>
                  <span>Rp {receiptData.shippingCost.toLocaleString("id-ID")}</span>
                </div>
                {receiptData.useThermalBag && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#64748B" }}>
                    <span>Thermal Bag:</span>
                    <span>Rp {receiptData.thermalBagCost.toLocaleString("id-ID")}</span>
                  </div>
                )}
              </div>

              <div
                style={{
                  borderTop: "1px solid #CBD5E1",
                  paddingTop: "10px",
                  marginTop: "4px",
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "15px",
                  fontWeight: 900,
                  color: "#163A24",
                }}
              >
                <span>Total Pembayaran:</span>
                <span>Rp {receiptData.totalAmount.toLocaleString("id-ID")}</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "18px" }}>
              <button
                type="button"
                onClick={() => {
                  setReceiptData(null);
                  onClose();
                  onOpenHistory?.();
                }}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "12px",
                  border: "1.5px solid #475569",
                  backgroundColor: "#FFFFFF",
                  color: "#1E293B",
                  fontWeight: 800,
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                ↺ Lihat Riwayat
              </button>
              <button
                type="button"
                onClick={() => {
                  setReceiptData(null);
                  onClose();
                }}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "12px",
                  border: "none",
                  backgroundColor: "#1B3B2B",
                  color: "#FFFFFF",
                  fontWeight: 800,
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}