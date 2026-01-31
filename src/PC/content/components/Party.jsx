import React, { useState } from "react";
import EditableMemo from "./EditableMemo";
import { toServerIdForUrl } from "@/utils/serverMapping";

/**
 * Party 컴포넌트
 * - 다른 유저(모험단)를 초대해서 함께 그룹을 만드는 개념
 * - Party -> Groups -> Members 순서로 표시
 * - API 응답: parties[{ id, name, leader, adventures: [{ id, name, characters: [...] }], groups[...] }]
 *
 * @param {Array} parties - 파티 목록 (각 파티는 groups 포함)
 * @param {Array} characters - 캐릭터 목록 (내 캐릭터, 제거 버튼 판단용)
 * @param {boolean} loading - 로딩 상태
 * @param {string} currentAdventureId - 현재 로그인한 모험단 ID
 * @param {string} contentName - 콘텐츠 이름
 * @param {Function} onCreateParty - 파티 생성 핸들러
 * @param {Function} onInviteAdventure - 모험단 초대 핸들러 (partyId, adventureName)
 * @param {Function} onAddCharacterToPublicGroup - 그룹에 캐릭터 추가 핸들러
 * @param {Function} onRemoveCharacterFromPublicGroup - 그룹에서 캐릭터 제거 핸들러
 * @param {Function} onCreatePartyGroup - 파티 내 그룹 생성 핸들러 (partyId, groupName)
 * @param {Function} onRemovePartyGroup - 파티 그룹 삭제 핸들러 (partyGroupId)
 * @param {Function} onRemoveParty - 파티 삭제 핸들러 (partyId)
 * @param {Function} onJoinParty - 파티 참여 핸들러 (partyName, leaderNickname, password)
 * @param {Function} onMemoUpdate - 메모 수정 후 콜백 (characterId, memo)
 * @param {Function} onUpdatePartyName - 파티 이름 변경 핸들러 (partyId, name, contentName)
 * @param {Function} onUpdatePartyGroupName - 파티 그룹 이름 변경 핸들러 (partyGroupId, name, contentName)
 * @param {boolean} canEditMemo - 메모 편집 가능 여부 (로그인 시 true)
 */
function Party({
  parties = [],
  characters = [],
  loading = false,
  currentAdventureId,
  contentName,
  onCreateParty,
  onInviteAdventure,
  onCreatePartyGroup,
  onRemovePartyGroup,
  onRemoveParty,
  onAddCharacterToPublicGroup,
  onRemoveCharacterFromPublicGroup,
  onJoinParty,
  onMemoUpdate,
  onUpdatePartyName,
  onUpdatePartyGroupName,
  canEditMemo = false,
}) {
  const [newPartyName, setNewPartyName] = useState("");
  const [newPartyPassword, setNewPartyPassword] = useState("");
  const [createPartyPasswordError, setCreatePartyPasswordError] = useState("");
  const [joinPartyName, setJoinPartyName] = useState("");
  const [joinLeaderNickname, setJoinLeaderNickname] = useState("");
  const [joinPartyPassword, setJoinPartyPassword] = useState("");
  const [joinPartyError, setJoinPartyError] = useState("");
  const [expandedPartyIds, setExpandedPartyIds] = useState([]);
  const [expandedGroupIds, setExpandedGroupIds] = useState([]);
  const [inviteTargetPartyId, setInviteTargetPartyId] = useState(null);
  const [inviteAdventureId, setInviteAdventureId] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [addTargetGroupId, setAddTargetGroupId] = useState(null);
  const [createGroupTargetPartyId, setCreateGroupTargetPartyId] = useState(null);
  const [newPartyGroupName, setNewPartyGroupName] = useState("");
  const [editingPartyId, setEditingPartyId] = useState(null);
  const [editingPartyName, setEditingPartyName] = useState("");
  const [editingPartyGroupId, setEditingPartyGroupId] = useState(null);
  const [editingPartyGroupName, setEditingPartyGroupName] = useState("");

  // 기본 상태: 모든 파티가 펼쳐진 상태
  React.useEffect(() => {
    if (parties.length > 0 && expandedPartyIds.length === 0) {
      setExpandedPartyIds(parties.map((p) => p.id));
      // 모든 그룹도 펼쳐진 상태
      const allGroupIds = parties.flatMap((p) => (p.groups || []).map((g) => g.id));
      setExpandedGroupIds(allGroupIds);
    }
  }, [parties]);

  const handleCreateParty = () => {
    setCreatePartyPasswordError("");
    const name = newPartyName.trim();
    if (!name) return;
    // 비밀번호: 공백(없음) 또는 4자리 이내 숫자만 허용
    const password = newPartyPassword.trim();
    if (password.length > 0 && !/^\d{1,4}$/.test(password)) {
      setCreatePartyPasswordError("비밀번호는 공백이거나 4자리 이내 숫자만 입력 가능합니다.");
      return;
    }
    onCreateParty?.(name, password);
    setNewPartyName("");
    setNewPartyPassword("");
  };

  const handleInvite = async (partyId) => {
    const adventureName = inviteAdventureId.trim();
    if (!adventureName) return;
    setInviteError("");
    try {
      await onInviteAdventure?.(partyId, adventureName);
      setInviteAdventureId("");
      setInviteTargetPartyId(null);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "초대에 실패했습니다.";
      setInviteError(msg);
    }
  };

  const handleAddCharacter = (groupId, characterId) => {
    onAddCharacterToPublicGroup?.(groupId, characterId);
    setAddTargetGroupId(null);
  };

  const handleCreatePartyGroup = (partyId) => {
    const name = newPartyGroupName.trim();
    if (!name) return;
    onCreatePartyGroup?.(partyId, name);
    setNewPartyGroupName("");
    setCreateGroupTargetPartyId(null);
  };

  const handleStartPartyRename = (e, party) => {
    e.stopPropagation();
    setEditingPartyId(party.id);
    setEditingPartyName(party.name || "");
  };

  const handleSavePartyRename = async (e) => {
    e?.stopPropagation();
    if (!editingPartyId || !onUpdatePartyName) return;
    const name = editingPartyName.trim();
    if (!name) {
      setEditingPartyId(null);
      return;
    }
    try {
      await onUpdatePartyName(editingPartyId, name, contentName);
      setEditingPartyId(null);
    } catch (err) {
      console.error("파티 이름 변경 실패:", err);
    }
  };

  const handleCancelPartyRename = (e) => {
    e?.stopPropagation();
    setEditingPartyId(null);
  };

  const handleStartPartyGroupRename = (e, group) => {
    e.stopPropagation();
    setEditingPartyGroupId(group.id);
    setEditingPartyGroupName(group.name || "");
  };

  const handleSavePartyGroupRename = async (e) => {
    e?.stopPropagation();
    if (!editingPartyGroupId || !onUpdatePartyGroupName) return;
    const name = editingPartyGroupName.trim();
    if (!name) {
      setEditingPartyGroupId(null);
      return;
    }
    try {
      await onUpdatePartyGroupName(editingPartyGroupId, name, contentName);
      setEditingPartyGroupId(null);
    } catch (err) {
      console.error("파티 그룹 이름 변경 실패:", err);
    }
  };

  const handleCancelPartyGroupRename = (e) => {
    e?.stopPropagation();
    setEditingPartyGroupId(null);
  };

  const handleJoinParty = () => {
    setJoinPartyError("");
    const partyName = joinPartyName.trim();
    const leaderNickname = joinLeaderNickname.trim();
    const password = joinPartyPassword.trim();
    if (!partyName) {
      setJoinPartyError("파티 이름을 입력해주세요.");
      return;
    }
    if (!leaderNickname) {
      setJoinPartyError("리더 모험단 닉네임을 입력해주세요.");
      return;
    }
    if (password.length > 0 && !/^\d{1,4}$/.test(password)) {
      setJoinPartyError("비밀번호는 공백이거나 4자리 이내 숫자만 입력 가능합니다.");
      return;
    }
    onJoinParty?.(partyName, leaderNickname, password);
    setJoinPartyName("");
    setJoinLeaderNickname("");
    setJoinPartyPassword("");
  };

  const toggleParty = (partyId) => {
    if (expandedPartyIds.includes(partyId)) {
      setExpandedPartyIds(expandedPartyIds.filter((id) => id !== partyId));
    } else {
      setExpandedPartyIds([...expandedPartyIds, partyId]);
    }
  };

  const toggleGroup = (groupId) => {
    if (expandedGroupIds.includes(groupId)) {
      setExpandedGroupIds(expandedGroupIds.filter((id) => id !== groupId));
    } else {
      setExpandedGroupIds([...expandedGroupIds, groupId]);
    }
  };

  // 파티 내 그룹에 이미 등록된 캐릭터 ID 집합 (characterId 기준, 한 캐릭터는 파티 내 한 그룹에만 등록 가능)
  const characterIdsInPartyGroups = React.useMemo(() => {
    const set = new Set();
    parties.forEach((party) => {
      (party.groups || []).forEach((group) => {
        (group.members || []).forEach((member) => {
          const key = member.characterId ?? member.id;
          if (key != null) set.add(key);
        });
      });
    });
    return set;
  }, [parties]);

  // 해당 파티의 참여 모험단 캐릭터 중, 아직 파티 그룹에 등록되지 않은 캐릭터 목록 (모험단별 포함)
  const getAddableCharacters = (party) => {
    const adventures = party?.adventures || [];
    const flat = adventures.flatMap((adv) =>
      (adv.characters || []).map((char) => ({
        ...char,
        adventureName: adv.name,
        adventureId: adv.id,
        name: char.name ?? char.nickname ?? "",
      }))
    );
    return flat.filter((char) => {
      const key = char.characterId ?? char.id;
      return key != null && !characterIdsInPartyGroups.has(key);
    });
  };

  return (
    <div className="border-2 border-purple-200 dark:border-purple-700 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-2xl font-bold">Party</h2>
        <span className="text-xs px-2 py-1 rounded font-medium bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">
          Public
        </span>
      </div>

      {/* 파티 생성 */}
      <div className="mb-4">
        <div className="flex gap-2 flex-wrap items-center">
          <input
            type="text"
            value={newPartyName}
            onChange={(e) => setNewPartyName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreateParty()}
            placeholder="파티 이름"
            className="flex-1 min-w-[120px] px-3 py-2 text-sm border border-purple-300 dark:border-purple-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500"
          />
          <input
            type="password"
            value={newPartyPassword}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "" || /^\d{0,4}$/.test(v)) setNewPartyPassword(v);
              setCreatePartyPasswordError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && handleCreateParty()}
            placeholder="비밀번호 (선택, 4자리 숫자)"
            maxLength={4}
            inputMode="numeric"
            autoComplete="off"
            className="w-48 px-3 py-2 text-sm border border-purple-300 dark:border-purple-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500"
          />
          <button
            type="button"
            onClick={handleCreateParty}
            className="px-4 py-2 text-sm font-medium bg-purple-600 dark:bg-purple-700 text-white rounded hover:bg-purple-500 dark:hover:bg-purple-600 transition-colors"
          >
            파티 만들기
          </button>
        </div>
        {createPartyPasswordError && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">{createPartyPasswordError}</p>
        )}
      </div>

      {/* 파티 참여 (다른 사람이 만든 파티에 참여) */}
      <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-700 rounded-lg">
        <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
          다른 사람의 파티에 참여
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <input
            type="text"
            value={joinPartyName}
            onChange={(e) => {
              setJoinPartyName(e.target.value);
              setJoinPartyError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && handleJoinParty()}
            placeholder="파티 이름"
            className="flex-1 min-w-[100px] px-3 py-2 text-sm border border-purple-300 dark:border-purple-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500"
          />
          <input
            type="text"
            value={joinLeaderNickname}
            onChange={(e) => {
              setJoinLeaderNickname(e.target.value);
              setJoinPartyError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && handleJoinParty()}
            placeholder="리더 모험단 닉네임"
            className="flex-1 min-w-[100px] px-3 py-2 text-sm border border-purple-300 dark:border-purple-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500"
          />
          <input
            type="password"
            value={joinPartyPassword}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "" || /^\d{0,4}$/.test(v)) setJoinPartyPassword(v);
              setJoinPartyError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && handleJoinParty()}
            placeholder="비밀번호 (없으면 비움, 4자리 숫자)"
            maxLength={4}
            inputMode="numeric"
            autoComplete="off"
            className="w-28 px-3 py-2 text-sm border border-purple-300 dark:border-purple-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500"
          />
          <button
            type="button"
            onClick={handleJoinParty}
            disabled={!joinPartyName.trim() || !joinLeaderNickname.trim()}
            className="px-4 py-2 text-sm font-medium bg-purple-500 dark:bg-purple-600 text-white rounded hover:bg-purple-400 dark:hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            참여하기
          </button>
        </div>
        {joinPartyError && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">{joinPartyError}</p>
        )}
      </div>

      {/* 파티 목록 */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-sm text-gray-500 dark:text-gray-400 py-4">
            파티 목록을 불러오는 중...
          </div>
        ) : parties.length === 0 ? (
          <div className="text-sm text-gray-500 dark:text-gray-400 py-4">
            생성된 파티가 없습니다. 위에서 파티를 만들어 다른 모험단을 초대해보세요.
          </div>
        ) : (
          parties.map((party) => {
            const isPartyExpanded = expandedPartyIds.includes(party.id);
            const isInviting = inviteTargetPartyId === party.id;
            const isMyParty = party.leader === true;
            const partyGroups = party.groups || [];
            const memberCount = partyGroups.reduce((acc, g) => acc + (g.members?.length || 0), 0);

            return (
              <div
                key={party.id}
                className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg overflow-hidden"
              >
                {/* 파티 헤더 */}
                <div
                  className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors"
                  onClick={() => {
                    if (editingPartyId === party.id) return;
                    toggleParty(party.id);
                  }}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {editingPartyId === party.id ? (
                      <div className="flex items-center gap-1 flex-1" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editingPartyName}
                          onChange={(e) => setEditingPartyName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSavePartyRename();
                            if (e.key === "Escape") handleCancelPartyRename();
                          }}
                          onBlur={handleSavePartyRename}
                          autoFocus
                          className="flex-1 min-w-0 px-2 py-1 text-sm border border-purple-300 dark:border-purple-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={handleCancelPartyRename}
                          className="text-xs text-gray-500 hover:underline"
                        >
                          취소
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          🎉 {party.name}
                        </span>
                        {party.hasPassword && (
                          <span className="text-xs flex-shrink-0" title="비밀번호 있음">
                            🔒
                          </span>
                        )}
                        {isMyParty && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-purple-200 dark:bg-purple-800 text-purple-700 dark:text-purple-300 flex-shrink-0">
                            리더
                          </span>
                        )}
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                          (그룹 {partyGroups.length}개 · 멤버 {memberCount}명)
                        </span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {isMyParty && onUpdatePartyName && editingPartyId !== party.id && (
                      <button
                        type="button"
                        onClick={(e) => handleStartPartyRename(e, party)}
                        className="text-xs text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 hover:underline"
                      >
                        파티 이름 변경
                      </button>
                    )}
                    {isMyParty && onRemoveParty && editingPartyId !== party.id && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`"${party.name}" 파티를 삭제하시겠습니까?\n파티 내 모든 그룹과 멤버가 삭제됩니다.`)) {
                            onRemoveParty(party.id);
                          }
                        }}
                        className="text-xs text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:underline"
                      >
                        파티 삭제
                      </button>
                    )}
                    <span className="text-xs text-gray-500">{isPartyExpanded ? "▲" : "▼"}</span>
                  </div>
                </div>

                {isPartyExpanded && (
                  <div className="border-t border-purple-200 dark:border-purple-700 px-3 py-3 space-y-3">
                    {/* 참여 모험단 목록 (adventures: [{ id, name, characters }]) */}
                    {party.adventures && party.adventures.length > 0 && (
                      <div className="mb-3">
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                          참여 모험단
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {party.adventures.map((adv) => {
                            const currentAdventureId = localStorage.getItem("adventureId");
                            const currentAdventureName = localStorage.getItem("adventureName");
                            const isMe =
                              (currentAdventureId != null && String(adv.id) === String(currentAdventureId)) ||
                              (currentAdventureName != null && adv.name === currentAdventureName);
                            return (
                              <span
                                key={adv.id ?? adv.name}
                                className={`text-xs px-2 py-1 rounded ${
                                  isMe
                                    ? "bg-purple-200 dark:bg-purple-800 text-purple-700 dark:text-purple-300"
                                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                                }`}
                              >
                                {adv.name}
                                {isMe && " (나)"}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* 모험단 초대 (리더인 경우에만) */}
                    {isMyParty && (
                      <div className="mb-3">
                        {isInviting ? (
                          <>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={inviteAdventureId}
                                onChange={(e) => setInviteAdventureId(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleInvite(party.id)}
                                placeholder="초대할 모험단 이름"
                                className="flex-1 px-2 py-1 text-xs border border-purple-300 dark:border-purple-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500"
                                onClick={(e) => e.stopPropagation()}
                              />
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleInvite(party.id);
                                }}
                                className="px-2 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-500"
                              >
                                초대
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setInviteTargetPartyId(null);
                                  setInviteAdventureId("");
                                  setInviteError("");
                                }}
                                className="px-2 py-1 text-xs text-gray-500 hover:underline"
                              >
                                취소
                              </button>
                            </div>
                            {inviteError && (
                              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{inviteError}</p>
                            )}
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setInviteTargetPartyId(party.id);
                              setInviteError("");
                            }}
                            className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
                          >
                            + 모험단 초대
                          </button>
                        )}
                      </div>
                    )}

                    {/* Groups (Party 내 그룹) */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          Groups
                        </div>
                        {createGroupTargetPartyId === party.id ? (
                          <div
                            className="flex gap-2 items-center"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="text"
                              value={newPartyGroupName}
                              onChange={(e) => setNewPartyGroupName(e.target.value)}
                              onKeyDown={(e) =>
                                e.key === "Enter" && handleCreatePartyGroup(party.id)
                              }
                              placeholder="그룹 이름"
                              className="w-40 px-2 py-1 text-xs border border-purple-300 dark:border-purple-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500"
                            />
                            <button
                              type="button"
                              onClick={() => handleCreatePartyGroup(party.id)}
                              disabled={!newPartyGroupName.trim()}
                              className="px-2 py-1 text-xs font-medium bg-purple-600 text-white rounded hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              만들기
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setCreateGroupTargetPartyId(null);
                                setNewPartyGroupName("");
                              }}
                              className="px-2 py-1 text-xs text-gray-500 hover:underline"
                            >
                              취소
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCreateGroupTargetPartyId(party.id);
                            }}
                            className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
                          >
                            + 그룹 만들기
                          </button>
                        )}
                      </div>
                      {partyGroups.length === 0 && createGroupTargetPartyId !== party.id ? (
                        <div className="text-xs text-gray-500 dark:text-gray-400 py-2">
                          아직 그룹이 없습니다.
                        </div>
                      ) : partyGroups.length > 0 ? (
                        partyGroups.map((group) => {
                          const isGroupExpanded = expandedGroupIds.includes(group.id);
                          const isAddingToGroup = addTargetGroupId === group.id;
                          const members = group.members || [];
                          const addableCharacters = getAddableCharacters(party);
                          const myCharacterIds = new Set(characters.map((c) => c.id));

                          return (
                            <div
                              key={group.id}
                              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                            >
                              {/* 그룹 헤더 */}
                              <div
                                className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                onClick={(e) => {
                                  if (editingPartyGroupId === group.id) return;
                                  e.stopPropagation();
                                  toggleGroup(group.id);
                                }}
                              >
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  {editingPartyGroupId === group.id ? (
                                    <div className="flex items-center gap-1 flex-1" onClick={(e) => e.stopPropagation()}>
                                      <input
                                        type="text"
                                        value={editingPartyGroupName}
                                        onChange={(e) => setEditingPartyGroupName(e.target.value)}
                                        onKeyDown={(e) => {
                                          if (e.key === "Enter") handleSavePartyGroupRename();
                                          if (e.key === "Escape") handleCancelPartyGroupRename();
                                        }}
                                        onBlur={handleSavePartyGroupRename}
                                        autoFocus
                                        className="flex-1 min-w-0 px-2 py-1 text-sm border border-purple-300 dark:border-purple-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                      />
                                      <button
                                        type="button"
                                        onClick={handleCancelPartyGroupRename}
                                        className="text-xs text-gray-500 hover:underline"
                                      >
                                        취소
                                      </button>
                                    </div>
                                  ) : (
                                    <>
                                      <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                        {group.name}
                                      </span>
                                      <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                                        (멤버 {members.length}명)
                                      </span>
                                    </>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 flex-shrink-0">
                                  {onUpdatePartyGroupName && editingPartyGroupId !== group.id && (
                                    <button
                                      type="button"
                                      onClick={(e) => handleStartPartyGroupRename(e, group)}
                                      className="text-xs text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 hover:underline"
                                    >
                                      파티 그룹 이름 변경
                                    </button>
                                  )}
                                  {onRemovePartyGroup && editingPartyGroupId !== group.id && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (window.confirm(`"${group.name}" 그룹을 삭제하시겠습니까?`)) {
                                          onRemovePartyGroup(group.id);
                                        }
                                      }}
                                      className="text-xs text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:underline"
                                    >
                                      파티 그룹 삭제
                                    </button>
                                  )}
                                  <span className="text-xs text-gray-500">
                                    {isGroupExpanded ? "▲" : "▼"}
                                  </span>
                                </div>
                              </div>

                              {isGroupExpanded && (
                                <div className="border-t border-gray-200 dark:border-gray-700 px-3 py-3 space-y-3">
                                  {/* 등록된 멤버 */}
                                    <div>
                                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                                      등록된 캐릭터
                                    </div>
                                    {members.length === 0 ? (
                                      <div className="text-xs text-gray-500 dark:text-gray-400 py-2">
                                        없음
                                      </div>
                                    ) : (
                                      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                        {members.map((member) => {
                                          // member.id: 내 데이터의 내부 ID, member.characterId: 네오플 ID
                                          const myInternalId = member.id ?? member.characterId;
                                          const neopleCharacterId = member.characterId ?? member.id;
                                          const isMyCharacter = myCharacterIds.has(member.id);
                                          const charFromList = characters.find(
                                            (c) => c.id === member.id || c.characterId === member.characterId
                                          );
                                          const displayValue =
                                            member.fame ?? member.value ?? charFromList?.value ?? 0;
                                          const rawClearState =
                                            member.clearState ?? member.clear_state;
                                          const displayClearState =
                                            typeof rawClearState === "boolean"
                                              ? rawClearState
                                              : charFromList?.clearState;
                                          const displayMemo =
                                            member.memo ?? charFromList?.memo ?? null;
                                          const displayImage =
                                            member.img ?? member.image ?? charFromList?.image ?? null;
                                          const isClear = typeof displayClearState === "boolean" && displayClearState;
                                          return (
                                            <div
                                              key={myInternalId ?? neopleCharacterId ?? `member-${members.indexOf(member)}`}
                                              className={`relative flex gap-4 p-4 rounded-xl shadow-sm transition-all duration-200 ${
                                                isClear
                                                  ? "bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-600 hover:shadow-md hover:border-green-400 dark:hover:border-green-500"
                                                  : "bg-amber-50/80 dark:bg-amber-900/15 border-2 border-amber-200 dark:border-amber-800 hover:shadow-md hover:border-amber-300 dark:hover:border-amber-700"
                                              }`}
                                            >
                                              <div className="flex flex-col items-center flex-shrink-0">
                                                <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 ring-2 ring-gray-100 dark:ring-gray-600">
                                                  <span className="absolute inset-0 flex items-center justify-center text-xl sm:text-2xl font-bold text-gray-500 dark:text-gray-400">
                                                    {(member.nickname ?? "").charAt(0) || "?"}
                                                  </span>
                                                  {displayImage && (
                                                    <img
                                                      src={displayImage}
                                                      alt={member.nickname ?? ""}
                                                      className="relative w-full h-full object-cover object-[center_100%] scale-125"
                                                      onError={(e) => { e.target.style.display = "none"; }}
                                                    />
                                                  )}
                                                </div>
                                                {(member.job || charFromList?.job) && (
                                                  <span className="text-xs font-bold text-gray-900 dark:text-white mt-2 text-center truncate max-w-[4rem] sm:max-w-[4.5rem]">
                                                    {member.job ?? charFromList?.job}
                                                  </span>
                                                )}
                                                <div className="mt-2 flex items-center justify-center gap-1 flex-wrap">
                                                  <button
                                                    type="button"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      onRemoveCharacterFromPublicGroup?.(
                                                        group.id,
                                                        member.id ?? member.characterId,
                                                        contentName
                                                      );
                                                    }}
                                                    className="text-[10px] px-1.5 py-0.5 text-red-600 dark:text-red-400 hover:underline"
                                                  >
                                                    제거
                                                  </button>
                                                  {(neopleCharacterId ?? charFromList?.characterId) && (member.server ?? charFromList?.server) && (
                                                    <a
                                                      href={`https://dundam.xyz/character?server=${toServerIdForUrl(member.server ?? charFromList?.server ?? "")}&key=${neopleCharacterId ?? charFromList?.characterId ?? ""}`}
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                      className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 whitespace-nowrap"
                                                    >
                                                      던담이동
                                                    </a>
                                                  )}
                                                </div>
                                              </div>
                                              <div className="flex-1 min-w-0">
                                                <div className="w-full text-center mb-2">
                                                  <span className="text-lg font-semibold text-gray-900 dark:text-white block truncate">
                                                    {member.nickname ?? ""}
                                                  </span>
                                                </div>
                                                {(member.adventureName || member.server) && (
                                                  <div className="text-xs text-center mb-2 flex flex-wrap justify-center items-center gap-x-1.5">
                                                    {member.adventureName && (
                                                      <span className="text-purple-600 dark:text-purple-400">
                                                        ({member.adventureName})
                                                      </span>
                                                    )}
                                                    {member.server && (
                                                      <span className="text-gray-500 dark:text-gray-400">
                                                        [{member.server}]
                                                      </span>
                                                    )}
                                                  </div>
                                                )}
                                                <div className="flex flex-wrap items-center justify-center gap-1.5 mb-2">
                                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    명성 {displayValue}
                                                  </span>
                                                </div>
                                                <div className="text-center">
                                                  <EditableMemo
                                                    characterId={member.id ?? member.characterId}
                                                    memo={displayMemo}
                                                    onSave={onMemoUpdate}
                                                    disabled={!canEditMemo || !isMyCharacter}
                                                    className="block truncate"
                                                  />
                                                </div>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>

                                  {/* 캐릭터 추가 */}
                                  <div>
                                    {isAddingToGroup ? (
                                      <div className="space-y-1">
                                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                          캐릭터 선택
                                        </div>
                                        {addableCharacters.length === 0 ? (
                                          <div className="text-xs text-gray-500 dark:text-gray-400 py-2">
                                            추가 가능한 캐릭터가 없습니다.
                                          </div>
                                        ) : (
                                          <div className="flex flex-wrap gap-1">
                                            {addableCharacters.map((char) => (
                                              <button
                                                key={char.characterId ?? char.id}
                                                type="button"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleAddCharacter(group.id, char.id);
                                                }}
                                                className="px-2 py-1 text-xs bg-purple-100 dark:bg-purple-800 rounded hover:bg-purple-200 dark:hover:bg-purple-700 text-purple-700 dark:text-purple-300"
                                                title={char.adventureName ? `${char.name} (${char.adventureName})` : char.name}
                                              >
                                                {char.adventureName ? `${char.name} (${char.adventureName})` : char.name}
                                              </button>
                                            ))}
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setAddTargetGroupId(null);
                                              }}
                                              className="px-2 py-1 text-xs text-gray-500 hover:underline"
                                            >
                                              취소
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setAddTargetGroupId(group.id);
                                        }}
                                        className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
                                      >
                                        + 캐릭터 추가
                                      </button>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })
                      ) : null}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Party;
