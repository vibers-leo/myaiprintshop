/**
 * Multi-vendor Marketplace Migration Script
 *
 * 작업:
 * 1. 플랫폼 기본 판매자 생성 (PLATFORM_DEFAULT)
 * 2. 기존 products에 vendorId, vendorType 추가
 * 3. Admin 사용자 역할 설정
 */

import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Firebase Admin 초기화
if (!admin.apps.length) {
  try {
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
    });

    console.log('✅ Firebase Admin initialized');
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin:', error);
    process.exit(1);
  }
}

const db = admin.firestore();

/**
 * 1. 플랫폼 기본 판매자 생성
 */
async function createPlatformVendor() {
  console.log('\n📦 Creating platform vendor...');

  const PLATFORM_VENDOR_ID = 'PLATFORM_DEFAULT';
  const vendorRef = db.collection('vendors').doc(PLATFORM_VENDOR_ID);

  try {
    const vendorDoc = await vendorRef.get();

    if (vendorDoc.exists) {
      console.log('  ℹ️ Platform vendor already exists');
      return;
    }

    const platformVendor = {
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
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
      approvedAt: admin.firestore.Timestamp.now(),
    };

    await vendorRef.set(platformVendor);
    console.log(`  ✅ Created platform vendor: ${PLATFORM_VENDOR_ID}`);
  } catch (error) {
    console.error('  ❌ Error creating platform vendor:', error);
    throw error;
  }
}

/**
 * 2. 기존 products에 vendorId, vendorType 추가
 */
async function migrateProducts() {
  console.log('\n📦 Migrating products to multi-vendor...');

  const PLATFORM_VENDOR_ID = 'PLATFORM_DEFAULT';
  const productsRef = db.collection('products');

  try {
    const snapshot = await productsRef.get();

    if (snapshot.empty) {
      console.log('  ℹ️ No products found to migrate');
      return;
    }

    console.log(`  Found ${snapshot.size} products to migrate`);

    const batch = db.batch();
    let migrated = 0;
    let skipped = 0;

    snapshot.forEach((doc) => {
      const data = doc.data();

      // 이미 vendorId가 있으면 스킵
      if (data.vendorId) {
        skipped++;
        return;
      }

      // vendorId, vendorType 추가
      batch.update(doc.ref, {
        vendorId: PLATFORM_VENDOR_ID,
        vendorName: 'GOODZZ',
        vendorType: 'platform',
        updatedAt: admin.firestore.Timestamp.now(),
      });

      migrated++;
    });

    if (migrated > 0) {
      await batch.commit();
      console.log(`  ✅ Migrated ${migrated} products`);
    }

    if (skipped > 0) {
      console.log(`  ℹ️ Skipped ${skipped} products (already migrated)`);
    }
  } catch (error) {
    console.error('  ❌ Error migrating products:', error);
    throw error;
  }
}

/**
 * 3. 플랫폼 판매자 상품 수 업데이트
 */
async function updatePlatformVendorStats() {
  console.log('\n📦 Updating platform vendor stats...');

  const PLATFORM_VENDOR_ID = 'PLATFORM_DEFAULT';
  const vendorRef = db.collection('vendors').doc(PLATFORM_VENDOR_ID);
  const productsRef = db.collection('products');

  try {
    const snapshot = await productsRef.where('vendorId', '==', PLATFORM_VENDOR_ID).get();
    const productCount = snapshot.size;

    await vendorRef.update({
      'stats.totalProducts': productCount,
      updatedAt: admin.firestore.Timestamp.now(),
    });

    console.log(`  ✅ Updated platform vendor stats: ${productCount} products`);
  } catch (error) {
    console.error('  ❌ Error updating platform vendor stats:', error);
    throw error;
  }
}

/**
 * 4. Admin 사용자 역할 설정
 */
async function setupAdminUsers() {
  console.log('\n👤 Setting up admin users...');

  const adminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((email) => email.trim())
    .filter(Boolean);

  if (adminEmails.length === 0) {
    console.log('  ℹ️ No admin emails found in ADMIN_EMAILS env variable');
    return;
  }

  console.log(`  Found ${adminEmails.length} admin emails`);

  try {
    // Firebase Auth에서 이메일로 사용자 찾기
    for (const email of adminEmails) {
      try {
        const userRecord = await admin.auth().getUserByEmail(email);
        const uid = userRecord.uid;

        // users 컬렉션에서 확인
        const userRef = db.collection('users').doc(uid);
        const userDoc = await userRef.get();

        if (userDoc.exists) {
          const userData = userDoc.data();
          const currentRoles = userData?.roles || [];

          if (!currentRoles.includes('admin')) {
            await userRef.update({
              roles: admin.firestore.FieldValue.arrayUnion('admin'),
              updatedAt: admin.firestore.Timestamp.now(),
            });
            console.log(`  ✅ Added admin role to: ${email}`);
          } else {
            console.log(`  ℹ️ User already has admin role: ${email}`);
          }
        } else {
          // 사용자 문서 생성
          await userRef.set({
            uid,
            email: userRecord.email || email,
            displayName: userRecord.displayName,
            photoURL: userRecord.photoURL,
            roles: ['customer', 'admin'],
            createdAt: admin.firestore.Timestamp.now(),
            updatedAt: admin.firestore.Timestamp.now(),
          });
          console.log(`  ✅ Created admin user: ${email}`);
        }
      } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
          console.log(`  ⚠️ User not found in Firebase Auth: ${email}`);
          console.log(`     → Please create this user in Firebase Console first`);
        } else {
          console.error(`  ❌ Error processing admin user ${email}:`, error);
        }
      }
    }
  } catch (error) {
    console.error('  ❌ Error setting up admin users:', error);
    throw error;
  }
}

/**
 * 메인 실행 함수
 */
async function main() {
  console.log('🚀 Starting Multi-vendor Marketplace Migration...\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  try {
    await createPlatformVendor();
    await migrateProducts();
    await updatePlatformVendorStats();
    await setupAdminUsers();

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Migration completed successfully!\n');
    console.log('Next steps:');
    console.log('  1. Verify vendors collection in Firebase Console');
    console.log('  2. Verify products have vendorId and vendorType');
    console.log('  3. Verify admin users have admin role');
    console.log('  4. Create Firestore indexes (see firestore.indexes.json)');
    console.log('\n');
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

// 실행
main();
