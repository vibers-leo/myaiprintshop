/**
 * 알림 서비스 (카카오 알림톡 / SMS + Firestore 실시간 알림)
 * 실제 운영 시 Aligo, Solapi 등의 API 연동이 필요합니다.
 */

import { collection, addDoc, query, where, orderBy, getDocs, updateDoc, doc, onSnapshot, Timestamp, limit } from 'firebase/firestore';
import { db } from './firebase';

// ─── In-app Notification (Firestore) ───

export interface Notification {
  id?: string;
  userId: string;
  type: 'order_status' | 'review' | 'promotion' | 'system' | 'point' | 'qa' | 'coupon' | 'vendor' | 'settlement';
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export async function createNotification(notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) {
  const docRef = await addDoc(collection(db, 'notifications'), {
    ...notification,
    read: false,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function getUserNotifications(userId: string): Promise<Notification[]> {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(20),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      link: data.link,
      read: data.read,
      createdAt: data.createdAt instanceof Timestamp
        ? data.createdAt.toDate().toISOString()
        : data.createdAt,
    } as Notification;
  });
}

export async function markAsRead(notificationId: string) {
  const ref = doc(db, 'notifications', notificationId);
  await updateDoc(ref, { read: true });
}

export async function getUnreadCount(userId: string): Promise<number> {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    where('read', '==', false),
  );
  const snapshot = await getDocs(q);
  return snapshot.size;
}

/**
 * Real-time listener for notifications.
 * Returns an unsubscribe function.
 */
export function subscribeToNotifications(userId: string, callback: (notifications: Notification[]) => void) {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(20),
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const notifications: Notification[] = snapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        link: data.link,
        read: data.read,
        createdAt: data.createdAt instanceof Timestamp
          ? data.createdAt.toDate().toISOString()
          : data.createdAt,
      } as Notification;
    });
    callback(notifications);
  });

  return unsubscribe;
}

// ─── SMS / KakaoTalk notification (legacy) ───

export interface NotificationPayload {
    userId?: string;
    phone: string;
    templateName: 'ORDER_CONFIRMED' | 'DESIGN_APPROVED' | 'SHIPPING_STARTED';
    variables: Record<string, string>;
}

export async function sendNotification(payload: NotificationPayload) {
    try {
        console.log(`[Notification Service] Sending ${payload.templateName} to ${payload.phone}`);
        console.log(`[Variables]`, payload.variables);

        // TODO: 실제 API 연동 (예: axios.post('https://api.solapi.com/...'))
        // 현재는 개발 모드로 성공 로그만 남깁니다.

        return { success: true, messageId: `msg_${Date.now()}` };
    } catch (error) {
        console.error('Notification failed:', error);
        return { success: false, error };
    }
}

/**
 * 주문 완료 알림 (고객용)
 */
export async function sendOrderConfirmNotification(order: any) {
    return sendNotification({
        phone: order.shippingInfo.phone,
        templateName: 'ORDER_CONFIRMED',
        variables: {
            orderId: order.id,
            productName: order.items[0]?.productName + (order.items.length > 1 ? ` 외 ${order.items.length - 1}건` : ''),
            totalAmount: `${(order.totalAmount + order.shippingFee).toLocaleString()}원`,
            userName: order.shippingInfo.name
        }
    });
}
