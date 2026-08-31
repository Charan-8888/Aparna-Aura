import { useCallback, useEffect, useRef, useState } from 'react';

const GOOGLE_SCRIPT_URL = 'https://accounts.google.com/gsi/client';
const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const loadGoogleScript = ({ retry = false } = {}) => new Promise((resolve, reject) => {
  let settled = false;
  const finish = (callback) => {
    if (!settled) {
      settled = true;
      clearTimeout(timeoutId);
      callback();
    }
  };
  const timeoutId = setTimeout(() => finish(() => reject(new Error('Google script timed out.'))), 8000);
  const existingScript = document.querySelector(`script[src="${GOOGLE_SCRIPT_URL}"]`);
  if (window.google?.accounts?.id) {
    finish(resolve);
    return;
  }
  if (retry && existingScript) {
    existingScript.remove();
  }
  if (existingScript && !retry) {
    existingScript.addEventListener('load', () => finish(resolve), { once: true });
    existingScript.addEventListener('error', () => finish(reject), { once: true });
    return;
  }
  const script = document.createElement('script');
  script.src = GOOGLE_SCRIPT_URL;
  script.async = true;
  script.onload = () => finish(resolve);
  script.onerror = () => finish(reject);
  document.head.appendChild(script);
});

const GoogleSignInButton = ({ onCredential, onError, text = 'continue_with' }) => {
  const containerRef = useRef(null);
  const onCredentialRef = useRef(onCredential);
  const onErrorRef = useRef(onError);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    onCredentialRef.current = onCredential;
    onErrorRef.current = onError;
  }, [onCredential, onError]);

  const renderGoogleButton = useCallback(async (retry = false) => {
    if (!clientId) return;
    setStatus('loading');
    window.__googleCredentialCallback = (credential) => onCredentialRef.current?.(credential);

    try {
      await loadGoogleScript({ retry });
      if (!containerRef.current) return;
      if (!window.__googleIdentityInitialized) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => window.__googleCredentialCallback?.(response.credential),
        });
        window.__googleIdentityInitialized = true;
      }
      containerRef.current.replaceChildren();
      window.google.accounts.id.renderButton(containerRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text,
        shape: 'rectangular',
        width: Math.min(containerRef.current.clientWidth || 384, 384),
        logo_alignment: 'left',
      });
      setStatus('ready');
    } catch {
      setStatus('error');
      onErrorRef.current?.(
        'Google sign-in could not be loaded. Confirm this site URL is an authorized JavaScript origin in Google Cloud Console.'
      );
    }
  }, [text]);

  useEffect(() => {
    renderGoogleButton();
    return () => {
      window.__googleCredentialCallback = undefined;
    };
  }, [renderGoogleButton]);

  if (!clientId) {
    return (
      <button
        type="button"
        onClick={() => alert("Google Sign-In requires a Client ID to be configured in .env")}
        className="flex w-full items-center justify-center gap-3 rounded-[4px] border border-[#747775] bg-white px-3 py-2.5 text-sm font-medium text-[#1f1f1f] transition-colors hover:bg-[#f8f8f8]"
      >
        <span className="text-lg font-bold text-[#4285F4]" aria-hidden="true">G</span>
        {text === 'signup_with' ? 'Sign up with Google' : 'Continue with Google'}
      </button>
    );
  }

  return (
    <div className="relative min-h-10" aria-busy={status === 'loading'}>
      {status !== 'ready' && (
        <button
          type="button"
          onClick={() => renderGoogleButton(true)}
          className="flex w-full items-center justify-center gap-3 rounded-[4px] border border-[#747775] bg-white px-3 py-2.5 text-sm font-medium text-[#1f1f1f] transition-colors hover:bg-[#f8f8f8]"
        >
          <span className="text-lg font-bold text-[#4285F4]" aria-hidden="true">G</span>
          Continue with Google
        </button>
      )}
      <div
        ref={containerRef}
        className={status === 'ready' ? 'block' : 'hidden'}
      />
    </div>
  );
};

export default GoogleSignInButton;
