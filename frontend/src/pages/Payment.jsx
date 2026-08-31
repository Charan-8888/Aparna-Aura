import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  Banknote, 
  ShieldCheck, 
  ArrowRight, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  QrCode,
  Smartphone,
  HelpCircle,
  Lock
} from 'lucide-react';
import orderService from '../services/orderService';
import paymentService from '../services/paymentService';
import { loadRazorpayScript } from '../utils/razorpayLoader';
import Loader from '../components/Loader/Loader';
import ErrorState from '../components/ErrorState/ErrorState';

const formatPrice = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount || 0);

const Payment = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [hasAttempted, setHasAttempted] = useState(false);
  
  const [selectedMethod, setSelectedMethod] = useState('razorpay');
  const [processing, setProcessing] = useState(false);
  
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await orderService.getOrder(orderId);
        const orderData = response.data || response;
        setOrder(orderData);

        // If order is already paid, redirect to success
        if (orderData.status === 'confirmed' || orderData.is_paid) {
          navigate('/order-success', { state: { orderId: orderData.id }, replace: true });
        }
      } catch (err) {
        setError('Failed to load order details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId, navigate]);

  const handleRazorpayPayment = async () => {
    if (processing) return;

    setProcessing(true);
    setError('');
    setNotice('');

    try {
      // 1. Create Razorpay order on authoritative Django backend
      const response = await paymentService.createRazorpayOrder(orderId);
      const rpData = response.data || response;

      if (!rpData?.key_id || !rpData?.razorpay_order_id) {
        throw new Error('The payment gateway returned incomplete checkout details.');
      }
      
      // 2. Load Razorpay checkout.js using promise-cached robust loader
      await loadRazorpayScript();

      if (!window.Razorpay) {
        throw new Error('Unable to load payment service. Please try again.');
      }

      // 3. Initialize Razorpay Standard Checkout
      const options = {
        key: rpData.key_id,
        amount: rpData.amount, // exact paise calculated server-side
        currency: rpData.currency || 'INR',
        name: 'Aparna Aura',
        description: `Order #${order.order_number || (order.id ? order.id.slice(0, 8) : '')}`,
        order_id: rpData.razorpay_order_id,
        handler: async function (paymentResponse) {
          // 4. Verify signature and confirm capture on backend
          setProcessing(true);
          setNotice('');
          try {
            await paymentService.verifyRazorpayPayment({
              order_id: order.id,
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature,
            });
            navigate('/order-success', { state: { orderId: order.id } });
          } catch (verifyErr) {
            const backendMsg = 
              verifyErr.response?.data?.message || 
              verifyErr.response?.data?.payment || 
              'Payment verification could not be completed. If amount was debited, our concierge will confirm your order shortly.';
            setError(backendMsg);
            setProcessing(false);
          }
        },
        prefill: {
          name: rpData.customer?.name || order.shipping_address?.full_name || '',
          email: rpData.customer?.email || '',
          contact: rpData.customer?.contact || order.shipping_address?.phone || '',
        },
        notes: {
          order_id: String(order.id),
        },
        theme: {
          color: '#382135',
          backdrop_color: 'rgba(56, 33, 53, 0.7)',
        },
        config: {
          display: {
            sequence: ['block.upi', 'block.other'],
            preferences: {
              show_default_blocks: true,
            },
          },
        },
        modal: {
          ondismiss: function () {
            setProcessing(false);
            setHasAttempted(true);
            setNotice('Payment was not completed. You can try again.');
          },
          escape: true,
          animation: true,
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function () {
        setProcessing(false);
        setHasAttempted(true);
        setNotice('Payment was not completed. You can try again.');
      });
      rzp.open();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.payment || err.message || 'Could not initiate payment. Please try again.';
      setError(msg);
      setProcessing(false);
    }
  };

  const handleCODPayment = async () => {
    if (processing) return;

    setProcessing(true);
    setError('');
    setNotice('');
    try {
      await paymentService.confirmCOD(orderId);
      navigate('/order-success', { state: { orderId: order.id } });
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.payment || 'Failed to confirm Cash on Delivery. Please try again.');
      setProcessing(false);
    }
  };

  const handlePayment = () => {
    if (selectedMethod === 'razorpay') {
      handleRazorpayPayment();
    } else {
      handleCODPayment();
    }
  };

  if (loading) return <Loader fullScreen />;

  if (error && !order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  const orderTotal = Number(order?.total_amount || 0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-28">
      {/* Header */}
      <div className="aura-route-hero aura-route-hero--center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FAF8F5] border border-[#E6E1D8] rounded-full text-xs font-semibold text-[#382135] mb-3">
          <Lock size={13} className="text-[#D4AF37]" />
          Secure Checkout Step 2 of 2
        </div>
        <h1 className="text-3xl font-bold text-[#382135] mb-2" style={{ fontFamily: '"Playfair Display", serif' }}>
          Complete Payment
        </h1>
        <p className="text-sm text-gray-500">
          Order #{order?.order_number || (order?.id ? order.id.slice(0, 8).toUpperCase() : '')}
        </p>
      </div>

      {/* Notice / Error Alerts */}
      <AnimatePresence>
        {notice && (
          <motion.div 
            initial={{ opacity: 0, y: -8 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -8 }}
            className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-sm font-medium flex items-center gap-3"
          >
            <AlertCircle size={18} className="text-amber-600 flex-shrink-0" />
            <span>{notice}</span>
          </motion.div>
        )}

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -8 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -8 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium flex items-center gap-3"
          >
            <AlertCircle size={18} className="text-red-600 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        
        {/* Payment Methods Section */}
        <div className="md:col-span-3 space-y-4">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
            Select Payment Option
          </h2>

          {/* Online Payment Option */}
          <label 
            className={`block relative cursor-pointer p-6 rounded-2xl border-2 transition-all duration-300 ${
              selectedMethod === 'razorpay' 
                ? 'border-[#382135] bg-[#FAF8F5] shadow-md ring-1 ring-[#382135]/10' 
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <input 
              type="radio" 
              name="payment" 
              value="razorpay" 
              checked={selectedMethod === 'razorpay'} 
              onChange={() => setSelectedMethod('razorpay')}
              className="sr-only"
            />
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors ${
                selectedMethod === 'razorpay' ? 'bg-[#382135] text-white shadow-md' : 'bg-gray-100 text-gray-400'
              }`}>
                <CreditCard size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-[#382135]">
                    Pay Online (Recommended)
                  </h3>
                  {selectedMethod === 'razorpay' && (
                    <CheckCircle className="text-[#382135]" size={20} />
                  )}
                </div>
                <p className="text-xs text-gray-600 mt-1 font-medium">
                  Pay securely with UPI, cards and other available methods
                </p>
                
                {/* Method Cues */}
                <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-gray-500">
                  <span className="inline-flex items-center gap-1 bg-white border border-[#E6E1D8] px-2.5 py-1 rounded-md font-semibold text-[#382135]">
                    <Smartphone size={12} className="text-[#D4AF37]" /> UPI Intent & QR
                  </span>
                  <span className="inline-flex items-center gap-1 bg-white border border-[#E6E1D8] px-2.5 py-1 rounded-md font-semibold text-[#382135]">
                    <CreditCard size={12} className="text-[#382135]" /> Debit / Credit Cards
                  </span>
                  <span className="inline-flex items-center gap-1 bg-white border border-[#E6E1D8] px-2.5 py-1 rounded-md font-semibold text-[#382135]">
                    Net Banking
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-200/60 flex items-center gap-2 text-xs text-gray-500 font-medium">
                  <ShieldCheck size={16} className="text-green-600 flex-shrink-0" />
                  Secure payments powered by Razorpay
                </div>
              </div>
            </div>
          </label>

          {/* Cash on Delivery Option */}
          <label 
            className={`block relative cursor-pointer p-6 rounded-2xl border-2 transition-all duration-300 ${
              selectedMethod === 'cod' 
                ? 'border-[#382135] bg-[#FAF8F5] shadow-md ring-1 ring-[#382135]/10' 
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <input 
              type="radio" 
              name="payment" 
              value="cod" 
              checked={selectedMethod === 'cod'} 
              onChange={() => setSelectedMethod('cod')}
              className="sr-only"
            />
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors ${
                selectedMethod === 'cod' ? 'bg-[#382135] text-white shadow-md' : 'bg-gray-100 text-gray-400'
              }`}>
                <Banknote size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-[#382135]">Cash on Delivery</h3>
                  {selectedMethod === 'cod' && (
                    <CheckCircle className="text-[#382135]" size={20} />
                  )}
                </div>
                <p className="text-xs text-gray-600 mt-1 font-medium">
                  Pay with cash when your luxury parcel is safely delivered to your doorstep.
                </p>
              </div>
            </div>
          </label>

          {/* Secondary Assistance Note */}
          <div className="mt-6 p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-500 leading-relaxed flex items-start gap-2.5">
            <HelpCircle size={16} className="text-gray-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-gray-700">Need assisted payment support?</span> Our concierge can assist you with your order. You can also visit our verified payment desk at{' '}
              <a 
                href="https://razorpay.me/@aparnaaura" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-[#382135] font-semibold underline hover:text-[#D4AF37]"
              >
                razorpay.me/@aparnaaura
              </a>.
            </div>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-6 sm:p-7 sticky top-28">
            <h2 className="text-base font-bold text-[#382135] uppercase tracking-wider mb-5" style={{ fontFamily: '"Playfair Display", serif' }}>
              Order Summary
            </h2>
            
            <div className="space-y-3 mb-6 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium text-[#382135]">{formatPrice(order?.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Shipping</span>
                <span className="font-medium text-[#382135]">
                  {order?.shipping_fee > 0 ? formatPrice(order.shipping_fee) : <span className="text-green-600 font-semibold">Complimentary</span>}
                </span>
              </div>
              {order?.tax_amount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Tax (GST)</span>
                  <span className="font-medium text-[#382135]">{formatPrice(order.tax_amount)}</span>
                </div>
              )}
            </div>

            {/* Clear Total Above CTA */}
            <div className="border-t border-gray-100 pt-4 mb-6">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Order Total</span>
                <span className="text-3xl font-bold text-[#382135]" style={{ fontFamily: '"Playfair Display", serif' }}>
                  {formatPrice(orderTotal)}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 text-right">Inclusive of all taxes</p>
            </div>

            {/* Primary Action Button (min-h 52px for mobile tap compliance) */}
            <button 
              onClick={handlePayment}
              disabled={processing}
              className="w-full min-h-[52px] flex items-center justify-center gap-2 bg-[#382135] text-white font-bold py-4 px-6 rounded-2xl hover:bg-[#2a1827] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-[#382135]/25 disabled:opacity-70 disabled:pointer-events-none text-sm tracking-wide uppercase"
            >
              {processing ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>Connecting to Gateway...</span>
                </>
              ) : hasAttempted ? (
                <>
                  <span>Try Payment Again — {formatPrice(orderTotal)}</span>
                  <ArrowRight size={18} />
                </>
              ) : (
                <>
                  <span>Pay {formatPrice(orderTotal)}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            {/* Subtext info */}
            <p className="text-[11px] text-gray-500 text-center mt-3">
              Pay securely with UPI, cards and other available methods
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Payment;
