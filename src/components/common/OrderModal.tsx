'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Globe, CreditCard, Loader2, ShoppingBag } from 'lucide-react';
import { createOrder } from '@/lib/orders';
import { useRouter } from 'next/navigation';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
    price: number;
    thumbnail: string;
    category: string;
  };
  customDesignUrl: string;
}

export default function OrderModal({ isOpen, onClose, product, customDesignUrl }: OrderModalProps) {
  const [isOrdering, setIsOrdering] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
  });
  const router = useRouter();

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !customDesignUrl) return;

    setIsOrdering(true);
    try {
      const orderData = {
        userId: 'guest-user',
        items: [{
          productId: product.id,
          productName: product.name,
          name: product.name,
          thumbnail: product.thumbnail,
          quantity: 1,
          price: product.price,
          options: {
            customDesign: customDesignUrl,
          }
        }],
        totalAmount: product.price,
        shippingFee: 3000,
        shippingInfo: {
          name: formData.name,
          phone: formData.phone,
          email: 'guest@example.com',
          address: formData.address,
          addressDetail: '',
          postalCode: '12345',
        },
        paymentStatus: 'PENDING' as any,
        orderStatus: 'PENDING' as any,
      };

      const orderId = await createOrder(orderData);
      if (!orderId) throw new Error('주문 생성 실패');

      const response = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId: `test-${Date.now()}`,
          orderId: orderId,
        }),
      });

      if (!response.ok) throw new Error('결제 검증 실패');
      
      router.push(`/order-success/${orderId}`);
    } catch (error) {
      console.error('Order error:', error);
      alert('주문 처리 중 오류가 발생했습니다.');
    } finally {
      setIsOrdering(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-5xl bg-white rounded-[32px] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col md:flex-row min-h-[600px] max-h-[90vh]"
          >
            {/* Left: Premium Preview */}
            <div className="w-full md:w-[45%] bg-gray-50/50 p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(var(--primary-500-rgb),0.05)_0%,transparent_100%)]" />
              
              <motion.div 
                initial={{ rotate: -5, scale: 0.8, opacity: 0 }}
                animate={{ rotate: -2, scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="relative aspect-square w-full max-w-sm rounded-[24px] overflow-hidden bg-white shadow-[0_24px_48px_-12px_rgba(0,0,0,0.1)] border border-white p-4 group"
              >
                 <div className="absolute inset-0 bg-gradient-to-tr from-gray-100/20 to-transparent pointer-events-none" />
                 <img 
                   src={customDesignUrl} 
                   alt="Final Mockup" 
                   className="w-full h-full object-cover rounded-[16px]"
                 />
                 <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-[24px]" />
              </motion.div>

              <div className="mt-8 text-center relative z-10">
                <span className="text-primary-600 font-black text-[10px] uppercase tracking-[0.3em] mb-2 block">{product.category}</span>
                <h3 className="text-2xl font-display font-black text-gray-900 leading-tight tracking-tighter">{product.name}</h3>
                <div className="mt-4 flex items-center justify-center gap-2 text-gray-400 text-xs font-bold">
                   <Globe className="w-4 h-4" /> Global Worldwide Shipping
                </div>
              </div>
            </div>

            {/* Right: Checkout Form (Clean & Modern) */}
            <div className="w-full md:w-[55%] p-8 overflow-y-auto flex flex-col">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-2xl font-display font-black text-gray-900 tracking-tighter">주문하기</h2>
                  <p className="text-gray-400 font-bold text-xs mt-2">안전하고 빠른 글로벌 배송 서비스를 제공합니다.</p>
                </div>
                <button 
                  onClick={onClose}
                  className="p-3 hover:bg-gray-100 rounded-full transition-all active:scale-90"
                >
                  <X className="w-7 h-7 text-gray-400" />
                </button>
              </div>

              <form className="space-y-6 flex-1" onSubmit={handleSubmitOrder}>
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">수령인</label>
                      <input 
                        type="text" 
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="이름을 입력하세요" 
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-50 outline-none font-bold text-sm text-gray-900 transition-all placeholder:text-gray-400" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">연락처</label>
                      <input 
                        type="text" 
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="010-0000-0000" 
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-50 outline-none font-bold text-sm text-gray-900 transition-all placeholder:text-gray-400" 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">배송지 주소</label>
                    <textarea 
                      rows={3} 
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="도로명 주소와 상세 주소를 입력하세요" 
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-50 outline-none font-bold text-sm text-gray-900 transition-all placeholder:text-gray-400 resize-none"
                    ></textarea>
                  </div>
                </div>

                <div className="mt-auto pt-8 border-t border-gray-100">
                  <div className="flex justify-between items-center mb-6 px-1">
                    <span className="text-gray-400 font-bold">결제할 총 금액 (배송비 포함)</span>
                    <span className="text-3xl font-display font-black text-gray-900 tracking-tighter">
                      {(product.price + 3000).toLocaleString()} <span className="text-lg font-bold">원</span>
                    </span>
                  </div>
                  <button 
                    type="submit"
                    disabled={isOrdering}
                    className="w-full py-5 bg-gray-900 text-white rounded-[20px] font-black text-lg flex items-center justify-center gap-3 hover:bg-black transition-all shadow-[0_20px_40px_-12px_rgba(0,0,0,0.2)] active:scale-[0.98] disabled:opacity-50"
                  >
                    {isOrdering ? (
                      <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
                    ) : (
                      <CreditCard className="w-6 h-6" />
                    )}
                    {isOrdering ? '결제 및 주문을 생성하는 중...' : '결제하고 주문 완료하기'}
                  </button>
                  <p className="text-center text-[11px] text-gray-400 font-bold mt-4">
                    결제 시 GOODZZ 이용약관 및 개인정보 처리방침에 동의하는 것으로 간주됩니다.
                  </p>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
