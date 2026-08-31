import React, { useEffect } from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, ArrowRight, ShoppingBag, Sparkles, Gift } from 'lucide-react';
import confetti from 'canvas-confetti';

const OrderSuccess = () => {
  const location = useLocation();
  const orderId = location.state?.orderId;

  useEffect(() => {
    if (orderId) {
      // Luxury gold confetti blast
      const end = Date.now() + 2.5 * 1000;
      const colors = ['#D4AF37', '#e0c55c', '#382135', '#ffffff'];

      (function frame() {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors,
          zIndex: 100
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors,
          zIndex: 100
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      }());
    }
  }, [orderId]);

  if (!orderId) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-[#FAF8F5]">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white rounded-full blur-[120px] opacity-80 pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-xl w-full bg-white p-8 md:p-12 rounded-[2rem] border border-[#E6E1D8] shadow-2xl relative z-10 text-center"
      >
        <motion.div 
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 20 }}
          className="w-24 h-24 bg-[#D4AF37]/10 text-[#D4AF37] rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-white shadow-lg shadow-[#D4AF37]/20"
        >
          <Gift size={44} strokeWidth={1.5} />
        </motion.div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-[#382135] mb-3" style={{ fontFamily: '"Playfair Display", serif' }}>
          Thank You
        </h1>
        <p className="text-gray-500 mb-8 text-lg">
          Your exquisite selection is being prepared with the utmost care.
        </p>

        {/* Order Card */}
        <div className="bg-[#FAF8F5] rounded-2xl p-6 mb-8 border border-[#E6E1D8] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#D4AF37]/5 rounded-bl-full pointer-events-none" />
          <div className="flex items-center gap-3 text-sm text-[#382135] font-bold justify-center mb-2 tracking-wide">
            <Package size={18} className="text-[#D4AF37]" />
            ORDER #{orderId.slice(0, 8).toUpperCase()}
          </div>
          <p className="text-sm text-gray-500 leading-relaxed max-w-sm mx-auto">
            We've sent a confirmation email to you. We will notify you when your order is on its way.
          </p>
        </div>

        {/* Luxury Packaging Teaser */}
        <div className="flex items-center gap-4 text-left bg-gradient-to-r from-[#382135] to-[#4D2C48] rounded-2xl p-5 mb-10 text-white shadow-lg">
          <div className="w-12 h-12 rounded-full bg-[#D4AF37]/20 flex items-center justify-center flex-shrink-0">
            <Sparkles size={24} className="text-[#D4AF37]" />
          </div>
          <div>
            <p className="font-bold text-sm mb-0.5">The Premium Unboxing</p>
            <p className="text-xs text-white/70">Your piece will arrive in our signature wooden box with a hallmark certificate.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link 
            to={`/orders/${orderId}`}
            className="flex items-center justify-center gap-2 bg-[#382135] text-white py-4 px-6 rounded-full font-semibold hover:bg-[#2a1827] transition-all shadow-lg shadow-[#382135]/20"
          >
            Track Order <ArrowRight size={18} />
          </Link>
          <Link 
            to="/products"
            className="flex items-center justify-center gap-2 bg-white text-[#382135] py-4 px-6 rounded-full font-semibold border-2 border-[#E6E1D8] hover:border-[#D4AF37] transition-colors"
          >
            <ShoppingBag size={18} /> Keep Shopping
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default OrderSuccess;
