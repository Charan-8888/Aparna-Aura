import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import OptimizedImage from '../OptimizedImage/OptimizedImage';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1515562141589-67f0d6ce4819?w=800&h=640&fit=crop';

const CategoryCard = memo(({ category, index = 0 }) => {
  const image = category.image || FALLBACK_IMAGE;

  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, delay: index * 0.06 }}
    >
      <Link
        to={`/categories/${category.slug}`}
        className="group block"
        aria-label={`Shop ${category.name || 'jewellery'} collection`}
      >
        <div className="relative aspect-[5/4] overflow-hidden rounded-[1.35rem] bg-[#eadfce] shadow-[0_18px_42px_rgba(47,27,43,.10)] ring-1 ring-[#43263d]/8">
          <OptimizedImage
            src={image}
            alt={category.name || 'Jewellery category'}
            className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.045]"
            containerClassName="absolute inset-0 h-full w-full"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_48%,rgba(25,12,21,.76)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 sm:p-5">
            <div>
              {category.productCount != null && (
                <p className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-[#e2bd68]">
                  {category.productCount} pieces
                </p>
              )}
              <h3 className="font-heading text-lg font-medium tracking-[0.01em] text-white sm:text-xl">
                {category.name}
              </h3>
            </div>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-sm transition duration-300 group-hover:border-[#d9b45d] group-hover:bg-[#d9b45d] group-hover:text-[#26141f]">
              <ArrowUpRight size={17} />
            </span>
          </div>
        </div>
        <p className="mt-3 px-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8c6831] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          Explore collection
        </p>
      </Link>
    </motion.div>
  );
});

CategoryCard.displayName = 'CategoryCard';

export default CategoryCard;
