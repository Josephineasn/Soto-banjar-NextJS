"use client";
import { CartItem } from "@/types";

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    cart: CartItem[];
    onUpdateQty: (index: number, delta: number) => void;
    onProceedCheckout: () => void;
    }

export default function CartDrawer({
    isOpen,
    onClose,
    cart,
    onUpdateQty,
    onProceedCheckout,
    }: CartDrawerProps) {
    if (!isOpen) return null;

    const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

    return (
        <div
        style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "flex-end",
            zIndex: 50,
        }}
        >
        <div
            style={{
            width: "100%",
            maxWidth: "380px",
            background: "#fff",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            boxShadow: "-4px 0 15px rgba(0,0,0,0.1)",
            }}
        >
            <div
            style={{
                padding: "16px",
                background: "linear-gradient(90deg, #f59e0b, #ea580c)",
                color: "#fff",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
            }}
            >
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "bold" }}>🛒 Keranjang Pesanan</h3>
            <button
                onClick={onClose}
                style={{ background: "none", border: "none", color: "#fff", fontSize: "18px", cursor: "pointer" }}
            >
                ✕
            </button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
            {cart.length === 0 ? (
                <p style={{ textAlign: "center", color: "#a8a29e", marginTop: "50px", fontSize: "13px" }}>
                Keranjang kamu masih kosong.
                </p>
            ) : (
                cart.map((item, idx) => (
                <div
                    key={idx}
                    style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "12px",
                    borderBottom: "1px solid #fef3c7",
                    paddingBottom: "8px",
                    }}
                >
                    <div>
                    <strong style={{ fontSize: "13px", display: "block" }}>{item.name}</strong>
                    <span style={{ fontSize: "12px", color: "#ea580c" }}>
                        Rp {(item.price * item.qty).toLocaleString("id-ID")}
                    </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <button
                        onClick={() => onUpdateQty(idx, -1)}
                        style={{ width: "24px", height: "24px", cursor: "pointer" }}
                    >
                        -
                    </button>
                    <span style={{ fontSize: "12px", fontWeight: "bold" }}>{item.qty}</span>
                    <button
                        onClick={() => onUpdateQty(idx, 1)}
                        style={{ width: "24px", height: "24px", cursor: "pointer" }}
                    >
                        +
                    </button>
                    </div>
                </div>
                ))
            )}
            </div>

            {cart.length > 0 && (
            <div style={{ padding: "16px", background: "#fffbeb", borderTop: "1px solid #fed7aa" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                <span>Subtotal Menu:</span>
                <strong style={{ color: "#ea580c" }}>Rp {subtotal.toLocaleString("id-ID")}</strong>
                </div>
                <button
                onClick={onProceedCheckout}
                style={{
                    width: "100%",
                    background: "#ea580c",
                    color: "#fff",
                    border: "none",
                    padding: "12px",
                    borderRadius: "10px",
                    fontWeight: "bold",
                    cursor: "pointer",
                }}
                >
                Lanjut Formulir Pengiriman ➔
                </button>
            </div>
            )}
        </div>
        </div>
);
}