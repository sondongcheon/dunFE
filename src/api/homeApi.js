/**
 * Home(메인/방문자 통계) 관련 API
 */

import apiClient from "@/api/client";
import { HOME_ENDPOINTS } from "@/api/endpoints";

/**
 * 오늘/이번주/누적 방문자 통계 조회
 * - /api/home/** 도메인 cookie로 카운트되므로 조회 시 서버에서 자동 카운트 처리
 * @returns {Promise<{ todayCount: number, weekCount: number, totalCount: number, date: string, weekRange: string }>}
 */
export async function fetchTodayStats() {
    const response = await apiClient.get(HOME_ENDPOINTS.TODAY);
    const data = response.data;
    return {
        todayCount: data.todayCount ?? 0,
        weekCount: data.weekCount ?? 0,
        totalCount: data.totalCount ?? 0,
        date: data.date ?? "",
        weekRange: data.weekRange ?? "",
    };
}
