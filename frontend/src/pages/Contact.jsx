import React, { useState } from 'react';
import { MapPin, Phone, Mail, CheckCircle, Send, MessageCircle, ShoppingBag, ExternalLink } from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import apiClient from '../api/apiClient';
import { SOCIAL_LINKS, getWhatsAppUrl } from '../constants/socialLinks';

const InstagramIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const Contact = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const response = await apiClient.post('/auth/contact/', {
        name: `${formData.firstName} ${formData.lastName}`.strip ? `${formData.firstName} ${formData.lastName}`.trim() : `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
      });

      setSuccessMsg(response.data?.message || 'Thank you for reaching out. Our concierge will get back to you shortly.');
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        subject: 'General Inquiry',
        message: '',
      });
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to submit inquiry. Please try again or email us directly.');
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = () => {
    setFormData((prev) => ({ ...prev, subject: 'Book an Appointment' }));
    const formElement = document.getElementById('contact-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-[#FFFDF9] min-h-screen pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Breadcrumb items={[{ label: 'Contact Concierge', path: '/contact' }]} />

        <div className="text-center mt-10 mb-14">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#D4AF37]">Personal Assistance</span>
          <h1 className="text-4xl md:text-5xl font-bold text-[#301B2F] mt-2 mb-4" style={{ fontFamily: '"Playfair Display", serif' }}>
            Contact Concierge
          </h1>
          <p className="text-gray-600 max-w-lg mx-auto leading-relaxed text-sm md:text-base">
            Our dedicated luxury concierge team is at your absolute disposal for styling advice, bespoke requests, and assistance with your orders.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          
          {/* Contact Details & Social Connect */}
          <div>
            <h2 className="text-2xl font-bold text-[#301B2F] mb-8" style={{ fontFamily: '"Playfair Display", serif' }}>
              Get In Touch
            </h2>
            
            <div className="space-y-8 mb-12">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#FAF8F5] rounded-full flex items-center justify-center flex-shrink-0 border border-[#D4AF37]/30">
                  <Phone size={20} className="text-[#D4AF37]" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest mb-1">Phone & WhatsApp</h3>
                  <a
                    href={getWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#301B2F] font-semibold text-lg hover:text-[#D4AF37] transition-colors"
                  >
                    {SOCIAL_LINKS.whatsappFormatted}
                  </a>
                  <p className="text-xs text-gray-500 mt-1">Mon-Sat: 10:00 AM - 7:00 PM IST</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#FAF8F5] rounded-full flex items-center justify-center flex-shrink-0 border border-[#D4AF37]/30">
                  <Mail size={20} className="text-[#D4AF37]" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest mb-1">Email</h3>
                  <a href="mailto:concierge@aparnaaura.com" className="text-[#301B2F] font-medium text-lg hover:text-[#D4AF37] transition-colors">
                    concierge@aparnaaura.com
                  </a>
                  <p className="text-xs text-gray-500 mt-1">We aim to respond within 24 hours.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#FAF8F5] rounded-full flex items-center justify-center flex-shrink-0 border border-[#D4AF37]/30">
                  <MapPin size={20} className="text-[#D4AF37]" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest mb-1">Flagship Boutique</h3>
                  <p className="text-[#301B2F] font-medium leading-relaxed">
                    Road No. 36, Jubilee Hills,<br/>
                    Hyderabad, Telangana, 500033, India
                  </p>
                </div>
              </div>
            </div>

            {/* Connect With Aparna Aura Section */}
            <div className="border-t border-[#E6E1D8] pt-10">
              <h3 className="text-xl font-bold text-[#301B2F] mb-6" style={{ fontFamily: '"Playfair Display", serif' }}>
                Connect With Aparna Aura
              </h3>
              
              <div className="space-y-4">
                {/* WhatsApp */}
                <a
                  href={getWhatsAppUrl('Questions about a piece? Speak with us directly.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Chat with Aparna Aura on WhatsApp"
                  className="group flex items-start gap-4 p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 hover:border-emerald-500/80 hover:shadow-md transition-all"
                >
                  <div className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <MessageCircle size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                        Chat on WhatsApp
                      </h4>
                      <ExternalLink size={14} className="text-gray-400 group-hover:text-emerald-600 transition-colors" />
                    </div>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                      Questions about a piece? Speak with us directly.
                    </p>
                  </div>
                </a>

                {/* Instagram */}
                <a
                  href={SOCIAL_LINKS.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Visit Aparna Aura on Instagram"
                  className="group flex items-start gap-4 p-5 rounded-2xl bg-purple-50/60 border border-purple-200/80 hover:border-purple-500/80 hover:shadow-md transition-all"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <InstagramIcon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-gray-900 group-hover:text-purple-700 transition-colors">
                        Follow on Instagram
                      </h4>
                      <ExternalLink size={14} className="text-gray-400 group-hover:text-purple-600 transition-colors" />
                    </div>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                      Discover new arrivals, styling inspiration and collection updates.
                    </p>
                  </div>
                </a>

                {/* Meesho */}
                <a
                  href={SOCIAL_LINKS.meesho}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Shop Aparna Aura on Meesho"
                  className="group flex items-start gap-4 p-5 rounded-2xl bg-amber-50/60 border border-amber-200/80 hover:border-amber-500/80 hover:shadow-md transition-all"
                >
                  <div className="w-10 h-10 rounded-full bg-[linear-gradient(135deg,#eecf87,#b58334)] text-[#190817] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <ShoppingBag size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-gray-900 group-hover:text-amber-800 transition-colors">
                        Shop on Meesho
                      </h4>
                      <ExternalLink size={14} className="text-gray-400 group-hover:text-amber-700 transition-colors" />
                    </div>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                      Explore available Aparna Aura pieces on Meesho.
                    </p>
                  </div>
                </a>
              </div>
            </div>

            <div className="mt-8 p-6 bg-[#FAF8F5] border border-[#E6E1D8] rounded-2xl">
              <h3 className="text-sm font-bold text-[#301B2F] uppercase tracking-widest mb-2">Book a Private Viewing</h3>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                Experience our collection in person. Private viewings are available by appointment at our flagship boutique.
              </p>
              <button
                onClick={handleBookAppointment}
                className="border-b-2 border-[#301B2F] text-[#301B2F] font-bold text-xs uppercase tracking-wider pb-1 hover:text-[#D4AF37] hover:border-[#D4AF37] transition-colors"
              >
                Request Appointment →
              </button>
            </div>
          </div>

          {/* Contact Form */}
          <div id="contact-form" className="bg-white p-8 md:p-10 border border-gray-200/80 rounded-2xl shadow-xl">
            <h2 className="text-2xl font-bold text-[#301B2F] mb-2" style={{ fontFamily: '"Playfair Display", serif' }}>
              Personal Concierge Form
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Need help selecting the perfect piece? Our specialists are here to assist you.
            </p>

            {successMsg ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-emerald-800 mb-1">Inquiry Submitted</h3>
                <p className="text-sm text-emerald-700">{successMsg}</p>
                <button
                  onClick={() => setSuccessMsg('')}
                  className="mt-5 px-6 py-2 bg-emerald-700 text-white rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-emerald-800 transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form className="space-y-5" onSubmit={handleSubmit}>
                {errorMsg && (
                  <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
                    {errorMsg}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">First Name *</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full bg-[#FAF8F5] border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#D4AF37] transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">Last Name *</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full bg-[#FAF8F5] border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#D4AF37] transition-colors"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full bg-[#FAF8F5] border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#D4AF37] transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91"
                      className="w-full bg-[#FAF8F5] border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#D4AF37] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">Subject</label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full bg-[#FAF8F5] border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#D4AF37] transition-colors text-gray-700"
                  >
                    <option>General Inquiry</option>
                    <option>Book an Appointment</option>
                    <option>Order Assistance</option>
                    <option>Bespoke Design</option>
                    <option>Repairs & Care</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">Message *</label>
                  <textarea
                    name="message"
                    rows="4"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="How may our concierge team assist you?"
                    className="w-full bg-[#FAF8F5] border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#D4AF37] transition-colors resize-none"
                    required
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#301B2F] text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-[#20121f] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#301B2F]/20 disabled:opacity-60"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send size={15} /> Submit Inquiry
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Contact;
