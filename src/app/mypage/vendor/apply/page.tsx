'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Building2, User, Mail, Phone, CreditCard, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface BankAccount {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}

export default function VendorApplyPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '',
    businessNumber: '',
    ownerName: '',
    email: user?.email || '',
    phone: '',
    bankAccount: {
      bankName: '',
      accountNumber: '',
      accountHolder: '',
    } as BankAccount,
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBankAccountChange = (field: keyof BankAccount, value: string) => {
    setFormData((prev) => ({
      ...prev,
      bankAccount: {
        ...prev.bankAccount,
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('로그인이 필요합니다');
      router.push('/login');
      return;
    }

    // 필수 필드 검증
    if (!formData.businessName || !formData.ownerName || !formData.phone) {
      toast.error('필수 항목을 모두 입력해주세요');
      return;
    }

    if (!formData.bankAccount.bankName || !formData.bankAccount.accountNumber || !formData.bankAccount.accountHolder) {
      toast.error('계좌 정보를 모두 입력해주세요');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/vendors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ownerId: user.uid,
          ...formData,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || '신청에 실패했습니다');
      }

      toast.success('판매자 신청이 완료되었습니다!', {
        description: '승인까지 1-2영업일 소요됩니다.',
      });

      router.push('/mypage');
    } catch (error: any) {
      console.error('Error submitting vendor application:', error);

      if (error.message?.includes('already exists')) {
        toast.error('이미 판매자 신청이 존재합니다');
      } else {
        toast.error(error.message || '신청 중 오류가 발생했습니다');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-amber-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 bg-gradient-to-r from-indigo-600 to-amber-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">판매자 입점 신청</h1>
          <p className="text-lg text-gray-600">
            MyAIPrintShop에서 상품을 판매하고 수익을 창출하세요!
          </p>
        </motion.div>

        {/* Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-3 gap-4 mb-8"
        >
          {[
            { icon: CheckCircle2, title: '낮은 수수료', desc: '15% 기본 수수료' },
            { icon: CheckCircle2, title: '빠른 정산', desc: 'PG사 자동 정산' },
            { icon: CheckCircle2, title: '쉬운 관리', desc: '판매자 대시보드 제공' },
          ].map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 border-2 border-gray-100 text-center shadow-sm"
            >
              <item.icon className="w-8 h-8 text-indigo-600 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.desc}</p>
            </div>
          ))}
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl p-8 shadow-xl border-2 border-gray-100"
        >
          {/* Business Information */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                <Building2 className="w-5 h-5 text-indigo-600" />
              </div>
              사업자 정보
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  상호명 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.businessName}
                  onChange={(e) => handleInputChange('businessName', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-colors"
                  placeholder="MyShop"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  사업자등록번호 <span className="text-gray-400">(선택)</span>
                </label>
                <input
                  type="text"
                  value={formData.businessNumber}
                  onChange={(e) => handleInputChange('businessNumber', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-colors"
                  placeholder="123-45-67890"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  대표자명 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.ownerName}
                  onChange={(e) => handleInputChange('ownerName', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-colors"
                  placeholder="홍길동"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    이메일 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-colors"
                    placeholder="seller@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    연락처 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-colors"
                    placeholder="010-1234-5678"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bank Account Information */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-amber-600" />
              </div>
              정산 계좌 정보
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  은행명 <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.bankAccount.bankName}
                  onChange={(e) => handleBankAccountChange('bankName', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-colors"
                >
                  <option value="">은행 선택</option>
                  <option value="국민은행">국민은행</option>
                  <option value="신한은행">신한은행</option>
                  <option value="우리은행">우리은행</option>
                  <option value="하나은행">하나은행</option>
                  <option value="농협은행">농협은행</option>
                  <option value="기업은행">기업은행</option>
                  <option value="카카오뱅크">카카오뱅크</option>
                  <option value="토스뱅크">토스뱅크</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  계좌번호 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.bankAccount.accountNumber}
                  onChange={(e) => handleBankAccountChange('accountNumber', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-colors"
                  placeholder="1234567890"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  예금주명 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.bankAccount.accountHolder}
                  onChange={(e) => handleBankAccountChange('accountHolder', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-colors"
                  placeholder="홍길동"
                />
              </div>
            </div>
          </div>

          {/* Notice */}
          <div className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-6 mb-8">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-indigo-900">
                <p className="font-semibold mb-2">신청 안내</p>
                <ul className="space-y-1 text-indigo-700">
                  <li>• 신청 후 관리자 검토를 거쳐 1-2영업일 내 승인됩니다</li>
                  <li>• 승인 시 이메일로 알림을 받으실 수 있습니다</li>
                  <li>• 정산은 PG사를 통해 자동으로 이루어집니다</li>
                  <li>• 기본 수수료율은 15%이며, 개별 협의 가능합니다</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-amber-500 hover:from-indigo-500 hover:to-amber-400 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                신청 중...
              </>
            ) : (
              <>
                신청 완료
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </motion.form>
      </div>
    </div>
  );
}
