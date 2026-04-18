import React from "react";
import { resolveSetpointIconUrl } from "@/utils/setpointIcon";

function lineText(value) {
  return value != null && String(value).trim() !== "" ? String(value) : "";
}

function lineTitle(value) {
  return value != null && String(value).trim() !== "" ? String(value) : undefined;
}

/**
 * 캐릭터 카드가 p-3일 때: 세트·서약 블록을 패딩 쪽으로 거의 맞추되,
 * 카드 안쪽 가장자리와 블록 사이에 px-2(8px) 정도 간격이 남도록 함.
 */
export const CHARACTER_CARD_SET_OATH_BLEED = "-mx-1 w-[calc(100%+0.5rem)] min-w-0";

/** 내 정보 왼쪽 열 p-2 / sm:p-3 — 가장자리에서 px-2 정도 이격 */
export const MY_INFO_SET_OATH_BLEED =
  "-mx-0.5 w-[calc(100%+0.25rem)] min-w-0 sm:-mx-1.5 sm:w-[calc(100%+0.75rem)]";

/**
 * 세트(setEquip) · 서약(setOath) 두 줄 + setpoint 아이콘 (Characters 카드 하단과 동일 스타일)
 * @param {boolean} [marginTop=true] — false면 상단 여백 없음(내 정보 등에 붙일 때)
 * @param {string} [bleedXClassName] — 카드 패딩을 거의 상쇄하되 가장자리에 px-2 정도 간격 남김. 기본은 p-3 카드용.
 */
function CharacterSetEquipOathRows({
  setEquip,
  setOath,
  clearState = false,
  marginTop = true,
  bleedXClassName = CHARACTER_CARD_SET_OATH_BLEED,
}) {
  const rowBox = clearState
    ? "border-green-200/90 bg-white/70 dark:border-green-800/50 dark:bg-green-950/25"
    : "border-amber-200/80 bg-white/70 dark:border-amber-800/40 dark:bg-amber-950/20";

  const equipIconUrl = resolveSetpointIconUrl(setEquip);
  const oathIconUrl = resolveSetpointIconUrl(setOath);

  return (
    <div
      className={`${marginTop ? "mt-3" : "mt-0"} ${bleedXClassName}`.trim()}
    >
      <div className="flex flex-col gap-1 w-full min-w-0">
      <div
        className={`min-w-0 rounded-lg border px-1 py-0.5 flex items-center gap-2 min-h-[2.25rem] ${rowBox}`}
      >
        {equipIconUrl ? (
          <div
            className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded overflow-hidden bg-gray-100 dark:bg-gray-800/90 border border-gray-200/90 dark:border-gray-600/80"
            aria-hidden
          >
            <img
              src={equipIconUrl}
              alt=""
              className="w-full h-full object-contain"
              loading="lazy"
              decoding="async"
            />
          </div>
        ) : null}
        <p
          className="flex-1 min-w-0 text-[10px] sm:text-[11px] text-gray-800 dark:text-gray-100 leading-snug line-clamp-2 break-words text-left"
          title={lineTitle(setEquip)}
        >
          {lineText(setEquip)}
        </p>
      </div>
      <div
        className={`min-w-0 rounded-lg border px-1 py-0.5 flex items-center gap-2 min-h-[2.25rem] ${rowBox}`}
      >
        {oathIconUrl ? (
          <div
            className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded overflow-hidden bg-gray-100 dark:bg-gray-800/90 border border-gray-200/90 dark:border-gray-600/80"
            aria-hidden
          >
            <img
              src={oathIconUrl}
              alt=""
              className="w-full h-full object-contain"
              loading="lazy"
              decoding="async"
            />
          </div>
        ) : null}
        <p
          className="flex-1 min-w-0 text-[10px] sm:text-[11px] text-gray-800 dark:text-gray-100 leading-snug line-clamp-2 break-words text-left"
          title={lineTitle(setOath)}
        >
          {lineText(setOath)}
        </p>
      </div>
      </div>
    </div>
  );
}

export default CharacterSetEquipOathRows;
