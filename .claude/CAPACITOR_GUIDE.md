# 📱 Capacitor 앱 빌드 가이드

## 📋 목차
1. [사전 준비](#사전-준비)
2. [Capacitor 초기 설정](#capacitor-초기-설정)
3. [Android 앱 빌드](#android-앱-빌드)
4. [iOS 앱 빌드](#ios-앱-빌드)
5. [배포 준비](#배포-준비)

---

## 🛠️ 사전 준비

### 필수 소프트웨어

#### 공통
- [Node.js](https://nodejs.org/) (LTS 버전, 18.x 이상)
- Git

#### Android 개발
- [Android Studio](https://developer.android.com/studio) (최신 버전)
- Java Development Kit (JDK) 17

#### iOS 개발 (Mac 전용)
- Xcode 14 이상
- CocoaPods (`sudo gem install cocoapods`)

---

## 🚀 Capacitor 초기 설정

### 1. 프로젝트 초기화

```bash
# 프로젝트 디렉토리로 이동
cd C:\Users\woori\webapp\worklist

# package.json 생성 (없는 경우)
npm init -y

# Capacitor 설치
npm install @capacitor/core @capacitor/cli

# Capacitor 초기화
npx cap init
```

#### Capacitor 설정 입력
```
? App name: 작업 관리
? App Package ID: com.yourcompany.worklist
? (선택) 웹 리소스 디렉토리: .
```

### 2. 플랫폼 추가

```bash
# Android 플랫폼 추가
npm install @capacitor/android
npx cap add android

# iOS 플랫폼 추가 (Mac만)
npm install @capacitor/ios
npx cap add ios
```

### 3. capacitor.config.json 설정

프로젝트 루트에 자동 생성됩니다:

```json
{
  "appId": "com.yourcompany.worklist",
  "appName": "작업 관리",
  "webDir": ".",
  "server": {
    "androidScheme": "https",
    "iosScheme": "https"
  },
  "plugins": {
    "SplashScreen": {
      "launchShowDuration": 2000,
      "backgroundColor": "#2a459c",
      "showSpinner": false
    }
  }
}
```

### 4. 필수 플러그인 설치

```bash
# 위치 권한 (지도 기능)
npm install @capacitor/geolocation

# 앱 런처 (카카오맵 연동)
npm install @capacitor/app-launcher

# 네트워크 상태
npm install @capacitor/network

# 상태바
npm install @capacitor/status-bar
```

---

## 📱 Android 앱 빌드

### 1. 프로젝트 동기화

```bash
# 웹 리소스를 Android 프로젝트로 복사
npx cap copy android

# 또는 동기화 (copy + update)
npx cap sync android
```

### 2. Android Studio에서 열기

```bash
npx cap open android
```

또는 수동으로:
```
Android Studio 실행
→ Open an Existing Project
→ worklist/android 폴더 선택
```

### 3. 앱 권한 설정

`android/app/src/main/AndroidManifest.xml` 확인:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />

<!-- 카카오맵 앱 실행을 위한 쿼리 -->
<queries>
  <package android:name="net.daum.android.map" />
</queries>
```

### 4. 앱 아이콘 설정

```
android/app/src/main/res/
  ├── mipmap-hdpi/
  ├── mipmap-mdpi/
  ├── mipmap-xhdpi/
  ├── mipmap-xxhdpi/
  └── mipmap-xxxhdpi/
```

각 폴더에 `ic_launcher.png` 파일 추가

**아이콘 생성 도구:**
- https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html
- https://icon.kitchen/

### 5. 빌드 설정

`android/app/build.gradle`:

```gradle
android {
    namespace "com.yourcompany.worklist"
    compileSdkVersion 34

    defaultConfig {
        applicationId "com.yourcompany.worklist"
        minSdkVersion 22
        targetSdkVersion 34
        versionCode 1
        versionName "0.8.3"
    }
}
```

### 6. APK 빌드

#### 디버그 버전 (테스트용)
```
Android Studio 메뉴
→ Build > Build Bundle(s) / APK(s) > Build APK(s)

생성 위치:
android/app/build/outputs/apk/debug/app-debug.apk
```

#### 릴리즈 버전 (배포용)

**1) 서명 키 생성**
```bash
keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

**2) `android/app/build.gradle` 수정**
```gradle
android {
    signingConfigs {
        release {
            storeFile file("../../my-release-key.keystore")
            storePassword "your-password"
            keyAlias "my-key-alias"
            keyPassword "your-password"
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

**3) 릴리즈 빌드**
```
Android Studio 메뉴
→ Build > Generate Signed Bundle / APK
→ APK 선택
→ 키 정보 입력
→ release 선택

생성 위치:
android/app/release/app-release.apk
```

---

## 🍎 iOS 앱 빌드 (Mac 전용)

### 1. 프로젝트 동기화

```bash
# 웹 리소스를 iOS 프로젝트로 복사
npx cap copy ios
npx cap sync ios
```

### 2. CocoaPods 설치

```bash
cd ios/App
pod install
cd ../..
```

### 3. Xcode에서 열기

```bash
npx cap open ios
```

또는 수동으로:
```
ios/App/App.xcworkspace 파일 더블클릭
```

### 4. 앱 설정

Xcode에서:
```
프로젝트 선택 (App)
→ TARGETS > App
→ General 탭
  - Display Name: 작업 관리
  - Bundle Identifier: com.yourcompany.worklist
  - Version: 0.8.3
  - Build: 1
```

### 5. 권한 설정

`ios/App/App/Info.plist`:

```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>현재 위치에서 작업 현장까지의 경로를 표시하기 위해 위치 권한이 필요합니다.</string>

<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>현재 위치에서 작업 현장까지의 경로를 표시하기 위해 위치 권한이 필요합니다.</string>

<!-- 카카오맵 앱 실행 -->
<key>LSApplicationQueriesSchemes</key>
<array>
    <string>kakaomap</string>
</array>
```

### 6. 빌드 및 테스트

#### 시뮬레이터에서 테스트
```
상단 메뉴: Product > Run (⌘R)
또는 재생 버튼 클릭
```

#### 실제 기기에서 테스트
```
1. iPhone을 Mac에 연결
2. Xcode에서 기기 선택
3. Signing & Capabilities 탭
   → Team 선택 (Apple Developer 계정 필요)
4. Product > Run
```

---

## 📦 배포 준비

### Google Play Store (Android)

#### 1. 개발자 계정 등록
```
https://play.google.com/console
→ 가입 ($25, 평생)
```

#### 2. 앱 등록 준비물

- **AAB 파일** (Android App Bundle, 권장)
  ```
  Android Studio 메뉴
  → Build > Generate Signed Bundle / APK
  → Android App Bundle 선택
  ```

- **앱 아이콘**: 512x512 PNG
- **스크린샷**: 최소 2개 (720p 이상)
- **홍보 이미지**: 1024x500
- **앱 설명**:
  ```
  짧은 설명 (80자):
  "건설/시공 현장 작업 관리를 위한 스마트 업무 도구"

  전체 설명:
  작업 일정, 현장 위치, 팀원 협업을 한 곳에서 관리하세요.
  - 작업 추가 및 순서 관리
  - 담당자 지정 및 완료 기한 설정
  - 현장 위치 기반 이동 경로 표시
  - 팀 단위 작업 공유 및 협업
  ...
  ```

- **개인정보처리방침 URL** (필수)
  ```
  Firebase Hosting 또는 GitHub Pages에 호스팅
  예: https://your-project.web.app/privacy-policy.html
  ```

#### 3. 앱 심사 제출
```
Play Console
→ 새 앱 만들기
→ 앱 정보 입력
→ 프로덕션 트랙 > 새 버전 만들기
→ AAB 파일 업로드
→ 검토 후 출시
```

**심사 기간**: 1-3일

---

### ONE Store (Android)

#### 1. 개발자 등록
```
https://dev.onestore.co.kr/
→ 회원가입 (무료)
→ 개발자 등록
```

#### 2. 앱 등록
```
ONE Store Developer Center
→ 앱 등록
→ APK 업로드 (AAB도 지원)
→ 앱 정보 입력
→ 심사 요청
```

**심사 기간**: 3-7일

---

### Apple App Store (iOS)

#### 1. Apple Developer 계정
```
https://developer.apple.com/programs/
→ 가입 ($99/년)
```

#### 2. App Store Connect
```
https://appstoreconnect.apple.com/
→ My Apps > + 버튼
→ 새로운 앱 등록
```

#### 3. Xcode에서 업로드
```
Xcode 메뉴
→ Product > Archive
→ Distribute App
→ App Store Connect
→ Upload
```

**심사 기간**: 1-2일

---

## 🔄 업데이트 배포

### 웹 콘텐츠 업데이트

```bash
# 1. 파일 수정 (index.html, script.js 등)
# 2. 버전 업데이트 (config.js)
# 3. Capacitor 동기화
npx cap copy android
npx cap copy ios

# 4. 앱 재빌드 및 스토어 업로드
```

### Live Update (선택사항)

Capacitor Live Update를 사용하면 앱 스토어 심사 없이 즉시 업데이트 가능:

```bash
npm install @capacitor/live-updates
```

단, 네이티브 코드 변경은 여전히 스토어 업데이트 필요

---

## ⚠️ 주의사항

### 1. HTTPS 필수
앱스토어 정책상 HTTP는 불가, HTTPS만 허용

### 2. 앱 버전 관리
```javascript
// config.js
app: {
  version: '0.8.3',  // 웹 앱 버전
}

// Android: android/app/build.gradle
versionCode 1        // 숫자만 (1, 2, 3, ...)
versionName "0.8.3"  // 표시용

// iOS: Xcode
Version: 0.8.3
Build: 1
```

### 3. 앱 권한
- 위치: 필수 (지도 기능)
- 네트워크: 필수 (Firebase)
- 앱 실행: 선택 (카카오맵 연동)

### 4. 테스트 체크리스트
- [ ] 로그인/회원가입
- [ ] 작업 추가/수정/삭제
- [ ] 지도 표시 및 경로
- [ ] 네비게이션 앱 연동
- [ ] 팀 생성/참여
- [ ] 오프라인 동작 (부분적)
- [ ] 뒤로가기 버튼

---

## 📞 도움말

### Capacitor 공식 문서
https://capacitorjs.com/docs

### 커뮤니티
- GitHub: https://github.com/ionic-team/capacitor
- Forum: https://forum.ionicframework.com/c/capacitor

---

## ✅ 다음 단계

1. ✅ API 보안 설정 완료 (SECURITY_GUIDE.md)
2. ⬜ Capacitor 초기 설정 (이 문서)
3. ⬜ Firebase Hosting 배포
4. ⬜ Android 앱 빌드
5. ⬜ ONE Store 등록 (무료)
6. ⬜ 사용자 피드백 수집
7. ⬜ 유료화 준비

**현재 단계**: Capacitor 설정 준비 완료
**다음 작업**: `npm init -y` 실행
