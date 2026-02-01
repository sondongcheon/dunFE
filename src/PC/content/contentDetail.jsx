import React from "react";
import { useParams, Navigate } from "react-router-dom";
import ContentSidebar from "./components/ContentSidebar";
import Characters from "./components/Characters";
import Group from "./components/Group";
import Party from "./components/Party";
import useContentDetail from "./useContentDetail";

function ContentDetail() {
  const { id } = useParams();
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
            <h1 className="text-2xl font-bold">Content - {currentLabel}</h1>
            <div className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">
                로그인이 필요합니다.
              </p>
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
          <h1 className="text-2xl font-bold">Content - {currentLabel}</h1>
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
    </div>
  );
}

export default ContentDetail;
