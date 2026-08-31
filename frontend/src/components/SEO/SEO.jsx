import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ 
  title, 
  description, 
  image, 
  url,
  type = 'website',
  schema,
  breadcrumbsSchema
}) => {
  const siteTitle = 'Aparna Aura | Luxury Jewellery';
  const defaultDescription = 'Discover exquisite, handcrafted luxury jewellery designed to celebrate life\'s most precious moments. Rings, necklaces, earrings, and bridal collections.';
  const defaultImage = 'https://images.unsplash.com/photo-1515562141589-67f0d6ce4819?w=1200&h=630&fit=crop';
  
  const pageTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  const metaDescription = description || defaultDescription;
  const metaImage = image || defaultImage;
  const currentUrl = url ? `https://aparnaaura.com${url}` : 'https://aparnaaura.com';

  return (
    <Helmet>
      {/* Standard SEO */}
      <title>{pageTitle}</title>
      <meta name="description" content={metaDescription} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaImage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />

      {/* Canonical URL */}
      <link rel="canonical" href={currentUrl} />

      {/* Structured Data (JSON-LD) - Product / General */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}

      {/* Structured Data (JSON-LD) - Breadcrumbs */}
      {breadcrumbsSchema && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbsSchema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
