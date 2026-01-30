/**
 * Content 관련 API
 * 
 * Content 페이지에서 사용하는 API 함수들을 정의합니다.
 */

import apiClient from "@/api/client";
import { CONTENT_ENDPOINTS, MEMBER_ENDPOINTS, CHARACTER_ENDPOINTS } from "@/api/endpoints";

/**
 * Content 상세 데이터 조회 (그룹 목록 + 캐릭터 목록)
 * @param {string} contentName - 콘텐츠 이름 (CONTENT_IDS의 키 값, 예: "nabel")
 * @returns {Promise<Object>} { groups: Array, characters: Array }
 */
export async function fetchContentData(contentName) {
    try {
        // localStorage에서 adventureId 가져오기
        const adventureId = localStorage.getItem("adventureId");

        if (!adventureId) {
            throw new Error("로그인이 필요합니다.");
        }

        const response = await apiClient.get(CONTENT_ENDPOINTS.DETAIL, {
            params: {
                adventureId,
                contentName,
            },
        });
        const data = response.data;

        // 서버 응답 구조: { groups: [...], characters: [...] }
        const groups = Array.isArray(data.groups) ? data.groups : [];
        const characters = Array.isArray(data.characters) ? data.characters : [];

        // 캐릭터 데이터 매핑
        // id → id, nickname → name, fame → value, job → job, memo → memo, groupNum → groupNum, clearState → clearState
        const mappedCharacters = characters.map((item) => ({
            id: item.id,
            name: item.nickname || "",
            value: item.fame || 0,
            job: item.job || "",
            memo: item.memo || null,
            groupNum: item.groupNum || null,
            clearState: typeof item.clearState === 'boolean' ? item.clearState : false,
            image: null,
        }));

        return {
            groups,
            characters: mappedCharacters,
        };
    } catch (error) {
        console.error("Content 데이터 조회 실패:", error);
        throw error;
    }
}

/**
 * 그룹에 캐릭터 추가 (API 호출)
 * @param {number} groupId - 그룹 ID (groups의 id 값)
 * @param {number} characterId - 캐릭터 ID (characters의 id 값)
 * @param {string} contentName - 콘텐츠 이름 (CONTENT_IDS의 키 값, 예: "nabel")
 * @returns {Promise<void>}
 */
export async function addCharacterToGroup(groupId, characterId, contentName) {
    try {
        await apiClient.post(MEMBER_ENDPOINTS.ADD, null, {
            params: {
                groupId,
                characterId,
                contentName,
            },
        });
    } catch (error) {
        console.error("그룹에 캐릭터 추가 실패:", error);
        throw error;
    }
}

/**
 * 그룹에서 캐릭터 제거 (API 호출)
 * @param {number} groupId - 그룹 ID (characters의 groupNum 값)
 * @param {number} characterId - 캐릭터 ID (characters의 id 값)
 * @param {string} contentName - 콘텐츠 이름 (CONTENT_IDS의 키 값, 예: "nabel")
 * @returns {Promise<void>}
 */
export async function removeCharacterFromGroup(groupId, characterId, contentName) {
    try {
        await apiClient.delete(MEMBER_ENDPOINTS.REMOVE, {
            params: {
                groupId,
                characterId,
                contentName,
            },
        });
    } catch (error) {
        console.error("그룹에서 캐릭터 제거 실패:", error);
        throw error;
    }
}

/**
 * 캐릭터 추가 (API 호출)
 * @param {string} server - 서버 ID (예: "cain")
 * @param {string} characterName - 캐릭터 이름
 * @returns {Promise<void>}
 */
export async function addCharacter(server, characterName) {
    try {
        // localStorage에서 adventureId 가져오기
        const adventureId = localStorage.getItem("adventureId");

        if (!adventureId) {
            throw new Error("로그인이 필요합니다.");
        }

        await apiClient.post(CHARACTER_ENDPOINTS.ADD, null, {
            params: {
                server,
                characterName,
            },
        });
    } catch (error) {
        console.error("캐릭터 추가 실패:", error);
        throw error;
    }
}
