'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Package, ArrowLeft, Upload, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

export default function NewProductPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '100',
    category: '',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=500', // 임시 기본 이미지
  });

  const categories = ['print', 'fashion', 'living', 'stationery', 'etc'];

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('로그인이 필요합니다');
      router.push('/login');
      return;
    }

    // 필수 필드 검증
    if (!formData.name || !formData.price || !formData.category) {
      toast.error('필수 항목을 모두 입력해주세요');
      return;
    }

    setIsSubmitting(true);

    try {
      // 먼저 사용자의 판매자 정보 가져오기
      const vendorsResponse = await fetch('/api/vendors');
      const vendorsData = await vendorsResponse.json();
      const vendor = vendorsData.vendors?.find((v: any) => v.ownerId === user.uid);

      if (!vendor) {
        throw new Error('판매자 정보를 찾을 수 없습니다');
      }

      // 상품 등록 (기존 /api/products POST 사용)
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || '상품 설명이 없습니다.',
          price: parseInt(formData.price),
          stock: parseInt(formData.stock),
          category: formData.category,
          thumbnail: formData.thumbnail,
          images: [formData.thumbnail],
          vendorId: vendor.id,
          vendorName: vendor.businessName,
          vendorType: 'marketplace',
          isActive: true,
          reviewCount: 0,
          rating: 0,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || '상품 등록에 실패했습니다');
      }

      toast.success('상품이 성공적으로 등록되었습니다!');
      router.push('/mypage/vendor/products');
    } catch (error: any) {
      console.error('Error creating product:', error);
      toast.error(error.message || '상품 등록 중 오류가 발생했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-amber-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => router.back()}
            className="mb-6 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl border-2 border-gray-200 transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            돌아가기
          </button>

          <div className="flex items-center gap-4 mb-2">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Package className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900">새 상품 등록</h1>
              <p className="text-gray-600">상품 정보를 입력하세요</p>
            </div>
          </div>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl p-8 shadow-xl border-2 border-gray-100"
        >
          <div className="space-y-6">
            {/* Product Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                상품명 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-colors"
                placeholder="예: AI 커스텀 티셔츠"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                상품 설명
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-colors resize-none"
                placeholder="상품에 대한 설명을 입력하세요..."
              />
            </div>

            {/* Price & Stock */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  가격 (원) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-colors"
                  placeholder="29900"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  재고 수량
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.stock}
                  onChange={(e) => handleInputChange('stock', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-colors"
                  placeholder="100"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                카테고리 <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-colors"
              >
                <option value="">카테고리 선택</option>
                <option value="print">인쇄물</option>
                <option value="fashion">패션</option>
                <option value="living">리빙</option>
                <option value="stationery">문구</option>
                <option value="etc">기타</option>
              </select>
            </div>

            {/* Thumbnail URL */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                썸네일 이미지 URL
              </label>
              <input
                type="url"
                value={formData.thumbnail}
                onChange={(e) => handleInputChange('thumbnail', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-colors"
                placeholder="https://example.com/image.jpg"
              />
              <p className="text-xs text-gray-500 mt-2">
                ※ 이미지 업로드 기능은 추후 추가 예정입니다. 현재는 URL을 직접 입력해주세요.
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-8 py-4 bg-gradient-to-r from-indigo-600 to-amber-500 hover:from-indigo-500 hover:to-amber-400 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                등록 중...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                상품 등록
              </>
            )}
          </button>
        </motion.form>
      </div>
    </div>
  );
}
