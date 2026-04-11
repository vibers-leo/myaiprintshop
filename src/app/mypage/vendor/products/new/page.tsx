'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Package, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import ProductForm, { type ProductFormData } from '@/components/vendor/ProductForm';

export default function NewProductPage() {
  const router = useRouter();
  const { user } = useAuth();

  async function handleSubmit(data: ProductFormData) {
    if (!user) {
      toast.error('로그인이 필요합니다');
      router.push('/login');
      return;
    }

    const vendorsRes = await fetch('/api/vendors');
    const vendorsData = await vendorsRes.json();
    const vendor = vendorsData.vendors?.find((v: any) => v.ownerId === user.uid);

    if (!vendor) {
      toast.error('판매자 정보를 찾을 수 없습니다');
      return;
    }

    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        thumbnail: data.images[0],
        vendorId: vendor.id,
        vendorName: vendor.businessName,
        vendorType: 'marketplace',
        reviewCount: 0,
        rating: 0,
      }),
    });

    const result = await res.json();
    if (!result.success) throw new Error(result.error || '상품 등록에 실패했습니다');

    toast.success('상품이 등록되었습니다!');
    router.push('/mypage/vendor/products');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-amber-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <button
            onClick={() => router.back()}
            className="mb-6 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl border-2 border-gray-200 transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> 돌아가기
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Package className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900">새 상품 등록</h1>
              <p className="text-gray-600">상품 정보를 입력하고 이미지를 업로드하세요</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <ProductForm onSubmit={handleSubmit} submitLabel="상품 등록" />
        </motion.div>
      </div>
    </div>
  );
}
