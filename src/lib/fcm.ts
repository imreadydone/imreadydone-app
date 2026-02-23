import { getMessaging, getToken, onMessage, Messaging } from "firebase/messaging";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import app, { db } from "./firebase";

// VAPID 공개 키
const VAPID_PUBLIC_KEY = "BEjPABAlinoddQfDJSEnxNkiMOlV4d9694uqZbhyS14dHNDUjxvG1R0_50HNp8W6CaZ7nIaR1N9XEYZpERfPk5A";

let messaging: Messaging | null = null;

// Firebase Messaging 초기화 (브라우저에서만 실행)
export const initializeMessaging = () => {
  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    messaging = getMessaging(app);
    return messaging;
  }
  return null;
};

// 알림 권한 요청 및 FCM 토큰 획득
export const requestNotificationPermission = async (userId: string): Promise<string | null> => {
  try {
    // 알림 권한 요청
    const permission = await Notification.requestPermission();
    
    if (permission !== "granted") {
      console.log("알림 권한이 거부되었습니다.");
      return null;
    }

    // Service Worker 등록
    const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    console.log("Service Worker 등록 완료:", registration);

    // Messaging 초기화
    const messagingInstance = initializeMessaging();
    if (!messagingInstance) {
      console.error("Messaging 초기화 실패");
      return null;
    }

    // FCM 토큰 획득
    const token = await getToken(messagingInstance, {
      vapidKey: VAPID_PUBLIC_KEY,
      serviceWorkerRegistration: registration,
    });

    if (token) {
      console.log("FCM 토큰:", token);
      // Firestore에 토큰 저장
      await saveFCMTokenToFirestore(userId, token);
      return token;
    } else {
      console.log("FCM 토큰을 가져올 수 없습니다.");
      return null;
    }
  } catch (error) {
    console.error("알림 권한 요청 중 오류:", error);
    return null;
  }
};

// FCM 토큰을 Firestore에 저장
export const saveFCMTokenToFirestore = async (userId: string, token: string) => {
  try {
    const tokenRef = doc(db, "fcmTokens", userId);
    await setDoc(
      tokenRef,
      {
        token,
        updatedAt: serverTimestamp(),
        platform: "web",
        userAgent: navigator.userAgent,
      },
      { merge: true }
    );
    console.log("FCM 토큰이 Firestore에 저장되었습니다.");
  } catch (error) {
    console.error("FCM 토큰 저장 중 오류:", error);
    throw error;
  }
};

// 포그라운드 메시지 수신 리스너
export const onForegroundMessage = (callback: (payload: any) => void) => {
  const messagingInstance = initializeMessaging();
  if (!messagingInstance) {
    console.error("Messaging이 초기화되지 않았습니다.");
    return;
  }

  onMessage(messagingInstance, (payload) => {
    console.log("포그라운드 메시지 수신:", payload);
    callback(payload);
  });
};
