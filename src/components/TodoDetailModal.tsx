"use client";

import { useEffect } from "react";
import type { Todo } from "@/types/todo";
import { Timestamp } from "firebase/firestore";

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

interface TodoDetailModalProps {
  todo: Todo;
  documentSubtasks: Todo[];
  onClose: () => void;
  onStatusChange: (todoId: string, newStatus: Todo["status"]) => void;
  onSubtaskToggle?: (subtaskId: string, currentStatus: Todo["status"]) => void;
  onAgentChange?: (todoId: string, agent: string) => void;
  onRunSubtask?: (subtask: Todo, parentTodo: Todo) => void;
  onSubtaskStatusToggle?: (todoId: string, subtaskIndex: number, currentStatus: "pending" | "done") => void;
  availableAgents?: readonly string[];
}

export default function TodoDetailModal({
  todo,
  documentSubtasks,
  onClose,
  onStatusChange,
  onSubtaskToggle,
  onAgentChange,
  onRunSubtask,
  onSubtaskStatusToggle,
  availableAgents = [],
}: TodoDetailModalProps) {
  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  // 모달이 열릴 때 body 스크롤 방지
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  let ddayInfo = null;
  if (todo.dueDate) {
    ddayInfo = getDdayText(todo.dueDate);
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className="bg-gray-900 rounded-xl border border-gray-700 shadow-2xl max-w-3xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-4 sm:p-6 flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl" aria-label={`상태: ${STATUS_LABELS[todo.status]}`}>
                {STATUS_EMOJI[todo.status]}
              </span>
              <span className="text-lg" aria-label={`우선순위: ${todo.priority}`}>
                {PRIORITY_EMOJI[todo.priority]}
              </span>
            </div>
            <h2 
              id="modal-title" 
              className={`text-xl sm:text-2xl font-bold ${todo.status === "done" ? "line-through text-gray-500" : "text-white"}`}
            >
              {todo.title}
            </h2>
            
            {/* D-day 표시 */}
            {ddayInfo && (
              <div className="mt-2">
                <span 
                  className={`inline-block text-sm px-3 py-1 rounded-full font-medium ${
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
              </div>
            )}
          </div>
          
          <button
            onClick={onClose}
            className="flex-shrink-0 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-2 transition"
            aria-label="모달 닫기"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 본문 */}
        <div className="p-4 sm:p-6 space-y-6">
          {/* 상태 변경 버튼 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-2">상태 변경</h3>
            {/* 데스크톱: 버튼 그룹 */}
            <div className="hidden sm:flex gap-2 flex-wrap">
              <button
                onClick={() => onStatusChange(todo.id, "pending")}
                className={`px-4 py-2 rounded-lg font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                  todo.status === "pending"
                    ? "bg-gray-700 text-white ring-2 ring-gray-500"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
                }`}
                aria-label="대기 상태로 변경"
                aria-pressed={todo.status === "pending"}
              >
                ⬜ {STATUS_LABELS.pending}
              </button>
              <button
                onClick={() => onStatusChange(todo.id, "in-progress")}
                className={`px-4 py-2 rounded-lg font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                  todo.status === "in-progress"
                    ? "bg-blue-600 text-white ring-2 ring-blue-500"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
                }`}
                aria-label="진행 중 상태로 변경"
                aria-pressed={todo.status === "in-progress"}
              >
                🔄 {STATUS_LABELS["in-progress"]}
              </button>
              <button
                onClick={() => onStatusChange(todo.id, "done")}
                className={`px-4 py-2 rounded-lg font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                  todo.status === "done"
                    ? "bg-green-600 text-white ring-2 ring-green-500"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
                }`}
                aria-label="완료 상태로 변경"
                aria-pressed={todo.status === "done"}
              >
                ✅ {STATUS_LABELS.done}
              </button>
            </div>
            {/* 모바일: 드롭다운 */}
            <select
              value={todo.status}
              onChange={(e) => onStatusChange(todo.id, e.target.value as Todo["status"])}
              className="sm:hidden w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
              aria-label="상태 선택"
            >
              <option value="pending">⬜ {STATUS_LABELS.pending}</option>
              <option value="in-progress">🔄 {STATUS_LABELS["in-progress"]}</option>
              <option value="done">✅ {STATUS_LABELS.done}</option>
            </select>
          </div>

          {/* 설명 */}
          {todo.description && (
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-2">📝 설명</h3>
              <p className="text-gray-300 whitespace-pre-wrap">{todo.description}</p>
            </div>
          )}

          {/* AI 분석 */}
          {!todo.aiAnalysis ? (
            <div className="flex items-center gap-2 text-blue-400">
              <span className="animate-pulse">🤖 AI 분석 중...</span>
            </div>
          ) : (
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-2">🤖 AI 분석</h3>
              <p className="text-gray-300 whitespace-pre-wrap">{todo.aiAnalysis}</p>
            </div>
          )}

          {/* 서브태스크 (레거시 - 배열 형태) */}
          {todo.subtasks && todo.subtasks.length > 0 && onSubtaskStatusToggle && (
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-3">📋 서브태스크</h3>
              <ul className="space-y-2">
                {todo.subtasks.map((subtask, index) => (
                  <li key={index} className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                    <input
                      id={`modal-subtask-${todo.id}-${index}`}
                      type="checkbox"
                      checked={subtask.status === "done"}
                      onChange={() => onSubtaskStatusToggle(todo.id, index, subtask.status)}
                      className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                      aria-label={`${subtask.title} ${subtask.status === "done" ? "완료됨" : "미완료"}`}
                    />
                    <label
                      htmlFor={`modal-subtask-${todo.id}-${index}`}
                      className={`flex-1 cursor-pointer ${
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
          {documentSubtasks.length > 0 && onSubtaskToggle && onRunSubtask && (
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-3">📋 AI 분석 서브태스크</h3>
              <ul className="space-y-3">
                {documentSubtasks.map((subtask) => (
                  <li key={subtask.id} className="p-4 bg-gray-800 border border-purple-700/30 rounded-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <input
                          id={`modal-doc-subtask-${subtask.id}`}
                          type="checkbox"
                          checked={subtask.status === "done"}
                          onChange={() => onSubtaskToggle(subtask.id, subtask.status)}
                          className="w-5 h-5 flex-shrink-0 rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                          aria-label={`${subtask.title} ${subtask.status === "done" ? "완료됨" : "미완료"}`}
                        />
                        <label
                          htmlFor={`modal-doc-subtask-${subtask.id}`}
                          className={`flex-1 cursor-pointer min-w-0 break-words ${
                            subtask.status === "done" ? "line-through text-gray-500" : "text-gray-300"
                          }`}
                        >
                          {subtask.title}
                        </label>
                        <span className="text-sm text-purple-400 flex-shrink-0" aria-label={`우선순위: ${subtask.priority}`}>
                          {PRIORITY_EMOJI[subtask.priority]}
                        </span>
                      </div>
                      {/* AI 실행 버튼 */}
                      <button
                        onClick={() => onRunSubtask(subtask, todo)}
                        disabled={subtask.status === "in-progress" || subtask.status === "done"}
                        className={`px-4 py-2 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-purple-500 flex-shrink-0 ${
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
                      >
                        {subtask.status === "in-progress" ? "🔄 실행 중" : "🤖 실행"}
                      </button>
                    </div>
                    
                    {/* AI 실행 결과 표시 */}
                    {subtask.status === "done" && subtask.result && (
                      <div className="mt-3 p-3 bg-green-900/20 border border-green-700/30 rounded-lg">
                        <p className="text-xs font-semibold text-green-400 mb-1">✅ 실행 결과</p>
                        <p className="text-sm text-gray-300 whitespace-pre-wrap">{subtask.result}</p>
                        {subtask.completedAt && (
                          <p className="text-xs text-gray-500 mt-2">
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
              <h3 className="text-sm font-semibold text-gray-400 mb-2">🏷️ 태그</h3>
              <div className="flex flex-wrap gap-2">
                {todo.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="text-sm px-3 py-1 bg-blue-900/40 border border-blue-700/50 rounded-full text-blue-300"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 에이전트 할당 */}
          {onAgentChange && availableAgents.length > 0 && (
            <div>
              <label htmlFor="modal-agent-select" className="text-sm font-semibold text-gray-400 mb-2 block">
                👤 할당 에이전트
              </label>
              <select
                id="modal-agent-select"
                value={todo.assignedAgent || ""}
                onChange={(e) => onAgentChange(todo.id, e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                aria-label="에이전트 선택"
              >
                <option value="">에이전트 선택 안 함</option>
                {availableAgents.map((agent) => (
                  <option key={agent} value={agent}>
                    {agent}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 카테고리 */}
          {todo.category && (
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-2">📂 카테고리</h3>
              <p className="text-gray-300">{todo.category}</p>
            </div>
          )}

          {/* 메타 정보 */}
          <div className="text-xs text-gray-500 space-y-1">
            <p>생성일: {new Date(todo.createdAt.seconds * 1000).toLocaleString('ko-KR')}</p>
            <p>수정일: {new Date(todo.updatedAt.seconds * 1000).toLocaleString('ko-KR')}</p>
            {todo.dueDate && (
              <p>마감일: {new Date(todo.dueDate.seconds * 1000).toLocaleDateString('ko-KR')}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
