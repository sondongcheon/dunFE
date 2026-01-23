/**
 * Content 관련 API
 */

import axios from "axios";

const STORAGE_GROUPS = "content_groups";

/** 페이지 로딩 시 캐릭터 목록 조회 */
export async function fetchCharacters() {
  try {
    const response = await axios.get("http://localhost:8080/api/test/characters");
    const data = response.data;

    // 서버 응답 필드를 컴포넌트에서 사용하는 필드로 매핑
    // id → id, charactersName → name, fame → value, image → null
    return (Array.isArray(data) ? data : []).map((item) => ({
      id: item.id,
      name: item.charactersName || "",
      value: item.fame || 0,
      image: null,
    }));
  } catch (error) {
    console.error("캐릭터 목록 조회 실패:", error);
    return [];
  }
}

/** 그룹 목록 조회 (현재 localStorage 더미) */
export function getGroups() {
  try {
    const raw = localStorage.getItem(STORAGE_GROUPS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** 그룹 생성 후 저장 (현재 localStorage 더미) */
export function createGroup(name) {
  const groups = getGroups();
  const id = Date.now();
  const newGroup = { id, name, characterIds: [] };
  groups.push(newGroup);
  localStorage.setItem(STORAGE_GROUPS, JSON.stringify(groups));
  return newGroup;
}

/** 그룹에 캐릭터 등록 */
export function addCharacterToGroup(groupId, characterId) {
  const groups = getGroups();
  const g = groups.find((x) => x.id === groupId);
  if (!g || g.characterIds.includes(characterId)) return;
  g.characterIds.push(characterId);
  localStorage.setItem(STORAGE_GROUPS, JSON.stringify(groups));
}

/** 그룹에서 캐릭터 해제 */
export function removeCharacterFromGroup(groupId, characterId) {
  const groups = getGroups();
  const g = groups.find((x) => x.id === groupId);
  if (!g) return;
  g.characterIds = g.characterIds.filter((cid) => cid !== characterId);
  localStorage.setItem(STORAGE_GROUPS, JSON.stringify(groups));
}
