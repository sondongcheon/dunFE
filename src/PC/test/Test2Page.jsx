import React, { useState } from "react";

// 샘플 공지사항 데이터
const NOTICES = [
  {
    id: 1,
    title: "DunRoot 서비스 오픈 안내",
    content: "안녕하세요. DunRoot 서비스가 정식 오픈되었습니다.\n\n던전앤파이터 유저들을 위한 파티/그룹 관리 서비스를 이용해 주세요.\n\n감사합니다.",
    date: "2026-02-01",
    important: true,
  },
];

function Test2Page() {
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="mainbody">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">공지사항</h1>
        
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          {/* 헤더 */}
          <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300">
            <div className="col-span-1 text-center">번호</div>
            <div className="col-span-8">제목</div>
            <div className="col-span-3 text-center">작성일</div>
          </div>

          {/* 공지사항 목록 */}
          {NOTICES.map((notice) => (
            <div key={notice.id}>
              {/* 목록 행 */}
              <div
                className={`grid grid-cols-12 gap-2 px-4 py-3 border-b border-gray-100 dark:border-gray-700 cursor-pointer transition-colors ${
                  expandedId === notice.id
                    ? "bg-blue-50 dark:bg-blue-900/20"
                    : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                }`}
                onClick={() => toggleExpand(notice.id)}
              >
                <div className="col-span-1 text-center text-sm text-gray-500 dark:text-gray-400">
                  {notice.id}
                </div>
                <div className="col-span-8 text-sm">
                  <span className="flex items-center gap-2">
                    {notice.important && (
                      <span className="px-1.5 py-0.5 text-xs font-medium bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded">
                        중요
                      </span>
                    )}
                    <span className="text-gray-900 dark:text-white truncate">
                      {notice.title}
                    </span>
                  </span>
                </div>
                <div className="col-span-3 text-center text-sm text-gray-500 dark:text-gray-400">
                  {notice.date}
                </div>
              </div>

              {/* 상세 내용 (펼쳤을 때) */}
              {expandedId === notice.id && (
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <div className="mb-3 pb-3 border-b border-gray-200 dark:border-gray-600">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {notice.title}
                    </h2>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      작성일: {notice.date}
                    </span>
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                    {notice.content}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 안내 문구 */}
        <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
          공지사항을 클릭하면 상세 내용을 확인할 수 있습니다.
        </p>
      </div>
    </div>
  );
}

export default Test2Page;
