import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Droplets, Archive, ShieldAlert } from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';

const Care = () => {
  return (
    <div className="bg-[#FAF8F5] min-h-screen pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Breadcrumb items={[{ label: 'Jewellery Care', path: '/care' }]} />

        <div className="text-center mt-12 mb-16">
          <p className="text-[#D4AF37] font-bold tracking-[0.2em] uppercase text-xs mb-4">Preserving Perfection</p>
          <h1 className="text-4xl md:text-5xl font-bold text-[#382135] mb-4" style={{ fontFamily: '"Playfair Display", serif' }}>
            Jewellery Care Guide
          </h1>
          <p className="text-gray-500 max-w-lg mx-auto leading-relaxed">
            Aparna Aura pieces are crafted to last generations. With proper care and attention, your jewellery will maintain its magnificent brilliance.
          </p>
        </div>

        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 md:p-10 border border-[#E6E1D8] shadow-sm flex flex-col md:flex-row gap-8 items-start">
            <div className="w-14 h-14 bg-[#FAF8F5] rounded-full flex items-center justify-center flex-shrink-0">
              <Sparkles size={24} className="text-[#D4AF37]" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#382135] mb-3" style={{ fontFamily: '"Playfair Display", serif' }}>Daily Wear & Cleaning</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                To maintain the shine of your gold and diamonds, gently clean them using a soft, lint-free cloth. For a deeper clean, soak the piece in warm water with a drop of mild, non-detergent soap. Use a very soft brush to carefully dislodge dirt around the settings.
              </p>
              <ul className="list-disc pl-4 space-y-2 text-xs text-gray-500">
                <li>Never use harsh chemicals, bleach, or abrasive cleaners.</li>
                <li>Rinse thoroughly and pat dry immediately.</li>
              </ul>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-8 md:p-10 border border-[#E6E1D8] shadow-sm flex flex-col md:flex-row gap-8 items-start">
            <div className="w-14 h-14 bg-[#FAF8F5] rounded-full flex items-center justify-center flex-shrink-0">
              <Droplets size={24} className="text-[#D4AF37]" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#382135] mb-3" style={{ fontFamily: '"Playfair Display", serif' }}>When to Remove</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Your jewellery should be the last thing you put on in the morning and the first thing you take off at night. Exposure to certain environments can compromise the integrity of the metals and stones.
              </p>
              <ul className="list-disc pl-4 space-y-2 text-xs text-gray-500">
                <li>Remove before swimming (chlorine can permanently damage gold).</li>
                <li>Remove before applying perfumes, lotions, or hairspray.</li>
                <li>Remove before exercising or engaging in heavy physical work.</li>
              </ul>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-8 md:p-10 border border-[#E6E1D8] shadow-sm flex flex-col md:flex-row gap-8 items-start">
            <div className="w-14 h-14 bg-[#FAF8F5] rounded-full flex items-center justify-center flex-shrink-0">
              <Archive size={24} className="text-[#D4AF37]" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#382135] mb-3" style={{ fontFamily: '"Playfair Display", serif' }}>Proper Storage</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Proper storage is crucial to prevent scratching and tangling. Diamonds are the hardest substance on earth and can scratch other gemstones and metals if allowed to rub against them.
              </p>
              <ul className="list-disc pl-4 space-y-2 text-xs text-gray-500">
                <li>Store pieces individually in their original Aparna Aura padded box or pouch.</li>
                <li>Keep chains fastened to prevent tangling.</li>
                <li>Store in a cool, dry place away from direct sunlight and humidity.</li>
              </ul>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white p-8 md:p-10 border border-[#E6E1D8] shadow-sm flex flex-col md:flex-row gap-8 items-start">
            <div className="w-14 h-14 bg-[#FAF8F5] rounded-full flex items-center justify-center flex-shrink-0">
              <ShieldAlert size={24} className="text-[#D4AF37]" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#382135] mb-3" style={{ fontFamily: '"Playfair Display", serif' }}>Professional Maintenance & Warranty</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                We recommend having your jewellery professionally inspected and cleaned at least once a year. Our master jewelers will check for loose stones and wear on the prongs.
              </p>
              <p className="text-xs font-semibold text-[#382135] uppercase tracking-wider">
                Complimentary In-Boutique Cleaning
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Bring your Aparna Aura pieces to our flagship boutique for a complimentary professional ultrasonic cleaning and prong inspection at any time.
              </p>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default Care;
