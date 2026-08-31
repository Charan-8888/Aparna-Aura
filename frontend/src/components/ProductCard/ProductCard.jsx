import React, { useRef, useState, useEffect, useCallback, memo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag } from 'lucide-react';
import { useWishlist } from '../../hooks/useWishlist';
import { useCart } from '../../hooks/useCart';
import OptimizedImage from '../OptimizedImage/OptimizedImage';

const FALLBACK_IMAGE = '/image-fallback.svg';

const getProductImage = (product) => {
  const images = Array.isArray(product.images) ? product.images : [];
  const featuredImage = images.find((item) => typeof item === 'object' && item.is_featured && item.image)?.image;
  const firstImage = images
    .map((item) => (typeof item === 'object' ? item.image : item))
    .find(Boolean);

  return featuredImage || firstImage || product.image || FALLBACK_IMAGE;
};

const formatPrice = (price) => `₹${Number(price || 0).toLocaleString('en-IN')}`;
const isPriceOnRequest = (price) => Number(price || 0) <= 0;

const ProductCard = memo(({ product, index = 0 }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const videoRef = useRef(null);
  const cardRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const { isWishlisted, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  const wishlisted = isWishlisted(product.id);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' }
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  // Handle video play/pause on hover
  useEffect(() => {
    if (!videoRef.current || !product.video) return;
    if (isHovered && isVisible) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isHovered, isVisible, product.video]);

  const handleWishlistToggle = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleWishlist(product.id, {
      onRequireLogin: () => navigate('/login', { state: { from: location } }),
    });
  }, [product.id, toggleWishlist, navigate, location]);

  const priceOnRequest = isPriceOnRequest(product.price);

  const handleAddToCart = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (cartLoading || priceOnRequest) return;
    setCartLoading(true);
    try {
      await addToCart(product.id, 1, {
        onRequireLogin: () => navigate('/login', { state: { from: location } }),
      });
    } catch {
      // Error already logged in context
    } finally {
      setCartLoading(false);
    }
  }, [product.id, addToCart, cartLoading, priceOnRequest, navigate, location]);

  const discount = product.discountPercentage || product.discount_percentage;
  const isLowStock = !priceOnRequest && product.stock <= 3;

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="group relative flex flex-col overflow-hidden rounded-[1.45rem] border border-[#3b2338]/8 bg-[#fffdf9] p-2 shadow-[0_18px_55px_rgba(48,27,47,.055)] transition-all duration-500 hover:-translate-y-1 hover:border-[#b88735]/20 hover:shadow-[0_26px_70px_rgba(48,27,47,.1)]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/product/${product.slug}`} className="flex flex-col h-full">
        {/* Image Container (Aspect Ratio enforced for CLS) */}
        <div className="relative aspect-[4/5] overflow-hidden rounded-[1.05rem] bg-[#eee6dc]">
          {/* Main Image via OptimizedImage */}
          {isVisible && (
            <OptimizedImage
              src={getProductImage(product)}
              alt={product.name}
              loading="lazy"
              fetchPriority="auto"
              className={`${isHovered && product.video ? 'opacity-0' : 'group-hover:scale-[1.055]'} transition-transform duration-[900ms] ease-out`}
              containerClassName="absolute inset-0 w-full h-full"
            />
          )}

          {/* Video Overlay on Hover */}
          {product.video && isVisible && (
            <video
              ref={videoRef}
              src={product.video}
              muted
              loop
              playsInline
              preload="metadata"
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}
            />
          )}

          {/* Overlay Gradient on Hover */}
          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
            {discount > 0 && (
              <span className="bg-white/95 text-[#301b2f] text-[9px] uppercase font-bold px-3 py-1.5 tracking-[0.16em]">
                -{discount}%
              </span>
            )}
            {isLowStock && (
              <span className="bg-red-500 text-white text-[10px] uppercase font-bold px-3 py-1.5 rounded-[8px] shadow-sm tracking-wider">
                Only {product.stock || 0} left
              </span>
            )}
            {product.tags?.includes('new-arrival') && (
              <span className="bg-[var(--color-brand)] text-white text-[10px] uppercase font-bold px-3 py-1.5 rounded-[8px] shadow-sm tracking-wider">
                New
              </span>
            )}
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={isHovered ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 z-10 px-3"
          >
            {/* Wishlist Toggle */}
            <button
              onClick={handleWishlistToggle}
              className={`p-3 rounded-full shadow-sm backdrop-blur-md transition-all duration-300 transform hover:scale-110 ${
                wishlisted
                  ? 'bg-red-500 text-white'
                  : 'bg-white/95 text-[var(--color-brand)] hover:bg-[var(--color-accent)] hover:text-white'
              }`}
              title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart size={18} fill={wishlisted ? 'currentColor' : 'none'} />
            </button>

            {/* Add to Cart / Enquire */}
            {priceOnRequest ? (
              <span
                className="px-5 py-3 rounded-full bg-white/95 text-[#D4AF37] shadow-sm backdrop-blur-md font-semibold text-sm flex items-center gap-2 flex-1 justify-center cursor-default"
              >
                Enquire
              </span>
            ) : (
              <button
                onClick={handleAddToCart}
                disabled={cartLoading}
                className="px-5 py-3 rounded-full bg-white/95 text-[var(--color-brand)] shadow-sm backdrop-blur-md hover:bg-[var(--color-brand)] hover:text-white transition-all duration-300 disabled:opacity-60 font-semibold text-sm flex items-center gap-2 flex-1 justify-center transform hover:scale-105"
                title="Add to cart"
              >
                {cartLoading ? (
                  <span className="block w-4 h-4 border-2 border-[var(--color-brand)]/30 border-t-[var(--color-brand)] group-hover:border-white/30 group-hover:border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <ShoppingBag size={18} /> Add
                  </>
                )}
              </button>
            )}
          </motion.div>
        </div>

        {/* Product Info */}
        <div className="flex flex-1 flex-col bg-transparent px-2 pb-3 pt-4">
          <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.19em] text-[#9b702b]">
            {typeof product.category === 'object' ? product.category?.name : (product.category || 'Jewellery')}
          </p>
          <h3 className="mb-3 line-clamp-1 font-heading text-xl font-medium text-[#301b2f] transition-colors duration-300 group-hover:text-[#a77d32]">
            {product.name}
          </h3>
          
          <div className="mt-auto">
            <div className="flex items-center gap-2 mb-1.5">
              {priceOnRequest ? (
                <span className="text-sm font-semibold text-[#D4AF37] tracking-wide">
                  Price on Request
                </span>
              ) : (
                <>
                  <span className="text-base font-semibold text-[var(--color-brand)] tracking-tight">
                    {formatPrice(product.price)}
                  </span>
                  {(product.originalPrice || product.original_price) > product.price && (
                    <span className="text-sm text-[var(--color-muted)] line-through">
                      {formatPrice(product.originalPrice || product.original_price)}
                    </span>
                  )}
                </>
              )}
            </div>
            {/* Rating */}
            <div className="flex items-center gap-1.5">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < Math.floor(product.rating) ? 'text-[var(--color-accent)]' : 'text-[#E6E1D8]'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-xs text-[var(--color-muted)]">({product.reviewCount || 0})</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
