import React, { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './Navbar/Navbar';
import Footer from './Footer/Footer';
import Loader from '../components/Loader/Loader';
import ToastContainer from '../components/Toast/Toast';
import ScrollToTop from '../components/ScrollToTop/ScrollToTop';
import FloatingWhatsApp from '../components/FloatingWhatsApp/FloatingWhatsApp';

// Scroll-to-top on route change
const ScrollReset = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [pathname]);
  return null;
};

const MainLayout = () => {
  const location = useLocation();
  const routeKey = location.pathname === '/'
    ? 'home'
    : (location.pathname.split('/').filter(Boolean)[0] || 'page').replace(/[^a-z0-9-]/gi, '-');

  return (
    <div className="flex flex-col min-h-screen bg-[#fbf8f2] text-[var(--color-text-main)] transition-colors duration-300">
      <ScrollReset />
      <Navbar />
      
      {/* 
        Main content area wrapper.
        The top padding accounts for the fixed navbar height.
      */}
      <main className={`flex-grow pb-0 ${routeKey === 'home' ? 'pt-28' : 'pt-28 interior-main'}`}>
        <Suspense fallback={<Loader fullScreen />}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              className={`site-page site-page--${routeKey}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </Suspense>
      </main>
      
      <Footer />
      <ScrollToTop />
      <FloatingWhatsApp />
      <ToastContainer />
    </div>
  );
};

export default MainLayout;
