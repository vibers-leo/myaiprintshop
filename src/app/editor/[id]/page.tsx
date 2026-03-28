'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { getProductById } from '@/lib/products';
import { getDesignById } from '@/lib/designs';
import { useAuth } from '@/context/AuthContext';
import { useEditorStore } from '@/store/useEditorStore';
import { attachSnapGuides } from '@/lib/fabric/snap-guides';
import { attachKeyboardShortcuts } from '@/lib/fabric/keyboard-handler';
import FabricCanvas from '@/components/editor/FabricCanvas';
import EditorHeader from '@/components/editor/EditorHeader';
import CanvasToolbar from '@/components/editor/CanvasToolbar';
import ToolSidebar from '@/components/editor/panels/ToolSidebar';
import { toast } from 'sonner';

export default function DesignEditorPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const draftId = searchParams.get('draft');
  const imageUrl = searchParams.get('imageUrl');
  const { user } = useAuth();
  const router = useRouter();

  const {
    product,
    setProduct,
    loading,
    setLoading,
    canvasRef,
  } = useEditorStore();

  // Load product and draft
  useEffect(() => {
    const init = async () => {
      if (!id) return;

      let p;
      if (typeof id === 'string' && id.startsWith('bp_')) {
        // Creator Studio Base Product Mock 
        p = {
          id: id,
          name: id === 'bp_1' ? '스트릿 오버핏 티셔츠' : id === 'bp_2' ? '세라믹 스튜디오 머그' : '프리미엄 하드 케이스',
          price: 15000,
          category: 'CreatorBase',
          thumbnail: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800',
        };
      } else {
        p = await getProductById(id as string);
      }

      if (p) {
        // @ts-ignore
        setProduct(p);
      } else {
        toast.error('상품을 찾을 수 없습니다.');
        router.push('/shop');
      }
      setLoading(false);
    };

    init();
  }, [id, router, setProduct, setLoading]);

  // Load draft when canvas is ready
  useEffect(() => {
    if (!canvasRef || !draftId || !user) return;

    const loadDraft = async () => {
      const draft = await getDesignById(draftId);
      if (!draft) return;

      // Check for new Fabric.js JSON format (version 2)
      if (draft.designData?.fabricJSON) {
        try {
          await canvasRef.loadFromJSON(draft.designData.fabricJSON);
          canvasRef.renderAll();
        } catch (error) {
          console.error('Failed to load draft:', error);
        }
      }
      // Legacy format: just show the preview image on canvas
      else if (draft.previewUrl) {
        const { addImageToCanvas } = await import('@/lib/fabric/object-helpers');
        await addImageToCanvas(canvasRef, draft.previewUrl);
      }
    };

    loadDraft();
  }, [canvasRef, draftId, user]);

  // Load external image from URL (from upload flow)
  useEffect(() => {
    if (!canvasRef || !imageUrl) return;

    const loadExternalImage = async () => {
      try {
        const { addImageToCanvas } = await import('@/lib/fabric/object-helpers');
        await addImageToCanvas(canvasRef, imageUrl);
        canvasRef.renderAll();
        toast.success('사진이 로드되었습니다. 자유롭게 편집해보세요!');
      } catch (error) {
        console.error('Failed to load image from URL:', error);
        toast.error('이미지를 로드하는 데 실패했습니다.');
      }
    };

    loadExternalImage();
  }, [canvasRef, imageUrl]);

  // Attach snap guides and keyboard shortcuts when canvas is ready
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
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col overflow-hidden">
      <EditorHeader />

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        <ToolSidebar />

        {/* Main Canvas Area */}
        <main className="flex-1 relative bg-[#F0F2F5] flex items-center justify-center p-4 sm:p-8 overflow-hidden">
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
      </div>
    </div>
  );
}
