import React from "react";
import { useNavigate } from "react-router-dom";
import neopleLogo from "@/Assets/기술표기_가로형_color.png";

function AdminPage() {
  const navigate = useNavigate();

  return (
    <div className="mainbody">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-6">관리자</h1>

        <div className="space-y-3 mb-8">
          <button
            type="button"
            onClick={() => navigate("/admin/notice")}
            className="w-full flex items-center gap-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-left"
          >
            <span className="text-2xl">📢</span>
            <div>
              <span className="block font-semibold text-gray-900 dark:text-white">
                공지사항 작성
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">새 공지를 등록합니다</span>
            </div>
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/today")}
            className="w-full flex items-center gap-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-left"
          >
            <span className="text-2xl">📊</span>
            <div>
              <span className="block font-semibold text-gray-900 dark:text-white">Today 조회</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                오늘의 요약 정보를 확인합니다
              </span>
            </div>
          </button>
        </div>

        <footer className="text-center py-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">© 2026 DunRoot</p>
          <a href="http://developers.neople.co.kr" target="_blank" rel="noopener noreferrer">
            <img src={neopleLogo} alt="Neople 오픈 API" className="h-10 mx-auto" />
          </a>
        </footer>
      </div>
    </div>
  );
}

export default AdminPage;
