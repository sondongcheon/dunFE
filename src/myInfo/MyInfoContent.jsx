import React, { useCallback, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { fetchMyInfoCharacters } from "@/api/adventureApi";
import { updateCharacterMemo } from "@/api/contentApi";
import MyInfoCharacterList from "./MyInfoCharacterList";

/**
 * PC·모바일 공통: 내 정보 조회하기 (/my-info/me)
 * 캐릭터 목록: GET /adventure/my-info?adventureId=… (로그인 모험단)
 */
function MyInfoContent() {
  const isLoggedIn = Boolean(localStorage.getItem("adventureId"));
  const [characters, setCharacters] = useState([]);
  const [charactersLoading, setCharactersLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const loadCharacters = useCallback(async () => {
    if (!isLoggedIn) return;
    setCharactersLoading(true);
    setLoadError(null);
    try {
      const list = await fetchMyInfoCharacters();
      setCharacters(list);
    } catch (err) {
      console.error("내 정보 캐릭터 조회 실패:", err);
      setLoadError(
        err?.response?.data?.message || err?.message || "캐릭터 목록을 불러오지 못했습니다.",
      );
    } finally {
      setCharactersLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    loadCharacters();
  }, [loadCharacters]);

  const handleMemoUpdate = useCallback(async (characterId, memo) => {
    await updateCharacterMemo(characterId, memo);
    setCharacters((prev) => prev.map((c) => (c.id === characterId ? { ...c, memo } : c)));
  }, []);

  if (!isLoggedIn) {
    return <Navigate to="/content" replace />;
  }

  if (loadError) {
    return (
      <div className="rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50/80 dark:bg-red-950/30 p-4 text-sm text-red-700 dark:text-red-300">
        {loadError}
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 min-h-[120px] rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-600 bg-gray-50/80 dark:bg-gray-800/40 p-4 flex items-center justify-center">
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">BETA TESTING</p>
      </div>
      <MyInfoCharacterList
        characters={characters}
        loading={charactersLoading}
        onMemoUpdate={handleMemoUpdate}
        canEditMemo
      />
    </>
  );
}

export default MyInfoContent;
