# 접근성 가이드 (Accessibility)

## ♿ 접근성 원칙

I Am Ready Done은 **WCAG 2.1 AAA** 수준을 목표로 합니다.

### 4가지 핵심 원칙 (POUR)

1. **Perceivable (인식 가능)**: 모든 사용자가 콘텐츠를 인식할 수 있어야 함
2. **Operable (조작 가능)**: 키보드, 마우스, 터치, 음성 등으로 조작 가능
3. **Understandable (이해 가능)**: 명확하고 일관된 UI
4. **Robust (견고)**: 보조 기술과 호환

---

## 🎹 키보드 접근성

### 포커스 관리

#### 포커스 표시

```css
/* globals.css */
*:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

button:focus-visible,
a:focus-visible,
input:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}
```

**특징**:
- 파란색 2px 아웃라인
- 2px 오프셋으로 배경과 구분
- `:focus-visible`로 키보드 포커스만 표시 (마우스 클릭 시 표시 안 함)

#### 포커스 링 스타일

```tsx
<button className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-950">
  버튼
</button>
```

**구조**:
- `focus:outline-none`: 기본 아웃라인 제거
- `focus:ring-2`: 2px 링
- `focus:ring-blue-500`: 파란색
- `focus:ring-offset-2`: 2px 오프셋
- `focus:ring-offset-gray-950`: 다크 배경 고려

### 키보드 네비게이션

#### 탭 순서

```tsx
// 논리적 탭 순서 유지
<form>
  <input tabIndex={0} />      {/* 1. 제목 입력 */}
  <select tabIndex={0} />     {/* 2. 우선순위 */}
  <input type="date" tabIndex={0} />  {/* 3. 마감일 */}
  <button tabIndex={0}>추가</button>   {/* 4. 제출 */}
</form>
```

**권장사항**:
- `tabIndex={0}`: 자연스러운 DOM 순서 유지
- `tabIndex={-1}`: 포커스 불가능하지만 프로그래밍 방식으로 포커스 가능
- `tabIndex > 0`: **사용 금지** (탭 순서 혼란)

#### 스킵 링크 (미래 구현)

```tsx
<a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg">
  메인 콘텐츠로 이동
</a>

<main id="main-content">
  {/* 페이지 콘텐츠 */}
</main>
```

**효과**: Tab 키 첫 번째 누름 시 스킵 링크 표시, 클릭 시 메인 콘텐츠로 바로 이동

---

## 🔊 스크린 리더 지원

### ARIA 속성

#### aria-label & aria-labelledby

```tsx
// aria-label: 짧은 라벨
<button aria-label="할 일 삭제">
  ✕
</button>

// aria-labelledby: 다른 요소 참조
<section aria-labelledby="section-title">
  <h2 id="section-title">필터 옵션</h2>
  {/* ... */}
</section>
```

#### aria-describedby

```tsx
<input
  id="email"
  aria-describedby="email-hint"
/>
<p id="email-hint" className="text-xs text-gray-500">
  example@domain.com 형식으로 입력하세요
</p>
```

#### aria-live

```tsx
// 동적 업데이트 알림
<div aria-live="polite" aria-atomic="true">
  {parentTodos.length}개의 할 일 표시 중
</div>

// 에러 메시지
<div role="alert" aria-live="assertive">
  이메일 또는 비밀번호가 올바르지 않습니다.
</div>
```

**aria-live 값**:
- `off`: 알림 없음 (기본)
- `polite`: 현재 읽는 내용 끝난 후 알림
- `assertive`: 즉시 알림 (에러, 긴급)

#### aria-expanded & aria-controls

```tsx
// 아코디언/토글
<button
  onClick={() => toggleExpand(todo.id)}
  aria-expanded={isExpanded}
  aria-controls={`todo-details-${todo.id}`}
>
  {todo.title}
</button>

<div
  id={`todo-details-${todo.id}`}
  role="region"
  aria-label={`${todo.title} 상세 정보`}
>
  {/* 상세 내용 */}
</div>
```

#### aria-pressed

```tsx
// 토글 버튼
<button
  aria-pressed={selectedPriorities.includes(priority)}
  onClick={() => togglePriority(priority)}
>
  {priority}
</button>
```

#### aria-checked

```tsx
// 체크박스
<input
  type="checkbox"
  checked={subtask.status === "done"}
  aria-checked={subtask.status === "done"}
  aria-label={`${subtask.title} ${subtask.status === "done" ? "완료됨" : "미완료"}`}
/>
```

### role 속성

#### 명시적 역할

```tsx
// 리스트 역할
<ul role="list">
  <li role="listitem">...</li>
</ul>

// 알림 역할
<div role="alert">
  에러 메시지
</div>

// 그룹 역할
<div role="group" aria-labelledby="priority-label">
  <span id="priority-label">우선순위</span>
  {/* 우선순위 버튼들 */}
</div>
```

#### 랜드마크 역할 (시맨틱 HTML 우선)

```tsx
// ✅ Good: 시맨틱 HTML
<header>헤더</header>
<main>메인</main>
<nav>네비게이션</nav>
<footer>푸터</footer>

// ❌ Avoid: 명시적 role (시맨틱 HTML이 자동 적용)
<div role="banner">헤더</div>
<div role="main">메인</div>
```

### 스크린 리더 전용 텍스트

```css
/* globals.css */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

```tsx
// 사용 예시
<h2 className="sr-only">새 할 일 추가</h2>

<button>
  <span className="sr-only">할 일 삭제</span>
  <span aria-hidden="true">✕</span>
</button>
```

---

## 🎨 시각 접근성

### 색상 대비

#### WCAG AAA 기준

| 텍스트 크기 | 최소 대비 | 권장 대비 |
|-------------|-----------|-----------|
| 일반 (< 18px) | 7:1 | 7:1+ |
| 큰 텍스트 (≥ 18px) | 4.5:1 | 7:1+ |

#### 현재 사용 중인 조합

```tsx
// ✅ 7:1 이상 (AAA)
text-white on bg-gray-950       // 21:1
text-gray-300 on bg-gray-800    // 8.5:1
text-gray-400 on bg-gray-800    // 5.8:1

// ✅ 4.5:1 이상 (AA)
text-blue-400 on bg-gray-950    // 5.2:1
```

**테스트 도구**:
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- Chrome DevTools > Lighthouse

### 고대비 모드

```css
/* globals.css */
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

### 색맹 고려

```tsx
// ❌ 색상만으로 의미 전달 (색맹 사용자 혼란)
<button className="bg-red-600">삭제</button>

// ✅ 색상 + 텍스트/아이콘 조합
<button className="bg-red-600">
  <span aria-hidden="true">✕</span>
  <span className="sr-only">삭제</span>
</button>

// ✅ 이모지로 우선순위 구분 (색맹 무관)
🔴 긴급 | 🟠 높음 | 🟡 보통 | 🟢 낮음
```

---

## 📱 터치 접근성

### 최소 터치 타겟 크기

#### WCAG 2.5.5 (AAA): 44x44 CSS px

```tsx
// 모바일 터치 타겟
<button className="min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0">
  버튼
</button>

// 체크박스
<input
  type="checkbox"
  className="w-5 h-5 sm:w-4 sm:h-4"  // 모바일: 20px, 데스크톱: 16px
/>
```

**권장사항**:
- 모바일: 최소 44x44px
- 데스크톱: 유연하게 조정 가능

### 터치 타겟 간격

```tsx
// 최소 8px 간격 (WCAG 2.5.8)
<div className="flex gap-2">
  <button className="min-w-[44px] min-h-[44px]">버튼1</button>
  <button className="min-w-[44px] min-h-[44px]">버튼2</button>
</div>
```

---

## 🎭 모션 접근성

### prefers-reduced-motion

```css
/* globals.css */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

**효과**:
- 전정계 장애가 있는 사용자를 위해 애니메이션 거의 비활성화
- OS 설정에서 "애니메이션 줄이기" 활성화 시 자동 적용

---

## 📝 폼 접근성

### 라벨 연결

```tsx
// ✅ Good: label과 input 연결
<label htmlFor="email" className="block mb-1">
  이메일
</label>
<input id="email" type="email" />

// ❌ Avoid: 라벨 없는 입력
<input type="email" placeholder="이메일" />
```

### 필수 필드 표시

```tsx
<label htmlFor="title">
  할 일 <span className="text-red-400" aria-label="필수">*</span>
</label>
<input
  id="title"
  required
  aria-required="true"
/>
```

### 에러 메시지

```tsx
<input
  id="email"
  type="email"
  aria-invalid={error ? "true" : "false"}
  aria-describedby={error ? "email-error" : undefined}
/>
{error && (
  <p id="email-error" role="alert" className="text-red-400 text-sm mt-1">
    {error}
  </p>
)}
```

---

## 🔍 의미론적 HTML (Semantic HTML)

### 시맨틱 요소 사용

```tsx
// ✅ Good
<article className="todo-card">
  <h3>할 일 제목</h3>
  <p>설명</p>
</article>

// ❌ Avoid
<div className="todo-card">
  <div className="title">할 일 제목</div>
  <div className="description">설명</div>
</div>
```

### 올바른 제목 계층

```tsx
<h1>I Am Ready Done</h1>          {/* 페이지 제목 */}
  <h2>필터 옵션</h2>               {/* 주요 섹션 */}
    <h3>우선순위</h3>              {/* 서브 섹션 */}
    <h3>카테고리</h3>
  <h2>할 일 목록</h2>
    <h3>할 일 제목</h3>            {/* 각 할 일 */}
      <h4>AI 분석</h4>             {/* 상세 정보 */}
```

**원칙**:
- 제목 레벨 건너뛰지 않기 (h1 → h3 ❌)
- 페이지당 h1 하나만
- 논리적 계층 구조 유지

---

## 💡 접근성 체크리스트

### ✅ 키보드

- [ ] 모든 인터랙티브 요소 Tab으로 접근 가능
- [ ] 포커스 표시 명확
- [ ] 논리적 탭 순서
- [ ] 스킵 링크 제공 (미래 구현)

### ✅ 스크린 리더

- [ ] 모든 이미지/아이콘에 대체 텍스트 (aria-label)
- [ ] 폼 요소에 라벨 연결
- [ ] ARIA 속성 적절히 사용
- [ ] 동적 업데이트 aria-live로 알림

### ✅ 시각

- [ ] 색상 대비 7:1 이상 (AAA)
- [ ] 색상만으로 의미 전달 안 함
- [ ] 텍스트 크기 최소 14px
- [ ] 고대비 모드 지원

### ✅ 터치

- [ ] 터치 타겟 최소 44x44px
- [ ] 터치 타겟 간 충분한 간격 (8px+)

### ✅ 모션

- [ ] prefers-reduced-motion 지원
- [ ] 애니메이션 선택적 사용

---

## 🧪 테스트 도구

### 자동화 도구

1. **Chrome DevTools Lighthouse**
   - Accessibility 점수 확인
   - 자동화된 접근성 이슈 탐지

2. **axe DevTools (브라우저 확장)**
   - 더 상세한 WCAG 위반 탐지
   - 수정 제안 제공

3. **WAVE (웹 접근성 평가 도구)**
   - 시각적으로 접근성 이슈 표시

### 수동 테스트

1. **키보드 네비게이션**
   - Tab, Shift+Tab으로 모든 요소 접근 테스트
   - Enter, Space로 버튼/링크 활성화 테스트

2. **스크린 리더**
   - macOS: VoiceOver (Cmd+F5)
   - Windows: NVDA (무료)
   - Chrome: ChromeVox 확장

3. **고대비 모드**
   - Windows: 고대비 모드 활성화
   - macOS: 투명도 줄이기, 대비 증가

4. **모션 줄이기**
   - macOS: 시스템 환경설정 > 손쉬운 사용 > 디스플레이 > 동작 줄이기
   - Windows: 설정 > 접근성 > 디스플레이 > 애니메이션 표시

---

## 📚 참고 자료

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [WebAIM](https://webaim.org/)
- [The A11Y Project](https://www.a11yproject.com/)

---

**Version**: 1.0.0  
**Last Updated**: 2025-01-XX
