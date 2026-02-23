"use client";

import { useEffect, useState } from "react";
import { subscribeTodos, createTodo, updateTodoStatus, deleteTodo, updateTodoSubtask } from "@/lib/firestore";
import { requestNotificationPermission, onForegroundMessage } from "@/lib/fcm";
import type { Todo } from "@/types/todo";

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

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Todo["priority"]>("medium");
  const [loading, setLoading] = useState(true);
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [showDescriptionInput, setShowDescriptionInput] = useState(false);
  const [expandedTodoId, setExpandedTodoId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeTodos((updatedTodos) => {
      setTodos(updatedTodos);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 알림 권한 상태 확인
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationEnabled(Notification.permission === "granted");
    }

    // 포그라운드 메시지 수신 리스너
    onForegroundMessage((payload) => {
      console.log("포그라운드 알림:", payload);
      // 알림 표시 (선택적)
      if (payload.notification) {
        new Notification(payload.notification.title || "I Am Ready Done", {
          body: payload.notification.body,
          icon: payload.notification.icon || "/icon-192x192.png",
        });
      }
    });
  }, []);

  // 알림 권한 요청 핸들러
  const handleEnableNotifications = async () => {
    setNotificationLoading(true);
    try {
      // TODO: 실제 사용자 ID로 교체 필요 (Firebase Auth 연동 시)
      const userId = "default-user";
      const token = await requestNotificationPermission(userId);
      if (token) {
        setNotificationEnabled(true);
        alert("알림이 활성화되었습니다! 🔔");
      } else {
        alert("알림 권한이 거부되었습니다.");
      }
    } catch (error) {
      console.error("알림 설정 오류:", error);
      alert("알림 설정 중 오류가 발생했습니다.");
    } finally {
      setNotificationLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await createTodo({
      title: title.trim(),
      description: description.trim() || undefined,
      status: "pending",
      priority,
      createdBy: "user",
      source: "app",
    });
    setTitle("");
    setDescription("");
    setShowDescriptionInput(false);
  };

  const handleStatusToggle = async (todo: Todo) => {
    const next: Record<string, Todo["status"]> = {
      pending: "in-progress",
      "in-progress": "done",
      done: "pending",
    };
    await updateTodoStatus(todo.id, next[todo.status]);
  };

  const handleDelete = async (id: string) => {
    await deleteTodo(id);
  };

  const handleSubtaskToggle = async (todoId: string, subtaskIndex: number, currentStatus: "pending" | "done") => {
    const newStatus = currentStatus === "done" ? "pending" : "done";
    await updateTodoSubtask(todoId, subtaskIndex, newStatus);
  };

  const toggleExpand = (todoId: string) => {
    setExpandedTodoId(expandedTodoId === todoId ? null : todoId);
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">📋 I Am Ready Done</h1>

        {/* 알림 설정 */}
        {!notificationEnabled && (
          <div className="mb-6 p-4 bg-blue-900/30 border border-blue-700 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">🔔 푸시 알림 활성화</p>
                <p className="text-sm text-gray-400">할 일 알림을 받으려면 권한을 허용하세요</p>
              </div>
              <button
                onClick={handleEnableNotifications}
                disabled={notificationLoading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg font-medium transition"
              >
                {notificationLoading ? "설정 중..." : "활성화"}
              </button>
            </div>
          </div>
        )}

        {/* 추가 폼 */}
        <form onSubmit={handleAdd} className="mb-8 space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="할 일을 입력하세요..."
              className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Todo["priority"])}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg"
            >
              <option value="low">🟢 Low</option>
              <option value="medium">🟡 Medium</option>
              <option value="high">🟠 High</option>
              <option value="urgent">🔴 Urgent</option>
            </select>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition"
            >
              추가
            </button>
          </div>
          
          {/* 설명 입력 토글 */}
          <button
            type="button"
            onClick={() => setShowDescriptionInput(!showDescriptionInput)}
            className="text-sm text-gray-400 hover:text-gray-300 transition"
          >
            {showDescriptionInput ? "− 설명 숨기기" : "+ 설명 추가"}
          </button>
          
          {showDescriptionInput && (
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="상세 설명을 입력하세요... (선택사항)"
              rows={3}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
            />
          )}
        </form>

        {/* TODO 목록 */}
        {loading ? (
          <p className="text-gray-500 text-center">로딩 중...</p>
        ) : todos.length === 0 ? (
          <p className="text-gray-500 text-center">할 일이 없습니다 🎉</p>
        ) : (
          <ul className="space-y-2">
            {todos.map((todo) => {
              const isExpanded = expandedTodoId === todo.id;
              const hasDetails = todo.aiAnalysis || todo.subtasks?.length || todo.tags?.length || todo.assignedAgent || todo.description;

              return (
                <li
                  key={todo.id}
                  className={`rounded-lg border transition ${
                    todo.status === "done"
                      ? "bg-gray-900 border-gray-800 opacity-60"
                      : "bg-gray-800 border-gray-700"
                  }`}
                >
                  {/* 메인 카드 */}
                  <div className="flex items-center gap-3 p-3">
                    <button
                      onClick={() => handleStatusToggle(todo)}
                      className="text-xl hover:scale-110 transition"
                      title={`상태: ${todo.status}`}
                    >
                      {STATUS_EMOJI[todo.status]}
                    </button>
                    <span className="text-sm">{PRIORITY_EMOJI[todo.priority]}</span>
                    
                    <button
                      onClick={() => toggleExpand(todo.id)}
                      className={`flex-1 text-left ${
                        todo.status === "done" ? "line-through text-gray-500" : ""
                      }`}
                    >
                      {todo.title}
                      {hasDetails && (
                        <span className="ml-2 text-xs text-gray-500">
                          {isExpanded ? "▼" : "▶"}
                        </span>
                      )}
                    </button>

                    {todo.category && (
                      <span className="text-xs px-2 py-0.5 bg-gray-700 rounded-full text-gray-400">
                        {todo.category}
                      </span>
                    )}
                    <button
                      onClick={() => handleDelete(todo.id)}
                      className="text-gray-600 hover:text-red-400 transition"
                      title="삭제"
                    >
                      ✕
                    </button>
                  </div>

                  {/* 상세 정보 (아코디언) */}
                  {isExpanded && hasDetails && (
                    <div className="px-3 pb-3 pt-1 space-y-3 border-t border-gray-700">
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

                      {/* 서브태스크 */}
                      {todo.subtasks && todo.subtasks.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-400 mb-2">📋 서브태스크</p>
                          <ul className="space-y-1">
                            {todo.subtasks.map((subtask, index) => (
                              <li key={index} className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={subtask.status === "done"}
                                  onChange={() => handleSubtaskToggle(todo.id, index, subtask.status)}
                                  className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-800"
                                />
                                <span
                                  className={`text-sm ${
                                    subtask.status === "done" ? "line-through text-gray-500" : "text-gray-300"
                                  }`}
                                >
                                  {subtask.title}
                                </span>
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

                      {/* 할당된 에이전트 */}
                      {todo.assignedAgent && (
                        <div>
                          <p className="text-xs font-semibold text-gray-400 mb-1">👤 할당 에이전트</p>
                          <p className="text-sm text-purple-400">{todo.assignedAgent}</p>
                        </div>
                      )}

                      {/* 카테고리 (상세) */}
                      {todo.category && (
                        <div>
                          <p className="text-xs font-semibold text-gray-400 mb-1">📂 카테고리</p>
                          <p className="text-sm text-gray-300">{todo.category}</p>
                        </div>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {/* 통계 */}
        {todos.length > 0 && (
          <div className="mt-6 text-sm text-gray-500 text-center">
            총 {todos.length}개 | ⬜ {todos.filter((t) => t.status === "pending").length} | 🔄{" "}
            {todos.filter((t) => t.status === "in-progress").length} | ✅{" "}
            {todos.filter((t) => t.status === "done").length}
          </div>
        )}
      </div>
    </main>
  );
}
