'use client';

import { useState } from 'react';
import { Key, Mail, User, CheckCircle2, Copy, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function DeveloperSignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    purpose: '',
  });

  const [apiKey, setApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/developers/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to create API key');
      }

      setApiKey(data.data.apiKey);
      toast.success('API 키가 발급되었습니다!');
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(error.message || 'API 키 발급 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const copyApiKey = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      toast.success('API 키가 클립보드에 복사되었습니다!');
    }
  };

  if (apiKey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-black mb-2">API 키 발급 완료!</h1>
            <p className="text-gray-600">
              아래 API 키를 안전한 곳에 보관하세요. 다시 표시되지 않습니다.
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Key className="w-5 h-5 text-indigo-600" />
              <span className="font-bold text-sm">Your API Key</span>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-white px-4 py-3 rounded-lg font-mono text-sm border border-gray-200 overflow-x-auto">
                {apiKey}
              </code>
              <button
                onClick={copyApiKey}
                className="px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy
              </button>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-amber-800 font-semibold mb-2">⚠️ 중요</p>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• API 키는 안전하게 보관하세요</li>
              <li>• 절대 공개 저장소나 클라이언트 코드에 포함하지 마세요</li>
              <li>• 환경 변수로 관리하는 것을 권장합니다</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Link
              href="/developers/docs"
              className="block w-full text-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              API 문서 보기
            </Link>
            <Link
              href="/developers/dashboard"
              className="block w-full text-center px-6 py-3 bg-white text-gray-700 border-2 border-gray-200 rounded-xl font-bold hover:border-indigo-600 transition-all"
            >
              대시보드로 이동
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <h3 className="font-bold mb-3">Quick Start</h3>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto">
              <code>{`fetch('https://goodzz.co.kr/api/public/v1/products', {
  headers: {
    'x-api-key': '${apiKey}'
  }
})
  .then(res => res.json())
  .then(data => console.log(data));`}</code>
            </pre>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Key className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black mb-2">Get Your API Key</h1>
          <p className="text-gray-600">
            Fill out the form below to get instant access to GOODZZ Public API
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
              <User className="w-4 h-4" />
              Name / Company
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Your name or company name"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-600 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
              <Mail className="w-4 h-4" />
              Email
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="your@email.com"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-600 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
              Purpose (Optional)
            </label>
            <textarea
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              placeholder="Tell us how you plan to use the API..."
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-600 focus:outline-none transition-colors resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Generating API Key...' : 'Get API Key'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-600">
            By signing up, you agree to our{' '}
            <Link href="/terms" className="text-indigo-600 hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-indigo-600 hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>

        <div className="mt-6 bg-indigo-50 rounded-xl p-4">
          <p className="text-sm text-indigo-900 font-semibold mb-2">Free Tier Includes:</p>
          <ul className="text-sm text-indigo-700 space-y-1">
            <li>• 100 requests/hour</li>
            <li>• 1,000 requests/day</li>
            <li>• All API endpoints</li>
            <li>• Community support</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
