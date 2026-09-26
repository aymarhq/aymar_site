export const WHATSAPP_NUMBER = "559881358463";
export const SITE_URL = "https://aymar.vercel.app";
export const WHATSAPP_MSG = "Vim pelo site e quero saber os preços dos criativos para X1 Low Ticket.";
export const WHATSAPP_URL =
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MSG)}`;

export const getWhatsAppUrl = (message: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
