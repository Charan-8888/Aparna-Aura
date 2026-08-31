import React from 'react';
import { ShieldCheck, Sparkles, Truck, Lock, RefreshCw } from 'lucide-react';

const LuxuryGuarantees = ({ className = '' }) => {
  const guarantees = [
    { icon: ShieldCheck, text: 'Certified Authenticity' },
    { icon: Sparkles, text: 'Complimentary Luxury Packaging' },
    { icon: Truck, text: 'Insured Delivery' },
    { icon: Lock, text: 'Secure Payments' },
    { icon: RefreshCw, text: '30-Day Returns' }
  ];

  return (
    <div className={`py-6 border-t border-gray-100 ${className}`}>
      <div className="flex flex-col gap-3">
        {guarantees.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="flex items-center gap-3 text-sm text-[#382135]">
              <Icon size={16} className="text-[#D4AF37]" />
              <span className="font-medium">{item.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LuxuryGuarantees;
