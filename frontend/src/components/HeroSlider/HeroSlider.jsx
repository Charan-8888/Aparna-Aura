import React, { memo, useCallback, useEffect, useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  Camera,
  ChevronLeft,
  ChevronRight,
  Gem,
  Gift,
  ShieldCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Real Aparna Aura product showcase items powered by Cloudinary HD images
const SHOWCASE_ITEMS = [
  {
    id: 1,
    eyebrow: 'Bridal & Ceremonial Edit',
    title: 'Grand Lakshmi Heritage Necklace',
    note: 'Antique gold-tone statement heritage necklace with deity centerpiece & coin-like detailing.',
    image: 'https://res.cloudinary.com/hnqsonlb/image/upload/v1787669843/aparna_aura/products/aura-p061/01.jpg',
    link: '/product/aura-grand-lakshmi-heritage-necklace-set',
    category: 'Necklace Sets',
  },
  {
    id: 2,
    eyebrow: 'Temple Collection',
    title: 'Antique Multicolour Temple Set',
    note: 'Sculpted temple design with vibrant ruby-green accents and matching ornate jhumkas.',
    image: 'https://res.cloudinary.com/hnqsonlb/image/upload/v1787669836/aparna_aura/products/aura-p058/03.jpg',
    link: '/product/aura-antique-multicolour-temple-necklace-set',
    category: 'Temple Jewellery',
  },
  {
    id: 3,
    eyebrow: 'Luxury Timepieces',
    title: 'Mint Charm Bracelet Watch',
    note: 'Jewellery-inspired bracelet watch with mint accents, crystal detailing and playful charms.',
    image: 'https://res.cloudinary.com/hnqsonlb/image/upload/v1787669701/aparna_aura/products/aura-p003/03.jpg',
    link: '/product/aura-mint-charm-bracelet-watch',
    category: 'Watches & Wristwear',
  },
  {
    id: 4,
    eyebrow: 'Everyday Sacred Elegance',
    title: 'Twin Bloom Mangalsutra',
    note: 'Refined black-bead chain with twin floral-inspired pendants for everyday graceful wear.',
    image: 'https://res.cloudinary.com/hnqsonlb/image/upload/v1787669689/aparna_aura/products/aura-p001/01.jpg',
    link: '/product/aura-twin-bloom-mangalsutra',
    category: 'Mangalsutra',
  },
  {
    id: 5,
    eyebrow: 'Statement Oxidised',
    title: 'Blush Paisley Oxidised Earrings',
    note: 'Oxidised drop earrings with soft blush-pink stones and delicate pearl-style fringe.',
    image: 'https://res.cloudinary.com/hnqsonlb/image/upload/v1787669716/aparna_aura/products/aura-p011/01.jpg',
    link: '/product/aura-blush-paisley-oxidised-earrings',
    category: 'Earrings',
  },
];

const AUTOPLAY_DURATION = 3500; // 3.5 seconds per slide - non-stop continuous auto-play

const HeroSlider = memo(() => {
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const startTimeRef = useRef(null);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % SHOWCASE_ITEMS.length);
    setProgress(0);
    startTimeRef.current = performance.now();
  }, []);

  const previous = useCallback(() => {
    setCurrent((prev) => (prev - 1 + SHOWCASE_ITEMS.length) % SHOWCASE_ITEMS.length);
    setProgress(0);
    startTimeRef.current = performance.now();
  }, []);

  const goTo = useCallback((index) => {
    setCurrent(index);
    setProgress(0);
    startTimeRef.current = performance.now();
  }, []);

  // Continuous uninterrupted auto-moving transition loop
  useEffect(() => {
    startTimeRef.current = performance.now();
    let frameId;

    const updateProgress = (now) => {
      const elapsed = now - startTimeRef.current;
      const pct = Math.min((elapsed / AUTOPLAY_DURATION) * 100, 100);
      setProgress(pct);

      if (elapsed >= AUTOPLAY_DURATION) {
        next();
      } else {
        frameId = requestAnimationFrame(updateProgress);
      }
    };

    frameId = requestAnimationFrame(updateProgress);

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [current, next]);

  const activeItem = SHOWCASE_ITEMS[current];

  return (
    <section
      className="relative isolate min-h-[760px] overflow-hidden bg-[#050506] pt-36 md:min-h-[850px] lg:h-[min(940px,100vh)]"
      aria-label="Featured jewellery collection"
    >
      {/* Background Hero Image with Dark Gradient Overlays */}
      <img
        src="/images/aparna-hero-jewellery.jpg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover object-center opacity-60"
        loading="eager"
        fetchPriority="high"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,2,3,.97)_0%,rgba(3,3,4,.88)_32%,rgba(3,3,4,.4)_58%,rgba(3,3,4,.75)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_36%,rgba(183,132,47,.15),transparent_35%)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#050506] to-transparent" />

      <div className="relative mx-auto grid h-full max-w-[1480px] grid-cols-1 items-center gap-14 px-5 pb-20 sm:px-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(380px,.72fr)] lg:gap-16 lg:px-12 xl:px-16">
        
        {/* Left Column: Brand Copy & CTA Buttons */}
        <div className="max-w-[690px] pt-8 lg:pt-0">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-7 flex items-center gap-4"
          >
            <span className="h-px w-11 bg-[#cda552]" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[#e0bc68]">
              Handcrafted Heritage
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.08 }}
            className="max-w-[650px] text-[clamp(3.8rem,7.5vw,7.2rem)] font-medium leading-[0.85] tracking-[-0.045em] text-[#fffdf8]"
          >
            Elegance,
            <span className="mt-3 block italic text-[#d5ab52]">Redefined.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8 max-w-[560px] text-base leading-8 text-white/70 md:text-lg"
          >
            Exquisite jewellery shaped by master artisans—created to make everyday moments feel ceremonial and life’s milestones unforgettable.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-9 flex flex-col gap-3 sm:flex-row"
          >
            <Link
              to="/products"
              className="group inline-flex min-h-14 items-center justify-center gap-4 rounded-full bg-[linear-gradient(135deg,#f2d28a,#bd8731)] px-8 text-sm font-bold uppercase tracking-[0.13em] text-[#1b1113] shadow-[0_18px_45px_rgba(183,132,47,.22)] transition duration-300 hover:-translate-y-0.5 hover:brightness-105"
            >
              Explore Collection
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/try-on"
              className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full border border-[#d1aa55]/55 bg-black/30 px-8 text-sm font-semibold uppercase tracking-[0.12em] text-[#f0cf82] backdrop-blur-md transition duration-300 hover:border-[#edcc80] hover:bg-[#d1aa55]/10"
            >
              <Camera size={17} />
              Virtual Try-On
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.42 }}
            className="mt-12 grid max-w-[660px] grid-cols-1 gap-5 border-t border-white/12 pt-7 sm:grid-cols-3"
          >
            {[
              { icon: Gem, title: 'Master Crafted', note: 'Detailed by hand' },
              { icon: ShieldCheck, title: 'Certified Authentic', note: 'Quality assured' },
              { icon: Gift, title: 'Luxury Boxed', note: 'Complimentary packaging' },
            ].map(({ icon: Icon, title, note }) => (
              <div key={title} className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d5ab52]/30 bg-[#d5ab52]/8 text-[#e4bd68]">
                  <Icon size={18} strokeWidth={1.6} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white/90">{title}</p>
                  <p className="mt-0.5 text-[11px] tracking-wide text-white/40">{note}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right Column: Non-Stop Continuous Auto-Moving Featured Card Carousel */}
        <div className="relative mx-auto w-full max-w-[470px] lg:mx-0 lg:justify-self-end">
          <div className="absolute -inset-10 rounded-full bg-[#b98638]/15 blur-3xl" />
          
          <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-[linear-gradient(155deg,rgba(255,255,255,.14),rgba(255,255,255,.03))] p-3 shadow-[0_40px_90px_rgba(0,0,0,.55)] backdrop-blur-xl">
            
            {/* Card Frame with Animated Slide Image */}
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.45rem] bg-[#110d10]">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeItem.id}
                  src={activeItem.image}
                  alt={activeItem.title}
                  initial={{ opacity: 0, scale: 1.06, x: 20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.96, x: -20 }}
                  transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1.0] }}
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="eager"
                />
              </AnimatePresence>

              {/* Gradient Scrim for Contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#080508] via-black/25 to-transparent" />

              {/* Active Product Details */}
              <div className="absolute inset-x-0 bottom-0 p-6 md:p-7">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`copy-${activeItem.id}`}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-[0.26em] text-[#e0b95f]">
                        {activeItem.eyebrow}
                      </span>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#d5ab52]/20 text-[#f0cf82] border border-[#d5ab52]/40 font-medium">
                        {activeItem.category}
                      </span>
                    </div>
                    
                    <h2 className="mt-1 text-2xl font-medium leading-tight text-white md:text-3xl">
                      {activeItem.title}
                    </h2>
                    
                    <p className="mt-2 max-w-sm text-sm leading-6 text-white/70 line-clamp-2">
                      {activeItem.note}
                    </p>
                    
                    <Link
                      to={activeItem.link}
                      className="mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#e9c779] transition hover:text-white group"
                    >
                      View the piece <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                    </Link>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* OTT Progress Line Indicators & Navigation Arrows */}
            <div className="flex items-center justify-between px-3 pb-1 pt-4">
              
              {/* OTT Progress Line Indicators */}
              <div className="flex items-center gap-2 flex-1 mr-4">
                {SHOWCASE_ITEMS.map((item, index) => {
                  const isActive = current === index;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => goTo(index)}
                      className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-white/20 transition-all duration-300 hover:bg-white/40"
                      aria-label={`Go to slide ${index + 1}: ${item.title}`}
                      title={item.title}
                    >
                      {isActive && (
                        <div
                          className="absolute inset-y-0 left-0 bg-[#d8af57] rounded-full transition-all duration-75 ease-linear"
                          style={{ width: `${progress}%` }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Navigation Arrows */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={previous}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/12 bg-white/5 text-white/70 transition hover:border-[#d8af57]/60 hover:text-[#e8c36f]"
                  aria-label="Previous jewellery"
                >
                  <ChevronLeft size={16} />
                </button>
                
                <button
                  type="button"
                  onClick={next}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/12 bg-white/5 text-white/70 transition hover:border-[#d8af57]/60 hover:text-[#e8c36f]"
                  aria-label="Next jewellery"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
});

HeroSlider.displayName = 'HeroSlider';

export default HeroSlider;
