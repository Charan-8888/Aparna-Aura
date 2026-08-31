import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

const Select = forwardRef(({ 
  label, 
  error, 
  options = [],
  className = '', 
  id,
  ...props 
}, ref) => {
  const generatedId = React.useId();
  const selectId = id || generatedId;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={selectId} className="block text-[11px] font-bold uppercase tracking-[0.12em] text-[#5f5651] mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          className={`
            appearance-none w-full pl-4 pr-10 py-3 
            rounded-[14px] border border-[#ded2c1] bg-white text-[#9B722B] font-semibold text-sm tracking-wide
            shadow-[0_8px_24px_rgba(48,27,47,0.035)] transition-all duration-300 cursor-pointer
            focus:outline-none focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227]
            disabled:cursor-not-allowed disabled:opacity-50
            dark:bg-[#121212] dark:border-gray-700 dark:text-[#E5C158]
            ${error ? 'border-red-400 bg-red-50 focus:ring-red-400' : ''}
          `}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-white text-[#9B722B] dark:bg-[#121212] dark:text-[#E5C158]">
              {opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#6F6F6F]">
          <ChevronDown size={16} />
        </div>
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-red-600 font-medium">{error}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
