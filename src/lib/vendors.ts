'use server';

import { db } from '@/lib/firebase';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp,
  addDoc,
} from 'firebase/firestore';

export type VendorStatus = 'pending' | 'approved' | 'suspended' | 'rejected';

export interface Vendor {
  id: string;
  ownerId: string; // users.uid

  // 판매자 정보
  businessName: string;
  businessNumber?: string; // 사업자등록번호 (선택)
  ownerName: string;
  email: string;
  phone: string;

  // PortOne 배분정산 정보
  portone: {
    merchantId?: string; // PortOne 서브계정 ID
    accountVerified: boolean; // 계좌 인증 완료 여부
  };

  // 정산 정보
  bankAccount: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };

  // 수수료 (개별 설정)
  commissionRate: number; // 0.15 = 15% (기본값)

  // 상태
  status: VendorStatus;

  // 통계 (캐시)
  stats?: {
    totalSales: number;
    totalOrders: number;
    totalProducts: number;
  };

  createdAt: Timestamp;
  updatedAt: Timestamp;
  approvedAt?: Timestamp;
}

/**
 * 기본 수수료율
 */
const DEFAULT_COMMISSION_RATE = parseFloat(process.env.NEXT_PUBLIC_DEFAULT_COMMISSION_RATE || '0.15');

/**
 * 판매자 정보 조회
 */
export async function getVendor(vendorId: string): Promise<Vendor | null> {
  try {
    const vendorRef = doc(db, 'vendors', vendorId);
    const vendorDoc = await getDoc(vendorRef);

    if (!vendorDoc.exists()) {
      return null;
    }

    return { id: vendorDoc.id, ...vendorDoc.data() } as Vendor;
  } catch (error) {
    console.error('❌ Error getting vendor:', error);
    return null;
  }
}

/**
 * ownerId로 판매자 조회
 */
export async function getVendorByOwnerId(ownerId: string): Promise<Vendor | null> {
  try {
    const vendorsRef = collection(db, 'vendors');
    const q = query(vendorsRef, where('ownerId', '==', ownerId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const vendorDoc = querySnapshot.docs[0];
    return { id: vendorDoc.id, ...vendorDoc.data() } as Vendor;
  } catch (error) {
    console.error('❌ Error getting vendor by ownerId:', error);
    return null;
  }
}

/**
 * 판매자 생성 (신청)
 */
export async function createVendor(
  data: Omit<Vendor, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'stats' | 'portone'> & {
    portone?: Partial<Vendor['portone']>;
  }
): Promise<Vendor> {
  try {
    // 이미 판매자가 존재하는지 확인
    const existingVendor = await getVendorByOwnerId(data.ownerId);
    if (existingVendor) {
      throw new Error('Vendor already exists for this user');
    }

    const vendorsRef = collection(db, 'vendors');

    // undefined 필드 제거 (Firestore는 undefined를 허용하지 않음)
    const cleanData: any = {
      ownerId: data.ownerId,
      businessName: data.businessName,
      ownerName: data.ownerName,
      email: data.email,
      phone: data.phone,
      bankAccount: data.bankAccount,
    };

    // 선택 필드만 포함
    if (data.businessNumber) {
      cleanData.businessNumber = data.businessNumber;
    }

    const newVendor = {
      ...cleanData,
      portone: {
        merchantId: data.portone?.merchantId || null,
        accountVerified: data.portone?.accountVerified || false,
      },
      commissionRate: data.commissionRate || DEFAULT_COMMISSION_RATE,
      status: 'pending' as VendorStatus,
      stats: {
        totalSales: 0,
        totalOrders: 0,
        totalProducts: 0,
      },
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(vendorsRef, newVendor);

    console.log(`✅ Created vendor: ${docRef.id}`);

    return { id: docRef.id, ...newVendor } as Vendor;
  } catch (error) {
    console.error('❌ Error creating vendor:', error);
    throw error;
  }
}

/**
 * 판매자 정보 수정
 */
export async function updateVendor(
  vendorId: string,
  data: Partial<Omit<Vendor, 'id' | 'ownerId' | 'createdAt' | 'stats'>>
): Promise<void> {
  try {
    const vendorRef = doc(db, 'vendors', vendorId);

    await updateDoc(vendorRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });

    console.log(`✅ Updated vendor: ${vendorId}`);
  } catch (error) {
    console.error('❌ Error updating vendor:', error);
    throw error;
  }
}

/**
 * 판매자 승인 (Admin)
 */
export async function approveVendor(vendorId: string, commissionRate?: number): Promise<void> {
  try {
    const vendorRef = doc(db, 'vendors', vendorId);

    // 현재 판매자 정보 조회 (이메일 발송용)
    const vendorDoc = await getDoc(vendorRef);
    if (!vendorDoc.exists()) {
      throw new Error('Vendor not found');
    }
    const vendorData = vendorDoc.data() as Vendor;

    const updateData: any = {
      status: 'approved',
      approvedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    if (commissionRate !== undefined) {
      updateData.commissionRate = commissionRate;
    }

    await updateDoc(vendorRef, updateData);

    console.log(`✅ Approved vendor: ${vendorId}${commissionRate ? ` with commission rate ${commissionRate * 100}%` : ''}`);

    // 승인 이메일 발송
    try {
      const { sendVendorApprovedEmail } = await import('./email');
      await sendVendorApprovedEmail(vendorData.email, {
        vendorName: vendorData.ownerName,
        businessName: vendorData.businessName,
        commissionRate: commissionRate || vendorData.commissionRate,
        dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3300'}/mypage/vendor`,
      });
    } catch (emailError) {
      console.error('⚠️ Failed to send approval email:', emailError);
      // 이메일 실패는 전체 프로세스를 중단하지 않음
    }
  } catch (error) {
    console.error('❌ Error approving vendor:', error);
    throw error;
  }
}

/**
 * 판매자 거부 (Admin)
 */
export async function rejectVendor(vendorId: string, reason?: string): Promise<void> {
  try {
    const vendorRef = doc(db, 'vendors', vendorId);

    // 현재 판매자 정보 조회
    const vendorDoc = await getDoc(vendorRef);
    if (!vendorDoc.exists()) {
      throw new Error('Vendor not found');
    }
    const vendorData = vendorDoc.data() as Vendor;

    await updateDoc(vendorRef, {
      status: 'rejected',
      updatedAt: Timestamp.now(),
    });

    console.log(`✅ Rejected vendor: ${vendorId}`);

    // 거부 이메일 발송
    try {
      const { sendVendorRejectedEmail } = await import('./email');
      await sendVendorRejectedEmail(vendorData.email, {
        vendorName: vendorData.ownerName,
        businessName: vendorData.businessName,
        reason,
      });
    } catch (emailError) {
      console.error('⚠️ Failed to send rejection email:', emailError);
    }
  } catch (error) {
    console.error('❌ Error rejecting vendor:', error);
    throw error;
  }
}

/**
 * 판매자 정지 (Admin)
 */
export async function suspendVendor(vendorId: string): Promise<void> {
  try {
    const vendorRef = doc(db, 'vendors', vendorId);

    await updateDoc(vendorRef, {
      status: 'suspended',
      updatedAt: Timestamp.now(),
    });

    console.log(`✅ Suspended vendor: ${vendorId}`);

    // TODO: 정지 이메일 발송
  } catch (error) {
    console.error('❌ Error suspending vendor:', error);
    throw error;
  }
}

/**
 * 판매자 목록 조회
 */
export async function getAllVendors(status?: VendorStatus): Promise<Vendor[]> {
  try {
    const vendorsRef = collection(db, 'vendors');
    let q;

    if (status) {
      // status 필터링 시 orderBy는 메모리에서 처리 (Firestore 인덱스 불필요)
      q = query(vendorsRef, where('status', '==', status));
    } else {
      q = query(vendorsRef, orderBy('createdAt', 'desc'));
    }

    const querySnapshot = await getDocs(q);

    const vendors: Vendor[] = [];
    querySnapshot.forEach((doc) => {
      vendors.push({ id: doc.id, ...doc.data() } as Vendor);
    });

    // status 필터링 시 메모리에서 정렬
    if (status) {
      vendors.sort((a, b) => {
        const aTime = a.createdAt?.seconds || 0;
        const bTime = b.createdAt?.seconds || 0;
        return bTime - aTime; // 최신순
      });
    }

    return vendors;
  } catch (error) {
    console.error('❌ Error getting vendors:', error);
    return [];
  }
}

/**
 * 판매자 통계 조회
 */
export async function getVendorStats(vendorId: string) {
  try {
    const vendor = await getVendor(vendorId);
    if (!vendor) {
      throw new Error('Vendor not found');
    }

    return vendor.stats || {
      totalSales: 0,
      totalOrders: 0,
      totalProducts: 0,
    };
  } catch (error) {
    console.error('❌ Error getting vendor stats:', error);
    return {
      totalSales: 0,
      totalOrders: 0,
      totalProducts: 0,
    };
  }
}

/**
 * 판매자 통계 업데이트
 */
export async function updateVendorStats(
  vendorId: string,
  stats: Partial<Vendor['stats']>
): Promise<void> {
  try {
    const vendorRef = doc(db, 'vendors', vendorId);
    const vendorDoc = await getDoc(vendorRef);

    if (!vendorDoc.exists()) {
      throw new Error('Vendor not found');
    }

    const currentStats = (vendorDoc.data() as Vendor).stats || {
      totalSales: 0,
      totalOrders: 0,
      totalProducts: 0,
    };

    await updateDoc(vendorRef, {
      stats: {
        ...currentStats,
        ...stats,
      },
      updatedAt: Timestamp.now(),
    });

    console.log(`✅ Updated vendor stats: ${vendorId}`);
  } catch (error) {
    console.error('❌ Error updating vendor stats:', error);
    throw error;
  }
}

/**
 * 판매자 상품 수 증가
 */
export async function incrementVendorProductCount(vendorId: string): Promise<void> {
  try {
    const stats = await getVendorStats(vendorId);
    await updateVendorStats(vendorId, {
      totalProducts: stats.totalProducts + 1,
    });
  } catch (error) {
    console.error('❌ Error incrementing vendor product count:', error);
  }
}

/**
 * 판매자 상품 수 감소
 */
export async function decrementVendorProductCount(vendorId: string): Promise<void> {
  try {
    const stats = await getVendorStats(vendorId);
    await updateVendorStats(vendorId, {
      totalProducts: Math.max(0, stats.totalProducts - 1),
    });
  } catch (error) {
    console.error('❌ Error decrementing vendor product count:', error);
  }
}

/**
 * 판매자 주문 및 매출 통계 업데이트
 */
export async function recordVendorSale(vendorId: string, amount: number): Promise<void> {
  try {
    const stats = await getVendorStats(vendorId);
    await updateVendorStats(vendorId, {
      totalSales: stats.totalSales + amount,
      totalOrders: stats.totalOrders + 1,
    });

    console.log(`✅ Recorded sale for vendor ${vendorId}: ${amount} KRW`);
  } catch (error) {
    console.error('❌ Error recording vendor sale:', error);
  }
}

/**
 * 플랫폼 기본 판매자 생성 (마이그레이션용)
 */
export async function createPlatformVendor(): Promise<Vendor> {
  try {
    const PLATFORM_VENDOR_ID = 'PLATFORM_DEFAULT';
    const existingVendor = await getVendor(PLATFORM_VENDOR_ID);

    if (existingVendor) {
      console.log('ℹ️ Platform vendor already exists');
      return existingVendor;
    }

    const vendorRef = doc(db, 'vendors', PLATFORM_VENDOR_ID);

    const platformVendor: Omit<Vendor, 'id'> = {
      ownerId: 'SYSTEM',
      businessName: 'GOODZZ',
      ownerName: 'Platform Admin',
      email: process.env.ADMIN_EMAILS?.split(',')[0].trim() || 'admin@goodzz.co.kr',
      phone: '010-0000-0000',
      portone: {
        accountVerified: true,
      },
      bankAccount: {
        bankName: 'Platform',
        accountNumber: 'N/A',
        accountHolder: 'GOODZZ',
      },
      commissionRate: 0, // 플랫폼은 수수료 없음
      status: 'approved',
      stats: {
        totalSales: 0,
        totalOrders: 0,
        totalProducts: 0,
      },
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      approvedAt: Timestamp.now(),
    };

    await setDoc(vendorRef, platformVendor);

    console.log('✅ Created platform vendor');

    return { id: PLATFORM_VENDOR_ID, ...platformVendor };
  } catch (error) {
    console.error('❌ Error creating platform vendor:', error);
    throw error;
  }
}
