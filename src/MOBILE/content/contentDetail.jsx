import React from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import Characters from "@/PC/content/components/Characters";
import Group from "@/PC/content/components/Group";
import Party from "@/PC/content/components/Party";
import useContentDetail from "@/PC/content/useContentDetail";

/**
 * 모바일 컨텐츠 상세 페이지
 * - useContentDetail 훅으로 PC와 동일 데이터/핸들러 사용
 * - 상단: 뒤로가기 + 콘텐츠 선택, 본문: Characters / Group / Party
 * - PWA: safe-area, 터치 친화적
 */
function MobileContentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    invalid,
    currentLabel,
    currentAdventureId,
    isLoggedIn,
    characters,
    groups,
    parties,
    charactersLoading,
    groupsLoading,
    partiesLoading,
    addedCharacterIds,
    handlers,
  } = useContentDetail(id);

  if (invalid) return <Navigate to="/content" replace />;

  if (!isLoggedIn) {
    return (
      <div className="mainMobileBody pb-20">
        <header
          className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700"
          style={{ paddingTop: "env(safe-area-inset-top)" }}
        >
          <div className="flex items-center h-12 px-2 max-w-[480px] mx-auto gap-2">
            <button
              type="button"
              onClick={() => navigate("/content")}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-600 dark:text-gray-400 touch-manipulation text-2xl"
              aria-label="뒤로"
            >
              ‹
            </button>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate flex-1">
              {currentLabel}
            </h1>
          </div>
        </header>
        <main className="pt-6 px-2">
          <div className="rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6 text-center bg-white dark:bg-gray-800">
            <p className="text-base text-gray-700 dark:text-gray-300 mb-2">
              로그인이 필요합니다.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              하단 메뉴에서 로그인해 주세요.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="mainMobileBody pb-20">
      <header
        className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="flex items-center h-12 px-2 max-w-[480px] mx-auto gap-2">
          <button
            type="button"
            onClick={() => navigate("/content")}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-600 dark:text-gray-400 touch-manipulation text-2xl"
            aria-label="컨텐츠 목록으로"
          >
            ‹
          </button>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate flex-1">
            {currentLabel}
          </h1>
        </div>
      </header>

      <main className="pt-4 space-y-6">
<Characters
        characters={characters}
        groups={groups}
        parties={parties}
        loading={charactersLoading}
        addedCharacterIds={addedCharacterIds}
        onMemoUpdate={handlers.handleMemoUpdate}
        canEditMemo={isLoggedIn}
      />
        <Group
          groups={groups}
          characters={characters}
          loading={groupsLoading}
          currentAdventureId={currentAdventureId}
          contentName={id}
          onCreateGroup={handlers.handleCreateGroup}
          onAddCharacter={handlers.handleAddCharacterToGroup}
          onRemoveCharacter={handlers.handleRemoveCharacterFromGroup}
          onMemoUpdate={handlers.handleMemoUpdate}
          onUpdateGroupName={handlers.handleUpdateGroupName}
          onRemoveGroup={handlers.handleRemoveGroup}
          canEditMemo={isLoggedIn}
        />
        <Party
          parties={parties}
          characters={characters}
          loading={partiesLoading}
          currentAdventureId={currentAdventureId}
          contentName={id}
          onCreateParty={handlers.handleCreateParty}
          onInviteAdventure={handlers.handleInviteAdventure}
          onCreatePartyGroup={handlers.handleCreatePartyGroup}
          onRemovePartyGroup={handlers.handleRemovePartyGroup}
          onRemoveParty={handlers.handleRemoveParty}
          onJoinParty={handlers.handleJoinParty}
          onMemoUpdate={handlers.handleMemoUpdate}
          onUpdatePartyName={handlers.handleUpdatePartyName}
          onUpdatePartyGroupName={handlers.handleUpdatePartyGroupName}
          canEditMemo={isLoggedIn}
          onAddCharacterToPublicGroup={handlers.handleAddCharacterToPublicGroup}
          onRemoveCharacterFromPublicGroup={handlers.handleRemoveCharacterFromPublicGroup}
        />
      </main>
    </div>
  );
}

export default MobileContentDetail;
