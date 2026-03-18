import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getVendor } from '@/lib/vendors';
import { isAdmin } from '@/lib/users';

/**
 * GET /api/vendors/[vendorId]/products
 * 판매자별 상품 목록 조회
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ vendorId: string }> }
) {
  try {
    const { vendorId } = await context.params;
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');

    // 판매자 존재 확인
    const vendor = await getVendor(vendorId);
    if (!vendor) {
      return NextResponse.json(
        {
          success: false,
          error: 'Vendor not found',
        },
        { status: 404 }
      );
    }

    // TODO: 권한 검증
    // 승인되지 않은 판매자의 상품은 본인 또는 관리자만 조회 가능
    // const userId = await getCurrentUserId(request);
    // if (vendor.status !== 'approved') {
    //   if (!userId || (userId !== vendor.ownerId && !(await isAdmin(userId)))) {
    //     return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    //   }
    // }

    // Firestore 쿼리
    const productsRef = collection(db, 'products');
    let q = query(
      productsRef,
      where('vendorId', '==', vendorId),
      orderBy('createdAt', 'desc')
    );

    // isActive 필터
    if (isActive !== null) {
      q = query(
        productsRef,
        where('vendorId', '==', vendorId),
        where('isActive', '==', isActive === 'true'),
        orderBy('createdAt', 'desc')
      );
    }

    const querySnapshot = await getDocs(q);

    const products = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
    }));

    return NextResponse.json(
      {
        success: true,
        products,
        count: products.length,
        vendor: {
          id: vendor.id,
          businessName: vendor.businessName,
          status: vendor.status,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error fetching vendor products:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
