import React, { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import ProtectedRoute from './ProtectedRoute';
import RouteErrorBoundary from './RouteErrorBoundary';

// Lazy loaded pages
const Home = lazy(() => import('../pages/Home'));
const Products = lazy(() => import('../pages/Products'));
const ProductDetail = lazy(() => import('../pages/ProductDetail'));
const Category = lazy(() => import('../pages/Category'));
const Cart = lazy(() => import('../pages/Cart'));
const Wishlist = lazy(() => import('../pages/Wishlist'));
const Checkout = lazy(() => import('../pages/Checkout'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const ForgotPassword = lazy(() => import('../pages/ForgotPassword'));
const ResetPassword = lazy(() => import('../pages/ResetPassword'));
const Profile = lazy(() => import('../pages/Profile'));
const Orders = lazy(() => import('../pages/Orders'));
const OrderDetail = lazy(() => import('../pages/OrderDetail'));
const OrderSuccess = lazy(() => import('../pages/OrderSuccess'));
const Payment = lazy(() => import('../pages/Payment'));
const Addresses = lazy(() => import('../pages/Addresses'));
const NotFound = lazy(() => import('../pages/NotFound'));
const VirtualTryOn = lazy(() => import('../pages/VirtualTryOn'));
const About = lazy(() => import('../pages/About'));
const FAQ = lazy(() => import('../pages/FAQ'));
const ShippingReturns = lazy(() => import('../pages/ShippingReturns'));
const Contact = lazy(() => import('../pages/Contact'));
const Care = lazy(() => import('../pages/Care'));
export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'products',
        element: <Products />,
      },
      {
        path: 'product/:slug',
        element: <ProductDetail />,
      },
      {
        path: 'categories/:slug',
        element: <Category />,
      },
      {
        path: 'cart',
        element: <Cart />,
      },
      {
        path: 'wishlist',
        element: <Wishlist />,
      },
      // ─── Protected Routes ───────────────────────────────────────────────────
      {
        path: 'checkout',
        element: (
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: 'orders',
        element: (
          <ProtectedRoute>
            <Orders />
          </ProtectedRoute>
        ),
      },
      {
        path: 'orders/:id',
        element: (
          <ProtectedRoute>
            <OrderDetail />
          </ProtectedRoute>
        ),
      },
      {
        path: 'addresses',
        element: (
          <ProtectedRoute>
            <Addresses />
          </ProtectedRoute>
        ),
      },
      {
        path: 'payment/:orderId',
        element: (
          <ProtectedRoute>
            <Payment />
          </ProtectedRoute>
        ),
      },
      {
        path: 'order-success',
        element: (
          <ProtectedRoute>
            <OrderSuccess />
          </ProtectedRoute>
        ),
      },
      // ─── Auth Routes ─────────────────────────────────────────────────────────
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'register',
        element: <Register />,
      },
      {
        path: 'forgot-password',
        element: <ForgotPassword />,
      },
      {
        path: 'reset-password',
        element: <ResetPassword />,
      },
      {
        path: 'try-on',
        element: <VirtualTryOn />,
      },
      {
        path: 'about',
        element: <About />,
      },
      {
        path: 'faq',
        element: <FAQ />,
      },
      {
        path: 'shipping-returns',
        element: <ShippingReturns />,
      },
      {
        path: 'contact',
        element: <Contact />,
      },
      {
        path: 'care',
        element: <Care />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
]);
