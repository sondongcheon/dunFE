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
};
