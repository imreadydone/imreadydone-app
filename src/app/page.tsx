"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { subscribeTodos, createTodo, updateTodoStatus, deleteTodo, updateTodoSubtask, updateTodoAgent } from "@/lib/firestore";
import { requestNotificationPermission, onForegroundMessage } from "@/lib/fcm";
import { Timestamp } from "firebase/firestore";
import type { Todo } from "@/types/todo";
import { useAuth } from "@/contexts/AuthContext";
import AuthForm from "@/components/AuthForm";
import TodoDetailModal from "@/components/TodoDetailModal";

// ============================================
// 토스트 시스템
// ============================================
type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  removing?: boolean;
}

let toastCounter = 0;

function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast-${toast.type} ${toast.removing ? "removing" : ""}`}
          role="alert"
          aria-live="polite"
        >
          <span className="text-2xl" aria-hidden="true">
            {toast.type === "success" && "✅"}
            {toast.type === "error" && "❌"}
            {toast.type === "info" && "ℹ️"}
            {toast.type === "warning" && "⚠️"}
          </span>
          <span className="flex-1 text-sm font-medium">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-gray-400 hover:text-white transition"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

// ============================================
// 스켈레톤 로딩 컴포넌트
// ============================================
function TodoSkeleton() {
  return (
    <div className="skeleton-card skeleton" role="status" aria-label="로딩 중">
      <span className="sr-only">할 일 로딩 중...</span>
    </div>
  );
}

const PRIORITY_EMOJI: Record<string, string> = {
  urgent: "🔴",
  high: "🟠",
  medium: "🟡",
  low: "🟢",
};

const STATUS_EMOJI: Record<string, string> = {
  pending: "⬜",
  "in-progress": "🔄",
  done: "✅",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "대기",
  "in-progress": "진행 중",
  done: "완료",
};

const AVAILABLE_AGENTS = [
  "todo-app",
  "todo-listener",
  "airstream-hub",
  "airstream-master-front",
  "airstream-lessor-front",
  "trucker-hub",
  "trucker-master",
  "trucker-office",
] as const;

type ViewMode = "list" | "kanban";
type SortMode = "createdAt" | "priority" | "dueDate";

// D-day 계산 함수
function getDdayText(dueDate: Timestamp): { text: string; isOverdue: boolean; isDueSoon: boolean } {
  const now = new Date();
  const due = dueDate.toDate();
  
  // 시간 무시하고 날짜만 비교
  const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dueOnlyDate = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  
  const diffTime = dueOnlyDate.getTime() - nowDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return { text: `기한 초과 (D+${Math.abs(diffDays)})`, isOverdue: true, isDueSoon: false };
  } else if (diffDays === 0) {
    return { text: "오늘 마감", isOverdue: false, isDueSoon: true };
  } else if (diffDays === 1) {
    return { text: "내일 마감", isOverdue: false, isDueSoon: true };
  } else if (diffDays <= 3) {
    return { text: `D-${diffDays}`, isOverdue: false, isDueSoon: true };
  } else {
    return { text: `D-${diffDays}`, isOverdue: false, isDueSoon: false };
  }
}

export default function Home() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Todo["priority"]>("medium");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [showDescriptionInput, setShowDescriptionInput] = useState(false);
  const [expandedTodoId, setExpandedTodoId] = useState<string | null>(null);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  
  // 검색/필터/정렬 상태
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriorities, setSelectedPriorities] = useState<Todo["priority"][]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<Todo["status"][]>([]);
  const [sortMode, setSortMode] = useState<SortMode>("createdAt");
  
  // 모바일 필터 토글 상태
  const [showFilters, setShowFilters] = useState(false);
  
  // 애니메이션 및 드래그앤드롭 상태
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [justAddedId, setJustAddedId] = useState<string | null>(null);
  const [draggedTodo, setDraggedTodo] = useState<Todo | null>(null);
  
  // 토스트 상태
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  // 키보드 단축키용 refs
  const searchInputRef = useRef<HTMLInputElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // ============================================
  // 토스트 관리
  // ============================================
  const showToast = useCallback((type: ToastType, message: string) => {
    const id = `toast-${++toastCounter}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    
    setTimeout(() => {
      setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, removing: true } : t)));
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 200);
    }, 3000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, removing: true } : t)));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 200);
  }, []);

  // ============================================
  // 키보드 단축키
  // ============================================
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K: 검색에 포커스
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
        showToast("info", "검색 모드");
      }
      
      // Cmd/Ctrl + N: 새 할 일 입력에 포커스
      if ((e.metaKey || e.ctrlKey) && e.key === "n") {
        e.preventDefault();
        titleInputRef.current?.focus();
        showToast("info", "새 할 일 추가");
      }
      
      // Cmd/Ctrl + L: 리스트 뷰
      if ((e.metaKey || e.ctrlKey) && e.key === "l") {
        e.preventDefault();
        handleViewModeChange("list");
        showToast("info", "리스트 보기");
      }
      
      // Cmd/Ctrl + B: 칸반 뷰
      if ((e.metaKey || e.ctrlKey) && e.key === "b") {
        e.preventDefault();
        handleViewModeChange("kanban");
        showToast("info", "칸반 보기");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showToast]);

  // localStorage에서 뷰 모드 로드
  useEffect(() => {
    const saved = localStorage.getItem("todo-view-mode");
    if (saved === "list" || saved === "kanban") {
      setViewMode(saved);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    
    const unsubscribe = subscribeTodos(user.uid, (updatedTodos) => {
      setTodos(updatedTodos);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  // 카테고리 목록 추출 (중복 제거)
  const allCategories = Array.from(new Set(todos.map(t => t.category).filter(Boolean))) as string[];

  // 검색/필터/정렬 적용
  const getFilteredAndSortedTodos = (todoList: Todo[]) => {
    let filtered = [...todoList];

    // 검색 필터
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (todo) =>
          todo.title.toLowerCase().includes(query) ||
          (todo.description && todo.description.toLowerCase().includes(query))
      );
    }

    // 우선순위 필터
    if (selectedPriorities.length > 0) {
      filtered = filtered.filter((todo) => selectedPriorities.includes(todo.priority));
    }

    // 카테고리 필터
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((todo) => todo.category && selectedCategories.includes(todo.category));
    }

    // 상태 필터
    if (selectedStatuses.length > 0) {
      filtered = filtered.filter((todo) => selectedStatuses.includes(todo.status));
    }

    // 정렬
    filtered.sort((a, b) => {
      switch (sortMode) {
        case "priority": {
          const priorityOrder: Record<Todo["priority"], number> = {
            urgent: 0,
            high: 1,
            medium: 2,
            low: 3,
          };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        case "dueDate": {
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate.toMillis() - b.dueDate.toMillis();
        }
        case "createdAt":
        default:
          return b.createdAt.toMillis() - a.createdAt.toMillis();
      }
    });

    return filtered;
  };

  // 부모-자식 그룹핑: 부모 할 일만 추출
  const allParentTodos = todos.filter(t => !t.parentId);
  const parentTodos = getFilteredAndSortedTodos(allParentTodos);
  
  // 각 부모의 서브태스크들을 그룹핑
  const getSubtasks = (parentId: string) => {
    return todos.filter(t => t.parentId === parentId);
  };

  // 알림 권한 상태 확인
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationEnabled(Notification.permission === "granted");
    }

    try {
      onForegroundMessage((payload) => {
        console.log("포그라운드 알림:", payload);
        if (payload.notification) {
          new Notification(payload.notification.title || "I Am Ready Done", {
            body: payload.notification.body,
            icon: payload.notification.icon || "/icon-192x192.png",
          });
        }
      });
    } catch (e) {
      console.warn("FCM 포그라운드 리스너 초기화 실패:", e);
    }
  }, []);

  // 뷰 모드 변경 시 localStorage에 저장
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem("todo-view-mode", mode);
  };

  // 필터 토글 함수들
  const togglePriority = (priority: Todo["priority"]) => {
    setSelectedPriorities((prev) =>
      prev.includes(priority) ? prev.filter((p) => p !== priority) : [...prev, priority]
    );
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const toggleStatus = (status: Todo["status"]) => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedPriorities([]);
    setSelectedCategories([]);
    setSelectedStatuses([]);
  };

  const hasActiveFilters = searchQuery || selectedPriorities.length > 0 || selectedCategories.length > 0 || selectedStatuses.length > 0;

  // Auth 로딩 중
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4">
        <div className="spinner-large"></div>
        <p className="text-white text-lg">로딩 중...</p>
      </div>
    );
  }

  // 로그인 안 되어 있으면 로그인 페이지 표시
  if (!user) {
    return <AuthForm />;
  }

  // 알림 권한 요청 핸들러
  const handleEnableNotifications = async () => {
    if (!user) return;
    
    setNotificationLoading(true);
    try {
      const token = await requestNotificationPermission(user.uid);
      if (token) {
        setNotificationEnabled(true);
        showToast("success", "알림이 활성화되었습니다! 🔔");
      } else {
        showToast("error", "알림 권한이 거부되었습니다.");
      }
    } catch (error) {
      console.error("알림 설정 오류:", error);
      showToast("error", "알림 설정 중 오류가 발생했습니다.");
    } finally {
      setNotificationLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !user) return;

    const todoData: Omit<Todo, "id" | "createdAt" | "updatedAt"> = {
      title: title.trim(),
      description: description.trim() || undefined,
      status: "pending",
      priority,
      createdBy: user.uid,
      source: "app",
    };

    // dueDate가 있으면 추가
    if (dueDate) {
      todoData.dueDate = Timestamp.fromDate(new Date(dueDate));
    }

    try {
      const newTodoId = await createTodo(todoData, user.uid);
      setTitle("");
      setDescription("");
      setDueDate("");
      setShowDescriptionInput(false);
      
      // 새로 추가된 할 일 ID 저장하여 애니메이션 적용
      if (newTodoId) {
        setJustAddedId(newTodoId);
        setTimeout(() => setJustAddedId(null), 500);
        showToast("success", `"${title.trim()}" 추가됨 ✨`);
      }
    } catch (error) {
      console.error("할 일 추가 실패:", error);
      showToast("error", "할 일 추가에 실패했습니다.");
    }
  };

  const handleStatusToggle = async (todo: Todo) => {
    const next: Record<string, Todo["status"]> = {
      pending: "in-progress",
      "in-progress": "done",
      done: "pending",
    };
    
    // 완료 상태로 변경될 때 성공 피드백
    const willBeCompleted = todo.status === "in-progress";
    
    await updateTodoStatus(todo.id, next[todo.status]);
    
    // 완료 애니메이션 효과 (선택적)
    if (willBeCompleted) {
      // 버튼 클릭 시 짧은 성공 효과
      const button = document.querySelector(`[data-todo-id="${todo.id}"]`);
      if (button) {
        button.classList.add("animate-success-pulse");
        setTimeout(() => button.classList.remove("animate-success-pulse"), 500);
      }
    }
  };

  const handleStatusChange = async (todoId: string, newStatus: Todo["status"]) => {
    await updateTodoStatus(todoId, newStatus);
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    
    const todo = todos.find(t => t.id === id);
    
    // 삭제 애니메이션 시작
    setDeletingIds(prev => new Set(prev).add(id));
    
    // 애니메이션 후 실제 삭제
    setTimeout(async () => {
      try {
        await deleteTodo(id, user.uid);
        setDeletingIds(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        if (todo) {
          showToast("info", `"${todo.title}" 삭제됨`);
        }
      } catch (error) {
        console.error("할 일 삭제 실패:", error);
        showToast("error", "삭제에 실패했습니다.");
        setDeletingIds(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    }, 300);
  };

  // 드래그앤드롭 핸들러
  const handleDragStart = (e: React.DragEvent, todo: Todo) => {
    setDraggedTodo(todo);
    e.dataTransfer.effectAllowed = "move";
    // 드래그 중인 요소를 약간 투명하게
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.classList.add("dragging");
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedTodo(null);
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.classList.remove("dragging");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragEnter = (e: React.DragEvent, targetStatus: Todo["status"]) => {
    e.preventDefault();
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.classList.add("drag-over");
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.classList.remove("drag-over");
    }
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: Todo["status"]) => {
    e.preventDefault();
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.classList.remove("drag-over");
    }

    if (draggedTodo && draggedTodo.status !== targetStatus) {
      await handleStatusChange(draggedTodo.id, targetStatus);
    }
    setDraggedTodo(null);
  };

  const handleSubtaskToggle = async (todoId: string, subtaskIndex: number, currentStatus: "pending" | "done") => {
    const newStatus = currentStatus === "done" ? "pending" : "done";
    await updateTodoSubtask(todoId, subtaskIndex, newStatus);
  };

  // 문서 기반 서브태스크 상태 변경 (새 구조)
  const handleDocumentSubtaskToggle = async (subtaskId: string, currentStatus: Todo["status"]) => {
    const newStatus = currentStatus === "done" ? "pending" : "done";
    await updateTodoStatus(subtaskId, newStatus);
  };

  const toggleExpand = (todoId: string) => {
    setExpandedTodoId(expandedTodoId === todoId ? null : todoId);
  };

  // 에이전트 할당
  const handleAgentChange = async (todoId: string, agent: string) => {
    const agentValue = agent === "" ? null : agent;
    await updateTodoAgent(todoId, agentValue);
  };

  // 서브태스크 AI 실행
  const handleRunSubtask = async (subtask: Todo, parentTodo: Todo) => {
    if (!parentTodo.assignedAgent) {
      alert("먼저 부모 할 일에 에이전트를 할당해주세요.");
      return;
    }
    // 서브태스크 상태를 in-progress로 변경
    await updateTodoStatus(subtask.id, "in-progress");
  };

  // 칸반 보드용 필터링 (부모 할 일만, 검색/필터 적용됨)
  const todosByStatus = {
    pending: parentTodos.filter(t => t.status === "pending"),
    "in-progress": parentTodos.filter(t => t.status === "in-progress"),
    done: parentTodos.filter(t => t.status === "done"),
  };

  // TodoCard 컴포넌트
  const TodoCard = ({ todo, showStatusChange = false }: { todo: Todo; showStatusChange?: boolean }) => {
    const isExpanded = expandedTodoId === todo.id;
    const documentSubtasks = getSubtasks(todo.id); // 새 구조: 별도 문서로 된 서브태스크
    const hasDetails = todo.aiAnalysis || todo.subtasks?.length || documentSubtasks.length || todo.tags?.length || todo.assignedAgent || todo.description;

    let ddayInfo = null;
    if (todo.dueDate) {
      ddayInfo = getDdayText(todo.dueDate);
    }

    // 애니메이션 클래스 결정
    const isDeleting = deletingIds.has(todo.id);
    const isJustAdded = justAddedId === todo.id;
    
    const animationClass = isDeleting 
      ? "animate-slide-up" 
      : isJustAdded 
      ? "animate-slide-down" 
      : "";

    return (
      <article
        className={`rounded-lg border transition-smooth ${
          todo.status === "done"
            ? "bg-gray-900 border-gray-800 opacity-60"
            : "bg-gray-800 border-gray-700"
        } ${animationClass} ${showStatusChange ? "draggable" : ""}`}
        aria-label={`할 일: ${todo.title}`}
        draggable={showStatusChange}
        onDragStart={(e) => showStatusChange && handleDragStart(e, todo)}
        onDragEnd={(e) => showStatusChange && handleDragEnd(e)}
      >
        {/* 메인 카드 */}
        <div className="flex items-center gap-2 sm:gap-3 p-3">
          <button
            onClick={() => handleStatusToggle(todo)}
            data-todo-id={todo.id}
            className="text-xl hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded transition min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
            aria-label={`상태 변경: ${STATUS_LABELS[todo.status]}`}
            title={`상태: ${STATUS_LABELS[todo.status]}`}
          >
            {STATUS_EMOJI[todo.status]}
          </button>
          <span className="text-sm" aria-label={`우선순위: ${todo.priority}`}>{PRIORITY_EMOJI[todo.priority]}</span>
          
          <div className="flex-1 min-w-0 flex items-center gap-2">
            <button
              onClick={() => toggleExpand(todo.id)}
              className={`flex-1 text-left min-h-[44px] sm:min-h-0 flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 -mx-2 ${
                todo.status === "done" ? "line-through text-gray-500" : ""
              }`}
              aria-expanded={isExpanded}
              aria-controls={`todo-details-${todo.id}`}
              title="접기/펼치기"
            >
              <div className="w-full">
                <div className="flex items-center gap-2">
                  <span>{todo.title}</span>
                  {hasDetails && (
                    <span className="text-xs text-gray-500" aria-hidden="true">
                      {isExpanded ? "▼" : "▶"}
                    </span>
                  )}
                </div>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {/* D-day 표시 */}
                {ddayInfo && (
                  <span 
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      ddayInfo.isOverdue 
                        ? "bg-red-900/50 text-red-300 border border-red-700"
                        : ddayInfo.isDueSoon
                        ? "bg-orange-900/50 text-orange-300 border border-orange-700"
                        : "bg-blue-900/50 text-blue-300 border border-blue-700"
                    }`}
                    aria-label={`마감: ${ddayInfo.text}`}
                  >
                    📅 {ddayInfo.text}
                  </span>
                )}
                {/* 서브태스크 수 표시 */}
                {documentSubtasks.length > 0 && (
                  <span 
                    className="text-xs px-2 py-0.5 rounded-full font-medium bg-purple-900/50 text-purple-300 border border-purple-700"
                    aria-label={`하위 작업: ${documentSubtasks.filter(s => s.status === "done").length}개 완료, 총 ${documentSubtasks.length}개`}
                  >
                    📎 {documentSubtasks.filter(s => s.status === "done").length}/{documentSubtasks.length} 하위 작업
                  </span>
                )}
              </div>
            </div>
          </button>
          
          {/* 상세보기 버튼 */}
          <button
            onClick={() => setSelectedTodo(todo)}
            className="text-gray-400 hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded transition min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
            aria-label={`${todo.title} 상세보기`}
            title="상세보기"
          >
            🔍
          </button>
        </div>

          {todo.category && (
            <span className="hidden sm:inline text-xs px-2 py-0.5 bg-gray-700 rounded-full text-gray-400">
              {todo.category}
            </span>
          )}

          {/* 칸반 보드에서 상태 변경 버튼 */}
          {showStatusChange && (
            <div className="flex gap-1" role="group" aria-label="상태 변경">
              {/* 대기(pending): → 만 (진행 중으로만 이동 가능) */}
              {todo.status === "pending" && (
                <button
                  onClick={() => handleStatusChange(todo.id, "in-progress")}
                  className="text-xs px-3 py-2 sm:px-2 sm:py-1 bg-blue-700 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded transition min-h-[44px] sm:min-h-0"
                  aria-label="진행 중으로 이동"
                  title="진행 중으로 이동"
                >
                  →
                </button>
              )}
              
              {/* 진행 중(in-progress): ← → (대기로 되돌리기 or 완료로) */}
              {todo.status === "in-progress" && (
                <>
                  <button
                    onClick={() => handleStatusChange(todo.id, "pending")}
                    className="text-xs px-3 py-2 sm:px-2 sm:py-1 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 rounded transition min-h-[44px] sm:min-h-0"
                    aria-label="대기로 이동"
                    title="대기로 이동"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => handleStatusChange(todo.id, "done")}
                    className="text-xs px-3 py-2 sm:px-2 sm:py-1 bg-green-700 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 rounded transition min-h-[44px] sm:min-h-0"
                    aria-label="완료로 이동"
                    title="완료로 이동"
                  >
                    →
                  </button>
                </>
              )}
              
              {/* 완료(done): ← 만 (진행 중으로 되돌리기) */}
              {todo.status === "done" && (
                <button
                  onClick={() => handleStatusChange(todo.id, "in-progress")}
                  className="text-xs px-3 py-2 sm:px-2 sm:py-1 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 rounded transition min-h-[44px] sm:min-h-0"
                  aria-label="진행 중으로 이동"
                  title="진행 중으로 이동"
                >
                  ←
                </button>
              )}
            </div>
          )}

          <button
            onClick={() => handleDelete(todo.id)}
            className="text-gray-600 hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 rounded transition min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
            aria-label={`${todo.title} 삭제`}
            title="삭제"
          >
            ✕
          </button>
        </div>

        {/* 상세 정보 (아코디언) */}
        {isExpanded && hasDetails && (
          <div 
            id={`todo-details-${todo.id}`}
            className="px-3 pb-3 pt-1 space-y-3 border-t border-gray-700"
            role="region"
            aria-label={`${todo.title} 상세 정보`}
          >
            {/* 설명 */}
            {todo.description && (
              <div>
                <p className="text-xs font-semibold text-gray-400 mb-1">📝 설명</p>
                <p className="text-sm text-gray-300">{todo.description}</p>
              </div>
            )}

            {/* AI 분석 */}
            {!todo.aiAnalysis ? (
              <div className="flex items-center gap-2 text-sm text-blue-400">
                <span className="animate-pulse">🤖 AI 분석 중...</span>
              </div>
            ) : (
              <div>
                <p className="text-xs font-semibold text-gray-400 mb-1">🤖 AI 분석</p>
                <p className="text-sm text-gray-300">{todo.aiAnalysis}</p>
              </div>
            )}

            {/* 서브태스크 (레거시 - 배열 형태) */}
            {todo.subtasks && todo.subtasks.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-400 mb-2">📋 서브태스크</p>
                <ul className="space-y-2">
                  {todo.subtasks.map((subtask, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <input
                        id={`subtask-${todo.id}-${index}`}
                        type="checkbox"
                        checked={subtask.status === "done"}
                        onChange={() => handleSubtaskToggle(todo.id, index, subtask.status)}
                        className="w-5 h-5 sm:w-4 sm:h-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                        aria-label={`${subtask.title} ${subtask.status === "done" ? "완료됨" : "미완료"}`}
                      />
                      <label
                        htmlFor={`subtask-${todo.id}-${index}`}
                        className={`text-sm cursor-pointer ${
                          subtask.status === "done" ? "line-through text-gray-500" : "text-gray-300"
                        }`}
                      >
                        {subtask.title}
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 서브태스크 (새 구조 - 별도 문서) */}
            {documentSubtasks.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-gray-400 mb-2">📋 AI 분석 서브태스크</h3>
                <ul className="space-y-2">
                  {documentSubtasks.map((subtask) => (
                    <li key={subtask.id} className="pl-2 border-l-2 border-purple-700">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <input
                            id={`doc-subtask-${subtask.id}`}
                            type="checkbox"
                            checked={subtask.status === "done"}
                            onChange={() => handleDocumentSubtaskToggle(subtask.id, subtask.status)}
                            className="w-5 h-5 sm:w-4 sm:h-4 flex-shrink-0 rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                            aria-label={`${subtask.title} ${subtask.status === "done" ? "완료됨" : "미완료"}`}
                          />
                          <label
                            htmlFor={`doc-subtask-${subtask.id}`}
                            className={`text-sm flex-1 cursor-pointer min-w-0 break-words ${
                              subtask.status === "done" ? "line-through text-gray-500" : "text-gray-300"
                            }`}
                          >
                            {subtask.title}
                          </label>
                          <span className="text-xs text-purple-400 flex-shrink-0" aria-label={`우선순위: ${subtask.priority}`}>
                            {PRIORITY_EMOJI[subtask.priority]}
                          </span>
                        </div>
                        {/* AI 실행 버튼 */}
                        <button
                          onClick={() => handleRunSubtask(subtask, todo)}
                          disabled={subtask.status === "in-progress" || subtask.status === "done"}
                          className={`text-xs px-3 py-2 sm:px-2 sm:py-1 rounded transition focus:outline-none focus:ring-2 focus:ring-purple-500 flex-shrink-0 min-h-[44px] sm:min-h-0 ${
                            subtask.status === "in-progress"
                              ? "bg-blue-900/50 text-blue-300 cursor-not-allowed"
                              : subtask.status === "done"
                              ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                              : "bg-purple-700 hover:bg-purple-600 text-white"
                          }`}
                          aria-label={
                            !todo.assignedAgent
                              ? "먼저 에이전트를 할당하세요"
                              : subtask.status === "in-progress"
                              ? "AI 실행 중"
                              : subtask.status === "done"
                              ? "완료됨"
                              : "AI 실행"
                          }
                          title={
                            !todo.assignedAgent
                              ? "먼저 에이전트를 할당하세요"
                              : subtask.status === "in-progress"
                              ? "실행 중"
                              : subtask.status === "done"
                              ? "완료됨"
                              : "AI 실행"
                          }
                        >
                          {subtask.status === "in-progress" ? "🔄 실행 중" : "🤖 실행"}
                        </button>
                      </div>
                      
                      {/* AI 실행 결과 표시 */}
                      {subtask.status === "done" && subtask.result && (
                        <div className="mt-2 ml-6 p-3 bg-green-900/20 border border-green-700/30 rounded-lg">
                          <p className="text-xs font-semibold text-green-400 mb-1">✅ 실행 결과</p>
                          <p className="text-sm text-gray-300 whitespace-pre-wrap">{subtask.result}</p>
                          {subtask.completedAt && (
                            <p className="text-xs text-gray-500 mt-1">
                              완료: {new Date(subtask.completedAt.seconds * 1000).toLocaleString('ko-KR')}
                            </p>
                          )}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 태그 */}
            {todo.tags && todo.tags.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-400 mb-2">🏷️ 태그</p>
                <div className="flex flex-wrap gap-1">
                  {todo.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="text-xs px-2 py-1 bg-blue-900/40 border border-blue-700/50 rounded-md text-blue-300"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 에이전트 할당 드롭다운 */}
            <div>
              <label htmlFor={`agent-select-${todo.id}`} className="text-xs font-semibold text-gray-400 mb-1 block">
                👤 할당 에이전트
              </label>
              <select
                id={`agent-select-${todo.id}`}
                value={todo.assignedAgent || ""}
                onChange={(e) => handleAgentChange(todo.id, e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                aria-label="에이전트 선택"
              >
                <option value="">에이전트 선택 안 함</option>
                {AVAILABLE_AGENTS.map((agent) => (
                  <option key={agent} value={agent}>
                    {agent}
                  </option>
                ))}
              </select>
            </div>

            {/* 카테고리 (상세) */}
            {todo.category && (
              <div>
                <p className="text-xs font-semibold text-gray-400 mb-1">📂 카테고리</p>
                <p className="text-sm text-gray-300">{todo.category}</p>
              </div>
            )}
          </div>
        )}
      </article>
    );
  };

  return (
    <main className="min-h-screen text-white relative">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        {/* 헤더 - 반응형 개선 */}
        <header className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold">📋 I Am Ready Done</h1>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* 사용자 정보 */}
              <div className="text-sm text-gray-400 hidden sm:block" aria-label="로그인된 사용자">
                {user?.email}
              </div>

              {/* 뷰 모드 토글 */}
              <div className="flex gap-2 bg-gray-800 rounded-lg p-1" role="group" aria-label="보기 모드 전환">
                <button
                  onClick={() => handleViewModeChange("list")}
                  className={`flex-1 sm:flex-none px-4 py-2 rounded-md font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-950 ${
                    viewMode === "list" 
                      ? "bg-blue-600 text-white" 
                      : "text-gray-400 hover:text-white hover:bg-gray-700"
                  }`}
                  aria-pressed={viewMode === "list"}
                  aria-label="리스트 보기"
                >
                  <span className="hidden sm:inline">📝 리스트</span>
                  <span className="sm:hidden">📝</span>
                </button>
                <button
                  onClick={() => handleViewModeChange("kanban")}
                  className={`flex-1 sm:flex-none px-4 py-2 rounded-md font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-950 ${
                    viewMode === "kanban" 
                      ? "bg-blue-600 text-white" 
                      : "text-gray-400 hover:text-white hover:bg-gray-700"
                  }`}
                  aria-pressed={viewMode === "kanban"}
                  aria-label="칸반 보기"
                >
                  <span className="hidden sm:inline">📊 칸반</span>
                  <span className="sm:hidden">📊</span>
                </button>
              </div>

              {/* 로그아웃 버튼 */}
              <button
                onClick={() => signOut()}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-950 rounded-lg font-medium transition"
                aria-label="로그아웃"
              >
                로그아웃
              </button>
            </div>
          </div>
        </header>

        {/* 알림 설정 */}
        {!notificationEnabled && (
          <section 
            className="mb-6 p-4 bg-blue-900/30 border border-blue-700 rounded-lg"
            aria-labelledby="notification-heading"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 id="notification-heading" className="font-medium">🔔 푸시 알림 활성화</h2>
                <p className="text-sm text-gray-400">할 일 알림을 받으려면 권한을 허용하세요</p>
              </div>
              <button
                onClick={handleEnableNotifications}
                disabled={notificationLoading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-950 rounded-lg font-medium transition flex items-center gap-2"
                aria-label="푸시 알림 활성화"
              >
                {notificationLoading && <div className="spinner"></div>}
                {notificationLoading ? "설정 중..." : "활성화"}
              </button>
            </div>
          </section>
        )}

        {/* 검색/필터/정렬 UI */}
        <section className="mb-6 space-y-3" aria-label="검색 및 필터">
          {/* 검색바 + 정렬 + 필터 토글 */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <label htmlFor="search-input" className="sr-only">할 일 검색</label>
              <input
                ref={searchInputRef}
                id="search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="🔍 제목, 설명으로 검색... (⌘/Ctrl+K)"
                className="w-full px-4 py-2.5 pl-10 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="할 일 검색"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" aria-hidden="true">🔍</span>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1"
                  aria-label="검색어 지우기"
                >
                  ✕
                </button>
              )}
            </div>
            
            <div className="flex gap-2">
              <label htmlFor="sort-select" className="sr-only">정렬 방식</label>
              <select
                id="sort-select"
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as SortMode)}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="정렬 방식 선택"
              >
                <option value="createdAt">📅 최근 생성순</option>
                <option value="priority">⚡ 우선순위순</option>
                <option value="dueDate">⏰ 마감일순</option>
              </select>
              
              {/* 모바일 필터 토글 버튼 */}
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="sm:hidden px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                aria-expanded={showFilters}
                aria-controls="filter-section"
                aria-label="필터 토글"
              >
                {showFilters ? "필터 닫기 ▲" : "필터 열기 ▼"}
                {hasActiveFilters && (
                  <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-600 rounded-full">
                    !
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* 필터 칩들 - 모바일에서 접기 가능 */}
          <div 
            id="filter-section"
            className={`space-y-2 ${showFilters ? 'block' : 'hidden sm:block'}`}
            role="region"
            aria-label="필터 옵션"
          >
            {/* 우선순위 필터 */}
            <div className="flex items-start sm:items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-400 font-medium min-w-[80px]" id="priority-filter-label">우선순위:</span>
              <div className="flex gap-2 flex-wrap" role="group" aria-labelledby="priority-filter-label">
                {(["urgent", "high", "medium", "low"] as Todo["priority"][]).map((priority) => (
                  <button
                    key={priority}
                    type="button"
                    onClick={() => togglePriority(priority)}
                    className={`px-3 py-1.5 sm:py-1 rounded-full text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-950 ${
                      selectedPriorities.includes(priority)
                        ? "bg-blue-600 text-white"
                        : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                    }`}
                    aria-pressed={selectedPriorities.includes(priority)}
                    aria-label={`${priority} 우선순위 필터`}
                  >
                    {PRIORITY_EMOJI[priority]}{" "}
                    <span className="hidden sm:inline">{priority.charAt(0).toUpperCase() + priority.slice(1)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 상태 필터 */}
            <div className="flex items-start sm:items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-400 font-medium min-w-[80px]" id="status-filter-label">상태:</span>
              <div className="flex gap-2 flex-wrap" role="group" aria-labelledby="status-filter-label">
                {(["pending", "in-progress", "done"] as Todo["status"][]).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => toggleStatus(status)}
                    className={`px-3 py-1.5 sm:py-1 rounded-full text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-950 ${
                      selectedStatuses.includes(status)
                        ? "bg-blue-600 text-white"
                        : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                    }`}
                    aria-pressed={selectedStatuses.includes(status)}
                    aria-label={`${STATUS_LABELS[status]} 상태 필터`}
                  >
                    {STATUS_EMOJI[status]} {STATUS_LABELS[status]}
                  </button>
                ))}
              </div>
            </div>

            {/* 카테고리 필터 */}
            {allCategories.length > 0 && (
              <div className="flex items-start sm:items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-400 font-medium min-w-[80px]" id="category-filter-label">카테고리:</span>
                <div className="flex gap-2 flex-wrap" role="group" aria-labelledby="category-filter-label">
                  {allCategories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => toggleCategory(category)}
                      className={`px-3 py-1.5 sm:py-1 rounded-full text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-950 ${
                        selectedCategories.includes(category)
                          ? "bg-blue-600 text-white"
                          : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                      }`}
                      aria-pressed={selectedCategories.includes(category)}
                      aria-label={`${category} 카테고리 필터`}
                    >
                      📂 {category}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 필터 초기화 버튼 */}
            {hasActiveFilters && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="px-3 py-1.5 sm:py-1 bg-red-600/20 hover:bg-red-600/30 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-950 border border-red-600/50 text-red-400 rounded-lg text-sm font-medium transition"
                  aria-label="모든 필터 초기화"
                >
                  ✕ 필터 초기화
                </button>
                <span className="text-xs text-gray-500" aria-live="polite">
                  {parentTodos.length}개의 할 일 표시 중
                </span>
              </div>
            )}
          </div>
        </section>

        {/* 추가 폼 */}
        <section aria-labelledby="add-todo-heading">
          <h2 id="add-todo-heading" className="sr-only">새 할 일 추가</h2>
          <form onSubmit={handleAdd} className="mb-8 space-y-2">
            <div className="flex flex-col sm:flex-row gap-2">
              <label htmlFor="todo-title" className="sr-only">할 일 제목</label>
              <input
                id="todo-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="할 일을 입력하세요..."
                className="flex-1 min-w-0 px-4 py-2.5 sm:py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                aria-required="true"
              />
              <div className="flex gap-2">
                <label htmlFor="todo-priority" className="sr-only">우선순위</label>
                <select
                  id="todo-priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Todo["priority"])}
                  className="flex-1 sm:flex-none px-3 py-2.5 sm:py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-label="우선순위 선택"
                >
                  <option value="low">🟢 Low</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="high">🟠 High</option>
                  <option value="urgent">🔴 Urgent</option>
                </select>
                <label htmlFor="todo-due-date" className="sr-only">마감일</label>
                <input
                  id="todo-due-date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="flex-1 sm:flex-none px-3 py-2.5 sm:py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-label="마감일"
                />
                <button
                  type="submit"
                  className="flex-1 sm:flex-none px-6 py-2.5 sm:py-2 bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-950 rounded-lg font-medium transition min-h-[44px] sm:min-h-0"
                  aria-label="할 일 추가"
                >
                  추가
                </button>
              </div>
            </div>
            
            {/* 설명 입력 토글 */}
            <button
              type="button"
              onClick={() => setShowDescriptionInput(!showDescriptionInput)}
              className="text-sm text-gray-400 hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 transition"
              aria-expanded={showDescriptionInput}
              aria-controls="description-textarea"
            >
              {showDescriptionInput ? "− 설명 숨기기" : "+ 설명 추가"}
            </button>
            
            {showDescriptionInput && (
              <div>
                <label htmlFor="description-textarea" className="sr-only">상세 설명</label>
                <textarea
                  id="description-textarea"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="상세 설명을 입력하세요... (선택사항)"
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  aria-label="상세 설명"
                />
              </div>
            )}
          </form>
        </section>

        {/* 로딩 상태 - 스켈레톤 */}
        {loading ? (
          <div className="space-y-2" role="status" aria-label="할 일 로딩 중">
            <TodoSkeleton />
            <TodoSkeleton />
            <TodoSkeleton />
            <TodoSkeleton />
          </div>
        ) : parentTodos.length === 0 ? (
          <div className="empty-state animate-fade-in">
            <div className="empty-state-icon">📋</div>
            <div className="empty-state-title">할 일이 없습니다</div>
            <p className="empty-state-description">
              위에서 새로운 할 일을 추가하거나{" "}
              <kbd className="kbd">⌘/Ctrl + N</kbd>을 눌러보세요
            </p>
          </div>
        ) : (
          <>
            {/* 리스트 뷰 */}
            {viewMode === "list" && (
              <ul className="space-y-2" role="list" aria-label="할 일 목록">
                {parentTodos.map((todo) => {
                  const subtasks = getSubtasks(todo.id);
                  return (
                    <li key={todo.id} role="listitem">
                      <TodoCard todo={todo} />
                      {/* 서브태스크를 부모 아래에 들여쓰기해서 표시 */}
                      {subtasks.length > 0 && (
                        <ul className="mt-2 ml-4 sm:ml-8 space-y-1" role="list" aria-label={`${todo.title}의 하위 작업`}>
                          {subtasks.map((subtask) => (
                            <li key={subtask.id} className="relative" role="listitem">
                              <div className="absolute left-0 top-0 bottom-0 w-px bg-purple-700" aria-hidden="true" />
                              <div className="absolute left-0 top-1/2 w-4 h-px bg-purple-700" aria-hidden="true" />
                              <div className="ml-4 sm:ml-6">
                                <TodoCard todo={subtask} />
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}

            {/* 칸반 보드 뷰 */}
            {viewMode === "kanban" && (
              <div 
                className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-4"
                role="region"
                aria-label="칸반 보드"
              >
                {/* 대기 컬럼 */}
                <section 
                  className="bg-gray-900 rounded-lg p-3 sm:p-4 border border-gray-800"
                  aria-labelledby="pending-column-heading"
                >
                  <header className="flex items-center justify-between mb-4">
                    <h2 id="pending-column-heading" className="text-base sm:text-lg font-semibold flex items-center gap-2">
                      ⬜ {STATUS_LABELS.pending}
                    </h2>
                    <span 
                      className="text-sm bg-gray-800 px-2 py-1 rounded-full"
                      aria-label={`${todosByStatus.pending.length}개 할 일`}
                    >
                      {todosByStatus.pending.length}
                    </span>
                  </header>
                  <div 
                    className="space-y-2 min-h-[200px] transition-smooth" 
                    role="list"
                    onDragOver={handleDragOver}
                    onDragEnter={(e) => handleDragEnter(e, "pending")}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, "pending")}
                  >
                    {todosByStatus.pending.map((todo) => (
                      <div key={todo.id} role="listitem">
                        <TodoCard todo={todo} showStatusChange={true} />
                      </div>
                    ))}
                    {todosByStatus.pending.length === 0 && (
                      <p className="text-sm text-gray-600 text-center py-8">할 일이 없습니다</p>
                    )}
                  </div>
                </section>

                {/* 진행 중 컬럼 */}
                <section 
                  className="bg-gray-900 rounded-lg p-3 sm:p-4 border border-gray-800"
                  aria-labelledby="in-progress-column-heading"
                >
                  <header className="flex items-center justify-between mb-4">
                    <h2 id="in-progress-column-heading" className="text-base sm:text-lg font-semibold flex items-center gap-2">
                      🔄 {STATUS_LABELS["in-progress"]}
                    </h2>
                    <span 
                      className="text-sm bg-gray-800 px-2 py-1 rounded-full"
                      aria-label={`${todosByStatus["in-progress"].length}개 할 일`}
                    >
                      {todosByStatus["in-progress"].length}
                    </span>
                  </header>
                  <div 
                    className="space-y-2 min-h-[200px] transition-smooth" 
                    role="list"
                    onDragOver={handleDragOver}
                    onDragEnter={(e) => handleDragEnter(e, "in-progress")}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, "in-progress")}
                  >
                    {todosByStatus["in-progress"].map((todo) => (
                      <div key={todo.id} role="listitem">
                        <TodoCard todo={todo} showStatusChange={true} />
                      </div>
                    ))}
                    {todosByStatus["in-progress"].length === 0 && (
                      <p className="text-sm text-gray-600 text-center py-8">진행 중인 일이 없습니다</p>
                    )}
                  </div>
                </section>

                {/* 완료 컬럼 */}
                <section 
                  className="bg-gray-900 rounded-lg p-3 sm:p-4 border border-gray-800"
                  aria-labelledby="done-column-heading"
                >
                  <header className="flex items-center justify-between mb-4">
                    <h2 id="done-column-heading" className="text-base sm:text-lg font-semibold flex items-center gap-2">
                      ✅ {STATUS_LABELS.done}
                    </h2>
                    <span 
                      className="text-sm bg-gray-800 px-2 py-1 rounded-full"
                      aria-label={`${todosByStatus.done.length}개 할 일`}
                    >
                      {todosByStatus.done.length}
                    </span>
                  </header>
                  <div 
                    className="space-y-2 min-h-[200px] transition-smooth" 
                    role="list"
                    onDragOver={handleDragOver}
                    onDragEnter={(e) => handleDragEnter(e, "done")}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, "done")}
                  >
                    {todosByStatus.done.map((todo) => (
                      <div key={todo.id} role="listitem">
                        <TodoCard todo={todo} showStatusChange={true} />
                      </div>
                    ))}
                    {todosByStatus.done.length === 0 && (
                      <p className="text-sm text-gray-600 text-center py-8">완료된 일이 없습니다</p>
                    )}
                  </div>
                </section>
              </div>
            )}
          </>
        )}

        {/* 통계 */}
        {parentTodos.length > 0 && (
          <footer className="mt-6 text-sm text-gray-500 text-center" role="status" aria-live="polite">
            <p>
              총 {parentTodos.length}개 (서브태스크 {todos.length - parentTodos.length}개) | 
              <span aria-label={`대기 ${todosByStatus.pending.length}개`}> ⬜ {todosByStatus.pending.length}</span> | 
              <span aria-label={`진행 중 ${todosByStatus["in-progress"].length}개`}> 🔄 {todosByStatus["in-progress"].length}</span> | 
              <span aria-label={`완료 ${todosByStatus.done.length}개`}> ✅ {todosByStatus.done.length}</span>
            </p>
          </footer>
        )}
      </div>

      {/* 할 일 상세보기 모달 */}
      {selectedTodo && (
        <TodoDetailModal
          todo={selectedTodo}
          documentSubtasks={getSubtasks(selectedTodo.id)}
          onClose={() => setSelectedTodo(null)}
          onStatusChange={handleStatusChange}
          onSubtaskToggle={handleDocumentSubtaskToggle}
          onAgentChange={handleAgentChange}
          onRunSubtask={handleRunSubtask}
          onSubtaskStatusToggle={handleSubtaskToggle}
          availableAgents={AVAILABLE_AGENTS}
        />
      )}
    </main>
  );
}
