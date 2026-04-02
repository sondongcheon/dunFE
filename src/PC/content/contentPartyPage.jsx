import React, { useMemo, useState, useCallback, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import RaidFormationBlock from "./components/RaidFormationBlock";
import { getPartyFormationPage, savePartyFormation } from "@/api/partyApi";

const FORMATION_SAVE_DEBOUNCE_MS = 500;

const TEAM_ORDER = ["RED", "YELLOW", "GREEN"];
const SLOTS_PER_TEAM = 4;

/** contentName에 따른 편성 팀 수 (1~3). 없으면 3 */
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
 * 파티에서 캐릭터 단위 멤버 목록 생성.
 * - 공대편성에서는 id(Long)만 사용. characterId/charactersId는 사용하지 않음.
 * - 그룹에 포함된 캐릭터를 우선 (그룹 순서대로), 그룹명 보관.
 * - 그룹 미포함 캐릭터는 adventures.characters 기준으로 추가.
 */
function getCharactersFromParty(party) {
  if (!party) return { members: [], sections: [] };

  const characterIdsInGroups = new Set(
    (party.groups ?? []).flatMap((g) =>
      (g.members ?? []).map((m) => String(m.id ?? m.characterId ?? "")).filter(Boolean),
    ),
  );

  const members = [];
  const sectionOrder = [];

  // 그룹에 포함된 캐릭터 (id(Long) 우선 사용)
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

  // 그룹 미포함 캐릭터 (adventures.characters 중 그룹에 없는 것, id(Long) 우선)
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
 * formation/page API의 characterList를 getCharactersFromParty(party)에 넣을 party 형태로 변환
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
 * 공대편성 페이지
 * 경로: /content/:contentName/party/:id
 * 팀당 4인, RED/YELLOW/GREEN 중 contentName에 따라 1~3팀 표시. 우측에 멤버 목록.
 */
function ContentPartyPage() {
  const { contentName, id: partyId } = useParams();
  const [pageLoading, setPageLoading] = useState(true);
  const [party, setParty] = useState(null);

  const { members, sectionOrder } = useMemo(() => getCharactersFromParty(party), [party]);

  const [raidKeys, setRaidKeys] = useState(() => [0]);
  const [raidNames, setRaidNames] = useState(() => ({ 0: "1공대" }));
  const [raidOrders, setRaidOrders] = useState(() => ({ 0: 1 }));
  const [slotsByRaid, setSlotsByRaid] = useState(() => ({
    0: createInitialSlots(contentName),
  }));

  /** 화면/요청 모두에서 사용할 order 기준 정렬된 raid 키 배열 */
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
            keys.reduce((acc, k) => ({ ...acc, [k]: Number(formationList[k].order) || k + 1 }), {}),
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
        if (!cancelled) console.error("[공대편성] 페이지 데이터 조회 실패", err);
      })
      .finally(() => {
        if (!cancelled) setPageLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [contentName, partyId]);

  useEffect(() => {
    if (!contentName) return;
    const initial = createInitialSlots(contentName);
    setSlotsByRaid((prev) => {
      const next = {};
      Object.keys(prev).forEach((key) => {
        next[key] = initial;
      });
      return next;
    });
  }, [contentName]);

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

  /** 공대 순서 변경 (order 기반, 위/아래 이동) */
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

  /** Request/저장용: order 기준 정렬된 공대 목록 (order: 1, 2, 3..., 순서 변경 시에도 사용) */
  const raidsForRequest = useMemo(
    () =>
      sortedRaidKeys.map((key, index) => ({
        order: raidOrders[key] ?? index + 1,
        name: raidNames[key] ?? `${index + 1}공대`,
        teams: slotsByRaid[key] ?? createInitialSlots(contentName),
      })),
    [sortedRaidKeys, raidOrders, raidNames, slotsByRaid, contentName],
  );

  /** 공대별로 "다른 공대에 이미 배치된 캐릭터 ID" 집합 (캐릭터는 어떤 공대든 한 번만 등록 가능) */
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
    }, FORMATION_SAVE_DEBOUNCE_MS);
    return () => {
      if (saveDebounceRef.current) clearTimeout(saveDebounceRef.current);
    };
  }, [raidsForRequest, contentName, partyId, party]);

  return (
    <div className="mainbody">
      <main className="w-full max-w-7xl mx-auto px-4 space-y-6">
        <div className="flex items-center gap-3 mt-2">
          <Link
            to={`/content/${contentName}`}
            className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
          >
            ← 콘텐츠로 돌아가기
          </Link>
        </div>
        <h1 className="text-2xl font-bold">공대편성 {party ? `· ${party.name}` : ""}</h1>

        {pageLoading ? (
          <p className="text-sm text-gray-500">로딩 중...</p>
        ) : !party ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">파티를 찾을 수 없습니다.</p>
        ) : (
          <>
            {/* 상단: 공대 추가 / 삭제 + 저장 상태 */}
            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={addRaid}
                className="px-3 py-1.5 text-sm font-medium rounded-lg bg-purple-600 text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                + 공대 추가
              </button>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                현재 {raidKeys.length}개 공대, 실시간 클리어 현황 집계 안되는 중 (추가예정)
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

            {/* 공대별 편성 블록 */}
            <div className="space-y-6">
              {sortedRaidKeys.map((raidKey, index) => (
                <RaidFormationBlock
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

export default ContentPartyPage;
