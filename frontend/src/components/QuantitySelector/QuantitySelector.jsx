import React, { memo } from 'react';
import { Minus, Plus } from 'lucide-react';

const QuantitySelector = memo(({ quantity = 1, onChange, min = 1, max = 99 }) => {
  const handleDecrease = () => {
    if (quantity > min) onChange?.(quantity - 1);
  };

  const handleIncrease = () => {
    if (quantity < max) onChange?.(quantity + 1);
  };

  return (
    <div className="inline-flex items-center border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={handleDecrease}
        disabled={quantity <= min}
        className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
      >
        <Minus size={16} />
      </button>
      <span className="w-12 h-10 flex items-center justify-center text-sm font-semibold text-[#382135] border-x border-gray-200">
        {quantity}
      </span>
      <button
        onClick={handleIncrease}
        disabled={quantity >= max}
        className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
      >
        <Plus size={16} />
      </button>
    </div>
  );
});

QuantitySelector.displayName = 'QuantitySelector';

export default QuantitySelector;
