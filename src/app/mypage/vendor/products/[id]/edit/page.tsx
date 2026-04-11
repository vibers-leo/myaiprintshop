'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Package, ArrowLeft, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import ProductForm, { type ProductFormData } from '@/components/vendor/ProductForm';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const { user } = useAuth();

  const [initialData, setInitialData] = useState<Partial<ProductFormData> | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!productId) return;
    fetch(`/api/products/${productId}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data.success || !data.product) {
          toast.error('상품을 찾을 수 없습니다.');
          router.push('/mypage/vendor/products');
          return;
        }
        const p = data.product;
        setInitialData({
          name: p.name || '',
          description: p.description || '',
          price: p.price || 0,
          originalPrice: p.originalPrice || 0,
          stock: p.stock ?? 100,
          category: p.category || '',
          images: p.images || (p.thumbnail ? [p.thumbnail] : []),
          tags: p.tags || [],
          options: p.options || { groups: [] },
          volumePricing: p.volumePricing || [],
          isActive: p.isActive ?? true,
        });
      })
      .catch(() => {
        toast.error('상품 정보를 불러올 수 없습니다.');
        router.push('/mypage/vendor/products');
      })
      .finally(() => setLoading(false));
  }, [productId, router]);

  async function handleSubmit(data: ProductFormData) {
    const res = await fetch(`/api/products/${productId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        thumbnail: data.images[0] || '',
      }),
    });

    const result = await res.json();
    if (!result.success) throw new Error(result.error || '수정에 실패했습니다');

    toast.success('상품이 수정되었습니다!');
    router.push('/mypage/vendor/products');
  }

  async function handleDelete() {
    if (!confirm('정말 이 상품을 삭제하시겠습니까?')) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/products/${productId}`, { method: 'DELETE' });
      const result = await res.json();
      if (!result.success) throw new Error(result.error);
      toast.success('상품이 삭제되었습니다.');
      router.push('/mypage/vendor/products');
    } catch (err: any) {
      toast.error(err.message || '삭제에 실패했습니다.');
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!initialData) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-amber-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl border-2 border-gray-200 transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> 돌아가기
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-xl border-2 border-red-200 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              {deleting ? '삭제 중...' : '상품 삭제'}
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Package className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900">상품 수정</h1>
              <p className="text-gray-600">{initialData.name}</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <ProductForm initialData={initialData} onSubmit={handleSubmit} submitLabel="변경사항 저장" />
        </motion.div>
      </div>
    </div>
  );
}
