import React, { useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import ContentSidebar from "./components/ContentSidebar";
import Characters from "./components/Characters";
import Group from "./components/Group";
import Party from "./components/Party";
import useContentDetail from "./useContentDetail";

function ContentDetail() {
  const { id } = useParams();
  const [showRecommendedFameOnly, setShowRecommendedFameOnly] = useState(true);
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
      <div className="mainbody">
        <div className="flex w-full gap-4">
          <ContentSidebar />
          <main className="flex-1 min-w-0 space-y-6">
            <h1 className="text-2xl font-bold">{currentLabel}</h1>
            <div className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">로그인이 필요합니다.</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                상단의 로그인 버튼을 클릭하여 로그인해주세요.
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="mainbody">
      <div className="flex w-full gap-4">
        <ContentSidebar />
        <main className="flex-1 min-w-0 space-y-6">
          <h1 className="text-2xl font-bold mt-2">{currentLabel} </h1>
          {(id === "azure_main" ||
            id === "goddess_of_death_temple" ||
            id === "freed_nightmare" ||
            id === "star_turtle_grand_library" ||
            id === "heretics_castle") && (
            <div className="mt-1.5 space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
              <p className="flex gap-1.5">
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 dark:bg-red-400 shrink-0"
                  style={{ marginTop: "calc(0.75em - 3px)" }}
                  aria-hidden
                />
                <span>
                  <span className="text-xl text-red-500 text-gray-700 dark:text-gray-300 font-bold">
                    주의{" "}
                  </span>
                  상급던전 클리어 기록 및 토별권 사용 내역은 API로 제공되지 않아, 드랍 기록으로
                  체크합니다. <br />
                  그렇기 때문에 레전더리 이상을 못 먹은 경우 혹은 토벌권은 클리어 처리가 안 됩니다.
                </span>
              </p>
              <p className="pl-[1.125rem]">
                상급던전 한정으로 수동 클리어 처리를 할 수 있게 만들었습니다.
              </p>
              {(id === "azure_main" ||
                id === "goddess_of_death_temple" ||
                id === "freed_nightmare") && (
                <div className="pl-[1.125rem] pt-1">
                  <button
                    type="button"
                    onClick={() => setShowRecommendedFameOnly((prev) => !prev)}
                    className="inline-flex items-center gap-2 select-none"
                    aria-pressed={showRecommendedFameOnly}
                  >
                    <span
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        showRecommendedFameOnly ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                          showRecommendedFameOnly ? "translate-x-5" : "translate-x-1"
                        }`}
                      />
                    </span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      명성 초과 캐릭터 숨기기 ( 적정 상급던전이 아닌 경우 )
                    </span>
                  </button>
                </div>
              )}
            </div>
          )}
          <Characters
            characters={characters}
            groups={groups}
            parties={parties}
            loading={charactersLoading}
            addedCharacterIds={addedCharacterIds}
            onMemoUpdate={handlers.handleMemoUpdate}
            onClearState={handlers.handleUpdateClearState}
            canEditMemo={isLoggedIn}
            contentName={id}
            showRecommendedFameOnly={showRecommendedFameOnly}
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
            onClearState={handlers.handleUpdateClearState}
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
            onClearState={handlers.handleUpdateClearState}
            onUpdatePartyName={handlers.handleUpdatePartyName}
            onUpdatePartyGroupName={handlers.handleUpdatePartyGroupName}
            canEditMemo={isLoggedIn}
            onAddCharacterToPublicGroup={handlers.handleAddCharacterToPublicGroup}
            onRemoveCharacterFromPublicGroup={handlers.handleRemoveCharacterFromPublicGroup}
          />
        </main>
      </div>
    </div>
  );
}

export default ContentDetail;
