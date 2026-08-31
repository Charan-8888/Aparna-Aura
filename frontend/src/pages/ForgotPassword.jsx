import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setStatus('');
    try {
      await authService.forgotPassword(email);
      setStatus('If an account exists for that email, a verification code has been sent.');
      navigate(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch {
      setStatus('We could not process the request. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-md px-4 py-24">
      <section className="rounded-2xl border border-[#E6E1D8] bg-white p-8 shadow-lg">
        <h1 className="mb-3 text-3xl font-bold text-[#382135]">Reset your password</h1>
        <p className="mb-6 text-sm text-gray-600">Enter your email and we’ll send a six-digit verification code.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm font-medium text-[#382135]" htmlFor="reset-email">Email address</label>
          <input id="reset-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-3 focus:border-[#382135] focus:outline-none" />
          <button disabled={submitting} className="w-full rounded-lg bg-[#382135] px-4 py-3 font-semibold text-white disabled:opacity-60">
            {submitting ? 'Sending…' : 'Send verification code'}
          </button>
        </form>
        {status && <p role="status" className="mt-4 text-sm text-gray-700">{status}</p>}
        <Link to="/login" className="mt-6 inline-block text-sm font-medium text-[#382135] underline">Back to sign in</Link>
      </section>
    </main>
  );
};

export default ForgotPassword;
