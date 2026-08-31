import React, { memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumb = memo(({ items = [] }) => {
  const location = useLocation();

  // Auto-generate breadcrumbs if items not provided
  const crumbs = items.length > 0 ? items : (() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    return pathSegments.map((segment, i) => ({
      label: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
      path: '/' + pathSegments.slice(0, i + 1).join('/'),
    }));
  })();

  return (
    <nav aria-label="breadcrumb" className="flex items-center text-sm text-[#776b70] flex-wrap gap-1 py-4">
      <Link
        to="/"
        className="flex items-center hover:text-[#9b702b] transition-colors duration-200"
      >
        <Home size={14} className="mr-1" />
        Home
      </Link>
      {crumbs.map((crumb, i) => (
        <React.Fragment key={i}>
          <ChevronRight size={14} className="text-[#cbbfac] mx-1" />
          {i === crumbs.length - 1 ? (
            <span className="text-[#301b2f] font-semibold">{crumb.label}</span>
          ) : (
            <Link
              to={crumb.path}
              className="hover:text-[#D4AF37] transition-colors duration-200"
            >
              {crumb.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
});

Breadcrumb.displayName = 'Breadcrumb';

export default Breadcrumb;
