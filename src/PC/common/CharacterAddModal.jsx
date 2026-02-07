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
  const [inputs, setInputs] = useState([""]);
  const [selectedServerId, setSelectedServerId] = useState("");
  const [internalOpen, setInternalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [addResult, setAddResult] = useState(null);

  const isControlled = controlledOpen !== undefined && controlledOnOpenChange != null;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? controlledOnOpenChange : setInternalOpen;

  const updateInput = (index, value) => {
    setInputs((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
    setError(null);
  };

  const addRow = () => {
    setInputs((prev) => [...prev, ""]);
  };

  const removeRow = (index) => {
    if (inputs.length <= 1) return;
    setInputs((prev) => prev.filter((_, i) => i !== index));
  };

  const nicknamesFromInputs = inputs.map((s) => s.trim()).filter(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (nicknamesFromInputs.length === 0 || !selectedServerId) {
      setError(!selectedServerId ? "서버를 선택해 주세요." : "캐릭터 닉네임을 입력해 주세요.");
      return;
    }

    setLoading(true);
    setError(null);
    setAddResult(null);

    try {
      const result = await addCharacter(selectedServerId, nicknamesFromInputs);
      const failed = result.failed ?? [];
      const successCount = nicknamesFromInputs.length - failed.length;

      setAddResult({ successCount, failed });

      if (failed.length === 0) {
        setOpen(false);
        setInputs([""]);
        setSelectedServerId("");
        setAddResult(null);
        alert(
          successCount > 1
            ? `캐릭터 ${successCount}명이 성공적으로 추가되었습니다.`
            : "캐릭터가 성공적으로 추가되었습니다.",
        );
      }
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
        setInputs([""]);
        setSelectedServerId("");
        setError(null);
        setAddResult(null);
      }
    }
  };

  const canSubmit = nicknamesFromInputs.length > 0 && selectedServerId && !loading;

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
          <DialogDescription>
            서버를 선택하고, 추가할 캐릭터 닉네임을 입력하세요. <br />
            입력 칸을 추가해 여러 명을 넣을 수 있습니다.
          </DialogDescription>
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
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  닉네임
                </label>
                <button
                  type="button"
                  onClick={addRow}
                  disabled={loading}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
                >
                  + 입력 칸 추가
                </button>
              </div>
              <div className="space-y-2 max-h-[200px] overflow-y-auto p-1 -m-1">
                {inputs.map((value, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => updateInput(index, e.target.value)}
                      disabled={loading}
                      placeholder="캐릭터 닉네임"
                      className="flex-1 min-w-0 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                      autoFocus={index === 0 && inputs.length === 1}
                    />
                    <button
                      type="button"
                      onClick={() => removeRow(index)}
                      disabled={loading || inputs.length <= 1}
                      className="shrink-0 px-3 py-2 text-sm font-medium border border-gray-300 dark:border-gray-600 rounded-md text-gray-600 dark:text-gray-400 hover:bg-red-50 hover:border-red-300 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:border-red-700 dark:hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-gray-300 dark:disabled:hover:border-gray-600"
                      aria-label="이 입력 칸 삭제"
                    >
                      삭제
                    </button>
                  </div>
                ))}
              </div>
              {nicknamesFromInputs.length > 0 && !addResult && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {nicknamesFromInputs.length}명 추가 예정
                </p>
              )}
              {addResult && addResult.failed.length > 0 && (
                <div className="rounded-md border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-3 space-y-1">
                  {addResult.successCount > 0 && (
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {addResult.successCount}명 추가됨.
                    </p>
                  )}
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    {addResult.failed.length}명 실패:
                  </p>
                  <ul className="text-xs text-amber-700 dark:text-amber-300 space-y-0.5">
                    {addResult.failed.map((item, i) => (
                      <li key={i}>
                        {item.characterName} — {item.reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
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
              disabled={!canSubmit}
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
