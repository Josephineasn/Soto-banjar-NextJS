"use client";

interface NavbarProps {
    cartCount: number;
    onOpenCart: () => void;
    searchQuery: string;
    setSearchQuery: (q: string) => void;
    onGoToOrderForm: () => void;
}

    export default function Navbar({
    cartCount,
    onOpenCart,
    searchQuery,
    setSearchQuery,
    onGoToOrderForm,
    }: NavbarProps) {
    return (
        <>
        <div
            style={{
            background: "linear-gradient(90deg, #f59e0b, #ea580c, #d97706)",
            color: "#fff",
            padding: "8px 16px",
            fontSize: "12px",
            }}
        >
            <div
            style={{
                maxWidth: "1200px",
                margin: "0 auto",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
            }}
            >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span
                style={{
                    background: "rgba(255,255,255,0.25)",
                    padding: "2px 8px",
                    borderRadius: "12px",
                    fontWeight: "900",
                    fontSize: "10px",
                }}
                >
                DELIVERY ONLINE
                </span>
                <span>Soto Banjar Selera Nusantara • Pengiriman Panas ke Seluruh Kota</span>
            </div>
            <span
                style={{
                background: "rgba(67,20,7,0.3)",
                padding: "2px 10px",
                borderRadius: "6px",
                fontWeight: "bold",
                fontSize: "11px",
                color: "#fef08a",
                }}
            >
                Voucher: ONGKIRHEMAT
            </span>
            </div>
        </div>

        <header
            style={{
            background: "#ffffff",
            borderBottom: "2px solid #fed7aa",
            position: "sticky",
            top: 0,
            zIndex: 40,
            boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
            }}
        >
            <div
            style={{
                maxWidth: "1200px",
                margin: "0 auto",
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
            }}
            >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "14px",
                    background: "linear-gradient(135deg, #f59e0b, #ea580c)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px",
                    color: "#fff",
                    boxShadow: "0 4px 10px rgba(234,88,12,0.3)",
                }}
                >
                🍲
                </div>
                <div>
                <span
                    style={{
                    fontSize: "20px",
                    fontWeight: "900",
                    color: "#1c1917",
                    display: "block",
                    fontFamily: "serif",
                    }}
                >
                    Soto Banjar <span style={{ color: "#ea580c" }}>Nusantara</span>
                </span>
                <span style={{ fontSize: "11px", color: "#c2410c", fontWeight: "bold" }}>
                    Pesan Antar Online (Kelompok 5 TI-B)
                </span>
                </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <input
                type="text"
                placeholder="Cari menu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                    padding: "8px 14px",
                    fontSize: "12px",
                    borderRadius: "20px",
                    border: "1px solid #fcd34d",
                    background: "#fffbeb",
                    outline: "none",
                    width: "150px",
                }}
                />

                <button
                onClick={onGoToOrderForm}
                style={{
                    background: "#fff7ed",
                    color: "#9a3412",
                    border: "1px solid #fed7aa",
                    borderRadius: "14px",
                    padding: "8px 14px",
                    fontWeight: "bold",
                    fontSize: "12px",
                    cursor: "pointer",
                }}
                >
                🛵 Pesan Antar
                </button>

                <button
                onClick={onOpenCart}
                style={{
                    background: "linear-gradient(90deg, #f59e0b, #ea580c)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "16px",
                    padding: "8px 16px",
                    fontWeight: "900",
                    fontSize: "13px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 4px 12px rgba(234,88,12,0.3)",
                }}
                >
                <span>🛒 Keranjang</span>
                {cartCount > 0 && (
                    <span
                    style={{
                        background: "#292524",
                        color: "#fef08a",
                        borderRadius: "10px",
                        padding: "2px 7px",
                        fontSize: "11px",
                    }}
                    >
                    {cartCount}
                    </span>
                )}
                </button>
            </div>
            </div>
        </header>
        </>
    );
}