'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Mock data for base products
const BASE_PRODUCTS = [
  { id: 'bp_1', name: '스트릿 오버핏 티셔츠', basePrice: 15000, category: 'Apparel', thumbnail: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800' },
  { id: 'bp_2', name: '세라믹 스튜디오 머그', basePrice: 8000, category: 'Living', thumbnail: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&q=80&w=800' },
  { id: 'bp_3', name: '프리미엄 하드 케이스', basePrice: 12000, category: 'Accessory', thumbnail: 'https://images.unsplash.com/photo-1541560052-5e137f229371?auto=format&fit=crop&q=80&w=800' },
];

export default function StudioDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [selectedBase, setSelectedBase] = useState<any>(null);
  const [uploadedDesign, setUploadedDesign] = useState<string | null>(null);
  const router = useRouter();
  
  // Create Product Flow Steps
  const [step, setStep] = useState(1); // 1: Choose base

  const handleNextToEditor = () => {
    if (!selectedBase) return;
    // Go to powerful editor with creator mode
    router.push(`/editor/${selectedBase.id}?mode=creator`);
  };

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm">
          <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mb-2">이번 달 총 매출</p>
          <h3 className="text-3xl font-black text-gray-900 font-display">₩2,450,000</h3>
        </div>
        <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm">
          <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mb-2">정산 예정 금액 (마진)</p>
          <h3 className="text-3xl font-black text-primary-600 font-display">₩735,000</h3>
        </div>
        <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm">
          <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mb-2">등록된 상품 수</p>
          <h3 className="text-3xl font-black text-gray-900 font-display">12개</h3>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tighter mb-1">내 스토어 관리</h2>
            <p className="text-gray-500 text-sm font-medium">새로운 굿즈를 기획하거나 팬들에게 내 스토어를 공유해보세요.</p>
          </div>
          <div className="flex gap-3">
            <Link 
              href="/@my-studio" 
              className="px-6 py-3 bg-gray-50 text-gray-900 border border-gray-200 rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors flex items-center gap-2"
              target="_blank"
            >
              {/* @ts-ignore */}
              <iconify-icon icon="solar:shop-bold" />
              내 스토어 보기
            </Link>
            <button 
              onClick={() => setIsCreatingProduct(true)}
              className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-colors flex items-center gap-2 shadow-md"
            >
              {/* @ts-ignore */}
              <iconify-icon icon="solar:plus-circle-bold" />
              새 굿즈 만들기
            </button>
          </div>
        </div>

        {/* Empty State for Products / Recent Products list */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="aspect-square bg-gray-50 rounded-2xl border border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-100 transition-colors"
               onClick={() => setIsCreatingProduct(true)}>
            {/* @ts-ignore */}
            <iconify-icon icon="solar:add-square-bold" class="text-3xl mb-2" />
            <span className="text-sm font-bold">상품 등록하기</span>
          </div>
          {/* Example existing product */}
          <div className="aspect-[4/5] bg-white rounded-2xl border border-gray-100 p-2 shadow-sm group">
            <div className="w-full h-2/3 bg-gray-50 rounded-xl mb-3 overflow-hidden relative">
               <img src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800" alt="prod" className="w-full h-full object-cover" />
               <div className="absolute top-2 left-2 px-2 py-1 bg-white/90 backdrop-blur rounded-md text-[10px] font-black text-primary-600">판매중</div>
            </div>
            <div className="px-1">
              <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">스트릿 오버핏 티셔츠</p>
              <h4 className="font-bold text-gray-900 text-sm truncate mb-1">My Awesome Design T</h4>
              <p className="text-xs font-black text-gray-900">₩19,000 <span className="text-gray-400 font-medium">(마진 ₩4,000)</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCreateProduct = () => (
    <div className="max-w-4xl mx-auto bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden min-h-[600px] flex flex-col">
      {/* Header */}
      <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-tighter">새 굿즈 만들기</h2>
          <p className="text-gray-500 text-xs font-medium mt-1">디자인을 업로드하고 마진을 설정하여 바로 판매를 시작하세요.</p>
        </div>
        <button onClick={() => { setIsCreatingProduct(false); setStep(1); }} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          {/* @ts-ignore */}
          <iconify-icon icon="solar:close-circle-linear" class="text-2xl text-gray-400" />
        </button>
      </div>

      <div className="flex-1 p-8">
        {step === 1 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <h3 className="text-lg font-bold text-gray-900">1. 베이스 상품 선택</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {BASE_PRODUCTS.map(bp => (
                <div 
                  key={bp.id}
                  onClick={() => setSelectedBase(bp)}
                  className={`cursor-pointer rounded-2xl border-2 transition-all overflow-hidden ${selectedBase?.id === bp.id ? 'border-gray-900 shadow-md' : 'border-gray-100 hover:border-gray-300'}`}
                >
                  <div className="aspect-square bg-gray-50 relative">
                    <img src={bp.thumbnail} alt={bp.name} className="w-full h-full object-cover mix-blend-multiply" />
                  </div>
                  <div className="p-4 bg-white">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{bp.category}</span>
                    <h4 className="font-bold text-gray-900 text-sm mt-1">{bp.name}</h4>
                    <p className="text-xs text-gray-500 font-medium mt-1">기본 제작 원가: <span className="font-black text-gray-900">₩{bp.basePrice.toLocaleString()}</span></p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-end pt-6 mt-6 border-t border-gray-100">
              <button 
                disabled={!selectedBase}
                onClick={handleNextToEditor}
                className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold text-sm disabled:opacity-50 hover:bg-black transition-colors flex items-center justify-center gap-2"
              >
                다음: 디자인 에디터 열기
                {/* @ts-ignore */}
                <iconify-icon icon="solar:arrow-right-bold" />
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-28 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tighter">크리에이터 스튜디오</h1>
            <p className="text-gray-500 text-sm font-medium mt-1">디자인만 올리면 생산부터 배송, CS까지 모두 해결해드립니다.</p>
          </div>
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {isCreatingProduct ? (
            <motion.div
              key="create"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
            >
              {renderCreateProduct()}
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderDashboard()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
