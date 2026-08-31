import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';

const NetworkDetector = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showRestored, setShowRestored] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowRestored(true);
      const timer = setTimeout(() => setShowRestored(false), 4000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowRestored(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showRestored) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 transition-all duration-500 transform animate-bounce-short">
      {!isOnline ? (
        <div className="flex items-center gap-3 bg-[#382135] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-amber-500/30 backdrop-blur-md">
          <WifiOff size={20} className="text-amber-400 animate-pulse" />
          <div>
            <p className="text-sm font-bold text-white">No Internet Connection</p>
            <p className="text-xs text-white/70">Check your network connection</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="ml-2 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            title="Retry"
          >
            <RefreshCw size={14} className="text-amber-300" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3 bg-emerald-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-emerald-500/30 backdrop-blur-md">
          <Wifi size={20} className="text-emerald-400" />
          <div>
            <p className="text-sm font-bold text-white">Connection Restored</p>
            <p className="text-xs text-emerald-200">You are back online</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default NetworkDetector;
