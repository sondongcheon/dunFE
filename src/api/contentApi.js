/**
 * Content 관련 API
 * 
 * Content 페이지에서 사용하는 API 함수들을 정의합니다.
 */

import apiClient from "@/api/client";
import { CONTENT_ENDPOINTS, MEMBER_ENDPOINTS, CHARACTER_ENDPOINTS, GROUP_ENDPOINTS } from "@/api/endpoints";

/**
 * Content 상세 데이터 조회 (그룹 목록 + 캐릭터 목록 + 파티 목록)
 * @param {string} contentName - 콘텐츠 이름 (CONTENT_IDS의 키 값, 예: "nabel")
 * @returns {Promise<Object>} { groups: Array, characters: Array, parties: Array }
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

        // 서버 응답 구조: { groups: [...], characters: [...], parties: [...] }
        const groups = Array.isArray(data.groups) ? data.groups : [];
        const characters = Array.isArray(data.characters) ? data.characters : [];
        const parties = Array.isArray(data.parties) ? data.parties : [];

        // 캐릭터 데이터 매핑
        // id → id, characterId → characterId (던담 링크용), nickname → name, fame → value, job → job, memo → memo, groupNum → groupNum, clearState → clearState, img → image, server → server
        const mappedCharacters = characters.map((item) => ({
            id: item.id,
            characterId: item.characterId ?? item.id,
            name: item.nickname || "",
            value: item.fame || 0,
            job: item.job || "",
            memo: item.memo || null,
            groupNum: item.groupNum || null,
            clearState: typeof item.clearState === 'boolean' ? item.clearState : false,
            image: item.img || item.image || null,
            server: item.server || null,
        }));

        return {
            groups,
            characters: mappedCharacters,
            parties,
        };
    } catch (error) {
        console.error("Content 데이터 조회 실패:", error);
        throw error;
    }
}

/**
 * private 그룹 생성 (CreateGroupReq: content, name → GroupCreateRes: id, name, createAt, updateAt)
 * POST /api/content/group
 * @param {string} content - 콘텐츠 이름 (CONTENT_IDS 키)
 * @param {string} name - 그룹 이름
 * @returns {Promise<{ id: number, name: string, createAt: string, updateAt: string }>} GroupCreateRes
 */
export async function createGroup(content, name) {
    try {
        const response = await apiClient.post(GROUP_ENDPOINTS.CREATE, {
            content,
            name,
        });
        return response.data;
    } catch (error) {
        console.error("그룹 생성 실패:", error);
        throw error;
    }
}

/**
 * private 그룹 제거 (멤버 삭제 후 그룹 삭제, 소유자만 가능)
 * DELETE /api/content/group
 * @param {string} content - 콘텐츠 이름 (CONTENT_IDS 키)
 * @param {number} groupId - 그룹 ID
 * @returns {Promise<Object>} 응답 데이터
 */
export async function removeGroup(content, groupId) {
    try {
        const response = await apiClient.delete(GROUP_ENDPOINTS.DELETE, {
            data: {
                content,
                groupId,
            },
        });
        return response.data;
    } catch (error) {
        console.error("그룹 제거 실패:", error);
        throw error;
    }
}

/**
 * 그룹명 변경 (API 호출)
 * PATCH /api/content/group
 * @param {number} groupId - 그룹 ID
 * @param {string} name - 새 그룹명
 * @param {string} content - 콘텐츠 이름 (CONTENT_IDS 키)
 * @returns {Promise<void>}
 */
export async function updateGroupName(groupId, name, content) {
    try {
        await apiClient.patch(GROUP_ENDPOINTS.UPDATE, {
            content,
            groupId,
            name,
        });
    } catch (error) {
        console.error("그룹명 변경 실패:", error);
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
 * 캐릭터 추가 (API 호출, 복수 명 지원)
 * 닉네임을 배열로 전달하여 한 번에 여러 캐릭터 추가 가능
 * @param {string} server - 서버 ID (예: "cain")
 * @param {string[]} nicknames - 캐릭터 닉네임 배열
 * @returns {Promise<{ failed?: Array<{ characterName: string, reason: string }> }>} 응답 body (failed: 추가 실패 목록)
 */
export async function addCharacter(server, nicknames) {
    const list = Array.isArray(nicknames) ? nicknames : [nicknames].filter(Boolean);
    const trimmed = list.map((n) => String(n).trim()).filter(Boolean);
    if (trimmed.length === 0) {
        throw new Error("추가할 캐릭터 닉네임을 입력해 주세요.");
    }
    const response = await apiClient.post(CHARACTER_ENDPOINTS.ADD, {
        server,
        nicknames: trimmed,
    });
    return response.data ?? {};
}

/**
 * 캐릭터 메모 수정 (API 호출)
 * 로그인 필요, 본인 캐릭터만 수정 가능
 * @param {number} characterId - 캐릭터 ID
 * @param {string} memo - 메모 (공백 허용, null → 빈 문자열로 전송)
 * @returns {Promise<void>}
 */
export async function updateCharacterMemo(characterId, memo) {
    try {
        await apiClient.patch(CHARACTER_ENDPOINTS.MEMO, {
            characterId,
            memo: memo ?? "",
        });
    } catch (error) {
        console.error("캐릭터 메모 수정 실패:", error);
        throw error;
    }
}

/**
 * 캐릭터 클리어 상태 갱신 (UpdateClearStateReq: characterIds, content)
 * PATCH /api/characters/clear-state
 * 허용 content: azure_main, goddess_of_death_temple, venus_goddess_of_beauty, nabel, inae, diregie
 * 로그인 필요, 본인 캐릭터만 가능. 해당 content 컬럼만 true로 갱신.
 * @param {number[]} characterIds - 캐릭터 ID 배열
 * @param {string} content - 콘텐츠 식별자 (CONTENT_IDS 키)
 * @returns {Promise<void>}
 */
export async function updateClearState(characterIds, content) {
    try {
        await apiClient.patch(CHARACTER_ENDPOINTS.CLEAR_STATE, {
            characterIds: Array.isArray(characterIds) ? characterIds : [characterIds],
            content,
        });
    } catch (error) {
        console.error("클리어 상태 갱신 실패:", error);
        throw error;
    }
}
