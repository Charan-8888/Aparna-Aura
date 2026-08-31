import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ArrowRight, ShoppingBag, Heart } from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import Loader from '../components/Loader/Loader';
import ErrorState from '../components/ErrorState/ErrorState';
import EmptyState from '../components/EmptyState/EmptyState';
import { useWishlist } from '../hooks/useWishlist';
import { useCart } from '../hooks/useCart';

const formatPrice = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount || 0);

// ─── Wishlist Item Card ───────────────────────────────────────────────────────
const WishlistItem = ({ item, onRemove, onMoveToCart }) => {
  const product = item.product || {};
  const image = typeof product.images?.[0] === 'object'
    ? product.images?.[0]?.image
    : product.images?.[0] || product.image || 'https://images.unsplash.com/photo-1515562141589-67f0d6ce4819?w=400&h=400&fit=crop';
  const name = product.name || item.name || 'Product';
  const price = Number(product.price || 0);
  const originalPrice = Number(product.original_price || product.originalPrice || 0);
  const productId = product.id;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.2 } }}
      transition={{ duration: 0.35 }}
      className="premium-card group overflow-hidden flex flex-col h-full"
    >
      {/* Image */}
      <Link to={`/product/${product.slug}`} className="block relative aspect-[4/5] overflow-hidden bg-[var(--color-secondary-bg)]">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        {/* Remove button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            onRemove(productId);
          }}
          className="absolute top-3 right-3 p-2 bg-white/95 rounded-full text-[var(--color-muted)] hover:text-red-500 hover:bg-white shadow-md transition-all duration-300 opacity-0 group-hover:opacity-100 transform hover:scale-110"
          title="Remove from wishlist"
        >
          <Trash2 size={16} />
        </button>
      </Link>

      {/* Info */}
      <div className="p-5 flex flex-col flex-1 bg-white">
        <p className="text-[10px] text-[var(--color-muted)] font-bold uppercase tracking-widest mb-1.5">
          {typeof product.category === 'object' ? (product.category?.name || 'Jewellery') : (product.category || 'Jewellery')}
        </p>
        <Link
          to={`/product/${product.slug}`}
          className="text-[15px] font-medium text-[var(--color-brand)] hover:text-[var(--color-accent)] transition-colors line-clamp-2 leading-snug mb-3"
        >
          {name}
        </Link>

        <div className="mt-auto">
          <div className="flex items-center gap-2 mb-5">
            <span className="text-lg font-bold text-[var(--color-brand)] tracking-tight">{formatPrice(price)}</span>
            {originalPrice > price && (
              <span className="text-sm text-[var(--color-muted)] line-through">{formatPrice(originalPrice)}</span>
            )}
          </div>

          {/* Move to Cart */}
          <button
            onClick={() => onMoveToCart(productId)}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[var(--color-secondary-bg)] text-[var(--color-brand)] text-sm font-bold rounded-[8px] hover:bg-[var(--color-brand)] hover:text-white transition-all duration-300"
          >
            <ShoppingBag size={16} />
            Add to Cart
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Wishlist Page ────────────────────────────────────────────────────────────
const Wishlist = () => {
  const navigate = useNavigate();
  const { wishlist, wishlistCount, loading, error, removeFromWishlist, refreshWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleRemove = async (productId) => {
    try {
      await removeFromWishlist(productId);
    } catch {
      /* handled in context */
    }
  };

  const handleMoveToCart = async (productId) => {
    try {
      await addToCart(productId, 1, {
        onRequireLogin: () => navigate('/login'),
      });
      // Optionally remove from wishlist after moving
      await removeFromWishlist(productId);
    } catch {
      /* handled in context */
    }
  };

  if (loading) return <Loader fullScreen />;

  if (error) {
    return (
      <div className="container-default section-padding">
        <ErrorState message={error} onRetry={refreshWishlist} />
      </div>
    );
  }

  return (
    <div className="container-default section-padding pb-20">
      <Breadcrumb items={[{ label: 'My Wishlist', path: '/wishlist' }]} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 mt-4"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold text-[var(--color-brand)] font-heading">My Wishlist</h1>
            {wishlistCount > 0 && (
              <p className="text-[var(--color-muted)] font-medium mt-2">
                {wishlistCount} {wishlistCount === 1 ? 'item' : 'items'} saved
              </p>
            )}
          </div>
          {wishlistCount > 0 && (
            <Link
              to="/products"
              className="flex items-center gap-1.5 text-sm font-bold text-[var(--color-accent)] hover:text-[var(--color-brand)] transition-colors tracking-wide"
            >
              Continue Shopping <ArrowRight size={16} />
            </Link>
          )}
        </div>
        </motion.div>

      {wishlist.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Your wishlist is empty"
          description="Save your favourite pieces here and come back to them anytime."
          action={
            <Link
              to="/products"
              className="btn-primary mt-4"
            >
              Explore Collections <ArrowRight size={18} className="ml-2" />
            </Link>
          }
        />
      ) : (
        <AnimatePresence initial={false}>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
            {wishlist.map((item) => (
              <WishlistItem
                key={item.id}
                item={item}
                onRemove={handleRemove}
                onMoveToCart={handleMoveToCart}
              />
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default Wishlist;
