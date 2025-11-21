# 작업 관리 앱

건설/현장 작업자를 위한 협업형 작업 관리 시스템

## 주요 기능

- **팀 단위 작업 관리**: 6자리 팀코드로 팀 생성/참여
- **실시간 동기화**: Firebase 기반 실시간 협업
- **경로 최적화**: Kakao Map으로 최적 이동 경로 자동 계산
- **시험 작업 자동화**: 캡핑/탈형/강도 일정 자동 생성
- **현장 관리**: 현장별 주소 및 특이사항 관리
- **드래그앤드롭**: PC/모바일 작업 순서 변경

## 설치 방법

### 1. 프로젝트 클론
```bash
git clone https://github.com/durian0606/workflow.git
cd workflow
```

### 2. API 키 설정
```bash
# config.example.js를 복사
cp config.example.js config.js

# config.js 편집하여 API 키 입력
# - Firebase API 키
# - Kakao Maps API 키
```

### 3. 실행
```bash
# Live Server 또는 로컬 서버로 실행
# index.html 열기
```

## 기술 스택

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Backend**: Firebase Realtime Database
- **API**: Kakao Map SDK, Kakao Mobility Directions API
- **Deployment**: Vercel

## ⚠️ 보안 설정 (필수)

**중요:** 프로덕션 배포 전 반드시 보안 설정을 완료하세요!

### 1. Firebase Security Rules 설정 (5분)
현재 데이터베이스가 **완전히 공개** 상태일 수 있습니다.

```bash
# 1. Firebase Console 접속
https://console.firebase.google.com/

# 2. Realtime Database > 규칙 탭 클릭

# 3. .claude/firebase-rules.json 내용 복사하여 적용

# 4. "게시" 버튼 클릭
```

**빠른 가이드:** `.claude/QUICK_SECURITY_SETUP.md` 참조

### 2. Kakao API 도메인 제한 (2분)
```bash
# 1. https://developers.kakao.com/console/app 접속

# 2. 앱 설정 > 플랫폼 > Web 플랫폼 등록

# 3. 사이트 도메인 추가:
#    - 개발: http://localhost:5500
#    - 배포: https://yourdomain.com

# 4. 저장
```

### 3. 환경 변수 관리
```bash
# config.js는 .gitignore에 등록되어 있습니다
# 절대 Git에 커밋하지 마세요!

# 팀원에게는 config.example.js 공유
```

**상세 가이드:**
- `.claude/QUICK_SECURITY_SETUP.md` - 5분 빠른 설정
- `.claude/SECURITY_GUIDE.md` - 상세 보안 가이드

## 라이선스

MIT

## 문의

- 📧 이메일: durian0606@kakao.com
- 💬 카카오톡: @durian0606
