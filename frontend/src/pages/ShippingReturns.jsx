import React from 'react';
import { Truck, ShieldCheck, RefreshCw, Box } from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import LuxuryGuarantees from '../components/LuxuryGuarantees/LuxuryGuarantees';

const ShippingReturns = () => {
  return (
    <div className="bg-white min-h-screen pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Breadcrumb items={[{ label: 'Shipping & Returns', path: '/shipping-returns' }]} />

        <div className="text-center mt-12 mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-[#382135] mb-4" style={{ fontFamily: '"Playfair Display", serif' }}>
            Shipping & Returns
          </h1>
          <p className="text-gray-500 max-w-lg mx-auto">
            Experience peace of mind with our complimentary insured delivery and hassle-free returns policy.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Shipping Info */}
          <div className="bg-[#FAF8F5] p-8 md:p-10 border border-[#E6E1D8]">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
              <Truck size={24} className="text-[#D4AF37]" />
            </div>
            <h2 className="text-2xl font-bold text-[#382135] mb-4" style={{ fontFamily: '"Playfair Display", serif' }}>
              Complimentary Delivery
            </h2>
            <p className="text-gray-600 mb-6 text-sm leading-relaxed">
              We offer complimentary express shipping on all domestic orders. Your exquisite jewellery will arrive safely, fully insured by us until it reaches your hands.
            </p>
            <ul className="space-y-4 text-sm">
              <li className="flex gap-3">
                <Box size={18} className="text-[#D4AF37] flex-shrink-0 mt-0.5" />
                <span className="text-[#382135] font-medium">Delivered in luxury unmarked packaging for security</span>
              </li>
              <li className="flex gap-3">
                <ShieldCheck size={18} className="text-[#D4AF37] flex-shrink-0 mt-0.5" />
                <span className="text-[#382135] font-medium">Fully insured transit with tracking</span>
              </li>
              <li className="flex gap-3">
                <span className="w-[18px] h-[18px] flex items-center justify-center bg-[#D4AF37] text-white rounded-full text-[10px] font-bold flex-shrink-0 mt-0.5">!</span>
                <span className="text-[#382135] font-medium">Signature strictly required upon delivery</span>
              </li>
            </ul>
          </div>

          {/* Returns Info */}
          <div className="bg-white p-8 md:p-10 border border-gray-200">
            <div className="w-12 h-12 bg-[#FAF8F5] rounded-full flex items-center justify-center mb-6">
              <RefreshCw size={24} className="text-[#D4AF37]" />
            </div>
            <h2 className="text-2xl font-bold text-[#382135] mb-4" style={{ fontFamily: '"Playfair Display", serif' }}>
              30-Day Returns
            </h2>
            <p className="text-gray-600 mb-6 text-sm leading-relaxed">
              We want you to be absolutely delighted with your purchase. If for any reason you are not, you may return it within 30 days for a full refund or exchange.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h4 className="font-bold text-[#382135] text-sm mb-2">Conditions for Return:</h4>
              <ul className="list-disc pl-4 space-y-1 text-xs text-gray-600">
                <li>Item must be unworn and in original condition</li>
                <li>Security tag must remain completely intact</li>
                <li>All original packaging and certificates must be included</li>
                <li>Custom or bespoke pieces are final sale</li>
              </ul>
            </div>
            <p className="text-xs text-gray-500 italic">
              *Refunds are processed to the original payment method within 5-7 business days of passing quality inspection.
            </p>
          </div>
        </div>

        <div className="max-w-xl mx-auto bg-white p-8 border border-[#E6E1D8] shadow-sm mb-16">
          <h3 className="text-center text-[#382135] font-bold mb-4 uppercase tracking-widest text-sm">Our Promise</h3>
          <LuxuryGuarantees />
        </div>

      </div>
    </div>
  );
};

export default ShippingReturns;
