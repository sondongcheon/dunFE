import React, { useState } from "react";
import MyInfoCharacterCard from "./MyInfoCharacterCard";

/**
 * 내 정보 페이지 전용 캐릭터 목록 (Characters 컴포넌트 미사용)
 */
function MyInfoCharacterList({
  characters = [],
  loading = false,
  onMemoUpdate,
  canEditMemo = false,
}) {
  /** null: 카드 테두리는 전체 클리어(clearState) 기준. 값: 해당 컨텐츠 클리어 여부로 모든 카드 테두리 통일 */
  const [borderFocusContentId, setBorderFocusContentId] = useState(null);

  const handleToggleBorderFocus = (contentId) => {
    setBorderFocusContentId((prev) => (prev === contentId ? null : contentId));
  };
  if (loading) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400 py-6">로딩 중...</p>
    );
  }

  if (!characters.length) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400 py-6">
        캐릭터가 없습니다.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-x-4 lg:gap-y-5">
      {characters.map((character) => (
        <MyInfoCharacterCard
          key={character.id}
          character={character}
          onMemoUpdate={onMemoUpdate}
          canEditMemo={canEditMemo}
          borderFocusContentId={borderFocusContentId}
          onToggleBorderFocus={handleToggleBorderFocus}
        />
      ))}
    </div>
  );
}

export default MyInfoCharacterList;
