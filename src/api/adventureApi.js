import apiClient from "./client";
import { ADVENTURE_ENDPOINTS } from "./endpoints";
import { CONTENT_IDS } from "@/PC/content/constants";

/**
 * CONTENT_IDS 키(스네이크) → GET /adventure/my-info 캐릭터 객체의 클리어 boolean 필드명(카멜)
 */
export const MY_INFO_CLEAR_FIELD_BY_CONTENT_ID = Object.freeze({
    azure_main: "azureMain",
    goddess_of_death_temple: "goddessOfDeathTemple",
    freed_nightmare: "freedNightmare",
    star_turtle_grand_library: "starTurtleGrandLibrary",
    heretics_castle: "hereticsCastle",
    venus_goddess_of_beauty: "venusGoddessOfBeauty",
    apocalypse: "apocalypse",
    nabel: "nabel",
    inae: "inae",
    diregie: "diregie",
});

/**
 * my-info API 한 건 → 내 정보 카드용 캐릭터 객체
 * @param {object} item
 * @returns {object}
 */
export function mapMyInfoApiCharacter(item) {
    const characterId = item.charactersId ?? item.characterId ?? null;
    /** @type {Record<string, boolean>} */
    const contentClears = {};
    let allClear = true;
    for (const contentId of Object.keys(CONTENT_IDS)) {
        const apiKey = MY_INFO_CLEAR_FIELD_BY_CONTENT_ID[contentId];
        const v = apiKey ? Boolean(item[apiKey]) : false;
        contentClears[contentId] = v;
        if (!v) allClear = false;
    }
    return {
        id: item.id,
        characterId,
        name: item.charactersName ?? "",
        value: item.fame ?? 0,
        fame: item.fame,
        job: item.jobGrowName ?? "",
        memo: item.memo ?? null,
        server: item.server ?? null,
        image: item.img ?? item.image ?? null,
        setEquip: item.setEquip ?? null,
        setOath: item.setOath ?? null,
        clearState: allClear,
        contentClears,
    };
}

/**
 * GET /adventure/my-info — 쿼리는 adventureId 또는 adventureName 중 하나만 전송합니다.
 * @param {{ adventureId?: string|number, adventureName?: string }} [opts]
 * @param {string|number} [opts.adventureId] — 생략 시 로컬 스토리지의 로그인 모험단 ID
 * @param {string} [opts.adventureName] — 다른 모험단 조회(이 값이 있으면 id는 무시)
 * @returns {Promise<object[]>}
 */
export async function fetchMyInfoCharacters(opts = {}) {
    const trimmedName =
        typeof opts.adventureName === "string" ? opts.adventureName.trim() : "";

    let params;
    if (trimmedName) {
        const rawId = opts.adventureId;
        if (rawId != null && String(rawId).trim() !== "") {
            throw new Error("adventureId와 adventureName은 함께 사용할 수 없습니다.");
        }
        params = { adventureName: trimmedName };
    } else {
        const id =
            opts.adventureId != null && String(opts.adventureId).trim() !== ""
                ? String(opts.adventureId).trim()
                : localStorage.getItem("adventureId");
        if (!id) {
            throw new Error("로그인이 필요합니다.");
        }
        params = { adventureId: id };
    }

    const response = await apiClient.get(ADVENTURE_ENDPOINTS.MY_INFO, {
        params,
        _skipErrorAlert: true,
    });
    const list = Array.isArray(response.data?.characters)
        ? response.data.characters
        : [];
    return list
        .map(mapMyInfoApiCharacter)
        .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
}
