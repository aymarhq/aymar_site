export const WHATSAPP_NUMBER = "5598985190160";
export const SITE_URL = "https://aymar.vercel.app";
export const WHATSAPP_MSG = "Oi! Vim pelo site da Aymar Labs. Quero falar sobre uma oferta, criativos e vendas no WhatsApp.";
export const WHATSAPP_URL =
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MSG)}`;

export const getWhatsAppUrl = (message: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
