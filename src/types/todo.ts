import { Timestamp } from "firebase/firestore";

export interface Subtask {
  title: string;
  status: "pending" | "done";
}

export interface Todo {
  id: string;
  title: string;
  description?: string;
  status: "pending" | "in-progress" | "done";
  priority: "low" | "medium" | "high" | "urgent";
  category?: string;
  tags?: string[];
  dueDate?: Timestamp;
  assignedAgent?: string;
  subtasks?: Subtask[];
  aiAnalysis?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  completedAt?: Timestamp;
  createdBy: string;
  source: string;
}
