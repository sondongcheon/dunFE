import React, { useState, useEffect, useMemo } from "react";
import { CONTENT_IDS } from "./constants";
import {
  fetchContentData,
  addCharacterToGroup,
  removeCharacterFromGroup,
  updateCharacterMemo,
  updateGroupName,
  removeGroup,
  createGroup,
} from "@/api/contentApi";
import {
  createParty,
  createPartyGroup,
  addPartyMember,
  removePartyMember,
  joinParty,
  updatePartyName,
  updatePartyGroupName,
  inviteAdventureToParty,
  removePartyGroup,
  removeParty,
} from "@/api/partyApi";

/**
 * Content 상세 페이지 공통 로직 훅 (PC / 모바일 공유)
 * @param {string} id - content path param
 * @returns {object} state + handlers for Characters, Group, Party
 */
function useContentDetail(id) {
  const invalid = !id || !Object.keys(CONTENT_IDS).includes(id);
  const currentLabel = CONTENT_IDS[id] || "";
  const currentAdventureId = typeof window !== "undefined" ? localStorage.getItem("adventureId") : null;
  const isLoggedIn = !!currentAdventureId;

  const [characters, setCharacters] = useState([]);
  const [charactersLoading, setCharactersLoading] = useState(true);
  const [groups, setGroups] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [parties, setParties] = useState([]);
  const [partiesLoading, setPartiesLoading] = useState(true);

  const classifyGroups = (data) =>
    data.groups.map((group) => {
      const isMyGroup = String(group.adventureId) === String(currentAdventureId);
      const hasMyCharacters =
        data.characters.some(
          (char) =>
            char.groupNum != null && char.groupNum === group.id
        ) || false;
      return { ...group, isMyGroup, hasMyCharacters };
    });

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
          setCharacters(data.characters);
          setGroups(classifyGroups(data));
          setParties(Array.isArray(data.parties) ? data.parties : []);
        }
      })
      .catch((err) => {
        if (mounted) {
          if (err.message === "로그인이 필요합니다.") {
            setCharacters([]);
            setGroups([]);
            setParties([]);
          } else {
            console.error("Content 데이터 로드 실패:", err);
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

  const refresh = async () => {
    const data = await fetchContentData(id);
    setCharacters(data.characters);
    setGroups(classifyGroups(data));
    setParties(Array.isArray(data.parties) ? data.parties : []);
  };

  const handleCreateGroup = async (name) => {
    try {
      await createGroup(id, name);
      await refresh();
    } catch (e) {
      console.error("그룹 생성 실패:", e);
    }
  };

  const handleAddCharacterToGroup = async (groupId, characterId) => {
    try {
      await addCharacterToGroup(groupId, characterId, id);
      await refresh();
    } catch (e) {
      console.error("그룹에 캐릭터 추가 실패:", e);
    }
  };

  const handleUpdateGroupName = async (groupId, name) => {
    try {
      await updateGroupName(groupId, name, id);
      await refresh();
    } catch (e) {
      console.error("그룹명 변경 실패:", e);
      throw e;
    }
  };

  const handleRemoveGroup = async (groupId) => {
    try {
      await removeGroup(id, groupId);
      await refresh();
    } catch (e) {
      console.error("그룹 제거 실패:", e);
    }
  };

  const handleRemoveCharacterFromGroup = async (groupId, characterId) => {
    try {
      await removeCharacterFromGroup(groupId, characterId, id);
      await refresh();
    } catch (e) {
      console.error("그룹에서 캐릭터 제거 실패:", e);
    }
  };

  const handleCreateParty = async (name, password) => {
    try {
      await createParty(id, name, password);
      await refresh();
    } catch (e) {
      console.error("파티 생성 실패:", e);
    }
  };

  const handleInviteAdventure = async (partyId, adventureName) => {
    try {
      await inviteAdventureToParty(id, partyId, adventureName);
      await refresh();
    } catch (e) {
      console.error("모험단 초대 실패:", e);
      throw e;
    }
  };

  const handleAddCharacterToPublicGroup = async (partyGroupId, characterId) => {
    try {
      await addPartyMember(id, partyGroupId, characterId);
      await refresh();
    } catch (e) {
      console.error("파티 그룹에 캐릭터 추가 실패:", e);
    }
  };

  const handleRemoveCharacterFromPublicGroup = async (partyGroupId, characterId) => {
    try {
      await removePartyMember(id, partyGroupId, characterId);
      await refresh();
    } catch (e) {
      console.error("파티 그룹에서 캐릭터 제거 실패:", e);
    }
  };

  const handleCreatePartyGroup = async (partyId, groupName) => {
    try {
      await createPartyGroup(id, partyId, groupName);
      await refresh();
    } catch (e) {
      console.error("파티 그룹 생성 실패:", e);
    }
  };

  const handleRemovePartyGroup = async (partyGroupId) => {
    try {
      await removePartyGroup(id, partyGroupId);
      await refresh();
    } catch (e) {
      console.error("파티 그룹 삭제 실패:", e);
    }
  };

  const handleRemoveParty = async (partyId) => {
    try {
      await removeParty(id, partyId);
      await refresh();
    } catch (e) {
      console.error("파티 삭제 실패:", e);
    }
  };

  const handleMemoUpdate = async (characterId, memo) => {
    try {
      await updateCharacterMemo(characterId, memo);
      await refresh();
    } catch (e) {
      console.error("메모 수정 실패:", e);
      throw e;
    }
  };

  const handleUpdatePartyName = async (partyId, name) => {
    try {
      await updatePartyName(id, partyId, name);
      await refresh();
    } catch (e) {
      console.error("파티 이름 변경 실패:", e);
      throw e;
    }
  };

  const handleUpdatePartyGroupName = async (partyGroupId, name) => {
    try {
      await updatePartyGroupName(id, partyGroupId, name);
      await refresh();
    } catch (e) {
      console.error("파티 그룹 이름 변경 실패:", e);
      throw e;
    }
  };

  const handleJoinParty = async (partyName, leaderAdventureName, password) => {
    try {
      await joinParty(id, partyName, leaderAdventureName, password || "");
      await refresh();
    } catch (e) {
      console.error("파티 참여 실패:", e);
    }
  };

  const addedCharacterIds = useMemo(() => {
    const set = new Set();
    characters.forEach((c) => {
      if (c.groupNum != null) set.add(c.id);
    });
    return set;
  }, [characters]);

  return {
    invalid,
    currentLabel,
    currentAdventureId,
    isLoggedIn,
    characters,
    groups,
    parties,
    charactersLoading,
    groupsLoading,
    partiesLoading,
    addedCharacterIds,
    handlers: {
      handleCreateGroup,
      handleAddCharacterToGroup,
      handleUpdateGroupName,
      handleRemoveGroup,
      handleRemoveCharacterFromGroup,
      handleCreateParty,
      handleInviteAdventure,
      handleAddCharacterToPublicGroup,
      handleRemoveCharacterFromPublicGroup,
      handleCreatePartyGroup,
      handleRemovePartyGroup,
      handleRemoveParty,
      handleMemoUpdate,
      handleUpdatePartyName,
      handleUpdatePartyGroupName,
      handleJoinParty,
    },
  };
}

export default useContentDetail;
