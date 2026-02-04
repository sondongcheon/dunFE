import React, { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { addCharacter } from "@/api/contentApi";

// 서버 목록 데이터
const SERVERS = [
  { serverId: "cain", serverName: "카인" },
  { serverId: "diregie", serverName: "디레지에" },
  { serverId: "siroco", serverName: "시로코" },
  { serverId: "prey", serverName: "프레이" },
  { serverId: "casillas", serverName: "카시야스" },
  { serverId: "hilder", serverName: "힐더" },
  { serverId: "anton", serverName: "안톤" },
  { serverId: "bakal", serverName: "바칼" },
];

/**
 * 캐릭터 추가 모달 컴포넌트
 * @param {boolean} [open] - 제어 모드일 때 열림 상태 (모바일 등 외부에서 열 때 사용)
 * @param {function} [onOpenChange] - 제어 모드일 때 열림 상태 변경 콜백
 * @param {boolean} [showTrigger=true] - false면 트리거 버튼 미렌더 (제어 모드 전용)
 */
function CharacterAddModal({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  showTrigger = true,
}) {
  const [input, setInput] = useState("");
  const [selectedServerId, setSelectedServerId] = useState("");
  const [internalOpen, setInternalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isControlled = controlledOpen !== undefined && controlledOnOpenChange != null;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? controlledOnOpenChange : setInternalOpen;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!input.trim() || !selectedServerId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // API 호출: 캐릭터 추가
      // server: selectedServerId (예: "cain")
      // characterName: input (예: "구름테스트")
      await addCharacter(selectedServerId, input.trim());

      // 성공 시 alert 표시
      alert("캐릭터가 성공적으로 추가되었습니다.");

      // 성공 시 모달 닫기
      setOpen(false);
      setInput("");
      setSelectedServerId("");
      setError(null);
    } catch (err) {
      // 에러 발생 시 모달을 닫지 않고 에러 메시지만 표시
      // 서버에서 보낸 메시지가 있으면 그것을 사용, 없으면 기본 메시지
      const errorMessage =
        err.response?.data?.message || err.message || "캐릭터 추가에 실패했습니다.";
      setError(errorMessage);
      console.error("캐릭터 추가 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen) => {
    if (!loading) {
      setOpen(newOpen);
      if (!newOpen) {
        setInput("");
        setSelectedServerId("");
        setError(null);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {showTrigger && (
        <DialogTrigger asChild>
          <button className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            캐릭터 추가
          </button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-6">
        <DialogHeader>
          <DialogTitle>캐릭터 추가</DialogTitle>
          <DialogDescription>캐릭터 정보를 입력해주세요.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label
                htmlFor="server-select"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                서버
              </label>
              <select
                id="server-select"
                value={selectedServerId}
                onChange={(e) => {
                  setSelectedServerId(e.target.value);
                  setError(null);
                }}
                disabled={loading}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">서버를 선택하세요</option>
                {SERVERS.map((server) => (
                  <option key={server.serverId} value={server.serverId}>
                    {server.serverName}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label
                htmlFor="character-input"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                입력값
              </label>
              <input
                id="character-input"
                type="text"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setError(null);
                }}
                disabled={loading}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="캐릭터 이름을 입력하세요"
                autoFocus
              />
              {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <button
                type="button"
                disabled={loading}
                className="px-4 py-2 mr-4 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                취소
              </button>
            </DialogClose>
            <button
              type="submit"
              disabled={loading || !input.trim() || !selectedServerId}
              className="px-4 py-2 text-sm font-medium text-white bg-gray-800 dark:bg-gray-600 rounded-md hover:bg-gray-700 dark:hover:bg-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "추가 중..." : "추가하기"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CharacterAddModal;
