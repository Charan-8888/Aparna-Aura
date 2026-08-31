import React, { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, SlidersHorizontal, ChevronDown } from 'lucide-react';

const FilterSidebar = memo(({ isOpen, onClose, filters, onFilterChange, categories = [] }) => {
  const categoryList = Array.isArray(categories) ? categories : [];
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    price: true,
    sort: true,
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const priceRanges = [
    { label: 'Under ₹5,000', min: 0, max: 5000 },
    { label: '₹5,000 - ₹15,000', min: 5000, max: 15000 },
    { label: '₹15,000 - ₹30,000', min: 15000, max: 30000 },
    { label: '₹30,000 - ₹50,000', min: 30000, max: 50000 },
    { label: 'Above ₹50,000', min: 50000, max: Infinity },
  ];

  const sortOptions = [
    { label: 'Featured', value: 'featured' },
    { label: 'Price: Low to High', value: 'price-asc' },
    { label: 'Price: High to Low', value: 'price-desc' },
    { label: 'Newest First', value: 'newest' },
    { label: 'Rating', value: 'rating' },
  ];

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <button
          onClick={() => toggleSection('categories')}
          className="flex items-center justify-between w-full py-2 text-sm font-bold text-[#382135] uppercase tracking-wider"
        >
          Categories
          <ChevronDown
            size={16}
            className={`transition-transform duration-200 ${expandedSections.categories ? 'rotate-180' : ''}`}
          />
        </button>
        <AnimatePresence>
          {expandedSections.categories && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="space-y-2 pt-2">
                <label className="flex items-center gap-3 cursor-pointer group py-1">
                  <input
                    type="radio"
                    name="category"
                    checked={!filters?.category}
                    onChange={() => onFilterChange?.({ ...filters, category: '' })}
                    className="w-4 h-4 text-[#D4AF37] accent-[#D4AF37]"
                  />
                  <span className="text-sm text-gray-600 group-hover:text-[#382135] transition-colors">
                    All Categories
                  </span>
                </label>
                {categoryList.map((cat) => (
                  <label key={cat.slug} className="flex items-center gap-3 cursor-pointer group py-1">
                    <input
                      type="radio"
                      name="category"
                      checked={filters?.category === cat.slug}
                      onChange={() => onFilterChange?.({ ...filters, category: cat.slug })}
                      className="w-4 h-4 text-[#D4AF37] accent-[#D4AF37]"
                    />
                    <span className="text-sm text-gray-600 group-hover:text-[#382135] transition-colors">
                      {cat.name}
                    </span>
                    <span className="text-xs text-gray-400 ml-auto">({cat.productCount || 0})</span>
                  </label>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <hr className="border-gray-100" />

      {/* Price Range */}
      <div>
        <button
          onClick={() => toggleSection('price')}
          className="flex items-center justify-between w-full py-2 text-sm font-bold text-[#382135] uppercase tracking-wider"
        >
          Price Range
          <ChevronDown
            size={16}
            className={`transition-transform duration-200 ${expandedSections.price ? 'rotate-180' : ''}`}
          />
        </button>
        <AnimatePresence>
          {expandedSections.price && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="space-y-2 pt-2">
                <label className="flex items-center gap-3 cursor-pointer group py-1">
                  <input
                    type="radio"
                    name="priceRange"
                    checked={!filters?.priceRange}
                    onChange={() => onFilterChange?.({ ...filters, priceRange: null })}
                    className="w-4 h-4 accent-[#D4AF37]"
                  />
                  <span className="text-sm text-gray-600 group-hover:text-[#382135] transition-colors">
                    All Prices
                  </span>
                </label>
                {priceRanges.map((range, i) => (
                  <label key={i} className="flex items-center gap-3 cursor-pointer group py-1">
                    <input
                      type="radio"
                      name="priceRange"
                      checked={filters?.priceRange?.label === range.label}
                      onChange={() => onFilterChange?.({ ...filters, priceRange: range })}
                      className="w-4 h-4 accent-[#D4AF37]"
                    />
                    <span className="text-sm text-gray-600 group-hover:text-[#382135] transition-colors">
                      {range.label}
                    </span>
                  </label>
                ))}
              </div>

              {/* Price Slider */}
              <div className="mt-4 pt-4 border-t border-gray-50">
                <input
                  type="range"
                  min={0}
                  max={100000}
                  step={1000}
                  value={filters?.maxPrice || 100000}
                  onChange={(e) => onFilterChange?.({ ...filters, maxPrice: Number(e.target.value) })}
                  className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-[#D4AF37]"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-2">
                  <span>₹0</span>
                  <span className="font-medium text-[#382135]">
                    ₹{(filters?.maxPrice || 100000).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <hr className="border-gray-100" />

      {/* Sort */}
      <div>
        <button
          onClick={() => toggleSection('sort')}
          className="flex items-center justify-between w-full py-2 text-sm font-bold text-[#382135] uppercase tracking-wider"
        >
          Sort By
          <ChevronDown
            size={16}
            className={`transition-transform duration-200 ${expandedSections.sort ? 'rotate-180' : ''}`}
          />
        </button>
        <AnimatePresence>
          {expandedSections.sort && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="space-y-2 pt-2">
                {sortOptions.map((option) => (
                  <label key={option.value} className="flex items-center gap-3 cursor-pointer group py-1">
                    <input
                      type="radio"
                      name="sort"
                      checked={filters?.sort === option.value}
                      onChange={() => onFilterChange?.({ ...filters, sort: option.value })}
                      className="w-4 h-4 accent-[#D4AF37]"
                    />
                    <span className="text-sm text-gray-600 group-hover:text-[#382135] transition-colors">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Clear Filters */}
      <button
        onClick={() => onFilterChange?.({ category: '', priceRange: null, maxPrice: 100000, sort: 'featured' })}
        className="w-full py-3 text-xs font-bold uppercase tracking-[0.14em] text-[#6f6269] hover:text-[#301b2f] border border-[#ded1bd] rounded-full hover:border-[#c9a24b] hover:bg-[#fbf6ed] transition-all duration-200"
      >
        Clear All Filters
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 flex-shrink-0">
        <div className="sticky top-28 rounded-[22px] border border-[#d9c9ae]/60 bg-white/80 p-6 shadow-[0_18px_50px_rgba(48,27,47,0.08)] backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-6 pb-5 border-b border-[#e9dfcf]">
            <SlidersHorizontal size={18} className="text-[#382135]" />
            <h3 className="text-lg font-semibold text-[#301b2f] font-heading">Filters</h3>
          </div>
          <FilterContent />
        </div>
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="fixed top-0 left-0 bottom-0 w-80 bg-[#fbf8f2] z-50 shadow-2xl p-6 overflow-y-auto lg:hidden border-r border-[#d8c7aa]"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={18} className="text-[#382135]" />
                  <h3 className="text-lg font-bold text-[#382135]">Filters</h3>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              <FilterContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
});

FilterSidebar.displayName = 'FilterSidebar';

export default FilterSidebar;
