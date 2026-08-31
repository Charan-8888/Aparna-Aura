import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import ProductCard from '../components/ProductCard/ProductCard';
import SectionTitle from '../components/SectionTitle/SectionTitle';
import SkeletonLoader from '../components/SkeletonLoader/SkeletonLoader';
import EmptyState from '../components/EmptyState/EmptyState';
import ErrorState from '../components/ErrorState/ErrorState';
import CategoryHero from '../components/CategoryHero/CategoryHero';
import CollectionHero from '../components/CollectionHero/CollectionHero';
import { Package } from 'lucide-react';
import { useCategories } from '../hooks/useCategories';
import { useProducts } from '../hooks/useProducts';
import SEO from '../components/SEO/SEO';
import { getCategoryHeroConfig } from '../data/categoryHeroConfig';

const Category = () => {
  const { slug } = useParams();
  const isAll = slug === 'all';

  const { category, categories, loading: catLoading, error: catError, retry: catRetry } = useCategories(isAll ? null : slug);
  const { products, loading: prodLoading, error: prodError, retry: prodRetry } = useProducts({ category: isAll ? '' : slug });
  const categoryList = Array.isArray(categories) ? categories : [];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (catError) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <ErrorState message={catError} onRetry={catRetry} />
      </div>
    );
  }

  if (catLoading) {
    return (
      <div>
        <div className="h-[440px] md:h-[500px] w-full bg-[#180c16] animate-pulse" />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <SkeletonLoader type="card" count={8} />
        </div>
      </div>
    );
  }

  if (!category && !isAll) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <EmptyState
          title="Category Not Found"
          description="The category you are looking for does not exist."
          action={
            <Link to="/products" className="bg-[#382135] text-white px-6 py-3 rounded-full font-medium hover:bg-[#2a1827] transition-colors">
              Browse All Products
            </Link>
          }
        />
      </div>
    );
  }

  // ── All Categories Page View (/categories/all) ──
  if (isAll) {
    const allBreadcrumbsSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Categories",
          "item": "https://aparnaaura.com/categories/all"
        }
      ]
    };

    return (
      <div className="bg-[#FAF8F5] min-h-screen">
        <SEO
          title="All Collections"
          description="Explore our complete collection of fine jewellery. Discover beautiful rings, necklaces, earrings, and more."
          url="/categories/all"
          breadcrumbsSchema={allBreadcrumbsSchema}
        />

        {/* ── Premium Rotating Full-Width Campaign Collection Hero ── */}
        <CollectionHero />
        
        <div id="collections-grid" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-6">
          <Breadcrumb items={[{ label: 'Categories', path: '/categories/all' }]} />
          
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {categoryList.map((cat, i) => (
              <motion.div
                key={cat.id || cat.slug}
                initial={{ opacity: 0, y: 26 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.06, 0.36) }}
              >
                <Link
                  to={`/categories/${cat.slug}`}
                  className="group block"
                  aria-label={`Explore ${cat.name || 'jewellery'} collection`}
                >
                  <div className="relative aspect-[5/4] overflow-hidden rounded-[1.35rem] bg-[#eadfce] shadow-[0_18px_45px_rgba(47,27,43,.10)] ring-1 ring-[#43263d]/8">
                    <img
                      src={(cat.image && String(cat.image).startsWith('http')) ? cat.image : 'https://images.unsplash.com/photo-1515562141589-67f0d6ce4819?w=800&h=640&fit=crop'}
                      alt={cat.name || 'Category'}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.045]"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1b0e18]/80 via-transparent to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5">
                      <h2 className="font-heading text-xl font-medium text-white">{cat.name}</h2>
                      <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#e0ba64]">View</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Single Category View ──
  const heroConfig = getCategoryHeroConfig(slug, category);
  
  const categoryBreadcrumbsSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Categories",
        "item": "https://aparnaaura.com/categories/all"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": category.name,
        "item": `https://aparnaaura.com/categories/${category.slug}`
      }
    ]
  };

  return (
    <div className="bg-[#FAF8F5] min-h-screen">
      <SEO
        title={`${category.name} Collection`}
        description={heroConfig.description || category.description || `Explore our beautiful ${category.name} collection. Handcrafted luxury jewellery.`}
        image={heroConfig.image}
        url={`/categories/${category.slug}`}
        breadcrumbsSchema={categoryBreadcrumbsSchema}
      />

      {/* Full-Width Luxury Campaign Hero */}
      <CategoryHero config={heroConfig} />

      {/* Main Content & Product Grid */}
      <div id="category-products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 scroll-mt-6">
        <Breadcrumb items={[
          { label: 'Categories', path: '/categories/all' },
          { label: category.name, path: `/categories/${category.slug}` }
        ]} />

        <div className="mt-8">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#E6E1D8]">
            <SectionTitle title={`Explore ${category.name}`} className="!mb-0" />
            {!prodLoading && !prodError && (
              <span className="text-[#382135] font-semibold text-sm sm:text-base">
                {products?.length || 0} Products Available
              </span>
            )}
          </div>

          {prodError ? (
            <div className="py-12">
              <ErrorState message="We couldn't load this collection." onRetry={prodRetry} />
            </div>
          ) : prodLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
              <SkeletonLoader type="card" count={8} />
            </div>
          ) : !products || products.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No Products Found"
              description={`We are currently curating beautiful ${(category?.name || 'jewellery').toLowerCase()} for you.`}
              action={
                <Link to="/products">
                  <button className="bg-[#382135] text-white px-6 py-2.5 rounded-full font-medium hover:bg-[#2a1827] transition-colors mt-4 shadow-md">
                    Shop All Jewellery
                  </button>
                </Link>
              }
            />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
              {products.map((product, i) => (
                <ProductCard key={product.id || product.slug} product={product} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Category;
