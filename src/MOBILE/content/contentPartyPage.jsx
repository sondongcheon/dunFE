import React, { useMemo, useState, useCallback, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPartyFormationPage, savePartyFormation } from "@/api/partyApi";
import RaidFormationBlockMobile from "./components/RaidFormationBlockMobile";

const TEAM_ORDER = ["RED", "YELLOW", "GREEN"];
const SLOTS_PER_TEAM = 4;

const getTeamCountByContent = (contentName) => {
  const map = {
    azure_main: 2,
    goddess_of_death_temple: 3,
    freed_nightmare: 3,
    star_turtle_grand_library: 3,
    heretics_castle: 3,
    venus_goddess_of_beauty: 2,
    nabel: 1,
    inae: 2,
    diregie: 3,
  };
  return map[contentName] ?? 3;
};

const createInitialSlots = (contentName) => {
  const initial = {};
  TEAM_ORDER.slice(0, getTeamCountByContent(contentName)).forEach((team) => {
    initial[team] = Array(SLOTS_PER_TEAM).fill(null);
  });
  return initial;
};

/**
 * 파티에서 캐릭터 단위 멤버 목록 생성. (PC와 동일)
 */
function getCharactersFromParty(party) {
  if (!party) return { members: [], sectionOrder: [] };

  const characterIdsInGroups = new Set(
    (party.groups ?? []).flatMap((g) =>
      (g.members ?? []).map((m) => String(m.id ?? m.characterId ?? "")).filter(Boolean),
    ),
  );

  const members = [];
  const sectionOrder = [];

  (party.groups ?? []).forEach((group) => {
    const groupChars = (group.members ?? []).map((m) => {
      const id = String(m.id ?? m.characterId ?? "");
      const name = m.name ?? m.nickname ?? "알 수 없음";
      const adventureId = m.adventureId ?? m.adventureName ?? null;
      const adventureName =
        m.adventureName ?? (m.adventureId != null ? String(m.adventureId) : null) ?? "알 수 없음";
      return {
        ...m,
        id,
        name,
        groupName: group.name,
        adventureId,
        adventureName,
        image: m.image ?? m.img,
        value: m.value ?? m.fame,
      };
    });
    groupChars.forEach((c) => members.push(c));
    if (groupChars.length > 0) sectionOrder.push({ label: group.name, groupName: group.name });
  });

  const ungroupedRaw = (party.adventures ?? []).flatMap((adv) =>
    (adv.characters ?? []).map((c) => ({
      ...c,
      id: String(c.id ?? c.characterId ?? ""),
      name: c.name ?? c.nickname ?? "알 수 없음",
      groupName: null,
      adventureId: adv.id ?? null,
      adventureName: adv.name ?? "알 수 없음",
      image: c.image ?? c.img,
      value: c.value ?? c.fame,
    })),
  );
  const ungrouped = ungroupedRaw.filter((c) => c.id && !characterIdsInGroups.has(c.id));
  const byId = new Map(ungrouped.map((c) => [c.id, c]));
  byId.forEach((c) => members.push(c));
  if (ungrouped.length > 0) sectionOrder.push({ label: "그룹 미포함", groupName: null });

  return { members, sectionOrder };
}

/**
 * formation/page API의 characterList를 getCharactersFromParty(party)에 넣을 party 형태로 변환 (PC와 동일)
 */
function normalizeCharacterListToParty(characterList) {
  if (!characterList) return null;
  const groups = Object.values(characterList.groups || {}).map((g) => ({
    id: g.id,
    name: g.name,
    members: (g.members || []).map((m) => ({
      ...m,
      name: m.characterName ?? m.name,
      image: m.img ?? m.image,
      value: m.fame ?? m.value,
    })),
  }));
  const adventures = Object.values(characterList.adventures || {}).map((adv) => ({
    id: adv.id,
    name: adv.name,
    characters: (adv.characters || []).map((c) => ({
      ...c,
      image: c.img ?? c.image,
      value: c.fame ?? c.value,
    })),
  }));
  return {
    id: characterList.id,
    name: characterList.name,
    leader: characterList.leader,
    groups,
    adventures,
  };
}

/**
 * 공대편성 페이지 (모바일)
 * - 터치: 빈 칸 탭 → 캐릭터 탭으로 배치. 배치된 칸 탭 시 해제.
 * - 공대 추가/삭제, 공대별 이름 지정 지원.
 * - PC 버전과 동일하게 formation/page API + 자동 저장 사용.
 */
function MobileContentPartyPage() {
  const { contentName, id: partyId } = useParams();
  const navigate = useNavigate();

  const [pageLoading, setPageLoading] = useState(true);
  const [party, setParty] = useState(null);

  const { members, sectionOrder } = useMemo(() => getCharactersFromParty(party), [party]);

  const [raidKeys, setRaidKeys] = useState(() => [0]);
  const [raidNames, setRaidNames] = useState(() => ({ 0: "1공대" }));
  const [raidOrders, setRaidOrders] = useState(() => ({ 0: 1 }));
  const [slotsByRaid, setSlotsByRaid] = useState(() => ({
    0: createInitialSlots(contentName),
  }));

  /** 화면/요청 공통 order 정렬용 키 배열 */
  const sortedRaidKeys = useMemo(
    () => [...raidKeys].sort((a, b) => (raidOrders[a] ?? 0) - (raidOrders[b] ?? 0)),
    [raidKeys, raidOrders],
  );

  /** formation/page API로 첫 로딩 (characterList + formationList 한 번에) */
  useEffect(() => {
    if (!contentName || !partyId) {
      setPageLoading(false);
      return;
    }
    setPageLoading(true);
    let cancelled = false;
    getPartyFormationPage(contentName, partyId, 1)
      .then((data) => {
        if (cancelled) return;
        const characterList = data?.characterList;
        const formationList = data?.formationList;
        const normalizedParty = normalizeCharacterListToParty(characterList);
        setParty(normalizedParty ?? null);
        if (Array.isArray(formationList) && formationList.length > 0) {
          const keys = formationList.map((_, i) => i);
          const pad4 = (arr) =>
            Array.from({ length: 4 }, (_, i) => {
              const v = (arr || [])[i];
              return v != null ? String(v) : null;
            });
          setRaidKeys(keys);
          setRaidNames(
            keys.reduce((acc, k) => ({ ...acc, [k]: formationList[k].name ?? `${k + 1}공대` }), {}),
          );
          setRaidOrders(
            keys.reduce(
              (acc, k) => ({ ...acc, [k]: Number(formationList[k].order) || k + 1 }),
              {},
            ),
          );
          setSlotsByRaid(
            keys.reduce(
              (acc, k) => ({
                ...acc,
                [k]: {
                  RED: pad4(formationList[k].teams?.red),
                  YELLOW: pad4(formationList[k].teams?.yellow),
                  GREEN: pad4(formationList[k].teams?.green),
                },
              }),
              {},
            ),
          );
        }
      })
      .catch((err) => {
        if (!cancelled) console.error("[공대편성][모바일] 페이지 데이터 조회 실패", err);
      })
      .finally(() => {
        if (!cancelled) setPageLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [contentName, partyId]);

  const addRaid = useCallback(() => {
    const newKey = raidKeys.length;
    const newOrder = raidKeys.length + 1;
    setRaidKeys((prev) => [...prev, newKey]);
    setRaidNames((prev) => ({ ...prev, [newKey]: `${newOrder}공대` }));
    setRaidOrders((prev) => ({ ...prev, [newKey]: newOrder }));
    setSlotsByRaid((prev) => ({ ...prev, [newKey]: createInitialSlots(contentName) }));
  }, [raidKeys.length, contentName]);

  const removeRaid = useCallback(
    (key) => {
      if (raidKeys.length <= 1) return;
      const remainingKeys = raidKeys.filter((k) => k !== key);
      setRaidKeys(() => remainingKeys);
      setRaidNames((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      setRaidOrders(() => {
        const next = {};
        remainingKeys.forEach((k, i) => {
          next[k] = i + 1;
        });
        return next;
      });
      setSlotsByRaid((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    },
    [raidKeys],
  );

  /** 공대 순서 변경 (order 기반, 위/아래/맨앞/맨뒤 이동) */
  const moveRaid = useCallback(
    (fromIndex, toIndex) => {
      setRaidOrders((prev) => {
        const current = [...sortedRaidKeys];
        if (toIndex < 0 || toIndex >= current.length) return prev;
        const nextOrderKeys = [...current];
        const [moved] = nextOrderKeys.splice(fromIndex, 1);
        nextOrderKeys.splice(toIndex, 0, moved);
        const next = { ...prev };
        nextOrderKeys.forEach((key, idx) => {
          next[key] = idx + 1;
        });
        return next;
      });
    },
    [sortedRaidKeys],
  );

  /** Request/저장용: order 기준 정렬된 공대 목록 (order: 1, 2, 3...) */
  const raidsForRequest = useMemo(
    () =>
      sortedRaidKeys.map((key, index) => ({
        order: raidOrders[key] ?? index + 1,
        name: raidNames[key] ?? `${index + 1}공대`,
        teams: slotsByRaid[key] ?? createInitialSlots(contentName),
      })),
    [sortedRaidKeys, raidOrders, raidNames, slotsByRaid, contentName],
  );

  const characterIdsInOtherRaids = useMemo(() => {
    const map = {};
    raidKeys.forEach((rk) => {
      const set = new Set();
      raidKeys
        .filter((k) => k !== rk)
        .forEach((otherKey) => {
          const s = slotsByRaid[otherKey] ?? {};
          TEAM_ORDER.forEach((team) => {
            (s[team] ?? []).forEach((id) => {
              if (id) set.add(String(id));
            });
          });
        });
      map[rk] = set;
    });
    return map;
  }, [raidKeys, slotsByRaid]);

  const isFirstMountRef = useRef(true);
  const saveDebounceRef = useRef(null);
  const [savingStatus, setSavingStatus] = useState(null);

  /** 편성 변경 시 자동 저장 (디바운스) */
  useEffect(() => {
    if (!partyId || !contentName || !party) return;
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      return;
    }
    if (saveDebounceRef.current) clearTimeout(saveDebounceRef.current);
    saveDebounceRef.current = setTimeout(() => {
      setSavingStatus("saving");
      savePartyFormation(contentName, partyId, raidsForRequest)
        .then(() => {
          setSavingStatus("saved");
          setTimeout(() => setSavingStatus(null), 2000);
        })
        .catch(() => {
          setSavingStatus("error");
        });
      saveDebounceRef.current = null;
    }, 500);
    return () => {
      if (saveDebounceRef.current) clearTimeout(saveDebounceRef.current);
    };
  }, [raidsForRequest, contentName, partyId, party]);

  return (
    <div className="mainMobileBody pb-24">
      <header
        className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="flex items-center h-12 px-2 max-w-[480px] mx-auto gap-2">
          <button
            type="button"
            onClick={() => navigate(`/content/${contentName}`)}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-600 dark:text-gray-400 touch-manipulation text-2xl -ml-1"
            aria-label="뒤로"
          >
            ‹
          </button>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate flex-1">
            공대편성 {party ? `· ${party.name}` : ""}
          </h1>
        </div>
      </header>

      <main className="px-3 py-4 max-w-[480px] mx-auto space-y-4">
        {pageLoading ? (
          <p className="text-sm text-gray-500 py-4">로딩 중...</p>
        ) : !party ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 py-4">
            파티를 찾을 수 없습니다. 콘텐츠 상세에서 [공대편성]으로 들어와 주세요.
          </p>
        ) : (
          <>
            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={addRaid}
                className="px-4 py-2.5 text-sm font-medium rounded-xl bg-purple-600 text-white active:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 touch-manipulation"
              >
                + 공대 추가
              </button>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                현재 {raidKeys.length}개 공대
              </span>
              {savingStatus === "saving" && (
                <span className="text-xs text-amber-600 dark:text-amber-400">저장 중…</span>
              )}
              {savingStatus === "saved" && (
                <span className="text-xs text-green-600 dark:text-green-400">저장됨</span>
              )}
              {savingStatus === "error" && (
                <span className="text-xs text-red-600 dark:text-red-400">저장 실패</span>
              )}
            </div>

            <div className="space-y-4">
              {sortedRaidKeys.map((raidKey, index) => (
                <RaidFormationBlockMobile
                  key={raidKey}
                  raidLabel={raidNames[raidKey] ?? `${index + 1}공대`}
                  onRaidNameChange={(name) =>
                    setRaidNames((prev) => ({ ...prev, [raidKey]: name || `${index + 1}공대` }))
                  }
                  party={party}
                  members={members}
                  sectionOrder={sectionOrder}
                  contentName={contentName}
                  slots={slotsByRaid[raidKey] ?? createInitialSlots(contentName)}
                  onSlotsChange={(updater) =>
                    setSlotsByRaid((prev) => ({
                      ...prev,
                      [raidKey]: updater(prev[raidKey] ?? createInitialSlots(contentName)),
                    }))
                  }
                  characterIdsPlacedInOtherRaids={characterIdsInOtherRaids[raidKey] ?? new Set()}
                  onRemove={raidKeys.length > 1 ? () => removeRaid(raidKey) : undefined}
                  onMoveFirst={index > 0 ? () => moveRaid(index, 0) : undefined}
                  onMoveUp={index > 0 ? () => moveRaid(index, index - 1) : undefined}
                  onMoveDown={
                    index < sortedRaidKeys.length - 1 ? () => moveRaid(index, index + 1) : undefined
                  }
                  onMoveLast={
                    index < sortedRaidKeys.length - 1
                      ? () => moveRaid(index, sortedRaidKeys.length - 1)
                      : undefined
                  }
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default MobileContentPartyPage;
