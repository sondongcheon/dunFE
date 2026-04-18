import React from "react";
import EditableMemo from "@/PC/content/components/EditableMemo";
import CharacterSetEquipOathRows, {
  MY_INFO_SET_OATH_BLEED,
} from "@/PC/content/components/CharacterSetEquipOathRows";
import { CONTENT_IDS } from "@/PC/content/constants";
import { toServerIdForUrl } from "@/utils/serverMapping";

const CARD_POSITIVE_SHELL =
  "border-green-300 dark:border-green-600 bg-green-50/50 dark:bg-green-950/20";
const CARD_NEGATIVE_SHELL =
  "border-amber-200 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-950/15";

/**
 * 내 정보 전용 캐릭터 카드
 * - 왼쪽: 요약 + 세트·서약(캐릭터 목록 카드와 동일하게 본문 아래 전체 너비)
 * - 오른쪽: 컨텐츠별 클리어 여부 (CONTENT_IDS 순서). 행 클릭 시 목록 전체 카드 테두리가 그 컨텐츠 기준으로 맞춰짐.
 */
function MyInfoCharacterCard({
  character,
  onMemoUpdate,
  canEditMemo = false,
  borderFocusContentId = null,
  onToggleBorderFocus,
}) {
  const borderPositive =
    borderFocusContentId != null
      ? character.contentClears?.[borderFocusContentId] === true
      : !!character.clearState;

  return (
    <article
      className={`rounded-xl border-2 shadow-sm transition-all duration-200 flex flex-col md:flex-row gap-0 min-w-0 h-full overflow-hidden ${
        borderPositive ? CARD_POSITIVE_SHELL : CARD_NEGATIVE_SHELL
      }`}
    >
      {/* 왼쪽: 요약 + 세트·서약 */}
      <div className="flex flex-col flex-1 min-w-0 md:flex-[57_1_0%] p-2 sm:p-3 min-h-[11.7rem]">
        <div className="flex gap-4 flex-1 min-w-0 min-h-0 items-center">
          <div className="flex flex-col items-center flex-shrink-0 justify-center">
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 ring-2 ring-gray-100 dark:ring-gray-600">
              <span className="absolute inset-0 flex items-center justify-center text-xl sm:text-2xl font-bold text-gray-500 dark:text-gray-400">
                {(character.name || "?").charAt(0)}
              </span>
              {(character.image || character.img) && (
                <img
                  src={character.image || character.img}
                  alt={character.name || "캐릭터"}
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

          <div className="flex-1 min-w-0 flex flex-col justify-center items-center gap-1.5 text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate w-full max-w-full">
              {character.name}
            </h3>
            <div className="flex w-full items-center justify-center mb-0.5">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                명성 {character.value ?? character.fame ?? "-"}
              </span>
            </div>
            <div className="w-full flex justify-center">
              <EditableMemo
                characterId={character.id}
                memo={character.memo}
                onSave={onMemoUpdate}
                disabled={!canEditMemo}
                className="block truncate max-w-full text-center"
              />
            </div>
          </div>
        </div>

        <CharacterSetEquipOathRows
          setEquip={character.setEquip}
          setOath={character.setOath}
          clearState={borderPositive}
          bleedXClassName={MY_INFO_SET_OATH_BLEED}
        />
      </div>

      <div
        className="shrink-0 bg-gray-200 dark:bg-gray-600 md:w-px w-full h-px md:h-auto md:self-stretch"
        aria-hidden
      />

      {/* 오른쪽: 콘텐츠별 클리어 목록 */}
      <div className="flex-1 min-h-[9.3rem] sm:min-h-0 md:flex-[43_1_0%] p-2 sm:p-3 flex flex-col bg-white/70 dark:bg-gray-900/50 min-w-0">
        <div className="flex-1 min-h-0 overflow-y-auto pr-0.5">
          <ul className="grid grid-cols-1 gap-y-0.5 text-[11px] sm:text-xs">
            {Object.entries(CONTENT_IDS).map(([contentId, label]) => {
              const cleared = character.contentClears?.[contentId] === true;
              const isFocusRow = borderFocusContentId === contentId;
              return (
                <li key={contentId} className="min-w-0">
                  <button
                    type="button"
                    onClick={() => onToggleBorderFocus?.(contentId)}
                    className={`flex w-full items-center justify-between gap-2 min-w-0 rounded-md px-1 py-1 text-left transition-colors border border-transparent ${
                      isFocusRow
                        ? "bg-amber-100/90 dark:bg-amber-950/40 border-amber-300/80 dark:border-amber-700/60"
                        : "hover:bg-gray-100/80 dark:hover:bg-gray-800/60"
                    }`}
                    title="클릭하면 모든 카드 테두리가 이 컨텐츠 클리어 여부로 표시됩니다. 다시 클릭하면 해제."
                  >
                    <span
                      className="text-gray-600 dark:text-gray-300 truncate min-w-0"
                      title={label}
                    >
                      {label}
                    </span>
                    <span
                      className={
                        cleared
                          ? "shrink-0 font-semibold text-green-600 dark:text-green-400"
                          : "shrink-0 text-gray-400 dark:text-gray-500"
                      }
                    >
                      {cleared ? "클리어" : "—"}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </article>
  );
}

export default MyInfoCharacterCard;
