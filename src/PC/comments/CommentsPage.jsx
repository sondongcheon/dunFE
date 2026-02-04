import React, { useState, useEffect } from "react";
import { getCommentList, createComment, updateComment } from "@/api/boardApi";
import LoginModal from "@/PC/common/LoginModal";

function CommentsPage() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [content, setContent] = useState("");
  const [hideNickname, setHideNickname] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adventureId, setAdventureId] = useState(null);
  const [adventureName, setAdventureName] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);

  useEffect(() => {
    const id = localStorage.getItem("adventureId");
    const name = localStorage.getItem("adventureName");
    setIsLoggedIn(!!(id && name));
    setAdventureId(id ?? null);
    setAdventureName(name ?? "");
  }, []);

  const fetchComments = async (pageNum = 0) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getCommentList(pageNum);
      const list = (res.list || []).map((item) => ({
        id: item.id,
        adventureId: item.adventureId,
        adventureName: item.adventureName ?? "",
        content: item.content ?? "",
        hideName: !!item.hideName,
        createdAt: item.createAt ?? item.updateAt ?? "",
      }));
      setComments(list);
      setTotalPages(res.totalPages ?? 0);
      setTotalElements(res.totalElements ?? 0);
      setPage(res.page ?? pageNum);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "코멘트를 불러오지 못했습니다.";
      setError(msg);
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments(0);
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setAdventureId(localStorage.getItem("adventureId") ?? null);
    setAdventureName(localStorage.getItem("adventureName") ?? "");
    setShowLoginModal(false);
  };

  const isMyComment = (c) => {
    if (!adventureId) return false;
    return String(c.adventureId) === String(adventureId);
  };

  const startEdit = (c) => {
    setEditingId(c.id);
    setEditContent(c.content);
    setEditError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent("");
    setEditError(null);
  };

  const handleUpdateComment = async () => {
    if (editingId == null) return;
    const trimmed = (editContent ?? "").trim();
    if (!trimmed) {
      setEditError("내용을 입력해 주세요.");
      return;
    }
    setEditError(null);
    setEditLoading(true);
    try {
      await updateComment(editingId, { content: trimmed });
      setEditingId(null);
      setEditContent("");
      fetchComments(page);
    } catch (err) {
      setEditError(err.response?.data?.message || err.message || "수정에 실패했습니다.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoggedIn || !adventureName) {
      setShowLoginModal(true);
      return;
    }
    const trimmed = (content ?? "").trim();
    if (!trimmed) {
      setSubmitError("내용을 입력해 주세요.");
      return;
    }
    setSubmitError(null);
    setSubmitLoading(true);
    try {
      await createComment({
        content: trimmed,
        hideName: hideNickname,
      });
      setContent("");
      setHideNickname(false);
      fetchComments(page);
    } catch (err) {
      setSubmitError(err.response?.data?.message || err.message || "등록에 실패했습니다.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const goToPage = (nextPage) => {
    if (nextPage < 0 || nextPage >= totalPages) return;
    fetchComments(nextPage);
  };

  const formatDate = (str) => {
    if (!str) return "";
    const s = String(str);
    return s.slice(0, 10);
  };

  return (
    <div className="mainbody">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">유저 코멘트</h1>

        {/* 작성 폼: 로그인 시에만 */}
        <section className="mb-6">
          {isLoggedIn ? (
            <form
              onSubmit={handleSubmit}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4"
            >
              {submitError && (
                <p className="mb-2 text-sm text-red-600 dark:text-red-400">{submitError}</p>
              )}
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="짧은 코멘트를 남겨보세요."
                rows={3}
                maxLength={500}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 resize-y"
              />
              <div className="flex items-center justify-between mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hideNickname}
                    onChange={(e) => setHideNickname(e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-600 text-blue-600"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">닉네임 비공개</span>
                </label>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-500 disabled:opacity-50"
                >
                  {submitLoading ? "등록 중…" : "등록"}
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                코멘트를 작성하려면 로그인이 필요합니다.
              </p>
              <button
                type="button"
                onClick={() => setShowLoginModal(true)}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-500"
              >
                로그인
              </button>
            </div>
          )}
        </section>

        <LoginModal
          open={showLoginModal}
          onOpenChange={setShowLoginModal}
          onLoginSuccess={handleLoginSuccess}
        />

        {/* 목록 */}
        {error && <p className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>}

        {loading ? (
          <p className="py-8 text-center text-gray-500 dark:text-gray-400">불러오는 중…</p>
        ) : (
          <>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              {comments.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                  아직 코멘트가 없습니다.
                </div>
              ) : (
                <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                  {comments.map((c) => (
                    <li key={c.id} className="px-4 py-3">
                      {editingId === c.id ? (
                        <>
                          {editError && (
                            <p className="mb-2 text-sm text-red-600 dark:text-red-400">
                              {editError}
                            </p>
                          )}
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            rows={3}
                            maxLength={500}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm resize-y"
                          />
                          <div className="mt-2 flex gap-2">
                            <button
                              type="button"
                              onClick={handleUpdateComment}
                              disabled={editLoading}
                              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-500 disabled:opacity-50"
                            >
                              {editLoading ? "저장 중…" : "저장"}
                            </button>
                            <button
                              type="button"
                              onClick={cancelEdit}
                              disabled={editLoading}
                              className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                              취소
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <p className="text-base text-gray-900 dark:text-white whitespace-pre-wrap break-words">
                            {c.content}
                          </p>
                          <div className="mt-3 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                              <span>{c.id}</span>
                              <span className="text-gray-300 dark:text-gray-600 select-none">
                                |
                              </span>
                              <span>{c.adventureName}</span>
                              {c.createdAt && (
                                <>
                                  <span className="text-gray-300 dark:text-gray-600 select-none">
                                    |
                                  </span>
                                  <span>{formatDate(c.createdAt)}</span>
                                </>
                              )}
                            </div>
                            {isMyComment(c) && (
                              <button
                                type="button"
                                onClick={() => startEdit(c)}
                                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                수정
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
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
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {page + 1} / {totalPages} (총 {totalElements}건)
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
      </div>
    </div>
  );
}

export default CommentsPage;
