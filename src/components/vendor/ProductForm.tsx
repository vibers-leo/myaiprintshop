'use client';

import React, { useState } from 'react';
import { Plus, Minus, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import ImageUploader from './ImageUploader';

interface OptionValue {
  id: string;
  label: string;
  priceAdded?: number;
  priceMultiplier?: number;
}

interface OptionGroup {
  id: string;
  name: string;
  label: string;
  type: 'select' | 'radio';
  required: boolean;
  values: OptionValue[];
}

interface VolumeTier {
  minQuantity: number;
  discountRate: number;
}

export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  stock: number;
  category: string;
  images: string[];
  tags: string[];
  options: { groups: OptionGroup[] };
  volumePricing: VolumeTier[];
  isActive: boolean;
}

interface ProductFormProps {
  initialData?: Partial<ProductFormData>;
  onSubmit: (data: ProductFormData) => Promise<void>;
  submitLabel?: string;
}

const CATEGORIES = [
  { value: 'print', label: '인쇄물' },
  { value: 'fashion', label: '패션/어패럴' },
  { value: 'living', label: '리빙/인테리어' },
  { value: 'stationery', label: '문구/팬시' },
  { value: 'goods', label: '굿즈/팬시' },
  { value: 'etc', label: '기타' },
];

const EMPTY_FORM: ProductFormData = {
  name: '',
  description: '',
  price: 0,
  originalPrice: 0,
  stock: 100,
  category: '',
  images: [],
  tags: [],
  options: { groups: [] },
  volumePricing: [],
  isActive: true,
};

export default function ProductForm({ initialData, onSubmit, submitLabel = '저장' }: ProductFormProps) {
  const [form, setForm] = useState<ProductFormData>({ ...EMPTY_FORM, ...initialData });
  const [tagInput, setTagInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(
    (initialData?.options?.groups?.length ?? 0) > 0 || (initialData?.volumePricing?.length ?? 0) > 0
  );

  function update<K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // === Tags ===
  function addTag() {
    const tag = tagInput.trim();
    if (!tag || form.tags.includes(tag)) return;
    update('tags', [...form.tags, tag]);
    setTagInput('');
  }

  // === Option Groups ===
  function addOptionGroup() {
    const id = `opt_${Date.now()}`;
    update('options', {
      groups: [...form.options.groups, { id, name: '', label: '', type: 'select', required: false, values: [] }],
    });
  }

  function updateOptionGroup(index: number, field: string, value: any) {
    const groups = [...form.options.groups];
    groups[index] = { ...groups[index], [field]: value };
    update('options', { groups });
  }

  function removeOptionGroup(index: number) {
    update('options', { groups: form.options.groups.filter((_, i) => i !== index) });
  }

  function addOptionValue(groupIndex: number) {
    const groups = [...form.options.groups];
    groups[groupIndex].values.push({ id: `v_${Date.now()}`, label: '', priceAdded: 0 });
    update('options', { groups });
  }

  function updateOptionValue(groupIndex: number, valueIndex: number, field: string, val: any) {
    const groups = [...form.options.groups];
    groups[groupIndex].values[valueIndex] = { ...groups[groupIndex].values[valueIndex], [field]: val };
    update('options', { groups });
  }

  function removeOptionValue(groupIndex: number, valueIndex: number) {
    const groups = [...form.options.groups];
    groups[groupIndex].values = groups[groupIndex].values.filter((_, i) => i !== valueIndex);
    update('options', { groups });
  }

  // === Volume Pricing ===
  function addVolumeTier() {
    update('volumePricing', [...form.volumePricing, { minQuantity: 10, discountRate: 0.1 }]);
  }

  function updateVolumeTier(index: number, field: string, value: number) {
    const tiers = [...form.volumePricing];
    tiers[index] = { ...tiers[index], [field]: value };
    update('volumePricing', tiers);
  }

  function removeVolumeTier(index: number) {
    update('volumePricing', form.volumePricing.filter((_, i) => i !== index));
  }

  // === Submit ===
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.price || !form.category) {
      toast.error('상품명, 가격, 카테고리는 필수입니다.');
      return;
    }
    if (form.images.length === 0) {
      toast.error('이미지를 최소 1장 업로드해주세요.');
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(form);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* === 기본 정보 === */}
      <section className="bg-white rounded-2xl p-6 border border-gray-200 space-y-5">
        <h3 className="font-bold text-lg text-gray-900">기본 정보</h3>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            상품명 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none"
            placeholder="예: AI 커스텀 에코백"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">상품 설명</label>
          <textarea
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            rows={4}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none resize-none"
            placeholder="상품에 대한 상세 설명..."
          />
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              판매가 (원) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              min="0"
              value={form.price || ''}
              onChange={(e) => update('price', Number(e.target.value))}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none"
              placeholder="29900"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">정상가 (원)</label>
            <input
              type="number"
              min="0"
              value={form.originalPrice || ''}
              onChange={(e) => update('originalPrice', Number(e.target.value))}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none"
              placeholder="39900 (할인 표시용)"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">재고</label>
            <input
              type="number"
              min="0"
              value={form.stock}
              onChange={(e) => update('stock', Number(e.target.value))}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              카테고리 <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={form.category}
              onChange={(e) => update('category', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none"
            >
              <option value="">카테고리 선택</option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">판매 상태</label>
            <div className="flex gap-4 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={form.isActive} onChange={() => update('isActive', true)} className="accent-indigo-600" />
                <span className="text-sm">판매중</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={!form.isActive} onChange={() => update('isActive', false)} className="accent-indigo-600" />
                <span className="text-sm">숨김</span>
              </label>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">태그</label>
          <div className="flex gap-2 flex-wrap mb-2">
            {form.tags.map((tag, i) => (
              <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm">
                {tag}
                <button type="button" onClick={() => update('tags', form.tags.filter((_, j) => j !== i))} className="hover:text-red-500">×</button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
              className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-indigo-500 focus:outline-none"
              placeholder="태그 입력 후 Enter"
            />
            <button type="button" onClick={addTag} className="px-3 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200">추가</button>
          </div>
        </div>
      </section>

      {/* === 이미지 === */}
      <section className="bg-white rounded-2xl p-6 border border-gray-200 space-y-4">
        <h3 className="font-bold text-lg text-gray-900">상품 이미지 <span className="text-red-500">*</span></h3>
        <ImageUploader images={form.images} onChange={(imgs) => update('images', imgs)} max={5} />
      </section>

      {/* === 고급 옵션 토글 === */}
      <button
        type="button"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="w-full py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 transition-colors"
      >
        {showAdvanced ? '▲ 고급 옵션 접기' : '▼ 고급 옵션 펼치기 (견적 옵션 · 수량 할인)'}
      </button>

      {showAdvanced && (
        <>
          {/* === 견적 옵션 === */}
          <section className="bg-white rounded-2xl p-6 border border-gray-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-gray-900">견적 옵션</h3>
              <button type="button" onClick={addOptionGroup} className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                <Plus className="w-4 h-4" /> 옵션 그룹 추가
              </button>
            </div>
            <p className="text-xs text-gray-500">소재, 인쇄 방식, 크기 등 선택에 따라 가격이 변동되는 옵션을 설정합니다.</p>

            {form.options.groups.map((group, gi) => (
              <div key={group.id} className="border border-gray-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    value={group.label}
                    onChange={(e) => updateOptionGroup(gi, 'label', e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-indigo-500 focus:outline-none"
                    placeholder="옵션명 (예: 소재, 인쇄 방식)"
                  />
                  <select
                    value={group.type}
                    onChange={(e) => updateOptionGroup(gi, 'type', e.target.value)}
                    className="px-3 py-2 rounded-lg border border-gray-200 text-sm"
                  >
                    <option value="select">드롭다운</option>
                    <option value="radio">라디오</option>
                  </select>
                  <label className="flex items-center gap-1 text-xs text-gray-600 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={group.required}
                      onChange={(e) => updateOptionGroup(gi, 'required', e.target.checked)}
                      className="accent-indigo-600"
                    />
                    필수
                  </label>
                  <button type="button" onClick={() => removeOptionGroup(gi)} className="text-red-400 hover:text-red-600">
                    <Minus className="w-4 h-4" />
                  </button>
                </div>

                {/* Values */}
                <div className="space-y-2 pl-4">
                  {group.values.map((val, vi) => (
                    <div key={val.id} className="flex items-center gap-2">
                      <input
                        value={val.label}
                        onChange={(e) => updateOptionValue(gi, vi, 'label', e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 text-sm"
                        placeholder="옵션값 (예: 프리미엄 캔버스)"
                      />
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500">+₩</span>
                        <input
                          type="number"
                          value={val.priceAdded || 0}
                          onChange={(e) => updateOptionValue(gi, vi, 'priceAdded', Number(e.target.value))}
                          className="w-24 px-2 py-1.5 rounded-lg border border-gray-200 text-sm text-right"
                        />
                      </div>
                      <button type="button" onClick={() => removeOptionValue(gi, vi)} className="text-red-400 hover:text-red-600">
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addOptionValue(gi)}
                    className="text-xs text-indigo-500 hover:text-indigo-700 font-medium flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> 옵션값 추가
                  </button>
                </div>
              </div>
            ))}

            {form.options.groups.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">설정된 옵션이 없습니다.</p>
            )}
          </section>

          {/* === 수량 할인 === */}
          <section className="bg-white rounded-2xl p-6 border border-gray-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-gray-900">수량별 할인</h3>
              <button type="button" onClick={addVolumeTier} className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                <Plus className="w-4 h-4" /> 할인 구간 추가
              </button>
            </div>
            <p className="text-xs text-gray-500">대량 주문 시 할인율을 설정합니다.</p>

            {form.volumePricing.map((tier, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="1"
                    value={tier.minQuantity}
                    onChange={(e) => updateVolumeTier(i, 'minQuantity', Number(e.target.value))}
                    className="w-24 px-3 py-2 rounded-lg border border-gray-200 text-sm text-right"
                  />
                  <span className="text-sm text-gray-500">개 이상</span>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={Math.round(tier.discountRate * 100)}
                    onChange={(e) => updateVolumeTier(i, 'discountRate', Number(e.target.value) / 100)}
                    className="w-20 px-3 py-2 rounded-lg border border-gray-200 text-sm text-right"
                  />
                  <span className="text-sm text-gray-500">% 할인</span>
                </div>
                <span className="text-xs text-gray-400">
                  → ₩{form.price ? Math.round(form.price * (1 - tier.discountRate)).toLocaleString() : '?'}
                </span>
                <button type="button" onClick={() => removeVolumeTier(i)} className="text-red-400 hover:text-red-600">
                  <Minus className="w-4 h-4" />
                </button>
              </div>
            ))}

            {form.volumePricing.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">설정된 할인 구간이 없습니다.</p>
            )}
          </section>
        </>
      )}

      {/* === 제출 === */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full py-4 bg-gradient-to-r from-indigo-600 to-amber-500 hover:from-indigo-500 hover:to-amber-400 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-3"
      >
        {submitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            처리 중...
          </>
        ) : (
          <>
            <Save className="w-5 h-5" />
            {submitLabel}
          </>
        )}
      </button>
    </form>
  );
}
