import React, { forwardRef } from 'react';

const Input = forwardRef(({ 
  label, 
  error, 
  className = '', 
  id,
  icon: Icon,
  type = 'text',
  ...props 
}, ref) => {
  const generatedId = React.useId();
  const inputId = id || generatedId;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={inputId} className="block text-[11px] font-bold uppercase tracking-[0.12em] text-[#5f5651] mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A8A8A]" />
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={`
            w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 
            rounded-[14px] border border-[#ded2c1] bg-white text-[#9B722B] font-semibold text-sm tracking-wide
            shadow-[0_8px_24px_rgba(48,27,47,0.035)] transition-all duration-300
            placeholder:text-[#c4a470] placeholder:font-normal
            focus:outline-none focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227]
            disabled:cursor-not-allowed disabled:opacity-50
            dark:bg-[#121212] dark:border-gray-700 dark:text-[#E5C158] dark:placeholder:text-[#9A9A9A]
            ${error ? 'border-red-400 bg-red-50 focus:ring-red-400 dark:border-red-900 dark:bg-red-900/20' : ''}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-red-600 font-medium">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
