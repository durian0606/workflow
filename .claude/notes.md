# 작업 관리 앱 개발 가이드

## 📋 개발 규칙

### 1. 버전 관리 (캐시 버스팅)
- **중요:** CSS/JS 파일 수정 시 반드시 버전 업데이트 필수!
- 현재 버전: **v=0.67**
- 위치: `index.html`의 `<link>` 및 `<script>` 태그
  ```html
  <link rel="stylesheet" href="styles.css?v=0.67">
  <script src="script.js?v=0.67"></script>
  ```
- 버전 형식: `v=0.XX` (소수점 둘째 자리까지)

### 2. 커밋 메시지 형식
```
<type>: <subject>

<body>

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Type 종류:**
- `feat`: 새로운 기능
- `fix`: 버그 수정
- `style`: UI/UX 스타일 변경
- `refactor`: 코드 리팩토링
- `debug`: 디버깅용 코드 (임시)
- `chore`: 빌드/설정 관련

### 3. 디버깅용 색상 경계선 ~~(현재 적용 중)~~ ✅ 제거 완료 (v0.62)
레이아웃 조정을 위한 임시 색상 경계선 (이미 제거됨):
- ~~**파란색**: `task-card` (전체 카드)~~
- ~~**빨간색**: `number-check-container`, `order-number`, `task-checkbox`~~
- ~~**초록색**: `task-card-body` (작업 내용 영역)~~
- ~~**보라색**: `task-title` (제목)~~
- ~~**청록색**: `deadline-label-container` (완료기한)~~
- ~~**주황색**: `person-select-container` (담당자 영역)~~
- ~~**노란색**: `assignee-select` (담당자 선택)~~
- ~~**마젠타색**: `action-btn` (삭제 버튼)~~

**필요 시 재적용:** 각 클래스에 `border: 2px solid [색상]` 추가

---

## 🎨 현재 레이아웃 크기

### 작업 카드 (task-card)
- padding: `8px 10px`
- gap: `8px` (요소 사이 간격)

### 번호 + 체크박스 (number-check-container)
- gap: `2px` (번호-체크박스 사이)
- margin-right: `8px`
- align-self: `flex-start` (상단 정렬)

### 리스트 번호 (order-number)
- 크기: `20px × 20px` (원형)
- 글자: `10px`

### 체크박스 (task-checkbox)
- 터치 영역: `32px × 32px`
- 보이는 원: `16px × 16px` + border `2px` = 실제 `20px` (번호와 동일)

### 완료기한 (deadline-label-container)
- margin-top: `2px`
- gap: `3px`
- deadline-date-tag padding: `1px 4px`

---

## 📁 프로젝트 구조
```
worklist/
├── index.html         # 메인 HTML (버전 관리)
├── styles.css         # 스타일시트 (버전 관리)
├── script.js          # 메인 스크립트 (버전 관리)
├── api/
│   └── directions.js  # 경로 API
├── workflow/          # 워크플로우 관련
└── .claude/
    └── notes.md       # 이 파일
```

---

## 🔧 주요 수정 이력
- **v0.67**: 네비게이션 디버깅 개선 - 로딩 표시 추가, 상세 로그 추가, 에러 처리 강화
- v0.66: 네비게이션 현장 주소 기반 좌표 변환 - Geocoder API로 주소→좌표 변환 후 네비 실행
- v0.65: 네비게이션 기능 간소화 - 앱 선택 드롭다운 제거, 직선거리 표시 제거, 카카오맵으로 통일
- v0.64: 네비게이션 앱 연동 (카카오맵/티맵), 작업 순서대로 경유지 자동 설정
- v0.63: 팀코드 변경 기능 추가, 팀설정 모달 최적화 (모바일 스크롤 제거)
- v0.62: 디버깅용 색상 경계선 제거, 레이아웃 최종 완료
- v0.61: 체크박스 크기 조정, 모바일 하단 여백 개선
- v0.6: Toast 알림 시스템, 터치 영역 개선

---

## ⚠️ 주의사항
1. CSS/JS 수정 후 **반드시 버전 업데이트**
2. 디버깅용 경계선은 레이아웃 확정 후 제거
3. 커밋 전에 `git status`로 변경사항 확인
4. 모바일 터치 영역 최소 32px 이상 유지
