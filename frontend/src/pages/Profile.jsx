import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, ShoppingBag, Heart, ChevronRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Loader from '../components/Loader/Loader';
import ErrorState from '../components/ErrorState/ErrorState';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import { APP_NAME } from '../constants/app';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const Profile = () => {
  const { currentUser, loading, logout } = useAuth();

  if (loading) return <Loader fullScreen />;

  if (!currentUser) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ErrorState title="Unable to load profile" message="Please try signing in again." />
      </div>
    );
  }

  const fullName =
    [currentUser.first_name, currentUser.last_name].filter(Boolean).join(' ') ||
    currentUser.username ||
    'Member';

  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const joinedDate = currentUser.date_joined
    ? new Date(currentUser.date_joined).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '—';

  const quickLinks = [
    { label: 'My Orders', path: '/orders', icon: ShoppingBag, desc: 'View your order history' },
    { label: 'Wishlist', path: '/wishlist', icon: Heart, desc: 'Items you love' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <Breadcrumb items={[{ label: 'My Profile', path: '/profile' }]} />

      <motion.div {...fadeUp} className="mt-6">
        {/* Profile Hero Card */}
        <div className="bg-gradient-to-br from-[#382135] to-[#4d3049] rounded-2xl p-8 md:p-10 text-white mb-8 relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/5 rounded-full" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-[#D4AF37]/10 rounded-full" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-[#D4AF37] flex items-center justify-center text-[#382135] font-bold text-2xl flex-shrink-0 shadow-lg">
              {initials}
            </div>

            <div className="flex-1">
              <p className="text-[#D4AF37] text-xs uppercase tracking-[0.2em] font-medium mb-1">
                {APP_NAME} Member
              </p>
              <h1 className="text-2xl md:text-3xl font-bold mb-1">{fullName}</h1>
              <p className="text-white/60 text-sm">{currentUser.email}</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Account Details */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-[#382135] mb-5 flex items-center gap-2">
              <User size={18} className="text-[#D4AF37]" />
              Account Details
            </h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Full Name</dt>
                <dd className="text-sm font-medium text-[#382135]">{fullName}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Mail size={12} /> Email
                </dt>
                <dd className="text-sm font-medium text-[#382135]">{currentUser.email}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Calendar size={12} /> Member Since
                </dt>
                <dd className="text-sm font-medium text-[#382135]">{joinedDate}</dd>
              </div>
            </dl>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-[#382135] mb-5">Quick Links</h2>
            <div className="space-y-3">
              {quickLinks.map(({ label, path, icon: Icon, desc }) => (
                <Link
                  key={path}
                  to={path}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-[#FAF8F6] group transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-[#FAF8F6] group-hover:bg-[#D4AF37]/10 flex items-center justify-center transition-colors">
                    <Icon size={18} className="text-[#D4AF37]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#382135]">{label}</p>
                    <p className="text-xs text-gray-400">{desc}</p>
                  </div>
                  <ChevronRight size={16} className="text-gray-300 group-hover:text-[#D4AF37] transition-colors" />
                </Link>
              ))}

              {/* Logout Button */}
              <button
                onClick={logout}
                className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-red-50 group transition-colors text-left mt-2"
              >
                <div className="w-10 h-10 rounded-full bg-red-50 group-hover:bg-red-100 flex items-center justify-center transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-red-500"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-600">Sign Out</p>
                  <p className="text-xs text-gray-400">Log out of your account</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
