export interface AppUserSession {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  address?: string;
}

const STORAGE_KEYS = ["soto_user", "currentUser", "user"] as const;

export function getActiveUser(): AppUserSession | null {
  if (typeof window === "undefined") return null;

  for (const key of STORAGE_KEYS) {
    const raw = window.localStorage.getItem(key);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Partial<AppUserSession>;
        if (parsed && typeof parsed.email === "string" && parsed.email.trim() !== "") {
          return {
            id: String(parsed.id ?? ""),
            name: String(parsed.name ?? parsed.email.split("@")[0]),
            email: parsed.email.trim().toLowerCase(),
            role: String(parsed.role ?? "user"),
            phone: parsed.phone ? String(parsed.phone) : "",
            address: parsed.address ? String(parsed.address) : "",
          };
        }
      } catch {
        // Lanjut ke key berikutnya jika JSON rusak
      }
    }
  }
  return null;
}

export function setActiveUser(user: AppUserSession): void {
  if (typeof window === "undefined") return;
  const normalized: AppUserSession = {
    id: String(user.id ?? ""),
    name: String(user.name || "Pelanggan"),
    email: user.email.trim().toLowerCase(),
    role: String(user.role || "user"),
    phone: user.phone ?? "",
    address: user.address ?? "",
  };
  const serialized = JSON.stringify(normalized);
  for (const key of STORAGE_KEYS) {
    window.localStorage.setItem(key, serialized);
  }
  window.dispatchEvent(new Event("authChanged"));
  window.dispatchEvent(new Event("ordersUpdated"));
}

export function clearActiveUser(): void {
  if (typeof window === "undefined") return;
  for (const key of STORAGE_KEYS) {
    window.localStorage.removeItem(key);
  }
  window.dispatchEvent(new Event("authChanged"));
  window.dispatchEvent(new Event("ordersUpdated"));
}