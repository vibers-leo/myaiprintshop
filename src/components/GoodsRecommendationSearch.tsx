'use client';

import { useState } from 'react';
import { Search, Sparkles, ShoppingBag } from 'lucide-react';
import { recommendGoods, type AnalysisResult, type GoodsRecommendation } from '@/lib/goods-recommendation';

export default function GoodsRecommendationSearch() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [recommendations, setRecommendations] = useState<GoodsRecommendation[]>([]);

  const handleSearch = async () => {
    if (!url.trim()) {
      alert('URL을 입력해주세요.');
      return;
    }

    // URL 형식 검증
    try {
      new URL(url);
    } catch {
      alert('올바른 URL을 입력해주세요. (예: https://example.com)');
      return;
    }

    setLoading(true);
    try {
      // Step 1: URL 분석
      const analysisRes = await fetch('/api/analyze-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!analysisRes.ok) {
        throw new Error('분석 실패');
      }

      const analysisData: AnalysisResult = await analysisRes.json();
      setAnalysis(analysisData);

      // Step 2: 굿즈 추천
      const recs = recommendGoods(analysisData);
      setRecommendations(recs);
    } catch (error) {
      console.error('Search failed:', error);
      alert('분석에 실패했습니다.\nURL을 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenShop = () => {
    // TODO: 크리에이터 등록 페이지로 이동 (추천 정보 전달)
    const queryParams = new URLSearchParams({
      source: 'goods-recommendation',
      url,
      analysis: JSON.stringify(analysis),
      recommendations: JSON.stringify(recommendations),
    });

    window.location.href = `/creators/register?${queryParams}`;
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 via-white to-blue-50 py-20">
      <div className="max-w-5xl mx-auto px-4">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-10 h-10 text-purple-600" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              AI 굿즈 추천
            </h1>
          </div>
          <p className="text-xl text-gray-700 leading-relaxed">
            사이트 URL만 입력하면 AI가 분석해서<br />
            어울리는 굿즈를 추천해드려요
          </p>
          <p className="text-sm text-purple-600 mt-3 font-medium">
            ✨ 디자인 확정하면 제작·배송·정산까지 자동! ✨
          </p>
        </div>

        {/* 검색창 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
          <div className="flex gap-3">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="flex-1 px-6 py-4 border-2 border-gray-200 rounded-xl text-lg focus:border-purple-500 focus:outline-none transition-colors"
              onKeyPress={(e) => e.key === 'Enter' && !loading && handleSearch()}
              disabled={loading}
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold text-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-3 border-white border-t-transparent" />
                  분석 중...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Search className="w-6 h-6" />
                  추천받기
                </div>
              )}
            </button>
          </div>
        </div>

        {/* 분석 결과 */}
        {analysis && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-600" />
              브랜드 분석 결과
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 브랜드 색상 */}
              <div>
                <p className="text-sm font-medium text-gray-600 mb-3">브랜드 색상</p>
                <div className="flex gap-2">
                  {analysis.brandColors.map((color, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div
                        className="w-14 h-14 rounded-lg shadow-md border-2 border-white"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-xs text-gray-500 font-mono">{color}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 키워드 */}
              <div>
                <p className="text-sm font-medium text-gray-600 mb-3">키워드</p>
                <div className="flex flex-wrap gap-2">
                  {analysis.keywords.slice(0, 5).map((keyword, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              {/* 타겟 */}
              <div>
                <p className="text-sm font-medium text-gray-600 mb-3">타겟 고객</p>
                <p className="text-lg font-bold text-gray-900">{analysis.targetAudience}</p>
                <p className="text-sm text-gray-500 mt-1">테마: {analysis.theme}</p>
              </div>
            </div>
          </div>
        )}

        {/* 추천 결과 */}
        {recommendations.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold">추천 굿즈</h2>
              <button
                onClick={handleOpenShop}
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-bold hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <ShoppingBag className="w-5 h-5" />
                이 샵으로 시작하기
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="bg-white border-2 border-gray-100 rounded-2xl overflow-hidden hover:shadow-2xl hover:border-purple-200 transition-all group"
                >
                  {/* 예시 이미지 (임시 플레이스홀더) */}
                  <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-6xl mb-2">
                          {rec.productType === 'tshirt' && '👕'}
                          {rec.productType === 'mug' && '☕'}
                          {rec.productType === 'sticker' && '🎨'}
                          {rec.productType === 'bag' && '👜'}
                          {rec.productType === 'keyring' && '🔑'}
                          {rec.productType === 'tumbler' && '🥤'}
                          {rec.productType === 'notebook' && '📓'}
                          {rec.productType === 'poster' && '🖼️'}
                        </div>
                        <p className="text-sm text-gray-500">예시 이미지</p>
                      </div>
                    </div>

                    {/* 매칭률 배지 */}
                    <div className="absolute top-3 right-3 bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                      매칭률 {rec.score}%
                    </div>
                  </div>

                  {/* 상품 정보 */}
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg group-hover:text-purple-600 transition-colors">
                        {rec.name}
                      </h3>
                      <span className="text-sm text-gray-500">{rec.category}</span>
                    </div>

                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">{rec.reason}</p>

                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-purple-600">
                        {rec.basePrice.toLocaleString()}원~
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 샵 오픈 CTA */}
            <div className="mt-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-center text-white">
              <h3 className="text-3xl font-bold mb-3">
                이 굿즈들로 내 샵 오픈하기
              </h3>
              <p className="text-lg mb-6 opacity-90">
                디자인만 확정하면 제작·배송·정산까지 모두 자동!<br />
                판매 수익의 70%를 가져가세요
              </p>
              <button
                onClick={handleOpenShop}
                className="px-12 py-4 bg-white text-purple-600 rounded-xl font-bold text-xl hover:bg-gray-100 transition-colors shadow-xl"
              >
                3분 만에 샵 오픈하기 →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
