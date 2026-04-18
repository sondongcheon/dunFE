import React from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import MyInfoContent from "@/myInfo/MyInfoContent";
import MyInfoOtherLookup from "@/myInfo/MyInfoOtherLookup";

function MobileMyInfoPage() {
  const navigate = useNavigate();

  return (
    <div className="mainMobileBody pb-20">
      <header
        className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="flex items-center h-12 px-2 max-w-[480px] mx-auto gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-600 dark:text-gray-400 touch-manipulation text-2xl"
            aria-label="뒤로"
          >
            ‹
          </button>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate flex-1">
            모험단 정보 보기
          </h1>
        </div>
      </header>

      <main className="pt-4 px-2 max-w-[480px] mx-auto space-y-4">
        <Routes>
          <Route index element={<Navigate to="/my-info/me" replace />} />
          <Route path="me" element={<MyInfoContent />} />
          <Route path="other" element={<MyInfoOtherLookup />} />
        </Routes>
      </main>
    </div>
  );
}

export default MobileMyInfoPage;
