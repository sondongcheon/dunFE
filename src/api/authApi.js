/**
 * 인증 관련 API
 * 
 * 로그인, 로그아웃 등 인증 관련 API 함수들을 정의합니다.
 * 로그인 성공 시 쿠키로 accessToken과 refreshToken이 전달됩니다.
 */

import apiClient from "@/api/client";
import { AUTH_ENDPOINTS } from "@/api/endpoints";
import { getDeviceId } from "@/utils/deviceId";

/**
 * 로그인
 * @param {string} adventureName - 모험단 이름
 * @param {string} password - 비밀번호
 * @returns {Promise<Object>} 로그인 성공 시 { id, adventureName } 반환
 * 
 * 성공 시 서버에서 쿠키로 accessToken과 refreshToken을 전달합니다.
 * withCredentials: true 설정으로 이후 요청에 쿠키가 자동 포함됩니다.
 */
export async function login(adventureName, password) {
    try {
        const deviceId = getDeviceId();
        const response = await apiClient.post(
            AUTH_ENDPOINTS.LOGIN,
            {
                adventureName,
                password,
                deviceId,
            },
            {
                headers: {
                    "X-Device-Id": deviceId,
                },
            }
        );
        
        // 성공 시: { id, adventureName }
        // 쿠키로 accessToken, refreshToken이 자동 설정됨
        return response.data;
    } catch (error) {
        // 실패 시: 에러 응답 처리
        if (error.response) {
            const errorData = error.response.data;
            // 에러 코드와 메시지가 포함된 응답
            throw {
                code: errorData.code || "UNKNOWN",
                message: errorData.message || "로그인에 실패했습니다.",
                status: error.response.status,
            };
        }
        throw {
            code: "NETWORK_ERROR",
            message: "네트워크 오류가 발생했습니다.",
        };
    }
}

/**
 * 로그아웃
 * 쿠키의 토큰을 무효화합니다.
 */
export async function logout() {
    try {
        const deviceId = getDeviceId();
        await apiClient.post(
            AUTH_ENDPOINTS.LOGOUT,
            { deviceId },
            {
                headers: {
                    "X-Device-Id": deviceId,
                },
            }
        );
        // 로컬 스토리지 정리
        localStorage.removeItem("adventureId");
        localStorage.removeItem("adventureName");
    } catch (error) {
        console.error("로그아웃 실패:", error);
        // 로그아웃 실패해도 로컬 스토리지는 정리
        localStorage.removeItem("adventureId");
        localStorage.removeItem("adventureName");
        throw error;
    }
}

/**
 * 현재 로그인한 사용자 정보 확인 (인증 상태 검증용)
 * 쿠키의 토큰이 유효한지 확인합니다.
 * 인증 실패 시 알림을 띄우지 않습니다 (페이지 로드 시 조용히 검증).
 * @returns {Promise<Object|null>} 성공 시 { id, adventureName } 반환, 실패 시 null
 */
export async function verifyAuth() {
    try {
        // 인터셉터에서 alert를 띄우지 않도록 config에 플래그 추가
        const response = await apiClient.get(AUTH_ENDPOINTS.ME, {
            _skipErrorAlert: true, // 인터셉터에서 알림 건너뛰기 플래그
        });
        return response.data; // { id, adventureName }
    } catch (error) {
        // 401 또는 기타 인증 실패 시 null 반환 (에러는 조용히 처리)
        if (error.response?.status === 401 || error.response?.status === 403) {
            return null;
        }
        // 네트워크 오류 등은 조용히 null 반환 (재시도는 하지 않음)
        console.warn("인증 확인 중 오류 발생:", error);
        return null;
    }
}

/** 던담 최신화(memoUpdate) 전용 — 서버 처리가 길 수 있어 공용 10초보다 길게 둠 */
const MEMO_UPDATE_TIMEOUT_MS = 300_000;

/**
 * 던담 기반 캐릭터 동기화 + 메모(딜량) 갱신
 * GET /adventure/memoUpdate?adventureName=...&check=...
 * @param {string} adventureName - 현재 로그인된 모험단명
 * @param {boolean} check - 캐릭터 순회 갱신 등 서버 옵션
 * @returns {Promise<any>} 서버 응답 데이터
 */
export async function memoUpdateByAdventureName(adventureName, check) {
    const response = await apiClient.get(AUTH_ENDPOINTS.MEMO_UPDATE, {
        params: { adventureName, check },
        timeout: MEMO_UPDATE_TIMEOUT_MS,
    });
    return response.data;
}

/**
 * 던담 HTML 일부/전체로 메모 등 갱신
 * POST /adventure/memoUpdate/html — MemoUpdateFromHtmlReq { html }
 * @param {string} html
 * @returns {Promise<any>}
 */
export async function memoUpdateFromHtml(html) {
    const response = await apiClient.post(
        AUTH_ENDPOINTS.MEMO_UPDATE_HTML,
        { html },
        { _skipErrorAlert: true },
    );
    return response.data;
}

/**
 * 관리자 게이트 비밀번호 서버 검증
 * POST /adventure/test/pass?password=...
 * @param {string} password
 * @returns {Promise<boolean>} 서버가 true일 때만 통과
 */
export async function verifyAdminGatePassword(password) {
    const response = await apiClient.post(AUTH_ENDPOINTS.ADMIN_TEST_PASS, null, {
        params: { password },
        _skipErrorAlert: true,
    });
    return response.data === true;
}
