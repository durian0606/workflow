# Firebase Storage 설정 가이드

## 📋 설정 순서

### 1. Firebase Console 접속
1. https://console.firebase.google.com/ 접속
2. `work-todo-6ab7f` 프로젝트 선택

### 2. Storage 활성화
1. 왼쪽 메뉴에서 **"Storage"** 클릭
2. **"시작하기"** 버튼 클릭
3. 보안 규칙 모드 선택:
   - **"테스트 모드로 시작"** 선택 (30일 제한)
   - 또는 아래 규칙 사용

### 3. Storage 보안 규칙 설정

**Storage Rules 탭에서 다음 규칙 적용:**

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // 이미지 업로드/다운로드 허용
    match /workImages/{allPaths=**} {
      allow read: if true;
      allow write: if true;
    }
    match /siteImages/{allPaths=**} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

**게시(Publish)** 버튼 클릭!

### 4. 완료 확인
- Storage가 활성화되면 "gs://work-todo-6ab7f.appspot.com" 버킷이 생성됩니다
- 이제 이미지 업로드가 가능합니다!

## 📁 저장 구조

```
work-todo-6ab7f.appspot.com/
├── workImages/
│   ├── {teamId}/
│   │   └── {workId}/
│   │       ├── image1_timestamp.jpg
│   │       ├── image2_timestamp.jpg
│   │       └── ...
│   └── ...
└── siteImages/
    ├── {teamId}/
    │   └── {siteId}/
    │       ├── image1_timestamp.jpg
    │       └── ...
    └── ...
```

## 💰 비용 예상 (무료 한도)

**Spark Plan (무료):**
- 저장 용량: **5GB**
- 다운로드: **1GB/일**
- 업로드: **20,000회/일**

**예상 사용량:**
- 이미지 1장 평균 500KB (압축 후)
- 하루 20,000장 = 약 10GB/일 업로드 (무료 한도 초과!)

**권장: Blaze Plan (종량제) 전환 필요**
- 저장 용량: $0.026/GB/월
- 다운로드: $0.12/GB
- 업로드: 무료

**월 예상 비용:**
- 저장 용량: 100GB × $0.026 = **$2.6**
- 다운로드: 30GB × $0.12 = **$3.6**
- **총 약 $6.2/월** (약 8,000원)

## ⚠️ 주의사항

1. **이미지 압축 필수**: 모바일 사진은 크기가 크므로 압축 필요
2. **보안 규칙**: 프로덕션에서는 인증된 사용자만 업로드하도록 수정 권장
3. **비용 모니터링**: Firebase Console에서 사용량 정기 확인

## 🔗 참고 문서
- https://firebase.google.com/docs/storage
- https://firebase.google.com/pricing
