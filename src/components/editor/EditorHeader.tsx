'use client';

import React from 'react';
import {
  ChevronLeft,
  Download,
  Save,
  Loader2,
  ShoppingCart,
  CheckCircle2,
  Store,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEditorStore } from '@/store/useEditorStore';
import { useAuth } from '@/context/AuthContext';
import { useStore } from '@/store/useStore';
import { saveDesign, uploadDesignImage } from '@/lib/designs';
import { exportToPNG } from '@/lib/fabric/export-utils';
import { toast } from 'sonner';
import OrderModal from '../common/OrderModal';
import PublishModal from '../studio/PublishModal';

export default function EditorHeader() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isCreatorMode = searchParams.get('mode') === 'creator';
  
  const { user } = useAuth();
  const addToCart = useStore((s) => s.addToCart);

  const {
    product,
    canvasRef,
    isSaving,
    setIsSaving,
    generationMode,
    faceCanvasStates,
    activeFace,
  } = useEditorStore();

  const [isOrderModalOpen, setIsOrderModalOpen] = React.useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = React.useState(false);
  const [orderImageUrl, setOrderImageUrl] = React.useState<string | null>(null);

  const hasDesign = canvasRef
    ? canvasRef.getObjects().some((o: any) => !o._isBgMockup && !o._isPrintZone)
    : false;

  const handleExportPNG = async () => {
    if (!canvasRef || !product) return;
    try {
      await exportToPNG(canvasRef, product.name);
      toast.success('PNG 이미지가 다운로드되었습니다!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('이미지 내보내기 중 오류가 발생했습니다.');
    }
  };

  const handleSaveDraft = async () => {
    if (!user || !product || !canvasRef) {
      toast.error('저장할 디자인이 없거나 로그인이 필요합니다.');
      return;
    }
    setIsSaving(true);
    try {
      const previewDataUrl = canvasRef.toDataURL({
        format: 'png',
        multiplier: 0.5,
      });
      const uploadedUrl = await uploadDesignImage(user.uid, previewDataUrl);
      const previewUrl = uploadedUrl || previewDataUrl;

      const fabricJSON = canvasRef.toJSON(['id', 'selectable', 'evented', '_isBgMockup', '_isPrintZone']);

      // Save current face state
      const allFaceStates = { ...faceCanvasStates };
      allFaceStates[activeFace] = JSON.stringify(fabricJSON);

      const designId = await saveDesign(user.uid, {
        productId: product.id,
        productName: product.name,
        previewUrl,
        designData: {
          fabricJSON,
          faceStates: allFaceStates,
          version: 2,
        },
      });

      if (designId) {
        toast.success('작업물이 안전하게 저장되었습니다!');
      }
    } catch (error) {
      console.error('Save draft error:', error);
      toast.error('디자인 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOrder = async () => {
    if (!product || !canvasRef) return;
    setIsSaving(true);
    try {
      // 1. 고해상도 제작 도안 추출
      const previewDataUrl = canvasRef.toDataURL({
        format: 'png',
        multiplier: 3, 
      });
      
      // 2. 이미지 업로드
      const uploadedUrl = await uploadDesignImage(
        user?.uid || 'guest',
        previewDataUrl
      );
      
      const finalImageUrl = uploadedUrl || previewDataUrl;
      setOrderImageUrl(finalImageUrl);
      
      if (isCreatorMode) {
        setIsPublishModalOpen(true);
      } else {
        setIsOrderModalOpen(true);
      }
      
    } catch (error) {
      console.error('Order preparation error:', error);
      toast.error('주문 준비 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <header className="h-20 glass border-b border-black/5 flex justify-between items-center px-8 shrink-0 z-30">
        <div className="flex items-center gap-6">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full transition-all active:scale-90"
          >
            <ChevronLeft size={24} className="text-gray-600" />
          </button>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-display font-black text-gray-900 tracking-tighter">
                GOODZZ Studio
              </h1>
              <span className="px-2 py-0.5 bg-gradient-to-r from-primary-600 to-primary-400 text-[10px] font-black text-white rounded-md tracking-widest uppercase">
                Pro
              </span>
            </div>
            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-0.5">
              Editing: {product?.name || 'New Project'} {isCreatorMode && '(Creator Mode)'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 mr-4 border-r border-gray-100 pr-4">
             <button
              onClick={handleExportPNG}
              disabled={!hasDesign}
              className="p-2.5 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-all disabled:opacity-30"
              title="PNG 내보내기"
            >
              <Download size={20} />
            </button>
            <button
              onClick={handleSaveDraft}
              disabled={isSaving || !hasDesign}
              className="p-2.5 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-all disabled:opacity-30"
              title="디자인 저장"
            >
              {isSaving ? (
                <Loader2 size={20} className="animate-spin text-primary-500" />
              ) : (
                <Save size={20} />
              )}
            </button>
          </div>

          <button
            onClick={handleOrder}
            disabled={!hasDesign || isSaving}
            className={`px-8 py-3 text-white rounded-full text-sm font-black transition-all shadow-[0_12px_32px_-8px_rgba(0,0,0,0.2)] active:scale-95 disabled:opacity-50 flex items-center gap-2 ${
              isCreatorMode ? 'bg-primary-600 hover:bg-primary-700' : 'bg-gray-900 hover:bg-black'
            }`}
          >
            {isCreatorMode ? <Store size={18} /> : <ShoppingCart size={18} />}
            {isCreatorMode ? '스토어에 출시하기' : '주문하기'}
          </button>
        </div>
      </header>

      {/* Demo Mode Banner (Premium Style) */}
      {generationMode && generationMode !== 'real' && (
        <div className="bg-primary-50/50 backdrop-blur-sm px-4 py-2 text-center text-[11px] text-primary-600 font-black uppercase tracking-widest shrink-0 border-b border-primary-100/50">
          Demo Mode: Integration samples active
        </div>
      )}

      {isOrderModalOpen && product && orderImageUrl && (
        <OrderModal 
          isOpen={isOrderModalOpen}
          onClose={() => setIsOrderModalOpen(false)}
          product={product}
          customDesignUrl={orderImageUrl}
        />
      )}

      {isPublishModalOpen && product && orderImageUrl && (
        <PublishModal 
          isOpen={isPublishModalOpen}
          onClose={() => setIsPublishModalOpen(false)}
          product={product}
          customDesignUrl={orderImageUrl}
        />
      )}
    </>
  );
}
