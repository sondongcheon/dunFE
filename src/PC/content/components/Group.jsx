import React, { useState } from "react";

/**
 * Group 컴포넌트
 * - 그룹 생성 (API 호출)
 * - 그룹 목록 표시 (내가 가진 그룹 + 내 캐릭터가 속한 그룹)
 * - 그룹에 캐릭터 등록 / 등록 해제
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
}) {
  const [newGroupName, setNewGroupName] = useState("");
  // 여러 그룹을 동시에 펼칠 수 있도록 배열 사용
  const [expandedIds, setExpandedIds] = useState([]);
  const [addTargetGroupId, setAddTargetGroupId] = useState(null);
  
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

  return (
    <div className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <h2 className="text-2xl font-bold mb-4">Group</h2>

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
                  className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => {
                    if (isExpanded) {
                      setExpandedIds(expandedIds.filter(id => id !== group.id));
                    } else {
                      setExpandedIds([...expandedIds, group.id]);
                    }
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {group.name}
                    </span>
                    {groupType && (
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        group.isMyGroup
                          ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                          : "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                      }`}>
                        {groupType}
                      </span>
                    )}
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      (캐릭터 {members.length}명)
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {isExpanded ? "▲" : "▼"}
                  </span>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-200 dark:border-gray-700 px-3 py-3 space-y-3">
                    {/* 등록된 캐릭터 */}
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        등록된 캐릭터
                      </div>
                      {members.length === 0 ? (
                        <div className="text-xs text-gray-500 dark:text-gray-400 py-2">
                          없음
                        </div>
                      ) : (
                        members.map((char) => (
                          <div
                            key={char.id}
                            className="flex items-center justify-between gap-2 px-2 py-1.5 bg-gray-50 dark:bg-gray-700/50 rounded text-sm"
                          >
                            <span className="text-gray-900 dark:text-white">
                              {char.name}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                // groupId는 char.groupNum (characters 안에 있는 groupId)
                                // contentName은 현재 페이지의 contentName
                                onRemoveCharacter(char.groupNum, contentName);
                              }}
                              className="text-xs text-red-600 dark:text-red-400 hover:underline"
                            >
                              제거
                            </button>
                          </div>
                        ))
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
    </div>
  );
}

export default Group;
