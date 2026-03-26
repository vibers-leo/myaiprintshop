'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Wand2, ShoppingBag, ArrowRight, Palette, Layers, Zap } from 'lucide-react';
import Link from 'next/link';
import { X, Globe, CreditCard } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

interface Product {
  id: string;
  name: string;
  price: number;
  thumbnail: string;
  category: string;
  badge?: string;
}

const AI_STYLES = [
  { id: 'Artistic', name: '예술적', icon: '🎨', desc: '유화/일러스트 스타일' },
  { id: 'Watercolor', name: '수채화', icon: '💧', desc: '부드러운 수채화 느낌' },
  { id: 'Cyberpunk', name: '사이버펑크', icon: '🌃', desc: '네온/미래 감성' },
  { id: 'Minimalist', name: '미니멀', icon: '▫️', desc: '깔끔한 라인 아트' },
  { id: '3D Render', name: '3D 렌더링', icon: '🧊', desc: '입체적인 3D 스타일' },
  { id: 'Pixar Style', name: '디즈니 풍', icon: '🧸', desc: '친근한 캐릭터 스타일' },
];

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
    <>
      {/* Hero Section */}
      <section className="pt-32 pb-24 bg-gray-50 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white text-gray-700 rounded border border-gray-200 text-sm font-bold mb-6">
              <Sparkles className="w-4 h-4 text-primary-600" />
              사진 1장 = 모든 굿즈
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight">
              내 사진을 그대로{' '}
              <span className="text-primary-600">
                글로벌 굿즈
              </span>로
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10 font-medium leading-relaxed">
              복잡한 디자인 툴은 잊으세요. 원하는 사진만 올리면<br className="hidden sm:block" />
              어떤 상품이든 찰떡같이 입혀서 전 세계로 배송해 드립니다.
            </p>
            <div className="flex justify-center flex-col sm:flex-row gap-4 mb-4">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                className="hidden" 
                accept="image/jpeg, image/png, image/webp"
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-primary btn-lg flex items-center justify-center gap-2 font-bold px-8"
              >
                <Palette className="w-5 h-5" />
                {uploadedImage ? '다른 사진으로 변경하기' : '사진 갤러리에서 업로드 (JPG, PNG)'}
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">
            3단계로 완성하는 나만의 굿즈
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Palette, step: '01', title: '사진 업로드', desc: '굿즈로 만들고 싶은 사진을 한 장 골라주세요', color: 'primary' },
              { icon: Wand2, step: '02', title: '자동 합성 미리보기', desc: '모든 굿즈에 내 사진이 자동 적용됩니다', color: 'secondary' },
              { icon: ShoppingBag, step: '03', title: '글로벌 주문 🚀', desc: '전 세계 어디든 빠르고 안전하게 배송해드려요', color: 'accent' },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
                  item.color === 'primary' ? 'bg-primary-100' :
                  item.color === 'secondary' ? 'bg-secondary-100' : 'bg-accent-100'
                }`}>
                  <item.icon className={`w-7 h-7 ${
                    item.color === 'primary' ? 'text-primary-600' :
                    item.color === 'secondary' ? 'text-secondary-600' : 'text-accent-600'
                  }`} />
                </div>
                <div className="text-xs font-bold text-gray-400 mb-2">STEP {item.step}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>



      {/* Draft Showcase Section (Visible after upload) */}
      <AnimatePresence>
        {uploadedImage && (
          <section className="py-20 bg-gradient-to-b from-primary-50/30 to-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
                <div className="max-w-xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-bold mb-4">
                    <Zap className="w-3 h-3" /> AUTO-MOCKUP ENGINE
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight">
                    {isGenerating ? '시안을 생성하고 있어요...' : '방금 올린 사진으로 만든\n오늘의 추천 굿즈 시안'}
                  </h2>
                </div>
                {!isGenerating && (
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 text-primary-600 font-bold hover:text-primary-700 transition-colors"
                  >
                    <Palette className="w-4 h-4" /> 다른 사진으로 시안 보기
                  </button>
                )}
              </div>

              {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="relative w-24 h-24 mb-6">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                      className="absolute inset-0 border-4 border-primary-100 border-t-primary-600 rounded-full"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-primary-500 animate-pulse" />
                    </div>
                  </div>
                  <p className="text-gray-400 font-medium animate-pulse">이미지 분석 및 시안 합성 중...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    { name: '오버핏 코튼 티셔츠', category: '의류', theme: 'bg-blue-50', rotate: -1 },
                    { name: '세라믹 머그컵 (350ml)', category: '주방', theme: 'bg-green-50', rotate: 2 },
                    { name: '프리미엄 폰케이스', category: '액세서리', theme: 'bg-purple-50', rotate: -2 },
                  ].map((item, idx) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`${item.theme} rounded-[2.5rem] p-10 flex flex-col items-center justify-center min-h-[400px] border border-white shadow-xl relative group overflow-hidden`}
                    >
                      {/* Realistic Mockup Visualization */}
                      <div className="relative w-full aspect-square mb-8 flex items-center justify-center">
                        {/* Shadow underneath */}
                        <div className="absolute bottom-4 w-3/4 h-8 bg-black/5 blur-2xl rounded-full" />
                        
                        {/* Mockup Base */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-5 select-none pointer-events-none">
                           <ShoppingBag className="w-48 h-48 text-gray-900" />
                        </div>

                        {/* The Drafted Image */}
                        <motion.div 
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.3 + idx * 0.1 }}
                          style={{ rotate: item.rotate }}
                          className="relative w-4/5 h-4/5 bg-white p-2 shadow-[-10px_20px_40px_rgba(0,0,0,0.1)] rounded-sm border-[12px] border-white ring-1 ring-gray-100"
                        >
                          <img 
                            src={uploadedImage!} 
                            alt={item.name} 
                            className="w-full h-full object-cover mix-blend-multiply opacity-90 shadow-inner"
                          />
                          {/* Gloss effect overlay */}
                          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/20 pointer-events-none" />
                        </motion.div>
                      </div>
                      
                      <div className="text-center">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{item.category}</span>
                        <h3 className="text-xl font-black text-gray-900 mt-1 mb-4">{item.name}</h3>
                        <button 
                          onClick={() => {
                            const p = products.find(p => p.name.includes(item.category)) || products[0];
                            setSelectedProduct(p);
                            setIsOrderModalOpen(true);
                          }}
                          className="bg-white px-6 py-3 rounded-full text-sm font-bold text-gray-900 shadow-lg hover:shadow-xl transition-all border border-gray-50 flex items-center gap-2 group-hover:scale-110 active:scale-95"
                        >
                          이 시안으로 주문 <ArrowRight className="w-4 h-4" />
                        </button>
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
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold text-gray-900">어떤 굿즈에 입혀볼까요?</h2>
          <p className="text-gray-500 mt-2">업로드한 사진이 아래 선택한 상품에 자동으로 입혀집니다.</p>
        </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                !selectedCategory
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              전체
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                  selectedCategory === cat
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map((product, i) => (
              <div key={product.id}>
                <motion.div
                  onClick={(e) => handleProductClick(e, product)}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.03 }}
                  className="group cursor-pointer"
                >
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-3">
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100 group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center p-6">
                      {uploadedImage ? (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="relative w-full h-full flex items-center justify-center"
                        >
                          {/* Mockup Base Background (Placeholder icon) */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-10">
                            <ShoppingBag className="w-24 h-24 text-gray-400" />
                          </div>
                          
                          {/* Image placed on the product */}
                          <div className="relative w-3/4 h-3/4 shadow-2xl rounded-sm overflow-hidden border-4 border-white rotate-[-2deg]">
                            <img 
                              src={uploadedImage} 
                              alt="Mockup Preview" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </motion.div>
                      ) : (
                        <div className="w-16 h-16 bg-white/80 rounded-2xl flex items-center justify-center shadow-sm">
                          <ShoppingBag className="w-8 h-8 text-primary-500" />
                        </div>
                      )}
                    </div>
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-primary-600/0 group-hover:bg-primary-600/80 transition-all duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center">
                        <Wand2 className="w-8 h-8 text-white mx-auto mb-2" />
                        <span className="text-white font-bold text-sm">
                          {uploadedImage ? '글로벌 주문하기' : 'AI 보정 & 제작'}
                        </span>
                      </div>
                    </div>
                    {product.badge && (
                      <span className={`absolute top-3 left-3 px-2 py-1 rounded-md text-xs font-bold text-white z-10 ${
                        product.badge === 'BEST' ? 'bg-primary-500' :
                        product.badge === 'HOT' ? 'bg-red-500' :
                        product.badge === 'NEW' ? 'bg-blue-500' : 'bg-gray-500'
                      }`}>
                        {product.badge}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-primary-600 font-medium mb-1">{product.category}</p>
                    <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-lg font-bold text-gray-900 mt-1">
                      {product.price.toLocaleString()}원~
                    </p>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Global Order Modal */}
      <AnimatePresence>
        {isOrderModalOpen && selectedProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOrderModalOpen(false)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
            >
              {/* Left: Preview */}
              <div className="w-full md:w-1/2 bg-gray-50 p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-100">
                <div className="relative aspect-square w-full max-w-sm rounded-2xl overflow-hidden bg-white shadow-inner border border-gray-100 p-8">
                   <div className="absolute inset-0 flex items-center justify-center opacity-5">
                      <ShoppingBag className="w-32 h-32 text-gray-400" />
                   </div>
                   <div className="relative w-full h-full flex items-center justify-center border-4 border-white shadow-xl rotate-[-2deg]">
                      <img 
                        src={uploadedImage!} 
                        alt="Final Mockup" 
                        className="w-full h-full object-cover"
                      />
                   </div>
                </div>
                <div className="mt-6 text-center">
                  <span className="text-primary-600 font-bold text-sm uppercase tracking-widest">{selectedProduct.category}</span>
                  <h3 className="text-2xl font-black text-gray-900 mt-1">{selectedProduct.name}</h3>
                </div>
              </div>

              {/* Right: Checkout Form */}
              <div className="w-full md:w-1/2 p-8 overflow-y-auto">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">Global Order</h2>
                    <p className="text-gray-500 text-sm mt-1">전 세계 어디든 5~7일 내에 도착합니다.</p>
                  </div>
                  <button 
                    onClick={() => setIsOrderModalOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6 text-gray-400" />
                  </button>
                </div>

                <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); alert('Global Order Placed!'); setIsOrderModalOpen(false); }}>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                       <Globe className="w-4 h-4 text-primary-500" /> Shipping Country
                    </label>
                    <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none font-medium">
                      <option>South Korea (KR)</option>
                      <option>United States (US)</option>
                      <option>Japan (JP)</option>
                      <option>Germany (DE)</option>
                      <option>United Kingdom (GB)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Recipient Name</label>
                      <input type="text" placeholder="John Doe" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-medium" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Phone</label>
                      <input type="text" placeholder="+82 10..." className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-medium" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Detailed Address</label>
                    <textarea rows={2} placeholder="Street, Apartment, City, State, Zip" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-medium resize-none"></textarea>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-gray-500 font-medium">Total Amount</span>
                      <span className="text-2xl font-black text-gray-900">{(selectedProduct.price).toLocaleString()}원</span>
                    </div>
                    <button className="w-full py-4 bg-primary-600 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/20">
                      <CreditCard className="w-6 h-6" />
                      Checkout and Order
                    </button>
                    <p className="text-center text-xs text-gray-400 mt-4 leading-relaxed">
                      By clicking the button, you agree to GOODZZ's <br />
                      Terms of Service and Global Shipping Policy.
                    </p>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
