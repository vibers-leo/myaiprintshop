import { db } from './firebase';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';

/**
 * SDK Session 타입
 *
 * Buy Button SDK가 결제 팝업을 열 때 생성되는 단기 세션
 * 15분 후 자동 만료되며, 한 번만 사용 가능
 */
export interface SDKSession {
  id: string;
  partnerId: string;
  productId: string;
  options?: Record<string, any>;
  createdAt: Date;
  expiresAt: Date;
  used: boolean;
}

/**
 * 세션 유효성 검증
 *
 * 다음 조건을 모두 만족해야 유효한 세션:
 * 1. 세션이 존재함
 * 2. 만료되지 않음 (현재 시간 < expiresAt)
 * 3. 아직 사용되지 않음 (used === false)
 *
 * @param sessionId - 검증할 세션 ID
 * @returns 유효한 세션 데이터 또는 null
 */
export async function validateSession(
  sessionId: string
): Promise<SDKSession | null> {
  try {
    const sessionRef = doc(db, 'sdk_sessions', sessionId);
    const sessionDoc = await getDoc(sessionRef);

    if (!sessionDoc.exists()) {
      console.log(`❌ Session not found: ${sessionId}`);
      return null;
    }

    const data = sessionDoc.data();

    // 만료 시간 확인
    const expiresAt = data.expiresAt?.toDate();
    if (!expiresAt || expiresAt < new Date()) {
      console.log(`❌ Session expired: ${sessionId}`);
      return null;
    }

    // 사용 여부 확인
    if (data.used === true) {
      console.log(`❌ Session already used: ${sessionId}`);
      return null;
    }

    console.log(`✅ Valid session: ${sessionId}`);

    return {
      id: sessionDoc.id,
      partnerId: data.partnerId,
      productId: data.productId,
      options: data.options,
      createdAt: data.createdAt?.toDate() || new Date(),
      expiresAt,
      used: data.used || false,
    };
  } catch (error) {
    console.error('Error validating session:', error);
    return null;
  }
}

/**
 * 세션을 사용됨으로 표시
 *
 * 결제가 성공적으로 시작되면 호출하여
 * 세션이 재사용되지 않도록 방지
 *
 * @param sessionId - 사용 처리할 세션 ID
 */
export async function markSessionUsed(sessionId: string): Promise<void> {
  try {
    const sessionRef = doc(db, 'sdk_sessions', sessionId);
    await updateDoc(sessionRef, {
      used: true,
      usedAt: Timestamp.now(),
    });

    console.log(`✅ Session marked as used: ${sessionId}`);
  } catch (error) {
    console.error('Error marking session as used:', error);
    throw error;
  }
}

/**
 * 세션 정보 조회 (검증 없이)
 *
 * Admin 대시보드 등에서 세션 정보를 확인할 때 사용
 *
 * @param sessionId - 조회할 세션 ID
 * @returns 세션 데이터 또는 null
 */
export async function getSession(
  sessionId: string
): Promise<SDKSession | null> {
  try {
    const sessionRef = doc(db, 'sdk_sessions', sessionId);
    const sessionDoc = await getDoc(sessionRef);

    if (!sessionDoc.exists()) {
      return null;
    }

    const data = sessionDoc.data();

    return {
      id: sessionDoc.id,
      partnerId: data.partnerId,
      productId: data.productId,
      options: data.options,
      createdAt: data.createdAt?.toDate() || new Date(),
      expiresAt: data.expiresAt?.toDate() || new Date(),
      used: data.used || false,
    };
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}
