import React, { useState, useEffect } from "react";
import { getNoticeList } from "@/api/boardApi";
import { getSafeErrorMessage } from "@/utils/errorMessage";

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
      setError(getSafeErrorMessage(err, "공지사항을 불러오지 못했습니다."));
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
    <div className="mainbody">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">공지사항</h1>

        {error && <p className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>}

        {loading ? (
          <p className="py-8 text-center text-gray-500 dark:text-gray-400">불러오는 중…</p>
        ) : (
          <>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              {/* 헤더 */}
              <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300">
                <div className="col-span-1 text-center">번호</div>
                <div className="col-span-8">제목</div>
                <div className="col-span-3 text-center">작성일</div>
              </div>

              {/* 공지사항 목록 */}
              {notices.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                  등록된 공지가 없습니다.
                </div>
              ) : (
                notices.map((notice) => (
                  <div key={notice.id}>
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
                ))
              )}
            </div>

            {/* 페이징 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => goToPage(page - 1)}
                  disabled={page <= 0}
                  className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300"
                >
                  이전
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {page + 1} / {totalPages} (총 {totalElements}건)
                </span>
                <button
                  type="button"
                  onClick={() => goToPage(page + 1)}
                  disabled={page >= totalPages - 1}
                  className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300"
                >
                  다음
                </button>
              </div>
            )}
          </>
        )}

        <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
          공지사항을 클릭하면 상세 내용을 확인할 수 있습니다.
        </p>
      </div>
    </div>
  );
}

export default Test2Page;
