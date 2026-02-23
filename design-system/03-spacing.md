# 간격 시스템 (Spacing System)

## 📐 Tailwind Spacing Scale

I Am Ready Done은 Tailwind CSS의 기본 간격 스케일을 사용합니다. 모든 값은 `4px` 기본 단위를 따릅니다.

| 클래스 | 값 (rem) | 값 (px) | 사용처 |
|--------|----------|---------|--------|
| `0` | 0 | 0px | 간격 제거 |
| `0.5` | 0.125rem | 2px | 미세 간격 |
| `1` | 0.25rem | 4px | 최소 간격 |
| `2` | 0.5rem | 8px | 작은 간격 |
| `3` | 0.75rem | 12px | 중간 간격 |
| `4` | 1rem | 16px | 기본 간격 |
| `6` | 1.5rem | 24px | 큰 간격 |
| `8` | 2rem | 32px | 섹션 간 간격 |
| `12` | 3rem | 48px | 주요 섹션 간격 |

---

## 📦 컴포넌트 내부 간격 (Padding)

### 버튼 패딩

```tsx
// 기본 버튼 (데스크톱)
className="px-4 py-2"         // 16px 좌우, 8px 상하

// 모바일 버튼 (터치 친화적)
className="px-6 py-2.5 sm:py-2 min-h-[44px] sm:min-h-0"

// 아이콘 버튼
className="p-2"               // 8px 전체

// 큰 버튼
className="px-6 py-3"         // 24px 좌우, 12px 상하
```

### 입력 필드 패딩

```tsx
// 텍스트 입력
className="px-4 py-2.5 sm:py-2"   // 반응형 패딩

// 검색 입력 (아이콘 포함)
className="px-4 py-2.5 pl-10"     // 왼쪽에 아이콘 공간

// 셀렉트 박스
className="px-3 py-2.5 sm:py-2"
```

### 카드 패딩

```tsx
// TodoCard 기본
className="p-3"                   // 12px 전체

// TodoCard 상세 영역
className="px-3 pb-3 pt-1"        // 12px 좌우하, 4px 위

// 섹션 카드
className="p-3 sm:p-4"            // 반응형 12px/16px
```

---

## 🔲 컴포넌트 간 간격 (Gap & Margin)

### 수평 간격 (Gap)

```tsx
// 버튼 그룹
className="flex gap-2"            // 8px

// 필터 칩들
className="flex gap-2 flex-wrap"  // 8px

// 폼 필드들
className="flex flex-col sm:flex-row gap-2"
```

### 수직 간격 (Space-y)

```tsx
// 폼 필드 세로 나열
className="space-y-2"             // 8px

// 상세 정보 섹션
className="space-y-3"             // 12px

// 메인 섹션들
className="space-y-4"             // 16px
```

### 마진 (Margin)

```tsx
// 섹션 하단 여백
className="mb-4 sm:mb-6"          // 반응형 16px/24px

// 헤더 하단 여백
className="mb-6"                  // 24px

// 폼 하단 여백
className="mb-8"                  // 32px

// 아이템 간 간격
className="mt-1"                  // 4px
className="mt-2"                  // 8px
```

---

## 📱 반응형 간격 패턴

### 모바일 → 데스크톱 확장

```tsx
// 페이지 패딩
<div className="p-4 sm:p-6">
  {/* 모바일: 16px, 데스크톱: 24px */}
</div>

// 섹션 여백
<section className="mb-4 sm:mb-6">
  {/* 모바일: 16px, 데스크톱: 24px */}
</section>

// 버튼 패딩
<button className="px-6 py-2.5 sm:py-2">
  {/* 모바일: 좌우 24px, 상하 10px */}
  {/* 데스크톱: 좌우 24px, 상하 8px */}
</button>
```

### 그리드 간격

```tsx
// 칸반 보드 그리드
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  {/* 모바일: 1열, 16px 간격 */}
  {/* 태블릿+: 3열, 16px 간격 */}
</div>

// 리스트 아이템 간격
<ul className="space-y-2">
  {/* 8px 간격 */}
</ul>
```

---

## 🎯 간격 사용 원칙

### 1. **4px 배수 원칙**

모든 간격은 4px의 배수를 사용합니다.

```tsx
// ✅ Good
className="p-2"   // 8px
className="p-3"   // 12px
className="p-4"   // 16px

// ❌ Avoid
className="p-[10px]"  // 임의의 값
```

### 2. **관련 요소는 가깝게, 다른 섹션은 멀게**

```tsx
// 라벨과 입력 필드
<div>
  <label className="mb-1">라벨</label>  {/* 4px 간격 */}
  <input />
</div>

// 섹션 간 구분
<section className="mb-6">...</section>   {/* 24px 간격 */}
<section className="mb-6">...</section>
```

### 3. **계층에 따른 간격**

```tsx
// Level 1: 페이지 패딩
<main className="p-4 sm:p-6">
  
  {/* Level 2: 주요 섹션 간 */}
  <section className="mb-6">
    
    {/* Level 3: 컴포넌트 간 */}
    <div className="space-y-2">
      
      {/* Level 4: 컴포넌트 내부 */}
      <div className="p-3">
        {/* 내용 */}
      </div>
    </div>
  </section>
</main>
```

---

## 🔢 일반적인 간격 패턴

### 페이지 레이아웃

```tsx
<main className="min-h-screen bg-gray-950">
  <div className="max-w-6xl mx-auto p-4 sm:p-6">
    <header className="mb-4 sm:mb-6">...</header>
    <section className="mb-6">...</section>
    <section className="mb-8">...</section>
  </div>
</main>
```

**간격 구조**:
- 컨테이너 패딩: `p-4 sm:p-6` (16px / 24px)
- 헤더 하단: `mb-4 sm:mb-6` (16px / 24px)
- 섹션 간: `mb-6` ~ `mb-8` (24px ~ 32px)

### 폼 레이아웃

```tsx
<form className="space-y-2">
  <div className="flex flex-col sm:flex-row gap-2">
    <input className="px-4 py-2.5 sm:py-2" />
    <select className="px-3 py-2.5 sm:py-2" />
    <button className="px-6 py-2.5 sm:py-2">추가</button>
  </div>
  
  <button className="text-sm px-2 py-1">+ 설명 추가</button>
  
  <textarea className="px-4 py-2" rows={3} />
</form>
```

**간격 구조**:
- 폼 필드 간: `space-y-2` (8px)
- 수평 필드 간: `gap-2` (8px)
- 버튼 내부: `px-6 py-2.5` (24px / 10px)

### 카드 레이아웃

```tsx
<article className="rounded-lg border bg-gray-800 border-gray-700">
  {/* 메인 영역 */}
  <div className="flex items-center gap-2 sm:gap-3 p-3">
    <button className="min-w-[44px] min-h-[44px]">✅</button>
    <span>제목</span>
  </div>
  
  {/* 상세 영역 */}
  <div className="px-3 pb-3 pt-1 space-y-3 border-t border-gray-700">
    <div className="mb-1">라벨</div>
    <p className="text-sm">내용</p>
  </div>
</article>
```

**간격 구조**:
- 카드 패딩: `p-3` (12px)
- 아이템 간 `gap-2 sm:gap-3` (8px / 12px)
- 상세 영역 세로 간격: `space-y-3` (12px)

---

## 🎨 특수 간격 케이스

### 인덴트 (들여쓰기)

```tsx
// 서브태스크 들여쓰기
<div className="ml-4 sm:ml-6">
  {/* 모바일: 16px, 데스크톱: 24px */}
</div>

// 트리 구조 들여쓰기
<ul className="ml-8">
  {/* 32px */}
</ul>
```

### 네거티브 마진

```tsx
// 클릭 영역 확장
<button className="px-2 -mx-2">
  {/* 실제 패딩: 8px, 시각적 여백: 0 */}
</button>
```

### 자동 중앙 정렬

```tsx
// 최대 너비 + 중앙 정렬
<div className="max-w-6xl mx-auto">
  {/* 좌우 자동 마진 */}
</div>
```

---

## 💡 간격 베스트 프랙티스

### ✅ Do

```tsx
// Tailwind 유틸리티 사용
<div className="p-4 space-y-3">
  <div className="mb-2">...</div>
</div>

// 반응형 간격 적용
<section className="mb-4 sm:mb-6">
  <div className="p-3 sm:p-4">...</div>
</section>

// 일관된 간격 패턴
<form className="space-y-2">
  {/* 모든 필드 8px 간격 */}
</form>
```

### ❌ Don't

```tsx
// 임의의 픽셀 값 사용
<div className="p-[15px]">...</div>

// 간격 없는 밀집 레이아웃
<div>
  <button>버튼1</button>
  <button>버튼2</button>
</div>

// 과도한 간격
<section className="mb-20">
  <div className="p-12">...</div>
</section>
```

---

## 🔍 접근성 고려사항

### 터치 타겟 간격

```tsx
// 최소 8px 간격 권장 (WCAG 2.5.8)
<div className="flex gap-2">
  <button className="min-w-[44px] min-h-[44px]">버튼1</button>
  <button className="min-w-[44px] min-h-[44px]">버튼2</button>
</div>
```

### 읽기 편의성

```tsx
// 단락 간 충분한 간격
<div className="space-y-4">
  <p>첫 번째 단락</p>
  <p>두 번째 단락</p>
</div>

// 라벨-입력 필드 간격
<label className="mb-1 block">라벨</label>
<input />
```

---

## 📊 간격 참조표

### 주요 간격 값

| 용도 | 클래스 | 값 |
|------|--------|-----|
| 최소 간격 | `gap-1`, `space-y-1` | 4px |
| 작은 간격 | `gap-2`, `space-y-2` | 8px |
| 기본 간격 | `gap-3`, `space-y-3` | 12px |
| 중간 간격 | `gap-4`, `space-y-4` | 16px |
| 큰 간격 | `gap-6`, `space-y-6` | 24px |
| 섹션 간격 | `gap-8`, `space-y-8` | 32px |

### 컴포넌트별 기본 간격

| 컴포넌트 | 내부 패딩 | 외부 마진 |
|----------|-----------|-----------|
| 버튼 | `px-4 py-2` | - |
| 입력 필드 | `px-4 py-2.5` | - |
| 카드 | `p-3` | `mb-2` |
| 섹션 | `p-4 sm:p-6` | `mb-6` |
| 페이지 | `p-4 sm:p-6` | - |

---

**Version**: 1.0.0  
**Last Updated**: 2025-01-XX
