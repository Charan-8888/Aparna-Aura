import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, MessageCircle } from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import { Link } from 'react-router-dom';

const FAQS = [
  {
    category: "Orders & Shipping",
    questions: [
      {
        q: "Is shipping really free and insured?",
        a: "Yes. Every Aparna Aura piece is shipped complimentary via secure, fully insured couriers. A signature is strictly required upon delivery to ensure your piece reaches you safely."
      },
      {
        q: "How long will it take to receive my order?",
        a: "In-stock items are dispatched within 24-48 hours. Depending on your location, delivery takes between 3-5 business days. Bespoke or made-to-order pieces require 3-4 weeks for crafting."
      }
    ]
  },
  {
    category: "Returns & Exchanges",
    questions: [
      {
        q: "What is your return policy?",
        a: "We offer a complimentary 30-day return policy. If you are not entirely satisfied with your purchase, you may return it in its original, unworn condition with all accompanying certificates and packaging for a full refund."
      },
      {
        q: "How do I initiate a return?",
        a: "Simply log into your account, navigate to your order history, and select 'Request Return'. Our concierge team will email you a secure, prepaid shipping label and instructions."
      }
    ]
  },
  {
    category: "Product & Craftsmanship",
    questions: [
      {
        q: "Are your diamonds conflict-free?",
        a: "Absolutely. We strictly adhere to the Kimberley Process. All our diamonds and gemstones are ethically sourced from certified suppliers who share our commitment to human rights and environmental responsibility."
      },
      {
        q: "Does my jewellery come with a certificate?",
        a: "Yes. Every piece of jewellery comes with a physical Certificate of Authenticity and BIS Hallmark verification, presented in our signature wooden box."
      }
    ]
  }
];

const AccordionItem = ({ q, a }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-6 text-left focus:outline-none group"
      >
        <span className="text-base font-bold text-[#382135] group-hover:text-[#D4AF37] transition-colors pr-8">
          {q}
        </span>
        <ChevronDown 
          size={20} 
          className={`text-gray-400 transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-gray-600 leading-relaxed text-sm">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FAQ = () => {
  return (
    <div className="bg-[#FAF8F5] min-h-screen pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Breadcrumb items={[{ label: 'Frequently Asked Questions', path: '/faq' }]} />

        <div className="text-center mt-12 mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-[#382135] mb-4" style={{ fontFamily: '"Playfair Display", serif' }}>
            How May We Help You?
          </h1>
          <p className="text-gray-500 max-w-lg mx-auto">
            Find answers to common questions about our craftsmanship, delivery, and services.
          </p>
        </div>

        <div className="bg-white shadow-xl shadow-gray-200/40 rounded-none border border-[#E6E1D8] p-8 md:p-12 mb-16">
          {FAQS.map((section, idx) => (
            <div key={idx} className="mb-12 last:mb-0">
              <h2 className="text-sm font-bold text-[#D4AF37] uppercase tracking-widest mb-4">
                {section.category}
              </h2>
              <div className="border-t border-gray-200">
                {section.questions.map((item, i) => (
                  <AccordionItem key={i} q={item.q} a={item.a} />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <div className="w-16 h-16 bg-[#382135] text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#382135]/20">
            <MessageCircle size={24} />
          </div>
          <h3 className="text-2xl font-bold text-[#382135] mb-2" style={{ fontFamily: '"Playfair Display", serif' }}>
            Still have questions?
          </h3>
          <p className="text-gray-500 mb-6">Our dedicated concierge team is at your service.</p>
          <Link to="/contact" className="inline-block border-2 border-[#382135] text-[#382135] px-8 py-3 font-semibold hover:bg-[#382135] hover:text-white transition-colors uppercase tracking-wider text-xs">
            Contact Concierge
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
