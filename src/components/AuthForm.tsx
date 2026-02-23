"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
    } catch (err: unknown) {
      if (err && typeof err === "object" && "code" in err) {
        const errorCode = err.code as string;
        switch (errorCode) {
          case "auth/invalid-email":
            setError("유효하지 않은 이메일 주소입니다.");
            break;
          case "auth/user-disabled":
            setError("비활성화된 계정입니다.");
            break;
          case "auth/user-not-found":
            setError("존재하지 않는 사용자입니다.");
            break;
          case "auth/wrong-password":
            setError("잘못된 비밀번호입니다.");
            break;
          case "auth/email-already-in-use":
            setError("이미 사용 중인 이메일입니다.");
            break;
          case "auth/weak-password":
            setError("비밀번호는 최소 6자 이상이어야 합니다.");
            break;
          case "auth/invalid-credential":
            setError("이메일 또는 비밀번호가 올바르지 않습니다.");
            break;
          default:
            setError("인증에 실패했습니다. 다시 시도해주세요.");
        }
      } else {
        setError("알 수 없는 오류가 발생했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">
            {isLogin ? "로그인" : "회원가입"}
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            할 일 관리를 시작하세요
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                이메일
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-700 placeholder-gray-500 text-white bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="이메일"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                비밀번호
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isLogin ? "current-password" : "new-password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-700 placeholder-gray-500 text-white bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="비밀번호 (최소 6자)"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-900/20 border border-red-500 px-4 py-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "처리 중..." : isLogin ? "로그인" : "회원가입"}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              {isLogin
                ? "계정이 없으신가요? 회원가입"
                : "이미 계정이 있으신가요? 로그인"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
