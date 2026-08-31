import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { MotionConfig } from 'framer-motion';
import { router } from './routes';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ToastProvider } from './context/ToastContext';
import NetworkDetector from './components/NetworkDetector/NetworkDetector';

function App() {
  return (
    <HelmetProvider>
      <MotionConfig reducedMotion="never">
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <ToastProvider>
                <NetworkDetector />
                <RouterProvider router={router} />
              </ToastProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </MotionConfig>
    </HelmetProvider>
  );
}

export default App;
