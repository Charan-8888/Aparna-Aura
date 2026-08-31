import React from 'react';
import { motion } from 'framer-motion';
import { APP_NAME } from '../../constants/app';

const Loader = ({ fullScreen = false }) => {
  const containerClasses = fullScreen 
    ? "fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FAF8F5]/90 backdrop-blur-md"
    : "flex flex-col justify-center items-center p-12";

  return (
    <div className={containerClasses}>
      {/* Luxury branded spinner */}
      <div className="relative">
        {/* Outer gold ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
          className="w-14 h-14 rounded-full border-2 border-transparent"
          style={{ borderTopColor: '#D4AF37', borderRightColor: '#D4AF37' }}
        />
        {/* Inner brand ring */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-1.5 rounded-full border-2 border-transparent"
          style={{ borderBottomColor: '#382135', borderLeftColor: '#382135' }}
        />
        {/* Center diamond dot */}
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-2 h-2 rounded-full bg-[#D4AF37]" />
        </motion.div>
      </div>

      {fullScreen && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-5 text-xs font-medium tracking-[0.25em] text-[#382135]/40 uppercase"
          style={{ fontFamily: '"Playfair Display", serif' }}
        >
          {APP_NAME}
        </motion.p>
      )}
    </div>
  );
};

export default Loader;
