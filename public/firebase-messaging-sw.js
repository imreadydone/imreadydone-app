// Firebase Cloud Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyC42xH_I1Kdzaj1LrvBT2xDmVpXF8htsRU",
  authDomain: "iamreadydone.firebaseapp.com",
  projectId: "iamreadydone",
  storageBucket: "iamreadydone.firebasestorage.app",
  messagingSenderId: "133226116072",
  appId: "1:133226116072:web:3dc6bc86841854538c2a5d"
};

// Firebase 초기화
firebase.initializeApp(firebaseConfig);

// Messaging 인스턴스 생성
const messaging = firebase.messaging();

// 백그라운드 메시지 수신
messaging.onBackgroundMessage((payload) => {
  console.log('[Service Worker] 백그라운드 메시지 수신:', payload);

  const notificationTitle = payload.notification?.title || 'I Am Ready Done';
  const notificationOptions = {
    body: payload.notification?.body || '새로운 알림이 있습니다',
    icon: payload.notification?.icon || '/icon-192x192.png',
    badge: '/icon-192x192.png',
    tag: payload.data?.todoId || 'default-notification',
    data: payload.data,
    requireInteraction: false,
    vibrate: [200, 100, 200],
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// 알림 클릭 이벤트 처리
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] 알림 클릭:', event);
  
  event.notification.close();

  // 앱으로 포커스 이동
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // 이미 열린 창이 있으면 포커스
      for (const client of clientList) {
        if (client.url.includes(self.registration.scope) && 'focus' in client) {
          return client.focus();
        }
      }
      // 열린 창이 없으면 새 창 열기
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
