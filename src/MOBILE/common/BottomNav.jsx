import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toggleDarkMode } from "@/store/settingsSlice";
import LoginModal from "@/PC/common/LoginModal";
import CharacterAddModal from "@/PC/common/CharacterAddModal";
import { verifyAuth } from "@/api/authApi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const NAV_ITEMS = [
  { path: "/", label: "홈", icon: "🏠" },
  { path: "/content", label: "컨텐츠", icon: "📋" },
];

function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const darkMode = useSelector((state) => state.settings.darkMode);
  const [showMore, setShowMore] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showCharacterAddModal, setShowCharacterAddModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adventureName, setAdventureName] = useState("");

  // 페이지 로드 시 localStorage에서 로그인 정보 확인 및 실제 인증 상태 검증
  useEffect(() => {
    const checkAuth = async () => {
      const savedId = localStorage.getItem("adventureId");
      const savedName = localStorage.getItem("adventureName");

      // localStorage에 정보가 없으면 로그아웃 상태
      if (!savedId || !savedName) {
        setIsLoggedIn(false);
        setAdventureName("");
        return;
      }

      // localStorage에 정보가 있으면 실제 인증 상태 확인
      try {
        const userInfo = await verifyAuth();
        if (userInfo && userInfo.id && userInfo.adventureName) {
          // 인증 성공: localStorage와 서버 정보 동기화
          localStorage.setItem("adventureId", userInfo.id);
          localStorage.setItem("adventureName", userInfo.adventureName);
          setIsLoggedIn(true);
          setAdventureName(userInfo.adventureName);
        } else {
          // 인증 실패: localStorage 정리
          localStorage.removeItem("adventureId");
          localStorage.removeItem("adventureName");
          setIsLoggedIn(false);
          setAdventureName("");
        }
      } catch (error) {
        // 네트워크 오류 등: localStorage 정보는 유지하되, 다음 API 호출 시 재검증
        // 일단 localStorage 정보로 UI 표시 (토큰이 유효할 수도 있음)
        setIsLoggedIn(true);
        setAdventureName(savedName);
      }
    };

    checkAuth();
  }, []);

  const handleLoginSuccess = (result) => {
    setIsLoggedIn(true);
    setAdventureName(result.adventureName ?? "");
    setShowLoginModal(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("adventureId");
    localStorage.removeItem("adventureName");
    setIsLoggedIn(false);
    setAdventureName("");
    setShowLogoutConfirm(false);
  };

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 safe-area-bottom"
        style={{
          paddingBottom: "env(safe-area-inset-bottom)",
          boxShadow: "0 -2px 10px rgba(0,0,0,0.08)",
        }}
      >
        <div className="flex items-center justify-around h-14 max-w-[480px] mx-auto">
          {NAV_ITEMS.map(({ path, label, icon }) => {
            const isActive = location.pathname === path;
            return (
              <button
                key={path}
                type="button"
                onClick={() => navigate(path)}
                className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors active:scale-95 ${
                  isActive
                    ? "text-[#2384bc] dark:text-[#5C8F5A] font-semibold"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                <span className="text-xl leading-none">{icon}</span>
                <span className="text-[10px] font-medium">{label}</span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setShowCharacterAddModal(true)}
            className="flex flex-col items-center justify-center flex-1 h-full gap-0.5 text-gray-500 dark:text-gray-400 transition-colors active:scale-95"
          >
            <span className="text-xl leading-none">➕</span>
            <span className="text-[10px] font-medium">캐릭터 추가</span>
          </button>

          {isLoggedIn ? (
            <button
              type="button"
              onClick={() => setShowLogoutConfirm(true)}
              className="flex flex-col items-center justify-center flex-1 h-full gap-0.5 text-gray-500 dark:text-gray-400 transition-colors active:scale-95"
              title={adventureName}
            >
              <span className="text-xl leading-none">👤</span>
              <span className="text-[10px] font-medium truncate max-w-[3rem]" title={adventureName}>
                {adventureName || "로그아웃"}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowLoginModal(true)}
              className="flex flex-col items-center justify-center flex-1 h-full gap-0.5 text-gray-500 dark:text-gray-400 transition-colors active:scale-95"
            >
              <span className="text-xl leading-none">👤</span>
              <span className="text-[10px] font-medium">로그인</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowMore(!showMore)}
            className="flex flex-col items-center justify-center flex-1 h-full gap-0.5 text-gray-500 dark:text-gray-400 transition-colors active:scale-95"
          >
            <span className="text-xl leading-none">⚙️</span>
            <span className="text-[10px] font-medium">더보기</span>
          </button>
        </div>
      </nav>

      <LoginModal
        open={showLoginModal}
        onOpenChange={setShowLoginModal}
        onLoginSuccess={handleLoginSuccess}
      />

      <CharacterAddModal
        open={showCharacterAddModal}
        onOpenChange={setShowCharacterAddModal}
        showTrigger={false}
      />

      <Dialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <DialogContent className="max-w-[280px] rounded-xl gap-4 p-5 dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-gray-900 dark:text-white">
              로그아웃
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 dark:text-gray-400">정말 로그아웃 하시겠습니까?</p>
          <DialogFooter className="flex gap-2 justify-end sm:justify-end">
            <button
              type="button"
              onClick={() => setShowLogoutConfirm(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-500"
            >
              로그아웃
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 더보기 팝오버 */}
      {showMore && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMore(false)}
            aria-hidden="true"
          />
          <div
            className="fixed bottom-[calc(3.5rem+env(safe-area-inset-bottom))] left-4 right-4 max-w-[480px] mx-auto z-50 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
            role="dialog"
            aria-label="더보기 메뉴"
          >
            <div className="p-4 space-y-2">
              <button
                type="button"
                onClick={() => {
                  navigate("/notice");
                  setShowMore(false);
                }}
                className="w-full flex items-center justify-between py-3 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg px-3 -mx-1"
              >
                <span>공지 사항</span>
                <span aria-hidden>📢</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  navigate("/comments");
                  setShowMore(false);
                }}
                className="w-full flex items-center justify-between py-3 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg px-3 -mx-1"
              >
                <span>유저 코멘트</span>
                <span aria-hidden>💬</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  dispatch(toggleDarkMode());
                  setShowMore(false);
                }}
                className="w-full flex items-center justify-between py-3 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg px-3 -mx-1"
              >
                <span>테마</span>
                <span>{darkMode ? "🌞 라이트" : "🌙 다크"}</span>
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default BottomNav;
