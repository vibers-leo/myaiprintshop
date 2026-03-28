'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Store } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
    basePrice?: number;
  };
  customDesignUrl: string;
}

export default function PublishModal({ isOpen, onClose, product, customDesignUrl }: PublishModalProps) {
  const [isPublishing, setIsPublishing] = useState(false);
  const [margin, setMargin] = useState<number>(3000);
  const [title, setTitle] = useState(product.name);
  const router = useRouter();

  const basePrice = product.basePrice || 15000; // Mock base price fallback

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !customDesignUrl) return;

    setIsPublishing(true);
    try {
      // Fake API call to save Creator Product
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Navigate back to studio
      router.push('/studio');
    } catch (error) {
      console.error('Publish error:', error);
      alert('출시 중 오류가 발생했습니다.');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[500px]"
          >
            {/* Left: Preview */}
            <div className="w-full md:w-1/2 bg-gray-50 flex flex-col items-center justify-center p-8 border-b md:border-b-0 md:border-r border-gray-100">
              <div className="aspect-square w-full max-w-[280px] bg-white rounded-2xl shadow-sm border border-gray-200 p-2 overflow-hidden mb-6">
                 <img src={customDesignUrl} alt="Design Preview" className="w-full h-full object-cover" />
              </div>
              <div className="text-center">
                <span className="text-primary-600 font-black text-[10px] uppercase tracking-widest block mb-1">Creator Store</span>
                <h3 className="text-xl font-black text-gray-900 leading-tight">{title || product.name}</h3>
              </div>
            </div>

            {/* Right: Publish Form */}
            <div className="w-full md:w-1/2 p-8 flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tighter">스토어에 출시하기</h2>
                  <p className="text-gray-500 font-bold text-xs mt-1">팬들에게 보여질 상품정보와 수익을 설정하세요.</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              <form className="space-y-6 flex-1 flex flex-col" onSubmit={handlePublish}>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">상품명</label>
                  <input 
                    type="text" 
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="상품 이름을 입력하세요" 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-50 outline-none font-bold text-sm text-gray-900 transition-all" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">수익금(마진) 설정</label>
                  <p className="text-[11px] text-gray-400 font-medium ml-1 mb-2">상품 1개 판매 시 크리에이터님께 정산되는 금액입니다.</p>
                  
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
                    <div className="flex justify-between items-center text-xs text-gray-500 font-bold">
                      <span>기본 제작 원가</span>
                      <span>₩{basePrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-bold text-gray-900">
                      <span>내 수익금 (마진)</span>
                      <div className="flex items-center gap-2">
                         <span className="text-gray-400">₩</span>
                         <input 
                           type="number" 
                           value={margin} 
                           onChange={(e) => setMargin(Number(e.target.value))}
                           className="w-24 px-3 py-1.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 text-right font-black"
                         />
                      </div>
                    </div>
                    <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                      <span className="text-sm font-black text-gray-900">팬들을 위한 최종 판매가</span>
                      <span className="text-xl font-black text-primary-600">₩{(basePrice + margin).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-6">
                  <button 
                    type="submit"
                    disabled={isPublishing}
                    className="w-full py-4 bg-gray-900 text-white rounded-xl font-black text-base flex items-center justify-center gap-2 hover:bg-black transition-all shadow-[0_12px_24px_-8px_rgba(0,0,0,0.2)] active:scale-[0.98] disabled:opacity-50"
                  >
                    {isPublishing ? (
                      <Loader2 className="w-5 h-5 animate-spin text-primary-500" />
                    ) : (
                      <Store className="w-5 h-5" />
                    )}
                    {isPublishing ? '스토어에 등록하는 중...' : '스토어에 출시하기'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
