import React, { useState } from "react";
import EditableMemo from "./EditableMemo";
import { toServerIdForUrl } from "@/utils/serverMapping";

/**
 * Group 컴포넌트
 * - 그룹 생성 (API 호출)
 * - 그룹 목록 표시 (내가 가진 그룹 + 내 캐릭터가 속한 그룹)
 * - 그룹에 캐릭터 등록 / 등록 해제
 * @param {Function} onRemoveGroup - private 그룹 제거 핸들러 (groupId)
 */
function Group({
  groups = [],
  characters = [],
  loading = false,
  currentAdventureId,
  contentName,
  onCreateGroup,
  onAddCharacter,
  onRemoveCharacter,
  onMemoUpdate,
  onUpdateGroupName,
  onRemoveGroup,
  canEditMemo = false,
}) {
  const [sectionExpanded, setSectionExpanded] = useState(true);
  const [newGroupName, setNewGroupName] = useState("");
  const [expandedIds, setExpandedIds] = useState([]);
  const [addTargetGroupId, setAddTargetGroupId] = useState(null);
  const [editingGroupId, setEditingGroupId] = useState(null);
  const [editingGroupName, setEditingGroupName] = useState("");
  
  // 기본 상태: 모든 그룹이 펼쳐진 상태
  React.useEffect(() => {
    if (groups.length > 0 && expandedIds.length === 0) {
      setExpandedIds(groups.map(g => g.id));
    }
  }, [groups]);

  const handleCreate = () => {
    const name = newGroupName.trim();
    if (!name) return;
    onCreateGroup(name);
    setNewGroupName("");
  };

  const handleAdd = (groupId, characterId) => {
    onAddCharacter(groupId, characterId);
    setAddTargetGroupId(null);
  };

  const handleStartRename = (e, group) => {
    e.stopPropagation();
    setEditingGroupId(group.id);
    setEditingGroupName(group.name || "");
  };

  const handleSaveRename = async (e) => {
    e?.stopPropagation();
    if (!editingGroupId || !onUpdateGroupName) return;
    const name = editingGroupName.trim();
    if (!name) {
      setEditingGroupId(null);
      return;
    }
    try {
      await onUpdateGroupName(editingGroupId, name, contentName);
      setEditingGroupId(null);
    } catch (err) {
      console.error("그룹명 변경 실패:", err);
    }
  };

  const handleCancelRename = (e) => {
    e?.stopPropagation();
    setEditingGroupId(null);
  };

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
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold">Group</h2>
          <span className="text-xs px-2 py-1 rounded font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
            Private
          </span>
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {sectionExpanded ? "▼" : "▲"}
        </span>
      </div>

      {sectionExpanded && (
      <>
      {/* 그룹 생성 */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          placeholder="그룹 이름"
          className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500"
        />
        <button
          type="button"
          onClick={handleCreate}
          className="px-4 py-2 text-sm font-medium bg-gray-800 dark:bg-gray-700 text-white rounded hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
        >
          그룹 만들기
        </button>
      </div>

      {/* 그룹 목록 */}
      <div className="space-y-2">
        {loading ? (
          <div className="text-sm text-gray-500 dark:text-gray-400 py-4">
            그룹 목록을 불러오는 중...
          </div>
        ) : groups.length === 0 ? (
          <div className="text-sm text-gray-500 dark:text-gray-400 py-4">
            생성된 그룹이 없습니다. 위에서 그룹을 만들어 보세요.
          </div>
        ) : (
          groups.map((group) => {
            const isExpanded = expandedIds.includes(group.id);
            const isAdding = addTargetGroupId === group.id;
            
            // groupNum이 group.id와 일치하는 캐릭터들을 해당 그룹의 멤버로 간주
            const members = characters.filter((char) => 
              char.groupNum !== null && char.groupNum !== undefined && 
              char.groupNum === group.id
            );
            const memberIds = new Set(members.map((m) => m.id));
            
            // 그룹에 속하지 않은 캐릭터들 (groupNum이 null이거나 undefined인 경우만)
            // 중복 그룹은 허용하지 않으므로 이미 어떤 그룹에든 속해있는 캐릭터는 제외
            const addable = characters.filter((char) => 
              char.groupNum === null || char.groupNum === undefined
            );
            
            // 그룹 타입 표시
            const groupType = group.isMyGroup 
              ? "내 그룹" 
              : group.hasMyCharacters 
                ? "내 캐릭터가 속한 그룹" 
                : null;

            return (
              <div
                key={group.id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
              >
                <div
                  className="flex flex-col gap-y-1 md:flex-row md:flex-wrap md:items-center md:justify-between px-3 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => {
                    if (editingGroupId === group.id) return;
                    if (isExpanded) {
                      setExpandedIds(expandedIds.filter(id => id !== group.id));
                    } else {
                      setExpandedIds([...expandedIds, group.id]);
                    }
                  }}
                >
                  {/* 이름 + 배지 + 인원 (모바일 1줄, PC 동일 줄) */}
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {editingGroupId === group.id ? (
                      <div className="flex items-center gap-1 flex-1 min-w-0" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editingGroupName}
                          onChange={(e) => setEditingGroupName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveRename();
                            if (e.key === "Escape") handleCancelRename();
                          }}
                          onBlur={handleSaveRename}
                          autoFocus
                          className="flex-1 min-w-0 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={handleCancelRename}
                          className="text-xs text-gray-500 hover:underline whitespace-nowrap"
                        >
                          취소
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {group.name}
                        </span>
                        {groupType && (
                          <span className={`text-xs px-1.5 py-0.5 rounded flex-shrink-0 ${
                            group.isMyGroup
                              ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                              : "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                          }`}>
                            {groupType}
                          </span>
                        )}
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                          (캐릭터 {members.length}명)
                        </span>
                      </>
                    )}
                  </div>
                  {/* 이름변경, 제거, 접기 (모바일 2줄, PC 한 줄) */}
                  <div className="flex items-center gap-2 mt-1 md:mt-0 flex-shrink-0 md:ml-auto">
                    {group.isMyGroup && onUpdateGroupName && editingGroupId !== group.id && (
                      <button
                        type="button"
                        onClick={(e) => handleStartRename(e, group)}
                        className="text-xs text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:underline whitespace-nowrap"
                      >
                        그룹 이름 변경
                      </button>
                    )}
                    {group.isMyGroup && onRemoveGroup && editingGroupId !== group.id && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`"${group.name}" 그룹을 제거하시겠습니까?\n그룹 내 캐릭터 등록이 해제됩니다.`)) {
                            onRemoveGroup(group.id);
                          }
                        }}
                        className="text-xs text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:underline whitespace-nowrap"
                      >
                        그룹 제거
                      </button>
                    )}
                    <span className="text-xs text-gray-500 ml-auto">
                      {isExpanded ? "▲" : "▼"}
                    </span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-200 dark:border-gray-700 px-3 py-3 space-y-3">
                    {/* 등록된 캐릭터 */}
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
                          {members.map((char) => (
                            <div
                              key={char.id}
                              className={`relative flex gap-4 p-4 rounded-xl shadow-sm transition-all duration-200 ${
                                char.clearState
                                  ? "bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-600 hover:shadow-md hover:border-green-400 dark:hover:border-green-500"
                                  : "bg-amber-50/80 dark:bg-amber-900/15 border-2 border-amber-200 dark:border-amber-800 hover:shadow-md hover:border-amber-300 dark:hover:border-amber-700"
                              }`}
                            >
                              <div className="flex flex-col items-center flex-shrink-0">
                                <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 ring-2 ring-gray-100 dark:ring-gray-600">
                                  <span className="absolute inset-0 flex items-center justify-center text-xl sm:text-2xl font-bold text-gray-500 dark:text-gray-400">
                                    {char.name.charAt(0) || "?"}
                                  </span>
                                  {char.image && (
                                    <img
                                      src={char.image}
                                      alt={char.name}
                                      className="relative w-full h-full object-cover object-[center_100%] scale-125"
                                      onError={(e) => { e.target.style.display = "none"; }}
                                    />
                                  )}
                                </div>
                                {char.job && (
                                  <span className="text-xs font-bold text-gray-900 dark:text-white mt-2 text-center truncate max-w-[5rem] sm:max-w-[5.5rem]">
                                    {char.job}
                                  </span>
                                )}
                                <div className="mt-2 flex items-center justify-center gap-1 flex-wrap">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onRemoveCharacter(char.groupNum, char.id, contentName);
                                    }}
                                    className="text-[10px] px-1.5 py-0.5 text-red-600 dark:text-red-400 hover:underline"
                                  >
                                    제거
                                  </button>
                                  {char.characterId && char.server && (
                                    <a
                                      href={`https://dundam.xyz/character?server=${toServerIdForUrl(char.server)}&key=${char.characterId}`}
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
                                    {char.name}
                                  </span>
                                </div>
                                <div className="flex flex-wrap items-center justify-center gap-1.5 mb-2">
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    명성 {char.value ?? 0}
                                  </span>
                                </div>
                                <div className="text-center">
                                  <EditableMemo
                                    characterId={char.id}
                                    memo={char.memo}
                                    onSave={onMemoUpdate}
                                    disabled={!canEditMemo}
                                    className="block truncate"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 캐릭터 추가 */}
                    <div>
                      {isAdding ? (
                        <div className="space-y-1">
                          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                            캐릭터 선택
                          </div>
                          {addable.length === 0 ? (
                            <div className="text-xs text-gray-500 dark:text-gray-400 py-2">
                              추가 가능한 캐릭터가 없습니다.
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {addable.map((char) => (
                                <button
                                  key={char.id}
                                  type="button"
                                  onClick={() => handleAdd(group.id, char.id)}
                                  className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-900 dark:text-white"
                                >
                                  {char.name}
                                </button>
                              ))}
                              <button
                                type="button"
                                onClick={() => setAddTargetGroupId(null)}
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
                          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
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
        )}
      </div>
      </>
      )}
    </div>
  );
}

export default Group;
