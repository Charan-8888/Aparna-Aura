/**
 * frontend/src/utils/razorpayLoader.js
 * 
 * Robust, promise-cached loader for Razorpay Standard Checkout SDK (checkout.js).
 * Includes timeout safeguards, error handling, and duplicate script prevention.
 */

let razorpayPromise = null;

export const loadRazorpayScript = () => {
  if (window.Razorpay) {
    return Promise.resolve(window.Razorpay);
  }

  if (razorpayPromise) {
    return razorpayPromise;
  }

  razorpayPromise = new Promise((resolve, reject) => {
    // Check if script element is already in the document
    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existingScript) {
      if (window.Razorpay) {
        resolve(window.Razorpay);
        return;
      }
      existingScript.addEventListener('load', () => resolve(window.Razorpay));
      existingScript.addEventListener('error', () => {
        razorpayPromise = null;
        reject(new Error('Unable to load payment service. Please try again.'));
      });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.crossOrigin = 'anonymous';

    let timeoutId = setTimeout(() => {
      script.remove();
      razorpayPromise = null;
      reject(new Error('Unable to load payment service. Please check your internet connection and try again.'));
    }, 15000);

    script.onload = () => {
      clearTimeout(timeoutId);
      if (window.Razorpay) {
        resolve(window.Razorpay);
      } else {
        razorpayPromise = null;
        reject(new Error('Payment gateway SDK did not initialize properly.'));
      }
    };

    script.onerror = () => {
      clearTimeout(timeoutId);
      script.remove();
      razorpayPromise = null;
      reject(new Error('Unable to load payment service. Please try again.'));
    };

    document.body.appendChild(script);
  });

  return razorpayPromise;
};
