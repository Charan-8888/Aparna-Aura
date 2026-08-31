import React, { useState, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react';
import OptimizedImage from '../OptimizedImage/OptimizedImage';

const ImageGallery = memo(({ images = [], video = null, productName = '' }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [showVideo, setShowVideo] = useState(false);
  const imageRef = useRef(null);

  const allMedia = [...images];
  const selectedImage = allMedia[selectedIndex];

  const handleMouseMove = (e) => {
    if (!imageRef.current || !isZoomed) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  const handlePrev = () => {
    setShowVideo(false);
    setSelectedIndex((prev) => (prev - 1 + allMedia.length) % allMedia.length);
  };

  const handleNext = () => {
    setShowVideo(false);
    setSelectedIndex((prev) => (prev + 1) % allMedia.length);
  };

  return (
    <div className="space-y-5">
      {/* Main Image / Video */}
      <div className="relative aspect-square overflow-hidden rounded-sm bg-[#f3efe8] group">
        <AnimatePresence mode="wait">
          {showVideo && video ? (
            <motion.div
              key="video"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              <video
                src={video}
                controls
                autoPlay
                muted
                loop
                className="w-full h-full object-cover"
              />
            </motion.div>
          ) : (
            <motion.div
              key={selectedIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative w-full h-full cursor-zoom-in"
              ref={imageRef}
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={handleMouseMove}
            >
              <OptimizedImage
                src={selectedImage}
                alt={`${productName} - Image ${selectedIndex + 1}`}
                className="w-full h-full object-contain p-2"
                containerClassName="absolute inset-0 w-full h-full"
                fetchPriority="high"
                loading="eager"
                style={isZoomed ? {
                  transform: 'scale(2)',
                  transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  transition: 'transform-origin 0.1s ease',
                } : {}}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Arrows */}
        {!showVideo && allMedia.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 text-[#382135] opacity-0 group-hover:opacity-100 hover:bg-white shadow-lg transition-all duration-300"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 text-[#382135] opacity-0 group-hover:opacity-100 hover:bg-white shadow-lg transition-all duration-300"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Zoom indicator */}
        {!showVideo && (
          <div className="absolute top-3 right-3 p-2 rounded-full bg-white/80 text-[#382135] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <ZoomIn size={18} />
          </div>
        )}
      </div>

      {/* Thumbnails */}
      <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1">
        {allMedia.map((img, i) => (
          <button
            key={i}
            onClick={() => {
              setSelectedIndex(i);
              setShowVideo(false);
            }}
            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
              selectedIndex === i && !showVideo
                ? 'border-[#D4AF37] shadow-md'
                : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            <OptimizedImage 
              src={img} 
              alt={`Thumbnail ${i + 1}`} 
              className="w-full h-full object-cover" 
              containerClassName="absolute inset-0 w-full h-full"
              loading="lazy"
            />
          </button>
        ))}
        {video && (
          <button
            onClick={() => setShowVideo(true)}
            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 relative transition-all duration-200 ${
              showVideo
                ? 'border-[#D4AF37] shadow-md'
                : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            <OptimizedImage 
              src={images[0]} 
              alt="Video thumbnail" 
              className="w-full h-full object-cover" 
              containerClassName="absolute inset-0 w-full h-full"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <Play size={20} className="text-white fill-white" />
            </div>
          </button>
        )}
      </div>
    </div>
  );
});

ImageGallery.displayName = 'ImageGallery';

export default ImageGallery;
