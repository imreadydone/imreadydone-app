import { Timestamp } from "firebase/firestore";

export interface UserSettings {
  notificationsEnabled: boolean;
  theme: "dark" | "light";
}

export interface User {
  email: string;
  displayName: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  settings: UserSettings;
}
