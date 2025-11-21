// Service Worker - PWA 설치를 위한 최소 버전
const CACHE_NAME = 'worklist-v1';

// 설치 이벤트
self.addEventListener('install', (event) => {
  console.log('✅ Service Worker 설치됨');
  self.skipWaiting();
});

// 활성화 이벤트
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker 활성화됨');
  event.waitUntil(clients.claim());
});

// 페치 이벤트 (기본 동작만)
self.addEventListener('fetch', (event) => {
  // 기본 네트워크 요청 사용
  event.respondWith(fetch(event.request));
});
