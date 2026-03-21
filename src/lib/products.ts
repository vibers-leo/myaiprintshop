import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  DocumentData
} from 'firebase/firestore';
import { db } from './firebase';

// 상품 타입 정의
// 자동 견적을 위한 상세 옵션 타입
export interface PricingOptionValue {
  id: string;
  label: string;
  priceAdded?: number;     // 추가 금액 (예: +1000)
  priceMultiplier?: number; // 가중치 (예: x1.2)
  hex?: string;            // 색상 코드 (선택)
}

export interface PricingOptionGroup {
  id: string;
  name: string;
  label: string;
  type: 'select' | 'radio' | 'dimension' | 'number';
  description?: string;
  values: PricingOptionValue[];
  required?: boolean;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number; // 기본 가격
  originalPrice?: number;
  thumbnail: string;
  images?: string[];
  category: string;
  subcategory?: string;
  badge?: 'BEST' | 'NEW' | 'HOT' | 'SALE';
  tags?: string[];
  options?: {
    sizes?: string[]; // (하위 호환 유지)
    colors?: { name: string; hex: string }[]; // (하위 호환 유지)
    groups?: PricingOptionGroup[]; // 새 자동 견적 시스템 옵션
  };
  stock: number;
  isActive: boolean;
  reviewCount: number;
  rating: number;
  printMethod?: 'dtg' | 'screen' | 'sublimation' | 'embroidery' | 'uv' | 'laser';
  volumePricing?: {
    minQuantity: number;
    discountRate: number; // 0.1 means 10% discount
  }[];
  // Multi-vendor fields (Phase 5)
  vendorId: string; // vendors 컬렉션 ID
  vendorName?: string; // 캐시 (판매자명)
  vendorType: 'platform' | 'marketplace'; // 'platform' = MyAIPrintShop 직판
  // Metadata (확장 가능한 추가 정보)
  metadata?: Record<string, any>; // WowPress 연동 정보, 외부 시스템 ID 등
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

// 상품 생성 데이터 (id 제외)
export type CreateProductInput = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateProductInput = Partial<Omit<Product, 'id' | 'createdAt'>>;

// Firestore 컬렉션 참조
const productsCollection = collection(db, 'products');

// ============ 서버사이드 인메모리 캐시 ============

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const CACHE_TTL = 5 * 60 * 1000; // 5분 (밀리초)
const productCache = new Map<string, CacheEntry<Product[]>>();

function getCacheKey(options?: Record<string, unknown>): string {
  return options ? JSON.stringify(options) : '__all__';
}

function getFromCache(key: string): Product[] | null {
  const entry = productCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    productCache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key: string, data: Product[]): void {
  productCache.set(key, { data, timestamp: Date.now() });
  // 캐시 크기 제한 (최대 50개 키)
  if (productCache.size > 50) {
    const oldestKey = productCache.keys().next().value;
    if (oldestKey !== undefined) {
      productCache.delete(oldestKey);
    }
  }
}

// 문서 데이터를 Product 타입으로 변환
function docToProduct(doc: DocumentData, id: string): Product {
  const data = doc;
  return {
    id,
    name: data.name || '',
    description: data.description,
    price: data.price || 0,
    originalPrice: data.originalPrice,
    thumbnail: data.thumbnail || '',
    images: data.images || [],
    category: data.category || '',
    subcategory: data.subcategory,
    badge: data.badge,
    tags: data.tags || [],
    options: data.options,
    stock: data.stock || 0,
    isActive: data.isActive ?? true,
    reviewCount: data.reviewCount || 0,
    rating: data.rating || 0,
    printMethod: data.printMethod,
    volumePricing: data.volumePricing,
    // Multi-vendor fields (Phase 5)
    vendorId: data.vendorId || 'PLATFORM_DEFAULT',
    vendorName: data.vendorName || 'MyAIPrintShop',
    vendorType: data.vendorType || 'platform',
    createdAt: data.createdAt?.toDate?.() || new Date(),
    updatedAt: data.updatedAt?.toDate?.() || new Date(),
  };
}

// ============ 상품 조회 ============

// 전체 상품 목록 조회
// Firestore where() 쿼리로 카테고리 필터링 최적화 + 인메모리 캐시
export async function getProducts(options?: {
  category?: string | string[]; // 단일 카테고리 또는 카테고리 배열
  isActive?: boolean;
  sortBy?: 'createdAt' | 'price' | 'rating' | 'reviewCount';
  sortOrder?: 'asc' | 'desc';
  limitCount?: number;
}): Promise<Product[]> {
  try {
    // 캐시 확인
    const cacheKey = getCacheKey(options as Record<string, unknown>);
    const cached = getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    // Firestore 쿼리 구성 - 카테고리 필터를 서버사이드에서 처리
    const constraints: Parameters<typeof query>[1][] = [];

    if (options?.isActive !== undefined) {
      constraints.push(where('isActive', '==', options.isActive));
    }

    if (options?.category) {
      if (Array.isArray(options.category)) {
        // Firestore 'in' 쿼리는 최대 30개 값 지원
        if (options.category.length <= 30) {
          constraints.push(where('category', 'in', options.category));
        }
        // 30개 초과 시 클라이언트 필터링으로 폴백 (아래에서 처리)
      } else {
        constraints.push(where('category', '==', options.category));
      }
    }

    let snapshot;
    if (constraints.length > 0) {
      const q = query(productsCollection, ...constraints);
      snapshot = await getDocs(q);
    } else {
      snapshot = await getDocs(productsCollection);
    }

    let products = snapshot.docs.map(d => docToProduct(d.data(), d.id));

    // 30개 초과 카테고리 배열의 경우 클라이언트 필터링 폴백
    if (options?.category && Array.isArray(options.category) && options.category.length > 30) {
      products = products.filter(p => options.category!.includes(p.category));
    }

    // 정렬 (Firestore 복합 인덱스 없이 JS에서 정렬)
    const sortBy = options?.sortBy || 'createdAt';
    const sortOrder = options?.sortOrder || 'desc';
    products.sort((a, b) => {
      const aVal = a[sortBy] instanceof Date ? (a[sortBy] as Date).getTime() : (a[sortBy] as number);
      const bVal = b[sortBy] instanceof Date ? (b[sortBy] as Date).getTime() : (b[sortBy] as number);
      return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
    });

    // 개수 제한
    if (options?.limitCount) {
      products = products.slice(0, options.limitCount);
    }

    // 결과를 캐시에 저장
    setCache(cacheKey, products);

    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

// 단일 상품 조회
export async function getProductById(productId: string): Promise<Product | null> {
  try {
    const docRef = doc(db, 'products', productId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    return docToProduct(docSnap.data(), docSnap.id);
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

// 카테고리별 상품 조회
export async function getProductsByCategory(category: string): Promise<Product[]> {
  return getProducts({ category, isActive: true });
}

// 베스트 상품 조회
export async function getBestProducts(count: number = 6): Promise<Product[]> {
  return getProducts({ isActive: true, sortBy: 'reviewCount', sortOrder: 'desc', limitCount: count });
}

// 신상품 조회
export async function getNewProducts(count: number = 8): Promise<Product[]> {
  return getProducts({ isActive: true, sortBy: 'createdAt', sortOrder: 'desc', limitCount: count });
}

// 상품 검색
// Firestore는 전문 검색을 지원하지 않으므로 텍스트 검색은 클라이언트 필터링 유지
// 카테고리 검색인 경우 Firestore where() 쿼리로 최적화
export async function searchProducts(searchQuery: string): Promise<Product[]> {
  try {
    const cacheKey = `search:${searchQuery.toLowerCase()}`;
    const cached = getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    const searchLower = searchQuery.toLowerCase();

    // 카테고리명과 정확히 일치하면 Firestore where() 쿼리 사용
    const categoryValues = Object.values(PRODUCT_CATEGORIES);
    const categoryKeys = Object.keys(PRODUCT_CATEGORIES);
    const matchedCategoryIndex = categoryValues.findIndex(
      v => v.toLowerCase() === searchLower
    );
    const matchedKeyIndex = categoryKeys.findIndex(
      k => k.toLowerCase() === searchLower
    );

    if (matchedCategoryIndex !== -1) {
      // 카테고리 한글명으로 검색 (예: "인쇄")
      const matchedValue = categoryValues[matchedCategoryIndex];
      const q = query(
        productsCollection,
        where('isActive', '==', true),
        where('category', '==', matchedValue)
      );
      const snapshot = await getDocs(q);
      const results = snapshot.docs.map(d => docToProduct(d.data(), d.id));
      setCache(cacheKey, results);
      return results;
    }

    if (matchedKeyIndex !== -1) {
      // 카테고리 키로 검색 (예: "print")
      const matchedValue = categoryValues[matchedKeyIndex];
      const q = query(
        productsCollection,
        where('isActive', '==', true),
        where('category', '==', matchedValue)
      );
      const snapshot = await getDocs(q);
      const results = snapshot.docs.map(d => docToProduct(d.data(), d.id));
      setCache(cacheKey, results);
      return results;
    }

    // 일반 텍스트 검색: 캐시된 활성 상품 목록에서 필터링
    const products = await getProducts({ isActive: true });

    const results = products.filter(product =>
      product.name.toLowerCase().includes(searchLower) ||
      product.category.toLowerCase().includes(searchLower) ||
      product.tags?.some(tag => tag.toLowerCase().includes(searchLower))
    );

    setCache(cacheKey, results);
    return results;
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
}

// ============ 상품 관리 (관리자용) ============

// 상품 생성
export async function createProduct(input: CreateProductInput): Promise<string | null> {
  try {
    const docRef = await addDoc(productsCollection, {
      ...input,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating product:', error);
    return null;
  }
}

// 상품 수정
export async function updateProduct(productId: string, input: UpdateProductInput): Promise<boolean> {
  try {
    const docRef = doc(db, 'products', productId);
    await updateDoc(docRef, {
      ...input,
      updatedAt: Timestamp.now(),
    });
    return true;
  } catch (error) {
    console.error('Error updating product:', error);
    return false;
  }
}

// 상품 삭제
export async function deleteProduct(productId: string): Promise<boolean> {
  try {
    const docRef = doc(db, 'products', productId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('Error deleting product:', error);
    return false;
  }
}

// 상품 활성화/비활성화
export async function toggleProductActive(productId: string, isActive: boolean): Promise<boolean> {
  return updateProduct(productId, { isActive });
}

// ============ 카테고리 ============

export const PRODUCT_CATEGORIES = {
  print: '인쇄',
  goods: '굿즈/팬시',
  fashion: '패션/어패럴',
  store: '우리가게',
  custom: '주문제작',
  recipe: 'AI 레시피',
} as const;

export type ProductCategory = keyof typeof PRODUCT_CATEGORIES;
