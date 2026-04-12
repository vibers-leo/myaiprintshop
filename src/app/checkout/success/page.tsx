'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, CheckCircle } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { toast } from 'sonner';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart } = useStore();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const paymentKey = searchParams.get('paymentKey');
    const orderId = searchParams.get('orderId');
    const amount = searchParams.get('amount');

    if (!paymentKey || !orderId || !amount) {
      setStatus('error');
      setErrorMessage('결제 정보가 올바르지 않습니다.');
      return;
    }

    // 토스 결제 승인 요청
    fetch('/api/payment/toss-confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paymentKey,
        orderId,
        amount: Number(amount),
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || '결제 승인에 실패했습니다.');
        }
        setStatus('success');
        clearCart();
        toast.success('결제가 완료되었습니다!');

        // 3초 후 주문 완료 페이지로 이동
        setTimeout(() => {
          router.push(`/order-success/${orderId}`);
        }, 2000);
      })
      .catch((err) => {
        setStatus('error');
        setErrorMessage(err.message);
        toast.error(err.message);
      });
  }, [searchParams, router, clearCart]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8">
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 animate-spin text-emerald-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">결제 승인 중...</h1>
            <p className="text-gray-500">잠시만 기다려주세요.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">결제 완료!</h1>
            <p className="text-gray-500">주문 완료 페이지로 이동합니다...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">❌</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">결제 실패</h1>
            <p className="text-red-500 mb-6">{errorMessage}</p>
            <button
              onClick={() => router.push('/checkout')}
              className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800"
            >
              다시 시도
            </button>
          </>
        )}
      </div>
    </div>
  );
}
