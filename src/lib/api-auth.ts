import { db } from './firebase';
import { collection, query, where, getDocs, addDoc, Timestamp, doc, getDoc, updateDoc, increment } from 'firebase/firestore';

/**
 * API Partner 타입
 */
export interface ApiPartner {
  id: string;
  apiKey: string;
  name: string;
  email: string;
  tier: 'free' | 'basic' | 'pro' | 'enterprise';
  status: 'active' | 'suspended' | 'inactive';
  rateLimit: {
    requestsPerHour: number;
    requestsPerDay: number;
  };
  usage: {
    totalRequests: number;
    lastRequestAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Rate Limit 설정 (Tier별)
 */
const TIER_LIMITS = {
  free: {
    requestsPerHour: 100,
    requestsPerDay: 1000,
  },
  basic: {
    requestsPerHour: 1000,
    requestsPerDay: 10000,
  },
  pro: {
    requestsPerHour: 5000,
    requestsPerDay: 50000,
  },
  enterprise: {
    requestsPerHour: 20000,
    requestsPerDay: 200000,
  },
};

/**
 * API 키 생성 (sk_live_... 또는 sk_test_...)
 */
export function generateApiKey(isTest: boolean = false): string {
  const prefix = isTest ? 'sk_test_' : 'sk_live_';
  const random = Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
  return prefix + random;
}

/**
 * API 키 검증
 */
export async function validateApiKey(apiKey: string): Promise<ApiPartner | null> {
  try {
    const partnersRef = collection(db, 'api_partners');
    const q = query(partnersRef, where('apiKey', '==', apiKey));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const partnerDoc = querySnapshot.docs[0];
    const data = partnerDoc.data();

    return {
      id: partnerDoc.id,
      apiKey: data.apiKey,
      name: data.name,
      email: data.email,
      tier: data.tier || 'free',
      status: data.status || 'active',
      rateLimit: data.rateLimit || TIER_LIMITS.free,
      usage: {
        totalRequests: data.usage?.totalRequests || 0,
        lastRequestAt: data.usage?.lastRequestAt?.toDate(),
      },
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    };
  } catch (error) {
    console.error('Error validating API key:', error);
    return null;
  }
}

/**
 * Rate Limit 체크
 *
 * 간단한 구현: Firestore 쿼리로 최근 1시간/1일 사용량 확인
 * 프로덕션: Redis 등 사용 권장
 */
export async function checkRateLimit(partnerId: string, limit: string): Promise<boolean> {
  try {
    const partner = await getPartnerById(partnerId);
    if (!partner) return false;

    const [requestsStr, period] = limit.split('/');
    const maxRequests = parseInt(requestsStr);

    // 시간 범위 계산
    const now = new Date();
    let startTime: Date;

    if (period === 'hour') {
      startTime = new Date(now.getTime() - 60 * 60 * 1000);
    } else if (period === 'day') {
      startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    } else {
      return true; // 잘못된 period
    }

    // 최근 사용량 조회
    const usageLogsRef = collection(db, 'api_usage_logs');
    const q = query(
      usageLogsRef,
      where('partnerId', '==', partnerId),
      where('timestamp', '>=', Timestamp.fromDate(startTime))
    );

    const querySnapshot = await getDocs(q);
    const requestCount = querySnapshot.size;

    return requestCount < maxRequests;
  } catch (error) {
    console.error('Error checking rate limit:', error);
    return false; // 에러 시 보수적으로 false 반환
  }
}

/**
 * API 사용량 로깅
 */
export async function logApiUsage(
  partnerId: string,
  endpoint: string,
  metadata?: any
): Promise<void> {
  try {
    const usageLogsRef = collection(db, 'api_usage_logs');
    await addDoc(usageLogsRef, {
      partnerId,
      endpoint,
      metadata: metadata || {},
      timestamp: Timestamp.now(),
    });

    // Partner의 총 사용량 업데이트
    const partnerRef = doc(db, 'api_partners', partnerId);
    await updateDoc(partnerRef, {
      'usage.totalRequests': increment(1),
      'usage.lastRequestAt': Timestamp.now(),
    });
  } catch (error) {
    console.error('Error logging API usage:', error);
    // 로깅 실패는 API 응답에 영향 주지 않음
  }
}

/**
 * API Partner 생성 (개발자 신청 시)
 */
export async function createApiPartner(data: {
  name: string;
  email: string;
  tier?: ApiPartner['tier'];
}): Promise<{ partnerId: string; apiKey: string }> {
  try {
    const apiKey = generateApiKey(false);
    const tier = data.tier || 'free';

    const partnersRef = collection(db, 'api_partners');
    const docRef = await addDoc(partnersRef, {
      apiKey,
      name: data.name,
      email: data.email,
      tier,
      status: 'active',
      rateLimit: TIER_LIMITS[tier],
      usage: {
        totalRequests: 0,
      },
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return {
      partnerId: docRef.id,
      apiKey,
    };
  } catch (error) {
    console.error('Error creating API partner:', error);
    throw error;
  }
}

/**
 * Partner 정보 조회
 */
async function getPartnerById(partnerId: string): Promise<ApiPartner | null> {
  try {
    const partnerRef = doc(db, 'api_partners', partnerId);
    const partnerDoc = await getDoc(partnerRef);

    if (!partnerDoc.exists()) {
      return null;
    }

    const data = partnerDoc.data();
    return {
      id: partnerDoc.id,
      apiKey: data.apiKey,
      name: data.name,
      email: data.email,
      tier: data.tier,
      status: data.status,
      rateLimit: data.rateLimit,
      usage: {
        totalRequests: data.usage?.totalRequests || 0,
        lastRequestAt: data.usage?.lastRequestAt?.toDate(),
      },
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    };
  } catch (error) {
    console.error('Error getting partner:', error);
    return null;
  }
}

/**
 * API 키 재발급
 */
export async function regenerateApiKey(partnerId: string): Promise<string | null> {
  try {
    const newApiKey = generateApiKey(false);
    const partnerRef = doc(db, 'api_partners', partnerId);

    await updateDoc(partnerRef, {
      apiKey: newApiKey,
      updatedAt: Timestamp.now(),
    });

    return newApiKey;
  } catch (error) {
    console.error('Error regenerating API key:', error);
    return null;
  }
}

/**
 * Partner 상태 업데이트
 */
export async function updatePartnerStatus(
  partnerId: string,
  status: ApiPartner['status']
): Promise<boolean> {
  try {
    const partnerRef = doc(db, 'api_partners', partnerId);
    await updateDoc(partnerRef, {
      status,
      updatedAt: Timestamp.now(),
    });
    return true;
  } catch (error) {
    console.error('Error updating partner status:', error);
    return false;
  }
}

/**
 * Partner Tier 업그레이드
 */
export async function upgradeTier(
  partnerId: string,
  newTier: ApiPartner['tier']
): Promise<boolean> {
  try {
    const partnerRef = doc(db, 'api_partners', partnerId);
    await updateDoc(partnerRef, {
      tier: newTier,
      rateLimit: TIER_LIMITS[newTier],
      updatedAt: Timestamp.now(),
    });
    return true;
  } catch (error) {
    console.error('Error upgrading tier:', error);
    return false;
  }
}
