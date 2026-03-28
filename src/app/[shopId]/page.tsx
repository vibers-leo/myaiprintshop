'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import OrderModal from '@/components/common/OrderModal';

// Mock data for Creator Shop
const SHOP_DATA = {
  id: 'my-studio',
  name: 'Studio M',
  handle: '@my-studio',
  description: '심플하고 모던한 감성을 담은 라이프스타일 굿즈',
  profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  bannerImage: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?auto=format&fit=crop&q=80&w=2000',
  isFollowing: false,
  followerCount: 1240,
  products: [
    { id: 'p_1', name: 'My Awesome Design T', price: 19000, category: 'Apparel', thumbnail: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800', likes: 128 },
    { id: 'p_2', name: 'Mug with Black Logo', price: 11000, category: 'Living', thumbnail: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&q=80&w=800', likes: 85 },
  ]
};

export default function CreatorShopPage({ params }: { params: { shopId: string } }) {
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  // In a real app, fetch data based on params.shopId
  const shop = SHOP_DATA;

  const handleProductClick = (product: any) => {
    setSelectedProduct(product);
    setIsOrderModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Shop Banner */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden bg-gray-100">
        <img src={shop.bannerImage} alt={`${shop.name} banner`} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent" />
      </div>

      {/* Shop Info Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 mt-[-64px] relative z-10">
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center md:items-start gap-8 text-center md:text-left">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md bg-gray-50 flex-shrink-0">
             <img src={shop.profileImage} alt={shop.name} className="w-full h-full object-cover" />
          </div>

          <div className="flex-1 mt-4 md:mt-0">
            <h1 className="text-3xl font-black text-gray-900 tracking-tighter mb-1">{shop.name}</h1>
            <p className="text-gray-500 font-bold text-sm mb-4">{shop.handle}</p>
            <p className="text-gray-600 font-medium mb-6 max-w-2xl">{shop.description}</p>
            
            <div className="flex items-center justify-center md:justify-start gap-6">
              <div className="text-center">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Products</p>
                <p className="text-lg font-black text-gray-900">{shop.products.length}</p>
              </div>
              <div className="w-px h-8 bg-gray-100"></div>
              <div className="text-center">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Followers</p>
                <p className="text-lg font-black text-gray-900">{shop.followerCount.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 min-w-[200px]">
            <button className="px-6 py-4 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-all shadow-md active:scale-95 flex items-center justify-center gap-2">
              {/* @ts-ignore */}
              <iconify-icon icon="solar:user-plus-bold" />
              스토어 팔로우
            </button>
            <button className="px-6 py-4 bg-white text-gray-900 border border-gray-200 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-2 shadow-sm">
              {/* @ts-ignore */}
              <iconify-icon icon="solar:share-bold" />
              스토어 공유하기
            </button>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black text-gray-900 tracking-tighter">모든 상품</h2>
          <div className="flex gap-2">
            {['전체', '의류', '리빙', '액세서리'].map((tab, i) => (
               <button key={tab} className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${i===0 ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 hover:bg-gray-50 shadow-sm border border-gray-100'}`}>
                 {tab}
               </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {shop.products.map((product, i) => (
            <motion.div
              key={product.id}
              onClick={() => handleProductClick(product)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-[24px] p-3 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all group cursor-pointer"
            >
              <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden mb-4 relative">
                <img src={product.thumbnail} alt={product.name} className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-500" />
                
                {/* Like Button */}
                <button 
                  onClick={(e) => { e.stopPropagation(); /* 찜하기 로직 */ }}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur shadow-sm flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors z-10"
                >
                  {/* @ts-ignore */}
                  <iconify-icon icon="solar:heart-bold" />
                </button>
              </div>
              <div className="px-2 pb-2">
                <div className="flex justify-between items-start mb-1">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest max-w-[70%] truncate">{product.category}</p>
                  <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold">
                     {/* @ts-ignore */}
                     <iconify-icon icon="solar:heart-bold" class="text-red-400" />
                     {product.likes}
                  </div>
                </div>
                <h3 className="font-bold text-sm text-gray-900 mb-2 truncate group-hover:text-black transition-colors">{product.name}</h3>
                <p className="font-black text-lg text-gray-900 font-display">₩{product.price.toLocaleString()}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {isOrderModalOpen && selectedProduct && (
        <OrderModal 
          isOpen={isOrderModalOpen}
          onClose={() => setIsOrderModalOpen(false)}
          product={selectedProduct}
          customDesignUrl={selectedProduct.thumbnail}
        />
      )}
    </div>
  );
}
