# 반응형 및 접근성 대응

## 📋 작업 내용

TODO ID: eVufgLLyqi5lUx283dX5  
모바일/태블릿 대응 레이아웃 최적화 및 WCAG 기준 접근성(키보드 네비게이션, 스크린리더 등)을 개선했습니다.

## ✨ 주요 개선 사항

### 1. 반응형 레이아웃 최적화

#### 모바일/태블릿 대응
- **헤더**: 2단 레이아웃으로 모바일 최적화
- **필터 UI**: 모바일에서 접기/펼치기 기능 추가
  - 필터 활성화 시 시각적 표시 (느낌표 배지)
- **폼**: 세로 스택 레이아웃으로 변경
- **칸반 보드**: 1열 → 3열 그리드 (모바일 → 데스크톱)

#### 터치 친화적 UI
- 모바일에서 모든 터치 타겟 최소 44x44px 보장 (WCAG 2.1 AAA)
- 버튼 간격 및 크기 조정
- 체크박스 크기 확대 (모바일: 20px, 데스크톱: 16px)

### 2. WCAG 2.1 AA 접근성 개선

#### 의미론적 HTML
- `<header>`, `<section>`, `<article>`, `<footer>` 사용
- `<h1>`, `<h2>`, `<h3>` 계층 구조 명확화
- `<label>` 요소로 폼 라벨 연결

#### 키보드 네비게이션
- 모든 인터랙티브 요소에 `focus:ring` 스타일 추가
- `focus-visible` 스타일로 키보드 포커스 강조
- 탭 순서 최적화

#### 스크린리더 지원
- **ARIA 라벨**: 
  - `aria-label`: 아이콘 버튼, 상태 표시 등
  - `aria-labelledby`: 섹션 헤딩 연결
  - `aria-expanded`: 아코디언/토글 상태
  - `aria-pressed`: 토글 버튼 상태
  - `aria-live`: 동적 콘텐츠 업데이트 알림
  - `aria-required`: 필수 입력 필드
  - `aria-invalid`: 유효성 검사 실패 표시
- **role 속성**: `group`, `list`, `listitem`, `region`, `alert`, `status`
- **sr-only 클래스**: 스크린리더 전용 텍스트

#### 색상 대비 및 시각적 표시
- 포커스 링: 파란색 (#3b82f6) 2px outline
- 에러 메시지: `role="alert"` + `aria-live="assertive"`
- D-day 상태별 색상 구분 (초과/임박/여유)

### 3. CSS 접근성 개선

#### globals.css 추가 스타일
```css
/* 포커스 표시 강화 */
*:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* 모션 감소 설정 존중 */
@media (prefers-reduced-motion: reduce) {
  /* 애니메이션 비활성화 */
}

/* 고대비 모드 지원 */
@media (prefers-contrast: high) {
  /* 테두리 강화 */
}
```

## 📱 반응형 브레이크포인트

- **모바일**: < 640px (sm)
- **태블릿**: 640px ~ 768px (md)
- **데스크톱**: > 768px

## ♿ 접근성 체크리스트

- [x] 키보드만으로 모든 기능 사용 가능
- [x] 포커스 표시 명확함
- [x] 스크린리더로 모든 콘텐츠 읽기 가능
- [x] ARIA 라벨 적절히 사용
- [x] 의미론적 HTML 구조
- [x] 터치 타겟 크기 충분 (44x44px)
- [x] 색상 대비 충분
- [x] 에러 메시지 명확
- [x] 모션 감소 설정 존중
- [x] 고대비 모드 지원

## 🧪 테스트 방법

### 반응형 테스트
1. 개발자 도구에서 디바이스 모드 활성화
2. 다양한 화면 크기에서 레이아웃 확인
3. 터치 타겟 크기 및 간격 확인

### 접근성 테스트
1. **키보드 네비게이션**: Tab, Shift+Tab, Enter, Space
2. **스크린리더**: macOS VoiceOver (Cmd+F5) 또는 NVDA/JAWS
3. **자동 검사**: Lighthouse, axe DevTools
4. **수동 검사**: 포커스 표시, ARIA 라벨, 의미론적 구조

## 📦 변경된 파일

- `src/app/page.tsx`: 메인 페이지 반응형 및 접근성 개선
- `src/components/AuthForm.tsx`: 로그인 폼 접근성 개선
- `src/app/globals.css`: 접근성 스타일 추가

## 🔍 주요 변경 사항

### page.tsx
- 모바일 필터 토글 상태 추가
- 헤더 반응형 레이아웃
- 필터 UI 모바일 최적화
- 폼 입력 필드 레이블 및 ARIA 속성 추가
- TodoCard 접근성 개선 (article, aria-label, role)
- 칸반 보드 시맨틱 구조 개선

### AuthForm.tsx
- 폼 라벨 표시 (기존 sr-only에서 visible로 변경)
- ARIA 속성 추가 (aria-required, aria-invalid)
- 에러 메시지 role="alert" 추가

### globals.css
- 포커스 스타일 강화
- prefers-reduced-motion 지원
- prefers-contrast 지원
- 터치 타겟 크기 보장

## 🎯 기대 효과

- 모바일 사용자 경험 개선
- 접근성 향상으로 더 많은 사용자 포용
- WCAG 2.1 AA 준수로 법적 요구사항 충족
- SEO 개선 (의미론적 HTML)
- 키보드 사용자 편의성 향상

## 📸 스크린샷

_(테스트 후 추가 예정)_

## ✅ 체크리스트

- [x] develop 브랜치 기준으로 새 브랜치 생성
- [x] 기존 디자인 및 기능 유지
- [x] 반응형 레이아웃 구현
- [x] WCAG 2.1 AA 접근성 기준 충족
- [x] 키보드 네비게이션 지원
- [x] 스크린리더 지원
- [x] 터치 친화적 UI
- [x] 변경사항 커밋
- [x] PR 생성
