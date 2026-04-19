import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, writeBatch } from 'firebase/firestore';

// Firebase Client 초기화
const firebaseConfig = {
  apiKey: "AIzaSyBniRDTvu-VyRsrRjZ7tABCJPPMcS0w9yk",
  authDomain: "myaiprintshop.firebaseapp.com",
  projectId: "myaiprintshop",
  storageBucket: "myaiprintshop.firebasestorage.app",
  messagingSenderId: "436157113796",
  appId: "1:436157113796:web:0f1c03b91632a5e0aff091"
};

if (!getApps().length) {
  initializeApp(firebaseConfig);
}

const db = getFirestore();

// 2026-04-19 스크래핑 — references/myaiprintshop-products.json에서 로드
import rawProducts from '../references/myaiprintshop-products.json';

const categoryMap: Record<string, string> = {
  '인쇄': 'print', '굿즈 / 팬시': 'goods', '패션 / 어패럴': 'fashion',
  '우리가게': 'store', '주문제작': 'custom', '레시피': 'recipe',
};

function guessPrintMethod(name: string, cat: string): string {
  if (name.includes('시트') || name.includes('아크릴')) return 'uv';
  if (cat === '패션 / 어패럴' || name.includes('프린팅')) return 'dtg';
  if (name.includes('포토카드') || name.includes('스티커')) return 'sublimation';
  return 'dtg';
}

const crawledProducts = rawProducts.products.map((p, i) => ({
  id: p.id,
  name: p.name.replace(/^\[/, '').replace(/\]/, ' — ').replace(/\]$/, ''),
  price: p.price,
  imageUrl: p.image,
  category: categoryMap[p.category] || 'goods',
  subcategory: '',
  printMethod: guessPrintMethod(p.name, p.category),
  badge: i < 5 ? 'BEST' : i < 10 ? 'NEW' : i % 7 === 0 ? 'HOT' : '',
  tags: [p.category, '맞춤제작'],
}));

// 아래는 기존 하드코딩 데이터 (참고용 — 위 crawledProducts가 우선)
const _legacyProducts = [
  {
    id: "knPBooeVxlkT4odEOPgfko",
    name: "[캔버스 액자] 다양한 사이즈의 캔버스 액자",
    price: 21550,
    imageUrl: "https://cdn.webeasy.co.kr/private/users/01962d0f-5414-7c6c-9a9b-0e3014d04194/products/01976734-5b6b-76eb-8c28-464b90bff708-4.jpg",
    category: "goods",
    subcategory: "굿즈"
  },
  {
    id: "knPBoIL4uaAasy2miKdPB7",
    name: "[에어팟 케이스] 나만의 디자인으로 꾸미는 에어팟 케이스",
    price: 10010,
    imageUrl: "https://cdn.webeasy.co.kr/private/users/01962d0f-5414-7c6c-9a9b-0e3014d04194/products/01975868-b160-7502-8453-3f7498d5da60-7.jpg",
    category: "goods",
    subcategory: "굿즈"
  },
  {
    id: "knPBoHeCKriIGiNx2sC2CG",
    name: "[아크릴톡] 나만의 디자인으로 꾸미는 아크릴톡",
    price: 6930,
    imageUrl: "https://cdn.webeasy.co.kr/private/users/01962d0f-5414-7c6c-9a9b-0e3014d04194/products/01975870-8b8b-7ca0-9e17-1d8ff1ffad20-9.jpg",
    category: "goods",
    subcategory: "굿즈"
  },
  {
    id: "knPBoqE0hWPJjNNHS3EmIW",
    name: "[행잉액자] 원목테두리와 매트한 질감의 액자",
    price: 25410,
    imageUrl: "https://cdn.webeasy.co.kr/private/users/01962d0f-5414-7c6c-9a9b-0e3014d04194/products/019763eb-cf30-75a5-8991-69d3b12816dc-6.jpg",
    category: "goods",
    subcategory: "굿즈"
  },
  {
    id: "knP8xPOyOGzMDTOsieRTCk",
    name: "[틴케이스] 유니크한 추억 보관함",
    price: 5920,
    imageUrl: "https://cdn.webeasy.co.kr/private/users/01962d0f-5414-7c6c-9a9b-0e3014d04194/products/01977775-2eb9-79fd-8644-59ecad7d1794-4.jpg",
    category: "goods",
    subcategory: "굿즈"
  },
  {
    id: "knP8rKJC23CkH1OGWse1ez",
    name: "[맨투맨] 높은 퀄리티의 맨투맨 + 선명한 디지털 프린팅",
    price: 45210,
    imageUrl: "https://cdn.webeasy.co.kr/private/users/01962d0f-5414-7c6c-9a9b-0e3014d04194/products/01978219-5d14-7a8a-92ab-a9ca9f6c3420-4.jpg",
    category: "fashion",
    subcategory: "후드/후드집업"
  },
  {
    id: "knP8rF0tDE6MsUez8Fcoxo",
    name: "[반팔 티셔츠] 면100% 17수 티셔츠에 선명한 디지털 프린팅",
    price: 15840,
    imageUrl: "https://cdn.webeasy.co.kr/private/users/01962d0f-5414-7c6c-9a9b-0e3014d04194/products/01978222-a4b6-7750-9fd2-1d3f56e82b39-t-6.jpg",
    category: "fashion",
    subcategory: "티셔츠"
  }
];

// 추가 상품 생성 템플릿
const additionalProducts = [
  // 인쇄 카테고리
  {
    name: "[명함] 고급스러운 코팅 명함 100장",
    price: 8900,
    category: "print",
    subcategory: "명함",
    description: "무광/유광 코팅 선택 가능, 고급 용지 사용"
  },
  {
    name: "[스티커] 방수 비닐 스티커 50매",
    price: 12000,
    category: "print",
    subcategory: "스티커",
    description: "내구성 강한 방수 스티커, 다양한 사이즈"
  },
  {
    name: "[포스터] A3 고화질 포스터 인쇄",
    price: 6500,
    category: "print",
    subcategory: "포스터",
    description: "선명한 컬러, 고급 아트지 사용"
  },
  {
    name: "[현수막] 실내외 현수막 제작",
    price: 35000,
    category: "print",
    subcategory: "현수막/배너",
    description: "다양한 사이즈, 비바람에 강한 소재"
  },
  {
    name: "[리플렛] A4 양면 리플렛 100부",
    price: 18000,
    category: "print",
    subcategory: "리플렛/팜플렛",
    description: "고급 코팅지, 선명한 인쇄"
  },
  {
    name: "[엽서] 감성 디자인 엽서 세트",
    price: 9500,
    category: "print",
    subcategory: "엽서/메세지카드",
    description: "특별한 메시지를 전하는 감성 엽서"
  },
  {
    name: "[포토카드] 고화질 포토카드 제작",
    price: 7800,
    category: "print",
    subcategory: "포토카드",
    description: "생생한 컬러, 반영구적 보관 가능"
  },
  {
    name: "[봉투] 커스텀 봉투 100매",
    price: 15000,
    category: "print",
    subcategory: "봉투",
    description: "다양한 사이즈, 고급스러운 디자인"
  },

  // 굿즈 카테고리 추가
  {
    name: "[노트] 고급 양장 노트",
    price: 12800,
    category: "goods",
    subcategory: "문구",
    description: "180페이지, 고급 용지 사용"
  },
  {
    name: "[마우스패드] 논슬립 마우스패드",
    price: 8500,
    category: "goods",
    subcategory: "굿즈",
    description: "미끄럼 방지, 세련된 디자인"
  },
  {
    name: "[텀블러] 보온보냉 텀블러",
    price: 18900,
    category: "goods",
    subcategory: "굿즈",
    description: "6시간 보온, 스테인리스 소재"
  },
  {
    name: "[파우치] 캔버스 파우치",
    price: 9900,
    category: "goods",
    subcategory: "팬시",
    description: "튼튼한 캔버스 소재, 넉넉한 수납공간"
  },
  {
    name: "[키링] 아크릴 키링",
    price: 5500,
    category: "goods",
    subcategory: "팬시",
    description: "투명 아크릴, 양면 인쇄"
  },

  // 패션 카테고리 추가
  {
    name: "[후드집업] 프리미엄 후드집업",
    price: 52000,
    category: "fashion",
    subcategory: "후드/후드집업",
    description: "기모 안감, 고급 원단 사용"
  },
  {
    name: "[긴팔 티셔츠] 라운드넥 긴팔 티셔츠",
    price: 19800,
    category: "fashion",
    subcategory: "티셔츠",
    description: "면100%, 사계절용"
  },
  {
    name: "[에코백] 캔버스 에코백",
    price: 11000,
    category: "fashion",
    subcategory: "에코백",
    description: "튼튼한 캔버스 원단, 대용량"
  },

  // 우리가게 카테고리
  {
    name: "[간판] LED 아크릴 간판",
    price: 120000,
    category: "store",
    subcategory: "간판",
    description: "고급 LED 조명, 내구성 강함"
  },
  {
    name: "[메뉴판] 고급 아크릴 메뉴판",
    price: 45000,
    category: "store",
    subcategory: "메뉴판",
    description: "세련된 디자인, 위생적"
  },
  {
    name: "[스탠드 배너] 롤업 스탠드 배너",
    price: 38000,
    category: "store",
    subcategory: "스탠드배너/엑스배너",
    description: "이동 편리, 조립 간편"
  }
];

// Unsplash 이미지 풀 (카테고리별)
const unsplashImages: Record<string, string[]> = {
  print: [
    'https://images.unsplash.com/photo-1586339277861-b0b167d2f48a?w=800',
    'https://images.unsplash.com/photo-1611224885990-ab7363d1f2f9?w=800',
    'https://images.unsplash.com/photo-1605289355680-75fb41239154?w=800',
    'https://images.unsplash.com/photo-1586281380117-5a60ae2050cc?w=800'
  ],
  goods: [
    'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=800',
    'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=800',
    'https://images.unsplash.com/photo-1564982170-c594d3b5f0b1?w=800',
    'https://images.unsplash.com/photo-1577705998148-6da4f3963bc8?w=800'
  ],
  fashion: [
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800',
    'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800',
    'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800'
  ],
  store: [
    'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=800',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
    'https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=800'
  ]
};

async function seedProducts() {
  console.log('🌱 상품 데이터 시딩 시작...\n');

  const batch = writeBatch(db);
  let count = 0;

  // 1. 크롤링한 실제 상품 추가 (55개 — myaiprintshop.co.kr)
  console.log('📦 마이AI프린트샵 상품 추가 중...');
  for (const product of crawledProducts) {
    const docRef = doc(db, 'products', product.id);
    batch.set(docRef, {
      name: product.name,
      description: `${product.name} — GOODZZ에서 AI로 맞춤 제작. 소량 주문 가능.`,
      price: product.price,
      originalPrice: Math.round(product.price * 1.2),
      thumbnail: product.imageUrl,
      images: [product.imageUrl],
      category: product.category,
      subcategory: product.subcategory || '',
      badge: product.badge || '',
      tags: product.tags || [],
      stock: 999,
      isActive: true,
      rating: +(3.5 + Math.random() * 1.5).toFixed(1),
      reviewCount: Math.floor(Math.random() * 30),
      printMethod: product.printMethod || 'dtg',
      vendorId: 'PLATFORM_DEFAULT',
      vendorName: 'GOODZZ',
      vendorType: 'platform',
      volumePricing: [
        { minQuantity: 100, discountRate: 0.05 },
        { minQuantity: 500, discountRate: 0.1 },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    count++;
    console.log(`  ✅ [${count}] ${product.name}`);
  }

  // 2. 추가 생성 상품
  console.log('\n📦 추가 상품 생성 중...');
  for (let i = 0; i < additionalProducts.length; i++) {
    const product = additionalProducts[i];
    const id = `prod_${Date.now()}_${i}`;

    // 카테고리별 Unsplash 이미지 선택
    const categoryImages = unsplashImages[product.category] || unsplashImages.goods;
    const imageUrl = categoryImages[i % categoryImages.length];

    const docRef = doc(db, 'products', id);
    batch.set(docRef, {
      id,
      name: product.name,
      price: product.price,
      originalPrice: product.price + Math.floor(Math.random() * 5000),
      category: product.category,
      subcategory: product.subcategory,
      description: product.description,
      thumbnail: imageUrl,
      images: [imageUrl],
      stock: Math.floor(Math.random() * 150) + 50,
      rating: 4.0 + Math.random(),
      reviewCount: Math.floor(Math.random() * 100),
      isBest: Math.random() > 0.8,
      isNew: Math.random() > 0.6,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    count++;
    console.log(`  ✓ ${product.name}`);
  }

  // Firestore에 일괄 저장
  console.log('\n💾 Firestore에 저장 중...');
  await batch.commit();

  console.log(`\n✅ 총 ${count}개 상품이 추가되었습니다!`);
  console.log('\n상품 분포:');
  console.log('  - 인쇄: 8개');
  console.log('  - 굿즈/팬시: 11개');
  console.log('  - 패션/어패럴: 5개');
  console.log('  - 우리가게: 3개');
  console.log(`  - 총계: ${count}개`);
}

seedProducts()
  .then(() => {
    console.log('\n🎉 시딩 완료!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 시딩 실패:', error);
    process.exit(1);
  });
