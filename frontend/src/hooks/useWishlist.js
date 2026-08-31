import { useContext } from 'react';
import { WishlistContext } from '../context/WishlistContext';

/**
 * useWishlist — consume WishlistContext anywhere in the component tree.
 *
 * Returns:
 *  - wishlist: array of wishlist items
 *  - wishlistCount: number
 *  - loading: boolean
 *  - error: string | null
 *  - isWishlisted(productId): boolean
 *  - toggleWishlist(productId, opts): Promise
 *  - addToWishlist(productId): Promise
 *  - removeFromWishlist(productId): Promise
 *  - refreshWishlist(): Promise
 *
 * Must be used inside <WishlistProvider>.
 */
export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
