import React, { useState, useEffect } from "react";
import { getNoticeList } from "@/api/boardApi";

function Test2Page() {
  const [expandedId, setExpandedId] = useState(null);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const fetchNotices = async (pageNum = 0) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getNoticeList(pageNum);
      const list = (res.list || []).map((item) => ({
        id: item.id,
        title: item.title ?? "",
        content: item.content ?? "",
        date:
          item.date ?? item.updatedAt ?? item.updateAt ?? item.createdAt ?? item.registeredAt ?? "",
        important: !!item.important,
      }));
      setNotices(list);
      setTotalPages(res.totalPages ?? 0);
      setTotalElements(res.totalElements ?? 0);
      setPage(res.page ?? pageNum);
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "공지사항을 불러오지 못했습니다.";
      setError(message);
      setNotices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices(0);
  }, []);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const goToPage = (nextPage) => {
    if (nextPage < 0 || nextPage >= totalPages) return;
    setExpandedId(null);
    fetchNotices(nextPage);
  };

  return (
    <div className="mainMobileBody pb-20">
      <h1 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">공지사항</h1>

      {error && <p className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>}

      {loading ? (
        <p className="py-8 text-center text-gray-500 dark:text-gray-400">불러오는 중…</p>
      ) : (
        <>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            {notices.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                등록된 공지가 없습니다.
              </div>
            ) : (
              notices.map((notice) => (
                <div key={notice.id}>
                  <div
                    className={`px-4 py-3 border-b border-gray-100 dark:border-gray-700 cursor-pointer transition-colors ${
                      expandedId === notice.id
                        ? "bg-blue-50 dark:bg-blue-900/20"
                        : "active:bg-gray-50 dark:active:bg-gray-700/50"
                    }`}
                    onClick={() => toggleExpand(notice.id)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {notice.important && (
                        <span className="px-1.5 py-0.5 text-[10px] font-medium bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded">
                          중요
                        </span>
                      )}
                      <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {notice.title}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{notice.date}</div>
                  </div>

                  {expandedId === notice.id && (
                    <div className="px-4 py-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                      <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                        {notice.content}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <button
                type="button"
                onClick={() => goToPage(page - 1)}
                disabled={page <= 0}
                className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 text-gray-700 dark:text-gray-300"
              >
                이전
              </button>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {page + 1}/{totalPages}
              </span>
              <button
                type="button"
                onClick={() => goToPage(page + 1)}
                disabled={page >= totalPages - 1}
                className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 text-gray-700 dark:text-gray-300"
              >
                다음
              </button>
            </div>
          )}
        </>
      )}

      <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
        공지사항을 터치하면 상세 내용을 확인할 수 있습니다.
      </p>
    </div>
  );
}

export default Test2Page;
