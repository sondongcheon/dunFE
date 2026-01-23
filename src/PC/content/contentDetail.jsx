import React, { useState, useEffect, useCallback } from "react";
import { useParams, Navigate } from "react-router-dom";
import ContentSidebar from "./components/ContentSidebar";
import { CONTENT_IDS } from "./constants";
import Characters from "./components/Characters";
import Group from "./components/Group";
import {
  fetchCharacters,
  getGroups,
  createGroup as apiCreateGroup,
  addCharacterToGroup as apiAddCharacter,
  removeCharacterFromGroup as apiRemoveCharacter,
} from "./api/contentApi";

/**
 * content 상세 페이지 (path variable 있을 때)
 * - 캐릭터 목록: 페이지 로딩 시 서버에서 조회 (현재 더미)
 * - 그룹: 생성·저장 (현재 localStorage 더미), 그룹에 캐릭터 등록/해제
 */
function ContentDetail() {
  const { id } = useParams();
  const invalid = !id || !Object.keys(CONTENT_IDS).includes(id);

  const [characters, setCharacters] = useState([]);
  const [charactersLoading, setCharactersLoading] = useState(true);
  const [groups, setGroups] = useState([]);

  const currentLabel = CONTENT_IDS[id] || "";

  // 페이지 로딩 시 캐릭터 목록 fetch
  useEffect(() => {
    let mounted = true;
    setCharactersLoading(true);
    fetchCharacters()
      .then((list) => {
        if (mounted) setCharacters(list);
      })
      .finally(() => {
        if (mounted) setCharactersLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  // 그룹 목록은 storage에서 로드 (같은 탭 내에서 그룹 변경 시 반영)
  const loadGroups = useCallback(() => {
    setGroups(getGroups());
  }, []);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  const handleCreateGroup = useCallback((name) => {
    apiCreateGroup(name);
    loadGroups();
  }, [loadGroups]);

  const handleAddCharacterToGroup = useCallback((groupId, characterId) => {
    apiAddCharacter(groupId, characterId);
    loadGroups();
  }, [loadGroups]);

  const handleRemoveCharacterFromGroup = useCallback((groupId, characterId) => {
    apiRemoveCharacter(groupId, characterId);
    loadGroups();
  }, [loadGroups]);

  // 그룹에 등록된 캐릭터 ID 집합 (제외해서 보기 필터용)
  const addedCharacterIds = React.useMemo(() => {
    const set = new Set();
    groups.forEach((g) => (g.characterIds || []).forEach((cid) => set.add(cid)));
    return set;
  }, [groups]);

  if (invalid) return <Navigate to="/content" replace />;

  return (
    <div className="mainbody">
      <div className="flex w-full gap-4">
        <ContentSidebar />
        <main className="flex-1 min-w-0 space-y-6">
          <h1 className="text-2xl font-bold">Content - {currentLabel}</h1>
          <Characters
            characters={characters}
            loading={charactersLoading}
            addedCharacterIds={addedCharacterIds}
          />
          <Group
            groups={groups}
            characters={characters}
            onCreateGroup={handleCreateGroup}
            onAddCharacter={handleAddCharacterToGroup}
            onRemoveCharacter={handleRemoveCharacterFromGroup}
          />
        </main>
      </div>
    </div>
  );
}

export default ContentDetail;
