# 레이아웃 시스템

## 📐 레이아웃 원칙

I Am Ready Done의 레이아웃은 다음 원칙을 따릅니다:

1. **모바일 퍼스트**: 작은 화면에서 큰 화면으로 확장
2. **유연한 그리드**: Flexbox와 CSS Grid 조합
3. **최대 너비 제한**: 가독성을 위한 컨텐츠 폭 제한
4. **반응형 중단점**: Tailwind CSS 기본 브레이크포인트 활용

---

## 🖥️ 반응형 브레이크포인트

### Tailwind CSS 기본 브레이크포인트

| 접두사 | 최소 너비 | 기기 예시 |
|--------|-----------|-----------|
| (기본) | 0px | 모바일 |
| `sm:` | 640px | 큰 모바일, 작은 태블릿 |
| `md:` | 768px | 태블릿 |
| `lg:` | 1024px | 작은 데스크톱 |
| `xl:` | 1280px | 데스크톱 |
| `2xl:` | 1536px | 큰 데스크톱 |

### 주요 사용 패턴

```tsx
// 모바일: 1열, 데스크톱: 3열
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  {/* ... */}
</div>

// 모바일: 세로, 데스크톱: 가로
<div className="flex flex-col sm:flex-row gap-2">
  {/* ... */}
</div>

// 모바일에서 숨김, 데스크톱에서 표시
<span className="hidden sm:inline">
  데스크톱 전용 텍스트
</span>

// 모바일에서만 표시
<span className="sm:hidden">
  모바일 전용 텍스트
</span>
```

---

## 📦 컨테이너 시스템

### 페이지 컨테이너

```tsx
<main className="min-h-screen bg-gray-950 text-white">
  <div className="max-w-6xl mx-auto p-4 sm:p-6">
    {/* 페이지 콘텐츠 */}
  </div>
</main>
```

**특징**:
- 최대 너비: `max-w-6xl` (1152px)
- 중앙 정렬: `mx-auto`
- 반응형 패딩: `p-4 sm:p-6` (모바일 16px, 데스크톱 24px)
- 전체 높이: `min-h-screen`

### 최대 너비 옵션

| 클래스 | 너비 | 용도 |
|--------|------|------|
| `max-w-sm` | 384px | 작은 모달, 카드 |
| `max-w-md` | 448px | 중간 모달, 로그인 폼 |
| `max-w-lg` | 512px | 큰 모달 |
| `max-w-xl` | 576px | 와이드 모달 |
| `max-w-2xl` | 672px | 아티클 |
| `max-w-4xl` | 896px | 대시보드 |
| `max-w-6xl` | 1152px | 메인 컨텐츠 (사용 중) |
| `max-w-prose` | 65ch | 긴 본문 (최적 읽기 폭) |

---

## 🔲 그리드 시스템

### 칸반 보드 그리드

```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  {/* 대기 컬럼 */}
  <section className="bg-gray-900 rounded-lg p-3 sm:p-4">
    {/* ... */}
  </section>
  
  {/* 진행 중 컬럼 */}
  <section className="bg-gray-900 rounded-lg p-3 sm:p-4">
    {/* ... */}
  </section>
  
  {/* 완료 컬럼 */}
  <section className="bg-gray-900 rounded-lg p-3 sm:p-4">
    {/* ... */}
  </section>
</div>
```

**반응형 동작**:
- **모바일 (< 768px)**: 1열 세로 나열
- **태블릿+ (≥ 768px)**: 3열 가로 나열
- **간격**: 16px (gap-4)

### 필터 칩 그리드

```tsx
<div className="flex gap-2 flex-wrap">
  <button>칩 1</button>
  <button>칩 2</button>
  <button>칩 3</button>
</div>
```

**특징**:
- `flex`: 가로 정렬
- `gap-2`: 8px 간격
- `flex-wrap`: 너비 초과 시 자동 줄바꿈

---

## 📱 Flexbox 패턴

### 헤더 레이아웃

```tsx
<header className="mb-4 sm:mb-6">
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    {/* 제목 */}
    <h1 className="text-2xl sm:text-3xl font-bold">I Am Ready Done</h1>
    
    {/* 버튼 그룹 */}
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
      <div className="flex gap-2">...</div>
      <button>로그아웃</button>
    </div>
  </div>
</header>
```

**반응형 동작**:
- **모바일**: 세로 나열 (`flex-col`), 전체 폭
- **데스크톱**: 가로 나열 (`sm:flex-row`), 양 끝 정렬 (`sm:justify-between`)

### TodoCard 레이아웃

```tsx
<div className="flex items-center gap-2 sm:gap-3 p-3">
  {/* 상태 버튼 */}
  <button className="min-w-[44px] min-h-[44px]">⬜</button>
  
  {/* 우선순위 */}
  <span>🟡</span>
  
  {/* 제목 (flex-1로 남은 공간 차지) */}
  <button className="flex-1 text-left">
    할 일 제목
  </button>
  
  {/* 카테고리 (데스크톱만) */}
  <span className="hidden sm:inline">카테고리</span>
  
  {/* 삭제 버튼 */}
  <button className="min-w-[44px] min-h-[44px]">✕</button>
</div>
```

**구조**:
- `items-center`: 세로 중앙 정렬
- `gap-2 sm:gap-3`: 반응형 간격 (8px / 12px)
- `flex-1`: 남은 공간 차지 (제목)

### 중앙 정렬 레이아웃

```tsx
{/* 로딩 상태 */}
<div className="flex flex-col items-center justify-center gap-3 py-12">
  <div className="spinner"></div>
  <p>로딩 중...</p>
</div>

{/* 빈 상태 */}
<div className="text-center py-12">
  <p>할 일이 없습니다 🎉</p>
</div>
```

---

## 🎯 레이아웃 컴포넌트

### 페이지 레이아웃

```tsx
export default function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        {children}
      </div>
    </main>
  );
}
```

### 섹션 레이아웃

```tsx
<section aria-labelledby="section-title">
  <h2 id="section-title" className="sr-only">섹션 제목</h2>
  {/* 섹션 내용 */}
</section>
```

---

## 🎨 반응형 패턴 예시

### 폼 레이아웃

```tsx
<form className="mb-8 space-y-2">
  {/* 입력 필드 행 */}
  <div className="flex flex-col sm:flex-row gap-2">
    <input className="flex-1 min-w-0" />
    
    <div className="flex gap-2">
      <select className="flex-1 sm:flex-none" />
      <input type="date" className="flex-1 sm:flex-none" />
      <button className="flex-1 sm:flex-none">추가</button>
    </div>
  </div>
  
  {/* 설명 영역 */}
  <textarea className="w-full" rows={3} />
</form>
```

**반응형 동작**:
- **모바일**: 
  - 입력 필드 전체 폭
  - 버튼 그룹 전체 폭
  - 각 버튼 동일한 폭 (`flex-1`)
- **데스크톱**:
  - 한 줄 가로 배치 (`sm:flex-row`)
  - 버튼들 내용 맞춤 (`sm:flex-none`)

### 검색/필터 레이아웃

```tsx
<section className="mb-6 space-y-3">
  {/* 검색바 + 정렬 + 필터 토글 */}
  <div className="flex flex-col sm:flex-row gap-2">
    <input className="flex-1" placeholder="검색..." />
    
    <div className="flex gap-2">
      <select className="flex-1 sm:flex-none">...</select>
      <button className="sm:hidden">필터 열기</button>
    </div>
  </div>
  
  {/* 필터 칩 (모바일에서 접기 가능) */}
  <div className={showFilters ? 'block' : 'hidden sm:block'}>
    <div className="flex items-start sm:items-center gap-2 flex-wrap">
      <span className="min-w-[80px]">우선순위:</span>
      <div className="flex gap-2 flex-wrap">
        {/* 칩들 */}
      </div>
    </div>
  </div>
</section>
```

---

## 📐 공통 레이아웃 패턴

### 양 끝 정렬

```tsx
<div className="flex items-center justify-between">
  <h2>제목</h2>
  <button>액션</button>
</div>
```

### 중앙 정렬

```tsx
<div className="flex items-center justify-center">
  <div>중앙 콘텐츠</div>
</div>
```

### 상하 분할

```tsx
<div className="flex flex-col min-h-screen">
  <header className="flex-shrink-0">헤더</header>
  <main className="flex-1">메인 콘텐츠</main>
  <footer className="flex-shrink-0">푸터</footer>
</div>
```

---

## 🎯 Z-Index 계층

### Z-Index 스케일

| 레벨 | 값 | 용도 |
|------|-----|------|
| Base | 0 | 일반 콘텐츠 |
| Dropdown | 10 | 드롭다운, 툴팁 |
| Sticky | 20 | 고정 헤더, 사이드바 |
| Modal | 50 | 모달, 오버레이 |
| Toast | 100 | 알림, 토스트 |

```tsx
{/* 모달 예시 */}
<div className="fixed inset-0 z-50 flex items-center justify-center">
  <div className="bg-black/50 absolute inset-0" />
  <div className="relative bg-gray-800 rounded-lg p-6">
    {/* 모달 콘텐츠 */}
  </div>
</div>
```

---

## 💡 레이아웃 베스트 프랙티스

### ✅ Do

```tsx
// 모바일 퍼스트
<div className="flex-col sm:flex-row">
  {/* 모바일: 세로, 데스크톱: 가로 */}
</div>

// 시맨틱 HTML
<main>
  <header>...</header>
  <section>...</section>
  <footer>...</footer>
</main>

// 최대 너비 제한
<div className="max-w-6xl mx-auto">
  {/* 가독성을 위한 폭 제한 */}
</div>
```

### ❌ Don't

```tsx
// 데스크톱 퍼스트 (권장 안 함)
<div className="flex-row sm:flex-col">
  {/* 모바일: 가로, 데스크톱: 세로 (역순) */}
</div>

// 고정 너비 (반응형 깨짐)
<div className="w-[800px]">
  {/* 모바일에서 잘림 */}
</div>

// 과도한 중첩
<div className="flex">
  <div className="flex">
    <div className="flex">
      {/* 불필요한 중첩 */}
    </div>
  </div>
</div>
```

---

## 📱 모바일 최적화

### 터치 타겟 크기

```tsx
// 최소 44x44px (WCAG AAA)
<button className="min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0">
  버튼
</button>
```

### 스크롤 영역

```tsx
// 수평 스크롤 (모바일)
<div className="flex gap-2 overflow-x-auto pb-2">
  {/* 많은 칩들 */}
</div>

// 세로 스크롤 (칸반 컬럼)
<div className="space-y-2 min-h-[200px] max-h-[70vh] overflow-y-auto">
  {/* 할 일 목록 */}
</div>
```

---

## 🔍 접근성 고려사항

### 랜드마크 역할

```tsx
<main>         {/* role="main" 자동 적용 */}
<header>       {/* role="banner" */}
<nav>          {/* role="navigation" */}
<section>      {/* role="region" - aria-labelledby 필요 */}
<footer>       {/* role="contentinfo" */}
```

### 스킵 링크 (미래 구현)

```tsx
<a href="#main-content" className="sr-only focus:not-sr-only">
  메인 콘텐츠로 이동
</a>
<main id="main-content">
  {/* ... */}
</main>
```

---

**Version**: 1.0.0  
**Last Updated**: 2025-01-XX
