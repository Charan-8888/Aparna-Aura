import React from 'react';
import visaLogo from '../../assets/payment-methods/visa.svg';
import mastercardLogo from '../../assets/payment-methods/mastercard.svg';
import amexLogo from '../../assets/payment-methods/amex.svg';
import rupayLogo from '../../assets/payment-methods/rupay.svg';
import upiLogo from '../../assets/payment-methods/upi.svg';

const PAYMENT_METHODS = [
  { id: 'visa', name: 'Visa', logo: visaLogo, width: 'w-11 sm:w-12' },
  { id: 'mastercard', name: 'Mastercard', logo: mastercardLogo, width: 'w-8 sm:w-9' },
  { id: 'amex', name: 'American Express', logo: amexLogo, width: 'w-9 sm:w-10' },
  { id: 'rupay', name: 'RuPay', logo: rupayLogo, width: 'w-12 sm:w-14' },
  { id: 'upi', name: 'UPI', logo: upiLogo, width: 'w-11 sm:w-12' },
];

const PaymentMethodsRow = ({ title = 'We Accept', className = '' }) => {
  return (
    <div className={`text-center ${className}`}>
      {title && (
        <span className="text-[10px] sm:text-xs text-white/50 uppercase tracking-widest block mb-3 font-semibold">
          {title}
        </span>
      )}
      <div className="flex items-center justify-center gap-2 sm:gap-2.5 flex-wrap">
        {PAYMENT_METHODS.map((method) => (
          <div
            key={method.id}
            title={method.name}
            className="h-[38px] sm:h-[42px] px-3 sm:px-3.5 bg-white rounded-xl flex items-center justify-center shadow-md border border-white/20 transition-all hover:scale-105"
          >
            <img
              src={method.logo}
              alt={method.name}
              className={`h-4 sm:h-5 ${method.width} object-contain`}
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentMethodsRow;
