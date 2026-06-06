export const WA_NUMBER = (import.meta.env.VITE_WHATSAPP_NUMBER as string) || "251989075128";
export const STORE_PHONE = (import.meta.env.VITE_STORE_PHONE as string) || "+251 98 907 5128";
export const STORE_PHONE_2 =
  (import.meta.env.VITE_STORE_PHONE_2 as string) || "+251 94 960 3004";
export const STORE_PHONES = [STORE_PHONE, STORE_PHONE_2] as const;
export const STORE_EMAIL = (import.meta.env.VITE_STORE_EMAIL as string) || "info@ma-light.et";
export const STORE_ADDRESS =
  (import.meta.env.VITE_STORE_ADDRESS as string) ||
  "In front of Abadir Guest House, Harar, Ethiopia";
export const STORE_MAP_URL =
  (import.meta.env.VITE_STORE_MAP_URL as string) ||
  "https://maps.app.goo.gl/373WG3oi61GXPhkt5?g_st=ac";

export function waLink(message: string) {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function waProductLink(name: string) {
  return waLink(`Hello! I am interested in the ${name}. Is it available?`);
}
