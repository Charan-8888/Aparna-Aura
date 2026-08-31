import React from 'react';
import { motion } from 'framer-motion';
import { APP_NAME } from '../constants/app';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';

const About = () => {
  return (
    <div className="bg-white min-h-screen pb-24">
      {/* Hero Section */}
      <div className="relative bg-[#382135] pt-24 pb-32 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1599643478524-fb66f7ca0f89?w=1600&h=600&fit=crop" 
            alt="Jewellery Crafting" 
            className="w-full h-full object-cover mix-blend-overlay"
          />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <p className="text-[#D4AF37] font-bold tracking-[0.2em] uppercase text-xs mb-4">Our Heritage</p>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight" style={{ fontFamily: '"Playfair Display", serif' }}>
              The Story of<br/>{APP_NAME}
            </h1>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white p-8 md:p-16 shadow-2xl border border-gray-100"
        >
          <div className="prose prose-lg mx-auto text-gray-600">
            <p className="text-2xl text-[#382135] leading-relaxed mb-10 text-center" style={{ fontFamily: '"Playfair Display", serif' }}>
              "True luxury is not just what you wear, but the story it tells and the generations it spans."
            </p>

            <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
              <div>
                <h2 className="text-2xl font-bold text-[#382135] mb-4" style={{ fontFamily: '"Playfair Display", serif' }}>Our Legacy</h2>
                <p className="mb-4">
                  Born from a passion for preserving ancient artisanal techniques, {APP_NAME} was founded with a singular vision: to create heirloom-quality pieces that bridge the gap between historical grandeur and contemporary elegance.
                </p>
                <p>
                  Every piece in our collection is a testament to the skill of our master craftsmen, many of whom come from lineages of jewellers dating back centuries.
                </p>
              </div>
              <div className="aspect-square bg-gray-50 p-2">
                <img 
                  src="https://images.unsplash.com/photo-1584302179602-e4c3d3fd629d?w=600&h=600&fit=crop" 
                  alt="Craftsmanship" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center mb-16 flex-col-reverse md:flex-row-reverse">
              <div>
                <h2 className="text-2xl font-bold text-[#382135] mb-4" style={{ fontFamily: '"Playfair Display", serif' }}>Uncompromising Quality</h2>
                <p className="mb-4">
                  We believe that ethical sourcing and uncompromised quality go hand in hand. All our diamonds are conflict-free, and our gold is 100% recycled and BIS Hallmarked.
                </p>
                <p>
                  It takes over 40 hours of meticulous hand-crafting, polishing, and setting to bring a single {APP_NAME} design to life, ensuring it meets our rigorous standards before it ever reaches you.
                </p>
              </div>
              <div className="aspect-[4/3] md:aspect-square bg-gray-50 p-2">
                <img 
                  src="https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&h=600&fit=crop" 
                  alt="Quality Diamonds" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="text-center bg-[#FAF8F5] p-10 border border-[#E6E1D8]">
              <h2 className="text-2xl font-bold text-[#382135] mb-4" style={{ fontFamily: '"Playfair Display", serif' }}>Our Promise</h2>
              <p className="max-w-2xl mx-auto">
                When you choose {APP_NAME}, you aren't just purchasing jewellery. You are investing in a piece of art, backed by our lifetime authenticity guarantee and complimentary maintenance, ensuring your piece remains as breathtaking as the day you acquired it.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default About;
