import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toggleDarkMode } from "@/store/settingsSlice";
import LoginModal from "./LoginModal";
import CharacterAddModal from "./CharacterAddModal";
import { CONTENT_IDS, CONTENT_BG_IMAGES } from "@/PC/content/constants";
import { verifyAuth } from "@/api/authApi";

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
    setAdventureName(result.adventureName);
  };

  const handleLogout = () => {
    localStorage.removeItem("adventureId");
    localStorage.removeItem("adventureName");
    setIsLoggedIn(false);
    setAdventureName("");
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
          <div className="flex items-center gap-4">
            <CharacterAddModal />
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-700 dark:text-gray-300">{adventureName}</span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <LoginModal onLoginSuccess={handleLoginSuccess} />
            )}
            <button
              onClick={() => dispatch(toggleDarkMode())}
              className="p-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
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
    </div>
  );
}

export default MainNav;
