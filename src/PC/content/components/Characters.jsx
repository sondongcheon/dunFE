import React, { useState, useMemo } from "react";

/**
 * Characters 컴포넌트
 * 페이지 로딩 시 서버에서 받아온 캐릭터 목록 표시 (현재 더미)
 * @param {Array} characters - 캐릭터 데이터 배열
 * @param {boolean} loading - 로딩 여부
 * @param {Set<number>} addedCharacterIds - 그룹에 등록된 캐릭터 ID 집합 (제외해서 보기 시 필터)
 */
function Characters({ characters = [], loading = false, addedCharacterIds }) {
  const [filterMode, setFilterMode] = useState("include"); // "include" | "exclude"

  const displayCharacters = useMemo(() => {
    if (!addedCharacterIds || addedCharacterIds.size === 0) return characters;
    if (filterMode === "include") return characters;
    return characters.filter((c) => !addedCharacterIds.has(c.id));
  }, [characters, addedCharacterIds, filterMode]);

  if (loading) {
    return (
      <div className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h2 className="text-2xl font-bold mb-4">Characters</h2>
        <div className="text-sm text-gray-500 dark:text-gray-400 py-4">로딩 중...</div>
      </div>
    );
  }

  if (!characters.length) {
    return (
      <div className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h2 className="text-2xl font-bold mb-4">Characters</h2>
        <div className="text-sm text-gray-500 dark:text-gray-400 py-4">캐릭터가 없습니다.</div>
      </div>
    );
  }

  const hasAdded = addedCharacterIds && addedCharacterIds.size > 0;

  return (
    <div className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Characters</h2>
        {hasAdded && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFilterMode("include")}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                filterMode === "include"
                  ? "bg-gray-800 dark:bg-gray-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              포함해서 보기
            </button>
            <button
              type="button"
              onClick={() => setFilterMode("exclude")}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                filterMode === "exclude"
                  ? "bg-gray-800 dark:bg-gray-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              제외해서 보기
            </button>
          </div>
        )}
      </div>
      <div className="space-y-2">
        {displayCharacters.length === 0 ? (
          <div className="text-sm text-gray-500 dark:text-gray-400 py-4">
            {filterMode === "exclude"
              ? "그룹에 추가된 캐릭터를 제외하면 표시할 캐릭터가 없습니다."
              : "캐릭터가 없습니다."}
          </div>
        ) : (
          displayCharacters.map((character) => (
          <div
            key={character.id}
            className="flex items-center gap-3 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded flex-shrink-0">
              {character.image && (
                <img
                  src={character.image}
                  alt={character.name}
                  className="w-full h-full object-cover rounded"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              )}
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {character.name}
            </span>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              고유번호: {character.id}
            </span>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              값: {character.value}
            </span>
          </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Characters;
