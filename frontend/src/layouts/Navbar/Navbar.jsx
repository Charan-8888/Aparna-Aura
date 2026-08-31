import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronDown,
  Heart,
  LogOut,
  MapPin,
  Menu,
  Package,
  Search,
  ShoppingBag,
  Sparkles,
  User,
  X,
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import SearchOverlay from '../../components/SearchOverlay/SearchOverlay';
import { APP_NAME } from '../../constants/app';
import { MAIN_NAV_LINKS } from '../../constants/navigation';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../hooks/useWishlist';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const { currentUser, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const { wishlistCount } = useWishlist();

  const isHome = location.pathname === '/';
  const darkHeader = isHome && !isScrolled;
  const foreground = darkHeader ? 'text-white/72 hover:text-[#e8c36f]' : 'text-[#5d5451] hover:text-[#2c1a2b]';
  const iconForeground = darkHeader ? 'text-white/78 hover:text-[#e8c36f] hover:bg-white/6' : 'text-[#5d5451] hover:text-[#2c1a2b] hover:bg-[#f5efe7]';

  const initials = currentUser
    ? [currentUser.first_name, currentUser.last_name]
        .filter(Boolean)
        .map((name) => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || currentUser.email?.[0]?.toUpperCase() || 'U'
    : '';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserDropdownOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const closeSearch = useCallback(() => setIsSearchOpen(false), []);

  const handleLogout = async () => {
    setIsUserDropdownOpen(false);
    setIsMobileMenuOpen(false);
    await logout();
    navigate('/');
  };

  return (
    <>
      <AnimatePresence>
        {showAnnouncement && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 38, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="fixed inset-x-0 top-0 z-[60] overflow-hidden border-b border-[#d0aa59]/15 bg-[#2c1429]"
          >
            <div className="relative mx-auto flex h-[38px] max-w-[1480px] items-center justify-center px-10">
              <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/76 sm:text-xs">
                <Sparkles size={13} className="text-[#e2bd67]" />
                <span className="hidden sm:inline">Free insured shipping on orders over ₹5,000</span>
                <span className="sm:hidden">Free shipping over ₹5,000</span>
                <span className="h-4 w-px bg-white/20" />
                <span className="text-[#e2bd67]">Certified authentic jewellery</span>
              </div>
              <button
                type="button"
                onClick={() => setShowAnnouncement(false)}
                className="absolute right-4 rounded-full p-1.5 text-white/35 transition hover:bg-white/5 hover:text-white"
                aria-label="Close announcement"
              >
                <X size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header
        className={`fixed inset-x-0 z-50 transition-all duration-400 ${showAnnouncement ? 'top-[38px]' : 'top-0'} ${
          darkHeader
            ? 'border-b border-[#d2aa55]/20 bg-[#060607]/88 py-4 backdrop-blur-xl'
            : 'border-b border-[#2f1b2d]/8 bg-[#fffdf8]/96 py-3 shadow-[0_10px_35px_rgba(35,22,31,.07)] backdrop-blur-xl'
        }`}
      >
        <div className="mx-auto flex max-w-[1480px] items-center justify-between px-5 sm:px-8 lg:px-12 xl:px-16">
          <Link to="/" className="group relative z-50 flex items-center gap-3">
            <span
              className={`text-[1.75rem] font-medium tracking-[0.025em] transition-colors md:text-[2rem] ${
                darkHeader ? 'text-[#efcd7c]' : 'text-[#321d30]'
              }`}
              style={{ fontFamily: '"Playfair Display", serif' }}
            >
              {APP_NAME}
            </span>
            <span className="-mt-5 text-[#d9ad50]">✦</span>
          </Link>

          <nav className="hidden items-center gap-8 lg:flex xl:gap-10" aria-label="Primary navigation">
            {MAIN_NAV_LINKS.map((link) => {
              const active = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`group relative py-2 text-[13px] font-semibold tracking-[0.04em] transition ${
                    active ? (darkHeader ? 'text-[#e8c36f]' : 'text-[#2f1b2d]') : foreground
                  }`}
                >
                  {link.label}
                  <span
                    className={`absolute inset-x-0 -bottom-1 mx-auto h-px bg-[#d1a64e] transition-all duration-300 ${
                      active ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-1 md:flex">
            <button type="button" onClick={() => setIsSearchOpen(true)} className={`rounded-full p-2.5 transition ${iconForeground}`} aria-label="Search">
              <Search size={19} strokeWidth={1.7} />
            </button>
            <Link to="/wishlist" className={`relative rounded-full p-2.5 transition ${iconForeground}`} aria-label="Wishlist">
              <Heart size={19} strokeWidth={1.7} />
              {isAuthenticated && wishlistCount > 0 && (
                <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#d9ad50] px-1 text-[9px] font-bold text-[#21111f]">
                  {wishlistCount > 9 ? '9+' : wishlistCount}
                </span>
              )}
            </Link>
            <Link to="/cart" className={`relative rounded-full p-2.5 transition ${iconForeground}`} aria-label="Shopping bag">
              <ShoppingBag size={19} strokeWidth={1.7} />
              {itemCount > 0 && (
                <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#d9ad50] px-1 text-[9px] font-bold text-[#21111f]">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div ref={dropdownRef} className="relative ml-2">
                <button
                  type="button"
                  onClick={() => setIsUserDropdownOpen((open) => !open)}
                  className={`flex items-center gap-2 rounded-full border px-2 py-1.5 transition ${
                    darkHeader ? 'border-white/12 bg-white/5 text-white' : 'border-[#2f1b2d]/10 bg-[#f7f2ea] text-[#2f1b2d]'
                  }`}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3a2136] text-xs font-bold text-[#efcd7c]">{initials}</span>
                  <ChevronDown size={13} className={`transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isUserDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.97 }}
                      className="absolute right-0 top-full mt-3 w-60 overflow-hidden rounded-2xl border border-[#2f1b2d]/8 bg-[#fffdf9] py-2 shadow-[0_25px_70px_rgba(37,20,35,.18)]"
                    >
                      <div className="border-b border-[#2f1b2d]/8 px-4 py-3">
                        <p className="truncate text-sm font-semibold text-[#2f1b2d]">{[currentUser.first_name, currentUser.last_name].filter(Boolean).join(' ') || 'Member'}</p>
                        <p className="truncate text-xs text-[#8a7e79]">{currentUser.email}</p>
                      </div>
                      {[
                        { to: '/profile', icon: User, label: 'My Profile' },
                        { to: '/orders', icon: Package, label: 'My Orders' },
                        { to: '/addresses', icon: MapPin, label: 'My Addresses' },
                      ].map(({ to, icon: Icon, label }) => (
                        <Link key={to} to={to} className="flex items-center gap-3 px-4 py-3 text-sm text-[#675c58] transition hover:bg-[#f5efe7] hover:text-[#2f1b2d]">
                          <Icon size={15} className="text-[#bd8731]" /> {label}
                        </Link>
                      ))}
                      <button type="button" onClick={handleLogout} className="flex w-full items-center gap-3 border-t border-[#2f1b2d]/8 px-4 py-3 text-sm text-red-600 transition hover:bg-red-50">
                        <LogOut size={15} /> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="ml-3 flex items-center gap-2">
                <Link to="/login" className={`px-3 py-2 text-sm font-semibold transition ${darkHeader ? 'text-white/75 hover:text-white' : 'text-[#645955] hover:text-[#2f1b2d]'}`}>
                  Login
                </Link>
                <Link
                  to="/register"
                  className="rounded-full bg-[linear-gradient(135deg,#efd18a,#bd8731)] px-5 py-2.5 text-sm font-bold text-[#23131f] shadow-[0_10px_28px_rgba(189,135,49,.18)] transition hover:-translate-y-0.5 hover:brightness-105"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 md:hidden">
            <button type="button" onClick={() => setIsSearchOpen(true)} className={`rounded-full p-2 ${iconForeground}`} aria-label="Search">
              <Search size={20} />
            </button>
            <Link to="/cart" className={`relative rounded-full p-2 ${iconForeground}`} aria-label="Shopping bag">
              <ShoppingBag size={20} />
              {itemCount > 0 && <span className="absolute right-0 top-0 h-4 min-w-4 rounded-full bg-[#d9ad50] px-1 text-center text-[9px] font-bold text-[#21111f]">{itemCount > 9 ? '9+' : itemCount}</span>}
            </Link>
            <button type="button" onClick={() => setIsMobileMenuOpen((open) => !open)} className={`relative z-50 rounded-full p-2 ${iconForeground}`} aria-label="Toggle navigation menu">
              {isMobileMenuOpen ? <X size={23} /> : <Menu size={23} />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close navigation menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/65 backdrop-blur-sm md:hidden"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.45 }}
              className="fixed bottom-0 right-0 top-0 z-50 flex w-[86%] max-w-sm flex-col bg-[#fffdf9] shadow-2xl md:hidden"
            >
              <div className="border-b border-[#2f1b2d]/8 px-6 pb-6 pt-24">
                <p className="font-heading text-3xl text-[#2f1b2d]">{APP_NAME}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.2em] text-[#a77d32]">Fine jewellery, thoughtfully made</p>
              </div>
              <nav className="flex-1 space-y-1 overflow-y-auto px-5 py-6">
                {MAIN_NAV_LINKS.map((link, index) => (
                  <motion.div key={link.path} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}>
                    <Link to={link.path} className="flex items-center justify-between rounded-xl px-4 py-3.5 text-base font-medium text-[#4f4440] transition hover:bg-[#f4ede4] hover:text-[#2f1b2d]">
                      {link.label}<span className="text-[#bd8731]">→</span>
                    </Link>
                  </motion.div>
                ))}
              </nav>
              <div className="border-t border-[#2f1b2d]/8 p-6">
                {isAuthenticated ? (
                  <div className="grid grid-cols-3 gap-3 text-center text-xs">
                    <Link to="/wishlist" className="rounded-xl bg-[#f5efe7] p-3 text-[#5f5450]"><Heart size={20} className="mx-auto mb-1" />Wishlist</Link>
                    <Link to="/profile" className="rounded-xl bg-[#f5efe7] p-3 text-[#5f5450]"><User size={20} className="mx-auto mb-1" />Profile</Link>
                    <button type="button" onClick={handleLogout} className="rounded-xl bg-red-50 p-3 text-red-600"><LogOut size={20} className="mx-auto mb-1" />Sign out</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <Link to="/login" className="rounded-full border border-[#2f1b2d]/25 px-4 py-3 text-center text-sm font-semibold text-[#2f1b2d]">Login</Link>
                    <Link to="/register" className="rounded-full bg-[#2f1b2d] px-4 py-3 text-center text-sm font-semibold text-white">Register</Link>
                  </div>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <SearchOverlay isOpen={isSearchOpen} onClose={closeSearch} />
    </>
  );
};

export default Navbar;
