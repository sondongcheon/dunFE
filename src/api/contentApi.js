/**
 * Content 관련 API
 * 
 * Content 페이지에서 사용하는 API 함수들을 정의합니다.
 */

import apiClient from "@/api/client";
import { TEST_ENDPOINTS, GROUP_ENDPOINTS, MEMBER_ENDPOINTS } from "@/api/endpoints";

/**
 * 페이지 로딩 시 캐릭터 목록 조회
 * @returns {Promise<Array>} 캐릭터 목록 배열
 */
export async function fetchCharacters() {
    try {
        const response = await apiClient.get(TEST_ENDPOINTS.CHARACTERS);
        const data = response.data;

        // 서버 응답 필드를 컴포넌트에서 사용하는 필드로 매핑
        // id → id, charactersName → name, fame → value, image → null, clearStatus → clearStatus
        return (Array.isArray(data) ? data : []).map((item) => ({
            id: item.id,
            name: item.charactersName || "",
            value: item.fame || 0,
            image: null,
            clearStatus: item.clearStatus || false,
        }));
    } catch (error) {
        console.error("캐릭터 목록 조회 실패:", error);
        return [];
    }
}

/**
 * 그룹 목록 조회 (API 호출)
 * 현재 로그인된 사용자가 가진 그룹과 내 캐릭터가 속한 그룹을 조회합니다.
 * @param {string} contentType - 콘텐츠 타입 (현재는 "raid_nabel"로 고정, 나중에는 CONTENT_IDS에 따라 변경)
 * @returns {Promise<Array>} 그룹 목록 배열
 */
export async function getGroups(contentType = "raid_nabel") {
    try {
        // TODO: 로그인 구현 후 실제 유저의 adventureId로 변경
        const adventureId = 1;

        const response = await apiClient.get(GROUP_ENDPOINTS.LIST, {
            params: {
                adventureId,
                contentType,
            },
        });

        // 서버 응답 구조: GroupRes
        // { id, adventureId, name, createAt, updateAt, members: [{ ... }] }
        const groups = Array.isArray(response.data) ? response.data : [];

        // 응답 데이터를 그대로 반환 (서버에서 이미 필터링된 데이터)
        return groups;
    } catch (error) {
        console.error("그룹 목록 조회 실패:", error);
        return [];
    }
}

/**
 * 그룹 생성 (API 호출)
 * @param {string} name - 그룹 이름
 * @returns {Promise<Object>} 생성된 그룹 객체
 */
export async function createGroup(name) {
    try {
        // TODO: 로그인 구현 후 실제 유저의 adventureId로 변경
        const adventureId = 1;

        const response = await apiClient.post(GROUP_ENDPOINTS.CREATE, {
            name,
            adventureId,
        });
        return response.data;
    } catch (error) {
        console.error("그룹 생성 실패:", error);
        throw error;
    }
}

/**
 * 그룹에 캐릭터 등록 (API 호출)
 * @param {number} groupId - 그룹 ID
 * @param {number} characterId - 캐릭터 ID
 * @returns {Promise<void>}
 */
export async function addCharacterToGroup(groupId, characterId) {
    try {
        await apiClient.post(MEMBER_ENDPOINTS.ADD, null, {
            params: {
                groupId,
                characterId,
            },
        });
    } catch (error) {
        console.error("그룹에 캐릭터 추가 실패:", error);
        throw error;
    }
}

/**
 * 그룹에서 캐릭터 해제 (API 호출)
 * @param {number} groupId - 그룹 ID
 * @param {number} characterId - 캐릭터 ID
 * @returns {Promise<void>}
 */
export async function removeCharacterFromGroup(groupId, characterId) {
    try {
        await apiClient.delete(MEMBER_ENDPOINTS.REMOVE, {
            params: {
                groupId,
                characterId,
            },
        });
    } catch (error) {
        console.error("그룹에서 캐릭터 제거 실패:", error);
        throw error;
    }
}
