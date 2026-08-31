// src/utils/analytics.js

/**
 * Analytics utility to abstract tracking logic.
 * This makes it easy to switch providers (GA4, Mixpanel, etc.) 
 * and ensures GDPR compliance hooks can be added later.
 */

export const initAnalytics = () => {
  // Check if user has consented to cookies/tracking
  // const hasConsent = localStorage.getItem('cookieConsent') === 'true';
  // if (!hasConsent) return;

  // Placeholder for Google Analytics 4 (GA4) initialization
  const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
  
  if (GA_MEASUREMENT_ID && typeof window !== 'undefined') {
    // Inject script
    /*
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    script.async = true;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID);
    */
    console.log(`[Analytics] Initialized GA4: ${GA_MEASUREMENT_ID}`);
  }
};

export const trackPageView = (url) => {
  if (typeof window !== 'undefined' && window.gtag) {
    /*
    window.gtag('config', import.meta.env.VITE_GA_MEASUREMENT_ID, {
      page_path: url,
    });
    */
    console.log(`[Analytics] Page View: ${url}`);
  }
};

export const trackEvent = (eventName, eventParams = {}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    /*
    window.gtag('event', eventName, eventParams);
    */
    console.log(`[Analytics] Event: ${eventName}`, eventParams);
  }
};

export const trackPurchase = (transactionId, value, currency = 'INR', items = []) => {
  trackEvent('purchase', {
    transaction_id: transactionId,
    value,
    currency,
    items,
  });
};
