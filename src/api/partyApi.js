/**
 * Party 관련 API
 * 
 * 파티 생성, 모험단 초대, 퍼블릭 그룹 관리 등 파티 관련 API 함수들을 정의합니다.
 */

import apiClient from "@/api/client";
import { PARTY_ENDPOINTS } from "@/api/endpoints";

/**
 * 파티 생성
 * @param {string} contentName - 콘텐츠 이름 (CONTENT_IDS의 키 값, 예: "nabel")
 * @param {string} name - 파티 이름
 * @param {string} password - 파티 비밀번호 (선택, 공백 허용)
 * @returns {Promise<Object>} 생성된 파티 정보
 */
export async function createParty(contentName, name, password) {
    try {
        const response = await apiClient.post(PARTY_ENDPOINTS.CREATE, {
            content: contentName,
            name,
            password: password || "", // 비밀번호가 없으면 빈 문자열
        });
        
        return response.data;
    } catch (error) {
        console.error("파티 생성 실패:", error);
        throw error;
    }
}

/**
 * 파티 참여 (다른 사람이 만든 파티에 참여)
 * @param {string} content - 콘텐츠 이름 (CONTENT_IDS의 키 값)
 * @param {string} partyName - 파티 이름
 * @param {string} leaderAdventureName - 리더 모험단 닉네임
 * @param {string} password - 비밀번호 (공백 허용)
 * @returns {Promise<Object>} 응답 데이터
 */
export async function joinParty(content, partyName, leaderAdventureName, password) {
    try {
        const response = await apiClient.post(PARTY_ENDPOINTS.JOIN, {
            content,
            partyName,
            leaderAdventureName,
            password: password || "",
        });
        return response.data;
    } catch (error) {
        console.error("파티 참여 실패:", error);
        throw error;
    }
}

/**
 * 파티에 모험단 초대 (파티 리더만 가능)
 * @param {string} content - 콘텐츠 이름 (CONTENT_IDS의 키 값)
 * @param {number} partyId - 파티 ID
 * @param {string} adventureName - 초대할 모험단 이름
 * @returns {Promise<Object>} 응답 데이터
 */
export async function inviteAdventureToParty(content, partyId, adventureName) {
    try {
        const response = await apiClient.post(PARTY_ENDPOINTS.INVITE, {
            content,
            partyId,
            adventureName: adventureName?.trim() || "",
        });
        return response.data;
    } catch (error) {
        console.error("모험단 초대 실패:", error);
        throw error;
    }
}

/**
 * 파티 삭제 (파티 리더만 가능, 그룹/멤버/파티-모험단 순서로 삭제 후 파티 삭제)
 * @param {string} content - 콘텐츠 이름 (CONTENT_IDS의 키 값)
 * @param {number} partyId - 파티 ID
 * @returns {Promise<Object>} 응답 데이터
 */
export async function removeParty(content, partyId) {
    try {
        const response = await apiClient.delete(PARTY_ENDPOINTS.DELETE, {
            data: {
                content,
                partyId,
            },
        });
        return response.data;
    } catch (error) {
        console.error("파티 삭제 실패:", error);
        throw error;
    }
}

/**
 * 파티 이름 변경
 * @param {string} content - 콘텐츠 이름 (CONTENT_IDS의 키 값)
 * @param {number} partyId - 파티 ID
 * @param {string} name - 새 파티 이름
 * @returns {Promise<Object>} 응답 데이터
 */
export async function updatePartyName(content, partyId, name) {
    try {
        const response = await apiClient.patch(PARTY_ENDPOINTS.UPDATE, {
            content,
            partyId,
            name,
        });
        return response.data;
    } catch (error) {
        console.error("파티 이름 변경 실패:", error);
        throw error;
    }
}

/**
 * 파티 내 그룹 생성
 * @param {string} content - 콘텐츠 이름 (CONTENT_IDS의 키 값)
 * @param {number} partyId - 파티 ID
 * @param {string} name - 그룹 이름
 * @returns {Promise<Object>} 생성된 그룹 정보
 */
export async function createPartyGroup(content, partyId, name) {
    try {
        const response = await apiClient.post(PARTY_ENDPOINTS.CREATE_GROUP, {
            content,
            partyId,
            name,
        });
        return response.data;
    } catch (error) {
        console.error("파티 그룹 생성 실패:", error);
        throw error;
    }
}

/**
 * 파티 그룹 이름 변경
 * @param {string} content - 콘텐츠 이름 (CONTENT_IDS의 키 값)
 * @param {number} partyGroupId - 파티 그룹 ID
 * @param {string} name - 새 그룹 이름
 * @returns {Promise<Object>} 응답 데이터
 */
export async function updatePartyGroupName(content, partyGroupId, name) {
    try {
        const response = await apiClient.patch(PARTY_ENDPOINTS.UPDATE_GROUP, {
            content,
            partyGroupId,
            name,
        });
        return response.data;
    } catch (error) {
        console.error("파티 그룹 이름 변경 실패:", error);
        throw error;
    }
}

/**
 * 파티 그룹 삭제 (해당 그룹의 모든 멤버 삭제 후 그룹 삭제)
 * @param {string} content - 콘텐츠 이름 (CONTENT_IDS의 키 값)
 * @param {number} partyGroupId - 파티 그룹 ID
 * @returns {Promise<Object>} 응답 데이터
 */
export async function removePartyGroup(content, partyGroupId) {
    try {
        const response = await apiClient.delete(PARTY_ENDPOINTS.DELETE_GROUP, {
            data: {
                content,
                partyGroupId,
            },
        });
        return response.data;
    } catch (error) {
        console.error("파티 그룹 삭제 실패:", error);
        throw error;
    }
}

/**
 * 파티 그룹에 캐릭터 추가
 * @param {string} content - 콘텐츠 이름 (CONTENT_IDS의 키 값)
 * @param {number} partyGroupId - 파티 그룹 ID
 * @param {number} characterId - 캐릭터 ID
 * @returns {Promise<Object>} 응답 데이터
 */
export async function addPartyMember(content, partyGroupId, characterId) {
    try {
        const response = await apiClient.post(PARTY_ENDPOINTS.ADD_MEMBER, {
            content,
            partyGroupId,
            characterId,
        });
        return response.data;
    } catch (error) {
        console.error("파티 그룹 멤버 추가 실패:", error);
        throw error;
    }
}

/**
 * 파티 그룹에서 캐릭터 제거
 * @param {string} content - 콘텐츠 이름 (CONTENT_IDS의 키 값)
 * @param {number} partyGroupId - 파티 그룹 ID
 * @param {number} characterId - 캐릭터 ID
 * @returns {Promise<Object>} 응답 데이터
 */
export async function removePartyMember(content, partyGroupId, characterId) {
    try {
        const response = await apiClient.delete(PARTY_ENDPOINTS.REMOVE_MEMBER, {
            data: {
                content,
                partyGroupId,
                characterId,
            },
        });
        return response.data;
    } catch (error) {
        console.error("파티 그룹 멤버 제거 실패:", error);
        throw error;
    }
}

/** 팀당 슬롯 수 (순서 유지용) */
const SLOTS_PER_TEAM = 4;

/**
 * 슬롯 순서를 유지한 채 서버용 배열로 변환.
 * 1번째 칸=인덱스0, 4번째 칸=인덱스3 등 순서 그대로, 빈 칸은 null.
 */
function toOrderedLongList(arr) {
    if (!Array.isArray(arr)) return Array(SLOTS_PER_TEAM).fill(null);
    return Array.from({ length: SLOTS_PER_TEAM }, (_, i) => {
        const id = arr[i];
        if (id == null || id === "") return null;
        const n = Number(id);
        return Number.isFinite(n) ? n : null;
    });
}

/**
 * 단일 공대편성 DTO로 변환 (서버 Request body 1건)
 */
function toFormationDto(contentName, partyId, raid) {
    const teams = raid.teams || {};
    return {
        contentName,
        partyId: String(partyId),
        order: Number(raid.order),
        name: raid.name || "",
        teams: {
            red: toOrderedLongList(teams.RED),
            yellow: toOrderedLongList(teams.YELLOW),
            green: toOrderedLongList(teams.GREEN),
        },
    };
}

/**
 * 공대편성 조회 (GET)
 * Response: [{ order, name, teams: { red, yellow, green } }, ...] — order 순서, teams는 슬롯 순서 유지 (null = 빈 칸)
 */
export async function getPartyFormation(contentName, partyId) {
    const response = await apiClient.get(PARTY_ENDPOINTS.FORMATION, {
        params: { contentName, partyId: String(partyId) },
    });
    return Array.isArray(response.data) ? response.data : [];
}

/**
 * 공대편성 페이지 첫 로딩 (캐릭터 목록 + 편성 한 번에)
 * GET /content/party/formation/page?contentName=...&partyId=...&adventureId=... (adventureId 임시)
 * Response: { characterList: { id, name, adventures: {}, groups: {} }, formationList: [{ order, name, teams }] }
 */
export async function getPartyFormationPage(contentName, partyId, adventureId = 1) {
    const response = await apiClient.get(PARTY_ENDPOINTS.FORMATION_PAGE, {
        params: {
            contentName,
            partyId: String(partyId),
            adventureId: Number(adventureId) || 1,
        },
    });
    console.log(response.data);
    return response.data || {};
}

/**
 * 공대편성 저장 (PUT) — 공대별로 단일 DTO씩 PUT 요청
 * Request DTO 1건: contentName, partyId, order, name, teams(red, yellow, green: List<Long>)
 */
export async function savePartyFormation(contentName, partyId, raids) {
    const list = raids || [];
    let lastData = null;
    for (const raid of list) {
        const body = toFormationDto(contentName, partyId, raid);
        const response = await apiClient.put(PARTY_ENDPOINTS.FORMATION, body);
        lastData = response.data;
    }
    return lastData;
}
