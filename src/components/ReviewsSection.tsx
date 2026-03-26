'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, ShieldCheck } from 'lucide-react';

interface Review {
  id: string;
  userName: string;
  productName: string;
  rating: number;
  content: string;
  imageUrl?: string;
  images?: string[];
  createdAt: Date;
  isVerified: boolean;
}

export default function ReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { collection, getDocs, query, orderBy, limit } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');

        const reviewsQuery = query(
          collection(db, 'reviews'),
          orderBy('createdAt', 'desc'),
          limit(8)
        );

        const snapshot = await getDocs(reviewsQuery);
        const reviewsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        })) as Review[];

        setReviews(reviewsData);
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, []);

  // Star distribution calculations
  const { averageRating, totalCount, starDistribution } = useMemo(() => {
    if (reviews.length === 0) {
      return { averageRating: 0, totalCount: 0, starDistribution: [0, 0, 0, 0, 0] };
    }

    const dist = [0, 0, 0, 0, 0]; // index 0 = 1 star, index 4 = 5 stars
    let sum = 0;

    reviews.forEach(r => {
      const starIndex = Math.min(Math.max(Math.round(r.rating), 1), 5) - 1;
      dist[starIndex]++;
      sum += r.rating;
    });

    return {
      averageRating: sum / reviews.length,
      totalCount: reviews.length,
      starDistribution: dist,
    };
  }, [reviews]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  // 자동 슬라이드 (6초마다)
  useEffect(() => {
    if (reviews.length === 0) return;

    const interval = setInterval(() => {
      goToNext();
    }, 6000);

    return () => clearInterval(interval);
  }, [reviews.length, currentIndex]);

  if (isLoading) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">리뷰를 불러오는 중...</p>
        </div>
      </section>
    );
  }

  if (reviews.length === 0) {
    return null;
  }

  const currentReview = reviews[currentIndex];

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 섹션 헤더 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 text-primary-700 font-medium mb-4">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-sm">구매 인증 사장님 리뷰</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
            1,000+ 사장님이 선택했습니다
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            실제 굿쯔를 이용하신 사장님들의 생생한 후기를 확인해보세요
          </p>
        </div>

        {/* Star Distribution Chart */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-white rounded-3xl shadow-lg p-8 md:p-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              {/* Average Rating */}
              <div className="flex flex-col items-center justify-center text-center">
                <p className="text-6xl font-black text-gray-900 leading-none">
                  {averageRating.toFixed(1)}
                </p>
                <div className="flex items-center gap-1 mt-3 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= Math.round(averageRating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-gray-200 text-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-500 font-medium">
                  전체 리뷰 <span className="font-bold text-gray-900">{totalCount}</span>건
                </p>
              </div>

              {/* Star Distribution Bars */}
              <div className="md:col-span-2 space-y-2.5">
                {[5, 4, 3, 2, 1].map((starNum) => {
                  const count = starDistribution[starNum - 1];
                  const percentage = totalCount > 0 ? (count / totalCount) * 100 : 0;
                  return (
                    <div key={starNum} className="flex items-center gap-3">
                      <div className="flex items-center gap-1 w-16 shrink-0 justify-end">
                        <span className="text-sm font-bold text-gray-700">{starNum}</span>
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      </div>
                      <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.8, delay: (5 - starNum) * 0.1, ease: 'easeOut' }}
                          className={`h-full rounded-full ${
                            starNum >= 4
                              ? 'bg-primary-500'
                              : starNum === 3
                              ? 'bg-amber-400'
                              : 'bg-red-400'
                          }`}
                        />
                      </div>
                      <div className="w-16 shrink-0 text-right">
                        <span className="text-xs font-bold text-gray-500">
                          {count}건 ({Math.round(percentage)}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 리뷰 슬라이더 */}
        <div className="relative max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-3xl shadow-xl p-8 md:p-12"
            >
              <div className="grid md:grid-cols-2 gap-8 items-center">
                {/* 왼쪽: 리뷰 이미지 */}
                {currentReview.imageUrl && (
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100">
                    <img
                      src={currentReview.imageUrl}
                      alt={currentReview.productName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                      구매 인증
                    </div>
                  </div>
                )}

                {/* 오른쪽: 리뷰 내용 */}
                <div className={currentReview.imageUrl ? '' : 'md:col-span-2'}>
                  {/* 별점 */}
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < currentReview.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-gray-200 text-gray-200'
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-gray-600 font-medium">
                      {currentReview.rating}.0
                    </span>
                  </div>

                  {/* 리뷰 내용 */}
                  <p className="text-lg md:text-xl text-gray-800 leading-relaxed mb-6">
                    "{currentReview.content}"
                  </p>

                  {/* Review photos */}
                  {currentReview.images && currentReview.images.length > 0 && (
                    <div className="flex gap-2 mb-6">
                      {currentReview.images.map((imgUrl, idx) => (
                        <div key={idx} className="w-16 h-16 rounded-xl overflow-hidden border border-gray-100">
                          <img
                            src={imgUrl}
                            alt={`리뷰 사진 ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 사용자 정보 */}
                  <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                    <div>
                      <p className="font-bold text-gray-900">{currentReview.userName}</p>
                      <p className="text-sm text-gray-500">{currentReview.productName}</p>
                    </div>
                    <p className="text-sm text-gray-400">
                      {new Date(currentReview.createdAt).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* 네비게이션 버튼 */}
          <button
            onClick={goToPrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 w-12 h-12 rounded-full bg-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center group"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600 group-hover:text-primary-600 transition-colors" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 w-12 h-12 rounded-full bg-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center group"
          >
            <ChevronRight className="w-6 h-6 text-gray-600 group-hover:text-primary-600 transition-colors" />
          </button>

          {/* 점 네비게이션 */}
          <div className="flex justify-center gap-2 mt-8">
            {reviews.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`transition-all ${
                  index === currentIndex
                    ? 'w-8 h-2 bg-primary-600 rounded-full'
                    : 'w-2 h-2 bg-gray-300 rounded-full hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
