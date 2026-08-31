import { useContext } from 'react';
import { CartContext } from '../context/CartContext';

/**
 * useCart — consume CartContext anywhere in the component tree.
 *
 * Returns:
 *  - cart: full cart object
 *  - items: array of cart items
 *  - itemCount: total quantity across all items
 *  - subtotal, tax, shipping, grandTotal: numbers
 *  - loading: boolean
 *  - error: string | null
 *  - addToCart(productId, quantity, opts): Promise
 *  - updateQuantity(itemId, quantity): Promise
 *  - removeItem(itemId): Promise
 *  - clearCart(): Promise
 *  - refreshCart(): Promise
 *
 * Must be used inside <CartProvider>.
 */
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
