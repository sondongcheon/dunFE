import React, { useMemo, useState, useCallback } from "react";
import CharacterCardSimple from "./CharacterCardSimple";

const TEAM_ORDER = ["RED", "YELLOW", "GREEN"];
const SLOTS_PER_TEAM = 4;

const getTeamCountByContent = (contentName) => {
  const map = {
    azure_main: 2,
    goddess_of_death_temple: 3,
    venus_goddess_of_beauty: 2,
    nabel: 1,
    inae: 2,
    diregie: 3,
  };
  return map[contentName] ?? 3;
};

const teamColors = {
  RED: "bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-800 dark:text-red-200",
  YELLOW:
    "bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200",
  GREEN:
    "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-800 dark:text-green-200",
};

/**
 * 단일 공대 편성 블록 (좌: 팀 슬롯, 우: 캐릭터 목록)
 * - slots, onSlotsChange 로 제어
 * - onRemove: 삭제 버튼 클릭 시 (선택)
 */
function RaidFormationBlock({
  raidLabel,
  onRaidNameChange,
  party,
  members,
  sectionOrder,
  contentName,
  slots,
  onSlotsChange,
  characterIdsPlacedInOtherRaids = new Set(),
  onRemove,
  onMoveUp,
  onMoveDown,
  onMoveFirst,
  onMoveLast,
}) {
  const teamCount = getTeamCountByContent(contentName);
  const activeTeams = TEAM_ORDER.slice(0, teamCount);

  const [isBlockCollapsed, setIsBlockCollapsed] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState(() => new Set());
  const [isEditingName, setIsEditingName] = useState(false);
  const [editDraft, setEditDraft] = useState("");

  const commitRaidName = useCallback(
    (draft) => {
      const trimmed = (draft ?? "").trim();
      if (trimmed === "") {
        onRaidNameChange?.(raidLabel);
      } else {
        onRaidNameChange?.(trimmed);
      }
      setIsEditingName(false);
    },
    [onRaidNameChange, raidLabel],
  );
  const toggleGroup = useCallback((key) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const assignedIds = useMemo(
    () => new Set(activeTeams.flatMap((t) => (slots[t] ?? []).filter(Boolean))),
    [activeTeams, slots],
  );
  const placedAdventureIds = useMemo(() => {
    const set = new Set();
    activeTeams.forEach((team) => {
      (slots[team] ?? []).forEach((id) => {
        if (!id) return;
        const m = members.find((mem) => String(mem.id) === String(id));
        const key = m?.adventureId != null ? String(m.adventureId) : (m?.adventureName ?? null);
        if (key != null) set.add(key);
      });
    });
    return set;
  }, [activeTeams, slots, members]);

  const dropOnSlot = useCallback(
    (team, index, characterId) => {
      if (!characterId) return;
      if (characterIdsPlacedInOtherRaids && characterIdsPlacedInOtherRaids.has(String(characterId)))
        return;
      const character = members.find((m) => String(m.id) === String(characterId));
      if (!character) return;
      const advKey =
        character.adventureId != null
          ? String(character.adventureId)
          : (character.adventureName ?? null);

      onSlotsChange((prev) => {
        const next = {};
        for (const t of activeTeams) {
          next[t] = [...(prev[t] ?? [])];
          const arr = next[t];
          const existingIdx = arr.findIndex((v) => v === characterId);
          if (existingIdx !== -1) arr[existingIdx] = null;
        }
        const teamArr = next[team] ?? [];
        if (index < 0 || index >= teamArr.length) return prev;
        if (advKey != null) {
          for (const t of activeTeams) {
            const arr = next[t];
            for (let i = 0; i < arr.length; i++) {
              if (t === team && i === index) continue;
              const id = arr[i];
              if (!id) continue;
              const m = members.find((mem) => String(mem.id) === String(id));
              const otherKey =
                m?.adventureId != null ? String(m.adventureId) : (m?.adventureName ?? null);
              if (otherKey === advKey) return prev;
            }
          }
        }
        teamArr[index] = characterId;
        next[team] = teamArr;
        return next;
      });
    },
    [activeTeams, members, onSlotsChange, characterIdsPlacedInOtherRaids],
  );

  const clearSlot = useCallback(
    (team, index) => {
      onSlotsChange((prev) => ({
        ...prev,
        [team]: (prev[team] ?? []).map((v, i) => (i === index ? null : v)),
      }));
    },
    [onSlotsChange],
  );

  return (
    <section className="rounded-xl border border-gray-200 dark:border-gray-600 overflow-hidden bg-white dark:bg-gray-900/30">
      {/* 헤더: 접기 + 공대 이름(편집) + 순서 버튼 + 삭제 */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gray-100 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-600">
        <button
          type="button"
          onClick={() => setIsBlockCollapsed((c) => !c)}
          className="shrink-0 p-1.5 rounded text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none focus:ring-1 focus:ring-purple-400"
          aria-label={isBlockCollapsed ? "펼치기" : "접기"}
          title={isBlockCollapsed ? "펼치기" : "접기"}
        >
          <svg
            className={`w-4 h-4 transition-transform ${isBlockCollapsed ? "" : "rotate-90"}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {/* 공대 이름: 텍스트 + 연필 버튼 (연필 클릭 시 편집 모드 진입) */}
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="w-[220px]">
            {onRaidNameChange && isEditingName ? (
              <input
                type="text"
                value={editDraft}
                onChange={(e) => setEditDraft(e.target.value)}
                onBlur={() => commitRaidName(editDraft)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    commitRaidName(editDraft);
                  } else if (e.key === "Escape") {
                    e.preventDefault();
                    setEditDraft(raidLabel);
                    setIsEditingName(false);
                  }
                }}
                autoFocus
                className="w-full text-base font-semibold text-gray-800 dark:text-gray-200 bg-transparent border-b border-purple-500 focus:outline-none px-0 py-0.5"
                placeholder="공대 이름"
              />
            ) : (
              <h2 className="w-full text-base font-semibold text-gray-800 dark:text-gray-200 truncate">
                {raidLabel}
              </h2>
            )}
          </div>
          {onRaidNameChange && (
            <button
              type="button"
              onClick={() => {
                setEditDraft(raidLabel);
                setIsEditingName(true);
              }}
              className="ml-0.5 inline-flex items-center justify-center w-7 h-7 rounded border border-gray-300 dark:border-gray-600 bg-white/70 dark:bg-gray-800/70 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-purple-400"
              title="공대 이름 수정"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            </button>
          )}
        </div>

        {/* 순서 변경: 가로 배치 (맨 앞 ▲▲ / 위 ▲ / 아래 ▼ / 맨 뒤 ▼▼) */}
        {(onMoveFirst || onMoveUp || onMoveDown || onMoveLast) && (
          <div className="flex items-center gap-1 shrink-0">
            {onMoveFirst && (
              <button
                type="button"
                onClick={onMoveFirst}
                className="w-8 h-7 text-[10px] leading-none rounded border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-purple-400"
                title="맨 처음으로"
              >
                ▲▲
              </button>
            )}
            {onMoveUp && (
              <button
                type="button"
                onClick={onMoveUp}
                className="w-8 h-7 text-xs leading-none rounded border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-purple-400"
                title="한 칸 위로"
              >
                ▲
              </button>
            )}
            {onMoveDown && (
              <button
                type="button"
                onClick={onMoveDown}
                className="w-8 h-7 text-xs leading-none rounded border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-purple-400"
                title="한 칸 아래로"
              >
                ▼
              </button>
            )}
            {onMoveLast && (
              <button
                type="button"
                onClick={onMoveLast}
                className="w-8 h-7 text-[10px] leading-none rounded border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-purple-400"
                title="맨 마지막으로"
              >
                ▼▼
              </button>
            )}
          </div>
        )}
        {onRemove != null && (
          <button
            type="button"
            onClick={onRemove}
            className="text-xs text-red-600 dark:text-red-400 hover:underline focus:outline-none focus:ring-1 focus:ring-red-400 rounded px-2 py-1 ml-auto shrink-0"
          >
            공대 삭제
          </button>
        )}
      </div>
      {!isBlockCollapsed && (
        <div className="p-4">
          <div className="grid grid-cols-[7fr_3fr] gap-6 min-w-0">
            {/* 좌측: 팀 편성 */}
            <div className="min-w-0 space-y-4">
              {activeTeams.map((team) => (
                <section
                  key={team}
                  className="rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden"
                >
                  <h3 className={`text-sm font-semibold px-4 py-2 ${teamColors[team]}`}>{team}</h3>
                  <div className="p-4 pt-2 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-transparent">
                    {(slots[team] ?? Array(SLOTS_PER_TEAM).fill(null)).map((memberId, idx) => {
                      const character = memberId
                        ? members.find((m) => String(m.id) === String(memberId))
                        : null;
                      if (character) {
                        return (
                          <div
                            key={`${team}-${idx}`}
                            role="button"
                            tabIndex={0}
                            onClick={() => clearSlot(team, idx)}
                            onKeyDown={(e) => e.key === "Enter" && clearSlot(team, idx)}
                            className="cursor-pointer rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 min-w-0 w-full max-w-[200px] min-h-[7rem] mx-auto"
                            title="클릭 시 편성 해제"
                          >
                            <CharacterCardSimple
                              character={character}
                              groups={[]}
                              parties={party ? [party] : []}
                            />
                          </div>
                        );
                      }
                      return (
                        <div
                          key={`${team}-${idx}`}
                          className="min-h-[7rem] w-full max-w-[200px] mx-auto rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400 transition-colors"
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.dataTransfer.dropEffect = "move";
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            const id = e.dataTransfer.getData("text/plain");
                            if (id) dropOnSlot(team, idx, id);
                          }}
                          title="캐릭터를 여기로 드래그하세요"
                        >
                          빈 칸
                        </div>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>

            {/* 우측: 캐릭터 목록 */}
            <aside className="min-w-0">
              <div className="rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-3 sticky top-4">
                <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  캐릭터 목록 (드래그)
                </h3>
                <div className="space-y-3 p-2 max-h-[50vh] overflow-y-auto">
                  {sectionOrder.length === 0 && members.length === 0 ? (
                    <p className="text-sm text-gray-500 py-2">캐릭터 없음</p>
                  ) : (
                    sectionOrder.map((section, si) => {
                      const inSection = members.filter((m) => m.groupName === section.groupName);
                      if (inSection.length === 0) return null;
                      const byAdventure = new Map();
                      inSection.forEach((m) => {
                        const key = m.adventureName ?? "알 수 없음";
                        if (!byAdventure.has(key)) byAdventure.set(key, []);
                        byAdventure.get(key).push(m);
                      });
                      const adventureOrder = [];
                      const seenAdv = new Set();
                      inSection.forEach((m) => {
                        const key = m.adventureName ?? "알 수 없음";
                        if (!seenAdv.has(key)) {
                          seenAdv.add(key);
                          adventureOrder.push(key);
                        }
                      });
                      const groupKey = `${section.groupName ?? section.label}-${si}`;
                      const isCollapsed = collapsedGroups.has(groupKey);
                      return (
                        <div
                          key={groupKey}
                          className="border-b border-gray-200 dark:border-gray-600 last:border-0 pb-2 last:pb-0"
                        >
                          <button
                            type="button"
                            onClick={() => toggleGroup(groupKey)}
                            className="w-full flex items-center gap-1.5 text-left text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5 py-0.5 hover:text-gray-900 dark:hover:text-gray-200 focus:outline-none focus:ring-1 focus:ring-purple-400 rounded"
                          >
                            <svg
                              className={`w-4 h-4 shrink-0 transition-transform ${isCollapsed ? "" : "rotate-90"}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span>{section.label}</span>
                            <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">
                              {inSection.length}명
                            </span>
                          </button>
                          {!isCollapsed && (
                            <div className="space-y-2 pl-4">
                              {adventureOrder.map((advName) => {
                                const chars = byAdventure.get(advName) ?? [];
                                if (chars.length === 0) return null;
                                return (
                                  <div key={advName}>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">
                                      {advName}
                                    </p>
                                    <ul className="space-y-2">
                                      {chars.map((m) => {
                                        const advKey =
                                          m.adventureId != null
                                            ? String(m.adventureId)
                                            : (m.adventureName ?? null);
                                        const isAdventurePlaced =
                                          advKey != null && placedAdventureIds.has(advKey);
                                        const isThisCharacterPlaced = assignedIds.has(m.id);
                                        const isInOtherRaid =
                                          characterIdsPlacedInOtherRaids &&
                                          characterIdsPlacedInOtherRaids.has(String(m.id));
                                        const cannotPlace =
                                          (isAdventurePlaced && !isThisCharacterPlaced) ||
                                          isInOtherRaid;
                                        const isGrayed = isAdventurePlaced || isInOtherRaid;
                                        return (
                                          <li key={m.id}>
                                            <div
                                              draggable={!cannotPlace}
                                              onDragStart={(e) => {
                                                if (cannotPlace) return;
                                                e.dataTransfer.setData("text/plain", m.id);
                                                e.dataTransfer.effectAllowed = "move";
                                              }}
                                              className={`w-full text-left px-2 py-2 rounded text-sm border space-y-0.5 ${
                                                isGrayed
                                                  ? "opacity-50 bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400"
                                                  : "bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                                              } ${cannotPlace ? "pointer-events-none cursor-not-allowed" : "cursor-grab active:cursor-grabbing"}`}
                                              title={
                                                isInOtherRaid
                                                  ? "다른 공대에 이미 편성됨"
                                                  : isAdventurePlaced
                                                    ? isThisCharacterPlaced
                                                      ? "편성됨 (다른 칸으로 드래그해 이동 가능)"
                                                      : "이미 이 모험단이 편성되어 배치 불가"
                                                    : undefined
                                              }
                                            >
                                              <p className="font-medium text-gray-900 dark:text-white truncate text-xs">
                                                {[
                                                  m.name,
                                                  m.job,
                                                  m.value != null || m.fame != null
                                                    ? `명성 ${m.value ?? m.fame ?? "-"}`
                                                    : null,
                                                ]
                                                  .filter(Boolean)
                                                  .join(" · ")}
                                              </p>
                                              <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                                                {m.memo != null && m.memo !== ""
                                                  ? m.memo
                                                  : "메모없음"}
                                              </p>
                                            </div>
                                          </li>
                                        );
                                      })}
                                    </ul>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </aside>
          </div>
        </div>
      )}
    </section>
  );
}

export default RaidFormationBlock;
