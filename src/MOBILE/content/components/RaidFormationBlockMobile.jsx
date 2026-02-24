import React, { useMemo, useState, useCallback } from "react";
import CharacterCardSimpleMobile from "./CharacterCardSimpleMobile";

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

const TEAM_LABELS = { RED: "RED", YELLOW: "YELLOW", GREEN: "GREEN" };

/**
 * 모바일용 단일 공대 편성 블록.
 * - 빈 칸 탭 → 선택 → 캐릭터 목록에서 캐릭터 탭으로 배치.
 * - 배치된 칸 탭 → 편성 해제.
 */
function RaidFormationBlockMobile({
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

  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isBlockCollapsed, setIsBlockCollapsed] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState(() => new Set());

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

  const placeCharacter = useCallback(
    (team, index, characterId) => {
      if (!characterId) return;
      if (characterIdsPlacedInOtherRaids?.has(String(characterId))) return;
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
      setSelectedSlot(null);
    },
    [onSlotsChange],
  );

  const handleCharacterTap = useCallback(
    (m) => {
      if (!selectedSlot) return;
      const advKey = m.adventureId != null ? String(m.adventureId) : (m.adventureName ?? null);
      const cannotPlace =
        (advKey != null && placedAdventureIds.has(advKey) && !assignedIds.has(m.id)) ||
        characterIdsPlacedInOtherRaids?.has(String(m.id));
      if (cannotPlace) return;
      placeCharacter(selectedSlot.team, selectedSlot.index, m.id);
      setSelectedSlot(null);
    },
    [selectedSlot, placedAdventureIds, assignedIds, characterIdsPlacedInOtherRaids, placeCharacter],
  );

  return (
    <section className="rounded-xl border border-gray-200 dark:border-gray-600 overflow-hidden bg-white dark:bg-gray-900/30">
      <div
        className="flex items-center justify-between gap-2 px-3 bg-gray-100 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-600"
        style={{ minHeight: 44 }}
      >
        <button
          type="button"
          onClick={() => setIsBlockCollapsed((c) => !c)}
          className="shrink-0 w-6 h-6 flex items-center justify-center rounded border border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none focus:ring-1 focus:ring-purple-400 touch-manipulation"
          aria-label={isBlockCollapsed ? "펼치기" : "접기"}
          title={isBlockCollapsed ? "펼치기" : "접기"}
        >
          <svg
            className={`w-3 h-3 transition-transform ${isBlockCollapsed ? "" : "rotate-90"}`}
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

        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <div className="w-[96px]">
            {onRaidNameChange && isEditingName ? (
              <input
                type="text"
                value={raidLabel}
                onChange={(e) => onRaidNameChange(e.target.value)}
                onBlur={() => setIsEditingName(false)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === "Escape") {
                    e.currentTarget.blur();
                  }
                }}
                autoFocus
                className="w-full text-xs font-semibold text-gray-800 dark:text-gray-200 bg-transparent border-b border-purple-500 focus:outline-none px-0 py-0.5 touch-manipulation"
                placeholder="공대 이름"
              />
            ) : (
              <span className="w-full text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">
                {raidLabel}
              </span>
            )}
          </div>
          {onRaidNameChange && (
            <button
              type="button"
              onClick={() => setIsEditingName(true)}
              className="inline-flex items-center justify-center w-6 h-6 rounded border border-gray-300 dark:border-gray-600 bg-white/70 dark:bg-gray-800/70 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-purple-400 touch-manipulation"
              title="공대 이름 수정"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

        <div className="flex items-center gap-1">
          {(onMoveFirst || onMoveUp || onMoveDown || onMoveLast) && (
            <div className="flex items-center gap-0.5">
              {onMoveFirst && (
                <button
                  type="button"
                  onClick={onMoveFirst}
                  className="w-7 h-7 text-[10px] leading-none rounded border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 bg-white/80 dark:bg-gray-800/80 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-purple-400 touch-manipulation"
                  title="맨 처음으로"
                >
                  ▲▲
                </button>
              )}
              {onMoveUp && (
                <button
                  type="button"
                  onClick={onMoveUp}
                  className="w-7 h-7 text-xs leading-none rounded border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 bg-white/80 dark:bg-gray-800/80 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-purple-400 touch-manipulation"
                  title="한 칸 위로"
                >
                  ▲
                </button>
              )}
              {onMoveDown && (
                <button
                  type="button"
                  onClick={onMoveDown}
                  className="w-7 h-7 text-xs leading-none rounded border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 bg-white/80 dark:bg-gray-800/80 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-purple-400 touch-manipulation"
                  title="한 칸 아래로"
                >
                  ▼
                </button>
              )}
              {onMoveLast && (
                <button
                  type="button"
                  onClick={onMoveLast}
                  className="w-7 h-7 text-[10px] leading-none rounded border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 bg-white/80 dark:bg-gray-800/80 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-purple-400 touch-manipulation"
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
              className="text-xs text-red-600 dark:text-red-400 font-medium px-2 py-2 touch-manipulation -mr-1"
            >
              삭제
            </button>
          )}
        </div>
      </div>
      {!isBlockCollapsed && (
        <div className="p-3 space-y-4">
          {selectedSlot && (
            <div className="flex items-center justify-between gap-2 py-2 px-3 rounded-lg bg-purple-100 dark:bg-purple-900/30 border border-purple-300 dark:border-purple-700">
              <span className="text-sm text-purple-800 dark:text-purple-200">
                {TEAM_LABELS[selectedSlot.team]} 팀 {selectedSlot.index + 1}번 칸에 배치할 캐릭터를
                선택하세요
              </span>
              <button
                type="button"
                onClick={() => setSelectedSlot(null)}
                className="text-xs font-medium text-purple-600 dark:text-purple-300 touch-manipulation shrink-0"
              >
                취소
              </button>
            </div>
          )}

          {!selectedSlot && (
            <p className="text-xs text-gray-500 dark:text-gray-400 px-0.5">
              빈 칸을 탭한 뒤 캐릭터를 선택하면 배치됩니다. 배치된 칸을 탭하면 해제됩니다.
            </p>
          )}

          {activeTeams.map((team) => {
            const teamCollapsed = collapsedGroups.has(team);
            return (
              <div key={team} className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => toggleGroup(team)}
                  className={`w-full flex items-center justify-between px-2 py-1 rounded ${teamColors[team]} touch-manipulation`}
                >
                  <span className="text-[11px] font-semibold">{TEAM_LABELS[team]}</span>
                  <span className="text-[11px]">{teamCollapsed ? "열기" : "접기"}</span>
                </button>
                {!teamCollapsed && (
                  <div className="grid grid-cols-2 gap-2">
                    {(slots[team] ?? Array(SLOTS_PER_TEAM).fill(null)).map((memberId, idx) => {
                      const character = memberId
                        ? members.find((m) => String(m.id) === String(memberId))
                        : null;
                      const isSelected = selectedSlot?.team === team && selectedSlot?.index === idx;
                      if (character) {
                        return (
                          <button
                            key={`${team}-${idx}`}
                            type="button"
                            onClick={() => clearSlot(team, idx)}
                            className="rounded-lg border-2 border-gray-200 dark:border-gray-600 overflow-hidden bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400 touch-manipulation min-h-[72px] flex flex-col items-stretch justify-center"
                            title="탭 시 편성 해제"
                          >
                            <CharacterCardSimpleMobile
                              character={character}
                              groups={[]}
                              parties={party ? [party] : []}
                              dense
                              className="pointer-events-none text-left"
                            />
                          </button>
                        );
                      }
                      return (
                        <button
                          key={`${team}-${idx}`}
                          type="button"
                          onClick={() => setSelectedSlot({ team, index: idx })}
                          className={`min-h-[72px] rounded-lg border-2 border-dashed flex items-center justify-center text-xs text-gray-500 dark:text-gray-400 touch-manipulation transition-colors ${
                            isSelected
                              ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300"
                              : "border-gray-300 dark:border-gray-600"
                          }`}
                        >
                          빈 칸
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              캐릭터 목록
            </h3>
            <div className="space-y-2 max-h-[40vh] overflow-y-auto">
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
                      className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => toggleGroup(groupKey)}
                        className="w-full flex items-center gap-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300 py-2 px-3 bg-gray-50 dark:bg-gray-800/50 touch-manipulation"
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
                        <span className="text-xs text-gray-500 ml-auto">{inSection.length}명</span>
                      </button>
                      {!isCollapsed && (
                        <div className="px-2 pb-2 space-y-1">
                          {adventureOrder.map((advName) => {
                            const chars = byAdventure.get(advName) ?? [];
                            if (chars.length === 0) return null;
                            return (
                              <div key={advName}>
                                <p className="text-[10px] text-gray-400 dark:text-gray-500 px-1 py-0.5">
                                  {advName}
                                </p>
                                <div className="space-y-1">
                                  {chars.map((m) => {
                                    const advKey =
                                      m.adventureId != null
                                        ? String(m.adventureId)
                                        : (m.adventureName ?? null);
                                    const isAdventurePlaced =
                                      advKey != null && placedAdventureIds.has(advKey);
                                    const isThisCharacterPlaced = assignedIds.has(m.id);
                                    const isInOtherRaid = characterIdsPlacedInOtherRaids?.has(
                                      String(m.id),
                                    );
                                    const cannotPlace =
                                      (isAdventurePlaced && !isThisCharacterPlaced) ||
                                      isInOtherRaid;
                                    const isGrayed = isAdventurePlaced || isInOtherRaid;
                                    return (
                                      <button
                                        key={m.id}
                                        type="button"
                                        onClick={() => handleCharacterTap(m)}
                                        disabled={cannotPlace || !selectedSlot}
                                        className={`w-full text-left px-2 py-2 rounded-lg text-sm border touch-manipulation ${
                                          isGrayed
                                            ? "opacity-50 bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500"
                                            : "bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 active:bg-purple-50 dark:active:bg-purple-900/20"
                                        } ${cannotPlace || !selectedSlot ? "cursor-not-allowed" : ""}`}
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
                                          {m.memo != null && m.memo !== "" ? m.memo : "메모없음"}
                                        </p>
                                      </button>
                                    );
                                  })}
                                </div>
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
        </div>
      )}
    </section>
  );
}

export default RaidFormationBlockMobile;
