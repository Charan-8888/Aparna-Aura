import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ImageIcon } from 'lucide-react';

const MAX_IMAGE_RETRIES = 2;

const withRetryCacheBuster = (src, retry) => {
  if (!src || src === '/image-fallback.svg' || src.startsWith('data:')) return src;
  const separator = src.includes('?') ? '&' : '?';
  return `${src}${separator}aa_image_retry=${retry}&aa_image_time=${Date.now()}`;
};

const OptimizedImage = ({ 
  src, 
  alt, 
  className = '', 
  loading = 'lazy', 
  fetchPriority = 'auto',
  containerClassName = '',
  style = {}
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [activeSrc, setActiveSrc] = useState(src);
  const imageRef = useRef(null);
  const retryCount = useRef(0);
  const retryTimer = useRef(null);

  useEffect(() => {
    retryCount.current = 0;
    if (retryTimer.current) clearTimeout(retryTimer.current);
    setActiveSrc(src);
    setIsLoaded(false);
    setHasError(false);
    return () => {
      if (retryTimer.current) clearTimeout(retryTimer.current);
    };
  }, [src]);

  // Cached images can complete before React attaches onLoad. Without this
  // check, the image remains opacity-0 until the user reloads the page.
  useEffect(() => {
    const image = imageRef.current;
    if (image?.complete && image.naturalWidth > 0) {
      setIsLoaded(true);
    }
  }, [activeSrc]);

  const handleImageError = () => {
    if (activeSrc === '/image-fallback.svg') {
      setIsLoaded(true);
      setHasError(true);
      return;
    }

    if (retryCount.current < MAX_IMAGE_RETRIES) {
      retryCount.current += 1;
      const retry = retryCount.current;
      retryTimer.current = setTimeout(() => {
        setIsLoaded(false);
        setActiveSrc(withRetryCacheBuster(src, retry));
      }, retry * 500);
      return;
    }

    setActiveSrc('/image-fallback.svg');
  };

  return (
    <div className={`relative overflow-hidden bg-[#F3EFE8] ${containerClassName}`}>
      {/* Skeleton / Blur Placeholder */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 animate-pulse bg-[#E6E1D8]" />
      )}

      {/* Error Fallback */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 bg-[#FAF8F5]">
          <ImageIcon size={24} className="mb-2 opacity-50" />
          <span className="text-xs uppercase tracking-widest font-semibold opacity-50">Image Unavailable</span>
        </div>
      )}

      {/* Actual Image */}
      <motion.img
        ref={imageRef}
        src={activeSrc}
        alt={alt}
        loading={loading}
        fetchPriority={fetchPriority}
        decoding="async"
        className={`w-full h-full object-cover transition-opacity duration-700 ${className} ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        style={style}
        onLoad={() => {
          if (retryTimer.current) clearTimeout(retryTimer.current);
          setIsLoaded(true);
        }}
        onError={handleImageError}
      />
    </div>
  );
};

export default OptimizedImage;
