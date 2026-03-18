'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Package,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { Product } from '@/lib/products';
import { Vendor } from '@/types/vendor';
import Image from 'next/image';

export default function VendorProductsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    if (!authLoading && !user) {
      toast.error('로그인이 필요합니다');
      router.push('/login');
      return;
    }

    if (user) {
      fetchVendorAndProducts();
    }
  }, [user, authLoading, activeFilter]);

  const fetchVendorAndProducts = async () => {
    try {
      // 판매자 정보 조회
      const vendorsResponse = await fetch('/api/vendors');
      const vendorsData = await vendorsResponse.json();

      const userVendor = vendorsData.vendors?.find((v: Vendor) => v.ownerId === user?.uid);

      if (!userVendor) {
        toast.error('판매자 정보를 찾을 수 없습니다');
        router.push('/mypage/vendor/apply');
        return;
      }

      setVendor(userVendor);

      // 상품 목록 조회
      let url = `/api/vendors/${userVendor.id}/products`;
      if (activeFilter !== 'all') {
        url += `?isActive=${activeFilter === 'active'}`;
      }

      const productsResponse = await fetch(url);
      const productsData = await productsResponse.json();

      if (productsData.success) {
        setProducts(productsData.products);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('데이터를 불러오는 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-amber-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900 mb-2">상품 관리</h1>
              <p className="text-gray-600">
                {vendor?.businessName} - 총 {products.length}개 상품
              </p>
            </div>
            <button
              onClick={() => router.push('/mypage/vendor/products/new')}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-amber-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              상품 등록
            </button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4 flex-wrap">
            {/* Search */}
            <div className="flex-1 min-w-[250px]">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="상품 검색..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              {[
                { id: 'all', label: '전체' },
                { id: 'active', label: '활성' },
                { id: 'inactive', label: '비활성' },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id as any)}
                  className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                    activeFilter === filter.id
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md'
                      : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-3xl p-16 text-center shadow-xl border-2 border-gray-100"
          >
            <Package className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">등록된 상품이 없습니다</h3>
            <p className="text-gray-600 mb-8">첫 상품을 등록하고 판매를 시작하세요!</p>
            <button
              onClick={() => router.push('/mypage/vendor/products/new')}
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-amber-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              상품 등록하기
            </button>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl overflow-hidden shadow-lg border-2 border-gray-100 hover:border-indigo-300 transition-all group"
              >
                {/* Product Image */}
                <div className="relative h-48 bg-gray-100">
                  <Image
                    src={product.thumbnail}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    {product.isActive ? (
                      <div className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        활성
                      </div>
                    ) : (
                      <div className="px-3 py-1 bg-gray-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        비활성
                      </div>
                    )}
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-5">
                  <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-2xl font-extrabold text-indigo-600 mb-4">
                    {product.price.toLocaleString()}원
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <span>재고: {product.stock}개</span>
                    <span>⭐ {product.rating.toFixed(1)} ({product.reviewCount})</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/shop/${product.id}`)}
                      className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      보기
                    </button>
                    <button
                      onClick={() => router.push(`/mypage/vendor/products/${product.id}/edit`)}
                      className="flex-1 px-4 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      수정
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
