# 타이포그래피

## 📝 폰트 패밀리

### 시스템 폰트 스택

I Am Ready Done은 사용자 환경에 최적화된 시스템 폰트를 사용합니다.

```css
/* Next.js 기본 폰트 (Geist) */
font-family: var(--font-geist-sans), system-ui, -apple-system, sans-serif;

/* Tailwind CSS 기본 설정 */
font-family: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
```

**장점**:
- 네이티브 성능 (로딩 시간 0)
- OS별 최적화된 가독성
- 이모지 완벽 지원

---

## 📏 폰트 크기 스케일

### 기본 스케일

Tailwind CSS의 기본 타입 스케일을 사용합니다.

| 클래스 | 크기 | 사용처 |
|--------|------|--------|
| `text-xs` | 12px (0.75rem) | 라벨, 배지, 부가 정보 |
| `text-sm` | 14px (0.875rem) | 본문, 버튼, 입력 필드 |
| `text-base` | 16px (1rem) | 기본 본문 |
| `text-lg` | 18px (1.125rem) | 강조 텍스트 |
| `text-xl` | 20px (1.25rem) | 이모지 아이콘 |
| `text-2xl` | 24px (1.5rem) | 페이지 제목 (모바일) |
| `text-3xl` | 30px (1.875rem) | 페이지 제목 (데스크톱) |

### 반응형 타이포그래피

```tsx
// 페이지 제목 - 모바일에서 데스크톱으로 확장
<h1 className="text-2xl sm:text-3xl font-bold">
  📋 I Am Ready Done
</h1>

// 서브 텍스트 - 모바일에서 숨김
<span className="hidden sm:inline text-xs">
  {category}
</span>
```

---

## ⚖️ 폰트 무게 (Font Weight)

| 클래스 | 무게 | 사용처 |
|--------|------|--------|
| `font-normal` | 400 | 기본 텍스트 |
| `font-medium` | 500 | 강조, 라벨 |
| `font-semibold` | 600 | 섹션 제목 |
| `font-bold` | 700 | 페이지 제목 |

**사용 예시**:

```tsx
// 페이지 제목
<h1 className="text-3xl font-bold">I Am Ready Done</h1>

// 섹션 제목
<h2 className="text-lg font-semibold">🤖 AI 분석</h2>

// 라벨
<label className="text-sm font-medium text-gray-400">
  우선순위
</label>

// 본문
<p className="text-sm font-normal text-gray-300">
  설명 텍스트
</p>
```

---

## 📐 행간 (Line Height)

| 클래스 | 값 | 사용처 |
|--------|-----|--------|
| `leading-none` | 1 | 아이콘, 배지 |
| `leading-tight` | 1.25 | 제목 |
| `leading-normal` | 1.5 | 본문 (기본) |
| `leading-relaxed` | 1.625 | 긴 본문 |
| `leading-loose` | 2 | 특별한 강조 |

**기본값**: Tailwind CSS는 폰트 크기에 따라 적절한 행간을 자동 적용합니다.

---

## 🎯 텍스트 정렬

| 클래스 | 정렬 | 사용처 |
|--------|------|--------|
| `text-left` | 왼쪽 | 기본 (LTR 언어) |
| `text-center` | 중앙 | 빈 상태, 에러 메시지 |
| `text-right` | 오른쪽 | 숫자, 통계 |

**사용 예시**:

```tsx
// 빈 상태 메시지
<div className="text-center py-12">
  <p className="text-gray-500 text-xl">할 일이 없습니다 🎉</p>
  <p className="text-gray-600 text-sm mt-2">
    위에서 새로운 할 일을 추가해보세요
  </p>
</div>
```

---

## 🎨 텍스트 컬러

### 계층별 텍스트 컬러

| 계층 | 클래스 | 용도 |
|------|--------|------|
| **주 텍스트** | `text-white` | 제목, 중요 콘텐츠 |
| **보조 텍스트** | `text-gray-300` | 본문, 설명 |
| **라벨/힌트** | `text-gray-400` | 라벨, 부가 정보 |
| **비활성화** | `text-gray-500` | 완료 항목, 플레이스홀더 |
| **미묘한 텍스트** | `text-gray-600` | 숨겨진 정보 |

### 시맨틱 텍스트 컬러

| 의미 | 클래스 | 용도 |
|------|--------|------|
| **링크** | `text-blue-400` | 링크, 인터랙티브 텍스트 |
| **성공** | `text-green-400` / `text-green-300` | 완료, 성공 메시지 |
| **경고** | `text-red-400` / `text-red-300` | 에러, 삭제 |
| **정보** | `text-purple-400` / `text-purple-300` | AI 관련, 특별 기능 |
| **주의** | `text-orange-400` / `text-orange-300` | 마감 임박 |

---

## 🔤 텍스트 스타일

### 데코레이션

```tsx
// 취소선 (완료 항목)
<span className="line-through text-gray-500">
  완료된 할 일
</span>

// 밑줄 (링크 호버)
<a className="hover:underline">
  링크
</a>
```

### 대소문자 변환

```tsx
// 대문자 변환 (선택적 사용)
<span className="uppercase">
  URGENT
</span>

// 첫 글자 대문자 (영문 라벨)
<span className="capitalize">
  high priority
</span>
```

### 텍스트 줄바꿈

```tsx
// 말줄임 (한 줄)
<p className="truncate">
  긴 텍스트...
</p>

// 단어 단위 줄바꿈
<p className="break-words">
  매우긴URL이나단어를포함한텍스트
</p>

// 자동 줄바꿈 유지
<p className="whitespace-pre-wrap">
  {aiAnalysisResult}
</p>
```

---

## 📱 반응형 타이포그래피 패턴

### 모바일 우선 확장

```tsx
// 제목 - 모바일 작게, 데스크톱 크게
<h1 className="text-2xl sm:text-3xl font-bold">
  페이지 제목
</h1>

// 버튼 텍스트 - 모바일에서 아이콘만, 데스크톱에서 전체
<button>
  <span className="sm:hidden">📝</span>
  <span className="hidden sm:inline">📝 리스트</span>
</button>

// 라벨 - 모바일에서 숨김
<span className="hidden sm:inline text-xs px-2 bg-gray-700 rounded-full">
  {category}
</span>
```

---

## 🎯 타이포그래피 계층 구조

### 정보 계층 (Information Hierarchy)

```tsx
// Level 1: 페이지 제목
<h1 className="text-2xl sm:text-3xl font-bold text-white">
  I Am Ready Done
</h1>

// Level 2: 섹션 제목
<h2 className="text-lg font-semibold text-white">
  AI 분석
</h2>

// Level 3: 서브 섹션 / 라벨
<h3 className="text-xs font-semibold text-gray-400 mb-2">
  📋 서브태스크
</h3>

// Level 4: 본문
<p className="text-sm text-gray-300">
  할 일 설명
</p>

// Level 5: 부가 정보
<span className="text-xs text-gray-500">
  2025-01-15
</span>
```

---

## 💡 타이포그래피 베스트 프랙티스

### ✅ Do

```tsx
// 명확한 정보 계층
<article>
  <h2 className="text-lg font-semibold text-white">제목</h2>
  <p className="text-sm text-gray-300 mt-1">본문</p>
  <span className="text-xs text-gray-500">부가정보</span>
</article>

// 접근성을 위한 시맨틱 HTML
<label htmlFor="email" className="text-sm font-medium text-gray-300">
  이메일
</label>

// 읽기 쉬운 행 길이 (최대 65~75자)
<p className="max-w-prose">긴 본문 텍스트...</p>
```

### ❌ Don't

```tsx
// 의미 없는 텍스트 크기 변화
<p className="text-xl">일반 본문</p>
<p className="text-xs">중요한 정보</p>

// 과도한 폰트 무게 사용
<p className="font-bold">모든 텍스트가 굵음</p>

// 가독성 떨어지는 컬러 조합
<p className="text-gray-600">어두운 배경에 너무 어두운 텍스트</p>
```

---

## 🔍 접근성 고려사항

### 최소 폰트 크기

- 본문 텍스트: 최소 `14px` (text-sm)
- 터치 타겟 라벨: 최소 `16px` (text-base)

### 명암비

- 일반 텍스트: 최소 7:1 (AAA)
- 큰 텍스트 (18px+): 최소 4.5:1 (AA)

**테스트 도구**:
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- Chrome DevTools Lighthouse

### 줌 지원

```css
/* 200% 줌까지 레이아웃 유지 */
html {
  font-size: 16px; /* 기본값, rem 단위 기준 */
}

/* 줌 시 텍스트 확장 허용 */
* {
  max-width: 100%;
}
```

---

## 📚 타이포그래피 컴포넌트 예시

### TodoCard 제목

```tsx
<h3 className="text-sm font-normal text-white">
  {todo.title}
</h3>
```

### AI 분석 결과

```tsx
<div>
  <p className="text-xs font-semibold text-gray-400 mb-1">
    🤖 AI 분석
  </p>
  <p className="text-sm text-gray-300 whitespace-pre-wrap">
    {todo.aiAnalysis}
  </p>
</div>
```

### 빈 상태 메시지

```tsx
<div className="text-center py-12">
  <p className="text-gray-500 text-xl">할 일이 없습니다 🎉</p>
  <p className="text-gray-600 text-sm mt-2">
    위에서 새로운 할 일을 추가해보세요
  </p>
</div>
```

---

**Version**: 1.0.0  
**Last Updated**: 2025-01-XX
