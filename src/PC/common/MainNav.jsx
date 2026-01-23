import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toggleDarkMode } from "@/store/settingsSlice";

const NAV_ITEMS = [
  { path: "/", label: "홈" },
  { path: "/content", label: "content" },
  { path: "/test2", label: "Test2" },
  { path: "/test3", label: "Test3" },
];

function MainNav() {
  const dispatch = useDispatch();
  const darkMode = useSelector((state) => state.settings.darkMode);
  const navigate = useNavigate();
  const location = useLocation();
  const [hoveredNav, setHoveredNav] = useState(null);

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
            DNF Project
          </h1>

          {/* 우측 버튼들 */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                // 로그인 기능은 추후 구현
                console.log("로그인");
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              로그인
            </button>
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
                      className="absolute top-full left-0 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg pt-1 pb-2 z-50"
                      onMouseEnter={() => setHoveredNav(item.path)}
                      onMouseLeave={() => setHoveredNav(null)}
                    >
                      <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                        {item.label} 메뉴
                      </div>
                      <div 
                        className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                        onClick={() => navigate(item.path)}
                      >
                        {item.label} 페이지로 이동
                      </div>
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
