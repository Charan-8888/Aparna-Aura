import React, { useState, useRef, useEffect, memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, TrendingUp, Clock, ArrowRight, Sparkles, Camera } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { productService } from '../../services/productService';

const POPULAR_SEARCHES = [
  { label: 'Engagement Rings', slug: 'rings', emoji: '💍' },
  { label: 'Pearl Necklaces', slug: 'necklaces', emoji: '📿' },
  { label: 'Sapphire Earrings', slug: 'earrings', emoji: '✨' },
  { label: 'Bridal Collection', slug: 'bridal', emoji: '👰' },
  { label: 'Gold Bracelets', slug: 'bracelets', emoji: '⭐' },
];

const STORAGE_KEY = 'aa_recent_searches';

const getRecentSearches = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]').slice(0, 5);
  } catch { return []; }
};

const saveRecentSearch = (term) => {
  const recent = getRecentSearches().filter((s) => (s || '').toLowerCase() !== (term || '').toLowerCase());
  recent.unshift(term);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recent.slice(0, 5)));
};

const clearRecentSearches = () => localStorage.removeItem(STORAGE_KEY);

const SearchOverlay = memo(({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const debounceRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setRecentSearches(getRecentSearches());
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = 'unset';
      setQuery('');
      setResults([]);
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Live search with debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await productService.getProducts({ search: query, page_size: 5 });
        const items = res?.results || (Array.isArray(res) ? res : []);
        setResults(items.slice(0, 5));
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const handleSearch = useCallback((term) => {
    const searchTerm = term || query;
    if (!searchTerm.trim()) return;
    saveRecentSearch(searchTerm.trim());
    onClose();
    navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
  }, [query, onClose, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch(query);
  };

  const handleClearRecent = () => {
    clearRecentSearches();
    setRecentSearches([]);
  };

  const formatPrice = (p) => `₹${Number(p || 0).toLocaleString('en-IN')}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-start justify-center pt-20 md:pt-24"
          style={{ background: 'rgba(250, 248, 245, 0.97)', backdropFilter: 'blur(20px)' }}
        >
          <div className="absolute inset-0" onClick={onClose} />
          
          <div className="w-full max-w-3xl px-4 relative z-10">
            {/* Close button */}
            <div className="absolute -top-14 right-4">
              <button
                onClick={onClose}
                className="p-3 bg-white rounded-full shadow-sm hover:shadow-md text-[#6F6F6F] hover:text-[#382135] transition-all duration-300 hover:rotate-90"
              >
                <X size={20} />
              </button>
            </div>

            {/* Search Input */}
            <motion.form
              onSubmit={handleSubmit}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="bg-white rounded-2xl shadow-[0_8px_40px_rgb(0,0,0,0.08)] border border-[#E6E1D8] p-3 flex items-center relative overflow-hidden"
            >
              <Search size={26} className="text-[#C9A227] ml-3 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for rings, necklaces, earrings..."
                className="w-full border-none bg-transparent pl-4 pr-12 py-3 text-lg md:text-xl font-heading text-[#382135] placeholder:text-[#8A8A8A] outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-16 top-1/2 -translate-y-1/2 p-2 text-[#8A8A8A] hover:text-[#382135] transition-colors"
                >
                  <X size={18} />
                </button>
              )}
              <button
                type="submit"
                className="mr-1 px-4 py-2.5 bg-[#382135] text-white rounded-xl hover:bg-[#4D2C48] transition-colors text-sm font-semibold flex-shrink-0"
              >
                Search
              </button>
            </motion.form>

            {/* Live Search Results */}
            <AnimatePresence mode="wait">
              {query.trim().length >= 2 && (
                <motion.div
                  key="results"
                  initial={{ y: 16, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 8, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 bg-white rounded-2xl shadow-lg border border-[#E6E1D8] overflow-hidden"
                >
                  {searching ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="w-6 h-6 border-2 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin" />
                    </div>
                  ) : results.length > 0 ? (
                    <>
                      <div className="divide-y divide-gray-50">
                        {results.map((product) => (
                          <Link
                            key={product.id}
                            to={`/product/${product.slug}`}
                            onClick={() => { saveRecentSearch(query); onClose(); }}
                            className="flex items-center gap-4 p-4 hover:bg-[#FAF8F5] transition-colors group"
                          >
                            <div className="w-14 h-14 rounded-xl bg-[#F3EFE8] overflow-hidden flex-shrink-0">
                              <img
                                src={typeof product.images?.[0] === 'object' ? product.images?.[0]?.image : (product.images?.[0] || product.image)}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-[#D4AF37] font-medium uppercase tracking-wider">
                                {typeof product.category === 'object' ? product.category?.name : product.category}
                              </p>
                              <p className="text-sm font-semibold text-[#382135] truncate group-hover:text-[#D4AF37] transition-colors">
                                {product.name}
                              </p>
                            </div>
                            <span className="text-sm font-bold text-[#382135] flex-shrink-0">{formatPrice(product.price)}</span>
                          </Link>
                        ))}
                      </div>
                      <button
                        onClick={() => handleSearch(query)}
                        className="w-full py-3.5 text-sm font-semibold text-[#D4AF37] hover:text-[#382135] hover:bg-[#FAF8F5] transition-colors flex items-center justify-center gap-2 border-t border-gray-50"
                      >
                        View all results for "{query}" <ArrowRight size={16} />
                      </button>
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-[#6F6F6F] text-sm">No results found for "<span className="font-bold text-[#382135]">{query}</span>"</p>
                      <p className="text-[#8A8A8A] text-xs mt-2">Try a different search term</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Suggestions when no query */}
            {!query && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="mt-6 grid md:grid-cols-2 gap-6"
              >
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E6E1D8]">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="flex items-center gap-2 text-xs font-bold text-[#6F6F6F] uppercase tracking-wider">
                        <Clock size={14} />
                        Recent Searches
                      </h3>
                      <button
                        onClick={handleClearRecent}
                        className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((search) => (
                        <button
                          key={search}
                          onClick={() => { setQuery(search); handleSearch(search); }}
                          className="px-4 py-2 bg-[#F3EFE8] text-[#2C2C2C] text-sm rounded-xl hover:bg-[#382135] hover:text-white transition-all duration-300"
                        >
                          {search}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Trending Searches */}
                <div className={`bg-white rounded-2xl p-6 shadow-sm border border-[#E6E1D8] ${recentSearches.length === 0 ? 'md:col-span-2' : ''}`}>
                  <h3 className="flex items-center gap-2 text-xs font-bold text-[#6F6F6F] uppercase tracking-wider mb-4">
                    <TrendingUp size={14} />
                    Trending Now
                  </h3>
                  <div className="space-y-1">
                    {POPULAR_SEARCHES.map((item, i) => (
                      <Link
                        key={item.slug}
                        to={`/categories/${item.slug}`}
                        onClick={onClose}
                        className="flex items-center justify-between py-2.5 px-3 rounded-xl text-[#6F6F6F] hover:bg-[#F3EFE8] hover:text-[#382135] transition-all duration-300 group"
                      >
                        <span className="flex items-center gap-3 font-medium">
                          <span className="text-base">{item.emoji}</span>
                          {item.label}
                        </span>
                        <ArrowRight size={14} className="text-[#D4AF37] opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1" />
                      </Link>
                    ))}
                  </div>
                </div>

                {/* AI Search Teaser */}
                <div className="md:col-span-2 bg-gradient-to-r from-[#382135] to-[#4D2C48] rounded-2xl p-6 text-white">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/20 flex items-center justify-center flex-shrink-0">
                      <Sparkles size={20} className="text-[#D4AF37]" />
                    </div>
                    <div>
                      <h4 className="font-bold mb-1">Smart Search</h4>
                      <p className="text-white/60 text-sm leading-relaxed">
                        Try descriptive searches like "gold ring under 10000" or "bridal necklace set" — our search understands natural language and finds the best matches.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

SearchOverlay.displayName = 'SearchOverlay';

export default SearchOverlay;
