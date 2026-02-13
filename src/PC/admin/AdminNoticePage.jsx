import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import neopleLogo from "@/Assets/기술표기_가로형_color.png";
import { createNotice } from "@/api/boardApi";
import { getSafeErrorMessage } from "@/utils/errorMessage";

function AdminNoticePage() {
  const navigate = useNavigate();
  const [noticeForm, setNoticeForm] = useState({
    title: "",
    content: "",
    important: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleNoticeChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNoticeForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setError(null);
  };

  const handleNoticeSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (!noticeForm.title?.trim()) {
      setError("제목을 입력해 주세요.");
      return;
    }
    setLoading(true);
    try {
      await createNotice({
        important: noticeForm.important,
        title: noticeForm.title.trim(),
        content: noticeForm.content?.trim() ?? "",
      });
      setNoticeForm({ title: "", content: "", important: false });
      setSuccess(true);
    } catch (err) {
      setError(
        getSafeErrorMessage(err, "공지 등록에 실패했습니다. 다시 시도해 주세요."),
      );
    } finally {
      setLoading(false);
    }
  };

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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">공지사항 작성</h1>

        <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-8">
          {success && (
            <p className="mb-4 text-sm text-green-600 dark:text-green-400">
              공지가 등록되었습니다.
            </p>
          )}
          {error && <p className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>}
          <form onSubmit={handleNoticeSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="notice-title"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                제목
              </label>
              <input
                id="notice-title"
                name="title"
                type="text"
                value={noticeForm.title}
                onChange={handleNoticeChange}
                placeholder="공지 제목"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label
                htmlFor="notice-content"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                내용
              </label>
              <textarea
                id="notice-content"
                name="content"
                value={noticeForm.content}
                onChange={handleNoticeChange}
                placeholder="공지 내용"
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="notice-important"
                name="important"
                type="checkbox"
                checked={noticeForm.important}
                onChange={handleNoticeChange}
                className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor="notice-important"
                className="text-sm text-gray-700 dark:text-gray-300"
              >
                중요 공지로 표시
              </label>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "등록 중…" : "등록"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/notice")}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                공지사항 목록 보기
              </button>
            </div>
          </form>
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

export default AdminNoticePage;
