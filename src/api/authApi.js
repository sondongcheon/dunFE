/**
 * 인증 관련 API
 * 
 * 로그인, 로그아웃 등 인증 관련 API 함수들을 정의합니다.
 * 로그인 성공 시 쿠키로 accessToken과 refreshToken이 전달됩니다.
 */

import apiClient from "@/api/client";
import { AUTH_ENDPOINTS } from "@/api/endpoints";

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
        const response = await apiClient.post(AUTH_ENDPOINTS.LOGIN, {
            adventureName,
            password,
        });
        
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
        await apiClient.post(AUTH_ENDPOINTS.LOGOUT);
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
