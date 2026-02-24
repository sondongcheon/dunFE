import React from "react";
import EditableMemo from "./EditableMemo";
import { toServerIdForUrl } from "@/utils/serverMapping";

/**
 * 캐릭터가 소속된 파티·파티그룹 찾기 (Characters.jsx와 동일 로직)
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
 * Characters 카드의 간소화 버전 (이미지 제거).
 * 공대편성 등 슬롯용으로 사용.
 *
 * @param {object} character - 캐릭터 데이터 (id, name, job, value, memo, groupNum 등)
 * @param {Array} groups - 그룹 목록 (groupNum → 그룹명 표시용)
 * @param {Array} parties - 파티 목록 (소속 파티·파티그룹 표시용)
 * @param {Function} onMemoUpdate - 메모 저장 콜백 (선택)
 * @param {boolean} canEditMemo - 메모 편집 가능 여부
 * @param {string} className - 루트에 붙일 클래스
 */
function CharacterCardSimple({
  character,
  groups = [],
  parties = [],
  onMemoUpdate,
  canEditMemo = false,
  className = "",
  dense = false,
}) {
  if (!character) return null;

  const partyGroups = getCharacterPartyGroups(character, parties);

  return (
    <div
      className={`relative flex flex-col min-h-[7rem] rounded-lg border-2 shadow-sm transition-all duration-200 min-w-0 w-full overflow-hidden ${className} ${
        character.clearState
          ? "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-600"
          : "bg-amber-50/80 dark:bg-amber-900/15 border-amber-200 dark:border-amber-800"
      }`}
    >
      {/* 1행: 닉네임 + 버튼(던담이동) */}
      <div className="flex items-center justify-between gap-2 p-2 border-b border-amber-200/50 dark:border-amber-800/50 min-w-0">
        <p
          className={`font-semibold text-gray-900 dark:text-white truncate min-w-0 ${
            dense ? "text-sm" : "text-base"
          }`}
        >
          {character.name}
        </p>
        {character.characterId && character.server && (
          <a
            href={`https://dundam.xyz/character?server=${toServerIdForUrl(character.server)}&key=${character.characterId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 px-2 py-1 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800"
            onClick={(e) => e.stopPropagation()}
          >
            던담이동
          </a>
        )}
      </div>

      {/* 2행: job + fame */}
      <div
        className={`flex items-center justify-between gap-2 px-2 py-1.5 min-w-0 ${
          dense ? "text-[11px]" : "text-xs"
        }`}
      >
        <span className="text-gray-500 dark:text-gray-400 truncate">
          {character.job ?? "—"}
        </span>
        <span className="text-gray-500 dark:text-gray-400 flex-shrink-0">
          명성 {character.value ?? character.fame ?? "-"}
        </span>
      </div>

      {/* 3행: 메모 */}
      <div className="px-2 pb-2 pt-1.5 flex-1 min-h-[2rem] border-t border-amber-200/30 dark:border-amber-800/30">
        {typeof onMemoUpdate === "function" ? (
          <EditableMemo
            characterId={character.id}
            memo={character.memo}
            onSave={onMemoUpdate}
            disabled={!canEditMemo}
            className="block truncate text-xs text-gray-600 dark:text-gray-400"
          />
        ) : (
          <p
            className={`truncate text-gray-500 dark:text-gray-400 ${
              dense ? "text-[11px]" : "text-xs"
            }`}
            title={character.memo || undefined}
          >
            {character.memo != null && character.memo !== "" ? character.memo : "메모없음"}
          </p>
        )}
      </div>
    </div>
  );
}

export default CharacterCardSimple;
