/**
 * API 엔드포인트 상수
 * 
 * 모든 API 엔드포인트를 중앙에서 관리합니다.
 * 엔드포인트가 변경되면 이 파일만 수정하면 됩니다.
 */

// Test 관련 엔드포인트
export const TEST_ENDPOINTS = {
    CHARACTERS: "/test/characters",
};

// Group 관련 엔드포인트
export const GROUP_ENDPOINTS = {
    CREATE: "/group",
    LIST: "/group",
};

// Member 관련 엔드포인트
export const MEMBER_ENDPOINTS = {
    ADD: "/member",
    REMOVE: "/member",
};

// User 관련 엔드포인트 (예시)
// export const USER_ENDPOINTS = {
//   PROFILE: "/user/profile",
//   UPDATE: "/user/update",
// };

// Content 관련 엔드포인트 (예시)
// export const CONTENT_ENDPOINTS = {
//   LIST: "/content/list",
//   DETAIL: "/content/detail",
// };
