import React, { useState, useRef, useEffect } from "react";

/**
 * 클릭 시 편집 가능한 메모 컴포넌트
 * 메모 없을 때 "메모없음" 표시, 클릭 시 input으로 전환
 * @param {number} characterId - 캐릭터 ID
 * @param {string|null} memo - 메모 내용
 * @param {Function} onSave - (characterId, memo) => Promise
 * @param {boolean} disabled - 편집 비활성화 (다른 유저 캐릭터 등)
 * @param {string} className - 추가 스타일
 */
function EditableMemo({ characterId, memo, onSave, disabled = false, className = "" }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(memo ?? "");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    setEditValue(memo ?? "");
  }, [memo]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleClick = () => {
    if (disabled || saving) return;
    setIsEditing(true);
    setEditValue(memo ?? "");
  };

  const handleSave = async () => {
    if (saving) return;
    const trimmed = editValue?.trim() ?? "";
    const newMemo = trimmed === "" ? "" : trimmed;
    if (String(memo ?? "") === String(newMemo)) {
      setIsEditing(false);
      return;
    }
    setSaving(true);
    try {
      await onSave(characterId, newMemo);
      setIsEditing(false);
    } catch (err) {
      console.error("메모 저장 실패:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleBlur = () => {
    handleSave();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      inputRef.current?.blur();
    }
    if (e.key === "Escape") {
      setEditValue(memo ?? "");
      setIsEditing(false);
      inputRef.current?.blur();
    }
  };

  if (disabled) {
    return (
      <span className={`text-xs text-gray-500 dark:text-gray-500 ${className}`} title={memo || "메모없음"}>
        · {memo ? memo : "메모없음"}
      </span>
    );
  }

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        disabled={saving}
        placeholder="메모 입력 (없으면 비움)"
        className={`text-xs px-1 py-0.5 border border-purple-300 dark:border-purple-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white min-w-[80px] max-w-[200px] ${className}`}
        onClick={(e) => e.stopPropagation()}
      />
    );
  }

  const displayText = memo && memo.trim() ? memo : "메모없음";
  const isEmpty = !memo || !memo.trim();

  return (
    <span
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
      className={`text-xs text-gray-500 dark:text-gray-500 cursor-pointer hover:text-purple-600 dark:hover:text-purple-400 hover:underline ${isEmpty ? "italic" : ""} ${className}`}
      title="클릭하여 수정"
    >
      · {displayText}
    </span>
  );
}

export default EditableMemo;
