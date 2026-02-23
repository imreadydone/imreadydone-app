import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  Timestamp,
  onSnapshot,
  type QueryConstraint,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Todo } from "@/types/todo";

const COLLECTION = "todos";
const todosRef = collection(db, COLLECTION);

// 생성
export async function createTodo(
  todo: Omit<Todo, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const now = Timestamp.now();
  const docRef = await addDoc(todosRef, {
    ...todo,
    createdAt: now,
    updatedAt: now,
  });
  return docRef.id;
}

// 조회 (단일)
export async function getTodo(id: string): Promise<Todo | null> {
  const docSnap = await getDoc(doc(db, COLLECTION, id));
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as Todo;
}

// 조회 (목록)
export async function getTodos(
  filters?: {
    status?: Todo["status"];
    priority?: Todo["priority"];
    category?: string;
  }
): Promise<Todo[]> {
  const constraints: QueryConstraint[] = [];

  if (filters?.status) constraints.push(where("status", "==", filters.status));
  if (filters?.priority) constraints.push(where("priority", "==", filters.priority));
  if (filters?.category) constraints.push(where("category", "==", filters.category));
  constraints.push(orderBy("createdAt", "desc"));

  const q = query(todosRef, ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Todo));
}

// 실시간 구독
export function subscribeTodos(
  callback: (todos: Todo[]) => void,
  filters?: { status?: Todo["status"] }
): Unsubscribe {
  const constraints: QueryConstraint[] = [];
  if (filters?.status) constraints.push(where("status", "==", filters.status));
  constraints.push(orderBy("createdAt", "desc"));

  const q = query(todosRef, ...constraints);
  return onSnapshot(q, (snapshot) => {
    const todos = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Todo));
    callback(todos);
  });
}

// 수정
export async function updateTodo(
  id: string,
  data: Partial<Omit<Todo, "id" | "createdAt">>
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

// 상태 변경
export async function updateTodoStatus(
  id: string,
  status: Todo["status"]
): Promise<void> {
  const update: Record<string, unknown> = {
    status,
    updatedAt: Timestamp.now(),
  };
  if (status === "done") {
    update.completedAt = Timestamp.now();
  }
  await updateDoc(doc(db, COLLECTION, id), update);
}

// 삭제
export async function deleteTodo(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}

// 서브태스크 업데이트
export async function updateTodoSubtask(
  todoId: string,
  subtaskIndex: number,
  status: "pending" | "done"
): Promise<void> {
  const todoDoc = await getTodo(todoId);
  if (!todoDoc || !todoDoc.subtasks) return;

  const updatedSubtasks = [...todoDoc.subtasks];
  if (subtaskIndex >= 0 && subtaskIndex < updatedSubtasks.length) {
    updatedSubtasks[subtaskIndex] = {
      ...updatedSubtasks[subtaskIndex],
      status,
    };
    await updateTodo(todoId, { subtasks: updatedSubtasks });
  }
}
