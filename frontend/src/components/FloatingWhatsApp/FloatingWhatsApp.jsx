import React from 'react';
import { useLocation } from 'react-router-dom';
import { getWhatsAppUrl } from '../../constants/socialLinks';

const FloatingWhatsApp = () => {
  const location = useLocation();

  // Do not show floating button on checkout or payment pages to prevent UI interference
  if (
    location.pathname.startsWith('/checkout') ||
    location.pathname.startsWith('/payment')
  ) {
    return null;
  }

  const whatsappUrl = getWhatsAppUrl('Hi Aparna Aura, I have a question about your jewellery collection.');

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Aparna Aura on WhatsApp"
      title="Chat with Aparna Aura on WhatsApp"
      className="fixed bottom-20 md:bottom-6 right-5 md:right-6 z-40 group flex items-center gap-3 transition-transform duration-300 hover:scale-105"
    >
      {/* Tooltip Label (Desktop Hover) */}
      <span className="hidden md:inline-block px-3.5 py-1.5 rounded-full bg-[#1b0918] text-[#eed498] text-xs font-semibold shadow-xl border border-[#d8b979]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        Chat on WhatsApp
      </span>

      {/* Button Circle */}
      <div className="relative flex items-center justify-center w-13 h-13 rounded-full bg-[#25D366] text-white shadow-[0_8px_25px_rgba(37,211,102,0.45)] hover:bg-[#20ba5a] transition-all p-3">
        {/* Subtle Pulse Ring */}
        <span className="absolute -inset-1 rounded-full bg-[#25D366]/30 animate-ping pointer-events-none" />

        {/* WhatsApp Icon */}
        <svg
          viewBox="0 0 24 24"
          width="26"
          height="26"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.764.459 3.487 1.334 5.006l-1.42 5.187 5.308-1.393c1.464.798 3.116 1.218 4.764 1.219h.004c5.506 0 9.99-4.479 9.99-9.986 0-2.668-1.038-5.176-2.924-7.062a9.923 9.923 0 0 0-7.066-2.955zm0 1.635c4.604 0 8.354 3.75 8.355 8.35 0 2.233-.87 4.332-2.449 5.91a8.303 8.303 0 0 1-5.908 2.474h-.003c-1.479 0-2.936-.395-4.212-1.144l-.302-.178-3.131.821.835-3.053-.195-.31a8.307 8.307 0 0 1-1.272-4.52c0-4.6 3.751-8.35 8.354-8.35zm-3.642 4.298c-.144 0-.376.054-.572.27-.197.217-.75.733-.75 1.788 0 1.054.768 2.071.876 2.217.108.146 1.512 2.308 3.662 3.236.512.221.912.353 1.224.452.514.163.982.14 1.352.085.413-.062 1.272-.52 1.451-1.022.179-.502.179-.933.125-1.023-.054-.09-.197-.144-.412-.252-.215-.108-1.272-.628-1.469-.699-.197-.072-.341-.108-.484.108-.144.217-.556.699-.681.843-.125.144-.25.163-.465.054-.215-.108-.908-.335-1.73-1.068-.64-.57-1.072-1.274-1.198-1.49-.125-.216-.013-.333.095-.44.097-.097.215-.252.323-.378.108-.126.144-.217.215-.361.072-.144.036-.27-.018-.378-.054-.108-.484-1.168-.663-1.599-.175-.42-.352-.363-.483-.37l-.412-.008z" />
        </svg>
      </div>
    </a>
  );
};

export default FloatingWhatsApp;
