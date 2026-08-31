import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import authService from '../services/authService';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [complete, setComplete] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email || !/^\d{6}$/.test(otp)) {
      setError('Enter the email address and six-digit verification code we sent you.');
      return;
    }
    if (password.length < 12) {
      setError('Use a password with at least 12 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await authService.resetPassword({ email, otp, new_password: password });
      setComplete(true);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'The verification code is invalid or has expired.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-md px-4 py-24">
      <section className="rounded-2xl border border-[#E6E1D8] bg-white p-8 shadow-lg">
        <h1 className="mb-3 text-3xl font-bold text-[#382135]">Verify and reset password</h1>
        {complete ? (
          <><p role="status" className="text-sm text-gray-700">Your password was reset. Please sign in with your new password.</p><Link to="/login" className="mt-6 inline-block text-sm font-medium text-[#382135] underline">Sign in</Link></>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-sm font-medium text-[#382135]" htmlFor="reset-email">Email address</label>
            <input id="reset-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-3 focus:border-[#382135] focus:outline-none" />
            <label className="block text-sm font-medium text-[#382135]" htmlFor="reset-otp">Verification code</label>
            <input id="reset-otp" type="text" inputMode="numeric" autoComplete="one-time-code" required pattern="[0-9]{6}" maxLength="6" value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, ''))} className="w-full rounded-lg border border-gray-300 px-3 py-3 tracking-[0.35em] focus:border-[#382135] focus:outline-none" />
            <label className="block text-sm font-medium text-[#382135]" htmlFor="new-password">New password</label>
            <input id="new-password" type="password" autoComplete="new-password" required minLength="12" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-3 focus:border-[#382135] focus:outline-none" />
            <label className="block text-sm font-medium text-[#382135]" htmlFor="confirm-password">Confirm new password</label>
            <input id="confirm-password" type="password" autoComplete="new-password" required minLength="12" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-3 focus:border-[#382135] focus:outline-none" />
            {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
            <button disabled={submitting} className="w-full rounded-lg bg-[#382135] px-4 py-3 font-semibold text-white disabled:opacity-60">{submitting ? 'Resetting…' : 'Verify and reset password'}</button>
          </form>
        )}
      </section>
    </main>
  );
};

export default ResetPassword;
