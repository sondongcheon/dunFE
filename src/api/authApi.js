/**
 * 인증 관련 API
 * 
 * 로그인, 로그아웃 등 인증 관련 API 함수들을 정의합니다.
 */

import apiClient from "@/api/client";
import { AUTH_ENDPOINTS } from "@/api/endpoints";

/**
 * 로그인
 * @param {string} input - 사용자가 입력한 문자열
 * @returns {Promise<Object>} 로그인 성공 시 { id, adventureName } 반환
 */
export async function login(input) {
    try {
        const response = await apiClient.post(AUTH_ENDPOINTS.LOGIN, {
            adventureName: input,
        });
        
        // 성공 시: { id, adventureName }
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
