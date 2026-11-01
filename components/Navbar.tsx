"use client";

interface NavbarProps {
    cartCount: number;
    onOpenCart: () => void;
}

    export default function Navbar({ cartCount, onOpenCart }: NavbarProps) {
    const scrollTo = (id: string) => {
        if (id === "top") {
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
        }
        const element = document.getElementById(id);
        if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <header
        style={{
            backgroundColor: "#2E1C14",
            borderBottom: "1px solid rgba(253, 230, 138, 0.2)",
            position: "sticky",
            top: 0,
            zIndex: 50,
            boxShadow: "0 4px 20px rgba(46, 28, 20, 0.15)",
        }}
        >
        <div
            style={{
            maxWidth: "1240px",
            margin: "0 auto",
            padding: "14px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "20px",
            }}
        >
            {/* Logo */}
            <div
            onClick={() => scrollTo("top")}
            style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                cursor: "pointer",
            }}
            >
            <div
                style={{
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                backgroundColor: "#B45309",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "22px",
                boxShadow: "0 2px 8px rgba(180, 83, 9, 0.4)",
                }}
            >
                🍲
            </div>
            <div>
                <h1
                style={{
                    fontSize: "18px",
                    fontWeight: "900",
                    color: "#FEF3C7",
                    margin: 0,
                    lineHeight: "1.2",
                }}
                >
                Soto Banjar
                </h1>
                <span
                style={{
                    fontSize: "11px",
                    fontWeight: "600",
                    color: "#D97706",
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                }}
                >
                Delivery Jabodetabek
                </span>
            </div>
            </div>

            {/* Navigasi */}
            <nav
            style={{
                display: "flex",
                alignItems: "center",
                gap: "28px",
            }}
            >
            {[
                { label: "Beranda", id: "top" },
                { label: "Menu", id: "menu" },
                { label: "Tentang Kami", id: "tentang-kami" },
                { label: "FAQ", id: "faq" },
                { label: "Lokasi", id: "lokasi" },
            ].map((item) => (
                <button
                key={item.id}
                type="button"
                onClick={() => scrollTo(item.id)}
                style={{
                    background: "none",
                    border: "none",
                    color: item.id === "top" ? "#F59E0B" : "#E7D8C9",
                    fontWeight: item.id === "top" ? "800" : "500",
                    fontSize: "14px",
                    cursor: "pointer",
                    padding: "6px 0",
                    transition: "color 0.2s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#F59E0B")}
                onMouseLeave={(e) =>
                    (e.currentTarget.style.color =
                    item.id === "top" ? "#F59E0B" : "#E7D8C9")
                }
                >
                {item.label}
                </button>
            ))}
            </nav>

            {/* Tombol Keranjang */}
            <div style={{ display: "flex", alignItems: "center" }}>
            <button
                type="button"
                onClick={onOpenCart}
                title="Buka Keranjang"
                style={{
                position: "relative",
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                backgroundColor: "rgba(254, 243, 199, 0.1)",
                border: "1px solid rgba(254, 243, 199, 0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#FEF3C7",
                transition: "all 0.2s ease",
                }}
            >
                <svg
                xmlns="http://www.w3.org/2000/svg"
                width="19"
                height="19"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
                </svg>

                {cartCount > 0 && (
                <span
                    style={{
                    position: "absolute",
                    top: "-5px",
                    right: "-5px",
                    background: "#B45309",
                    color: "#FFFFFF",
                    fontSize: "10px",
                    fontWeight: "900",
                    borderRadius: "50%",
                    minWidth: "18px",
                    height: "18px",
                    padding: "0 4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                    }}
                >
                    {cartCount}
                </span>
                )}
            </button>
            </div>
        </div>
        </header>
    );
}