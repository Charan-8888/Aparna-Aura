import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Gem } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { APP_NAME } from '../constants/app';
import Input from '../components/Input/Input';
import GoogleSignInButton from '../components/GoogleSignInButton/GoogleSignInButton';

const Login = () => {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address.';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required.';
    }
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field-level error on type
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (serverError) setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setServerError('');

    try {
      await login(formData.email, formData.password);
      navigate(from, { replace: true });
    } catch (err) {
      const data = err.response?.data;
      if (data) {
        // Backend uses a custom envelope: { success, message, errors }
        if (data.message) {
          setServerError(data.message);
        } else if (data.errors && Object.keys(data.errors).length > 0) {
          const fieldErrors = {};
          Object.entries(data.errors).forEach(([key, val]) => {
            fieldErrors[key] = Array.isArray(val) ? val[0] : String(val);
          });
          setErrors(fieldErrors);
        } else if (data.detail) {
          // Fallback for any un-wrapped DRF responses
          setServerError(data.detail);
        } else {
          setServerError('Login failed. Please check your credentials and try again.');
        }
      } else {
        setServerError('Unable to connect. Please check your internet and try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async (credential) => {
    setIsSubmitting(true);
    setServerError('');
    try {
      await loginWithGoogle(credential);
      navigate(from, { replace: true });
    } catch (err) {
      setServerError(err.response?.data?.google?.[0] || 'Google sign-in failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex">
      {/* ── Left: Luxury Image Panel (Desktop Only) ── */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#382135] items-center justify-center overflow-hidden">
        <img
          src="https://res.cloudinary.com/hnqsonlb/image/upload/v1787669843/aparna_aura/products/aura-p061/01.jpg"
          alt="Aparna Aura Heritage Jewellery"
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#382135] via-[#382135]/60 to-transparent" />
        <div className="relative z-10 text-center px-12 max-w-md">
          <Gem size={40} className="text-[#D4AF37] mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-3" style={{ fontFamily: '"Playfair Display", serif' }}>
            Welcome Back to {APP_NAME}
          </h2>
          <p className="text-white/50 text-sm leading-relaxed">
            Continue your journey with our exquisite collection of handcrafted jewellery.
          </p>
          <div className="mt-10 flex items-center justify-center gap-8 text-white/30 text-xs uppercase tracking-wider">
            <span>Certified</span>
            <span className="w-1 h-1 rounded-full bg-[#D4AF37]/50" />
            <span>Premium</span>
            <span className="w-1 h-1 rounded-full bg-[#D4AF37]/50" />
            <span>Authentic</span>
          </div>
        </div>
      </div>

      {/* ── Right: Login Form ── */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="text-center lg:text-left mb-10">
            <Link to="/" className="inline-block mb-6">
              <span
                className="text-3xl font-bold tracking-wider text-[var(--color-brand)]"
                style={{ fontFamily: '"Playfair Display", serif' }}
              >
                {APP_NAME}
              </span>
            </Link>
            <h1 className="text-2xl font-bold text-[var(--color-brand)] mb-2">Welcome Back</h1>
            <p className="text-[var(--color-muted)] text-sm">
              Sign in to your account to continue your journey
            </p>
          </div>

          {/* Card */}
          <div className="premium-card p-8">
            {/* Server Error Banner */}
            {serverError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-[12px] text-red-700 text-sm font-medium"
              >
                {serverError}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* Email */}
              <Input
                label="Email Address"
                name="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                icon={Mail}
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
              />

              {/* Password */}
              <div className="relative">
                <div className="absolute right-0 top-0 flex items-center h-5">
                  <Link
                    to="/forgot-password"
                    className="text-xs text-[var(--color-accent)] hover:text-[var(--color-brand)] transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  icon={Lock}
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3.5 top-[38px] text-[#8A8A8A] hover:text-[#382135] transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full mt-2"
              >
                {isSubmitting ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In <ArrowRight size={18} className="ml-2" />
                  </>
                )}
              </button>
            </form>

            <div className="flex items-center gap-3 my-6 text-xs text-[var(--color-muted)]">
              <span className="h-px flex-1 bg-[#E6E1D8]" />
              <span>OR</span>
              <span className="h-px flex-1 bg-[#E6E1D8]" />
            </div>
            <GoogleSignInButton
              onCredential={handleGoogleSignIn}
              onError={setServerError}
              text="signin_with"
            />
          </div>

          {/* Footer Link */}
          <p className="text-center text-sm text-[var(--color-muted)] mt-6">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-[var(--color-accent)] font-semibold hover:text-[var(--color-brand)] transition-colors"
            >
              Create one
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
