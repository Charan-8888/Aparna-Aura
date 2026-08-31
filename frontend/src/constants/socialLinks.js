export const SOCIAL_LINKS = {
  whatsappNumber: '919014820869',
  whatsappFormatted: '+91 90148 20869',
  instagram: 'https://www.instagram.com/aparnaaura9?igsi=N2pmNGkydWpwdDR1&utm_source=ig_contact_invite',
  instagramHandle: '@aparnaaura9',
  meesho: 'https://www.meesho.com/APARNAAURA?ms=2',
};

/**
 * Generates an official WhatsApp click-to-chat URL with optional custom text.
 * Format: https://wa.me/91XXXXXXXXXX?text=...
 */
export const getWhatsAppUrl = (customMessage = '') => {
  const defaultMsg = 'Hi Aparna Aura, I have a question about your jewellery collection.';
  const text = encodeURIComponent(customMessage || defaultMsg);
  return `https://wa.me/${SOCIAL_LINKS.whatsappNumber}?text=${text}`;
};

/**
 * Generates a pre-filled WhatsApp enquiry link for a specific product.
 */
export const getProductEnquiryWhatsAppUrl = (product) => {
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
  const productUrl = product?.slug ? `${currentOrigin}/product/${product.slug}` : currentOrigin;
  const productName = product?.name || 'this piece';
  const msg = `Hi Aparna Aura,\n\nI'm interested in "${productName}". Could you please share the price and details?\n\nProduct:\n${productUrl}`;
  return `https://wa.me/${SOCIAL_LINKS.whatsappNumber}?text=${encodeURIComponent(msg)}`;
};
