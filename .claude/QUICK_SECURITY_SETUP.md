# 🚨 즉시 보안 설정 가이드 (5분 완료)

## 📌 이 가이드의 목적
현재 앱의 API 키가 공개되어 있어, 누구나 악용할 수 있습니다.
지금 바로 5분만 투자하여 기본 보안을 설정하세요!

---

## 🔥 Part 1: Firebase Security Rules (3분)

### 현재 문제
- Firebase 데이터베이스가 **완전히 공개** 상태일 가능성이 높습니다
- 누구나 데이터를 읽고 쓸 수 있습니다

### 해결 방법

#### Step 1: Firebase Console 열기
```
1. 브라우저에서 https://console.firebase.google.com/ 접속
2. "work-todo-6ab7f" 프로젝트 클릭
```

#### Step 2: Realtime Database 규칙 확인
```
3. 왼쪽 메뉴에서 "Realtime Database" 클릭
4. 상단 탭에서 "규칙(Rules)" 클릭
```

#### Step 3: 현재 규칙 확인
현재 이렇게 되어 있을 가능성이 높습니다:
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```
⚠️ **위험!** 누구나 모든 데이터에 접근 가능!

#### Step 4: 새 규칙 적용

**옵션 A: 임시 - 기본 보안 (추천, 지금 당장)** ⭐
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
      "$userId": {
        ".read": true,
        ".write": true
      }
    },
    "teamCodes": {
      ".read": true,
      ".write": true
    }
  }
}
```

위 내용을:
1. `.claude/firebase-rules.json` 파일에 저장되어 있습니다
2. 복사 → Firebase Console의 규칙 편집기에 붙여넣기
3. **"게시" 버튼 클릭**

✅ 이제 정의된 경로만 접근 가능합니다!

---

## 🗺️ Part 2: Kakao Maps API 보안 (2분)

### 현재 문제
- Kakao API 키가 **도메인 제한 없음**
- 누구나 이 키를 복사해서 자기 사이트에서 사용 가능
- → 당신의 API 사용량/비용 증가

### 해결 방법

#### Step 1: Kakao Developers Console 열기
```
1. https://developers.kakao.com/console/app 접속
2. 로그인 (카카오 계정)
```

#### Step 2: 앱 선택 또는 생성

**기존 앱이 있는 경우:**
```
3. "내 애플리케이션" 목록에서 앱 클릭
```

**앱이 없는 경우:**
```
3. "애플리케이션 추가하기" 클릭
4. 앱 이름: "작업관리앱" (원하는 이름)
5. 저장
```

#### Step 3: JavaScript 키 확인
```
6. 앱 설정 > 요약 정보 > JavaScript 키 복사
7. config.js의 appKey와 일치하는지 확인:
   edfe0792f24f219880fc608009d59a0f
```

#### Step 4: Web 플랫폼 등록
```
8. 앱 설정 > 플랫폼 클릭
9. "Web 플랫폼 등록" 클릭
```

#### Step 5: 도메인 등록

**개발 단계 (지금 당장):**
```
사이트 도메인:
✓ http://localhost:5500
✓ http://127.0.0.1:5500
✓ http://localhost:3000
```

**배포 후 (Firebase Hosting 사용 시):**
```
나중에 추가할 도메인:
✓ https://work-todo-6ab7f.web.app
✓ https://work-todo-6ab7f.firebaseapp.com
```

10. **"저장" 클릭**

✅ 이제 등록된 도메인에서만 API 사용 가능!

---

## 🧪 테스트

### Firebase Rules 테스트
```
Firebase Console > Realtime Database > 규칙 탭
→ "규칙 시뮬레이터" 클릭

읽기 테스트:
경로: /teams/team123/works
결과: "허용됨" 확인 ✅

쓰기 테스트:
경로: /teams/team123/works
데이터: {"title": "test"}
결과: "허용됨" 확인 ✅
```

### Kakao API 테스트
```
1. 현재 앱을 브라우저에서 열기 (index.html)
2. 개발자 도구 콘솔 확인
3. "✅ Kakao Maps SDK loaded" 메시지 확인

에러 없으면 성공! ✅
```

---

## 📊 보안 수준 비교

### Before (지금)
| 항목 | 상태 | 위험도 |
|------|------|--------|
| Firebase | 완전 공개 | 🔴 높음 |
| Kakao API | 도메인 제한 없음 | 🔴 높음 |

### After (설정 후)
| 항목 | 상태 | 위험도 |
|------|------|--------|
| Firebase | 경로별 제한 | 🟡 중간 |
| Kakao API | 도메인 제한 | 🟢 낮음 |

---

## ⚠️ 주의사항

### 1. Firebase Rules 업데이트 시
- 게시 버튼을 꼭 눌러야 적용됩니다!
- 시뮬레이터로 테스트 후 게시하세요

### 2. Kakao 도메인 등록 시
- `http://`와 `https://` 구분됩니다
- 배포 도메인이 바뀌면 다시 등록해야 합니다

### 3. 로컬 테스트 시
- Live Server 사용 시 포트 번호 확인 (5500, 5501 등)
- 사용하는 포트를 모두 등록하세요

---

## 🚀 향후 개선 사항

### 더 강력한 보안이 필요할 때:

#### Firebase Authentication 추가
```javascript
// 현재: 누구나 접근 가능
".read": true

// 개선: 로그인한 사용자만
".read": "auth != null"

// 최고: 팀 멤버만
".read": "root.child('teams/' + $teamId + '/members').hasChild(auth.uid)"
```

#### Kakao API Server Key 사용
```javascript
// 현재: 클라이언트에서 직접 호출
fetch('https://apis-navi.kakaomobility.com/...')

// 개선: Firebase Cloud Functions에서 호출
// → API 키를 서버에만 저장
```

---

## ✅ 완료 체크리스트

설정을 완료하면 체크하세요:

- [ ] Firebase Console 접속 완료
- [ ] Firebase Security Rules 변경 완료
- [ ] Firebase Rules "게시" 버튼 클릭 완료
- [ ] Kakao Developers Console 접속 완료
- [ ] Web 플랫폼 등록 완료
- [ ] 로컬호스트 도메인 등록 완료
- [ ] 앱 테스트 - Firebase 정상 작동 확인
- [ ] 앱 테스트 - 지도 정상 표시 확인

---

## 🆘 문제 발생 시

### Firebase Rules 적용 후 앱이 안 되는 경우
```
1. Firebase Console > 규칙 탭
2. 현재 규칙 확인
3. firebase-rules.json과 일치하는지 확인
4. 오타가 없는지 확인
5. 게시 버튼을 눌렀는지 확인
```

### Kakao Maps가 안 보이는 경우
```
1. 개발자 도구 콘솔 열기 (F12)
2. 빨간색 에러 메시지 확인
3. "CORS" 또는 "Invalid appkey" 메시지가 있나요?
   → Kakao Console에서 도메인 다시 확인
4. 현재 URL의 도메인과 포트 번호 확인
   → Kakao Console에 정확히 등록했는지 확인
```

---

## 📞 도움이 필요하면

설정 중 막히는 부분이 있으면 알려주세요:
- Firebase Console 화면이 다르게 보이나요?
- Kakao Console에서 어떤 메뉴를 찾을 수 없나요?
- 에러 메시지가 나타나나요?

스크린샷을 찍어서 보여주시면 더 정확히 도와드릴 수 있습니다!

---

**예상 소요 시간**: 5분
**난이도**: ⭐⭐☆☆☆ (쉬움)
**중요도**: ⭐⭐⭐⭐⭐ (매우 중요!)
