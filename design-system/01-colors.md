# 컬러 시스템

## 🎨 컬러 팔레트 개요

I Am Ready Done의 컬러 시스템은 다크 테마를 기본으로 하며, Tailwind CSS의 기본 컬러 스케일을 활용합니다.

## 📐 브랜드 컬러

### Primary (Blue)
메인 액션, 링크, 선택 상태를 나타냅니다.

```css
/* Tailwind: blue-500 ~ blue-700 */
--color-primary-light: #3b82f6;   /* blue-600 - 주 사용 */
--color-primary: #2563eb;         /* blue-700 - hover */
--color-primary-dark: #1d4ed8;    /* blue-800 */
```

**사용 예시**:
- 추가 버튼 (`bg-blue-600 hover:bg-blue-700`)
- 필터 칩 선택 상태 (`bg-blue-600`)
- 포커스 링 (`focus:ring-blue-500`)

---

## 🔴 시맨틱 컬러

### Success (Green)
완료, 성공, 긍정적인 상태를 나타냅니다.

```css
/* Tailwind: green-500 ~ green-700 */
--color-success: #16a34a;         /* green-600 */
--color-success-light: #22c55e;   /* green-500 */
--color-success-dark: #15803d;    /* green-700 */
```

**사용 예시**:
- 완료 상태 버튼 (`bg-green-700 hover:bg-green-600`)
- 성공 메시지 배경 (`bg-green-900/20 border-green-700/30`)

### Danger (Red)
삭제, 에러, 경고 상태를 나타냅니다.

```css
/* Tailwind: red-500 ~ red-700 */
--color-danger: #dc2626;          /* red-600 */
--color-danger-light: #ef4444;    /* red-500 */
--color-danger-dark: #b91c1c;     /* red-700 */
```

**사용 예시**:
- 삭제 버튼 호버 (`hover:text-red-400`)
- 에러 메시지 (`bg-red-900/20 border-red-500 text-red-400`)
- 기한 초과 배지 (`bg-red-900/50 text-red-300 border-red-700`)

### Warning (Orange)
주의, 마감 임박 등을 나타냅니다.

```css
/* Tailwind: orange-600 ~ orange-700 */
--color-warning: #ea580c;         /* orange-600 */
--color-warning-light: #f97316;   /* orange-500 */
--color-warning-dark: #c2410c;    /* orange-700 */
```

**사용 예시**:
- 마감 임박 배지 (`bg-orange-900/50 text-orange-300 border-orange-700`)

### Info (Purple)
추가 정보, 서브태스크, 특별한 기능을 나타냅니다.

```css
/* Tailwind: purple-600 ~ purple-700 */
--color-info: #9333ea;            /* purple-600 */
--color-info-light: #a855f7;      /* purple-500 */
--color-info-dark: #7e22ce;       /* purple-700 */
```

**사용 예시**:
- AI 서브태스크 (`bg-purple-700 hover:bg-purple-600`)
- 서브태스크 구분선 (`border-purple-700`)
- 서브태스크 카운트 배지 (`bg-purple-900/50 text-purple-300 border-purple-700`)

---

## 🌑 배경 및 표면 컬러

### 배경 (Background)

```css
/* Primary Background - 페이지 전체 배경 */
--bg-primary: #030712;            /* gray-950 */

/* Secondary Background - 카드, 입력 필드 */
--bg-secondary: #1f2937;          /* gray-800 */

/* Tertiary Background - 모달, 섹션 */
--bg-tertiary: #111827;           /* gray-900 */
```

**계층 구조**:
1. **Level 0**: `bg-gray-950` - 페이지 배경
2. **Level 1**: `bg-gray-900` - 칸반 컬럼, 섹션
3. **Level 2**: `bg-gray-800` - 카드, 입력 필드, 버튼

### 경계선 (Border)

```css
--border-primary: #374151;        /* gray-700 */
--border-secondary: #4b5563;      /* gray-600 */
--border-light: #6b7280;          /* gray-500 */
```

**사용 패턴**:
- 기본 경계선: `border-gray-700`
- 강조 경계선: `border-gray-600`
- 드래그 오버: `border-blue-500`

---

## 📝 텍스트 컬러

### 주 텍스트 (Primary Text)

```css
--text-primary: #ffffff;          /* white */
--text-secondary: #d1d5db;        /* gray-300 */
--text-tertiary: #9ca3af;         /* gray-400 */
--text-disabled: #6b7280;         /* gray-500 */
--text-muted: #4b5563;            /* gray-600 */
```

**계층 구조**:
- **제목/중요 텍스트**: `text-white`
- **본문 텍스트**: `text-gray-300`
- **라벨/부가 정보**: `text-gray-400`
- **비활성화**: `text-gray-500`
- **플레이스홀더**: `placeholder-gray-500`

### 상태별 텍스트

```css
/* 완료된 항목 */
--text-done: #6b7280;             /* gray-500 + line-through */

/* 링크 */
--text-link: #60a5fa;             /* blue-400 */
--text-link-hover: #93c5fd;       /* blue-300 */
```

---

## 🏷️ 상태 컬러 (Status Colors)

### 할 일 상태

| 상태 | 이모지 | 배경 | 텍스트 | 경계선 |
|------|--------|------|--------|--------|
| 대기 (pending) | ⬜ | `bg-gray-800` | `text-white` | `border-gray-700` |
| 진행 중 (in-progress) | 🔄 | `bg-gray-800` | `text-white` | `border-gray-700` |
| 완료 (done) | ✅ | `bg-gray-900` | `text-gray-500` | `border-gray-800` |

### 우선순위 컬러

| 우선순위 | 이모지 | 배경 (배지) | 텍스트 |
|----------|--------|-------------|--------|
| 긴급 (urgent) | 🔴 | `bg-red-900/50` | `text-red-300` |
| 높음 (high) | 🟠 | `bg-orange-900/50` | `text-orange-300` |
| 보통 (medium) | 🟡 | `bg-yellow-900/50` | `text-yellow-300` |
| 낮음 (low) | 🟢 | `bg-green-900/50` | `text-green-300` |

---

## 🎭 투명도 활용

### 배경 투명도

```css
/* 강조 배경 - 20% 투명도 */
--bg-emphasis-success: rgba(34, 197, 94, 0.2);   /* green-900/20 */
--bg-emphasis-danger: rgba(220, 38, 38, 0.2);    /* red-900/20 */
--bg-emphasis-info: rgba(59, 130, 246, 0.3);     /* blue-900/30 */

/* 미묘한 배경 - 40~50% 투명도 */
--bg-subtle-purple: rgba(147, 51, 234, 0.4);     /* purple-900/40 */
--bg-subtle-blue: rgba(37, 99, 235, 0.1);        /* blue-900/10 */
```

**사용 예시**:
- 알림 배경: `bg-blue-900/30 border-blue-700`
- 배지 배경: `bg-purple-900/50`
- AI 실행 결과: `bg-green-900/20 border-green-700/30`

---

## 🌈 컬러 접근성

### 명암비 (Contrast Ratio)

모든 텍스트-배경 조합은 WCAG 2.1 AAA 기준을 준수합니다:

- **대형 텍스트 (18px+ 또는 14px+ bold)**: 최소 4.5:1
- **일반 텍스트**: 최소 7:1

### 고대비 모드

`prefers-contrast: high` 미디어 쿼리를 사용하여 고대비 모드를 지원합니다:

```css
@media (prefers-contrast: high) {
  body {
    background-color: #000000;
  }
  
  button,
  input,
  select,
  textarea {
    border-width: 2px;
  }
}
```

---

## 📱 다크 모드 전용

현재 버전은 다크 모드만 지원합니다. 향후 라이트 모드 추가 시 다음을 고려:

1. 모든 컬러에 대응하는 라이트 버전 정의
2. `prefers-color-scheme` 미디어 쿼리 지원
3. 사용자 선호도 로컬 스토리지 저장

---

## 💡 사용 가이드

### ✅ Do

```tsx
// Tailwind 유틸리티 클래스 사용
<button className="bg-blue-600 hover:bg-blue-700 text-white">
  추가
</button>

// 투명도를 활용한 강조
<div className="bg-blue-900/30 border border-blue-700">
  알림 메시지
</div>
```

### ❌ Don't

```tsx
// 하드코딩된 색상 값 사용 금지
<button style={{ backgroundColor: '#3b82f6' }}>
  추가
</button>

// 시맨틱 의미 없는 색상 사용 금지
<div className="bg-pink-500">
  에러 메시지
</div>
```

---

**Version**: 1.0.0  
**Last Updated**: 2025-01-XX
