/**
 * 클라이언트에 노출할 오류 메시지를 안전하게 추출합니다.
 * 스택 트레이스, 내부 경로, 5xx 상세 등은 노출하지 않고 fallback 또는 짧은 사용자용 메시지만 반환합니다.
 *
 * @param {unknown} err - catch 블록에서 받은 에러 (axios error 등)
 * @param {string} fallback - 노출이 부적절할 때 사용할 기본 메시지
 * @returns {string} 클라이언트에 노출해도 되는 메시지
 */
export function getSafeErrorMessage(err, fallback = "오류가 발생했습니다.") {
  if (err == null) return fallback;

  const status = err.response?.status;
  const data = err.response?.data;
  const serverMessage =
    typeof data?.message === "string" ? data.message.trim() : "";
  const thrownMessage =
    typeof err.message === "string" ? err.message.trim() : "";

  // 5xx: 내부 상세 노출 방지
  if (err.response && status >= 500 && status < 600) {
    return fallback;
  }

  // axios 응답이 있는 경우: err.response.data.message를 최우선 사용, 없거나 안전하지 않을 때만 공통 문구 사용
  if (err.response) {
    if (serverMessage && isSafeToShow(serverMessage, status)) return serverMessage;
    if (status === 401) return "로그인이 필요합니다.";
    if (status === 403) return "권한이 없습니다.";
    if (status === 404) return "요청한 항목을 찾을 수 없습니다.";
    return fallback;
  }

  // 응답 없음(네트워크/타임아웃) 또는 throw된 객체: message가 안전할 때만 사용
  if (thrownMessage && isSafeToShow(thrownMessage)) return thrownMessage;
  return fallback;
}

/**
 * 서버에서 온 문자열이 그대로 노출해도 되는지 검사합니다.
 * 스택 트레이스, 파일 경로, 내부 에러 형식이면 false.
 * 4xx일 때는 서버가 사용자용 메시지를 보낸 경우가 많아 "Error:" 접두어는 허용합니다.
 * @param {string} message
 * @param {number} [status] - 4xx면 검사 완화
 */
function isSafeToShow(message, status) {
  if (typeof message !== "string" || message.length > 300) return false;
  const is4xx = status >= 400 && status < 500;
  const unsafePatterns = [
    /\bat\s+\w+:/i,           // "at Object.<anonymous>:"
    /\.(js|ts|jsx|tsx|mjs)\s*:\s*\d+/i,  // "file.js:123"
    /\/[\w.-]+\/(?:src|dist|node|api)/i, // 경로
    /stack\s*trace/i,
    /exception\s*:/i,
    /undefined\s+is\s+not/i,
    /cannot\s+read\s+property/i,
    /failed\s+to\s+fetch/i,
    /network\s+error/i,
    /econnrefused|econnreset|etimedout|enotfound/i,
  ];
  // 4xx가 아니면 "Error:" 접두어도 차단 (내부 에러 메시지일 수 있음)
  if (!is4xx) {
    unsafePatterns.push(/^\s*error\s*:/im);
  }
  return !unsafePatterns.some((re) => re.test(message));
}
