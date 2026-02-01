import React, { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { login } from "@/api/authApi";

/**
 * 로그인 모달 컴포넌트
 * 모험단 이름과 비밀번호를 입력받아 로그인합니다.
 * 로그인 성공 시 쿠키로 accessToken, refreshToken이 전달됩니다.
 *
 * @param {function} onLoginSuccess - 로그인 성공 시 콜백
 */
function LoginModal({ onLoginSuccess }) {
  const [adventureName, setAdventureName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!adventureName.trim()) {
      setError("모험단 이름을 입력해주세요.");
      return;
    }

    // 비밀번호는 공백 허용 (초기 비밀번호가 null인 경우)
    setLoading(true);
    setError(null);

    try {
      const result = await login(adventureName.trim(), password || "");

      // 로그인 성공 시 localStorage에 저장 (UI 표시용)
      // 실제 인증은 쿠키의 토큰으로 처리됨
      localStorage.setItem("adventureId", result.id);
      localStorage.setItem("adventureName", result.adventureName);

      // 성공 콜백 호출
      if (onLoginSuccess) {
        onLoginSuccess(result);
      }

      // 모달 닫기 및 입력 초기화
      setOpen(false);
      setAdventureName("");
      setPassword("");
      setError(null);
    } catch (err) {
      // 에러 처리
      setError(err.message || "로그인에 실패했습니다.");
      console.error("로그인 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen) => {
    if (!loading) {
      setOpen(newOpen);
      if (!newOpen) {
        setAdventureName("");
        setPassword("");
        setError(null);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          로그인
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-6">
        <DialogHeader>
          <DialogTitle>로그인</DialogTitle>
          <DialogDescription>
            로그인 정보를 입력해주세요. <br />
            <br />
            처음 이용시 좌측 캐릭터 추가를 하면
            <br />
            로그인 정보가 자동으로 생성됩니다.
            <br />
            초기 비밀번호는 공백이므로
            <br />
            비밀번호 입력 없이 로그인해 주세요
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label
                htmlFor="adventure-name"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                모험단 이름
              </label>
              <input
                id="adventure-name"
                type="text"
                value={adventureName}
                onChange={(e) => {
                  setAdventureName(e.target.value);
                  setError(null);
                }}
                disabled={loading}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="모험단 이름을 입력하세요"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                비밀번호
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                disabled={loading}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="비밀번호 (공백 허용)"
              />
            </div>
            {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <button
                type="button"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                취소
              </button>
            </DialogClose>
            <button
              type="submit"
              disabled={loading || !adventureName.trim()}
              className="px-4 py-2 ml-4 text-sm font-medium text-white bg-gray-800 dark:bg-gray-600 rounded-md hover:bg-gray-700 dark:hover:bg-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "로그인 중..." : "로그인"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default LoginModal;
