import React from 'react';
import { motion } from 'framer-motion';

const EmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  action 
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center min-h-[46vh] p-8 text-center rounded-[28px] border border-[#e2d5c0] bg-white/75 shadow-[0_20px_60px_rgba(48,27,47,0.07)] backdrop-blur"
    >
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-[var(--color-brand)]/5 rounded-full scale-[1.5]" />
        <div className="absolute inset-0 bg-[var(--color-accent)]/10 rounded-full scale-[1.2]" />
        {Icon && (
          <div className="relative w-24 h-24 bg-gradient-to-br from-white to-[#f5ecdc] shadow-[0_18px_45px_rgba(48,27,47,0.12)] border border-[#d9c7a8] rounded-full flex items-center justify-center text-[var(--color-brand)] z-10">
            <Icon size={40} strokeWidth={1.5} />
          </div>
        )}
      </div>
      <h3 className="text-2xl font-heading font-bold text-[var(--color-brand)] mb-3">
        {title}
      </h3>
      {description && (
        <p className="text-[var(--color-muted)] text-base max-w-sm mb-8 leading-relaxed">
          {description}
        </p>
      )}
      {action && (
        <div className="mt-2">
          {action}
        </div>
      )}
    </motion.div>
  );
};

export default EmptyState;
