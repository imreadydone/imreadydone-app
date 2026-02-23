# 컴포넌트 스타일 가이드

## 🧩 컴포넌트 개요

I Am Ready Done의 UI 컴포넌트는 일관성, 접근성, 재사용성을 중심으로 설계되었습니다.

---

## 🔘 버튼 (Buttons)

### 기본 버튼 스타일

#### Primary Button

```tsx
<button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-950 rounded-lg font-medium transition">
  추가
</button>
```

**특징**:
- 배경: `bg-blue-600` → `hover:bg-blue-700`
- 포커스 링: `focus:ring-2 focus:ring-blue-500`
- 모서리: `rounded-lg` (8px)
- 트랜지션: `transition` (기본 0.15s)

#### Secondary Button

```tsx
<button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 rounded-lg font-medium transition">
  취소
</button>
```

#### Danger Button

```tsx
<button className="px-4 py-2 bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 rounded-lg font-medium transition">
  로그아웃
</button>
```

### 버튼 크기 변형

```tsx
// 작은 버튼
className="px-2 py-1 text-xs"

// 기본 버튼
className="px-4 py-2 text-sm"

// 큰 버튼
className="px-6 py-3 text-base"
```

### 아이콘 버튼

```tsx
<button className="text-gray-600 hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 rounded transition min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center">
  ✕
</button>
```

**특징**:
- 최소 크기: 모바일 `44x44px`, 데스크톱 자동
- 아이콘 중앙 정렬: `flex items-center justify-center`

### 상태별 버튼

```tsx
// 비활성화
<button disabled className="disabled:opacity-50 disabled:cursor-not-allowed">
  처리 중...
</button>

// 로딩 상태
<button className="flex items-center gap-2">
  <div className="spinner"></div>
  로딩 중...
</button>
```

---

## 📝 입력 필드 (Input Fields)

### 텍스트 입력

```tsx
<input
  type="text"
  className="w-full px-4 py-2.5 sm:py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  placeholder="할 일을 입력하세요..."
/>
```

**특징**:
- 배경: `bg-gray-800`
- 경계선: `border-gray-700`
- 포커스: `focus:ring-2 focus:ring-blue-500`
- 반응형 패딩: `py-2.5 sm:py-2`

### 텍스트 영역

```tsx
<textarea
  rows={3}
  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
  placeholder="상세 설명을 입력하세요..."
/>
```

**특징**:
- 크기 조절 금지: `resize-none`
- 고정 행 수: `rows={3}`

### 선택 상자 (Select)

```tsx
<select className="px-3 py-2.5 sm:py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
  <option value="low">🟢 Low</option>
  <option value="medium">🟡 Medium</option>
  <option value="high">🟠 High</option>
  <option value="urgent">🔴 Urgent</option>
</select>
```

### 체크박스

```tsx
<input
  type="checkbox"
  className="w-5 h-5 sm:w-4 sm:h-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
/>
```

**특징**:
- 크기: 모바일 `20px`, 데스크톱 `16px`
- 체크 색상: `text-blue-600`
- 포커스 오프셋: `focus:ring-offset-gray-800`

### 날짜 선택기

```tsx
<input
  type="date"
  className="px-3 py-2.5 sm:py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
/>
```

---

## 🃏 카드 (Cards)

### TodoCard

```tsx
<article className="rounded-lg border bg-gray-800 border-gray-700 transition-smooth">
  {/* 메인 영역 */}
  <div className="flex items-center gap-2 sm:gap-3 p-3">
    <button className="text-xl">⬜</button>
    <span className="text-sm">🟡</span>
    <button className="flex-1 text-left">할 일 제목</button>
    <button className="text-gray-600 hover:text-red-400">✕</button>
  </div>
  
  {/* 상세 영역 (선택적) */}
  <div className="px-3 pb-3 pt-1 space-y-3 border-t border-gray-700">
    <p className="text-sm text-gray-300">상세 내용</p>
  </div>
</article>
```

**특징**:
- 모서리: `rounded-lg` (8px)
- 배경: `bg-gray-800`
- 경계선: `border-gray-700`
- 트랜지션: `transition-smooth` (0.3s cubic-bezier)

### 완료된 TodoCard

```tsx
<article className="rounded-lg border bg-gray-900 border-gray-800 opacity-60">
  {/* ... */}
</article>
```

**차이점**:
- 배경 어둡게: `bg-gray-900`
- 투명도 낮춤: `opacity-60`

### 섹션 카드

```tsx
<section className="bg-gray-900 rounded-lg p-3 sm:p-4 border border-gray-800">
  <header className="flex items-center justify-between mb-4">
    <h2 className="text-lg font-semibold">⬜ 대기</h2>
    <span className="text-sm bg-gray-800 px-2 py-1 rounded-full">3</span>
  </header>
  <div className="space-y-2">
    {/* 카드 목록 */}
  </div>
</section>
```

---

## 🏷️ 배지 (Badges)

### 기본 배지

```tsx
<span className="text-xs px-2 py-0.5 bg-gray-700 rounded-full text-gray-400">
  카테고리
</span>
```

### 상태 배지

```tsx
// D-day 배지 (마감 임박)
<span className="text-xs px-2 py-0.5 rounded-full font-medium bg-orange-900/50 text-orange-300 border border-orange-700">
  📅 D-3
</span>

// 기한 초과
<span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-900/50 text-red-300 border border-red-700">
  📅 기한 초과 (D+2)
</span>

// 서브태스크 카운트
<span className="text-xs px-2 py-0.5 rounded-full font-medium bg-purple-900/50 text-purple-300 border border-purple-700">
  📎 2/5 하위 작업
</span>
```

### 카운트 배지

```tsx
<span className="text-sm bg-gray-800 px-2 py-1 rounded-full">
  {count}
</span>
```

---

## 🎛️ 필터 칩 (Filter Chips)

### 기본 칩

```tsx
<button className="px-3 py-1.5 sm:py-1 rounded-full text-sm font-medium transition bg-gray-800 text-gray-400 hover:bg-gray-700">
  🟡 Medium
</button>
```

### 선택된 칩

```tsx
<button className="px-3 py-1.5 sm:py-1 rounded-full text-sm font-medium transition bg-blue-600 text-white">
  🟡 Medium
</button>
```

---

## 🔔 알림 및 메시지 (Alerts & Messages)

### 정보 알림

```tsx
<div className="p-4 bg-blue-900/30 border border-blue-700 rounded-lg">
  <h2 className="font-medium">🔔 푸시 알림 활성화</h2>
  <p className="text-sm text-gray-400">
    할 일 알림을 받으려면 권한을 허용하세요
  </p>
</div>
```

### 에러 메시지

```tsx
<div className="rounded-lg bg-red-900/20 border border-red-500 px-4 py-3" role="alert">
  <p className="text-sm text-red-400">이메일 또는 비밀번호가 올바르지 않습니다.</p>
</div>
```

### 성공 메시지

```tsx
<div className="p-3 bg-green-900/20 border border-green-700/30 rounded-lg">
  <p className="text-xs font-semibold text-green-400 mb-1">✅ 실행 결과</p>
  <p className="text-sm text-gray-300">작업이 완료되었습니다.</p>
</div>
```

---

## 🔄 로딩 인디케이터 (Loading Indicators)

### 스피너

```tsx
<div className="spinner"></div>

/* CSS (globals.css) */
.spinner {
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-top-color: #3b82f6;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  animation: spin 0.6s linear infinite;
}
```

### 큰 스피너

```tsx
<div className="spinner-large"></div>

/* CSS */
.spinner-large {
  width: 40px;
  height: 40px;
  border-width: 3px;
}
```

### 인라인 로딩

```tsx
<button className="flex items-center gap-2">
  <div className="spinner"></div>
  처리 중...
</button>
```

---

## 🎨 빈 상태 (Empty States)

```tsx
<div className="text-center py-12 animate-fade-in">
  <p className="text-gray-500 text-xl">할 일이 없습니다 🎉</p>
  <p className="text-gray-600 text-sm mt-2">
    위에서 새로운 할 일을 추가해보세요
  </p>
</div>
```

**특징**:
- 중앙 정렬: `text-center`
- 여백: `py-12`
- 애니메이션: `animate-fade-in`

---

## 🎯 드롭다운 및 선택 (Dropdowns & Selects)

### 에이전트 선택 드롭다운

```tsx
<div>
  <label className="text-xs font-semibold text-gray-400 mb-1 block">
    👤 할당 에이전트
  </label>
  <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
    <option value="">에이전트 선택 안 함</option>
    <option value="todo-app">todo-app</option>
  </select>
</div>
```

---

## 🎭 모달 및 오버레이 (Modals & Overlays)

### 기본 모달 (미래 구현)

```tsx
<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
  <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-700">
    <h2 className="text-xl font-bold mb-4">제목</h2>
    <p className="text-gray-300 mb-6">내용</p>
    <div className="flex gap-2 justify-end">
      <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg">
        취소
      </button>
      <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg">
        확인
      </button>
    </div>
  </div>
</div>
```

---

## 💡 컴포넌트 사용 가이드

### ✅ Do

```tsx
// 일관된 스타일 적용
<button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg">
  버튼
</button>

// 접근성 속성 포함
<button aria-label="삭제" title="삭제">
  ✕
</button>

// 반응형 고려
<div className="p-3 sm:p-4">
  {/* 컨텐츠 */}
</div>
```

### ❌ Don't

```tsx
// 인라인 스타일 사용
<button style={{ backgroundColor: '#3b82f6' }}>
  버튼
</button>

// 접근성 무시
<div onClick={handleClick}>클릭 가능한 div</div>

// 터치 타겟 크기 무시
<button className="p-1">작은 버튼</button>
```

---

## 🧪 컴포넌트 상태 변형

### 버튼 상태

| 상태 | 스타일 |
|------|--------|
| 기본 | `bg-blue-600` |
| 호버 | `hover:bg-blue-700` |
| 포커스 | `focus:ring-2 focus:ring-blue-500` |
| 액티브 | `active:bg-blue-800` |
| 비활성화 | `disabled:opacity-50 disabled:cursor-not-allowed` |

### 입력 필드 상태

| 상태 | 스타일 |
|------|--------|
| 기본 | `border-gray-700` |
| 포커스 | `focus:ring-2 focus:ring-blue-500` |
| 에러 | `border-red-500 focus:ring-red-500` |
| 성공 | `border-green-500 focus:ring-green-500` |

---

**Version**: 1.0.0  
**Last Updated**: 2025-01-XX
