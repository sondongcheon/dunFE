/**
 * 서버 영문 ID ↔ 한글 이름 매핑
 * 던담 URL 등에서 서버 파라미터는 영문 serverId 사용
 */
const SERVER_ROWS = [
  { serverId: "cain", serverName: "카인" },
  { serverId: "diregie", serverName: "디레지에" },
  { serverId: "siroco", serverName: "시로코" },
  { serverId: "prey", serverName: "프레이" },
  { serverId: "casillas", serverName: "카시야스" },
  { serverId: "hilder", serverName: "힐더" },
  { serverId: "anton", serverName: "안톤" },
  { serverId: "bakal", serverName: "바칼" },
];

const SERVER_ID_SET = new Set(SERVER_ROWS.map((r) => r.serverId));
const NAME_TO_ID = Object.fromEntries(
  SERVER_ROWS.map((r) => [r.serverName, r.serverId])
);

/**
 * 서버 값(한글명 또는 영문 ID)을 던담 URL용 영문 serverId로 변환
 * @param {string} server - API에서 오는 서버 값 (예: "카인" 또는 "cain")
 * @returns {string} 영문 serverId (예: "cain"), 변환 불가 시 원본 반환
 */
export function toServerIdForUrl(server) {
  if (!server || typeof server !== "string") return "";
  const trimmed = server.trim();
  if (SERVER_ID_SET.has(trimmed)) return trimmed;
  return NAME_TO_ID[trimmed] ?? trimmed;
}
