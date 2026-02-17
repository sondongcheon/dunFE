import { v4 as uuidv4 } from "uuid";

/**
 * 기기 식별자(deviceId)를 가져옵니다.
 * localStorage에 저장되어 있으면 그것을 사용하고, 없으면 새로 생성하여 저장합니다.
 * 
 * @returns {string} UUID v4 형식의 기기 식별자
 */
export function getDeviceId() {
  let deviceId = localStorage.getItem("deviceId");

  if (!deviceId) {
    // UUID v4 생성
    deviceId = uuidv4();
    localStorage.setItem("deviceId", deviceId);
  }

  return deviceId;
}
