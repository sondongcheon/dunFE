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
};

// Group 관련 엔드포인트
export const GROUP_ENDPOINTS = {
    CREATE: "/group",
    LIST: "/group",
};

// Member 관련 엔드포인트
export const MEMBER_ENDPOINTS = {
    ADD: "/content/member",
    REMOVE: "/content/member",
};

// Auth 관련 엔드포인트
export const AUTH_ENDPOINTS = {
    LOGIN: "/adventure/login",
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
