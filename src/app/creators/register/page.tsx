'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { Wand2, Store, User, ArrowRight, Check, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import type { AnalysisResult, GoodsRecommendation } from '@/lib/goods-recommendation';

export default function CreatorRegisterPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreator, setIsCreator] = useState<boolean | null>(null);

  // AI 추천 데이터
  const [aiRecommendations, setAiRecommendations] = useState<{
    source?: string;
    url?: string;
    analysis?: AnalysisResult;
    recommendations?: GoodsRecommendation[];
  }>({});

  const [formData, setFormData] = useState({
    handle: '',
    shopName: '',
    displayName: '',
    bio: '',
  });

  const [handleError, setHandleError] = useState('');

  // AI 추천 데이터 읽기
  useEffect(() => {
    const source = searchParams.get('source');
    const url = searchParams.get('url');
    const analysisStr = searchParams.get('analysis');
    const recommendationsStr = searchParams.get('recommendations');

    if (source === 'goods-recommendation' && analysisStr && recommendationsStr) {
      try {
        const analysis: AnalysisResult = JSON.parse(analysisStr);
        const recommendations: GoodsRecommendation[] = JSON.parse(recommendationsStr);

        setAiRecommendations({ source, url: url || undefined, analysis, recommendations });

        // 샵 이름 자동 입력 (분석 결과 기반)
        if (analysis.keywords.length > 0) {
          const suggestedName = `${analysis.keywords[0]} 굿즈샵`;
          setFormData((prev) => ({ ...prev, shopName: suggestedName }));
        }

        toast.success(`AI가 ${recommendations.length}개의 굿즈를 추천했습니다!`, {
          icon: <Sparkles className="text-purple-500" size={16} />,
        });
      } catch (error) {
        console.error('Failed to parse AI recommendations:', error);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (!loading && !user) {
      toast.error('로그인이 필요합니다.');
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const checkCreator = async () => {
      if (!user) return;
      const res = await fetch(`/api/creators?uid=${user.uid}`);
      const data = await res.json();
      if (data.success && data.creator) {
        setIsCreator(true);
        router.push('/creators/dashboard');
      } else {
        setIsCreator(false);
      }
    };
    if (user) checkCreator();
  }, [user, router]);

  const validateHandle = (handle: string) => {
    if (handle.length < 3) return '3자 이상 입력해주세요.';
    if (handle.length > 20) return '20자 이하로 입력해주세요.';
    if (!/^[a-z0-9_-]+$/.test(handle)) return '영문 소문자, 숫자, -, _ 만 사용 가능합니다.';
    return '';
  };

  const handleSubmit = async () => {
    if (!user) return;

    const error = validateHandle(formData.handle);
    if (error) {
      setHandleError(error);
      return;
    }

    setIsSubmitting(true);
    try {
      // Step 1: 크리에이터 등록
      const res = await fetch('/api/creators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register',
          uid: user.uid,
          handle: formData.handle,
          displayName: formData.displayName || user.displayName || '',
          shopName: formData.shopName,
          bio: formData.bio,
          profileImage: user.photoURL || '',
        }),
      });

      const data = await res.json();
      if (!data.success) {
        toast.error(data.error || '등록에 실패했습니다.');
        return;
      }

      toast.success('크리에이터 등록이 완료되었습니다!');

      // Step 2: AI 추천 상품 자동 등록
      if (aiRecommendations.recommendations && aiRecommendations.recommendations.length > 0) {
        toast.loading(`${aiRecommendations.recommendations.length}개의 추천 상품을 등록하는 중...`, { id: 'auto-products' });

        let successCount = 0;
        for (const rec of aiRecommendations.recommendations) {
          try {
            const productRes = await fetch('/api/creators', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'create_product',
                creatorUid: user.uid,
                creatorHandle: formData.handle,
                productId: '', // Will be auto-generated
                title: rec.name,
                description: rec.reason,
                designUrl: `https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&auto=format`, // 임시 플레이스홀더
                price: rec.basePrice + Math.floor(rec.basePrice * 0.7), // 기본가 + 70% 마진
                baseProductPrice: rec.basePrice,
                category: rec.category,
                tags: [rec.productType, ...(aiRecommendations.analysis?.keywords.slice(0, 3) || [])],
              }),
            });

            const productData = await productRes.json();
            if (productData.success) {
              successCount++;
            }
          } catch (error) {
            console.error(`Failed to create product ${rec.name}:`, error);
          }
        }

        toast.success(`${successCount}개의 상품이 자동 등록되었습니다!`, { id: 'auto-products' });
      }

      // Step 3: 대시보드로 이동
      router.push('/creators/dashboard');
    } catch {
      toast.error('네트워크 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || isCreator === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-emerald-500" size={40} />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-24 pb-16 max-w-2xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Store className="text-emerald-600" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">크리에이터 등록</h1>
          <p className="text-gray-500">나만의 디자인으로 굿즈를 판매하고 수익을 만들어보세요</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12 gap-2">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                step >= s ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-400'
              }`}>
                {step > s ? <Check size={18} /> : s}
              </div>
              {s < 3 && <div className={`w-16 h-1 rounded ${step > s ? 'bg-emerald-600' : 'bg-gray-200'}`} />}
            </React.Fragment>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {/* AI 추천 배너 */}
          {aiRecommendations.recommendations && aiRecommendations.recommendations.length > 0 && (
            <div className="mb-6 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="text-purple-600" size={20} />
                <h3 className="font-bold text-purple-900">AI 굿즈 추천 샵 오픈</h3>
              </div>
              <p className="text-sm text-purple-700 leading-relaxed">
                AI가 분석한 {aiRecommendations.recommendations.length}개의 추천 상품이<br />
                샵 오픈 후 자동으로 등록됩니다!
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {aiRecommendations.recommendations.slice(0, 3).map((rec, i) => (
                  <span key={i} className="px-2 py-1 bg-white text-purple-700 rounded-full text-xs font-medium border border-purple-200">
                    {rec.name}
                  </span>
                ))}
                {aiRecommendations.recommendations.length > 3 && (
                  <span className="px-2 py-1 bg-purple-600 text-white rounded-full text-xs font-medium">
                    +{aiRecommendations.recommendations.length - 3}개 더
                  </span>
                )}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900">기본 정보</h2>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">샵 이름 *</label>
                <input
                  type="text"
                  value={formData.shopName}
                  onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                  placeholder="나만의 굿즈샵 이름을 정해주세요"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">크리에이터명</label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  placeholder={user?.displayName || '활동명을 입력하세요'}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={() => formData.shopName ? setStep(2) : toast.error('샵 이름을 입력해주세요.')}
                className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
              >
                다음 단계 <ArrowRight size={18} />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900">나의 URL 설정</h2>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">핸들 (고유 URL) *</label>
                <div className="flex items-center">
                  <span className="text-gray-400 text-sm mr-2">myaiprintshop.co.kr/creators/</span>
                  <input
                    type="text"
                    value={formData.handle}
                    onChange={(e) => {
                      const val = e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '');
                      setFormData({ ...formData, handle: val });
                      setHandleError(validateHandle(val));
                    }}
                    placeholder="my-shop"
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                {handleError && <p className="text-red-500 text-xs mt-1">{handleError}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">자기소개</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="어떤 크리에이터인지 소개해주세요"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent h-32 resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 py-4 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50">
                  이전
                </button>
                <button
                  onClick={() => !handleError && formData.handle ? setStep(3) : toast.error('핸들을 올바르게 입력해주세요.')}
                  className="flex-1 py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                >
                  다음 단계 <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900">등록 확인</h2>

              <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">샵 이름</span>
                  <span className="font-bold">{formData.shopName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">크리에이터명</span>
                  <span className="font-bold">{formData.displayName || user?.displayName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">URL</span>
                  <span className="font-bold text-emerald-600">/creators/{formData.handle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">수익 배분</span>
                  <span className="font-bold">크리에이터 70% / 플랫폼 30%</span>
                </div>
              </div>

              {/* AI 추천 상품 목록 */}
              {aiRecommendations.recommendations && aiRecommendations.recommendations.length > 0 && (
                <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="text-purple-600" size={18} />
                    <h3 className="font-bold text-purple-900">자동 등록될 AI 추천 상품</h3>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {aiRecommendations.recommendations.map((rec, i) => (
                      <div key={i} className="bg-white rounded-lg p-3 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{rec.name}</p>
                          <p className="text-xs text-gray-500">{rec.reason}</p>
                        </div>
                        <span className="text-sm font-bold text-purple-600">매칭률 {rec.score}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                등록 후 바로 상품 등록이 가능하며, 정산은 매월 진행됩니다. 최소 출금 금액은 10,000원입니다.
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="flex-1 py-4 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50">
                  이전
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} />}
                  크리에이터 등록하기
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
