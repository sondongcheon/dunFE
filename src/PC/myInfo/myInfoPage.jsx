import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import MyInfoContent from "@/myInfo/MyInfoContent";
import MyInfoOtherLookup from "@/myInfo/MyInfoOtherLookup";

function PCMyInfoPage() {
  return (
    <div className="mainbody">
      <main className="w-full min-w-0 space-y-6">
        <h1 className="text-2xl font-bold mt-2">모험단 정보 보기</h1>
        <Routes>
          <Route index element={<Navigate to="/my-info/me" replace />} />
          <Route path="me" element={<MyInfoContent />} />
          <Route path="other" element={<MyInfoOtherLookup />} />
        </Routes>
      </main>
    </div>
  );
}

export default PCMyInfoPage;
