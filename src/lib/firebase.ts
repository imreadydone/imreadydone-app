import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC42xH_I1Kdzaj1LrvBT2xDmVpXF8htsRU",
  authDomain: "iamreadydone.firebaseapp.com",
  projectId: "iamreadydone",
  storageBucket: "iamreadydone.firebasestorage.app",
  messagingSenderId: "133226116072",
  appId: "1:133226116072:web:3dc6bc86841854538c2a5d",
};

// 중복 초기화 방지
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
