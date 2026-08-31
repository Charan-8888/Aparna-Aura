import React, { memo } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

const ErrorState = memo(({ 
  title = "Something went wrong", 
  message = "We're having trouble connecting to the server. Please try again.", 
  onRetry 
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
        <AlertCircle size={32} />
      </div>
      <h3 className="text-xl font-bold text-[#382135] mb-2">{title}</h3>
      <p className="text-gray-500 max-w-md mx-auto mb-8">{message}</p>
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 bg-[#382135] text-white px-6 py-3 rounded-full font-medium hover:bg-[#2a1827] transition-colors"
        >
          <RefreshCw size={18} />
          Try Again
        </button>
      )}
    </div>
  );
});

ErrorState.displayName = 'ErrorState';

export default ErrorState;
