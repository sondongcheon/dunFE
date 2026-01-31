import React, { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import ContentSidebar from "./components/ContentSidebar";
import { CONTENT_IDS } from "./constants";
import Characters from "./components/Characters";
import Group from "./components/Group";
import Party from "./components/Party";
import { fetchContentData, addCharacterToGroup, removeCharacterFromGroup, updateCharacterMemo, updateGroupName, removeGroup, createGroup } from "@/api/contentApi";
import { createParty, createPartyGroup, addPartyMember, removePartyMember, joinParty, updatePartyName, updatePartyGroupName, inviteAdventureToParty, removePartyGroup, removeParty } from "@/api/partyApi";

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
  const [parties, setParties] = useState([]);
  const [partiesLoading, setPartiesLoading] = useState(true);

  const currentLabel = CONTENT_IDS[id] || "";

  // localStorage에서 adventureId 가져오기
  const currentAdventureId = localStorage.getItem("adventureId");
  const isLoggedIn = !!currentAdventureId;

  // 페이지 로딩 시 Content 데이터 조회 (그룹 + 캐릭터)
  useEffect(() => {
    if (!id || invalid || !isLoggedIn) {
      setCharactersLoading(false);
      setGroupsLoading(false);
      setPartiesLoading(false);
      return;
    }
    
    let mounted = true;
    setCharactersLoading(true);
    setGroupsLoading(true);
    setPartiesLoading(true);
    
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
          
          // 파티 목록 설정 (API 응답에 parties가 있다면)
          const partiesData = Array.isArray(data.parties) ? data.parties : [];
          setParties(partiesData);
        }
      })
      .catch((error) => {
        if (mounted) {
          if (error.message === "로그인이 필요합니다.") {
            setCharacters([]);
            setGroups([]);
            setParties([]);
          } else {
            console.error("Content 데이터 로드 실패:", error);
          }
        }
      })
      .finally(() => {
        if (mounted) {
          setCharactersLoading(false);
          setGroupsLoading(false);
          setPartiesLoading(false);
        }
      });
    return () => { mounted = false; };
  }, [id, invalid, isLoggedIn, currentAdventureId]);

  const handleCreateGroup = async (name) => {
    try {
      await createGroup(id, name);
      const data = await fetchContentData(id);
      setCharacters(data.characters);
      const classifiedGroups = data.groups.map((group) => {
        const isMyGroup = String(group.adventureId) === String(currentAdventureId);
        const hasMyCharacters = data.characters.some((char) =>
          char.groupNum !== null && char.groupNum !== undefined && char.groupNum === group.id
        ) || false;
        return { ...group, isMyGroup, hasMyCharacters };
      });
      setGroups(classifiedGroups);
    } catch (error) {
      console.error("그룹 생성 실패:", error);
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

  const handleUpdateGroupName = async (groupId, name, contentName) => {
    try {
      await updateGroupName(groupId, name, contentName);
      const data = await fetchContentData(id);
      setCharacters(data.characters);
      const classifiedGroups = data.groups.map((group) => {
        const isMyGroup = String(group.adventureId) === String(currentAdventureId);
        const hasMyCharacters = data.characters.some((char) =>
          char.groupNum !== null && char.groupNum !== undefined && char.groupNum === group.id
        ) || false;
        return { ...group, isMyGroup, hasMyCharacters };
      });
      setGroups(classifiedGroups);
    } catch (error) {
      console.error("그룹명 변경 실패:", error);
      throw error;
    }
  };

  const handleRemoveGroup = async (groupId) => {
    try {
      await removeGroup(id, groupId);
      const data = await fetchContentData(id);
      setCharacters(data.characters);
      const classifiedGroups = data.groups.map((group) => {
        const isMyGroup = String(group.adventureId) === String(currentAdventureId);
        const hasMyCharacters = data.characters.some((char) =>
          char.groupNum !== null && char.groupNum !== undefined && char.groupNum === group.id
        ) || false;
        return { ...group, isMyGroup, hasMyCharacters };
      });
      setGroups(classifiedGroups);
    } catch (error) {
      console.error("그룹 제거 실패:", error);
    }
  };

  const handleRemoveCharacterFromGroup = async (groupId, characterId, contentName) => {
    try {
      // API 호출: 그룹에서 캐릭터 제거
      // groupId: characters 안에 있는 groupId (char.groupNum)
      // characterId: characters의 id 값
      // contentName: CONTENT_IDS의 값 (현재 페이지의 id)
      await removeCharacterFromGroup(groupId, characterId, contentName);
      
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

  // Party 관련 핸들러
  const handleCreateParty = async (name, password) => {
    try {
      // 파티 생성 API 호출
      await createParty(id, name, password);
      
      // 데이터 새로고침
      const data = await fetchContentData(id);
      setCharacters(data.characters);
      const partiesData = Array.isArray(data.parties) ? data.parties : [];
      setParties(partiesData);
    } catch (error) {
      console.error("파티 생성 실패:", error);
      // TODO: 사용자에게 에러 알림 표시
    }
  };

  const handleInviteAdventure = async (partyId, adventureName) => {
    try {
      await inviteAdventureToParty(id, partyId, adventureName);
      const data = await fetchContentData(id);
      setCharacters(data.characters);
      const partiesData = Array.isArray(data.parties) ? data.parties : [];
      setParties(partiesData);
    } catch (error) {
      console.error("모험단 초대 실패:", error);
      throw error;
    }
  };

  const handleAddCharacterToPublicGroup = async (partyGroupId, characterId) => {
    try {
      await addPartyMember(id, partyGroupId, characterId);
      const data = await fetchContentData(id);
      setCharacters(data.characters);
      const partiesData = Array.isArray(data.parties) ? data.parties : [];
      setParties(partiesData);
    } catch (error) {
      console.error("파티 그룹에 캐릭터 추가 실패:", error);
    }
  };

  const handleRemoveCharacterFromPublicGroup = async (partyGroupId, characterId) => {
    try {
      await removePartyMember(id, partyGroupId, characterId);
      const data = await fetchContentData(id);
      setCharacters(data.characters);
      const partiesData = Array.isArray(data.parties) ? data.parties : [];
      setParties(partiesData);
    } catch (error) {
      console.error("파티 그룹에서 캐릭터 제거 실패:", error);
    }
  };

  const handleCreatePartyGroup = async (partyId, groupName) => {
    try {
      await createPartyGroup(id, partyId, groupName);
      const data = await fetchContentData(id);
      setCharacters(data.characters);
      const partiesData = Array.isArray(data.parties) ? data.parties : [];
      setParties(partiesData);
    } catch (error) {
      console.error("파티 그룹 생성 실패:", error);
    }
  };

  const handleRemovePartyGroup = async (partyGroupId) => {
    try {
      await removePartyGroup(id, partyGroupId);
      const data = await fetchContentData(id);
      setCharacters(data.characters);
      const partiesData = Array.isArray(data.parties) ? data.parties : [];
      setParties(partiesData);
    } catch (error) {
      console.error("파티 그룹 삭제 실패:", error);
    }
  };

  const handleRemoveParty = async (partyId) => {
    try {
      await removeParty(id, partyId);
      const data = await fetchContentData(id);
      setCharacters(data.characters);
      const partiesData = Array.isArray(data.parties) ? data.parties : [];
      setParties(partiesData);
    } catch (error) {
      console.error("파티 삭제 실패:", error);
    }
  };

  const handleMemoUpdate = async (characterId, memo) => {
    try {
      await updateCharacterMemo(characterId, memo);
      const data = await fetchContentData(id);
      setCharacters(data.characters);
      const classifiedGroups = data.groups.map((group) => {
        const isMyGroup = String(group.adventureId) === String(currentAdventureId);
        const hasMyCharacters = data.characters.some((char) =>
          char.groupNum !== null && char.groupNum !== undefined && char.groupNum === group.id
        ) || false;
        return { ...group, isMyGroup, hasMyCharacters };
      });
      setGroups(classifiedGroups);
      const partiesData = Array.isArray(data.parties) ? data.parties : [];
      setParties(partiesData);
    } catch (error) {
      console.error("메모 수정 실패:", error);
      throw error;
    }
  };

  const handleUpdatePartyName = async (partyId, name, contentName) => {
    try {
      await updatePartyName(contentName, partyId, name);
      const data = await fetchContentData(id);
      setCharacters(data.characters);
      const partiesData = Array.isArray(data.parties) ? data.parties : [];
      setParties(partiesData);
    } catch (error) {
      console.error("파티 이름 변경 실패:", error);
      throw error;
    }
  };

  const handleUpdatePartyGroupName = async (partyGroupId, name, contentName) => {
    try {
      await updatePartyGroupName(contentName, partyGroupId, name);
      const data = await fetchContentData(id);
      setCharacters(data.characters);
      const partiesData = Array.isArray(data.parties) ? data.parties : [];
      setParties(partiesData);
    } catch (error) {
      console.error("파티 그룹 이름 변경 실패:", error);
      throw error;
    }
  };

  const handleJoinParty = async (partyName, leaderAdventureName, password) => {
    try {
      await joinParty(id, partyName, leaderAdventureName, password || "");
      const data = await fetchContentData(id);
      setCharacters(data.characters);
      const partiesData = Array.isArray(data.parties) ? data.parties : [];
      setParties(partiesData);
    } catch (error) {
      console.error("파티 참여 실패:", error);
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
            onMemoUpdate={handleMemoUpdate}
            canEditMemo={isLoggedIn}
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
            onMemoUpdate={handleMemoUpdate}
            onUpdateGroupName={handleUpdateGroupName}
            onRemoveGroup={handleRemoveGroup}
            canEditMemo={isLoggedIn}
          />
          <Party
            parties={parties}
            characters={characters}
            loading={partiesLoading}
            currentAdventureId={currentAdventureId}
            contentName={id}
            onCreateParty={handleCreateParty}
            onInviteAdventure={handleInviteAdventure}
            onCreatePartyGroup={handleCreatePartyGroup}
            onRemovePartyGroup={handleRemovePartyGroup}
            onRemoveParty={handleRemoveParty}
            onJoinParty={handleJoinParty}
            onMemoUpdate={handleMemoUpdate}
            onUpdatePartyName={handleUpdatePartyName}
            onUpdatePartyGroupName={handleUpdatePartyGroupName}
            canEditMemo={isLoggedIn}
            onAddCharacterToPublicGroup={handleAddCharacterToPublicGroup}
            onRemoveCharacterFromPublicGroup={handleRemoveCharacterFromPublicGroup}
          />
        </main>
      </div>
    </div>
  );
}

export default ContentDetail;
