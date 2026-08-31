import React, { memo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = memo(({ currentPage = 1, totalPages = 1, onPageChange }) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);

      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-2 mt-14 rounded-full bg-white/75 border border-[#e3d8c5] w-fit mx-auto p-2 shadow-[0_12px_35px_rgba(48,27,47,0.07)] backdrop-blur">
      <button
        onClick={() => onPageChange?.(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2.5 rounded-full border border-[#E7DFD3] text-gray-600 hover:bg-[#301b2f] hover:text-white hover:border-[#301b2f] disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-600 disabled:hover:border-gray-200 transition-all duration-200"
      >
        <ChevronLeft size={18} />
      </button>

      {getPageNumbers().map((page, i) =>
        page === '...' ? (
          <span key={`dots-${i}`} className="px-2 text-gray-400">
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange?.(page)}
            className={`min-w-[40px] h-10 rounded-full font-medium text-sm transition-all duration-200 ${
              page === currentPage
                ? 'bg-gradient-to-br from-[#241421] to-[#5a304f] text-white shadow-[0_8px_18px_rgba(48,27,47,0.2)]'
                : 'border border-[#E7DFD3] text-gray-600 hover:bg-[#301b2f] hover:text-white hover:border-[#301b2f]'
            }`}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange?.(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2.5 rounded-full border border-[#E7DFD3] text-gray-600 hover:bg-[#301b2f] hover:text-white hover:border-[#301b2f] disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-600 disabled:hover:border-gray-200 transition-all duration-200"
      >
        <ChevronRight size={18} />
      </button>
    </nav>
  );
});

Pagination.displayName = 'Pagination';

export default Pagination;
