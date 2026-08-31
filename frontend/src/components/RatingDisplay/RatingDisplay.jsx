import React, { memo } from 'react';
import { Star, StarHalf } from 'lucide-react';

const RatingDisplay = memo(({ rating = 0, reviewCount = 0, size = 'sm', showCount = true }) => {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  const sizes = {
    sm: 14,
    md: 18,
    lg: 22,
  };

  const iconSize = sizes[size];

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} size={iconSize} className="text-[#D4AF37] fill-[#D4AF37]" />
        ))}
        {hasHalf && <StarHalf size={iconSize} className="text-[#D4AF37] fill-[#D4AF37]" />}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} size={iconSize} className="text-gray-200" />
        ))}
      </div>
      {showCount && (
        <span className={`text-gray-400 ${size === 'lg' ? 'text-base' : 'text-xs'}`}>
          ({reviewCount})
        </span>
      )}
    </div>
  );
});

RatingDisplay.displayName = 'RatingDisplay';

export default RatingDisplay;
