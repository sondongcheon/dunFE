/**
 * 공용 API 클라이언트
 * 
 * 모든 API 요청은 이 클라이언트를 통해 수행됩니다.
 * 
 * 사용 방법:
 * ```javascript
 * import apiClient from "@/api/client";
 * 
 * // GET 요청
 * const response = await apiClient.get("/endpoint");
 * 
 * // POST 요청
 * const response = await apiClient.post("/endpoint", data);
 * 
 * // PUT 요청
 * const response = await apiClient.put("/endpoint", data);
 * 
 * // DELETE 요청
 * const response = await apiClient.delete("/endpoint");
 * ```
 * 
 * 환경 변수:
 * - REACT_APP_API_BASE_URL: API 서버의 베이스 URL (.env 파일에 설정)
 */
import axios from "axios";
import { getSafeErrorMessage } from "@/utils/errorMessage";
import { AUTH_ENDPOINTS } from "@/api/endpoints";

// .env는 개발 서버 시작 시에만 주입됨. 수정 후에는 npm start 재실행 필요.
const API_BASE_URL = `${process.env.REACT_APP_API_BASE_URL}`;

// axios 인스턴스 생성
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 10000, // 10초 타임아웃
    withCredentials: true, // 쿠키 자동 전달 (accessToken, refreshToken)
});

// 재발급 요청인지 판별 (401 시 재발급 후 재시도에서 제외하기 위함)
function isReissueRequest(config) {
    const url = config?.url ?? "";
    return url === AUTH_ENDPOINTS.REISSUE || url.endsWith("/adventure/reissue");
}

// 요청 인터셉터
// 모든 요청 전에 실행되며, 인증 토큰 추가 등의 공통 처리를 수행합니다.
apiClient.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 응답 인터셉터
// 401 시 토큰 재발급(/adventure/reissue) 시도 후 원래 요청 재시도.
// 재발급 실패 또는 그 외 오류 시 사용자에게 알림창으로 안내합니다.
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const status = error.response?.status;
        const config = error.config;
        const isRetryable401 =
            status === 401 &&
            config &&
            !config._retried &&
            !isReissueRequest(config);

        if (isRetryable401) {
            config._retried = true;
            try {
                await apiClient.post(AUTH_ENDPOINTS.REISSUE);
                return apiClient.request(config);
            } catch (reissueErr) {
                const message = getSafeErrorMessage(
                    reissueErr,
                    "세션이 만료되었습니다. 다시 로그인해 주세요."
                );
                window.alert(message);
                if (reissueErr.response) {
                    console.error("토큰 재발급 실패:", reissueErr.response.status, reissueErr.response.data);
                } else {
                    console.error("토큰 재발급 실패:", reissueErr);
                }
                return Promise.reject(reissueErr);
            }
        }

        const message = getSafeErrorMessage(error, "오류가 발생했습니다.");
        window.alert(message);

        if (error.response) {
            console.error("API 에러:", error.response.status, error.response.data);
        } else if (error.request) {
            console.error("네트워크 에러:", error.request);
        } else {
            console.error("에러:", error.message);
        }
        return Promise.reject(error);
    }
);

export default apiClient;
