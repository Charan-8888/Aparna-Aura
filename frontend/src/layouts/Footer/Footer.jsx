import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Award, Truck, Gem, MessageCircle, ShoppingBag } from 'lucide-react';
import { FOOTER_SECTIONS } from '../../constants/navigation';
import { APP_NAME } from '../../constants/app';
import { SOCIAL_LINKS, getWhatsAppUrl } from '../../constants/socialLinks';

const InstagramIcon = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const TRUST_BADGES = [
  { icon: Shield, label: 'SSL Secure', desc: 'Encrypted Checkout' },
  { icon: Award, label: 'Hallmark Certified', desc: 'BIS Standard' },
  { icon: Gem, label: '100% Genuine', desc: 'Authentic Jewellery' },
  { icon: Truck, label: 'Insured Delivery', desc: 'Safe & Tracked' },
];

const Footer = () => {
  return (
    <footer className="relative mt-8 bg-[#301b2f] text-white">
      {/* Trust Badges Bar */}
      <div className="border-b border-white/5">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {TRUST_BADGES.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-center gap-3 group">
                <div className="w-11 h-11 rounded-full bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#D4AF37]/20 transition-colors duration-300">
                  <Icon size={20} className="text-[#D4AF37]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{label}</p>
                  <p className="text-xs text-white/40">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gold Divider */}
      <div className="gold-divider" />

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 pt-20 pb-9">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-12">

          {/* Brand & Newsletter */}
          <div className="lg:col-span-2">
            <Link to="/" className="text-4xl font-medium font-heading text-[#f1d593] tracking-wide mb-6 inline-block">
              {APP_NAME}
            </Link>
            <p className="text-white/50 mb-8 max-w-md leading-relaxed text-sm">
              Discover our exquisite collection of premium jewellery designed to elevate your everyday elegance and celebrate life's special moments.
            </p>

            <div className="mb-8">
              <h4 className="text-[10px] font-bold text-white/70 uppercase tracking-[0.22em] mb-4">
                Subscribe to our Newsletter
              </h4>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-white/5 border border-white/10 rounded-l-full px-5 py-3.5 w-full focus:outline-none focus:border-[#D4AF37] text-white placeholder:text-white/30 text-sm transition-colors"
                />
                <button className="bg-[#D4AF37] hover:bg-[#e0c55c] text-[#382135] px-5 py-3 rounded-r-full transition-colors flex items-center justify-center font-semibold">
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat with Aparna Aura on WhatsApp"
                title="Chat with Aparna Aura on WhatsApp"
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-[#25D366]/20 flex items-center justify-center text-white/60 hover:text-[#25D366] transition-all duration-300 border border-white/10"
              >
                <MessageCircle size={18} />
              </a>

              <a
                href={SOCIAL_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit Aparna Aura on Instagram"
                title="Visit Aparna Aura on Instagram"
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-[#E1306C]/20 flex items-center justify-center text-white/60 hover:text-[#E1306C] transition-all duration-300 border border-white/10"
              >
                <InstagramIcon size={18} />
              </a>

              <a
                href={SOCIAL_LINKS.meesho}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Shop Aparna Aura on Meesho"
                title="Shop Aparna Aura on Meesho"
                className="px-3.5 h-10 rounded-xl bg-white/5 hover:bg-[#D4AF37]/20 flex items-center justify-center text-white/60 hover:text-[#D4AF37] text-xs font-bold transition-all duration-300 border border-white/10 gap-1.5"
              >
                <ShoppingBag size={16} />
                <span>Meesho</span>
              </a>
            </div>
          </div>

          {/* Links Sections */}
          {FOOTER_SECTIONS.map((section, idx) => (
            <div key={idx}>
              <h4 className="text-[10px] font-bold text-white/70 uppercase tracking-[0.22em] mb-6">
                {section.title}
              </h4>
              <ul className="space-y-3.5">
                {section.links.map((link, linkIdx) => (
                  <li key={linkIdx}>
                    <Link
                      to={link.path}
                      className="text-white/40 hover:text-[#D4AF37] transition-colors text-sm inline-flex items-center gap-1 group"
                    >
                      <span className="w-0 group-hover:w-2 transition-all duration-300 overflow-hidden">→</span>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </div>

        {/* Gold Divider */}
        <div className="gold-divider mb-8" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/25">
            &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved. Handcrafted with passion.
          </p>
          <div className="flex items-center gap-6 text-xs text-white/25">
            <span>Premium Quality</span>
            <span className="w-1 h-1 rounded-full bg-[#D4AF37]/40" />
            <span>Secure Checkout</span>
            <span className="w-1 h-1 rounded-full bg-[#D4AF37]/40" />
            <span>Made in India</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
