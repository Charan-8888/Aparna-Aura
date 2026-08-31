import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { APP_NAME } from '../constants/app';
import Input from '../components/Input/Input';
import GoogleSignInButton from '../components/GoogleSignInButton/GoogleSignInButton';

const Register = () => {
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: '',
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const validate = () => {
    const newErrors = {};
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required.';
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required.';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address.';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length < 12) {
      newErrors.password = 'Password must be at least 12 characters.';
    }
    if (!formData.confirm_password) {
      newErrors.confirm_password = 'Please confirm your password.';
    } else if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match.';
    }
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      await register({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
      });
      // Auto-login on successful registration → go home
      navigate('/', { replace: true });
    } catch (err) {
      const data = err.response?.data;
      if (data) {
        // Backend wraps errors as { success: false, error: "..." or { field: [...] } }
        const errorPayload = data.error ?? data;

        if (typeof errorPayload === 'string') {
          setServerError(errorPayload);
        } else if (Array.isArray(errorPayload)) {
          setServerError(errorPayload.join(' '));
        } else if (typeof errorPayload === 'object' && errorPayload !== null) {
          // Could have non_field_errors or field-level keys
          const { non_field_errors, detail, ...fieldErrors } = errorPayload;
          if (detail) {
            setServerError(Array.isArray(detail) ? detail.join(' ') : detail);
          } else if (non_field_errors) {
            setServerError(Array.isArray(non_field_errors) ? non_field_errors[0] : non_field_errors);
          } else if (Object.keys(fieldErrors).length > 0) {
            const mapped = {};
            Object.entries(fieldErrors).forEach(([key, val]) => {
              mapped[key] = Array.isArray(val) ? val[0] : String(val);
            });
            setErrors(mapped);
          } else {
            setServerError('Registration failed. Please try again.');
          }
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
      navigate('/', { replace: true });
    } catch (err) {
      setServerError(err.response?.data?.google?.[0] || 'Google sign-up failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex">
      {/* ── Left: Luxury Image Panel (Desktop Only) ── */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#382135] items-center justify-center overflow-hidden">
        <img
          src="https://res.cloudinary.com/hnqsonlb/image/upload/v1787669836/aparna_aura/products/aura-p058/03.jpg"
          alt="Aparna Aura Temple Collection"
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#382135] via-[#382135]/60 to-transparent" />
        <div className="relative z-10 text-center px-12 max-w-md">
          <Sparkles size={40} className="text-[#D4AF37] mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-3" style={{ fontFamily: '"Playfair Display", serif' }}>
            Join the {APP_NAME} Family
          </h2>
          <p className="text-white/50 text-sm leading-relaxed mb-10">
            Create an account to track orders, save your favorites, and enjoy exclusive member privileges.
          </p>
          <div className="grid grid-cols-2 gap-4 text-left">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <p className="text-white text-sm font-semibold mb-1">Priority Access</p>
              <p className="text-white/40 text-xs">Early access to new collections.</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <p className="text-white text-sm font-semibold mb-1">Faster Checkout</p>
              <p className="text-white/40 text-xs">Save addresses for quick buys.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right: Register Form ── */}
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
            <h1 className="text-2xl font-bold text-[var(--color-brand)] mb-2">Create Your Account</h1>
            <p className="text-[var(--color-muted)] text-sm">
              Join {APP_NAME} and discover the world of fine jewellery
            </p>
          </div>

          {/* Card */}
          <div className="premium-card p-8">
            {serverError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-[12px] text-red-700 text-sm font-medium"
              >
                {serverError}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {/* Name Row */}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  name="first_name"
                  placeholder="Jane"
                  autoComplete="given-name"
                  icon={User}
                  value={formData.first_name}
                  onChange={handleChange}
                  error={errors.first_name}
                />
                <Input
                  label="Last Name"
                  name="last_name"
                  placeholder="Doe"
                  autoComplete="family-name"
                  icon={User}
                  value={formData.last_name}
                  onChange={handleChange}
                  error={errors.last_name}
                />
              </div>

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

              <div className="relative">
                <Input
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                  icon={Lock}
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3.5 top-[38px] text-[#8A8A8A] hover:text-[#382135] transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <div className="relative">
                <Input
                  label="Confirm Password"
                  name="confirm_password"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  icon={Lock}
                  value={formData.confirm_password}
                  onChange={handleChange}
                  error={errors.confirm_password}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(s => !s)}
                  className="absolute right-3.5 top-[38px] text-[#8A8A8A] hover:text-[#382135] transition-colors"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full mt-4"
              >
                {isSubmitting ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Create Account <ArrowRight size={18} className="ml-2" />
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
              text="signup_with"
            />
          </div>

          <p className="text-center text-sm text-[var(--color-muted)] mt-6">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-[var(--color-accent)] font-semibold hover:text-[var(--color-brand)] transition-colors"
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
