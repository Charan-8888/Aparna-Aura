import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Award,
  Camera,
  Gem,
  Gift,
  Quote,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  Truck,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import CategoryCard from '../components/CategoryCard/CategoryCard';
import HeroSlider from '../components/HeroSlider/HeroSlider';
import OptimizedImage from '../components/OptimizedImage/OptimizedImage';
import ProductCard from '../components/ProductCard/ProductCard';
import SEO from '../components/SEO/SEO';
import SectionTitle from '../components/SectionTitle/SectionTitle';
import { APP_NAME } from '../constants/app';
import { CATEGORIES } from '../data/categories';
import { PRODUCTS } from '../data/products';
import { TESTIMONIALS } from '../data/testimonials';
import { useCategories } from '../hooks/useCategories';
import { useProducts } from '../hooks/useProducts';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.18 },
  transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
};

const formatPrice = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

const Home = () => {
  const { products: trending = [] } = useProducts({ is_trending: true });
  const { products: newArrivals = [] } = useProducts({ is_new_arrival: true });
  const { categories = [] } = useCategories();
  const { recentlyViewed } = useRecentlyViewed();

  // Backend data always wins. The local fallback keeps the frontend fully visible
  // while the backend is unavailable on this laptop.
  const displayedCategories = (Array.isArray(categories) && categories.length ? categories : CATEGORIES).slice(0, 6);
  const displayedTrending = (trending.length ? trending : PRODUCTS.filter((item) => item.tags?.includes('trending'))).slice(0, 4);
  const displayedNewArrivals = (newArrivals.length ? newArrivals : PRODUCTS.filter((item) => item.tags?.includes('new-arrival'))).slice(0, 4);

  return (
    <div className="-mt-28 overflow-hidden bg-[#fbf8f2]">
      <SEO
        title="Luxury Jewellery & Fine Ornaments"
        description="Elegant handcrafted jewellery designed to celebrate life's most meaningful moments. Explore premium rings, necklaces, earrings and bridal wear."
        url="/"
      />

      <HeroSlider />

      <section className="border-y border-[#d5ae58]/18 bg-[#21131f]">
        <div className="mx-auto grid max-w-[1480px] grid-cols-2 gap-y-7 px-5 py-7 sm:px-8 md:grid-cols-4 lg:px-12 xl:px-16">
          {[
            { icon: Gem, value: 'Master artisans', label: 'Hand-finished details' },
            { icon: ShieldCheck, value: 'Certified', label: 'Authenticity assured' },
            { icon: Truck, value: 'Insured delivery', label: 'Safe from us to you' },
            { icon: Gift, value: 'Signature gifting', label: 'Ready for the moment' },
          ].map(({ icon: Icon, value, label }, index) => (
            <div key={value} className={`flex items-center gap-4 ${index > 0 ? 'md:border-l md:border-white/10 md:pl-8' : ''}`}>
              <Icon size={21} strokeWidth={1.45} className="text-[#d7af57]" />
              <div>
                <p className="text-sm font-semibold text-white/90">{value}</p>
                <p className="mt-0.5 text-[11px] tracking-wide text-white/38">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1480px] px-5 py-24 sm:px-8 lg:px-12 lg:py-32 xl:px-16">
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionTitle
            title="Find your signature"
            subtitle="Curated by form, occasion and the way you want to feel."
            className="!mb-0"
          />
          <Link to="/categories/all" className="group inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-[#9b702b]">
            Explore all categories <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6 lg:gap-5">
          {displayedCategories.map((category, index) => (
            <CategoryCard key={category.id || category.slug} category={category} index={index} />
          ))}
        </div>
      </section>

      <section className="relative bg-[#fffdf9] py-24 lg:py-32">
        <div className="absolute inset-x-0 top-0 mx-auto h-px max-w-[1320px] bg-gradient-to-r from-transparent via-[#b98938]/25 to-transparent" />
        <div className="mx-auto max-w-[1480px] px-5 sm:px-8 lg:px-12 xl:px-16">
          <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionTitle
              title="Most desired"
              subtitle="Pieces customers return to—selected for balance, detail and lasting appeal."
              className="!mb-0"
            />
            <Link to="/products" className="group inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-[#9b702b]">
              Shop the collection <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-7">
            {displayedTrending.map((product, index) => (
              <ProductCard key={product.id || product.slug} product={product} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1480px] px-5 py-24 sm:px-8 lg:px-12 lg:py-32 xl:px-16">
        <motion.div {...reveal} className="grid overflow-hidden rounded-[2rem] bg-[#251420] shadow-[0_35px_90px_rgba(47,25,43,.14)] lg:grid-cols-[1.05fr_.95fr]">
          <div className="relative min-h-[460px] overflow-hidden lg:min-h-[650px]">
            <OptimizedImage
              src="https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=1200&h=1400&fit=crop"
              alt="Traditional handcrafted jewellery"
              className="h-full w-full object-cover transition-transform duration-[1400ms] hover:scale-[1.035]"
              containerClassName="absolute inset-0 h-full w-full"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#251420]/55 via-transparent to-transparent" />
          </div>
          <div className="relative flex items-center px-7 py-14 sm:px-12 lg:px-16">
            <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-[#c99b43]/8 blur-3xl" />
            <div className="relative">
              <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#dcb75f]">The Aparna Aura atelier</p>
              <h2 className="mt-6 max-w-xl text-4xl font-medium leading-[1.04] text-[#fff9ee] md:text-5xl lg:text-6xl">
                Jewellery with the presence of an heirloom.
              </h2>
              <p className="mt-7 max-w-lg text-base leading-8 text-white/58">
                We pair traditional Indian artistry with contemporary proportion, creating pieces that feel regal without becoming heavy or overdone.
              </p>
              <Link to="/about" className="group mt-9 inline-flex items-center gap-3 border-b border-[#d6ad55]/50 pb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#e9c778]">
                Discover our craft <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="mx-auto max-w-[1480px] px-5 pb-24 sm:px-8 lg:px-12 lg:pb-32 xl:px-16">
        <motion.div {...reveal}>
          <Link
            to="/try-on"
            className="group relative block overflow-hidden rounded-[2rem] border border-[#c69743]/20 bg-[linear-gradient(115deg,#efe4d2_0%,#fbf7ef_52%,#ead9bf_100%)] px-7 py-12 sm:px-12 lg:px-16 lg:py-16"
          >
            <div className="absolute -right-20 -top-32 h-96 w-96 rounded-full border border-[#b88735]/14" />
            <div className="absolute -right-6 -top-20 h-72 w-72 rounded-full border border-[#b88735]/14" />
            <div className="relative flex flex-col items-start justify-between gap-9 lg:flex-row lg:items-center">
              <div className="flex max-w-3xl items-start gap-5">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#301b2f] text-[#edca79] shadow-[0_14px_32px_rgba(48,27,47,.16)]">
                  <Camera size={24} strokeWidth={1.5} />
                </span>
                <div>
                  <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#9b702b]"><Sparkles size={12} /> Virtual styling</p>
                  <h2 className="mt-3 text-3xl font-medium text-[#301b2f] md:text-4xl">Try it before the moment arrives.</h2>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-[#6f625c] md:text-base">Use your camera to preview selected pieces and compare how different silhouettes frame you.</p>
                </div>
              </div>
              <span className="inline-flex min-h-13 items-center gap-3 rounded-full bg-[#301b2f] px-7 text-xs font-bold uppercase tracking-[0.16em] text-white transition group-hover:-translate-y-0.5 group-hover:bg-[#4b2b47]">
                Start try-on <ArrowRight size={16} />
              </span>
            </div>
          </Link>
        </motion.div>
      </section>

      <section className="bg-[#f2ebe1] py-24 lg:py-32">
        <div className="mx-auto max-w-[1480px] px-5 sm:px-8 lg:px-12 xl:px-16">
          <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionTitle title="New arrivals" subtitle="Freshly added forms for modern celebrations." className="!mb-0" />
            <Link to="/products?sort=newest" className="group inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-[#9b702b]">
              See what is new <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-7">
            {displayedNewArrivals.map((product, index) => (
              <ProductCard key={product.id || product.slug} product={product} index={index} />
            ))}
          </div>
        </div>
      </section>

      {recentlyViewed.length > 0 && (
        <section className="mx-auto max-w-[1480px] px-5 py-24 sm:px-8 lg:px-12 xl:px-16">
          <SectionTitle title="Recently viewed" subtitle="Continue from where you left off." />
          <div className="flex gap-5 overflow-x-auto pb-4 hide-scrollbar">
            {recentlyViewed.slice(0, 8).map((item) => (
              <Link key={item.id} to={`/product/${item.slug}`} className="group w-44 shrink-0">
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#eee6dc]">
                  <OptimizedImage src={item.image} alt={item.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" containerClassName="absolute inset-0" loading="lazy" />
                </div>
                <p className="mt-3 truncate text-sm font-semibold text-[#301b2f]">{item.name}</p>
                <p className="mt-1 text-sm text-[#9b702b]">{formatPrice(item.price)}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="bg-[#fffdf9] py-24 lg:py-32">
        <div className="mx-auto max-w-[1480px] px-5 sm:px-8 lg:px-12 xl:px-16">
          <SectionTitle title="Loved in real moments" subtitle="What customers remember after the box is opened." centered />
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {TESTIMONIALS.slice(0, 3).map((testimonial, index) => (
              <motion.article
                key={testimonial.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: index * 0.08 }}
                className="rounded-[1.6rem] border border-[#3a2337]/8 bg-[#fbf7f0] p-7 shadow-[0_16px_50px_rgba(48,27,47,.055)] md:p-8"
              >
                <Quote size={26} strokeWidth={1.35} className="text-[#bb8732]" />
                <p className="mt-6 min-h-24 text-sm leading-7 text-[#6e625d]">{testimonial.text}</p>
                <div className="mt-7 flex items-center gap-3 border-t border-[#3a2337]/8 pt-5">
                  <img src={testimonial.avatar} alt={testimonial.name} className="h-11 w-11 rounded-full object-cover" loading="lazy" />
                  <div>
                    <p className="text-sm font-semibold text-[#301b2f]">{testimonial.name}</p>
                    <p className="text-xs text-[#948781]">{testimonial.location}</p>
                  </div>
                  <div className="ml-auto flex gap-0.5 text-[#c28f38]">
                    {Array.from({ length: testimonial.rating }).map((_, star) => <span key={star}>★</span>)}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#24131f] py-24">
        <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-[#c79640]/9 blur-3xl" />
        <div className="relative mx-auto max-w-2xl px-5 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#d8b35e]">Private access</p>
          <h2 className="mt-5 text-4xl font-medium text-white md:text-5xl">Enter the Aparna Aura circle.</h2>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-white/50 md:text-base">New collections, private previews and styling notes—sent selectively.</p>
          <div className="mx-auto mt-9 flex max-w-lg flex-col gap-3 sm:flex-row">
            <input
              type="email"
              placeholder="Your email address"
              className="min-h-14 flex-1 rounded-full border border-white/14 bg-white/6 px-6 text-sm text-white placeholder:text-white/32 focus:border-[#d5ad56] focus:outline-none"
            />
            <button type="button" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#efd18a,#bd8731)] px-7 text-xs font-bold uppercase tracking-[0.14em] text-[#24131f] transition hover:-translate-y-0.5 hover:brightness-105">
              <Send size={16} /> Join now
            </button>
          </div>
          <p className="mt-4 text-[11px] text-white/28">No noise. Unsubscribe whenever you choose.</p>
        </div>
      </section>
    </div>
  );
};

export default Home;
