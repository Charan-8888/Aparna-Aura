import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Heart, Share2, Shield, Truck, RefreshCw, Check, Gem, Palette, Sparkles, Award, Star, MessageCircle } from 'lucide-react';
import ImageGallery from '../components/ImageGallery/ImageGallery';
import PriceBadge from '../components/PriceBadge/PriceBadge';
import RatingDisplay from '../components/RatingDisplay/RatingDisplay';
import QuantitySelector from '../components/QuantitySelector/QuantitySelector';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import ProductCard from '../components/ProductCard/ProductCard';
import SectionTitle from '../components/SectionTitle/SectionTitle';
import SkeletonLoader from '../components/SkeletonLoader/SkeletonLoader';
import EmptyState from '../components/EmptyState/EmptyState';
import ErrorState from '../components/ErrorState/ErrorState';
import LuxuryGuarantees from '../components/LuxuryGuarantees/LuxuryGuarantees';
import SEO from '../components/SEO/SEO';
import { useProduct } from '../hooks/useProduct';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';
import { getProductEnquiryWhatsAppUrl } from '../constants/socialLinks';

// ─── Storytelling Tabs ───
const STORY_TABS = [
  { id: 'description', label: 'Description' },
  { id: 'craftsmanship', label: 'Craftsmanship' },
  { id: 'materials', label: 'Materials & Origin' },
  { id: 'care', label: 'Care Guide' },
];

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { product, loading, error, retry } = useProduct(slug);
  const [quantity, setQuantity] = useState(1);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('description');

  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { trackView, recentlyViewed } = useRecentlyViewed();

  const wishlisted = product ? isWishlisted(product.id) : false;

  // Fetch related products based on the current product's category
  const { products: relatedProductsArray } = useProducts({
    category: typeof product?.category === 'object' ? product?.category?.slug : (product?.category || ''),
  });

  const relatedProducts = relatedProductsArray
    .filter((p) => p.id !== product?.id)
    .slice(0, 4);

  // Recently viewed from localStorage
  const recentItems = recentlyViewed.filter((p) => p.id !== product?.id).slice(0, 4);

  useEffect(() => {
    if (product) {
      setQuantity(1);
      setCartSuccess(false);
      setActiveTab('description');
      // Track this product view
      trackView(product);
    }
  }, [product?.slug]);

  const isPriceOnRequest = Number(product?.price || 0) <= 0;

  const handleAddToCart = async () => {
    if (cartLoading || isPriceOnRequest) return;
    setCartLoading(true);
    try {
      await addToCart(product.id, quantity, {
        onRequireLogin: () => navigate('/login', { state: { from: location } }),
      });
      setCartSuccess(true);
      setTimeout(() => setCartSuccess(false), 2500);
    } catch {
      // Error already logged in context
    } finally {
      setCartLoading(false);
    }
  };

  const handleWishlistToggle = async () => {
    await toggleWishlist(product.id, {
      onRequireLogin: () => navigate('/login', { state: { from: location } }),
    });
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: product.name,
          text: `Check out ${product.name} on Aparna Aura`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        // Could add toast here
      }
    } catch {}
  };

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ErrorState message={error} onRetry={retry} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <SkeletonLoader type="detail" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <EmptyState
          title="Product Not Found"
          description="We couldn't find the product you're looking for."
          action={
            <Link to="/products" className="bg-[#382135] text-white px-6 py-3 rounded-full font-medium hover:bg-[#2a1827] transition-colors">
              Continue Shopping
            </Link>
          }
        />
      </div>
    );
  }

  // Backend serializer now returns an array of objects for images. 
  // We need to unwrap them into strings for ImageGallery and SEO components.
  const images = (product.images || [])
    .map(img => typeof img === 'object' && img !== null ? img.image : img)
    .filter(Boolean);
    
  if (images.length === 0 && product.image) {
    const fallback = typeof product.image === 'object' && product.image !== null ? product.image.image : product.image;
    if (fallback) images.push(fallback);
  }

  const materialName = product.material || 'Premium Quality Gold';
  const categoryName = typeof product.category === 'object' ? product.category?.name : (product.category || 'Jewellery');
  const categorySlug = typeof product.category === 'object' ? product.category?.slug : product.category;

  const productSchema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": images,
    "description": product.description,
    "sku": product.sku || product.id,
    "brand": {
      "@type": "Brand",
      "name": "Aparna Aura"
    },
    ...(Number(product.price || 0) > 0 ? {
      "offers": {
        "@type": "Offer",
        "url": `https://aparnaaura.com/product/${product.slug}`,
        "priceCurrency": "INR",
        "price": product.price,
        "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        "itemCondition": "https://schema.org/NewCondition"
      }
    } : {})
  };

  const breadcrumbsSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Shop",
        "item": "https://aparnaaura.com/products"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": categoryName,
        "item": `https://aparnaaura.com/categories/${categorySlug}`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": product.name,
        "item": `https://aparnaaura.com/product/${product.slug}`
      }
    ]
  };

  return (
    <div className="bg-white">
      <SEO
        title={product.name}
        description={product.description?.substring(0, 155)}
        image={images[0]}
        url={`/product/${product.slug}`}
        type="product"
        schema={productSchema}
        breadcrumbsSchema={breadcrumbsSchema}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb items={[
          { label: 'Shop', path: '/products' },
          { label: categoryName, path: `/categories/${typeof product.category === 'object' ? product.category?.slug : product.category}` },
          { label: product.name, path: `/product/${product.slug}` },
        ]} />

        {/* ── Main Product Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-6">
          {/* Gallery - 7 cols */}
          <div className="lg:col-span-7">
            <ImageGallery images={images} productName={product.name} />
          </div>

          {/* Details - 5 cols */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <div className="border-b border-gray-100 pb-6 mb-6">
                <span className="text-xs font-bold tracking-[0.2em] text-[#D4AF37] uppercase mb-2 block">
                  {categoryName}
                </span>
                <h1 className="text-3xl md:text-4xl font-bold font-heading text-[#382135] mb-4">
                  {product.name}
                </h1>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF8F5] border border-[#E6E1D8] text-xs font-semibold text-[#382135]">
                    ✨ Certified Authentic Jewellery
                  </span>
                  <div className="flex gap-2">
                    <button onClick={handleShare} className="p-2 text-gray-400 hover:text-[#382135] transition-colors rounded-full hover:bg-gray-50" title="Share">
                      <Share2 size={20} />
                    </button>
                    <button
                      onClick={handleWishlistToggle}
                      className={`p-2 transition-colors rounded-full hover:bg-gray-50 ${wishlisted ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                      title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                    >
                      <Heart size={20} fill={wishlisted ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Price & Stock */}
              <div className="mb-8">
                {isPriceOnRequest ? (
                  <>
                    <span className="text-2xl font-semibold text-[#D4AF37] tracking-wide">
                      Price on Request
                    </span>
                    <p className="mt-2 text-sm font-medium text-gray-500">
                      Contact us to know the price of this piece
                    </p>
                  </>
                ) : (
                  <>
                    <PriceBadge
                      price={product.price}
                      originalPrice={product.original_price || product.price}
                      formatPrice={(p) => `₹${Number(p).toLocaleString('en-IN')}`}
                      size="lg"
                    />
                    <p className={`mt-2 text-sm font-medium ${product.stock > 5 ? 'text-green-600' : 'text-red-500'}`}>
                      {product.stock > 5 ? 'In Stock - Ready to ship' : `Only ${product.stock || 0} left in stock - Order soon`}
                    </p>
                  </>
                )}
              </div>

              {/* ── Product Storytelling Tabs ── */}
              <div className="mb-8">
                <div className="flex gap-1 bg-[#F3EFE8] rounded-xl p-1 mb-5">
                  {STORY_TABS.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 py-2.5 px-3 text-xs font-semibold rounded-lg transition-all duration-300 ${
                        activeTab === tab.id
                          ? 'bg-white text-[#382135] shadow-sm'
                          : 'text-gray-500 hover:text-[#382135]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="prose prose-sm text-gray-600"
                  >
                    {activeTab === 'description' && (
                      <div>
                        <p>{product.description}</p>
                        <ul className="mt-4 space-y-1">
                          <li><strong>Material:</strong> {materialName}</li>
                          <li><strong>Weight:</strong> {product.weight || 'Standard'}</li>
                          {product.sku && <li><strong>SKU:</strong> {product.sku}</li>}
                        </ul>
                      </div>
                    )}

                    {activeTab === 'craftsmanship' && (
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Sparkles size={16} className="text-[#D4AF37]" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-[#382135] mb-1">Design Inspiration</h4>
                            <p className="text-sm">This {(categoryName || 'jewellery').toLowerCase()} draws inspiration from classical Indian motifs, reimagined with contemporary elegance for the modern connoisseur.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Gem size={16} className="text-[#D4AF37]" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-[#382135] mb-1">Artisan Process</h4>
                            <p className="text-sm">Handcrafted by master artisans with decades of experience, each piece undergoes over 20 quality checks before reaching you.</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'materials' && (
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Palette size={16} className="text-[#D4AF37]" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-[#382135] mb-1">Material Origin</h4>
                            <p className="text-sm">Crafted with {materialName}, sourced from certified suppliers adhering to the highest ethical and quality standards.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Award size={16} className="text-[#D4AF37]" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-[#382135] mb-1">BIS Hallmarked</h4>
                            <p className="text-sm">Every piece is BIS Hallmark certified, guaranteeing the purity and authenticity of the precious metal used.</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'care' && (
                      <div>
                        <ul className="space-y-2 text-sm list-none p-0">
                          <li className="flex items-center gap-2"><Check size={14} className="text-[#D4AF37] flex-shrink-0" /> Store in the provided jewellery box when not in use</li>
                          <li className="flex items-center gap-2"><Check size={14} className="text-[#D4AF37] flex-shrink-0" /> Avoid contact with perfume, chemicals, and water</li>
                          <li className="flex items-center gap-2"><Check size={14} className="text-[#D4AF37] flex-shrink-0" /> Clean gently with a soft, lint-free cloth</li>
                          <li className="flex items-center gap-2"><Check size={14} className="text-[#D4AF37] flex-shrink-0" /> Remove before exercising or sleeping</li>
                          <li className="flex items-center gap-2"><Check size={14} className="text-[#D4AF37] flex-shrink-0" /> Professional cleaning available at any {`Aparna Aura`} store</li>
                        </ul>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-4 mb-10 pb-10 border-b border-gray-100">
                {isPriceOnRequest ? (
                  /* ₹0 products: show Enquire on WhatsApp with pre-filled message */
                  <a
                    href={getProductEnquiryWhatsAppUrl(product)}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Enquire on WhatsApp about ${product.name}`}
                    className="flex items-center justify-center gap-2.5 w-full py-4 rounded-full bg-[#25D366] text-white font-bold hover:bg-[#20ba5a] transition-all shadow-lg shadow-[#25D366]/25"
                  >
                    <MessageCircle size={20} />
                    Enquire on WhatsApp
                  </a>
                ) : (
                  /* Normal purchase flow for priced products */
                  <>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium text-[#382135]">Quantity:</span>
                      <QuantitySelector
                        quantity={quantity}
                        onChange={setQuantity}
                        max={product.stock || 1}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      {/* Add to Cart */}
                      <button
                        onClick={handleAddToCart}
                        disabled={cartLoading || cartSuccess}
                        className={`flex items-center justify-center gap-2 w-full py-4 rounded-full border-2 font-semibold transition-all duration-300 ${
                          cartSuccess
                            ? 'border-green-500 text-green-600 bg-green-50'
                            : 'border-[#382135] text-[#382135] hover:bg-gray-50'
                        } disabled:opacity-70`}
                      >
                        <AnimatePresence mode="wait">
                          {cartLoading ? (
                            <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-5 h-5 border-2 border-[#382135]/30 border-t-[#382135] rounded-full animate-spin" />
                          ) : cartSuccess ? (
                            <motion.span key="success" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2">
                              <Check size={20} /> Added!
                            </motion.span>
                          ) : (
                            <motion.span key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                              <ShoppingBag size={20} /> Add to Cart
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </button>

                      {/* Buy It Now */}
                      <button
                        onClick={async () => {
                          await handleAddToCart();
                          navigate('/cart');
                        }}
                        className="flex items-center justify-center gap-2 w-full py-4 rounded-full bg-[#382135] text-white font-semibold hover:bg-[#2a1827] transition-colors shadow-lg shadow-[#382135]/20"
                      >
                        Buy It Now
                      </button>
                    </div>
                  </>
                )}
              </div>

              <LuxuryGuarantees className="mt-6" />

            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <section className="bg-white py-16 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle title="Client Testimonials" />
          <div className="text-center mb-12">
            <div className="flex justify-center items-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map(i => <Star key={i} size={20} className="text-[#D4AF37]" fill="currentColor" />)}
            </div>
            <p className="text-[#382135] font-bold text-lg">4.9 / 5.0</p>
            <p className="text-gray-500 text-sm">Based on 128 verified reviews</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#FAF8F5] p-8 border border-[#E6E1D8]">
              <div className="flex gap-1 mb-2">
                {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} className="text-[#D4AF37]" fill="currentColor" />)}
              </div>
              <p className="text-xs text-green-600 font-bold uppercase tracking-widest mb-4 flex items-center gap-1"><Check size={12}/> Verified Purchase</p>
              
              <h4 className="text-[#382135] font-bold mb-2 text-lg" style={{ fontFamily: '"Playfair Display", serif' }}>Exceeded all expectations</h4>
              <p className="text-gray-600 text-sm mb-6 italic leading-relaxed">
                "The craftsmanship is absolutely breathtaking. The packaging it arrived in made the unboxing experience feel incredibly special. Truly a masterpiece that I will pass down."
              </p>
              
              <div className="space-y-2 mb-6 border-t border-[#E6E1D8] pt-4">
                <div className="flex justify-between text-xs text-gray-500"><span className="uppercase tracking-wider">Packaging Quality</span><span className="text-[#D4AF37]">5/5</span></div>
                <div className="flex justify-between text-xs text-gray-500"><span className="uppercase tracking-wider">Product Quality</span><span className="text-[#D4AF37]">5/5</span></div>
                <div className="flex justify-between text-xs text-gray-500"><span className="uppercase tracking-wider">Delivery Experience</span><span className="text-[#D4AF37]">5/5</span></div>
                <div className="flex justify-between text-xs font-bold text-[#382135] mt-2"><span className="uppercase tracking-wider">Would Recommend</span><span className="text-green-600">Yes</span></div>
              </div>
              
              <p className="text-xs font-bold text-[#382135] uppercase tracking-widest">— Priya S.</p>
            </div>
            
            <div className="bg-[#FAF8F5] p-8 border border-[#E6E1D8]">
              <div className="flex gap-1 mb-2">
                {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} className="text-[#D4AF37]" fill="currentColor" />)}
              </div>
              <p className="text-xs text-green-600 font-bold uppercase tracking-widest mb-4 flex items-center gap-1"><Check size={12}/> Verified Purchase</p>

              <h4 className="text-[#382135] font-bold mb-2 text-lg" style={{ fontFamily: '"Playfair Display", serif' }}>Impeccable service</h4>
              <p className="text-gray-600 text-sm mb-6 italic leading-relaxed">
                "I was hesitant to buy fine jewellery online, but the insured delivery and constant updates put me at ease. The piece itself is stunning and the quality is undeniable."
              </p>

              <div className="space-y-2 mb-6 border-t border-[#E6E1D8] pt-4">
                <div className="flex justify-between text-xs text-gray-500"><span className="uppercase tracking-wider">Packaging Quality</span><span className="text-[#D4AF37]">5/5</span></div>
                <div className="flex justify-between text-xs text-gray-500"><span className="uppercase tracking-wider">Product Quality</span><span className="text-[#D4AF37]">5/5</span></div>
                <div className="flex justify-between text-xs text-gray-500"><span className="uppercase tracking-wider">Delivery Experience</span><span className="text-[#D4AF37]">5/5</span></div>
                <div className="flex justify-between text-xs font-bold text-[#382135] mt-2"><span className="uppercase tracking-wider">Would Recommend</span><span className="text-green-600">Yes</span></div>
              </div>

              <p className="text-xs font-bold text-[#382135] uppercase tracking-widest">— Ananya M.</p>
            </div>

            <div className="bg-[#FAF8F5] p-8 border border-[#E6E1D8]">
              <div className="flex gap-1 mb-2">
                {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} className="text-[#D4AF37]" fill="currentColor" />)}
              </div>
              <p className="text-xs text-green-600 font-bold uppercase tracking-widest mb-4 flex items-center gap-1"><Check size={12}/> Verified Purchase</p>

              <h4 className="text-[#382135] font-bold mb-2 text-lg" style={{ fontFamily: '"Playfair Display", serif' }}>A true work of art</h4>
              <p className="text-gray-600 text-sm mb-6 italic leading-relaxed">
                "The attention to detail on this piece is phenomenal. It catches the light beautifully. The certificate of authenticity provided that extra layer of trust."
              </p>

              <div className="space-y-2 mb-6 border-t border-[#E6E1D8] pt-4">
                <div className="flex justify-between text-xs text-gray-500"><span className="uppercase tracking-wider">Packaging Quality</span><span className="text-[#D4AF37]">5/5</span></div>
                <div className="flex justify-between text-xs text-gray-500"><span className="uppercase tracking-wider">Product Quality</span><span className="text-[#D4AF37]">5/5</span></div>
                <div className="flex justify-between text-xs text-gray-500"><span className="uppercase tracking-wider">Delivery Experience</span><span className="text-[#D4AF37]">5/5</span></div>
                <div className="flex justify-between text-xs font-bold text-[#382135] mt-2"><span className="uppercase tracking-wider">Would Recommend</span><span className="text-green-600">Yes</span></div>
              </div>

              <p className="text-xs font-bold text-[#382135] uppercase tracking-widest">— Sneha R.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="bg-[#FAF8F5] py-16 border-t border-[#E6E1D8]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionTitle title="Curated For You" subtitle="Complete your collection with these complementary pieces" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
              {relatedProducts.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recently Viewed */}
      {recentItems.length > 0 && (
        <section className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionTitle title="Recently Viewed" />
            <div className="flex gap-5 overflow-x-auto hide-scrollbar pb-4 mt-8 -mx-4 px-4">
              {recentItems.map((item) => (
                <Link key={item.id} to={`/product/${item.slug}`} className="flex-shrink-0 w-40 group">
                  <div className="aspect-square rounded-2xl overflow-hidden bg-[#F3EFE8] mb-3 border border-[#E6E1D8] group-hover:shadow-lg transition-shadow">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                  </div>
                  <p className="text-xs text-[#D4AF37] uppercase tracking-wider font-medium">{item.category}</p>
                  <p className="text-sm font-semibold text-[#382135] truncate group-hover:text-[#D4AF37] transition-colors">{item.name}</p>
                  <p className="text-sm font-bold text-[#382135] mt-0.5">₹{Number(item.price || 0).toLocaleString('en-IN')}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Sticky Mobile Purchase Panel */}
      {!isPriceOnRequest ? (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 p-4 md:hidden z-40 shadow-2xl">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 truncate">{product.name}</p>
              <p className="text-sm font-bold text-[#382135]">₹{Number(product.price).toLocaleString('en-IN')}</p>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={cartLoading}
              className="flex-shrink-0 bg-[#382135] text-white px-6 py-2.5 rounded-full font-semibold text-sm disabled:opacity-70 shadow-lg"
            >
              {cartLoading ? 'Adding...' : cartSuccess ? 'Added ✓' : 'Add to Cart'}
            </button>
          </div>
        </div>
      ) : (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 p-4 md:hidden z-40 shadow-2xl">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 truncate">{product.name}</p>
              <p className="text-sm font-semibold text-[#D4AF37]">Price on Request</p>
            </div>
            <a
              href={getProductEnquiryWhatsAppUrl(product)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Enquire on WhatsApp about ${product.name}`}
              className="flex-shrink-0 bg-[#25D366] text-white px-5 py-2.5 rounded-full font-bold text-xs flex items-center gap-1.5 shadow-lg"
            >
              <MessageCircle size={15} />
              Enquire on WhatsApp
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
