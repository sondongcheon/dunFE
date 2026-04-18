import React from "react";
import EditableMemo from "@/PC/content/components/EditableMemo";
import { toServerIdForUrl } from "@/utils/serverMapping";

/**
 * 모바일용 간단 캐릭터 카드.
 * - PC용 CharacterCardSimple을 그대로 가져온 버전 (추후 모바일 전용 스타일로 조정 예정).
 */
function CharacterCardSimpleMobile({
  character,
  groups = [],
  parties = [],
  onMemoUpdate,
  canEditMemo = false,
  className = "",
  dense = false,
}) {
  if (!character) return null;

  const partyGroups = []; // 모바일에서는 일단 파티/그룹 정보 미표시 (필요시 PC 로직 이식 예정)

  return (
    <div
      className={`relative flex flex-col min-h-[6rem] rounded-lg border-2 shadow-sm transition-all duration-200 min-w-0 w-full overflow-hidden ${className} ${
        character.clearState
          ? "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-600"
          : "bg-amber-50/80 dark:bg-amber-900/15 border-amber-200 dark:border-amber-800"
      }`}
    >
      {/* 1행: 닉네임 + 버튼(던담이동) */}
      <div className="flex items-center justify-between gap-[0.6rem] px-[0.6rem] py-[0.45rem] border-b border-amber-200/50 dark:border-amber-800/50 min-w-0">
        <p
          className={`font-semibold text-gray-900 dark:text-white truncate min-w-0 ${
            dense ? "text-xs" : "text-sm"
          }`}
        >
          {character.name}
        </p>
        {character.characterId && character.server && (
          <a
            href={`https://dundam.xyz/character?server=${toServerIdForUrl(character.server)}&key=${character.characterId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 px-1.5 py-0.5 rounded text-[10px] leading-none font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800"
            onClick={(e) => e.stopPropagation()}
          >
            던담이동
          </a>
        )}
      </div>

      {/* 2행: job + fame */}
      <div
        className={`flex items-center justify-between gap-2 px-1.5 py-1 min-w-0 ${
          dense ? "text-[11px]" : "text-xs"
        }`}
      >
        <span className="text-gray-500 dark:text-gray-400 truncate">{character.job ?? "—"}</span>
        <span className="text-gray-500 dark:text-gray-400 flex-shrink-0">
          명성 {character.value ?? character.fame ?? "-"}
        </span>
      </div>

      {/* 3행: 메모 */}
      <div className="px-1.5 pb-1.5 pt-1 flex-1 min-h-[2rem] border-t border-amber-200/30 dark:border-amber-800/30">
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

export default CharacterCardSimpleMobile;
