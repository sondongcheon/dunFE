import React from "react";
import { useNavigate } from "react-router-dom";
import neopleLogo from "@/Assets/기술표기_가로형_color.png";

function AdminPage() {
  const navigate = useNavigate();

  return (
    <div className="mainbody">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">관리자</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          <button
            type="button"
            onClick={() => navigate("/admin/notice")}
            className="flex flex-col items-center justify-center min-h-[140px] p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all text-left"
          >
            <span className="text-3xl mb-2">📢</span>
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              공지사항 작성
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              새 공지를 등록합니다
            </span>
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/today")}
            className="flex flex-col items-center justify-center min-h-[140px] p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all text-left"
          >
            <span className="text-3xl mb-2">📊</span>
            <span className="text-lg font-semibold text-gray-900 dark:text-white">Today 조회</span>
            <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              오늘의 요약 정보를 확인합니다
            </span>
          </button>
        </div>

        <footer className="text-center py-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            © 2026 DunRoot. 던전앤파이터 유저를 위한 서비스입니다.
          </p>
          <a
            href="http://developers.neople.co.kr"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block"
          >
            <img src={neopleLogo} alt="Neople 오픈 API" className="h-12 mx-auto" />
          </a>
        </footer>
      </div>
    </div>
  );
}

export default AdminPage;
