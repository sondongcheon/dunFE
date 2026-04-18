import React, { useState, useMemo } from "react";
import EditableMemo from "./EditableMemo";
import CharacterSetEquipOathRows from "./CharacterSetEquipOathRows";
import { toServerIdForUrl } from "@/utils/serverMapping";
import { CONTENT_IDS } from "../constants";

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
          m.characterId === charId,
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
 * @param {string} contentName - 컨텐츠 식별자 (부연설명 노출 조건용)
 * @param {Function} onClearState - 닉네임 클릭 시 클리어 상태 갱신 (characterId) => Promise, 허용 content에서만 사용
 */
const SHOW_CLEAR_HINT_CONTENTS = [
  "azure_main",
  "goddess_of_death_temple",
  "freed_nightmare",
  "star_turtle_grand_library",
  "heretics_castle",
];
const ALLOWED_CLEAR_STATE_CONTENTS = [
  "azure_main",
  "goddess_of_death_temple",
  "freed_nightmare",
  "star_turtle_grand_library",
  "heretics_castle",
];
const MAX_FAME_BY_CONTENT = {
  azure_main: 71179,
  goddess_of_death_temple: 91581,
  freed_nightmare: 101852,
};

function Characters({
  characters = [],
  groups = [],
  parties = [],
  loading = false,
  addedCharacterIds,
  onMemoUpdate,
  onClearState,
  canEditMemo = false,
  contentName,
  showRecommendedFameOnly = false,
  /** true면 섹션 제목·필터 없이 그리드만 렌더 (공대편성 슬롯 등) */
  hideHeader = false,
}) {
  const [sectionExpanded, setSectionExpanded] = useState(true);
  const [filterMode, setFilterMode] = useState("include"); // "include" | "exclude"
  const [clearingCharacterId, setClearingCharacterId] = useState(null);

  const displayCharacters = useMemo(() => {
    const maxFame = MAX_FAME_BY_CONTENT[contentName];
    const fameFiltered =
      showRecommendedFameOnly && typeof maxFame === "number"
        ? characters.filter((character) => {
            const fame = Number(character.value ?? character.fame ?? 0);
            return Number.isFinite(fame) && fame <= maxFame;
          })
        : characters;

    if (!addedCharacterIds || addedCharacterIds.size === 0) return fameFiltered;
    if (filterMode === "include") return fameFiltered;
    return fameFiltered.filter((c) => !addedCharacterIds.has(c.id));
  }, [characters, addedCharacterIds, filterMode, showRecommendedFameOnly, contentName]);

  const renderCard = (character) => (
    <div
      className={`relative flex flex-col gap-0 overflow-hidden p-3 rounded-xl shadow-sm transition-all duration-200 min-w-0 min-h-[12.45rem] ${
        character.clearState
          ? "bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-600 hover:shadow-md hover:border-green-400 dark:hover:border-green-500"
          : "bg-amber-50/80 dark:bg-amber-900/15 border-2 border-amber-200 dark:border-amber-800 hover:shadow-md hover:border-amber-300 dark:hover:border-amber-700"
      }`}
    >
      <div className="flex gap-4 flex-1 min-w-0 min-h-0">
      <div className="flex flex-col items-center flex-shrink-0">
        <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 ring-2 ring-gray-100 dark:ring-gray-600">
          <span className="absolute inset-0 flex items-center justify-center text-xl sm:text-2xl font-bold text-gray-500 dark:text-gray-400">
            {(character.name || "?").charAt(0)}
          </span>
          {(character.image || character.img) && (
            <img
              src={character.image || character.img}
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
            href={`https://dundam.xyz/character?server=${toServerIdForUrl(character.server)}&key=${character.characterId}`}
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
          {contentName &&
          ALLOWED_CLEAR_STATE_CONTENTS.includes(contentName) &&
          typeof onClearState === "function" ? (
            <button
              type="button"
              onClick={() => {
                if (character.clearState) return;
                if (clearingCharacterId !== null) return;
                const contentLabel = CONTENT_IDS[contentName] ?? contentName;
                const confirmed = window.confirm(
                  `"${character.name}" 캐릭터를 ${contentLabel} 클리어 처리하시겠습니까?`,
                );
                if (!confirmed) return;
                setClearingCharacterId(character.id);
                onClearState([character.id]).finally(() => setClearingCharacterId(null));
              }}
              disabled={clearingCharacterId === character.id}
              className={
                character.clearState
                  ? "text-lg font-semibold text-gray-900 dark:text-white block truncate w-full mx-auto bg-transparent border-0 cursor-default"
                  : "text-lg font-semibold text-gray-900 dark:text-white block truncate w-full mx-auto bg-transparent border-0 cursor-pointer hover:underline focus:underline focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              }
              title={character.clearState ? undefined : "클릭 시 클리어 처리"}
            >
              {character.name}
            </button>
          ) : (
            <span className="text-lg font-semibold text-gray-900 dark:text-white block truncate">
              {character.name}
            </span>
          )}
        </div>
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
        <div className="flex items-center justify-center mb-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            명성 {character.value ?? character.fame ?? "-"}
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

      <CharacterSetEquipOathRows
        setEquip={character.setEquip}
        setOath={character.setOath}
        clearState={character.clearState}
      />
    </div>
  );

  if (hideHeader) {
    if (loading || !characters.length) return null;
    return (
      <div className="grid gap-3 grid-cols-1 min-w-0 w-full">
        {characters.map((character) => (
          <React.Fragment key={character.id}>{renderCard(character)}</React.Fragment>
        ))}
      </div>
    );
  }

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
          <h2 className="text-2xl font-bold">캐릭터 목록</h2>
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
          <h2 className="text-2xl font-bold">캐릭터 목록</h2>
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
        <div className="flex flex-col gap-0.5">
          <h2 className="text-2xl font-bold">캐릭터 목록</h2>
          {contentName && SHOW_CLEAR_HINT_CONTENTS.includes(contentName) && (
            <p className="text-xs text-gray-500 dark:text-gray-400 font-normal italic">
              닉네임을 클릭하면 클리어 상태로 변경할 수 있습니다. (상급던전 한정)
            </p>
          )}
        </div>
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
              <React.Fragment key={character.id}>{renderCard(character)}</React.Fragment>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default Characters;
