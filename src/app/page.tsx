"use client";

import { useEffect, useState } from "react";
import { subscribeTodos, createTodo, updateTodoStatus, deleteTodo } from "@/lib/firestore";
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
  const [priority, setPriority] = useState<Todo["priority"]>("medium");
  const [loading, setLoading] = useState(true);
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);

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
      status: "pending",
      priority,
      createdBy: "user",
      source: "app",
    });
    setTitle("");
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
        <form onSubmit={handleAdd} className="flex gap-2 mb-8">
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
        </form>

        {/* TODO 목록 */}
        {loading ? (
          <p className="text-gray-500 text-center">로딩 중...</p>
        ) : todos.length === 0 ? (
          <p className="text-gray-500 text-center">할 일이 없습니다 🎉</p>
        ) : (
          <ul className="space-y-2">
            {todos.map((todo) => (
              <li
                key={todo.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition ${
                  todo.status === "done"
                    ? "bg-gray-900 border-gray-800 opacity-60"
                    : "bg-gray-800 border-gray-700"
                }`}
              >
                <button
                  onClick={() => handleStatusToggle(todo)}
                  className="text-xl hover:scale-110 transition"
                  title={`상태: ${todo.status}`}
                >
                  {STATUS_EMOJI[todo.status]}
                </button>
                <span className="text-sm">{PRIORITY_EMOJI[todo.priority]}</span>
                <span
                  className={`flex-1 ${
                    todo.status === "done" ? "line-through text-gray-500" : ""
                  }`}
                >
                  {todo.title}
                </span>
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
              </li>
            ))}
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
