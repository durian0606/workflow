# 🔐 API 보안 설정 가이드

## 📋 목차
1. [Firebase Security Rules 설정](#firebase-security-rules)
2. [Kakao Maps API 보안 설정](#kakao-maps-api-보안-설정)
3. [추가 보안 권장사항](#추가-보안-권장사항)

---

## 🔥 Firebase Security Rules

### 현재 상태
Firebase API Key는 **공개되어도 안전**합니다!
보안은 **Security Rules**로 관리됩니다.

### 설정 방법

#### 1. Firebase Console 접속
```
https://console.firebase.google.com/
→ work-todo-6ab7f 프로젝트 선택
→ 좌측 메뉴: Realtime Database
→ 규칙(Rules) 탭 클릭
```

#### 2. 권장 Security Rules

```json
{
  "rules": {
    // 회사(사용자) 데이터
    "companies": {
      "$companyId": {
        ".read": "auth != null && (root.child('companies/' + $companyId + '/userId').val() === auth.uid || root.child('companies/' + $companyId + '/staff/' + auth.uid).exists())",
        ".write": "auth != null && (root.child('companies/' + $companyId + '/userId').val() === auth.uid || root.child('companies/' + $companyId + '/staff/' + auth.uid).exists())"
      }
    },

    // 팀 데이터
    "teams": {
      "$teamId": {
        // 팀 정보 읽기: 팀 멤버만
        "info": {
          ".read": "root.child('teams/' + $teamId + '/members').hasChild(auth.uid)",
          ".write": "root.child('teams/' + $teamId + '/members').hasChild(auth.uid)"
        },

        // 팀 멤버 목록
        "members": {
          ".read": "root.child('teams/' + $teamId + '/members').hasChild(auth.uid)",
          ".write": "root.child('teams/' + $teamId + '/members').hasChild(auth.uid)"
        },

        // 작업 데이터
        "works": {
          ".read": "root.child('teams/' + $teamId + '/members').hasChild(auth.uid)",
          ".write": "root.child('teams/' + $teamId + '/members').hasChild(auth.uid)"
        },

        // 현장 데이터
        "sites": {
          ".read": "root.child('teams/' + $teamId + '/members').hasChild(auth.uid)",
          ".write": "root.child('teams/' + $teamId + '/members').hasChild(auth.uid)"
        }
      }
    },

    // 사용자 초대
    "userInvitations": {
      "$userId": {
        ".read": "auth != null && auth.uid === $userId",
        ".write": "auth != null"
      }
    },

    // 팀 코드로 팀 찾기 (읽기 전용)
    "teamCodes": {
      ".read": "auth != null",
      ".write": false
    }
  }
}
```

#### 3. 현재 문제점
현재 앱은 **Firebase Authentication을 사용하지 않습니다**.
→ `auth` 변수가 `null`이므로 위 규칙을 적용하면 **아무도 접근 불가**

### 해결 방법 (2가지)

#### 방법 1: 임시 - 제한적 공개 (현재 추천) ⭐
```json
{
  "rules": {
    "companies": {
      "$companyId": {
        ".read": true,
        ".write": true
      }
    },
    "teams": {
      "$teamId": {
        ".read": true,
        ".write": true
      }
    },
    "userInvitations": {
      ".read": true,
      ".write": true
    },
    "teamCodes": {
      ".read": true,
      ".write": true
    }
  }
}
```
⚠️ **주의**: 누구나 데이터를 읽고 쓸 수 있습니다.
→ 소규모 팀/테스트 용도로는 괜찮음
→ 실제 배포 시에는 방법 2 필요

#### 방법 2: Firebase Authentication 추가 (장기적 해결책)
```javascript
// Firebase Authentication 추가
import { getAuth, signInAnonymously } from "firebase/auth";

const auth = getAuth(app);

// 익명 로그인 (사용자 ID 기반)
signInAnonymously(auth)
  .then((userCredential) => {
    console.log('✅ Firebase Auth: 익명 로그인 성공');
    // 이제 Security Rules의 auth.uid 사용 가능
  });
```

---

## 🗺️ Kakao Maps API 보안 설정

### 1. Kakao Developers Console 접속
```
https://developers.kakao.com/console/app
→ 로그인
→ "내 애플리케이션" 선택
→ 앱 선택 (또는 새로 생성)
```

### 2. Web Platform 설정

#### 플랫폼 추가
```
앱 설정 > 플랫폼 > Web 플랫폼 등록
```

#### 사이트 도메인 등록
```
개발 단계:
✓ http://localhost:3000
✓ http://127.0.0.1:3000

배포 후:
✓ https://yourdomain.com
✓ https://www.yourdomain.com

Firebase Hosting 사용 시:
✓ https://your-project.web.app
✓ https://your-project.firebaseapp.com
```

⚠️ **중요**: 등록된 도메인에서만 API 사용 가능!

### 3. Android Platform 설정 (Capacitor 앱)

#### 플랫폼 추가
```
앱 설정 > 플랫폼 > Android 플랫폼 등록
```

#### 패키지명
```
예시: com.yourcompany.worklist
```

#### 키 해시 생성 방법
```bash
# Windows (Git Bash)
keytool -exportcert -alias androiddebugkey -keystore ~/.android/debug.keystore | openssl sha1 -binary | openssl base64

# Mac/Linux
keytool -exportcert -alias androiddebugkey -keystore ~/.android/debug.keystore -storepass android -keypass android | openssl sha1 -binary | openssl base64
```

디버그 키 해시 예시: `Xo8WBi6jzSxKDVR4drqm84yr9iU=`

⚠️ **배포용 앱**은 **Release 키 해시**도 별도로 등록해야 합니다!

### 4. iOS Platform 설정 (Capacitor 앱)

#### 플랫폼 추가
```
앱 설정 > 플랫폼 > iOS 플랫폼 등록
```

#### Bundle ID
```
예시: com.yourcompany.worklist
```

---

## 🛡️ 추가 보안 권장사항

### 1. API 호출 제한 설정

#### Kakao Developers Console
```
앱 설정 > API 설정
→ Kakao Maps API 사용량 모니터링
→ 일일 호출 한도 설정 (선택)
```

### 2. Firebase Security 체크리스트

✅ **반드시 확인할 것:**
- [ ] Security Rules 설정 완료
- [ ] Database 인덱스 설정 (성능 최적화)
- [ ] 사용자별 데이터 격리
- [ ] 민감한 정보는 암호화하여 저장

### 3. 배포 전 최종 점검

```bash
# 1. config.js가 Git에 포함되는지 확인
git status

# config.js가 보이면 안 됨 (.gitignore에 추가)
# 현재는 config.js를 공개하지만, 향후 config.local.js로 분리 권장

# 2. API 키 도메인 제한 확인
# Kakao Console에서 등록된 도메인만 사용 가능한지 테스트

# 3. Firebase Rules 테스트
# Firebase Console > Realtime Database > 규칙 > 규칙 시뮬레이터
```

### 4. 향후 개선 사항 (유료화 시)

#### Firebase Cloud Functions 활용
```javascript
// 민감한 API 호출은 서버에서 처리
// functions/index.js
exports.getDirections = functions.https.onCall(async (data, context) => {
  // 인증 확인
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', '로그인 필요');
  }

  // API 키는 환경변수로 관리 (클라이언트에 노출 안 됨)
  const apiKey = functions.config().kakao.apikey;

  // Kakao API 호출
  const response = await fetch(`https://apis.map.kakao.com/...`, {
    headers: { 'Authorization': `KakaoAK ${apiKey}` }
  });

  return response.json();
});
```

#### 비용 절감
- Cloud Functions 사용 시: Firebase Free Plan에서는 호출 횟수 제한
- Blaze Plan (종량제): 월 무료 할당량 초과 시 과금

---

## 📞 문제 발생 시

### Firebase 관련
```
Firebase Console > Support > 도움말
https://firebase.google.com/support
```

### Kakao API 관련
```
Kakao Developers > 고객센터
https://devtalk.kakao.com/
```

---

## ✅ 현재 보안 수준

| 항목 | 상태 | 비고 |
|------|------|------|
| Firebase API Key 분리 | ✅ 완료 | config.js로 분리 |
| Kakao API Key 분리 | ✅ 완료 | config.js로 분리 |
| .gitignore 설정 | ✅ 완료 | 민감 파일 제외 |
| Firebase Security Rules | ⚠️ 미설정 | 수동 설정 필요 |
| Kakao API 도메인 제한 | ⚠️ 미설정 | 수동 설정 필요 |
| Firebase Authentication | ❌ 미구현 | 향후 추가 권장 |

---

**다음 단계:** Capacitor 설정으로 이동
→ `.claude/CAPACITOR_GUIDE.md` 참고
