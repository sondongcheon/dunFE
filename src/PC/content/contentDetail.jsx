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
} from "@/api/contentApi";

/**
 * content 상세 페이지 (path variable 있을 때)
 * - 캐릭터 목록: 페이지 로딩 시 서버에서 조회 (apiClient 사용)
 * - 그룹: 생성 (API 호출), 그룹 목록 조회 (API 호출), 그룹에 캐릭터 등록/해제
 */
function ContentDetail() {
  const { id } = useParams();
  const invalid = !id || !Object.keys(CONTENT_IDS).includes(id);

  const [characters, setCharacters] = useState([]);
  const [charactersLoading, setCharactersLoading] = useState(true);
  const [groups, setGroups] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(true);

  const currentLabel = CONTENT_IDS[id] || "";

  // TODO: 로그인 구현 후 실제 유저의 adventureId로 변경
  const currentAdventureId = 1;

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

  // 그룹 목록 조회 (API 호출)
  // 내가 가진 그룹과 내 캐릭터가 속한 그룹을 모두 조회
  const loadGroups = useCallback(async () => {
    try {
      setGroupsLoading(true);
      const groupsList = await getGroups();
      
      // 내 캐릭터 ID 목록
      const myCharacterIds = new Set(characters.map((c) => c.id));
      
      // 그룹을 분류: 내가 가진 그룹 vs 내 캐릭터가 속한 그룹
      const classifiedGroups = groupsList.map((group) => {
        const isMyGroup = group.adventureId === currentAdventureId;
        const hasMyCharacters = group.members?.some((member) => 
          myCharacterIds.has(member.characterId || member.id)
        ) || false;
        
        return {
          ...group,
          isMyGroup, // 내가 생성한 그룹
          hasMyCharacters, // 내 캐릭터가 속한 그룹
        };
      });
      
      setGroups(classifiedGroups);
    } catch (error) {
      console.error("그룹 목록 로드 실패:", error);
    } finally {
      setGroupsLoading(false);
    }
  }, [characters, currentAdventureId]);

  // 캐릭터 목록이 로드된 후 그룹 목록 조회
  useEffect(() => {
    if (!charactersLoading) {
      loadGroups();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [charactersLoading]);

  const handleCreateGroup = useCallback(async (name) => {
    try {
      await apiCreateGroup(name);
      loadGroups();
    } catch (error) {
      console.error("그룹 생성 실패:", error);
      // 에러 처리 (예: 사용자에게 알림 표시)
    }
  }, [loadGroups]);

  const handleAddCharacterToGroup = useCallback(async (groupId, characterId) => {
    try {
      await apiAddCharacter(groupId, characterId);
      loadGroups(); // 그룹 목록 새로고침
    } catch (error) {
      console.error("그룹에 캐릭터 추가 실패:", error);
      // 에러 처리 (예: 사용자에게 알림 표시)
    }
  }, [loadGroups]);

  const handleRemoveCharacterFromGroup = useCallback(async (groupId, characterId) => {
    try {
      await apiRemoveCharacter(groupId, characterId);
      loadGroups(); // 그룹 목록 새로고침
    } catch (error) {
      console.error("그룹에서 캐릭터 제거 실패:", error);
      // 에러 처리 (예: 사용자에게 알림 표시)
    }
  }, [loadGroups]);

  // 그룹에 등록된 캐릭터 ID 집합 (제외해서 보기 필터용)
  // 서버 응답의 members 배열에서 characterId 추출
  const addedCharacterIds = React.useMemo(() => {
    const set = new Set();
    groups.forEach((group) => {
      if (group.members && Array.isArray(group.members)) {
        group.members.forEach((member) => {
          const characterId = member.characterId || member.id;
          if (characterId) {
            set.add(characterId);
          }
        });
      }
    });
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
            loading={groupsLoading}
            currentAdventureId={currentAdventureId}
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
