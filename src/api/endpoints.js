/**
 * API 엔드포인트 상수
 * 
 * 모든 API 엔드포인트를 중앙에서 관리합니다.
 * 엔드포인트가 변경되면 이 파일만 수정하면 됩니다.
 */

// Character 관련 엔드포인트
export const CHARACTER_ENDPOINTS = {
    LIST: "/characters",
    ADD: "/characters",
    MEMO: "/characters/memo",
    CLEAR_STATE: "/characters/clear-state",
};

// Group 관련 엔드포인트
export const GROUP_ENDPOINTS = {
    CREATE: "/content/group",
    LIST: "/group",
    UPDATE: "/content/group",
    DELETE: "/content/group",
};

// Member 관련 엔드포인트
export const MEMBER_ENDPOINTS = {
    ADD: "/content/member",
    REMOVE: "/content/member",
};

// Auth 관련 엔드포인트
export const AUTH_ENDPOINTS = {
    LOGIN: "/adventure/login",
    LOGOUT: "/adventure/logout",
    REISSUE: "/adventure/reissue",
    ME: "/adventure/me", // 현재 로그인한 사용자 정보 확인 (인증 상태 검증용)
    MEMO_UPDATE: "/adventure/memoUpdate",
};

// User 관련 엔드포인트 (예시)
// export const USER_ENDPOINTS = {
//   PROFILE: "/user/profile",
//   UPDATE: "/user/update",
// };

// Content 관련 엔드포인트
export const CONTENT_ENDPOINTS = {
    DETAIL: "/content",
};

// Home(방문자 통계) 관련 엔드포인트
export const HOME_ENDPOINTS = {
    TODAY: "/home/today",
};

// Board(공지·코멘트) 관련 엔드포인트
export const BOARD_ENDPOINTS = {
    NOTICE: "/board/notice",
    COMMENT: "/board/comment",
};

// Party 관련 엔드포인트
export const PARTY_ENDPOINTS = {
    CREATE: "/content/party",
    JOIN: "/content/party/join",
    INVITE: "/content/party/invite",
    UPDATE: "/content/party",
    DELETE: "/content/party",
    CREATE_GROUP: "/content/party/group",
    UPDATE_GROUP: "/content/party/group",
    DELETE_GROUP: "/content/party/group",
    ADD_MEMBER: "/content/party/group/member",
    REMOVE_MEMBER: "/content/party/group/member",
    /** 공대편성 조회 (GET) / 저장 (PUT) - content/party/formation */
    FORMATION: "/content/party/formation",
    /** 공대편성 페이지 첫 로딩 (캐릭터 목록 + 편성 한 번에) - content/party/formation/page */
    FORMATION_PAGE: "/content/party/formation/page",
};
