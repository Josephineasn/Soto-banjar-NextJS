export interface MenuItem {
    id: number;
    name: string;
    category: "makanan" | "cemilan" | "pendamping" | "minuman";
    price: number;
    rating: number;
    spicyLevel: string;
    calories: string;
    packagingInfo: string;
    description: string;
    spices: string[];
    image: string;
    popular: boolean;
    available: boolean;
}

export interface CartItem extends MenuItem {
    qty: number;
}

export interface ShippingZone {
    id: string;
    name: string;
    fee: number;
    est: string;
}

export interface CourierOption {
    id: string;
    name: string;
    note: string;
    extra: number;
}

export interface OrderData {
    id: string;
    recipientName: string;
    recipientPhone: string;
    fullAddress: string;
    addressBenchmark: string;
    selectedArea: ShippingZone;
    selectedCourier: CourierOption;
    deliveryTime: string;
    paymentMethod: string;
    packagingSummary: string;
    notes: string;
    items: CartItem[];
    pricing: {
        subtotal: number;
        shippingFee: number;
        packagingFee: number;
        serviceFee: number;
        discount: number;
        total: number;
    };
    status: string;
    createdAt: string;
}