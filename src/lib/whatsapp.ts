export const WA_NUMBER = (import.meta.env.VITE_WHATSAPP_NUMBER as string) || "251911000000";
export const STORE_PHONE = (import.meta.env.VITE_STORE_PHONE as string) || "+251 911 000 000";
export const STORE_EMAIL = (import.meta.env.VITE_STORE_EMAIL as string) || "info@hararelectrical.et";
export const STORE_ADDRESS =
  (import.meta.env.VITE_STORE_ADDRESS as string) || "Kezira Area, Main Road, Harar, Ethiopia";

export function waLink(message: string) {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function waProductLink(name: string) {
  return waLink(`Hello! I am interested in the ${name}. Is it available?`);
}
