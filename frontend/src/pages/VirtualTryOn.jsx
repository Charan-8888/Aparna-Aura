import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, CameraOff, Sparkles, RotateCcw, ChevronLeft, ChevronRight, X, ArrowRight, Diamond } from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import { APP_NAME } from '../constants/app';

const TRYABLE_ITEMS = [
  {
    id: 1,
    name: 'Royal Kundan Necklace',
    category: 'Necklaces',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=200&h=200&fit=crop',
    overlay: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop&q=80',
    position: { top: '55%', left: '50%', width: '60%' },
    type: 'necklace',
  },
  {
    id: 2,
    name: 'Diamond Stud Earrings',
    category: 'Earrings',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=200&h=200&fit=crop',
    overlay: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop&q=80',
    position: { top: '30%', left: '50%', width: '70%' },
    type: 'earring',
  },
  {
    id: 3,
    name: 'Gold Bangles Set',
    category: 'Bracelets',
    image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=200&h=200&fit=crop',
    overlay: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&h=400&fit=crop&q=80',
    position: { top: '70%', left: '50%', width: '40%' },
    type: 'bracelet',
  },
  {
    id: 4,
    name: 'Solitaire Diamond Ring',
    category: 'Rings',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=200&h=200&fit=crop',
    overlay: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop&q=80',
    position: { top: '75%', left: '50%', width: '25%' },
    type: 'ring',
  },
];

const VirtualTryOn = () => {
  const [cameraActive, setCameraActive] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [cameraError, setCameraError] = useState('');
  const [overlayOpacity, setOverlayOpacity] = useState(0.85);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const startCamera = useCallback(async () => {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch (err) {
      setCameraError('Camera access denied. Please allow camera permissions and try again.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  useEffect(() => {
    return () => { stopCamera(); };
  }, [stopCamera]);

  const currentIndex = selectedItem ? TRYABLE_ITEMS.findIndex(i => i.id === selectedItem.id) : -1;
  const nextItem = () => {
    const next = (currentIndex + 1) % TRYABLE_ITEMS.length;
    setSelectedItem(TRYABLE_ITEMS[next]);
  };
  const prevItem = () => {
    const prev = (currentIndex - 1 + TRYABLE_ITEMS.length) % TRYABLE_ITEMS.length;
    setSelectedItem(TRYABLE_ITEMS[prev]);
  };

  return (
    <div className="container-default section-padding pb-20">
      <Breadcrumb items={[{ label: 'Virtual Try-On', path: '/try-on' }]} />

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="aura-route-hero aura-route-hero--center text-center mb-12 mt-4"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#D4AF37]/10 text-[#D4AF37] rounded-full text-xs font-bold uppercase tracking-wider mb-4">
          <Sparkles size={14} /> Beta Feature
        </div>
        <h1 className="text-3xl md:text-5xl font-bold text-[#382135] mb-3" style={{ fontFamily: '"Playfair Display", serif' }}>
          Virtual Try-On
        </h1>
        <p className="text-gray-500 max-w-lg mx-auto text-sm md:text-base">
          See how our jewellery looks on you in real-time. Use your camera to try on pieces before you buy.
        </p>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-8 max-w-5xl mx-auto">
        {/* Camera View */}
        <div className="flex-1">
          <div className="relative aspect-[3/4] md:aspect-[4/5] bg-[#1a1a2e] rounded-3xl overflow-hidden shadow-2xl">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
              style={{ transform: 'scaleX(-1)' }}
            />
            {cameraActive ? (
              <>
                {/* Jewellery Overlay */}
                <AnimatePresence>
                  {selectedItem && (
                    <motion.div
                      key={selectedItem.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: overlayOpacity, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="absolute pointer-events-none"
                      style={{
                        top: selectedItem.position.top,
                        left: selectedItem.position.left,
                        width: selectedItem.position.width,
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      <img
                        src={selectedItem.overlay}
                        alt={selectedItem.name}
                        className="w-full mix-blend-screen drop-shadow-2xl"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
                {/* Camera controls */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <button onClick={stopCamera} className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors">
                    <CameraOff size={20} />
                  </button>
                  {selectedItem && (
                    <div className="flex items-center gap-2">
                      <button onClick={prevItem} className="p-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors">
                        <ChevronLeft size={18} />
                      </button>
                      <button onClick={nextItem} className="p-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors">
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  )}
                  {selectedItem && (
                    <button onClick={() => setSelectedItem(null)} className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors">
                      <X size={20} />
                    </button>
                  )}
                </div>
                {/* Selected Item Info */}
                {selectedItem && (
                  <div className="absolute top-4 left-4 right-4">
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl px-4 py-3 flex items-center gap-3">
                      <img src={selectedItem.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      <div className="flex-1">
                        <p className="text-white text-sm font-semibold">{selectedItem.name}</p>
                        <p className="text-white/60 text-xs">{selectedItem.category}</p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* Camera inactive state */
              <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center bg-[#1a1a2e] z-10">
                <div className="w-20 h-20 rounded-full bg-[#D4AF37]/10 flex items-center justify-center mb-6 animate-float">
                  <Camera size={36} className="text-[#D4AF37]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: '"Playfair Display", serif' }}>
                  Ready to Try On?
                </h3>
                <p className="text-white/50 text-sm mb-6 max-w-xs">
                  Allow camera access to see how jewellery looks on you in real-time
                </p>
                {cameraError && (
                  <p className="text-red-400 text-xs mb-4 bg-red-500/10 px-4 py-2 rounded-xl">{cameraError}</p>
                )}
                <button
                  onClick={startCamera}
                  className="btn-gold flex items-center gap-2"
                >
                  <Camera size={18} /> Start Camera
                </button>
              </div>
            )}
          </div>

          {/* Opacity Slider */}
          {cameraActive && selectedItem && (
            <div className="mt-4 flex items-center gap-3 bg-white rounded-xl border border-[#E6E1D8] px-4 py-3">
              <span className="text-xs text-gray-500 font-medium">Transparency</span>
              <input
                type="range"
                min="0.3"
                max="1"
                step="0.05"
                value={overlayOpacity}
                onChange={(e) => setOverlayOpacity(Number(e.target.value))}
                className="flex-1 accent-[#D4AF37]"
              />
            </div>
          )}
        </div>

        {/* Item Selector */}
        <div className="lg:w-72 flex-shrink-0">
          <h3 className="text-lg font-bold text-[#382135] mb-4">
            Select Jewellery
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
            {TRYABLE_ITEMS.map((item) => {
              const isSelected = selectedItem?.id === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedItem(isSelected ? null : item)}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-300 text-left ${
                    isSelected
                      ? 'border-[#D4AF37] bg-[#D4AF37]/5 shadow-md'
                      : 'border-[#E6E1D8] bg-white hover:border-[#D4AF37]/40'
                  }`}
                >
                  <img src={item.image} alt={item.name} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#D4AF37] uppercase tracking-wider font-medium">{item.category}</p>
                    <p className="text-sm font-semibold text-[#382135] truncate">{item.name}</p>
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-[#D4AF37] flex items-center justify-center flex-shrink-0">
                      <Diamond size={10} className="text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-[#FAF8F5] rounded-xl border border-[#E6E1D8]">
            <p className="text-xs text-gray-500 leading-relaxed">
              <strong className="text-[#382135]">How it works:</strong> Enable your camera, select a piece from the catalogue, and see it overlaid on your live feed. Adjust transparency for the best view.
            </p>
          </div>

          <Link
            to="/products"
            className="mt-4 w-full flex items-center justify-center gap-2 py-3 bg-[#382135] text-white rounded-xl font-semibold hover:bg-[#4D2C48] transition-colors text-sm"
          >
            Browse Full Collection <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VirtualTryOn;
