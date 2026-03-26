// Dynamic import로 변경하여 Windows 권한 문제 회피
let admin: typeof import('firebase-admin') | null = null;

/**
 * Firebase Admin SDK 초기화
 * 서버 사이드에서만 사용 (API routes, Server Actions 등)
 */

// 싱글톤 인스턴스
let adminApp: any | null = null;

export async function getAdminApp(): Promise<any> {
  if (adminApp) {
    return adminApp;
  }

  // 환경변수 확인
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (!clientEmail || !privateKey || !projectId ||
      clientEmail === 'your-service-account@goodzz.iam.gserviceaccount.com') {
    console.warn('⚠️ Firebase Admin SDK credentials not configured. Using development mode.');
    // 개발 모드에서는 Admin SDK 없이 작동 (auth-middleware에서 fallback 처리)
    throw new Error('Firebase Admin SDK not configured');
  }

  try {
    // Dynamic import
    if (!admin) {
      admin = await import('firebase-admin');
    }

    // 기존 앱이 있으면 재사용
    if (admin.apps.length > 0) {
      adminApp = admin.apps[0]!;
      return adminApp;
    }

    // 새 앱 초기화
    adminApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n'), // 환경변수의 \n을 실제 개행으로 변환
      }),
      projectId,
    });

    console.log('✅ Firebase Admin SDK initialized');
    return adminApp;
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error);
    throw error;
  }
}

/**
 * Firebase Admin Auth
 */
export async function getAdminAuth(): Promise<any> {
  const app = await getAdminApp();
  return app.auth();
}

/**
 * Firebase Admin Firestore
 */
export async function getAdminFirestore(): Promise<any> {
  const app = await getAdminApp();
  return app.firestore();
}

/**
 * ID 토큰 검증
 */
export async function verifyIdToken(token: string): Promise<any> {
  try {
    const auth = await getAdminAuth();
    const decodedToken = await auth.verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error('❌ Token verification failed:', error);
    throw new Error('Invalid or expired token');
  }
}

/**
 * 사용자 정보 조회
 */
export async function getAdminUser(uid: string): Promise<any> {
  try {
    const auth = await getAdminAuth();
    const user = await auth.getUser(uid);
    return user;
  } catch (error) {
    console.error(`❌ Failed to get user ${uid}:`, error);
    throw new Error('User not found');
  }
}

/**
 * 사용자 커스텀 클레임 설정 (역할 관리)
 */
export async function setUserClaims(uid: string, claims: Record<string, any>): Promise<void> {
  try {
    const auth = await getAdminAuth();
    await auth.setCustomUserClaims(uid, claims);
    console.log(`✅ Custom claims set for user ${uid}:`, claims);
  } catch (error) {
    console.error(`❌ Failed to set custom claims for user ${uid}:`, error);
    throw error;
  }
}

/**
 * 사용자가 관리자 권한을 가지고 있는지 확인
 */
export async function isAdminUser(uid: string): Promise<boolean> {
  try {
    const user = await getAdminUser(uid);
    return user.customClaims?.admin === true || user.customClaims?.role === 'admin';
  } catch (error) {
    console.error(`❌ Failed to check admin status for user ${uid}:`, error);
    return false;
  }
}
