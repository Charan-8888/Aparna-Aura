import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

const COLLECTION_SLIDES = [
  {
    id: 'royal-purple',
    image: '/images/collection-heroes/royal-purple-hero.webp',
    imageFallback: '/images/collection-heroes/royal-purple-hero.png',
    mobileImage: '/images/collection-heroes/royal-purple-hero-mobile.webp',
    alt: 'Aparna Aura royal purple bridal jewellery editorial portrait',
    desktopPosition: '72% center',
    mobilePosition: '66% center',
  },
  {
    id: 'emerald-portrait',
    image: '/images/collection-heroes/emerald-portrait-hero.webp',
    imageFallback: '/images/collection-heroes/emerald-portrait-hero.png',
    mobileImage: '/images/collection-heroes/emerald-portrait-hero-mobile.webp',
    alt: 'Aparna Aura emerald bridal jewellery editorial in chiaroscuro',
    desktopPosition: '73% center',
    mobilePosition: '68% center',
  },
  {
    id: 'golden-portrait',
    image: '/images/collection-heroes/golden-portrait-hero.webp',
    imageFallback: '/images/collection-heroes/golden-portrait-hero.png',
    mobileImage: '/images/collection-heroes/golden-portrait-hero-mobile.webp',
    alt: 'Aparna Aura glamorous golden bridal jewellery editorial portrait',
    desktopPosition: '74% center',
    mobilePosition: '70% center',
  },
  {
    id: 'burgundy-portrait',
    image: '/images/collection-heroes/burgundy-portrait-hero.webp',
    imageFallback: '/images/collection-heroes/burgundy-portrait-hero.png',
    mobileImage: '/images/collection-heroes/burgundy-portrait-hero-mobile.webp',
    alt: 'Aparna Aura regal burgundy bridal jewellery portrait',
    desktopPosition: '72% center',
    mobilePosition: '67% center',
  },
];

const CollectionHero = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Preload all slide images immediately for instant crossfading
  useEffect(() => {
    COLLECTION_SLIDES.forEach((slide) => {
      const img = new Image();
      img.src = slide.image;
      if (slide.mobileImage) {
        const mobImg = new Image();
        mobImg.src = slide.mobileImage;
      }
    });
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % COLLECTION_SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + COLLECTION_SLIDES.length) % COLLECTION_SLIDES.length);
  }, []);

  // Continuous Automatic Slide Rotation (5000ms interval)
  useEffect(() => {
    // Only pause if user is actively hovering over interactive buttons
    if (isHovered) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % COLLECTION_SLIDES.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isHovered]);

  const handleScrollToCollections = () => {
    const element = document.getElementById('collections-grid');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: window.innerHeight * 0.65, behavior: 'smooth' });
    }
  };

  // Mobile Touch Swipe Handling
  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 50) {
      nextSlide(); // Swipe left -> next
    } else if (distance < -50) {
      prevSlide(); // Swipe right -> prev
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight') {
      nextSlide();
    } else if (e.key === 'ArrowLeft') {
      prevSlide();
    }
  };

  return (
    <div
      role="region"
      aria-label="Aparna Aura Jewellery Campaign Carousel"
      className="relative w-full min-h-[480px] sm:min-h-[540px] md:min-h-[560px] h-[58vh] max-h-[720px] overflow-hidden bg-[#0f050d] select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* ── Rotating Background Campaign Photographs ── */}
      <div className="absolute inset-0 w-full h-full">
        {COLLECTION_SLIDES.map((slide, index) => {
          const isActive = index === currentIndex;
          return (
            <motion.div
              key={slide.id}
              initial={false}
              animate={{ opacity: isActive ? 1 : 0 }}
              transition={{
                duration: 1.2,
                ease: 'easeInOut',
              }}
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ zIndex: isActive ? 10 : 1 }}
            >
              <picture className="w-full h-full block">
                {slide.mobileImage && (
                  <source
                    media="(max-width: 640px)"
                    srcSet={slide.mobileImage}
                    type="image/webp"
                  />
                )}
                <source srcSet={slide.image} type="image/webp" />
                <motion.img
                  src={slide.imageFallback || slide.image}
                  alt={slide.alt}
                  key={`${slide.id}-${isActive}`}
                  initial={{ scale: 1 }}
                  animate={isActive ? { scale: 1.035 } : { scale: 1 }}
                  transition={{
                    duration: 5.0,
                    ease: 'easeOut',
                  }}
                  className="w-full h-full object-cover"
                  style={{
                    objectPosition: window.innerWidth < 640 ? slide.mobilePosition : slide.desktopPosition,
                  }}
                  loading={index === 0 ? 'eager' : 'lazy'}
                />
              </picture>
            </motion.div>
          );
        })}
      </div>

      {/* ── Dark Luxury Plum Directional Gradient Overlays ── */}
      <div
        className="absolute inset-0 z-20 hidden sm:block pointer-events-none"
        style={{
          background:
            'linear-gradient(90deg, rgba(15, 5, 13, 0.94) 0%, rgba(28, 10, 24, 0.82) 28%, rgba(32, 12, 28, 0.50) 48%, rgba(20, 8, 18, 0.10) 70%, rgba(0, 0, 0, 0.02) 100%)',
        }}
      />
      <div
        className="absolute inset-0 z-20 sm:hidden pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, rgba(15, 5, 13, 0.90) 0%, rgba(28, 10, 24, 0.75) 55%, rgba(20, 8, 18, 0.30) 100%)',
        }}
      />

      {/* ── Fixed Hero Content (Text Left, Model Right) ── */}
      <div className="relative z-30 max-w-7xl mx-auto h-full px-5 sm:px-6 lg:px-8 flex flex-col justify-center pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-xl md:max-w-lg lg:max-w-xl text-left pointer-events-auto"
        >
          {/* Eyebrow */}
          <span className="inline-block text-xs sm:text-sm font-bold tracking-[0.28em] text-[#D4AF37] uppercase mb-3 drop-shadow-sm">
            APARNA AURA COLLECTION
          </span>

          {/* Fixed Main Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white font-heading tracking-wide mb-4 drop-shadow-md">
            Our Collections
          </h1>

          {/* Description */}
          <p className="text-white/85 text-sm sm:text-base md:text-lg max-w-lg mb-8 leading-relaxed font-light drop-shadow-sm">
            Discover jewellery designed to make every moment unforgettable.
          </p>

          {/* Restrained Gold Accent CTA */}
          <button
            onClick={handleScrollToCollections}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group inline-flex items-center gap-2.5 px-6 sm:px-7 py-3 sm:py-3.5 rounded-full border border-[#D4AF37]/75 bg-black/40 backdrop-blur-md text-[#F9F6F0] font-medium text-xs sm:text-sm tracking-wider uppercase hover:bg-[#D4AF37] hover:text-[#0f050d] hover:border-[#D4AF37] transition-all duration-300 shadow-2xl cursor-pointer"
          >
            <span>Explore Collections</span>
            <ChevronDown size={16} className="text-[#D4AF37] group-hover:text-[#0f050d] transition-colors duration-300 transform group-hover:translate-y-0.5" />
          </button>
        </motion.div>
      </div>

      {/* ── Subtle Arrow Controls (Desktop) ── */}
      <div
        className="hidden md:flex absolute inset-y-0 right-4 z-40 items-center gap-2 pointer-events-none"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <button
          onClick={prevSlide}
          aria-label="Previous campaign slide"
          className="pointer-events-auto p-2.5 rounded-full border border-white/20 bg-black/30 backdrop-blur-md text-white/80 hover:text-white hover:border-[#D4AF37] hover:bg-black/60 transition-all duration-300"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={nextSlide}
          aria-label="Next campaign slide"
          className="pointer-events-auto p-2.5 rounded-full border border-white/20 bg-black/30 backdrop-blur-md text-white/80 hover:text-white hover:border-[#D4AF37] hover:bg-black/60 transition-all duration-300"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* ── Navigation Dots (Bottom Left / Center) ── */}
      <div
        className="absolute bottom-6 left-5 sm:left-6 md:left-8 lg:left-12 z-40 flex items-center gap-2.5"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {COLLECTION_SLIDES.map((slide, index) => {
          const isActive = index === currentIndex;
          return (
            <button
              key={slide.id}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={isActive ? 'true' : 'false'}
              className={`h-2 rounded-full transition-all duration-500 cursor-pointer ${
                isActive
                  ? 'w-7 bg-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.6)]'
                  : 'w-2 bg-white/40 hover:bg-white/70'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
};

export default CollectionHero;
