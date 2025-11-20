// API 설정 파일 (예시)
// 주의: 이 파일은 클라이언트에 노출됩니다.
// 민감한 작업은 Firebase Cloud Functions를 사용하세요.

const CONFIG = {
  // Kakao Maps API
  kakao: {
    appKey: 'YOUR_KAKAO_APP_KEY_HERE',
    // 보안 설정 방법:
    // 1. Kakao Developers Console (https://developers.kakao.com)
    // 2. 내 애플리케이션 > 앱 설정 > 플랫폼
    // 3. Web 플랫폼: 사이트 도메인 등록 (예: https://yourdomain.com)
    // 4. Android 플랫폼: 패키지명 + 키 해시 등록
    // 5. iOS 플랫폼: Bundle ID 등록
  },

  // Firebase 설정
  firebase: {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT.firebaseio.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
    // Firebase API Key는 공개되어도 괜찮습니다!
    // 보안은 Firebase Security Rules로 관리됩니다.
    // Firebase Console > Realtime Database > 규칙 탭에서 설정하세요.
  },

  // 앱 설정
  app: {
    version: '0.8.4',
    name: '작업 관리',
    // 향후 유료화를 위한 설정
    features: {
      freeMaxSites: 5,        // 무료 버전 최대 현장 수
      freeMaxTeamMembers: 3,  // 무료 버전 최대 팀원 수
      premiumEnabled: false   // 유료 기능 활성화 여부
    }
  }
};

// 전역으로 접근 가능하도록 설정
if (typeof window !== 'undefined') {
  window.CONFIG = CONFIG;
}
