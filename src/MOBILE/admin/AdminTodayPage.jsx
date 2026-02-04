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
      <div className="max-w-4xl mx-auto px-4">
        <button
          type="button"
          onClick={() => navigate("/admin")}
          className="text-sm text-gray-500 dark:text-gray-400 mb-4 block"
        >
          ← 관리자
        </button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Today 조회</h1>

        <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-6">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            오늘의 요약 정보입니다. (API 연동 후 실제 데이터 표시)
          </p>
          <div className="space-y-2">
            <div className="flex justify-between py-2 text-sm">
              <span className="text-gray-500 dark:text-gray-400">오늘 방문</span>
              <span className="font-medium text-gray-900 dark:text-white">{todayStats.visits}</span>
            </div>
            <div className="flex justify-between py-2 text-sm">
              <span className="text-gray-500 dark:text-gray-400">오늘 가입</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {todayStats.newUsers}
              </span>
            </div>
            <div className="flex justify-between py-2 text-sm">
              <span className="text-gray-500 dark:text-gray-400">오늘 등록 공지</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {todayStats.newNotices}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate("/notice")}
            className="mt-3 w-full py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg"
          >
            공지사항 목록
          </button>
        </section>

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

export default AdminTodayPage;
