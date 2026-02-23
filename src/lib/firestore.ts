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
  setDoc,
  type QueryConstraint,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Todo } from "@/types/todo";
import type { User } from "@/types/user";

const COLLECTION = "todos";
const todosRef = collection(db, COLLECTION);

// 생성
export async function createTodo(
  todo: Omit<Todo, "id" | "createdAt" | "updatedAt">,
  userId: string
): Promise<string> {
  const now = Timestamp.now();
  const cleanTodo = Object.fromEntries(
    Object.entries(todo).filter(([, v]) => v !== undefined)
  );
  const docRef = await addDoc(todosRef, {
    ...cleanTodo,
    createdBy: userId,
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
  userId: string,
  filters?: {
    status?: Todo["status"];
    priority?: Todo["priority"];
    category?: string;
  }
): Promise<Todo[]> {
  const constraints: QueryConstraint[] = [where("createdBy", "==", userId)];

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
  userId: string,
  callback: (todos: Todo[]) => void,
  filters?: { status?: Todo["status"] }
): Unsubscribe {
  const constraints: QueryConstraint[] = [where("createdBy", "==", userId)];
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
export async function deleteTodo(id: string, userId: string): Promise<void> {
  // 서브태스크(자식 문서)도 함께 삭제 — createdBy 필터 필수 (보안 규칙)
  const subtasks = await getDocs(
    query(todosRef, where("parentId", "==", id), where("createdBy", "==", userId))
  );
  const deletePromises = subtasks.docs.map((d) => deleteDoc(d.ref));
  deletePromises.push(deleteDoc(doc(db, COLLECTION, id)));
  await Promise.all(deletePromises);
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

// ===== User Profile Functions =====

/**
 * 회원가입 시 사용자 프로필 문서 생성
 * Firestore Security Rules (콘솔에서 수동 적용):
 * match /users/{userId} {
 *   allow read, write: if request.auth != null && request.auth.uid == userId;
 * }
 */
export async function createUserProfile(
  uid: string,
  email: string,
  displayName: string | null = null
): Promise<void> {
  const now = Timestamp.now();
  const userDoc: User = {
    email,
    displayName,
    createdAt: now,
    updatedAt: now,
    settings: {
      notificationsEnabled: false,
      theme: "dark",
    },
  };

  await setDoc(doc(db, "users", uid), userDoc);
}

/**
 * 사용자 프로필 조회
 */
export async function getUserProfile(uid: string): Promise<User | null> {
  const docSnap = await getDoc(doc(db, "users", uid));
  if (!docSnap.exists()) return null;
  return docSnap.data() as User;
}
