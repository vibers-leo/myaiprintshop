import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let adminApp: App;
let adminAuth: Auth;
let adminDb: Firestore;

function getAdminApp() {
  if (!getApps().length) {
    // firebase-admin은 환경변수 또는 서비스 계정 JSON으로 초기화
    // Vercel 등 배포 환경에서는 GOOGLE_APPLICATION_CREDENTIALS 또는 개별 환경변수 사용
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

    if (process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT);
      adminApp = initializeApp({
        credential: cert(serviceAccount),
        projectId,
      });
    } else {
      // 환경변수가 없는 경우 기본 초기화 (로컬 개발용)
      adminApp = initializeApp({ projectId });
    }
  } else {
    adminApp = getApps()[0];
  }
  return adminApp;
}

export function getAdminAuth(): Auth {
  if (!adminAuth) {
    adminAuth = getAuth(getAdminApp());
  }
  return adminAuth;
}

export function getAdminDb(): Firestore {
  if (!adminDb) {
    adminDb = getFirestore(getAdminApp());
  }
  return adminDb;
}

/**
 * Firebase ID Token을 검증하고 사용자 정보를 반환합니다.
 */
export async function verifyIdToken(token: string) {
  try {
    const auth = getAdminAuth();
    return await auth.verifyIdToken(token);
  } catch {
    return null;
  }
}

/**
 * 사용자가 관리자인지 확인합니다.
 * Firestore `admins` 컬렉션에 해당 이메일이 등록되어 있는지 확인합니다.
 * 환경변수 ADMIN_EMAILS를 폴백으로 사용합니다.
 */
export async function isAdminUser(email: string): Promise<boolean> {
  // 1. 환경변수에서 관리자 이메일 확인 (서버사이드에서만 접근 가능)
  const adminEmails = process.env.ADMIN_EMAILS?.split(",").map(e => e.trim()) || [];
  if (adminEmails.includes(email)) {
    return true;
  }

  // 2. Firestore admins 컬렉션 확인
  try {
    const db = getAdminDb();
    const adminDoc = await db.collection("admins").doc(email).get();
    return adminDoc.exists;
  } catch {
    // Firestore 사용 불가 시 환경변수만으로 판단
    return false;
  }
}
