import React, { memo } from 'react';

const SkeletonLoader = memo(({ type = 'card', count = 1 }) => {
  const renderCardSkeleton = () => (
    <div className="animate-pulse premium-card p-4">
      <div className="aspect-[4/5] rounded-[12px] shimmer" />
      <div className="mt-5 space-y-3">
        <div className="h-2 w-16 rounded shimmer" />
        <div className="h-4 w-3/4 rounded shimmer" />
        <div className="h-5 w-1/2 rounded shimmer" />
      </div>
    </div>
  );

  const renderLineSkeleton = () => (
    <div className="animate-pulse flex items-center gap-5 p-5 premium-card">
      <div className="w-24 h-24 rounded-[12px] shimmer flex-shrink-0" />
      <div className="flex-1 space-y-3">
        <div className="h-3 w-20 rounded shimmer" />
        <div className="h-4 w-3/4 rounded shimmer" />
        <div className="h-5 w-1/3 rounded shimmer" />
      </div>
    </div>
  );

  const renderDetailSkeleton = () => (
    <div className="animate-pulse grid grid-cols-1 lg:grid-cols-2 gap-10">
      <div className="space-y-4">
        <div className="aspect-square rounded-[16px] shimmer" />
        <div className="flex gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-20 h-20 rounded-[12px] shimmer" />
          ))}
        </div>
      </div>
      <div className="space-y-5 pt-4">
        <div className="h-3 w-24 rounded shimmer" />
        <div className="h-8 w-3/4 rounded shimmer" />
        <div className="h-6 w-1/3 rounded shimmer" />
        <div className="space-y-3 mt-8">
          <div className="h-4 w-full rounded shimmer" />
          <div className="h-4 w-full rounded shimmer" />
          <div className="h-4 w-2/3 rounded shimmer" />
        </div>
        <div className="h-14 w-full rounded-[12px] shimmer mt-8" />
        <div className="h-14 w-full rounded-[12px] shimmer" />
      </div>
    </div>
  );

  const renderCategorySkeleton = () => (
    <div className="animate-pulse">
      <div className="aspect-[4/5] rounded-[16px] shimmer" />
    </div>
  );

  const skeletonMap = {
    card: renderCardSkeleton,
    line: renderLineSkeleton,
    detail: renderDetailSkeleton,
    category: renderCategorySkeleton,
  };

  const render = skeletonMap[type] || renderCardSkeleton;

  return (
    <>
      {[...Array(count)].map((_, i) => (
        <div key={i} className="h-full">{render()}</div>
      ))}
    </>
  );
});

SkeletonLoader.displayName = 'SkeletonLoader';

export default SkeletonLoader;
