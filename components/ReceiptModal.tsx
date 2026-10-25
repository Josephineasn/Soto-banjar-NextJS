"use client";
import React from "react";
import { OrderData } from "@/types";

interface ReceiptModalProps {
    isOpen: boolean;
    order: OrderData | null;
    onClose: () => void;
}

    export default function ReceiptModal({ isOpen, order, onClose }: ReceiptModalProps) {
    if (!isOpen || !order) return null;

    const handleKirimWA = () => {
        const list = order.items
        .map((it) => `• ${it.name} (${it.qty}x) = Rp ${(it.price * it.qty).toLocaleString("id-ID")}`)
        .join("%0A");

        const pesan =
        `*PESANAN ONLINE SOTO BANJAR SELERA NUSANTARA*%0A` +
        `*No. Pesanan:* ${order.id}%0A` +
        `*Nama Pemesan:* ${encodeURIComponent(order.recipientName)}%0A` +
        `*WhatsApp:* ${order.recipientPhone}%0A` +
        `*Alamat:* ${encodeURIComponent(order.fullAddress)}%0A` +
        `*Patokan:* ${encodeURIComponent(order.addressBenchmark)}%0A` +
        `*Layanan Kurir:* ${encodeURIComponent(order.selectedCourier.name)}%0A` +
        `-------------------------------------%0A` +
        `*MENU DIPESAN:*%0A${list}%0A` +
        `-------------------------------------%0A` +
        `*Subtotal:* Rp ${order.pricing.subtotal.toLocaleString("id-ID")}%0A` +
        `*Ongkir:* Rp ${order.pricing.shippingFee.toLocaleString("id-ID")}%0A` +
        `*Packaging Thermal:* Rp ${order.pricing.packagingFee.toLocaleString("id-ID")}%0A` +
        `*TOTAL AKHIR:* *Rp ${order.pricing.total.toLocaleString("id-ID")}*%0A` +
        `-------------------------------------%0A` +
        `Mohon segera diproses ya Kasir!`;

        window.open(`https://wa.me/6281234567890?text=${pesan}`, "_blank");
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
            zIndex: 70,
        }}
        >
        <div
            style={{
            background: "#fff",
            borderRadius: "18px",
            maxWidth: "420px",
            width: "100%",
            padding: "24px",
            textAlign: "center",
            border: "3px solid #f59e0b",
            }}
        >
            <span style={{ fontSize: "40px" }}>🎉</span>
            <h3 style={{ margin: "10px 0 4px", color: "#ea580c", fontSize: "20px" }}>Pesanan Siap Dikirim!</h3>
            <p style={{ fontSize: "12px", color: "#78350f", marginBottom: "16px" }}>
            Kirimkan nota ini ke WhatsApp kasir warung agar segera disiapkan.
            </p>

            <div
            style={{
                textAlign: "left",
                background: "#fef3c7",
                padding: "14px",
                borderRadius: "10px",
                fontSize: "12px",
                lineHeight: "1.6",
                marginBottom: "16px",
            }}
            >
            <div><strong>Penerima:</strong> {order.recipientName} ({order.recipientPhone})</div>
            <div><strong>Alamat:</strong> {order.fullAddress}</div>
            <div><strong>Estimasi:</strong> {order.selectedArea.est}</div>
            <div style={{ borderTop: "1px dashed #f59e0b", marginTop: "8px", paddingTop: "6px" }}>
                <strong style={{ color: "#ea580c", fontSize: "14px" }}>
                Total Bayar: Rp {order.pricing.total.toLocaleString("id-ID")}
                </strong>
            </div>
            </div>

            <button
            onClick={handleKirimWA}
            style={{
                width: "100%",
                background: "#16a34a",
                color: "#fff",
                border: "none",
                padding: "12px",
                borderRadius: "10px",
                fontWeight: "bold",
                cursor: "pointer",
                fontSize: "14px",
                marginBottom: "8px",
            }}
            >
            Kirim ke WhatsApp Kasir 💬
            </button>
            <button
            onClick={onClose}
            style={{
                width: "100%",
                background: "#fff",
                color: "#78350f",
                border: "1px solid #fdba74",
                padding: "8px",
                borderRadius: "10px",
                cursor: "pointer",
                fontSize: "12px",
            }}
            >
            Selesai & Tutup
            </button>
        </div>
        </div>
    );
}