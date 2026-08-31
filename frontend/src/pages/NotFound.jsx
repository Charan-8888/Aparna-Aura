import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Search, Home } from 'lucide-react';
import { APP_NAME } from '../constants/app';

const NotFound = () => {
  return (
    <div className="min-h-[85vh] flex items-center justify-center relative overflow-hidden bg-white">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#F3EFE8] rounded-full blur-[100px] opacity-60 pointer-events-none" />
      
      <div className="aura-route-hero aura-route-hero--center max-w-2xl mx-auto px-8 py-14 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-[#D4AF37] font-bold text-9xl md:text-[150px] leading-none mb-4" style={{ fontFamily: '"Playfair Display", serif' }}>
            404
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#382135] mb-4">
            Page Not Found
          </h1>
          <p className="text-gray-500 mb-10 max-w-md mx-auto text-sm md:text-base leading-relaxed">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/"
              className="flex items-center justify-center gap-2 px-8 py-3.5 bg-[#382135] text-white rounded-full font-semibold hover:bg-[#2a1827] transition-all shadow-lg shadow-[#382135]/20 w-full sm:w-auto"
            >
              <Home size={18} />
              Return Home
            </Link>
            <Link
              to="/products"
              className="flex items-center justify-center gap-2 px-8 py-3.5 bg-white border-2 border-[#E6E1D8] text-[#382135] rounded-full font-semibold hover:border-[#D4AF37] transition-all w-full sm:w-auto"
            >
              <Search size={18} />
              Shop Collection
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
