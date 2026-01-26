import React, { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import ContentSidebar from "./components/ContentSidebar";
import { CONTENT_IDS } from "./constants";
import Characters from "./components/Characters";
import Group from "./components/Group";
import { fetchContentData, addCharacterToGroup, removeCharacterFromGroup } from "@/api/contentApi";

/**
 * content 상세 페이지 (path variable 있을 때)
 * - 캐릭터 목록과 그룹 목록: 페이지 로딩 시 /content API로 조회
 */
function ContentDetail() {
  const { id } = useParams();
  const invalid = !id || !Object.keys(CONTENT_IDS).includes(id);

  const [characters, setCharacters] = useState([]);
  const [charactersLoading, setCharactersLoading] = useState(true);
  const [groups, setGroups] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(true);

  const currentLabel = CONTENT_IDS[id] || "";

  // localStorage에서 adventureId 가져오기
  const currentAdventureId = localStorage.getItem("adventureId");
  const isLoggedIn = !!currentAdventureId;

  // 페이지 로딩 시 Content 데이터 조회 (그룹 + 캐릭터)
  useEffect(() => {
    if (!id || invalid || !isLoggedIn) {
      setCharactersLoading(false);
      setGroupsLoading(false);
      return;
    }
    
    let mounted = true;
    setCharactersLoading(true);
    setGroupsLoading(true);
    
    fetchContentData(id)
      .then((data) => {
        if (mounted) {
          // 캐릭터 목록 설정
          setCharacters(data.characters);
          
          // 내 캐릭터 ID 목록
          const myCharacterIds = new Set(data.characters.map((c) => c.id));
          
          // 그룹을 분류: 내가 가진 그룹 vs 내 캐릭터가 속한 그룹
          const classifiedGroups = data.groups.map((group) => {
            const isMyGroup = String(group.adventureId) === String(currentAdventureId);
            // groupNum이 group.id와 일치하는 캐릭터가 있는지 확인
            const hasMyCharacters = data.characters.some((char) => 
              char.groupNum !== null && char.groupNum !== undefined && 
              char.groupNum === group.id
            ) || false;
            
            return {
              ...group,
              isMyGroup, // 내가 생성한 그룹
              hasMyCharacters, // 내 캐릭터가 속한 그룹 (groupNum으로 판단)
            };
          });
          
          setGroups(classifiedGroups);
        }
      })
      .catch((error) => {
        if (mounted) {
          if (error.message === "로그인이 필요합니다.") {
            setCharacters([]);
            setGroups([]);
          } else {
            console.error("Content 데이터 로드 실패:", error);
          }
        }
      })
      .finally(() => {
        if (mounted) {
          setCharactersLoading(false);
          setGroupsLoading(false);
        }
      });
    return () => { mounted = false; };
  }, [id, invalid, isLoggedIn, currentAdventureId]);

  // 그룹 생성/추가/제거 핸들러는 서버에서 처리하므로 데이터 새로고침만 수행
  const handleCreateGroup = async (name) => {
    // 그룹 생성은 서버에서 처리되므로 데이터 새로고침
    try {
      const data = await fetchContentData(id);
      setCharacters(data.characters);
      
      const myCharacterIds = new Set(data.characters.map((c) => c.id));
      const classifiedGroups = data.groups.map((group) => {
        const isMyGroup = String(group.adventureId) === String(currentAdventureId);
        const hasMyCharacters = data.characters.some((char) => 
          char.groupNum !== null && char.groupNum !== undefined && 
          char.groupNum === group.id
        ) || false;
        return {
          ...group,
          isMyGroup,
          hasMyCharacters,
        };
      });
      setGroups(classifiedGroups);
    } catch (error) {
      console.error("데이터 새로고침 실패:", error);
    }
  };

  const handleAddCharacterToGroup = async (groupId, characterId) => {
    try {
      // API 호출: 그룹에 캐릭터 추가
      // groupId: groups의 id
      // characterId: characters의 id
      // contentName: CONTENT_IDS의 값 (현재 페이지의 id)
      await addCharacterToGroup(groupId, characterId, id);
      
      // 데이터 새로고침
      const data = await fetchContentData(id);
      setCharacters(data.characters);
      
      const myCharacterIds = new Set(data.characters.map((c) => c.id));
      const classifiedGroups = data.groups.map((group) => {
        const isMyGroup = String(group.adventureId) === String(currentAdventureId);
        const hasMyCharacters = data.characters.some((char) => 
          char.groupNum !== null && char.groupNum !== undefined && 
          char.groupNum === group.id
        ) || false;
        return {
          ...group,
          isMyGroup,
          hasMyCharacters,
        };
      });
      setGroups(classifiedGroups);
    } catch (error) {
      console.error("그룹에 캐릭터 추가 실패:", error);
      // 에러 처리 (예: 사용자에게 알림 표시)
    }
  };

  const handleRemoveCharacterFromGroup = async (groupId, contentName) => {
    try {
      // API 호출: 그룹에서 캐릭터 제거
      // groupId: characters 안에 있는 groupId (char.groupNum)
      // contentName: CONTENT_IDS의 값 (현재 페이지의 id)
      await removeCharacterFromGroup(groupId, contentName);
      
      // 데이터 새로고침
      const data = await fetchContentData(id);
      setCharacters(data.characters);
      
      const myCharacterIds = new Set(data.characters.map((c) => c.id));
      const classifiedGroups = data.groups.map((group) => {
        const isMyGroup = String(group.adventureId) === String(currentAdventureId);
        const hasMyCharacters = data.characters.some((char) => 
          char.groupNum !== null && char.groupNum !== undefined && 
          char.groupNum === group.id
        ) || false;
        return {
          ...group,
          isMyGroup,
          hasMyCharacters,
        };
      });
      setGroups(classifiedGroups);
    } catch (error) {
      console.error("그룹에서 캐릭터 제거 실패:", error);
      // 에러 처리 (예: 사용자에게 알림 표시)
    }
  };

  // 그룹에 등록된 캐릭터 ID 집합 (제외해서 보기 필터용)
  // groupNum이 있는 캐릭터들을 그룹에 등록된 것으로 간주
  const addedCharacterIds = React.useMemo(() => {
    const set = new Set();
    characters.forEach((character) => {
      if (character.groupNum !== null && character.groupNum !== undefined) {
        set.add(character.id);
      }
    });
    return set;
  }, [characters]);

  if (invalid) return <Navigate to="/content" replace />;

  // 미로그인 상태 표시
  if (!isLoggedIn) {
    return (
      <div className="mainbody">
        <div className="flex w-full gap-4">
          <ContentSidebar />
          <main className="flex-1 min-w-0 space-y-6">
            <h1 className="text-2xl font-bold">Content - {currentLabel}</h1>
            <div className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">
                로그인이 필요합니다.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                상단의 로그인 버튼을 클릭하여 로그인해주세요.
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

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
            contentName={id}
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
