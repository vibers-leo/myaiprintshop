'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export default function LoginPage() {
  const { loginWithGoogle } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle();
      toast.success('로그인 되었습니다.');
      router.push('/');
    } catch (error) {
      console.error(error);
      toast.error('로그인 중 문제가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#FAFAFA] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Subtle Gradient */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: 'radial-gradient(#E5E7EB 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-gray-100/50 rounded-full blur-[100px] -z-10" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link href="/" className="flex flex-col items-center gap-3 group">
          <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            {/* @ts-ignore */}
            <iconify-icon icon="solar:gift-bold" class="text-white text-2xl" />
          </div>
          <span className="font-black text-2xl tracking-tighter text-gray-900" style={{ fontFamily: "'Outfit', 'Pretendard', sans-serif" }}>
            GOODZZ
          </span>
        </Link>
        <h2 className="mt-8 text-center text-3xl font-black text-gray-900 tracking-tight">
          반갑습니다!
        </h2>
        <p className="mt-2 text-center text-sm text-gray-500 font-medium">
          로그인하고 나만의 굿즈 제작을 시작해보세요
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-10 px-8 shadow-xl shadow-gray-200/50 sm:rounded-[32px] sm:px-12 border border-gray-100 text-center">
          
          <div className="space-y-6">
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-3 py-4 px-4 border border-gray-200 rounded-2xl shadow-sm bg-white text-sm font-bold text-gray-700 hover:bg-gray-50 hover:shadow-md transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
              <span>Google 계정으로 시작하기</span>
            </button>
            
            <button
              disabled
              className="w-full flex justify-center items-center gap-3 py-4 px-4 border border-transparent rounded-2xl shadow-sm bg-[#FEE500] text-sm font-bold text-black/85 hover:bg-[#FDD800] hover:shadow-md transition-all active:scale-[0.98] opacity-50 cursor-not-allowed"
            >
              {/* @ts-ignore */}
              <iconify-icon icon="ri:kakao-talk-fill" class="text-[20px]" />
              <span>카카오 로그인 (준비중)</span>
            </button>
          </div>

          <div className="mt-10">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-400 font-medium">새로 오셨나요?</span>
              </div>
            </div>

            <div className="mt-8 flex justify-center">
               <Link href="/" className="text-gray-900 font-bold hover:underline text-sm flex items-center gap-1.5 transition-all">
                 비회원으로 둘러보기
                 {/* @ts-ignore */}
                 <iconify-icon icon="solar:arrow-right-linear" />
               </Link>
            </div>
          </div>
        </div>
        
        <p className="text-center text-xs text-gray-400 font-medium mt-8">
          로그인 시 굿즈 스튜디오의 <Link href="/terms" className="underline hover:text-gray-900 transition-colors">이용약관</Link> 및 <Link href="/privacy" className="underline hover:text-gray-900 transition-colors">개인정보처리방침</Link>에 동의하게 됩니다.
        </p>
      </div>
    </div>
  );
}
