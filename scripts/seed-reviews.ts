import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, Timestamp } from 'firebase/firestore';

// Firebase Client SDK 초기화
const firebaseConfig = {
  apiKey: "AIzaSyBniRDTvu-VyRsrRjZ7tABCJPPMcS0w9yk",
  authDomain: "goodzz.firebaseapp.com",
  projectId: "goodzz",
  storageBucket: "goodzz.firebasestorage.app",
  messagingSenderId: "436157113796",
  appId: "1:436157113796:web:0f1c03b91632a5e0aff091",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

interface Review {
  id: string;
  userName: string; // 익명화된 이름 (예: 김*현)
  productName: string;
  rating: number; // 1-5
  content: string;
  imageUrl?: string; // 구매 인증 사진 (선택)
  createdAt: Date;
  isVerified: boolean; // 구매 인증 여부
}

const mockReviews: Review[] = [
  {
    id: 'review_001',
    userName: '김*현',
    productName: '캔버스 에코백',
    rating: 5,
    content: 'AI로 만든 디자인이 너무 예뻐요! 주변에서 어디서 샀냐고 물어봐요 ㅎㅎ',
    imageUrl: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400',
    createdAt: new Date('2026-01-15'),
    isVerified: true,
  },
  {
    id: 'review_002',
    userName: '이*진',
    productName: '프리미엄 코튼 반팔티',
    rating: 5,
    content: '프린팅 퀄리티가 생각보다 훨씬 좋아서 놀랐어요. 재주문할게요!',
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
    createdAt: new Date('2026-01-12'),
    isVerified: true,
  },
  {
    id: 'review_003',
    userName: '박*수',
    productName: '캔버스 액자',
    rating: 5,
    content: '거실에 걸어놨는데 분위기가 확 바뀌었어요. AI가 그린 그림이라고 하니까 다들 신기해해요.',
    imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400',
    createdAt: new Date('2025-12-28'),
    isVerified: true,
  },
  {
    id: 'review_004',
    userName: '최*영',
    productName: '머그컵',
    rating: 5,
    content: '사무실에서 쓰는데 동료들이 다 탐내요. 개인 맞춤 제작이라 더 특별한 것 같아요!',
    imageUrl: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400',
    createdAt: new Date('2026-01-08'),
    isVerified: true,
  },
  {
    id: 'review_005',
    userName: '정*민',
    productName: '후드 집업',
    rating: 4,
    content: '디자인도 마음에 들고 착용감도 좋아요. 배송이 생각보다 빨라서 만족합니다.',
    createdAt: new Date('2026-01-05'),
    isVerified: true,
  },
  {
    id: 'review_006',
    userName: '강*희',
    productName: '스티커 세트',
    rating: 5,
    content: '노트북에 붙였는데 너무 귀여워요! 컬러도 선명하고 떨어질 것 같지 않아요.',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    createdAt: new Date('2026-01-03'),
    isVerified: true,
  },
  {
    id: 'review_007',
    userName: '윤*우',
    productName: '포스터',
    rating: 5,
    content: 'AI 디자인으로 만든 포스터인데 퀄리티가 정말 좋습니다. 선물용으로도 추천해요!',
    createdAt: new Date('2025-12-30'),
    isVerified: true,
  },
  {
    id: 'review_008',
    userName: '임*아',
    productName: '폰케이스',
    rating: 5,
    content: '제가 원하던 디자인 그대로 나와서 너무 만족해요. 친구들한테도 소개했어요.',
    imageUrl: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400',
    createdAt: new Date('2026-01-10'),
    isVerified: true,
  },
];

async function seedReviews() {
  console.log('🌱 Starting reviews seeding...\n');

  const reviewsRef = collection(db, 'reviews');

  let successCount = 0;
  let errorCount = 0;

  for (const review of mockReviews) {
    try {
      const docRef = doc(db, 'reviews', review.id);
      await setDoc(docRef, {
        userName: review.userName,
        productName: review.productName,
        rating: review.rating,
        content: review.content,
        imageUrl: review.imageUrl || null,
        createdAt: Timestamp.fromDate(review.createdAt),
        isVerified: review.isVerified,
      });
      console.log(`✅ Added review: ${review.id} - ${review.userName} (${review.productName})`);
      successCount++;
    } catch (error) {
      console.error(`❌ Failed to add review: ${review.id}`, error);
      errorCount++;
    }
  }

  console.log('\n=== 🎉 Seeding Complete ===');
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Errors:  ${errorCount}`);
  console.log(`📊 Total:   ${mockReviews.length}`);
  console.log('\n💬 Reviews are now ready!');
  console.log('Visit https://console.firebase.google.com to view your data.\n');
}

seedReviews()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  });
