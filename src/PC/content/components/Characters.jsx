import React, { useState, useMemo } from "react";
import EditableMemo from "./EditableMemo";
import { toServerIdForUrl } from "@/utils/serverMapping";

/**
 * 캐릭터가 소속된 파티·파티그룹 찾기
 * @param {object} character - { id, characterId }
 * @param {Array} parties - 파티 목록 (groups[].members 포함)
 * @returns {Array<{ partyName: string, groupName: string }>}
 */
function getCharacterPartyGroups(character, parties) {
  if (!parties?.length) return [];
  const list = [];
  const charId = character.id;
  const charCharacterId = character.characterId;
  for (const party of parties) {
    for (const group of party.groups || []) {
      const inGroup = (group.members || []).some(
        (m) =>
          m.id === charId ||
          m.characterId === charCharacterId ||
          m.id === charCharacterId ||
          m.characterId === charId
      );
      if (inGroup) {
        list.push({ partyName: party.name ?? "", groupName: group.name ?? "" });
      }
    }
  }
  return list;
}

/**
 * Characters 컴포넌트
 * 페이지 로딩 시 서버에서 받아온 캐릭터 목록 표시
 * @param {Array} characters - 캐릭터 데이터 배열
 * @param {Array} groups - 그룹 목록 (groupNum → 그룹명 표시용)
 * @param {Array} parties - 파티 목록 (소속 파티·파티그룹 표시용)
 * @param {boolean} loading - 로딩 여부
 * @param {Set<number>} addedCharacterIds - 그룹에 등록된 캐릭터 ID 집합 (제외해서 보기 시 필터)
 * @param {Function} onMemoUpdate - 메모 수정 후 콜백 (데이터 새로고침용)
 * @param {boolean} canEditMemo - 메모 편집 가능 여부 (로그인 시 true)
 */
function Characters({
  characters = [],
  groups = [],
  parties = [],
  loading = false,
  addedCharacterIds,
  onMemoUpdate,
  canEditMemo = false,
}) {
  const [sectionExpanded, setSectionExpanded] = useState(true);
  const [filterMode, setFilterMode] = useState("include"); // "include" | "exclude"

  const displayCharacters = useMemo(() => {
    if (!addedCharacterIds || addedCharacterIds.size === 0) return characters;
    if (filterMode === "include") return characters;
    return characters.filter((c) => !addedCharacterIds.has(c.id));
  }, [characters, addedCharacterIds, filterMode]);

  if (loading) {
    return (
      <div className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div
          className="flex items-center justify-between mb-4 cursor-pointer select-none"
          onClick={() => setSectionExpanded((e) => !e)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && setSectionExpanded((v) => !v)}
          aria-expanded={sectionExpanded}
        >
          <h2 className="text-2xl font-bold">Characters</h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {sectionExpanded ? "▼" : "▲"}
          </span>
        </div>
        {sectionExpanded && (
          <div className="text-sm text-gray-500 dark:text-gray-400 py-4">로딩 중...</div>
        )}
      </div>
    );
  }

  if (!characters.length) {
    return (
      <div className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div
          className="flex items-center justify-between mb-4 cursor-pointer select-none"
          onClick={() => setSectionExpanded((e) => !e)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && setSectionExpanded((v) => !v)}
          aria-expanded={sectionExpanded}
        >
          <h2 className="text-2xl font-bold">Characters</h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {sectionExpanded ? "▼" : "▲"}
          </span>
        </div>
        {sectionExpanded && (
          <div className="text-sm text-gray-500 dark:text-gray-400 py-4">캐릭터가 없습니다.</div>
        )}
      </div>
    );
  }

  const hasAdded = addedCharacterIds && addedCharacterIds.size > 0;

  return (
    <div className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div
        className="flex items-center justify-between mb-4 cursor-pointer select-none"
        onClick={() => setSectionExpanded((e) => !e)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && setSectionExpanded((v) => !v)}
        aria-expanded={sectionExpanded}
      >
        <h2 className="text-2xl font-bold">Characters</h2>
        <div className="flex items-center gap-2">
          {sectionExpanded && hasAdded && (
            <div className="flex flex-wrap gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => setFilterMode("include")}
                className={`px-2 py-1.5 text-[10px] sm:text-xs font-medium rounded transition-colors whitespace-nowrap ${
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
                className={`px-2 py-1.5 text-[10px] sm:text-xs font-medium rounded transition-colors whitespace-nowrap ${
                  filterMode === "exclude"
                    ? "bg-gray-800 dark:bg-gray-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                제외해서 보기
              </button>
            </div>
          )}
          <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
            {sectionExpanded ? "▼" : "▲"}
          </span>
        </div>
      </div>
      {sectionExpanded && (
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {displayCharacters.length === 0 ? (
            <div className="col-span-full text-sm text-gray-500 dark:text-gray-400 py-8 text-center">
              {filterMode === "exclude"
                ? "그룹에 추가된 캐릭터를 제외하면 표시할 캐릭터가 없습니다."
                : "캐릭터가 없습니다."}
            </div>
          ) : (
            displayCharacters.map((character) => (
              <div
                key={character.id}
                className={`relative flex gap-4 p-4 rounded-xl shadow-sm transition-all duration-200 ${
                  character.clearState
                    ? "bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-600 hover:shadow-md hover:border-green-400 dark:hover:border-green-500"
                    : "bg-amber-50/80 dark:bg-amber-900/15 border-2 border-amber-200 dark:border-amber-800 hover:shadow-md hover:border-amber-300 dark:hover:border-amber-700"
                }`}
              >
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 ring-2 ring-gray-100 dark:ring-gray-600">
                    <span className="absolute inset-0 flex items-center justify-center text-xl sm:text-2xl font-bold text-gray-500 dark:text-gray-400">
                      {character.name.charAt(0) || "?"}
                    </span>
                    {character.image && (
                      <img
                        src={character.image}
                        alt={character.name}
                        className="relative w-full h-full object-cover object-[center_100%] scale-125 bg-transparent"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    )}
                  </div>
                  {character.job && (
                    <span className="text-xs font-bold text-gray-900 dark:text-white mt-2 text-center truncate max-w-[5rem] sm:max-w-[5.5rem]">
                      {character.job}
                    </span>
                  )}
                  {character.characterId && character.server && (
                    <a
                      href={`https://dundam.xyz/character?server=${toServerIdForUrl(
                        character.server
                      )}&key=${character.characterId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 whitespace-nowrap"
                    >
                      던담이동
                    </a>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="w-full text-center mb-2">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white block truncate">
                      {character.name}
                    </span>
                  </div>
                  {/* 1줄: 그룹명 (private 그룹 소속 시) */}
                  {character.groupNum !== null && character.groupNum !== undefined && (
                    <div className="flex flex-wrap items-center justify-center gap-1.5 mb-1">
                      <span
                        className="text-xs px-2 py-0.5 rounded-md font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 truncate max-w-[8rem]"
                        title={
                          groups.find((g) => g.id === character.groupNum)?.name ??
                          `그룹 ${character.groupNum}`
                        }
                      >
                        {groups.find((g) => g.id === character.groupNum)?.name ??
                          `그룹 ${character.groupNum}`}
                      </span>
                    </div>
                  )}
                  {/* 2줄: 소속 파티·파티그룹 (있을 경우) */}
                  {(() => {
                    const partyGroups = getCharacterPartyGroups(character, parties);
                    if (partyGroups.length === 0) return null;
                    return (
                      <div className="flex flex-wrap items-center justify-center gap-1.5 mb-1">
                        {partyGroups.map((pg, i) => (
                          <span
                            key={i}
                            className="text-xs px-2 py-0.5 rounded-md font-medium bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 truncate max-w-[10rem]"
                            title={`${pg.partyName} · ${pg.groupName}`}
                          >
                            {pg.partyName} · {pg.groupName}
                          </span>
                        ))}
                      </div>
                    );
                  })()}
                  {/* 3줄: 명성 */}
                  <div className="flex items-center justify-center mb-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      명성 {character.value}
                    </span>
                  </div>
                  <div className="text-center">
                    <EditableMemo
                      characterId={character.id}
                      memo={character.memo}
                      onSave={onMemoUpdate}
                      disabled={!canEditMemo}
                      className="block truncate"
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default Characters;
