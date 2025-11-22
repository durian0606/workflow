// API 설정 파일
// 주의: 이 파일은 클라이언트에 노출됩니다.
// 민감한 작업은 Firebase Cloud Functions를 사용하세요.

const CONFIG = {
  // Kakao Maps API
  kakao: {
    appKey: 'edfe0792f24f219880fc608009d59a0f',
    // 보안 설정 방법:
    // 1. Kakao Developers Console (https://developers.kakao.com)
    // 2. 내 애플리케이션 > 앱 설정 > 플랫폼
    // 3. Web 플랫폼: 사이트 도메인 등록 (예: https://yourdomain.com)
    // 4. Android 플랫폼: 패키지명 + 키 해시 등록
    // 5. iOS 플랫폼: Bundle ID 등록
  },

  // Firebase 설정
  firebase: {
    apiKey: "AIzaSyAMv0BmH24fyd0F8CUTkSYSXMlvbcnUXU4",
    authDomain: "work-todo-6ab7f.firebaseapp.com",
    databaseURL: "https://work-todo-6ab7f-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "work-todo-6ab7f",
    storageBucket: "work-todo-6ab7f.firebasestorage.app",
    messagingSenderId: "263893669261",
    appId: "1:263893669261:web:bdce10bec177ff1f67d9c4"
    // Firebase API Key는 공개되어도 괜찮습니다!
    // 보안은 Firebase Security Rules로 관리됩니다.
    // Firebase Console > Realtime Database > 규칙 탭에서 설정하세요.
  },

  // Google Gemini API
  gemini: {
    apiKey: 'YOUR_GEMINI_API_KEY_HERE',
    // API 키 발급 방법:
    // 1. Google AI Studio 접속 (https://aistudio.google.com/apikey)
    // 2. "Get API Key" 클릭
    // 3. API 키 복사하여 위에 붙여넣기
    // 무료 티어: 분당 15개 요청, 일일 1500개 요청
    model: 'gemini-1.5-flash', // 빠르고 비용 효율적인 모델
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models'
  },

  // 앱 설정
  app: {
    version: '0.8.5',
    name: '작업 관리',
    // 향후 유료화를 위한 설정
    features: {
      freeMaxSites: 5,        // 무료 버전 최대 현장 수
      freeMaxTeamMembers: 3,  // 무료 버전 최대 팀원 수
      premiumEnabled: false,  // 유료 기능 활성화 여부
      aiAssigneeRecommendation: true // AI 담당자 추천 기능
    }
  }
};

// 전역으로 접근 가능하도록 설정
if (typeof window !== 'undefined') {
  window.CONFIG = CONFIG;
}
