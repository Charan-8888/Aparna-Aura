import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, ArrowLeft, Download, XCircle, CreditCard, Clock, Truck, CheckCircle } from 'lucide-react';
import Loader from '../components/Loader/Loader';
import ErrorState from '../components/ErrorState/ErrorState';
import orderService from '../services/orderService';
import paymentService from '../services/paymentService';

const formatPrice = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount || 0);

const formatDate = (dateString, full = false) => {
  const options = full 
    ? { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
    : { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-IN', options);
};

const TIMELINE_STEPS = [
  { status: 'pending', label: 'Order Placed', icon: Clock },
  { status: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  { status: 'packed', label: 'Packed', icon: Package },
  { status: 'shipped', label: 'Shipped', icon: Truck },
  { status: 'delivered', label: 'Delivered', icon: CheckCircle },
];

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const response = await orderService.getOrder(id);
      setOrder(response.data || response);
      setError(null);
    } catch (err) {
      setError('Failed to load order details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await orderService.cancelOrder(id);
      await fetchOrder();
      setShowCancelModal(false);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel order.');
    } finally {
      setCancelling(false);
    }
  };

  const currentStatus = order?.status?.toLowerCase() || 'pending';
  const isCancelled = currentStatus === 'cancelled';
  const canCancel = currentStatus === 'pending' || currentStatus === 'confirmed';
  
  // Calculate timeline progress
  const currentStepIndex = TIMELINE_STEPS.findIndex(s => s.status === currentStatus);
  
  if (loading) return <Loader fullScreen />;

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <ErrorState message={error} onRetry={fetchOrder} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24">
      {/* Header */}
      <div className="aura-route-hero aura-route-hero--compact flex items-center justify-between mb-8">
        <Link to="/orders" className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#382135] transition-colors">
          <ArrowLeft size={16} /> Back to Orders
        </Link>
        <button className="flex items-center gap-2 text-sm font-semibold text-[#D4AF37] hover:text-[#382135] transition-colors border-b border-transparent hover:border-[#382135]">
          <Download size={16} /> Invoice
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Column - Main Details */}
        <div className="flex-1 space-y-6">
          
          {/* Order Header Card */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 rounded-bl-full" />
            <h1 className="text-2xl md:text-3xl font-bold text-[#382135] mb-2 font-heading">
              Order #{order.order_number || order.id.slice(0, 8).toUpperCase()}
            </h1>
            <p className="text-sm text-gray-500 font-medium">Placed on {formatDate(order.created_at, true)}</p>
            
            <div className="mt-8">
              {isCancelled ? (
                <div className="bg-red-50 text-red-600 px-6 py-4 rounded-xl flex items-center gap-3">
                  <XCircle size={24} />
                  <div>
                    <p className="font-bold">Order Cancelled</p>
                    <p className="text-sm">This order was cancelled and will not be shipped.</p>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <div className="overflow-hidden mb-8">
                    <div className="flex items-center justify-between relative z-10">
                      {TIMELINE_STEPS.map((step, index) => {
                        const Icon = step.icon;
                        const isCompleted = index <= currentStepIndex;
                        const isCurrent = index === currentStepIndex;
                        return (
                          <div key={step.status} className="flex flex-col items-center gap-2">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                              isCompleted ? 'bg-[#382135] text-white shadow-md' : 'bg-gray-100 text-gray-300'
                            } ${isCurrent ? 'ring-4 ring-[#D4AF37]/30 scale-110' : ''}`}>
                              <Icon size={18} />
                            </div>
                            <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${
                              isCompleted ? 'text-[#382135]' : 'text-gray-400'
                            }`}>
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    {/* Connecting Line */}
                    <div className="absolute top-5 left-[10%] right-[10%] h-0.5 bg-gray-100 -z-0">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(Math.max(0, currentStepIndex) / (TIMELINE_STEPS.length - 1)) * 100}%` }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="h-full bg-[#382135]"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Items */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold text-[#382135] mb-6">Items Ordered</h2>
            <div className="space-y-6">
              {order.items?.map((item) => (
                <div key={item.id} className="flex gap-4 sm:gap-6 border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                  <Link to={`/product/${item.product?.slug}`} className="w-20 h-24 sm:w-24 sm:h-28 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                    <img 
                      src={typeof item.product?.images?.[0] === 'object' ? item.product?.images?.[0]?.image : (item.product?.images?.[0] || item.product?.image)} 
                      alt={item.product?.name} 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </Link>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-xs text-[#D4AF37] font-bold uppercase tracking-wider mb-1">{typeof item.product?.category === 'object' ? (item.product?.category?.name || 'Jewellery') : (item.product?.category || 'Jewellery')}</p>
                      <Link to={`/product/${item.product?.slug}`} className="text-sm sm:text-base font-bold text-[#382135] hover:text-[#D4AF37] transition-colors line-clamp-2">
                        {item.product?.name}
                      </Link>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      <p className="text-sm font-bold text-[#382135]">{formatPrice(item.price)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column - Summary & Addresses */}
        <div className="lg:w-80 flex-shrink-0 space-y-6">
          
          {/* Order Summary */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold text-[#382135] mb-4">Payment Summary</h2>
            
            <div className="space-y-3 mb-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium text-[#382135]">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Shipping</span>
                <span className="font-medium text-[#382135]">{order.shipping_fee > 0 ? formatPrice(order.shipping_fee) : <span className="text-green-600">Free</span>}</span>
              </div>
              {order.tax_amount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Tax</span>
                  <span className="font-medium text-[#382135]">{formatPrice(order.tax_amount)}</span>
                </div>
              )}
            </div>
            
            <div className="border-t border-gray-100 pt-4 mb-4">
              <div className="flex justify-between items-center">
                <span className="font-bold text-[#382135]">Total</span>
                <span className="text-xl font-bold text-[#382135]">{formatPrice(order.total_amount)}</span>
              </div>
            </div>

            {/* Payment Status */}
            <div className={`mt-4 px-4 py-3 rounded-xl flex items-center justify-between text-sm font-bold ${
              order.is_paid ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
            }`}>
              <span className="flex items-center gap-2">
                <CreditCard size={16} />
                {order.is_paid ? 'Paid' : 'Pending Payment'}
              </span>
            </div>

            {!order.is_paid && !isCancelled && (
              <button 
                onClick={() => navigate(`/payment/${order.id}`)}
                className="w-full mt-4 bg-[#382135] text-white py-3 rounded-xl font-bold hover:bg-[#2a1827] transition-all shadow-md shadow-[#382135]/20"
              >
                Complete Payment
              </button>
            )}
          </div>

          {/* Shipping Address */}
          {order.shipping_address && (
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
              <h2 className="text-lg font-bold text-[#382135] mb-4">Shipping Address</h2>
              <div className="text-sm text-gray-600 space-y-1">
                <p className="font-bold text-gray-900">{order.shipping_address.full_name}</p>
                <p>{order.shipping_address.house_no}, {order.shipping_address.street}</p>
                {order.shipping_address.landmark && <p>{order.shipping_address.landmark}</p>}
                <p>{order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.pincode}</p>
                <p>{order.shipping_address.country}</p>
                <p className="pt-2">Phone: {order.shipping_address.phone}</p>
              </div>
            </div>
          )}

          {/* Cancel Order */}
          {canCancel && (
            <button 
              onClick={() => setShowCancelModal(true)}
              className="w-full text-red-500 font-semibold text-sm py-3 rounded-xl border border-red-200 hover:bg-red-50 transition-colors"
            >
              Cancel Order
            </button>
          )}

        </div>
      </div>

      {/* Cancel Modal */}
      <AnimatePresence>
        {showCancelModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCancelModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl">
              <h3 className="text-xl font-bold text-[#382135] mb-2">Cancel Order?</h3>
              <p className="text-sm text-gray-500 mb-6">Are you sure you want to cancel this order? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowCancelModal(false)} className="flex-1 py-3 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
                  Keep Order
                </button>
                <button onClick={handleCancel} disabled={cancelling} className="flex-1 py-3 text-sm font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors disabled:opacity-70 flex items-center justify-center">
                  {cancelling ? <Loader size="sm" /> : 'Yes, Cancel'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrderDetail;
