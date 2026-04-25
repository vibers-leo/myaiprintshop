import {
  collection, doc, getDocs, getDoc, addDoc, updateDoc, query, where, orderBy, Timestamp, DocumentData
} from 'firebase/firestore';
import { db } from './firebase';
import { createNotification } from './notifications';

export interface PointTransaction {
  id: string;
  userId: string;
  amount: number;           // +적립, -사용
  balance: number;          // 트랜잭션 후 잔액
  type: 'earn' | 'use' | 'expire' | 'admin';
  reason: string;           // "주문 적립", "리뷰 작성", "이벤트" 등
  relatedType?: string;     // 'order', 'review', 'event'
  relatedId?: string;       // orderId, reviewId 등
  expireDate?: string;      // 적립 포인트 만료일
  expired?: boolean;
  createdAt: string;
}

export interface PointBalance {
  userId: string;
  totalPoints: number;
  availablePoints: number;  // 만료되지 않은 사용 가능 포인트
}

// 포인트 설정
export const POINT_CONFIG = {
  earnRate: 0.01,           // 구매 금액의 1% 적립
  reviewReward: 500,        // 리뷰 작성 시 500P
  photoReviewReward: 1000,  // 포토리뷰 시 1000P
  signupReward: 3000,       // 회원가입 시 3000P
  expiryMonths: 12,         // 적립 후 12개월 만료
};

const pointsCollection = collection(db, 'points');

function docToPoint(data: DocumentData, id: string): PointTransaction {
  return {
    id,
    userId: data.userId || '',
    amount: data.amount || 0,
    balance: data.balance || 0,
    type: data.type || 'earn',
    reason: data.reason || '',
    relatedType: data.relatedType,
    relatedId: data.relatedId,
    expireDate: data.expireDate,
    expired: data.expired || false,
    createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
  };
}

// 사용자 포인트 잔액 조회
export async function getPointBalance(userId: string): Promise<number> {
  const userDoc = await getDoc(doc(db, 'users', userId));
  return userDoc.exists() ? (userDoc.data().pointBalance || 0) : 0;
}

// 포인트 내역 조회
export async function getPointHistory(userId: string): Promise<PointTransaction[]> {
  try {
    const q = query(pointsCollection, where('userId', '==', userId), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => docToPoint(d.data(), d.id));
  } catch {
    const q = query(pointsCollection, where('userId', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map(d => docToPoint(d.data(), d.id))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}

// 포인트 적립
export async function earnPoints(
  userId: string,
  amount: number,
  reason: string,
  relatedType?: string,
  relatedId?: string,
): Promise<boolean> {
  try {
    const currentBalance = await getPointBalance(userId);
    const newBalance = currentBalance + amount;

    const expireDate = new Date();
    expireDate.setMonth(expireDate.getMonth() + POINT_CONFIG.expiryMonths);

    await addDoc(pointsCollection, {
      userId,
      amount,
      balance: newBalance,
      type: 'earn',
      reason,
      relatedType,
      relatedId,
      expireDate: expireDate.toISOString(),
      expired: false,
      createdAt: Timestamp.now(),
    });

    // users 컬렉션의 잔액 업데이트
    await updateDoc(doc(db, 'users', userId), { pointBalance: newBalance });

    // 알림
    createNotification({
      userId,
      type: 'point',
      title: `${amount.toLocaleString()}P가 적립됐어요`,
      message: `${reason}으로 받은 포인트예요 — 현재 잔액 ${newBalance.toLocaleString()}P`,
      link: '/mypage/points',
    }).catch(() => {});

    return true;
  } catch (error) {
    console.error('Error earning points:', error);
    return false;
  }
}

// 포인트 사용
export async function usePoints(
  userId: string,
  amount: number,
  reason: string,
  relatedType?: string,
  relatedId?: string,
): Promise<boolean> {
  try {
    const currentBalance = await getPointBalance(userId);
    if (currentBalance < amount) return false;

    const newBalance = currentBalance - amount;

    await addDoc(pointsCollection, {
      userId,
      amount: -amount,
      balance: newBalance,
      type: 'use',
      reason,
      relatedType,
      relatedId,
      createdAt: Timestamp.now(),
    });

    await updateDoc(doc(db, 'users', userId), { pointBalance: newBalance });
    return true;
  } catch (error) {
    console.error('Error using points:', error);
    return false;
  }
}

// 관리자 포인트 지급/차감
export async function adminAdjustPoints(
  userId: string,
  amount: number,
  reason: string,
): Promise<boolean> {
  try {
    const currentBalance = await getPointBalance(userId);
    const newBalance = currentBalance + amount;
    if (newBalance < 0) return false;

    await addDoc(pointsCollection, {
      userId,
      amount,
      balance: newBalance,
      type: 'admin',
      reason,
      createdAt: Timestamp.now(),
    });

    await updateDoc(doc(db, 'users', userId), { pointBalance: newBalance });
    return true;
  } catch (error) {
    console.error('Error adjusting points:', error);
    return false;
  }
}
