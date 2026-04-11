'use client';

import React, { useRef, useState } from 'react';
import { Upload, X, Loader2, GripVertical } from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  max?: number;
}

export default function ImageUploader({ images, onChange, max = 5 }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remaining = max - images.length;
    if (remaining <= 0) {
      toast.error(`최대 ${max}장까지 업로드할 수 있습니다.`);
      return;
    }

    const toUpload = Array.from(files).slice(0, remaining);
    setUploading(true);

    try {
      const urls: string[] = [];
      for (const file of toUpload) {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const data = await res.json();

        if (!res.ok) {
          toast.error(data.error || '업로드 실패');
          continue;
        }
        urls.push(data.url);
      }

      if (urls.length > 0) {
        onChange([...images, ...urls]);
        toast.success(`${urls.length}장 업로드 완료`);
      }
    } catch {
      toast.error('이미지 업로드 중 오류가 발생했습니다.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function handleRemove(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  function handleMoveUp(index: number) {
    if (index === 0) return;
    const arr = [...images];
    [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
    onChange(arr);
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
        {images.map((url, i) => (
          <div key={url + i} className="relative group aspect-square rounded-xl overflow-hidden border-2 border-gray-200">
            <img src={url} alt={`상품 이미지 ${i + 1}`} className="w-full h-full object-cover" />
            {i === 0 && (
              <span className="absolute top-1 left-1 bg-purple-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">대표</span>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              {i > 0 && (
                <button
                  type="button"
                  onClick={() => handleMoveUp(i)}
                  className="p-1.5 bg-white rounded-full hover:bg-gray-100"
                  title="앞으로 이동"
                >
                  <GripVertical className="w-4 h-4 text-gray-700" />
                </button>
              )}
              <button
                type="button"
                onClick={() => handleRemove(i)}
                className="p-1.5 bg-white rounded-full hover:bg-red-50"
                title="삭제"
              >
                <X className="w-4 h-4 text-red-500" />
              </button>
            </div>
          </div>
        ))}

        {images.length < max && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-indigo-400 flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-indigo-500 transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <Upload className="w-6 h-6" />
                <span className="text-xs">업로드</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={handleUpload}
      />
      <p className="text-xs text-gray-500">
        JPG, PNG, WebP, GIF / 최대 5MB / {images.length}/{max}장
        {images.length > 0 && ' · 첫 번째 이미지가 대표 이미지입니다'}
      </p>
    </div>
  );
}
