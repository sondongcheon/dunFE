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
import { getSafeErrorMessage } from "@/utils/errorMessage";

/**
 * 로그인 모달 컴포넌트
 * 모험단 이름과 비밀번호를 입력받아 로그인합니다.
 * 로그인 성공 시 쿠키로 accessToken, refreshToken이 전달됩니다.
 *
 * @param {function} onLoginSuccess - 로그인 성공 시 콜백
 * @param {boolean} [open] - 제어 모드 시 열림 상태 (모바일 등 외부 트리거용)
 * @param {function} [onOpenChange] - 제어 모드 시 열림 상태 변경 콜백
 */
function LoginModal({ onLoginSuccess, open: controlledOpen, onOpenChange }) {
  const [adventureName, setAdventureName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = controlledOpen !== undefined && typeof onOpenChange === "function";
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? onOpenChange : setInternalOpen;

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

      // 로그인 성공 시 페이지 리로드 (상태/캐시 동기화)
      window.location.reload();
    } catch (err) {
      setError(getSafeErrorMessage(err, "로그인에 실패했습니다."));
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
      {!isControlled && (
        <DialogTrigger asChild>
          <button className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            로그인
          </button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-6">
        <DialogHeader>
          <DialogTitle>로그인</DialogTitle>
          <DialogDescription>
            로그인 정보를 입력해주세요. <br />
            <br />
            처음 이용시 좌측 캐릭터 추가를 하면
            <br />
            로그인 정보가 자동으로 생성됩니다.
            <br /> <br />
            초기 비밀번호는 [1234] 입니다.
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
                className="px-4 py-2 mr-4 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                취소
              </button>
            </DialogClose>
            <button
              type="submit"
              disabled={loading || !adventureName.trim()}
              className="px-4 py-2  text-sm font-medium text-white bg-gray-800 dark:bg-gray-600 rounded-md hover:bg-gray-700 dark:hover:bg-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
