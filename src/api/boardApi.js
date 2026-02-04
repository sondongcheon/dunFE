/**
 * Board(공지) 관련 API
 */

import apiClient from "@/api/client";
import { BOARD_ENDPOINTS } from "@/api/endpoints";

/**
 * 공지사항 등록
 * @param {Object} payload
 * @param {boolean} payload.important - 중요 공지 여부
 * @param {string} payload.title - 제목
 * @param {string} payload.content - 내용
 * @returns {Promise<Object>} 서버 응답 데이터
 */
export async function createNotice({ important, title, content }) {
    const response = await apiClient.post(BOARD_ENDPOINTS.NOTICE, {
        important: !!important,
        title: title?.trim() ?? "",
        content: content?.trim() ?? "",
    });
    return response.data;
}

const NOTICE_PAGE_SIZE = 10;

/**
 * 공지사항 목록 조회 (페이징)
 * - 페이지: path 로 전달 (GET /board/notice/0, /board/notice/1, ...)
 * - size: 쿼리로 10 고정 전달
 * @param {number} [page=0] - 페이지 번호 (0부터)
 * @returns {Promise<{ list: Array, totalElements: number, totalPages: number, page: number }>}
 */
export async function getNoticeList(page = 0) {
    const pageNum = Number(page) || 0;
    const url = `${BOARD_ENDPOINTS.NOTICE}/list/${pageNum}`;
    const response = await apiClient.get(url, {
        params: { size: NOTICE_PAGE_SIZE },
    });
    const data = response.data;
    const list = Array.isArray(data.content)
        ? data.content
        : Array.isArray(data.list)
          ? data.list
          : [];
    return {
        list,
        totalElements: data.totalElements ?? data.total ?? list.length,
        totalPages: data.totalPages ?? (NOTICE_PAGE_SIZE > 0 ? Math.ceil((data.totalElements ?? data.total ?? list.length) / NOTICE_PAGE_SIZE) : 0),
        page: data.number ?? data.page ?? pageNum,
    };
}

// --- 코멘트 게시판 (GET /:page path, POST body, PATCH /:id) ---

/**
 * 코멘트 목록 조회
 * GET /board/comment/{page} (pathVariable, size는 미전송·서버 기본값 사용)
 * @param {number} [page=0] - 페이지 (0부터)
 * @returns {Promise<{ list: Array, totalElements: number, totalPages: number, page: number }>}
 */
export async function getCommentList(page = 0) {
    const pageNum = Number(page) || 0;
    const url = `${BOARD_ENDPOINTS.COMMENT}/list/${pageNum}`;
    const response = await apiClient.get(url);
    const data = response.data;
    const list = Array.isArray(data.content)
        ? data.content
        : Array.isArray(data.list)
          ? data.list
          : [];
    return {
        list,
        totalElements: data.totalElements ?? data.total ?? list.length,
        totalPages: data.totalPages ?? 0,
        page: data.number ?? data.page ?? pageNum,
    };
}

/**
 * 코멘트 등록 (로그인 필수, principal에서 닉네임 사용)
 * POST /board/comment
 * @param {Object} payload
 * @param {string} payload.content - 내용
 * @param {boolean} [payload.hideName=false] - 이름 비공개 여부
 */
export async function createComment({ content, hideName }) {
    const response = await apiClient.post(BOARD_ENDPOINTS.COMMENT, {
        content: (content ?? "").trim(),
        hideName: !!hideName,
    });
    return response.data;
}

/**
 * 코멘트 수정 (본인만 가능)
 * PATCH /board/comment/{id}
 * @param {number} id - 코멘트 id
 * @param {Object} payload
 * @param {string} payload.content - 수정할 내용
 */
export async function updateComment(id, { content }) {
    const response = await apiClient.patch(`${BOARD_ENDPOINTS.COMMENT}/${id}`, {
        content: (content ?? "").trim(),
    });
    return response.data;
}
