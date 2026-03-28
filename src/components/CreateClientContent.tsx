'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import OrderModal from './common/OrderModal';

interface Product {
  id: string;
  name: string;
  price: number;
  thumbnail: string;
  category: string;
  badge?: string;
}

const cardStyle = {
  background: '#ffffff',
  border: '1px solid #E5E7EB',
  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
};

export default function CreateClientContent({ products }: { products: Product[] }) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsGenerating(true);
      const url = URL.createObjectURL(file);
      setUploadedImage(url);
      
      // Simulate high-quality drafting process
      setTimeout(() => {
        setIsGenerating(false);
      }, 1500);
    }
  };

  const handleProductClick = (e: React.MouseEvent, product: Product) => {
    if (uploadedImage) {
      e.preventDefault();
      setSelectedProduct(product);
      setIsOrderModalOpen(true);
    }
  };

  const categories = [...new Set(products.map(p => p.category))];
  const filteredProducts = selectedCategory
    ? products.filter(p => p.category === selectedCategory)
    : products;

  return (
    <div className="min-h-[100dvh] bg-[#FAFAFA]">
      {/* Premium Hero Section */}
      <section className="relative pt-28 pb-16 lg:pt-36 lg:pb-24 overflow-hidden bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-bold mb-6 uppercase tracking-widest text-gray-600 bg-gray-50 border border-gray-200 shadow-sm"
              >
                {/* @ts-ignore */}
                <iconify-icon icon="solar:magic-stick-3-bold" />
                사진 1장으로 기획 끝
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-gray-900 leading-[1.1] mb-6 tracking-tighter" style={{ wordBreak: 'keep-all' }}>
                내 사진이 그대로<br />
                <span className="text-black">글로벌 굿즈로.</span>
              </h1>
              <p className="text-base text-gray-500 font-medium max-w-xl mb-10 leading-relaxed" style={{ wordBreak: 'keep-all' }}>
                복잡한 디자인 툴은 잊으세요. 원하는 사진만 올리면 AI가
                최적의 시안을 제안하고, 전문 생산 기지에서 프리미엄 굿즈로 제작합니다.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  className="hidden" 
                  accept="image/jpeg, image/png, image/webp"
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-4 bg-gray-900 text-white rounded-xl font-bold text-base flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl hover:-translate-y-1 active:scale-[0.98]"
                >
                  {/* @ts-ignore */}
                  <iconify-icon icon="solar:gallery-add-bold" class="text-xl" />
                  {uploadedImage ? '다른 사진으로 변경' : '사진 업로드하여 시작'}
                </button>
                <button 
                  onClick={() => {
                    setIsGenerating(true);
                    setTimeout(() => {
                      setUploadedImage('https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=80&w=1000');
                      setIsGenerating(false);
                    }, 1000);
                  }}
                  className="px-6 py-4 bg-white text-gray-900 border border-gray-200 rounded-xl font-bold text-base hover:bg-gray-50 hover:shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm"
                >
                  {/* @ts-ignore */}
                  <iconify-icon icon="solar:wand-magic-bold" class="text-gray-900 text-lg" />
                  샘플로 미리보기
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative aspect-square"
            >
              <img 
                src="/premium_goodzz_hero_shot_1774576377465.png"
                alt="Premium Goods Showcase"
                className="w-full h-full object-cover rounded-[48px] shadow-2xl border border-gray-100 animate-[float_6s_ease-in-out_infinite]"
                onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800" }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it works - Light Bento Mini Cards */}
      <section className="py-16 bg-[#FAFAFA]" style={{ borderBottom: '1px solid #E5E7EB' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: 'solar:gallery-bold', title: '디자인 업로드', desc: '사진 한 장이면 충분합니다' },
              { icon: 'solar:flashlight-bold', title: '실시간 시안 합성', desc: '모든 상품을 1초 만에 확인하세요' },
              { icon: 'solar:box-minimalistic-bold', title: '글로벌 주문 제작', desc: '전 세계 어디든 프리미엄 직배송' },
            ].map((item, i) => (
              <div key={item.title} className="flex flex-col gap-3 p-6 rounded-3xl group hover:shadow-md hover:-translate-y-1 transition-all duration-300 shadow-sm" style={cardStyle}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gray-50 border border-gray-100 shadow-inner group-hover:bg-white transition-colors">
                  {/* @ts-ignore */}
                  <iconify-icon icon={item.icon} class="text-3xl text-gray-900" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-500 font-medium text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Showcase Section (Visible after upload) */}
      <AnimatePresence>
        {uploadedImage && (
          <section className="py-24 overflow-hidden bg-white border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <header className="max-w-3xl mb-12 text-center mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-3">자동 시안 제안</p>
                  <h2 className="text-3xl md:text-5xl font-black text-gray-900 leading-tight mb-4 tracking-tight" style={{ wordBreak: 'keep-all' }}>
                    {isGenerating ? '시안을 생성하고 있어요...' : '방금 올린 사진으로 만든\n오늘의 추천 굿즈'}
                  </h2>
                </motion.div>
              </header>

              {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-24">
                  <div className="relative w-24 h-24 mb-6">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                      className="absolute inset-0 border-[4px] border-gray-100 border-t-gray-900 rounded-full"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      {/* @ts-ignore */}
                      <iconify-icon icon="solar:magic-stick-3-bold" class="text-3xl text-gray-900 animate-pulse" />
                    </div>
                  </div>
                  <p className="text-lg text-gray-500 font-bold animate-pulse">이미지 분석 및 프리미엄 시안 합성 중...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { name: '오버핏 코튼 티셔츠', category: '패션', bg: 'bg-gray-50', rotate: -1 },
                    { name: '세라믹 머그컵', category: '리빙', bg: 'bg-gray-100', rotate: 2 },
                    { name: '프리미엄 폰케이스', category: '액세서리', bg: 'bg-gray-50', rotate: -2 },
                  ].map((item, idx) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      className={`p-4 rounded-3xl group overflow-hidden shadow-lg hover:shadow-xl transition-all hover:-translate-y-1`}
                      style={cardStyle}
                    >
                      {/* Realistic Mockup Canvas */}
                      <div className={`aspect-[4/5] rounded-[24px] ${item.bg} border border-gray-200 mb-6 relative flex items-center justify-center p-8 overflow-hidden`}>
                        {/* Shadow underneath */}
                        <div className="absolute bottom-6 w-2/3 h-6 bg-black/10 blur-xl rounded-full" />
                        
                        {/* The Mockup Layer */}
                        <motion.div 
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.5 + idx * 0.1 }}
                          style={{ rotate: item.rotate }}
                          className="relative w-full h-full bg-white p-3 shadow-xl rounded-md border border-gray-200"
                        >
                          <img 
                            src={uploadedImage!} 
                            alt={item.name} 
                            className="w-full h-full object-cover opacity-95"
                          />
                          {/* Gloss & Texture Effect Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/40 pointer-events-none" />
                        </motion.div>
                        
                        {/* Floating Badge */}
                        <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-[10px] font-black text-gray-600 bg-white border border-gray-200 shadow-sm tracking-tighter">
                          AUTO-MOCKUP
                        </div>
                      </div>
                      
                      <div className="p-2">
                        <div className="mb-6">
                          <span className="text-gray-500 font-black text-[10px] uppercase tracking-widest block mb-1">{item.category}</span>
                          <h3 className="text-xl font-bold text-gray-900 leading-tight">{item.name}</h3>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <button 
                            onClick={() => {
                              const p = products.find(p => p.name.includes(item.category)) || products[0];
                              setSelectedProduct(p);
                              setIsOrderModalOpen(true);
                            }}
                            className="bg-gray-900 text-white py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-black shadow-md transition-all active:scale-[0.98]"
                          >
                            바로 주문
                          </button>
                          <Link 
                            href={`/editor/${(products.find(p => p.name.includes(item.category)) || products[0]).id}?imageUrl=${encodeURIComponent(uploadedImage!)}`}
                            className="bg-white text-gray-900 py-3.5 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-2 border border-gray-200 shadow-sm"
                          >
                            편집하기 
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </AnimatePresence>

      {/* Product Selector */}
      <section className="py-20 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center lg:text-left flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">어떤 굿즈에 입혀볼까요?</h2>
              <p className="text-gray-500 font-medium text-sm">원하는 상품을 선택하고 사진을 적용해보세요.</p>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap justify-center lg:justify-end gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm ${
                  !selectedCategory
                    ? 'bg-gray-900 text-white hover:bg-black'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                전체
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm ${
                    selectedCategory === cat
                      ? 'bg-gray-900 text-white hover:bg-black'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Mini Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map((product, i) => (
              <motion.div
                key={product.id}
                onClick={(e) => handleProductClick(e, product)}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 8) * 0.05 }}
                className="group cursor-pointer rounded-[24px] p-3 relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg shadow-sm"
                style={cardStyle}
              >
                <div className="relative aspect-square rounded-[16px] overflow-hidden bg-gray-50 border border-gray-100 mb-4 flex items-center justify-center p-6">
                  {uploadedImage ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative w-full h-full flex items-center justify-center"
                    >
                      <img 
                        src={uploadedImage} 
                        alt="Mockup Preview" 
                        className="w-3/4 h-3/4 object-cover shadow-2xl rounded-md border border-gray-200 rotate-[-2deg]"
                      />
                    </motion.div>
                  ) : (
                    <img src={product.thumbnail} alt={product.name} className="w-full h-full object-cover rounded-xl opacity-90 mix-blend-multiply transition-all duration-500 group-hover:scale-105" />
                  )}

                  {/* Hover Actions */}
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3">
                    <button 
                      onClick={(e) => handleProductClick(e, product)}
                      className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold text-sm hover:scale-105 transition-transform shadow-lg"
                    >
                      바로 주문
                    </button>
                    <Link 
                      href={`/editor/${product.id}${uploadedImage ? `?imageUrl=${encodeURIComponent(uploadedImage)}` : ''}`}
                      className="bg-white text-gray-900 px-6 py-3 rounded-xl font-bold text-sm border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
                    >
                      {uploadedImage ? '편집하기' : '커스텀 시작'}
                    </Link>
                  </div>
                </div>

                <div className="px-2 pb-2">
                  <p className="text-[10px] text-gray-500 font-black mb-1.5 uppercase tracking-widest">{product.category}</p>
                  <h3 className="font-bold text-gray-900 group-hover:text-black transition-colors line-clamp-1 mb-2 tracking-tight">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-black text-gray-900 tracking-tighter" style={{ fontFamily: "'Outfit',sans-serif" }}>
                      {product.price.toLocaleString()}<span className="text-xs font-bold text-gray-600 ml-0.5">원~</span>
                    </p>
                    <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center group-hover:bg-gray-900 group-hover:border-gray-900 group-hover:text-white transition-colors">
                      {/* @ts-ignore */}
                      <iconify-icon icon="solar:arrow-right-linear" class="text-sm" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {selectedProduct && uploadedImage && (
        <OrderModal 
          isOpen={isOrderModalOpen}
          onClose={() => setIsOrderModalOpen(false)}
          product={selectedProduct}
          customDesignUrl={uploadedImage}
        />
      )}
    </div>
  );
}
