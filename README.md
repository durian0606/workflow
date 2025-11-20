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

## 보안 설정

Firebase와 Kakao API 보안 설정이 필요합니다.
자세한 내용은 `.claude/QUICK_SECURITY_SETUP.md` 참조

## 라이선스

MIT

## 문의

- 📧 이메일: durian0606@kakao.com
- 💬 카카오톡: @durian0606
