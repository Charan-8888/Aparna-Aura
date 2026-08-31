import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trash2, 
  MapPin, 
  Check, 
  ShieldCheck, 
  Lock, 
  ArrowRight, 
  Truck, 
  RotateCcw, 
  Plus, 
  X, 
  Loader2, 
  Headphones
} from 'lucide-react';
import Loader from '../components/Loader/Loader';
import EmptyState from '../components/EmptyState/EmptyState';
import SkeletonLoader from '../components/SkeletonLoader/SkeletonLoader';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import addressService from '../services/addressService';
import orderService from '../services/orderService';
import { getWhatsAppUrl } from '../constants/socialLinks';
import PaymentMethodsRow from '../components/PaymentMethods/PaymentMethodsRow';

const formatPrice = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount || 0);

const Checkout = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { cart, items, itemCount, subtotal, tax, shipping, grandTotal, loading: cartLoading, removeItem } = useCart();
  
  const [addresses, setAddresses] = useState([]);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState('');

  // Address Selector / Modal State
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    full_name: currentUser ? `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim() : '',
    phone: '',
    house_no: '',
    street: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    is_default: true,
  });
  const [savingAddress, setSavingAddress] = useState(false);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const data = await addressService.getAddresses();
        const addressList = Array.isArray(data) ? data : (data.results || []);
        setAddresses(addressList);
        
        // Auto-select default or first address
        const defaultAddr = addressList.find(a => a.is_default);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
        } else if (addressList.length > 0) {
          setSelectedAddressId(addressList[0].id);
        }
      } catch (err) {
        console.error("Failed to load addresses", err);
      } finally {
        setAddressesLoading(false);
      }
    };
    fetchAddresses();
  }, []);

  const handleSaveNewAddress = async (e) => {
    e.preventDefault();
    setSavingAddress(true);
    try {
      const saved = await addressService.createAddress(newAddress);
      const updatedList = [...addresses, saved];
      setAddresses(updatedList);
      setSelectedAddressId(saved.id);
      setShowAddAddressForm(false);
      setShowAddressModal(false);
    } catch (err) {
      console.error("Failed to save address", err);
    } finally {
      setSavingAddress(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      setError("Please select or add a shipping address.");
      return;
    }

    // Guard: block checkout if any item has ₹0 price (Price on Request)
    const hasZeroPriceItems = items.some(item => Number(item.price || item.product?.price || 0) <= 0);
    if (hasZeroPriceItems || grandTotal <= 0) {
      setError("Your bag contains items with pricing pending (Price on Request). Please remove them before proceeding to payment.");
      return;
    }
    
    setPlacingOrder(true);
    setError('');
    
    try {
      const response = await orderService.checkout(selectedAddressId);
      const orderData = response.data || response;
      const orderId = orderData.id;
      
      if (orderId) {
        navigate(`/payment/${orderId}`);
      } else {
        throw new Error("Order ID not returned from server.");
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.error || "We couldn't prepare your order. Please try again.");
    } finally {
      setPlacingOrder(false);
    }
  };

  const selectedAddress = addresses.find(a => a.id === selectedAddressId) || addresses[0];

  if (cartLoading || addressesLoading) {
    return (
      <div className="bg-[#FBF8F2] min-h-screen py-12 px-6 sm:px-12 max-w-[1500px] mx-auto">
        <div className="space-y-6">
          <SkeletonLoader className="h-10 w-64" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8 space-y-4">
              <SkeletonLoader className="h-32 w-full rounded-2xl" />
              <SkeletonLoader className="h-32 w-full rounded-2xl" />
            </div>
            <div className="lg:col-span-4">
              <SkeletonLoader className="h-96 w-full rounded-3xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (itemCount === 0) {
    return (
      <div className="bg-[#FBF8F2] min-h-[75vh] flex items-center justify-center px-4">
        <EmptyState
          title="Your Bag is Empty"
          description="You don't have any items ready for checkout. Explore our royal handcrafted jewellery collections."
          action={
            <Link to="/products" className="bg-[#301B2F] text-white px-8 py-3.5 rounded-full mt-4 inline-block font-semibold hover:bg-[#241020] transition-colors shadow-lg">
              Explore Collections
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="bg-[#FBF8F2] min-h-screen text-[#301B2F] pb-24">
      
      {/* ── Main Container: max-width 1500px, responsive padding ── */}
      <div className="max-w-[1500px] mx-auto px-4 sm:px-8 lg:px-12 pt-6 sm:pt-8">

        {/* ── Checkout Progress Indicator (Stepper) ── */}
        <div className="max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="relative flex items-center justify-between">
            {/* Connecting line */}
            <div className="absolute top-1/2 left-8 right-8 h-[1px] bg-[#301B2F]/15 -translate-y-1/2 -z-0" />
            
            {/* Step 1: Review Items (Active) */}
            <div className="relative z-10 flex flex-col items-center bg-[#FBF8F2] px-2 sm:px-4">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#301B2F] text-white text-xs sm:text-sm font-bold flex items-center justify-center shadow-md">
                1
              </div>
              <div className="mt-2 text-center">
                <span className="text-xs sm:text-sm font-bold text-[#301B2F] block">
                  Review Cart
                </span>
                <div className="w-full h-[2px] bg-[#301B2F] mt-0.5 rounded-full" />
              </div>
            </div>

            {/* Step 2: Shipping & Address */}
            <div className="relative z-10 flex flex-col items-center bg-[#FBF8F2] px-2 sm:px-4">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-[#D4A936]/60 bg-white text-[#301B2F] text-xs sm:text-sm font-bold flex items-center justify-center">
                2
              </div>
              <span className="text-xs sm:text-sm font-medium text-[#6F666B] mt-2 text-center">
                Shipping & Address
              </span>
            </div>

            {/* Step 3: Payment */}
            <div className="relative z-10 flex flex-col items-center bg-[#FBF8F2] px-2 sm:px-4">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-[#D4A936]/60 bg-white text-[#301B2F] text-xs sm:text-sm font-bold flex items-center justify-center">
                3
              </div>
              <span className="text-xs sm:text-sm font-medium text-[#6F666B] mt-2 text-center">
                Payment
              </span>
            </div>

            {/* Step 4: Confirmation */}
            <div className="relative z-10 flex flex-col items-center bg-[#FBF8F2] px-2 sm:px-4">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-[#D4A936]/60 bg-white text-[#301B2F] text-xs sm:text-sm font-bold flex items-center justify-center">
                4
              </div>
              <span className="text-xs sm:text-sm font-medium text-[#6F666B] mt-2 text-center">
                Confirmation
              </span>
            </div>
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        {/* ── Main Two-Column Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-[72px] items-start">
          
          {/* ════════════════════ LEFT COLUMN (~64%) ════════════════════ */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-10">
            
            {/* 1. Review Your Items */}
            <section>
              <h1 
                className="text-2xl sm:text-[30px] font-semibold text-[#301B2F] mb-5 tracking-tight"
                style={{ fontFamily: '"Playfair Display", serif' }}
              >
                1. Review Your Items
              </h1>

              <div className="space-y-3.5">
                {items.map((item) => {
                  const productImg = typeof item.product?.images?.[0] === 'object' 
                    ? item.product.images?.[0]?.image 
                    : (item.product?.images?.[0] || item.product?.image || '/placeholder.png');
                  
                  const rawPrice = Number(item.price || item.product?.price || 0);
                  const isPriceOnRequest = rawPrice <= 0;
                  const categoryName = item.product?.category?.name || 'Premium Collection';

                  return (
                    <div 
                      key={item.id}
                      className="bg-[#FFFDF9] rounded-[14px] border border-[#301B2F]/[0.09] p-4 sm:p-5 flex items-center justify-between gap-4 sm:gap-6 shadow-[0_5px_18px_rgba(48,27,47,0.035)] hover:shadow-md transition-shadow min-h-[118px]"
                    >
                      {/* Product Thumbnail (~145x105 on desktop) */}
                      <div className="w-24 h-24 sm:w-32 sm:h-24 md:w-36 md:h-28 rounded-lg overflow-hidden bg-[#FAF8F5] border border-[#301B2F]/[0.06] flex-shrink-0">
                        <img 
                          src={productImg} 
                          alt={item.product?.name} 
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0 pr-2">
                        <h2 
                          className="text-base sm:text-lg font-semibold text-[#301B2F] line-clamp-1"
                          style={{ fontFamily: '"Playfair Display", serif' }}
                        >
                          {item.product?.name}
                        </h2>
                        
                        <div className="mt-1">
                          <span className="inline-block bg-[#FDF8EC] text-[#B8860B] border border-[#F5E7C4] text-[10px] sm:text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                            {categoryName}
                          </span>
                        </div>

                        <p className="text-xs text-[#6F666B] mt-1.5 font-medium">
                          Qty: {item.quantity} {item.product?.warranty ? `• Warranty: ${item.product.warranty}` : ''}
                        </p>
                      </div>

                      {/* Price & Delete Action */}
                      <div className="flex flex-col items-end justify-between h-24 sm:h-28 py-1 flex-shrink-0">
                        {isPriceOnRequest ? (
                          <span className="text-xs sm:text-sm font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                            Price on Request
                          </span>
                        ) : (
                          <span 
                            className="text-base sm:text-xl font-bold text-[#301B2F]"
                            style={{ fontFamily: '"Playfair Display", serif' }}
                          >
                            {formatPrice(rawPrice * item.quantity)}
                          </span>
                        )}
                        
                        {/* Remove button (40x40 circle) */}
                        <button
                          onClick={() => removeItem(item.id)}
                          title="Remove item"
                          className="w-10 h-10 rounded-full border border-[#D4A936]/30 bg-white text-[#8C7A6B] hover:text-[#B8860B] hover:border-[#D4A936] hover:bg-[#FAF6F0] flex items-center justify-center transition-all shadow-sm"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>


            {/* 2. Shipping & Delivery */}
            <section>
              <h2 
                className="text-2xl sm:text-[26px] font-semibold text-[#301B2F] mb-4 tracking-tight"
                style={{ fontFamily: '"Playfair Display", serif' }}
              >
                2. Shipping & Delivery
              </h2>

              {selectedAddress ? (
                <div className="bg-[#FFFDF9] rounded-[14px] border border-[#301B2F]/[0.09] p-5 sm:p-6 shadow-[0_5px_18px_rgba(48,27,47,0.035)]">
                  <div className="flex items-start justify-between gap-4">
                    
                    <div className="flex items-start gap-4">
                      {/* Location Icon Circle */}
                      <div className="w-12 h-12 rounded-full bg-[#301B2F] text-white flex items-center justify-center flex-shrink-0 shadow-md">
                        <MapPin size={22} className="text-[#D4A936]" />
                      </div>

                      {/* Address Info */}
                      <div>
                        <span className="text-xs font-medium text-[#6F666B] block mb-0.5">
                          Deliver to
                        </span>
                        <h3 className="text-base font-bold text-[#301B2F]">
                          {selectedAddress.full_name || (currentUser ? `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim() : 'Customer')}
                        </h3>
                        <p className="text-xs sm:text-sm text-[#6F666B] font-medium mt-0.5">
                          {selectedAddress.phone} {currentUser?.email && `• ${currentUser.email}`}
                        </p>
                        <p className="text-xs sm:text-sm text-[#6F666B] leading-relaxed mt-1 max-w-lg">
                          {[
                            selectedAddress.house_no,
                            selectedAddress.street,
                            selectedAddress.landmark,
                            selectedAddress.city,
                            selectedAddress.state ? `${selectedAddress.state} - ${selectedAddress.pincode}` : selectedAddress.pincode,
                            selectedAddress.country || 'India'
                          ].filter(Boolean).join(', ')}
                        </p>
                      </div>
                    </div>

                    {/* Change Button */}
                    <button 
                      onClick={() => setShowAddressModal(true)}
                      className="border border-[#301B2F]/20 text-[#301B2F] hover:bg-[#301B2F] hover:text-white px-4 py-1.5 rounded-lg text-xs font-bold bg-white transition-all flex-shrink-0 shadow-sm"
                    >
                      Change
                    </button>
                  </div>

                  {/* Free Insured Shipping Incentive Banner */}
                  <div className="mt-4 bg-[#FAF6F0] border border-[#EFE8DC] rounded-xl p-3.5 flex items-center gap-3 text-xs text-[#6B5738]">
                    <Truck size={18} className="text-[#8C6D3B] flex-shrink-0" />
                    <span>Enjoy <strong>FREE</strong> insured shipping on orders over ₹5,000</span>
                  </div>
                </div>
              ) : (
                <div className="bg-[#FFFDF9] rounded-[14px] border border-dashed border-[#301B2F]/20 p-8 text-center">
                  <MapPin className="mx-auto text-gray-400 mb-3" size={32} />
                  <p className="text-sm font-semibold text-[#301B2F] mb-4">No shipping address found</p>
                  <button 
                    onClick={() => { setShowAddAddressForm(true); setShowAddressModal(true); }}
                    className="inline-flex items-center gap-2 bg-[#301B2F] text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-[#241020] transition-colors shadow-md"
                  >
                    <Plus size={16} /> Add Shipping Address
                  </button>
                </div>
              )}
            </section>


            {/* Reassurance Strip (3 Blocks with vertical dividers) */}
            <div className="pt-4 border-t border-[#301B2F]/10">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-4">
                
                {/* Reassurance 1 */}
                <div className="flex items-start gap-3">
                  <ShieldCheck size={22} className="text-[#D4A936] flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-[#301B2F] uppercase tracking-wider">Certified Jewellery</h4>
                    <p className="text-xs text-[#6F666B] mt-0.5">100% genuine & hallmarked</p>
                  </div>
                </div>

                {/* Reassurance 2 */}
                <div className="flex items-start gap-3 sm:border-l sm:border-[#301B2F]/10 sm:pl-6">
                  <Truck size={22} className="text-[#D4A936] flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-[#301B2F] uppercase tracking-wider">Insured Shipping</h4>
                    <p className="text-xs text-[#6F666B] mt-0.5">Free on orders over ₹5,000</p>
                  </div>
                </div>

                {/* Reassurance 3 */}
                <div className="flex items-start gap-3 sm:border-l sm:border-[#301B2F]/10 sm:pl-6">
                  <Headphones size={22} className="text-[#D4A936] flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-[#301B2F] uppercase tracking-wider">Customer Support</h4>
                    <a 
                      href={getWhatsAppUrl('Hi Aparna Aura, I need assistance with my checkout order.')} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-[#8C6D3B] font-semibold hover:underline block mt-0.5"
                    >
                      Chat with us on WhatsApp
                    </a>
                  </div>
                </div>

              </div>
            </div>

          </div>


          {/* ════════════════════ RIGHT COLUMN (~32%) ════════════════════ */}
          <div className="lg:col-span-5 xl:col-span-4">
            <motion.div 
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-7 sm:p-8 lg:p-9 shadow-[0_16px_40px_rgba(36,16,32,0.25)] border border-white/10 lg:sticky lg:top-[110px] overflow-hidden text-[#FFFDF9]"
              style={{
                background: `
                  radial-gradient(circle at 100% 100%, rgba(200,155,50,0.08), transparent 40%),
                  linear-gradient(145deg, #241020 0%, #381C34 100%)
                `
              }}
            >
              {/* Header: Order Summary + Secure Checkout */}
              <div className="flex items-center justify-between mb-8 pb-1">
                <div>
                  <h2 
                    className="text-2xl sm:text-[28px] font-semibold text-[#FFFAF5] tracking-wide"
                    style={{ fontFamily: '"Playfair Display", serif' }}
                  >
                    Order Summary
                  </h2>
                  <div className="w-10 h-0.5 bg-[#D4A936] mt-2 rounded-full" />
                </div>

                {/* Secure Checkout Badge */}
                <div 
                  className="rounded-lg px-2.5 py-1 sm:px-3 sm:py-1.5 flex items-center gap-2 sm:gap-2.5 transition-colors"
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(212, 169, 54, 0.45)',
                    color: '#FFF8EE',
                  }}
                >
                  <ShieldCheck size={15} className="text-[#D4A936] flex-shrink-0" />
                  <div>
                    <span 
                      className="text-[10px] sm:text-[11px] font-bold block leading-tight tracking-wide"
                      style={{ color: '#FFF8EE' }}
                    >
                      Secure Checkout
                    </span>
                    <span 
                      className="text-[8px] sm:text-[9px] block leading-tight font-medium"
                      style={{ color: 'rgba(255, 248, 238, 0.68)' }}
                    >
                      Your information is protected
                    </span>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-4 mb-7 text-xs sm:text-sm text-white/80">
                <div className="flex justify-between items-center">
                  <span>Subtotal ({itemCount} items)</span>
                  <span className="font-semibold text-white text-sm sm:text-base">{formatPrice(subtotal)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span>Insured Shipping</span>
                  <span className="font-semibold text-[#D4A936]">
                    {shipping > 0 ? formatPrice(shipping) : 'Complimentary'}
                  </span>
                </div>

                {tax > 0 && (
                  <div className="flex justify-between items-center">
                    <span>Tax (GST)</span>
                    <span className="font-semibold text-white">{formatPrice(tax)}</span>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-white/15 pt-6 mb-7">
                <div className="flex justify-between items-baseline mb-1.5">
                  <span className="text-sm sm:text-base font-bold uppercase tracking-wider text-white">Total</span>
                  <span 
                    className="text-3xl sm:text-[36px] font-semibold text-[#D4A936]"
                    style={{ fontFamily: '"Playfair Display", serif' }}
                  >
                    {formatPrice(grandTotal)}
                  </span>
                </div>
                <p className="text-xs text-white/50 text-right">Inclusive of all duties and taxes</p>
              </div>

              {/* Continue to Payment CTA Button */}
              <button 
                onClick={handlePlaceOrder}
                disabled={placingOrder || !selectedAddressId}
                className="w-full h-[58px] sm:h-[60px] rounded-lg font-bold text-[#301B2F] uppercase text-xs sm:text-sm tracking-wider flex items-center justify-center gap-2 hover:brightness-105 active:translate-y-[1px] transition-all shadow-lg shadow-[#D4A936]/25 disabled:opacity-60"
                style={{
                  background: 'linear-gradient(90deg, #D7A83B 0%, #EDC768 50%, #D39A29 100%)'
                }}
              >
                {placingOrder ? (
                  <>
                    <Loader2 className="animate-spin text-[#301B2F]" size={18} />
                    <span>Preparing secure payment...</span>
                  </>
                ) : (
                  <>
                    <span>Continue to Payment</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              <p className="text-xs text-white/60 text-center mt-3 font-medium">
                You won't be charged yet
              </p>

              {/* Payment Methods Badges */}
              <PaymentMethodsRow className="mt-7 pt-6 border-t border-white/10" />

              {/* Security & Support Reassurance */}
              <div 
                className="mt-7 rounded-xl p-4 sm:p-5 space-y-3.5"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(212, 169, 54, 0.45)',
                  color: '#FFF8EE',
                }}
              >
                <div className="flex items-start gap-3">
                  <ShieldCheck size={17} className="text-[#D4A936] flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold" style={{ color: '#FFF8EE' }}>Certified Authentic Jewellery</h4>
                    <p className="text-[11px]" style={{ color: 'rgba(255, 248, 238, 0.68)' }}>100% genuine & hallmarked</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Truck size={17} className="text-[#D4A936] flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold" style={{ color: '#FFF8EE' }}>Insured & Trackable Shipping</h4>
                    <p className="text-[11px]" style={{ color: 'rgba(255, 248, 238, 0.68)' }}>Safe delivery to your doorstep</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <RotateCcw size={17} className="text-[#D4A936] flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold" style={{ color: '#FFF8EE' }}>Easy Returns & Exchanges</h4>
                    <p className="text-[11px]" style={{ color: 'rgba(255, 248, 238, 0.68)' }}>7-day easy return policy</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Lock size={17} className="text-[#D4A936] flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold" style={{ color: '#FFF8EE' }}>Secure Payments</h4>
                    <p className="text-[11px]" style={{ color: 'rgba(255, 248, 238, 0.68)' }}>Encrypted & trusted checkout powered by Razorpay</p>
                  </div>
                </div>
              </div>

            </motion.div>
          </div>

        </div>
      </div>

      {/* ── Address Selector / Add Modal ── */}
      <AnimatePresence>
        {showAddressModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100">
                <h3 className="text-lg font-bold text-[#301B2F]" style={{ fontFamily: '"Playfair Display", serif' }}>
                  {showAddAddressForm ? 'Add New Address' : 'Select Delivery Address'}
                </h3>
                <button 
                  onClick={() => { setShowAddressModal(false); setShowAddAddressForm(false); }}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>

              {!showAddAddressForm ? (
                <div className="space-y-3">
                  {addresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id;
                    return (
                      <div 
                        key={addr.id}
                        onClick={() => { setSelectedAddressId(addr.id); setShowAddressModal(false); }}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start justify-between gap-3 ${
                          isSelected 
                            ? 'border-[#301B2F] bg-[#FAF8F5]' 
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div>
                          <h4 className="text-sm font-bold text-[#301B2F]">{addr.full_name}</h4>
                          <p className="text-xs text-[#6F666B] mt-0.5">{addr.phone}</p>
                          <p className="text-xs text-[#6F666B] mt-1 leading-relaxed">
                            {[addr.house_no, addr.street, addr.city, addr.state, addr.pincode].filter(Boolean).join(', ')}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-[#301B2F] text-white flex items-center justify-center flex-shrink-0">
                            <Check size={14} />
                          </div>
                        )}
                      </div>
                    );
                  })}

                  <button 
                    onClick={() => setShowAddAddressForm(true)}
                    className="w-full py-3 border-2 border-dashed border-gray-300 rounded-2xl text-xs font-bold text-gray-600 hover:border-[#301B2F] hover:text-[#301B2F] flex items-center justify-center gap-2 transition-colors mt-4"
                  >
                    <Plus size={16} /> Add New Address
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSaveNewAddress} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={newAddress.full_name}
                      onChange={(e) => setNewAddress({...newAddress, full_name: e.target.value})}
                      className="w-full px-3.5 py-2.5 text-xs border border-gray-300 rounded-xl focus:outline-none focus:border-[#301B2F]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Phone Number</label>
                    <input 
                      type="tel" 
                      required
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})}
                      className="w-full px-3.5 py-2.5 text-xs border border-gray-300 rounded-xl focus:outline-none focus:border-[#301B2F]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">Flat / House No.</label>
                      <input 
                        type="text" 
                        required
                        value={newAddress.house_no}
                        onChange={(e) => setNewAddress({...newAddress, house_no: e.target.value})}
                        className="w-full px-3.5 py-2.5 text-xs border border-gray-300 rounded-xl focus:outline-none focus:border-[#301B2F]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">Street / Area</label>
                      <input 
                        type="text" 
                        required
                        value={newAddress.street}
                        onChange={(e) => setNewAddress({...newAddress, street: e.target.value})}
                        className="w-full px-3.5 py-2.5 text-xs border border-gray-300 rounded-xl focus:outline-none focus:border-[#301B2F]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">City</label>
                      <input 
                        type="text" 
                        required
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                        className="w-full px-3.5 py-2.5 text-xs border border-gray-300 rounded-xl focus:outline-none focus:border-[#301B2F]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">State</label>
                      <input 
                        type="text" 
                        required
                        value={newAddress.state}
                        onChange={(e) => setNewAddress({...newAddress, state: e.target.value})}
                        className="w-full px-3.5 py-2.5 text-xs border border-gray-300 rounded-xl focus:outline-none focus:border-[#301B2F]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">PIN Code</label>
                      <input 
                        type="text" 
                        required
                        value={newAddress.pincode}
                        onChange={(e) => setNewAddress({...newAddress, pincode: e.target.value})}
                        className="w-full px-3.5 py-2.5 text-xs border border-gray-300 rounded-xl focus:outline-none focus:border-[#301B2F]"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-3">
                    <button 
                      type="button"
                      onClick={() => setShowAddAddressForm(false)}
                      className="flex-1 py-3 border border-gray-300 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-50"
                    >
                      Back
                    </button>
                    <button 
                      type="submit"
                      disabled={savingAddress}
                      className="flex-1 py-3 bg-[#301B2F] text-white text-xs font-bold rounded-xl hover:bg-[#241020] disabled:opacity-60"
                    >
                      {savingAddress ? 'Saving...' : 'Save & Deliver Here'}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Checkout;
