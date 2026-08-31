import React, { memo } from 'react';

const PriceBadge = memo(({ price, originalPrice, formatPrice, size = 'md' }) => {
  const numericPrice = Number(price || 0);
  const isPriceOnRequest = numericPrice <= 0;

  const discount = !isPriceOnRequest && originalPrice > numericPrice
    ? Math.round(((originalPrice - numericPrice) / originalPrice) * 100)
    : 0;

  const sizes = {
    sm: { price: 'text-base', original: 'text-xs', badge: 'text-[10px] px-1.5 py-0.5', request: 'text-sm' },
    md: { price: 'text-xl', original: 'text-sm', badge: 'text-xs px-2 py-0.5', request: 'text-base' },
    lg: { price: 'text-3xl', original: 'text-lg', badge: 'text-sm px-2.5 py-1', request: 'text-xl' },
  };

  const s = sizes[size];

  if (isPriceOnRequest) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`${s.request} font-semibold text-[#D4AF37] tracking-wide`}>
          Price on Request
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className={`${s.price} font-bold text-[#382135]`}>
        {formatPrice(numericPrice)}
      </span>
      {discount > 0 && (
        <>
          <span className={`${s.original} text-gray-400 line-through`}>
            {formatPrice(originalPrice)}
          </span>
          <span className={`${s.badge} bg-green-100 text-green-700 font-semibold rounded-full`}>
            {discount}% off
          </span>
        </>
      )}
    </div>
  );
});

PriceBadge.displayName = 'PriceBadge';

export default PriceBadge;
