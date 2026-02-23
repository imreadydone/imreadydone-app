# 애니메이션 시스템

## 🎬 애니메이션 원칙

I Am Ready Done의 애니메이션은 다음 원칙을 따릅니다:

1. **의미 있는 피드백**: 사용자 행동에 즉각적인 시각적 피드백
2. **자연스러운 움직임**: 물리 법칙을 반영한 easing
3. **성능 우선**: CSS 애니메이션 우선, GPU 가속 활용
4. **접근성 존중**: `prefers-reduced-motion` 미디어 쿼리 지원

---

## ⚡ 애니메이션 속도

### 타이밍 가이드

| 타입 | 지속시간 | 용도 |
|------|----------|------|
| **즉각적** | 0.15s | 버튼 호버, 포커스 |
| **빠름** | 0.2s ~ 0.3s | 토글, 체크박스, 작은 요소 |
| **보통** | 0.3s ~ 0.5s | 모달, 카드 등장/퇴장 |
| **느림** | 0.6s ~ 1s | 페이지 전환, 스피너 |

### Easing Functions

```css
/* 기본 (대부분의 전환) */
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

/* 부드러운 (페이드, 스케일) */
transition: all 0.3s ease-out;

/* 통통 튀는 효과 (성공 피드백) */
transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);

/* 선형 (스피너) */
animation: spin 0.6s linear infinite;
```

---

## 🎨 키프레임 애니메이션

### Fade In/Out

```css
/* globals.css */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

/* 사용 */
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

.animate-fade-out {
  animation: fadeOut 0.3s ease-out;
}
```

**사용 예시**:
```tsx
<div className="text-center py-12 animate-fade-in">
  <p>할 일이 없습니다 🎉</p>
</div>
```

### Slide Down/Up

```css
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideUp {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-10px);
  }
}

.animate-slide-down {
  animation: slideDown 0.3s ease-out;
}

.animate-slide-up {
  animation: slideUp 0.3s ease-out;
}
```

**사용 예시**:
```tsx
// 새로 추가된 할 일
const isJustAdded = justAddedId === todo.id;
<article className={isJustAdded ? "animate-slide-down" : ""}>
  {/* ... */}
</article>

// 삭제되는 할 일
const isDeleting = deletingIds.has(todo.id);
<article className={isDeleting ? "animate-slide-up" : ""}>
  {/* ... */}
</article>
```

### Scale In

```css
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-scale-in {
  animation: scaleIn 0.2s ease-out;
}
```

### Bounce

```css
@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

.animate-bounce {
  animation: bounce 0.5s ease-in-out;
}
```

**사용 예시**:
```tsx
// 체크박스 체크 시
input[type="checkbox"]:checked {
  animation: bounce 0.3s ease-in-out;
}
```

### Pulse (로딩/강조)

```css
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

**사용 예시**:
```tsx
<span className="animate-pulse">🤖 AI 분석 중...</span>
```

### Shake (에러 피드백)

```css
@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-5px);
  }
  75% {
    transform: translateX(5px);
  }
}

.animate-shake {
  animation: shake 0.3s ease-in-out;
}
```

**사용 예시**:
```tsx
// 폼 제출 에러 시
<form className={error ? "animate-shake" : ""}>
  {/* ... */}
</form>
```

### Success Pulse

```css
@keyframes successPulse {
  0% {
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(34, 197, 94, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
  }
}

.animate-success-pulse {
  animation: successPulse 0.5s ease-out;
}
```

**사용 예시**:
```tsx
// 완료 상태 전환 시
const handleStatusToggle = async (todo: Todo) => {
  // ... 상태 업데이트 로직
  
  if (willBeCompleted) {
    const button = document.querySelector(`[data-todo-id="${todo.id}"]`);
    if (button) {
      button.classList.add("animate-success-pulse");
      setTimeout(() => button.classList.remove("animate-success-pulse"), 500);
    }
  }
};
```

### Spin (로딩)

```css
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
```

**사용 예시**:
```tsx
<div className="spinner"></div>

/* CSS */
.spinner {
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-top-color: #3b82f6;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  animation: spin 0.6s linear infinite;
}
```

---

## 🔄 트랜지션 (Transitions)

### 기본 트랜지션

```css
/* globals.css */
.transition-smooth {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.transition-bounce {
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

**사용 예시**:
```tsx
// TodoCard 전환
<article className="transition-smooth">
  {/* ... */}
</article>
```

### 버튼 트랜지션

```css
/* globals.css */
button {
  transition: transform 0.15s ease, box-shadow 0.15s ease, background-color 0.2s ease;
}

button:hover:not(:disabled) {
  transform: translateY(-1px);
}

button:active:not(:disabled) {
  transform: translateY(0);
}
```

**자동 적용**: 모든 버튼에 자동으로 적용됩니다.

### 체크박스 트랜지션

```css
input[type="checkbox"] {
  transition: all 0.2s ease;
}

input[type="checkbox"]:checked {
  animation: bounce 0.3s ease-in-out;
}
```

---

## 🎯 드래그앤드롭 애니메이션

### 드래그 시작

```css
.draggable {
  cursor: grab;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.draggable:active {
  cursor: grabbing;
}

.dragging {
  opacity: 0.5;
  transform: scale(1.02);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
}
```

**사용 예시**:
```tsx
<article
  className="draggable"
  draggable={true}
  onDragStart={(e) => {
    e.currentTarget.classList.add("dragging");
  }}
  onDragEnd={(e) => {
    e.currentTarget.classList.remove("dragging");
  }}
>
  {/* ... */}
</article>
```

### 드롭 존 하이라이트

```css
.drag-over {
  background-color: rgba(59, 130, 246, 0.1);
  border-color: #3b82f6;
  border-style: dashed;
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
}
```

**사용 예시**:
```tsx
<div
  onDragEnter={(e) => {
    e.currentTarget.classList.add("drag-over");
  }}
  onDragLeave={(e) => {
    e.currentTarget.classList.remove("drag-over");
  }}
>
  {/* 드롭 존 */}
</div>
```

---

## ♿ 접근성: Reduced Motion

### prefers-reduced-motion 미디어 쿼리

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
- 사용자가 OS에서 "애니메이션 줄이기" 옵션을 활성화하면 모든 애니메이션이 거의 즉시 완료
- 접근성을 높이고 전정계 장애가 있는 사용자를 배려

---

## 🎨 마이크로 인터랙션

### 호버 효과

```tsx
// 버튼 호버 (자동 적용)
<button className="hover:bg-blue-700">
  버튼
</button>

// 아이콘 호버
<button className="hover:scale-110 transition">
  ✕
</button>

// 삭제 버튼 호버
<button className="text-gray-600 hover:text-red-400 transition">
  ✕
</button>
```

### 포커스 효과

```tsx
<button className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-950">
  버튼
</button>
```

**특징**:
- 포커스 시 파란색 링 표시
- 오프셋으로 배경과 구분
- 키보드 네비게이션 사용자를 위한 명확한 피드백

---

## 🔥 고급 애니메이션 패턴

### Stagger Animation (순차 등장)

```tsx
// 미래 구현: 리스트 아이템 순차 등장
{todos.map((todo, index) => (
  <div
    key={todo.id}
    className="animate-slide-down"
    style={{ animationDelay: `${index * 50}ms` }}
  >
    <TodoCard todo={todo} />
  </div>
))}
```

### 조건부 애니메이션

```tsx
const [isVisible, setIsVisible] = useState(false);

<div className={isVisible ? "animate-fade-in" : "animate-fade-out"}>
  {/* 내용 */}
</div>
```

---

## 💡 애니메이션 베스트 프랙티스

### ✅ Do

```tsx
// CSS 애니메이션 우선 (성능)
<div className="animate-slide-down">...</div>

// 의미 있는 피드백
<button 
  onClick={handleSuccess}
  className="animate-success-pulse"
>
  완료
</button>

// 접근성 고려
/* CSS에서 prefers-reduced-motion 지원 */
```

### ❌ Don't

```tsx
// 과도한 애니메이션
<div className="animate-bounce animate-pulse animate-spin">
  {/* 너무 산만함 */}
</div>

// JavaScript 기반 애니메이션 (성능 저하)
element.style.transition = "all 0.3s";

// 의미 없는 애니메이션
<button className="animate-shake">
  일반 버튼
</button>
```

---

## 🎯 성능 최적화

### GPU 가속 활용

```css
/* transform과 opacity만 애니메이션 */
.animate-slide-down {
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);  /* GPU 가속 */
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

**권장**: `transform`, `opacity` 속성만 애니메이션

**피할 것**: `width`, `height`, `left`, `top` 등 레이아웃 속성

### will-change 사용 (선택적)

```css
/* 빈번하게 애니메이션되는 요소 */
.draggable {
  will-change: transform;
}

.modal {
  will-change: opacity, transform;
}
```

**주의**: 과도한 사용은 메모리 낭비

---

## 📊 애니메이션 타임라인 예시

### 할 일 추가 시퀀스

1. **버튼 클릭** (0ms)
   - 버튼 `active:` 스타일 (즉시)
2. **새 할 일 등장** (50ms)
   - `animate-slide-down` (300ms)
3. **완료** (350ms)

### 할 일 삭제 시퀀스

1. **삭제 버튼 클릭** (0ms)
   - `deletingIds` 상태 업데이트
2. **카드 퇴장** (0~300ms)
   - `animate-slide-up` (300ms)
3. **Firestore 삭제** (300ms)
   - 실제 데이터 삭제
4. **완료** (300ms+)

---

**Version**: 1.0.0  
**Last Updated**: 2025-01-XX
