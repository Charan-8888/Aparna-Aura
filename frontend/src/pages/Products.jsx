import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, X, Package, ChevronDown } from 'lucide-react';
import ProductCard from '../components/ProductCard/ProductCard';
import FilterSidebar from '../components/FilterSidebar/FilterSidebar';
import Pagination from '../components/Pagination/Pagination';
import SkeletonLoader from '../components/SkeletonLoader/SkeletonLoader';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import EmptyState from '../components/EmptyState/EmptyState';
import ErrorState from '../components/ErrorState/ErrorState';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { APP_NAME } from '../constants/app';

const ITEMS_PER_PAGE = 12; 

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    min_price: searchParams.get('min_price') || null,
    max_price: searchParams.get('max_price') || 100000,
    ordering: searchParams.get('ordering') || 'featured',
    search: searchParams.get('search') || '',
    page: parseInt(searchParams.get('page') || '1', 10),
    page_size: ITEMS_PER_PAGE,
  });

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(filters.search);

  const { products, pagination, loading, error, retry } = useProducts(filters);
  const { categories } = useCategories();
  const categoryList = Array.isArray(categories) ? categories : [];

  const totalPages = Math.ceil((pagination.count || 0) / ITEMS_PER_PAGE);

  // If the total pages shrink due to filter change and current page is out of bounds, reset to page 1
  useEffect(() => {
    if (totalPages > 0 && filters.page > totalPages) {
      setFilters(prev => ({ ...prev, page: 1 }));
    }
  }, [totalPages, filters.page]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.category) params.set('category', filters.category);
    if (filters.min_price) params.set('min_price', filters.min_price);
    if (filters.max_price < 100000) params.set('max_price', filters.max_price);
    if (filters.ordering && filters.ordering !== 'featured') params.set('ordering', filters.ordering);
    if (filters.search) params.set('search', filters.search);
    if (filters.page > 1) params.set('page', filters.page);
    
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, search: searchInput, page: 1 }));
  };

  const clearSearch = () => {
    setSearchInput('');
    setFilters(prev => ({ ...prev, search: '', page: 1 }));
  };

  const handleFilterChange = (newSidebarFilters) => {
    setFilters(prev => ({
      ...prev,
      category: newSidebarFilters.category || '',
      max_price: newSidebarFilters.maxPrice || 100000,
      ordering: newSidebarFilters.sort || 'featured',
      page: 1, 
    }));
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearAllFilters = () => {
    setSearchInput('');
    setFilters({
      category: '',
      min_price: null,
      max_price: 100000,
      ordering: 'featured',
      search: '',
      page: 1,
      page_size: ITEMS_PER_PAGE,
    });
  };

  const sidebarFilters = {
    category: filters.category,
    maxPrice: filters.max_price,
    sort: filters.ordering,
  };

  const activeFilterCount = [
    filters.category,
    filters.max_price < 100000,
    filters.ordering !== 'featured',
  ].filter(Boolean).length;


  return (
    <div className="luxury-page min-h-screen pb-24">
      {/* Redesigned Luxury Shop Hero Section */}
      <div className="relative isolate overflow-hidden bg-[#13050f] pt-28 pb-16 lg:pb-24 border-b border-[#d8b979]/20">
        {/* Background Image: Provided Girl Banner blending seamlessly from right to left */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/shop-hero-luxury-banner.png"
            alt="Aparna Aura Jewellery Model"
            className="w-full h-full object-cover object-right pointer-events-none opacity-90 lg:opacity-100"
          />
          {/* Scrim Overlay: Fades the left edge into rich plum background so text and search bar are perfectly readable */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#13050f] via-[#13050f]/92 sm:via-[#13050f]/85 to-transparent pointer-events-none lg:w-[68%]" />
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#13050f] via-[#13050f]/40 to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#13050f]/70 to-transparent pointer-events-none" />
        </div>

        {/* Ambient Gold Glow */}
        <div className="absolute top-1/3 left-10 w-96 h-96 bg-[#d8b979]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Hero Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-8 lg:gap-12">
            
            {/* Left Side: ~58% Width on Desktop (lg:col-span-7) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65 }}
              className="lg:col-span-7 text-left max-w-2xl"
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#d8b979]/15 border border-[#d8b979]/35 mb-5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#e8c374] animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-[0.24em] text-[#eed498]">
                  Fine Jewellery, Considered
                </span>
              </div>

              {/* Title */}
              <h1
                className="text-4xl sm:text-5xl lg:text-6xl font-medium text-white tracking-tight leading-[1.08] mb-4"
                style={{ fontFamily: '"Playfair Display", serif' }}
              >
                {filters.category ? categories?.find(c => c.slug === filters.category)?.name || 'The Collection' : 'The Signature Collection'}
              </h1>

              {/* Description */}
              <p className="text-white/80 text-base sm:text-lg leading-relaxed mb-8 max-w-xl">
                Discover our exquisite range of handcrafted jewellery. Search or filter by category & price to find your signature piece.
              </p>

              {/* Single Clean Rounded Premium Search Bar */}
              <form onSubmit={handleSearch} className="w-full max-w-xl">
                <div className="relative flex items-center p-1.5 bg-[#fcfaf7] border border-[#e5c78a]/50 rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.5)] focus-within:border-[#d4af37] focus-within:ring-2 focus-within:ring-[#d4af37]/35 transition-all">
                  <div className="pl-4 text-[#75446e]">
                    <Search size={20} strokeWidth={2.2} />
                  </div>
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search rings, necklaces, bangles, bridal sets..."
                    className="w-full bg-transparent px-3.5 py-2.5 text-[#250d20] placeholder:text-[#250d20]/50 text-sm md:text-base font-medium focus:outline-none"
                  />
                  {searchInput && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="p-2 text-[#75446e]/60 hover:text-[#250d20] transition-colors mr-1"
                      aria-label="Clear search"
                    >
                      <X size={18} />
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex-shrink-0 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[linear-gradient(135deg,#eecf87,#b58334)] text-[#190817] font-bold text-xs uppercase tracking-wider shadow-md hover:brightness-110 active:scale-95 transition-all"
                  >
                    <span>Search</span>
                    <Search size={14} strokeWidth={2.5} />
                  </button>
                </div>
              </form>
            </motion.div>

            {/* Right Side Spacer / Visual balance for Desktop (lg:col-span-5) */}
            <div className="hidden lg:block lg:col-span-5 h-[340px] pointer-events-none" />

          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 mt-8">
        <Breadcrumb items={[{ label: 'Shop', path: '/products' }]} />
        
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between py-7 mb-10 border-b border-[#e7dfd3] gap-4">
          <p className="text-sm font-medium text-gray-500">
            {!loading && !error ? `Showing ${products.length} of ${pagination.count} results` : 'Loading...'}
          </p>

          <div className="flex items-center gap-4 w-full sm:w-auto">
            {/* Sort Dropdown - Desktop */}
            <div className="relative hidden lg:block group">
              <select
                value={filters.ordering}
                onChange={(e) => setFilters(prev => ({ ...prev, ordering: e.target.value, page: 1 }))}
                className="appearance-none bg-transparent pr-8 pl-2 py-2 text-sm font-bold text-[#382135] focus:outline-none cursor-pointer border-none uppercase tracking-wider"
              >
                <option value="featured">Featured</option>
                <option value="price">Price: Low to High</option>
                <option value="-price">Price: High to Low</option>
                <option value="-created_at">Newest First</option>
                <option value="-rating">Highest Rated</option>
              </select>
              <ChevronDown size={14} className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-[#382135] group-hover:text-[#D4AF37] transition-colors" />
            </div>

            {/* Mobile Filter Button */}
            <button
              onClick={() => setIsFilterOpen(true)}
              className="lg:hidden flex-1 flex items-center justify-center gap-2 border border-gray-200 rounded-full px-6 py-2.5 text-sm font-bold text-[#382135] hover:border-[#D4AF37] transition-colors"
            >
              <SlidersHorizontal size={16} />
              Refine
              {activeFilterCount > 0 && (
                <span className="bg-[#D4AF37] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-1">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-28">
              <FilterSidebar
                isOpen={true} // Always open on desktop
                onClose={() => {}}
                filters={sidebarFilters}
                onFilterChange={handleFilterChange}
                categories={categories} 
              />
            </div>
          </div>

          {/* Mobile Filter Sidebar Drawer */}
          <div className="lg:hidden">
            <FilterSidebar
              isOpen={isFilterOpen}
              onClose={() => setIsFilterOpen(false)}
              filters={sidebarFilters}
              onFilterChange={handleFilterChange}
              categories={categories} 
            />
          </div>

          {/* Product Grid Container */}
          <div className="flex-1 min-w-0">
            
            {/* Category Chips (Mobile/Tablet only) */}
            <div className="lg:hidden flex gap-2 overflow-x-auto hide-scrollbar pb-4 mb-6 -mx-4 px-4">
              <button
                onClick={() => setFilters(prev => ({ ...prev, category: '', page: 1 }))}
                className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                  !filters.category
                    ? 'bg-[#382135] text-white shadow-md shadow-[#382135]/20'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-[#D4AF37]'
                }`}
              >
                All Pieces
              </button>
              {categoryList.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => setFilters(prev => ({ ...prev, category: cat.slug, page: 1 }))}
                  className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                    filters.category === cat.slug
                      ? 'bg-[#382135] text-white shadow-md shadow-[#382135]/20'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-[#D4AF37]'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {error ? (
              <ErrorState message={error} onRetry={retry} />
            ) : loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 lg:gap-8">
                <SkeletonLoader type="card" count={6} />
              </div>
            ) : products.length === 0 ? (
              <EmptyState
                icon={Package}
                title="No Products Found"
                description="Try adjusting your filters or search query to explore our collection."
                action={
                  <button onClick={clearAllFilters} className="mt-6 px-8 py-3 bg-[#382135] text-white rounded-full font-semibold hover:bg-[#2a1827] transition-colors">
                    Clear Filters
                  </button>
                }
              />
            ) : (
              <>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-12 lg:gap-x-10 lg:gap-y-16"
                >
                  {products.map((product, i) => (
                    <ProductCard key={product.id || product.slug} product={product} index={i} />
                  ))}
                </motion.div>
                
                <div className="mt-16 pt-8 border-t border-gray-100">
                  <Pagination
                    currentPage={filters.page}
                    totalPages={totalPages > 0 ? totalPages : 1}
                    onPageChange={handlePageChange}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
