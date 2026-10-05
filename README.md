# 배우고 (BeuGo) - 직장인 에듀 숏폼 웹 서비스 (MVP)

출퇴근길 3분 투자로 실무 역량을 강화하는 직장인 맞춤형 에듀 숏폼 웹 애플리케이션입니다.

---

## 🛠️ 기술 스택 (Tech Stack)
- **Framework**: React 19 (Functional Components, Hooks)
- **Build Tool**: Vite 8 + TypeScript
- **Styling**: Tailwind CSS v4, Pretendard 웹폰트
- **Icons**: Lucide Icons (`lucide-react`)
- **State Management & Persistence**: React Context API + `localStorage`

---

## 📱 3차 개편: '모두닥(image.png)' 스타일 통합 뷰포트 레이아웃

### 1. 모바일 & 웹 일체형 단일 레이아웃
- 데스크톱 전용 사이드 패널이나 불필요한 분기 없이, **모바일과 데스크톱 웹 모두에서 완전히 동일한 단일 컨테이너(`max-w-[460px] mx-auto`)**로 서비스가 제공됩니다.
- 데스크톱 브라우저에서는 중앙에 정돈된 모바일 퍼스트 웹 뷰로 렌더링되며, 스마트폰 환경에서는 100% 꽉 찬 전체 화면으로 자연스럽게 동작합니다.

### 2. 모두닥 스타일 상단 헤더 & 하단 탭바
- **상단 헤더**:
  - 좌측: `배우고` 로고 및 '직장인 3분' 뱃지
  - 우측: `출석 스트릭(일수)` + `로그인/회원가입` (로그인 시 유저명/프로필) + 돋보기 `검색` 아이콘
- **하단 탭바**:
  - `홈(피드)` / `강좌 탐색` / `관심사/설정` / `마이 학습실` (데스크톱/모바일 동일 고정 네비게이션)

### 3. 세로 스크롤 스냅 숏폼 피드 (Scroll Snap Feed)
- 마우스 휠, 트랙패드, 터치 스와이프로 부드럽게 위아래로 틱틱 넘기며 영상을 시청 (`snap-y snap-mandatory`).
- 뷰포트 진입 60% 이상 감지 시 자동 재생 전환 및 3초 유지 시 조회수 `+1` 적립.
- 우측 액션 바: 좋아요(토글), 조회수, 대본/메모 바텀시트, 유료 강의 구매 버튼, 몰입 모드.
- 영상 80% 진행 시 확인 퀴즈 팝업 배너 노출.

### 4. 1초 간편 로그인 & 비회원 피드 자유 시청
- **비로그인(게스트) 상태**:
  - 누구나 로그인 없이도 숏폼 피드를 자유롭게 시청 가능.
- **1초 원클릭 간편 로그인**:
  - 버튼 클릭 한 번으로 `김직장` 계정으로 즉시 로그인.
- **회원 전용 기능**:
  - 관심 직무 및 학습 목표 설정 저장
  - 유료 실무 강좌 평생 소장 구매 및 수강권 관리
  - STT 자막 하이라이트 밑줄 및 구간별 메모 저장
  - 오답 노트 보관 및 오답 모아 재출제 풀기

### 5. 관심사 및 학습 설정 전용 독립 페이지 (`/settings`)
- 팝업 모달 대신 컨테이너 내에서 매끄럽게 전환되는 독립 페이지 (`InterestsSettingsPage`).
- 직무 관심사 다중 선택 칩, 하루 목표 시간(10분/20분/30분) 슬라이더, 학습 선호 시간대(출퇴근/점심/취침 전), 알림 수신 설정.

---

## 🧪 검수 결과

```bash
$ npm run lint
oxlint
Found 0 warnings and 0 errors.

$ npm run build
tsc -b && vite build
✓ 1915 modules transformed.
dist/index.html                   1.00 kB │ gzip:   0.61 kB
dist/assets/index-C8sv7GlD.css   72.01 kB │ gzip:  10.54 kB
dist/assets/index-GrYoB60N.js   347.67 kB │ gzip: 102.03 kB
✓ built in 1.28s
```

## 🚀 실행 방법

```bash
# 개발 서버 실행
npm run dev

# 빌드 및 린트 검사
npm run lint
npm run build
```
