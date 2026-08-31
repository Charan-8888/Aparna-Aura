import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const CategoryHero = ({ config }) => {
  if (!config) return null;

  const handleScrollToProducts = () => {
    const element = document.getElementById('category-products');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative w-full h-[440px] sm:h-[480px] md:h-[500px] lg:h-[520px] overflow-hidden bg-[#180c16]">
      {/* ── Full-Width Background Photography ── */}
      <picture className="absolute inset-0 w-full h-full">
        {config.mobileImage && (
          <source
            media="(max-width: 640px)"
            srcSet={config.mobileImage}
            type="image/webp"
          />
        )}
        <source srcSet={config.image} type="image/webp" />
        <img
          src={config.imageFallback || config.image}
          alt={config.title}
          className="w-full h-full object-cover transition-all duration-700"
          style={{
            objectPosition: window.innerWidth < 640 ? (config.mobilePosition || 'center') : (config.desktopPosition || 'center right'),
          }}
          loading="eager"
        />
      </picture>

      {/* ── Gradient Overlay for Contrast & Visual Balance ── */}
      <div
        className="absolute inset-0 hidden sm:block pointer-events-none"
        style={{ background: config.overlay }}
      />
      <div
        className="absolute inset-0 sm:hidden pointer-events-none"
        style={{ background: config.mobileOverlay || config.overlay }}
      />

      {/* ── Hero Content Container (Text Left, Jewellery Right) ── */}
      <div className="relative z-10 max-w-7xl mx-auto h-full px-5 sm:px-6 lg:px-8 flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-xl md:max-w-lg lg:max-w-xl text-left"
        >
          {/* Eyebrow */}
          <span className="inline-block text-xs sm:text-sm font-bold tracking-[0.25em] text-[#D4AF37] uppercase mb-3 drop-shadow-sm">
            {config.eyebrow}
          </span>

          {/* Large Serif Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white font-heading tracking-wide mb-4 drop-shadow-md">
            {config.title}
          </h1>

          {/* Short Copy */}
          {config.description && (
            <p className="text-white/85 text-sm sm:text-base md:text-lg max-w-lg mb-8 leading-relaxed font-light drop-shadow-sm">
              {config.description}
            </p>
          )}

          {/* Restrained Gold Accent CTA */}
          <button
            onClick={handleScrollToProducts}
            className="group inline-flex items-center gap-2.5 px-6 sm:px-7 py-3 sm:py-3.5 rounded-full border border-[#D4AF37]/70 bg-black/35 backdrop-blur-md text-[#F9F6F0] font-medium text-xs sm:text-sm tracking-wider uppercase hover:bg-[#D4AF37] hover:text-[#180c16] hover:border-[#D4AF37] transition-all duration-300 shadow-xl cursor-pointer"
          >
            <span>{config.cta || `Explore ${config.title}`}</span>
            <ChevronDown size={16} className="text-[#D4AF37] group-hover:text-[#180c16] transition-colors duration-300 transform group-hover:translate-y-0.5" />
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default CategoryHero;
