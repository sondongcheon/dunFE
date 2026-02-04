import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import neopleLogo from "@/Assets/기술표기_가로형_color.png";
import { createNotice } from "@/api/boardApi";

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
      const message =
        err.response?.data?.message ||
        err.message ||
        "공지 등록에 실패했습니다. 다시 시도해 주세요.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

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
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-4">공지사항 작성</h1>

        <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-6">
          {success && (
            <p className="mb-3 text-sm text-green-600 dark:text-green-400">
              공지가 등록되었습니다.
            </p>
          )}
          {error && <p className="mb-3 text-sm text-red-600 dark:text-red-400">{error}</p>}
          <form onSubmit={handleNoticeSubmit} className="space-y-3">
            <input
              name="title"
              type="text"
              value={noticeForm.title}
              onChange={handleNoticeChange}
              placeholder="제목"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
            <textarea
              name="content"
              value={noticeForm.content}
              onChange={handleNoticeChange}
              placeholder="내용"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm resize-y"
            />
            <div className="flex items-center gap-2">
              <input
                name="important"
                type="checkbox"
                checked={noticeForm.important}
                onChange={handleNoticeChange}
                className="rounded border-gray-300 text-blue-600"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">중요 공지</span>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-blue-600 text-white text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "등록 중…" : "등록"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/notice")}
              className="w-full py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg mt-2"
            >
              공지사항 목록
            </button>
          </form>
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

export default AdminNoticePage;
