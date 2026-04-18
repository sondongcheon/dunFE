import React, { useCallback, useState } from "react";
import { fetchMyInfoCharacters } from "@/api/adventureApi";
import MyInfoCharacterList from "./MyInfoCharacterList";

/**
 * 모험단 이름으로 GET /adventure/my-info?adventureName=… 조회 (로그인 불필요)
 */
function MyInfoOtherLookup() {
  const [input, setInput] = useState("");
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const name = input.trim();
      if (!name) {
        setError("모험단 이름을 입력해 주세요.");
        return;
      }
      setLoading(true);
      setError(null);
      setHasSearched(true);
      try {
        const list = await fetchMyInfoCharacters({ adventureName: name });
        setCharacters(list);
      } catch (err) {
        console.error("모험단 정보 조회 실패:", err);
        setCharacters([]);
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "정보를 불러오지 못했습니다.",
        );
      } finally {
        setLoading(false);
      }
    },
    [input],
  );

  return (
    <div className="space-y-4">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-2 sm:flex-row sm:items-end sm:flex-wrap"
      >
        <label className="flex flex-col gap-1 min-w-0 flex-1 sm:max-w-md">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
            모험단 이름
          </span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="정확한 모험단 이름을 입력하세요"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400"
            autoComplete="off"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-gray-900 dark:bg-gray-100 px-4 py-2 text-sm font-medium text-white dark:text-gray-900 hover:opacity-90 disabled:opacity-50 sm:shrink-0"
        >
          {loading ? "조회 중…" : "조회"}
        </button>
      </form>

      {error && (
        <div className="rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50/80 dark:bg-red-950/30 p-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {hasSearched && !error && (
        <MyInfoCharacterList
          characters={characters}
          loading={loading}
          canEditMemo={false}
        />
      )}

      {!hasSearched && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          모험단 이름을 입력한 뒤 조회하면 캐릭터 목록이 표시됩니다.
        </p>
      )}
    </div>
  );
}

export default MyInfoOtherLookup;
