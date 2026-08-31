export const CATEGORIES = [
  {
    id: 1,
    name: 'Rings',
    slug: 'rings',
    description: 'Statement, occasion and everyday rings crafted to make every detail feel intentional.',
    image: '/category-images/rings.webp',
  },
  {
    id: 2,
    name: 'Necklaces',
    slug: 'necklaces',
    description: 'Elegant necklaces designed to frame the neckline with refined traditional detail.',
    image: '/category-images/necklaces.webp',
  },
  {
    id: 3,
    name: 'Earrings',
    slug: 'earrings',
    description: 'Studs, drops and statement earrings that bring light and character to every look.',
    image: '/category-images/earrings.webp',
  },
  {
    id: 4,
    name: 'Bracelets',
    slug: 'bracelets',
    description: 'Delicate and statement bracelets finished with polished details for effortless layering.',
    image: '/category-images/bracelets.webp',
  },
  {
    id: 5,
    name: 'Bangles',
    slug: 'bangles',
    description: 'Classic and contemporary bangles designed for festive, bridal and everyday styling.',
    image: '/category-images/bangles.webp',
  },
  {
    id: 6,
    name: 'Pendants',
    slug: 'pendants',
    description: 'Refined pendants with gemstone-led details for an elegant finishing touch.',
    image: '/category-images/pendants.webp',
  },
  {
    id: 7,
    name: 'Necklace Sets',
    slug: 'necklace-sets',
    description: 'Coordinated necklace and earring sets created for celebrations, ceremonies and gifting.',
    image: '/category-images/necklace-sets.webp',
  },
  {
    id: 8,
    name: 'Anklets',
    slug: 'anklets',
    description: 'Graceful anklets with delicate movement and traditional detailing.',
    image: '/category-images/anklets.webp',
  },
  {
    id: 9,
    name: 'Nose Rings',
    slug: 'nose-rings',
    description: 'Traditional and occasion nose rings with intricate stonework and elegant proportions.',
    image: '/category-images/nose-rings.webp',
  },
  {
    id: 10,
    name: 'Maang Tikka',
    slug: 'maang-tikka',
    description: 'Ornate maang tikka designs made to complete bridal and festive looks.',
    image: '/category-images/maang-tikka.webp',
  },
];

export const getCategoryBySlug = (slug) => CATEGORIES.find((category) => category.slug === slug);
