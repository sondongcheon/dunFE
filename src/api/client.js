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

// .env에서 API 베이스 URL 가져오기 (없으면 기본값 사용)
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://dunroot.com/api";

// axios 인스턴스 생성
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 10000, // 10초 타임아웃
    withCredentials: true, // 쿠키 자동 전달 (accessToken, refreshToken)
});

// 요청 인터셉터
// 모든 요청 전에 실행되며, 인증 토큰 추가 등의 공통 처리를 수행합니다.
apiClient.interceptors.request.use(
    (config) => {
        // 요청 전 처리 (예: 인증 토큰 추가)
        // const token = localStorage.getItem("token");
        // if (token) {
        //   config.headers.Authorization = `Bearer ${token}`;
        // }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 응답 인터셉터
// 모든 응답에 대해 공통 에러 처리를 수행합니다.
apiClient.interceptors.response.use(
    (response) => {
        // 성공 응답은 그대로 반환
        return response;
    },
    (error) => {
        // 공통 에러 처리
        if (error.response) {
            // 서버가 응답했지만 에러 상태 코드
            console.error("API 에러:", error.response.status, error.response.data);
        } else if (error.request) {
            // 요청은 보냈지만 응답을 받지 못함
            console.error("네트워크 에러:", error.request);
        } else {
            // 요청 설정 중 에러 발생
            console.error("에러:", error.message);
        }
        return Promise.reject(error);
    }
);

export default apiClient;
