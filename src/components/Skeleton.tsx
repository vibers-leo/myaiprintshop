'use client';

import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({
  className = '',
  variant = 'rectangular',
  animation = 'pulse',
}: SkeletonProps) {
  const baseClasses = 'bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]';

  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const animationVariants = {
    pulse: {
      opacity: [0.6, 1, 0.6],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: [0.4, 0, 0.2, 1] as const, // easeInOut cubic-bezier
      },
    },
    wave: {
      backgroundPosition: ['0% 0%', '200% 0%'],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: [0, 0, 1, 1] as const, // linear cubic-bezier
      },
    },
    none: {},
  } as const;

  return (
    <motion.div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      animate={animationVariants[animation]}
    />
  );
}

// 상품 카드 스켈레톤
export function ProductCardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-square w-full" animation="wave" />
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-6 w-24" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4" variant="circular" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  );
}

// 상품 그리드 스켈레톤
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

// 상품 상세 페이지 스켈레톤
export function ProductDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
      {/* 이미지 영역 */}
      <div className="space-y-4">
        <Skeleton className="aspect-square w-full rounded-2xl" animation="wave" />
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square w-full rounded-xl" />
          ))}
        </div>
      </div>

      {/* 정보 영역 */}
      <div className="space-y-6">
        <div className="space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-6 w-3/4" />
        </div>

        <div className="space-y-3">
          <Skeleton className="h-6 w-32" />
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Skeleton className="h-6 w-24" />
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-2xl" />
            ))}
          </div>
        </div>

        <Skeleton className="h-14 w-full rounded-2xl" />

        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-14 rounded-3xl" />
          <Skeleton className="h-14 rounded-3xl" />
        </div>
      </div>
    </div>
  );
}

// 리스트 아이템 스켈레톤
export function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4">
      <Skeleton className="w-12 h-12" variant="circular" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <Skeleton className="h-8 w-20 rounded-full" />
    </div>
  );
}

// 검색 바 스켈레톤
export function SearchBarSkeleton() {
  return (
    <Skeleton className="h-14 w-full rounded-2xl" animation="pulse" />
  );
}

// 배너 스켈레톤
export function BannerSkeleton() {
  return (
    <div className="w-full h-[400px] bg-gray-100 rounded-2xl overflow-hidden relative">
      <Skeleton className="absolute inset-0" animation="wave" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full max-w-2xl px-8 space-y-4">
          <Skeleton className="h-8 w-24 mx-auto" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-12 w-48 mx-auto rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default Skeleton;
