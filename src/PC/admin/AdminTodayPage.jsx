import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import neopleLogo from "@/Assets/기술표기_가로형_color.png";

function AdminTodayPage() {
  const navigate = useNavigate();
  const [todayStats] = useState({
    visits: 0,
    newUsers: 0,
    newNotices: 0,
  });

  return (
    <div className="mainbody">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button
            type="button"
            onClick={() => navigate("/admin")}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            ← 관리자
          </button>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Today 조회</h1>

        <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-8">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            오늘의 요약 정보입니다. (API 연동 후 실제 데이터 표시)
          </p>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-3 px-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-400">오늘 방문</span>
              <span className="font-medium text-gray-900 dark:text-white">{todayStats.visits}</span>
            </div>
            <div className="flex justify-between items-center py-3 px-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-400">오늘 가입</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {todayStats.newUsers}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 px-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-400">오늘 등록 공지</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {todayStats.newNotices}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate("/notice")}
            className="mt-4 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            공지사항 목록 보기
          </button>
        </section>

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

export default AdminTodayPage;
