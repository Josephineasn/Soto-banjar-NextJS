"use client";
import React, { useState, useMemo } from "react";
import { DELIVERY_AREAS, COURIER_SERVICES, PACKAGING_OPTIONS, VALID_PROMOS } from "@/data/menu";
import { CartItem, OrderData, ShippingZone, CourierOption } from "@/types";

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    cart: CartItem[];
    onSubmitSuccess: (order: OrderData) => void;
}

    export default function CheckoutModal({
    isOpen,
    onClose,
    cart,
    onSubmitSuccess,
    }: CheckoutModalProps) {
    // Deklarasi
    const [recipientName, setRecipientName] = useState("");
    const [recipientPhone, setRecipientPhone] = useState("");
    const [fullAddress, setFullAddress] = useState("");
    const [addressBenchmark, setAddressBenchmark] = useState("");
    const [selectedArea, setSelectedArea] = useState<ShippingZone>(DELIVERY_AREAS[0]);
    const [selectedCourier, setSelectedCourier] = useState<CourierOption>(COURIER_SERVICES[0]);
    const [deliveryTimeMode, setDeliveryTimeMode] = useState<"now" | "scheduled">("now");
    const [scheduledTime, setScheduledTime] = useState("12:00");
    const [notes, setNotes] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("QRIS");
    const [voucherCode, setVoucherCode] = useState("");
    const [appliedVoucher, setAppliedVoucher] = useState<{ discount?: number; percent?: number; label: string } | null>(null);
    const [voucherError, setVoucherError] = useState("");
    const [packagingChoices, setPackagingChoices] = useState<Record<string, boolean>>({
        "soup-separated": true,
        "thermal-pouch": true,
        "eco-cutlery": true,
        "extra-condiment": false,
    });

    const cartSubtotal = useMemo(() => cart.reduce((acc, i) => acc + i.price * i.qty, 0), [cart]);

    const packagingFee = useMemo(() => {
        let fee = 0;
        PACKAGING_OPTIONS.forEach((opt) => {
        if (packagingChoices[opt.id]) fee += opt.price;
        });
        return fee;
    }, [packagingChoices]);

    const shippingFee = selectedArea.fee + selectedCourier.extra;
    const serviceFee = 2000;

    const discount = useMemo(() => {
        if (!appliedVoucher) return 0;
        if (appliedVoucher.discount) return appliedVoucher.discount;
        if (appliedVoucher.percent) return Math.round((cartSubtotal * appliedVoucher.percent) / 100);
        return 0;
    }, [appliedVoucher, cartSubtotal]);

    const total = Math.max(0, cartSubtotal + shippingFee + packagingFee + serviceFee - discount);

    if (!isOpen) return null;

    const handleApplyVoucher = (e: React.FormEvent) => {
        e.preventDefault();
        setVoucherError("");
        const code = voucherCode.trim().toUpperCase();
        if (!code) return;

        if (VALID_PROMOS[code]) {
        setAppliedVoucher(VALID_PROMOS[code]);
        } else {
        setVoucherError("Kode voucher tidak valid.");
        setAppliedVoucher(null);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!recipientName || !recipientPhone || !fullAddress) {
        alert("Harap lengkapi Nama, No. WhatsApp, dan Alamat!");
        return;
        }

        const orderId = `SB-DELIV-${Math.floor(1000 + Math.random() * 9000)}`;
        const packagingSummary = Object.keys(packagingChoices)
        .filter((k) => packagingChoices[k])
        .map((k) => PACKAGING_OPTIONS.find((p) => p.id === k)?.label)
        .join(", ");

        onSubmitSuccess({
        id: orderId,
        recipientName,
        recipientPhone,
        fullAddress,
        addressBenchmark: addressBenchmark || "-",
        selectedArea,
        selectedCourier,
        deliveryTime: deliveryTimeMode === "now" ? "Kirim Segera (Panas Menit Ini)" : `Jam ${scheduledTime} WITA`,
        paymentMethod,
        packagingSummary,
        notes: notes || "-",
        items: [...cart],
        pricing: {
            subtotal: cartSubtotal,
            shippingFee,
            packagingFee,
            serviceFee,
            discount,
            total,
        },
        status: "Diterima",
        createdAt: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WITA",
        });
    };

    return (
        <div
        style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "16px",
            zIndex: 60,
        }}
        >
        <div
            style={{
            background: "#fff",
            borderRadius: "18px",
            maxWidth: "500px",
            width: "100%",
            maxHeight: "90vh",
            overflowY: "auto",
            padding: "24px",
            border: "3px solid #f59e0b",
            }}
        >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ margin: 0, color: "#ea580c", fontSize: "18px" }}>Form Pengiriman Delivery</h3>
            <button onClick={onClose} style={{ border: "none", background: "none", fontSize: "18px", cursor: "pointer" }}>
                ✕
            </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
            <div>
                <label style={{ fontWeight: "bold" }}>Nama Penerima *</label>
                <input
                required
                type="text"
                placeholder="Nama Anda"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                style={{ width: "100%", padding: "8px", border: "1px solid #f59e0b", borderRadius: "8px", marginTop: "4px", boxSizing: "border-box" }}
                />
            </div>

            <div>
                <label style={{ fontWeight: "bold" }}>No. WhatsApp Aktif *</label>
                <input
                required
                type="tel"
                placeholder="0812xxxxxxxx"
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
                style={{ width: "100%", padding: "8px", border: "1px solid #f59e0b", borderRadius: "8px", marginTop: "4px", boxSizing: "border-box" }}
                />
            </div>

            <div>
                <label style={{ fontWeight: "bold" }}>Alamat Lengkap *</label>
                <textarea
                required
                rows={2}
                placeholder="Jalan, No. Rumah, Komplek..."
                value={fullAddress}
                onChange={(e) => setFullAddress(e.target.value)}
                style={{ width: "100%", padding: "8px", border: "1px solid #f59e0b", borderRadius: "8px", marginTop: "4px", boxSizing: "border-box" }}
                />
            </div>

            <div>
                <label style={{ fontWeight: "bold" }}>Patokan Rumah</label>
                <input
                type="text"
                placeholder="Depan masjid / pagar hitam..."
                value={addressBenchmark}
                onChange={(e) => setAddressBenchmark(e.target.value)}
                style={{ width: "100%", padding: "8px", border: "1px solid #f59e0b", borderRadius: "8px", marginTop: "4px", boxSizing: "border-box" }}
                />
            </div>

            <div>
                <label style={{ fontWeight: "bold" }}>Pilih Zona Jarak (Ongkir Otomatis):</label>
                <select
                value={selectedArea.id}
                onChange={(e) => {
                    const z = DELIVERY_AREAS.find((item) => item.id === e.target.value);
                    if (z) setSelectedArea(z);
                }}
                style={{ width: "100%", padding: "8px", border: "1px solid #f59e0b", borderRadius: "8px", marginTop: "4px", background: "#fffbeb" }}
                >
                {DELIVERY_AREAS.map((z) => (
                    <option key={z.id} value={z.id}>
                    {z.name} — Rp {z.fee.toLocaleString("id-ID")} ({z.est})
                    </option>
                ))}
                </select>
            </div>

            <div>
                <label style={{ fontWeight: "bold" }}>Opsi Kurir Pengantaran:</label>
                <select
                value={selectedCourier.id}
                onChange={(e) => {
                    const c = COURIER_SERVICES.find((item) => item.id === e.target.value);
                    if (c) setSelectedCourier(c);
                }}
                style={{ width: "100%", padding: "8px", border: "1px solid #f59e0b", borderRadius: "8px", marginTop: "4px", background: "#fffbeb" }}
                >
                {COURIER_SERVICES.map((c) => (
                    <option key={c.id} value={c.id}>
                    {c.name} {c.extra > 0 ? `(+Rp ${c.extra.toLocaleString("id-ID")})` : "(Gratis Ekstra)"}
                    </option>
                ))}
                </select>
            </div>

            <div>
                <label style={{ fontWeight: "bold", display: "block", marginBottom: "4px" }}>Waktu Kirim:</label>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "4px", cursor: "pointer" }}>
                    <input
                    type="radio"
                    name="timeMode"
                    checked={deliveryTimeMode === "now"}
                    onChange={() => setDeliveryTimeMode("now")}
                    />
                    Kirim Segera
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "4px", cursor: "pointer" }}>
                    <input
                    type="radio"
                    name="timeMode"
                    checked={deliveryTimeMode === "scheduled"}
                    onChange={() => setDeliveryTimeMode("scheduled")}
                    />
                    Jadwalkan Jam
                </label>
                {deliveryTimeMode === "scheduled" && (
                    <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    style={{ padding: "4px 8px", border: "1px solid #f59e0b", borderRadius: "6px" }}
                    />
                )}
                </div>
            </div>

            <div>
                <label style={{ fontWeight: "bold" }}>Catatan Pesanan Dapur</label>
                <input
                type="text"
                placeholder="Contoh: Sambal dipisah banyakin, jangan pakai seledri..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{ width: "100%", padding: "8px", border: "1px solid #f59e0b", borderRadius: "8px", marginTop: "4px", boxSizing: "border-box" }}
                />
            </div>

            {/* Metode Pembayaran */}
            <div>
                <label style={{ fontWeight: "bold" }}>Metode Pembayaran:</label>
                <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                style={{ width: "100%", padding: "8px", border: "1px solid #f59e0b", borderRadius: "8px", marginTop: "4px", background: "#fffbeb" }}
                >
                <option value="QRIS">QRIS Instan</option>
                <option value="Transfer BCA">Transfer Bank BCA</option>
                <option value="E-Wallet">E-Wallet (GoPay / OVO)</option>
                <option value="COD">COD (Bayar di Tempat)</option>
                </select>
            </div>

            {/* Packaging Checkboxes */}
            <div style={{ background: "#fff7ed", padding: "10px", borderRadius: "8px", border: "1px solid #fed7aa", marginTop: "6px" }}>
                <span style={{ fontWeight: "bold", display: "block", marginBottom: "6px" }}>Pilihan Standar Kemasan Panas:</span>
                {PACKAGING_OPTIONS.map((pkg) => (
                <label key={pkg.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", cursor: "pointer" }}>
                    <span>{pkg.label}</span>
                    <input
                    type="checkbox"
                    checked={!!packagingChoices[pkg.id]}
                    onChange={(e) => setPackagingChoices({ ...packagingChoices, [pkg.id]: e.target.checked })}
                    />
                </label>
                ))}
            </div>

            {/* Voucher */}
            <div style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
                <input
                type="text"
                placeholder="Kode Voucher (ONGKIRHEMAT)"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value)}
                style={{ flex: 1, padding: "8px", border: "1px solid #f59e0b", borderRadius: "8px", textTransform: "uppercase" }}
                />
                <button
                type="button"
                onClick={handleApplyVoucher}
                style={{ background: "#292524", color: "#fef08a", border: "none", padding: "8px 14px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}
                >
                Pasang
                </button>
            </div>
            {appliedVoucher && <p style={{ color: "#16a34a", margin: 0, fontWeight: "bold" }}>✓ {appliedVoucher.label}</p>}
            {voucherError && <p style={{ color: "#dc2626", margin: 0 }}>{voucherError}</p>}

            {/* Rincian Harga */}
            <div style={{ background: "#fef3c7", padding: "12px", borderRadius: "10px", fontSize: "12px", display: "flex", flexDirection: "column", gap: "6px", marginTop: "6px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Subtotal Menu:</span>
                <span>Rp {cartSubtotal.toLocaleString("id-ID")}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Ongkos Kirim:</span>
                <span>Rp {shippingFee.toLocaleString("id-ID")}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Kemasan Pouch Thermal:</span>
                <span>Rp {packagingFee.toLocaleString("id-ID")}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Biaya Layanan:</span>
                <span>Rp {serviceFee.toLocaleString("id-ID")}</span>
                </div>
                {discount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", color: "#16a34a", fontWeight: "bold" }}>
                    <span>Diskon:</span>
                    <span>-Rp {discount.toLocaleString("id-ID")}</span>
                </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", borderTop: "1px solid #fcd34d", paddingTop: "6px", color: "#ea580c", fontSize: "14px" }}>
                <span>Total Pembayaran:</span>
                <span>Rp {total.toLocaleString("id-ID")}</span>
                </div>
            </div>

            <button
                type="submit"
                style={{
                background: "linear-gradient(90deg, #ea580c, #f59e0b)",
                color: "#fff",
                border: "none",
                padding: "12px",
                borderRadius: "10px",
                fontWeight: "bold",
                cursor: "pointer",
                fontSize: "14px",
                marginTop: "8px",
                }}
            >
                Konfirmasi Pesanan
            </button>
            </form>
        </div>
        </div>
    );
}