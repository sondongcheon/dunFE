const SETPOINT_ICON_BASE = "https://resource.df.nexon.com/ui/img/web/setpoint";

/**
 * equip/oath 문구에 포함된 키워드로 setpoint 아이콘 번호(01–13) 결정.
 * 위에서부터 순서대로 첫 매칭만 사용.
 */
const SETPOINT_KEYWORD_RULES = [
  { num: "01", keys: ["그림자", "죽음"] },
  { num: "02", keys: ["페어리"] },
  { num: "03", keys: ["이상향", "황금"] },
  { num: "04", keys: ["용투"] },
  { num: "05", keys: ["정화"] },
  { num: "06", keys: ["세렌디피티", "행운"] },
  { num: "07", keys: ["에너지"] },
  { num: "08", keys: ["자연"] },
  { num: "09", keys: ["발키리"] },
  { num: "10", keys: ["에테리얼", "여우"] },
  { num: "11", keys: ["무리"] },
  { num: "12", keys: ["마력"] },
  { num: "13", keys: ["이야기"] },
];

/**
 * @param {unknown} sourceText
 * @returns {string|null} 매칭 시 이미지 URL, 값 없음·매칭 없음이면 null (아이콘 미표시)
 */
export function resolveSetpointIconUrl(sourceText) {
  if (sourceText == null) return null;
  const s = String(sourceText);
  if (!s.trim()) return null;
  for (const rule of SETPOINT_KEYWORD_RULES) {
    const { num, keys } = rule ?? {};
    if (!num || !Array.isArray(keys)) continue;
    for (const key of keys) {
      if (key && s.includes(key)) {
        return `${SETPOINT_ICON_BASE}/${num}.png`;
      }
    }
  }
  return null;
}
