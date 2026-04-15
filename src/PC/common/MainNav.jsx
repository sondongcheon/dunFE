import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toggleDarkMode } from "@/store/settingsSlice";
import LoginModal from "./LoginModal";
import CharacterAddModal from "./CharacterAddModal";
import { CONTENT_IDS, CONTENT_BG_IMAGES } from "@/PC/content/constants";
import { memoUpdateByAdventureName, verifyAuth } from "@/api/authApi";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const NAV_ITEMS = [
  { path: "/", label: "홈" },
  { path: "/content", label: "컨텐츠", hasSubmenu: true },
  { path: "/notice", label: "공지사항" },
  { path: "/comments", label: "유저 코멘트" },
];

function MainNav() {
  const dispatch = useDispatch();
  const darkMode = useSelector((state) => state.settings.darkMode);
  const navigate = useNavigate();
  const location = useLocation();
  const [hoveredNav, setHoveredNav] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adventureName, setAdventureName] = useState("");
  const [showMemoUpdateConfirm, setShowMemoUpdateConfirm] = useState(false);
  const [showMemoUpdateResult, setShowMemoUpdateResult] = useState(false);
  const [memoUpdateResultMessage, setMemoUpdateResultMessage] = useState("");
  const [isMemoUpdating, setIsMemoUpdating] = useState(false);

  // 페이지 로드 시: localStorage 또는 쿠키(토큰) 기준으로 로그인 상태 확인
  useEffect(() => {
    const checkAuth = async () => {
      const savedId = localStorage.getItem("adventureId");
      const savedName = localStorage.getItem("adventureName");

      // 1) localStorage에 있으면 일단 로그인 상태로 표시(낙관적)
      if (savedId && savedName) {
        setIsLoggedIn(true);
        setAdventureName(savedName);
      }

      // 2) 쿠키(토큰) 유효 여부 확인: /me 호출
      try {
        const userInfo = await verifyAuth();
        if (userInfo && userInfo.id && userInfo.adventureName) {
          // 인증 성공: localStorage 동기화 후 로그인 상태 유지
          localStorage.setItem("adventureId", String(userInfo.id));
          localStorage.setItem("adventureName", userInfo.adventureName);
          setIsLoggedIn(true);
          setAdventureName(userInfo.adventureName);
        } else {
          // /me가 401 등으로 실패: localStorage는 지우지 않고 로그인 상태 유지
          // (쿠키가 유효한데 /me만 실패한 경우가 있을 수 있음)
          if (!savedId || !savedName) {
            setIsLoggedIn(false);
            setAdventureName("");
          }
        }
      } catch (error) {
        // 네트워크 오류 등: localStorage가 있으면 로그인 상태 유지
        if (!savedId || !savedName) {
          setIsLoggedIn(false);
          setAdventureName("");
        }
      }
    };

    checkAuth();
  }, []);

  const handleLoginSuccess = (result) => {
    setIsLoggedIn(true);
    setAdventureName(result.adventureName);
  };

  const handleLogout = () => {
    localStorage.removeItem("adventureId");
    localStorage.removeItem("adventureName");
    setIsLoggedIn(false);
    setAdventureName("");
  };

  const handleMemoUpdate = async () => {
    if (!adventureName) return;
    setIsMemoUpdating(true);
    try {
      const response = await memoUpdateByAdventureName(adventureName);
      setMemoUpdateResultMessage(response?.message ?? "최신화가 완료되었습니다.");
      setShowMemoUpdateConfirm(false);
      setShowMemoUpdateResult(true);
    } finally {
      setIsMemoUpdating(false);
    }
  };

  return (
    <div className="fixed top-0 left-0 w-full z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      {/* 첫 번째 줄: 로고 + 버튼들 */}
      <div className="w-[70%] max-w-[1400px] mx-auto px-5">
        <div className="flex items-center justify-between h-16">
          {/* 로고 */}
          <h1
            className="text-2xl font-bold text-gray-800 dark:text-white font-a cursor-pointer"
            onClick={() => navigate("/")}
          >
            DunRoot
          </h1>

          {/* 우측 버튼들 */}
          <div className="flex items-center gap-2">
            <CharacterAddModal />
            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <div className="text-xs text-center text-gray-700 dark:text-gray-300 min-w-[120px] max-w-[180px] truncate">
                  <p>로그인 모험단</p>
                  <span className="text-sm" title={adventureName}>
                    {adventureName}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMemoUpdateConfirm(true)}
                  className="hidden px-2.5 py-1.5 text-sm font-medium text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-600 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors whitespace-nowrap"
                >
                  던담 정보로 캐릭터 / 딜량 메모 최신화 하기
                </button>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors whitespace-nowrap"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <LoginModal onLoginSuccess={handleLoginSuccess} />
            )}
            <button
              onClick={() => dispatch(toggleDarkMode())}
              className="ml-1 p-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
              aria-label="다크모드 전환"
            >
              {darkMode ? "🌞" : "🌙"}
            </button>
          </div>
        </div>
      </div>

      {/* 두 번째 줄: 네비게이션 메뉴 */}
      <div className="w-[70%] max-w-[1400px] mx-auto px-5 border-t border-gray-200 dark:border-gray-700">
        <nav className="relative">
          <ul className="flex items-center gap-8 h-12">
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li
                  key={item.path}
                  className="relative"
                  onMouseEnter={() => setHoveredNav(item.path)}
                  onMouseLeave={() => setHoveredNav(null)}
                >
                  <button
                    onClick={() => navigate(item.path)}
                    className={`px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "text-gray-900 dark:text-white border-b-2 border-gray-900 dark:border-white"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    {item.label}
                  </button>

                  {/* 호버 시 하단 드롭다운 */}
                  {hoveredNav === item.path && (
                    <div
                      className="absolute top-full left-0 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg py-2 z-50"
                      onMouseEnter={() => setHoveredNav(item.path)}
                      onMouseLeave={() => setHoveredNav(null)}
                    >
                      {item.hasSubmenu ? (
                        <nav className="space-y-1">
                          <div className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                            컨텐츠 목록
                          </div>
                          {Object.entries(CONTENT_IDS).map(([key, value]) => (
                            <div
                              key={key}
                              role="button"
                              tabIndex={0}
                              className="flex flex-col min-h-[52px] p-1 border border-gray-200 dark:border-gray-700 rounded-lg mx-2 mb-1 cursor-pointer transition-opacity hover:opacity-90"
                              onClick={() => {
                                navigate(`/content/${key}`);
                                setHoveredNav(null);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  navigate(`/content/${key}`);
                                  setHoveredNav(null);
                                }
                              }}
                            >
                              <div
                                className="flex-1 min-h-0 rounded-lg overflow-hidden w-full relative"
                                style={{
                                  backgroundImage: CONTENT_BG_IMAGES[key]
                                    ? `url(${CONTENT_BG_IMAGES[key]})`
                                    : undefined,
                                  backgroundSize: "cover",
                                  backgroundPosition: "center 15%",
                                }}
                              >
                                <span
                                  className="absolute inset-0 bg-black/50 rounded-lg"
                                  aria-hidden
                                />
                                <span className="relative z-10 flex items-center px-4 py-2 text-base font-medium text-white">
                                  {value}
                                </span>
                              </div>
                            </div>
                          ))}
                        </nav>
                      ) : (
                        <>
                          <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                            {item.label} 메뉴
                          </div>
                          <div
                            className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                            onClick={() => navigate(item.path)}
                          >
                            {item.label} 페이지로 이동
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <Dialog open={showMemoUpdateConfirm} onOpenChange={setShowMemoUpdateConfirm}>
        <DialogContent className="max-w-[420px] rounded-xl gap-4 p-5 dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-gray-900 dark:text-white">
              던담 정보로 최신화 하기
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
            {
              "던담에 등록된 정보를 가져와(모험단 명 검색 기준)\n 캐릭터 추가 및 메모칸을 내 딜량으로 갱신합니다.\n\n갱신은 1시간마다 1번 가능합니다. (던담에 악성 요청 방지)\n\n실행하시겠습니까 ?"
            }
          </p>
          <DialogFooter className="flex gap-2 justify-end sm:justify-end">
            <button
              type="button"
              onClick={() => setShowMemoUpdateConfirm(false)}
              disabled={isMemoUpdating}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleMemoUpdate}
              disabled={isMemoUpdating}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-500 disabled:opacity-50"
            >
              {isMemoUpdating ? "요청 중... (약 10초 소요)" : "실행"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showMemoUpdateResult} onOpenChange={setShowMemoUpdateResult}>
        <DialogContent className="max-w-[420px] rounded-xl gap-4 p-5 dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-gray-900 dark:text-white">
              최신화 결과
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
            {memoUpdateResultMessage}
          </p>
          <DialogFooter className="flex gap-2 justify-end sm:justify-end">
            <button
              type="button"
              onClick={() => setShowMemoUpdateResult(false)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-500"
            >
              확인
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default MainNav;
