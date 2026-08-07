export const WHATSAPP_NUMBER = "5598985190160";
export const WHATSAPP_MSG = "Oi! Vim pelo site da aymar. Queria falar sobre a operação da minha empresa.";
export const WHATSAPP_URL =
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MSG)}`;

export const getWhatsAppUrl = (message: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
