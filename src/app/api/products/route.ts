import { NextRequest, NextResponse } from 'next/server';
import {
  getProducts,
  getBestProducts,
  getNewProducts,
  searchProducts,
  createProduct,
  Product
} from '@/lib/products';
import { MOCK_PRODUCTS } from '@/lib/mock-data';
import { getDbCategories, getSubCategoryDbValue } from '@/lib/categories';
import { requireAdmin } from '@/lib/auth-middleware';

// Mock 상품을 DB 상품 형태로 변환
function mockToProduct(mock: typeof MOCK_PRODUCTS[0]): Product {
  return {
    id: mock.id,
    name: mock.name,
    price: mock.price,
    originalPrice: mock.originalPrice,
    thumbnail: mock.thumbnail,
    images: [mock.thumbnail],
    category: mock.category,
    badge: mock.badge as Product['badge'],
    tags: [],
    options: {
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      colors: [
        { name: 'White', hex: '#FFFFFF' },
        { name: 'Black', hex: '#000000' },
        { name: 'Navy', hex: '#1E3A5F' },
      ],
    },
    stock: 100,
    isActive: true,
    reviewCount: mock.reviewCount,
    rating: mock.rating,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// GET: 상품 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    const type = searchParams.get('type'); // 'best', 'new', 'search'
    const q = searchParams.get('q'); // 검색어
    const limitCount = searchParams.get('limit');

    let products: Product[] = [];

    // Firebase에서 가져오기 시도
    try {
      if (type === 'best') {
        products = await getBestProducts(parseInt(limitCount || '6'));
      } else if (type === 'new') {
        products = await getNewProducts(parseInt(limitCount || '8'));
      } else if (type === 'search' && q) {
        products = await searchProducts(q);
      } else {
        // Category slug를 DB 카테고리명으로 변환
        const categoryFilter = category ? getDbCategories(category) : undefined;

        products = await getProducts({
          category: categoryFilter && categoryFilter.length > 0 ? categoryFilter : undefined,
          isActive: true,
          limitCount: limitCount ? parseInt(limitCount) : undefined,
        });

        // 서브카테고리 필터링 (추가)
        if (category && subcategory) {
          const subCategoryDbValue = getSubCategoryDbValue(category, subcategory);
          if (subCategoryDbValue) {
            products = products.filter(p => p.subcategory === subCategoryDbValue);
          }
        }
      }
    } catch (firebaseError) {
      console.warn('Firebase not configured, using mock data:', firebaseError);
    }
    
    // Firebase 데이터가 없으면 개발 모드에서만 Mock 데이터 사용
    if (products.length === 0) {
      const isDevelopment = process.env.NODE_ENV === 'development';

      if (isDevelopment) {
        console.warn('⚠️ WARNING: Firestore is empty. Using mock data as fallback.');
        console.warn('   Run "npm run seed" to populate Firestore with products.');

        let mockProducts = MOCK_PRODUCTS.map(mockToProduct);

        // 카테고리 필터링
        if (category) {
          mockProducts = mockProducts.filter(p => p.category === category);
        }

        // 검색어 필터링
        if (q) {
          const query = q.toLowerCase();
          mockProducts = mockProducts.filter(p =>
            p.name.toLowerCase().includes(query) ||
            p.category.toLowerCase().includes(query)
          );
        }

        // 타입별 정렬
        if (type === 'best') {
          mockProducts.sort((a, b) => b.reviewCount - a.reviewCount);
          mockProducts = mockProducts.slice(0, parseInt(limitCount || '6'));
        } else if (type === 'new') {
          mockProducts = mockProducts.slice(0, parseInt(limitCount || '8'));
        }

        products = mockProducts;
      } else {
        // 프로덕션에서는 빈 배열 반환 (에러는 아님)
        console.error('❌ No products found in Firestore (Production mode)');
      }
    }
    
    return NextResponse.json({
      success: true,
      products,
      total: products.length,
    });
    
  } catch (error) {
    console.error('Error in products API:', error);
    return NextResponse.json(
      { error: '상품 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// POST: 상품 생성 (관리자 전용)
export async function POST(request: NextRequest) {
  try {
    // 관리자 인증 검사
    const authError = await requireAdmin(request);
    if (authError) return authError;

    const body = await request.json();
    const { name, price, category, thumbnail, stock } = body;

    if (!name || !price || !category || !thumbnail) {
      return NextResponse.json(
        { error: '필수 상품 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    const productId = await createProduct({
      name,
      price: Number(price),
      category,
      thumbnail,
      stock: Number(stock || 100),
      isActive: true,
      reviewCount: 0,
      rating: 0,
      tags: body.tags || [],
      description: body.description || '',
      images: body.images || [thumbnail],
      options: body.options || {
        sizes: ['S', 'M', 'L', 'XL'],
        colors: [{ name: 'White', hex: '#FFFFFF' }]
      }
    });

    if (!productId) {
      return NextResponse.json(
        { error: '상품 생성에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '상품이 성공적으로 등록되었습니다.',
      productId,
    });

  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: '상품 등록 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

