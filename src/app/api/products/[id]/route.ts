import { NextRequest, NextResponse } from 'next/server';
import { 
  getProductById,
  updateProduct,
  deleteProduct,
  Product
} from '@/lib/products';
import { MOCK_PRODUCTS } from '@/lib/mock-data';

// Mock 상품을 DB 상품 형태로 변환 (Fallback용)
function mockToProduct(mock: typeof MOCK_PRODUCTS[0]): Product {
  return {
    id: mock.id,
    name: mock.name,
    price: mock.price,
    originalPrice: mock.originalPrice,
    thumbnail: mock.thumbnail,
    images: [mock.thumbnail, mock.thumbnail, mock.thumbnail], // 더미 상세 이미지
    category: mock.category,
    badge: mock.badge as any,
    tags: ['AI 커스텀', '인기상품', '프리미엄'],
    options: {
      groups: [
        {
          id: 'opt_material',
          name: 'Material',
          label: '원단 소재',
          type: 'select',
          required: true,
          values: [
            { id: 'v1', label: '일반 코튼', priceAdded: 0 },
            { id: 'v2', label: '프리미엄 캔버스', priceAdded: 3000 }
          ]
        },
        {
          id: 'opt_print',
          name: 'PrintMethod',
          label: '인쇄 방식',
          type: 'radio',
          required: true,
          values: [
            { id: 'vp1', label: '단면 인쇄', priceMultiplier: 1 },
            { id: 'vp2', label: '양면 인쇄', priceMultiplier: 1.5 }
          ]
        }
      ]
    },
    stock: 100,
    isActive: true,
    reviewCount: mock.reviewCount,
    rating: mock.rating,
    volumePricing: [
        { minQuantity: 10, discountRate: 0.1 },
        { minQuantity: 50, discountRate: 0.2 },
        { minQuantity: 100, discountRate: 0.3 }
    ],
    vendorId: 'PLATFORM_DEFAULT',
    vendorType: 'platform',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// GET: 단일 상품 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let product = await getProductById(id);
    
    // 개발 모드에서만 Mock 데이터 Fallback
    if (!product) {
      const isDevelopment = process.env.NODE_ENV === 'development';

      if (isDevelopment) {
        const mock = MOCK_PRODUCTS.find(p => p.id === id);
        if (mock) {
          console.warn(`⚠️ Fallback to mock product for ID: ${id}`);
          console.warn('   This product does not exist in Firestore.');
          product = mockToProduct(mock);
        }
      }
    }

    if (!product) {
      return NextResponse.json(
        { error: '상품을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: '상품 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// PATCH: 상품 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const success = await updateProduct(id, body);
    
    if (!success) {
      return NextResponse.json(
        { error: '상품 수정에 실패했습니다.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: '상품이 수정되었습니다.',
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: '상품 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// DELETE: 상품 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await deleteProduct(id);
    
    if (!success) {
      return NextResponse.json(
        { error: '상품 삭제에 실패했습니다.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: '상품이 삭제되었습니다.',
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: '상품 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
