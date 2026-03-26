'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useEditorStore } from '@/store/useEditorStore';
import { attachSnapGuides } from '@/lib/fabric/snap-guides';
import { attachKeyboardShortcuts } from '@/lib/fabric/keyboard-handler';
import FabricCanvas from '@/components/editor/FabricCanvas';
import BusinessCardHeader from '@/components/editor/BusinessCardHeader';
import CanvasToolbar from '@/components/editor/CanvasToolbar';
import BusinessCardPanel from '@/components/editor/panels/BusinessCardPanel';
import type { Product } from '@/lib/products';

/**
 * 명함 에디터 페이지
 *
 * 일반 상품 에디터와 달리, 명함 전용 UI와 빠른 입력 기능을 제공합니다.
 * - 왼쪽: 명함 정보 빠른 입력 폼 (이름, 직책, 연락처)
 * - 중앙: Fabric.js 캔버스
 * - 상단: 명함 전용 헤더 (다운로드, 저장 기능)
 */
export default function BusinessCardEditorPage() {
  const router = useRouter();

  const {
    product,
    setProduct,
    loading,
    setLoading,
    canvasRef,
  } = useEditorStore();

  // 명함 전용 가상 상품 설정
  useEffect(() => {
    const businessCardProduct: Product = {
      id: 'businesscard-template',
      name: '명함 디자인',
      description: '표준 명함 사이즈 (90mm x 50mm)',
      price: 5000, // 기본 가격 (100장 기준)
      thumbnail: '/templates/businesscard-front.jpg',
      images: ['/templates/businesscard-front.jpg', '/templates/businesscard-back.jpg'],
      category: 'businesscard',
      badge: 'NEW',
      tags: ['명함', '비즈니스', '네트워킹'],
      options: {
        sizes: ['90mm x 50mm'],
        groups: [
          {
            id: 'quantity',
            name: 'quantity',
            label: '수량',
            type: 'select',
            description: '인쇄할 명함 수량을 선택하세요',
            required: true,
            values: [
              { id: '100', label: '100장', priceAdded: 0 },
              { id: '200', label: '200장', priceAdded: 3000 },
              { id: '500', label: '500장', priceAdded: 10000 },
              { id: '1000', label: '1000장', priceAdded: 18000 },
            ],
          },
          {
            id: 'paper',
            name: 'paper',
            label: '용지',
            type: 'select',
            description: '명함 용지 타입을 선택하세요',
            required: true,
            values: [
              { id: 'standard', label: '일반 용지 (250g)', priceAdded: 0 },
              { id: 'premium', label: '프리미엄 용지 (300g)', priceAdded: 2000 },
              { id: 'textured', label: '고급 질감 용지', priceAdded: 5000 },
            ],
          },
          {
            id: 'finish',
            name: 'finish',
            label: '코팅',
            type: 'select',
            description: '명함 마감 옵션을 선택하세요',
            values: [
              { id: 'none', label: '무코팅', priceAdded: 0 },
              { id: 'matte', label: '무광 코팅', priceAdded: 1000 },
              { id: 'glossy', label: '유광 코팅', priceAdded: 1000 },
              { id: 'spot', label: '부분 코팅', priceAdded: 3000 },
            ],
          },
        ],
      },
      stock: 999,
      isActive: true,
      reviewCount: 0,
      rating: 5.0,
      printMethod: 'dtg',
      vendorId: 'goodzz',
      vendorName: 'GOODZZ',
      vendorType: 'platform',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setProduct(businessCardProduct);
    setLoading(false);
  }, [setProduct, setLoading]);

  // 캔버스 준비 시 스냅 가이드 및 키보드 단축키 설정
  useEffect(() => {
    if (!canvasRef) return;

    attachSnapGuides(canvasRef);
    const cleanupKeyboard = attachKeyboardShortcuts(canvasRef);

    return () => {
      cleanupKeyboard();
    };
  }, [canvasRef]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-emerald-500" size={40} />
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* 헤더 */}
      <BusinessCardHeader />

      <div className="flex-1 flex overflow-hidden">
        {/* 왼쪽 패널 - 명함 정보 빠른 입력 */}
        <aside className="editor-sidebar">
          <BusinessCardPanel />
        </aside>

        {/* 중앙 - 캔버스 영역 */}
        <main className="editor-canvas-area p-4 sm:p-8">
          {/* 그리드 배경 */}
          <div
            className="absolute inset-0 z-0 opacity-20"
            style={{
              backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          <div className="relative group/canvas">
            <FabricCanvas />
            <CanvasToolbar />
          </div>
        </main>

        {/* 오른쪽 패널 - 고급 도구 (추후 확장 가능) */}
        <aside className="w-16 bg-white border-l border-gray-200 flex flex-col items-center py-4 space-y-2">
          {/*
          향후 추가 가능한 도구 아이콘:
          - AI 이미지 생성
          - 이미지 업로드
          - 도형 추가
          - 레이어 관리
          */}
        </aside>
      </div>
    </div>
  );
}
