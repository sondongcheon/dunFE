import React from "react";
import { useNavigate } from "react-router-dom";
import { CONTENT_IDS, CONTENT_BG_IMAGES } from "@/PC/content/constants";
import neopleLogo from "@/Assets/기술표기_가로형_color.png";

function TestPage() {
  const navigate = useNavigate();

  // 메인 컨텐츠 바로가기 목록
  const mainContentKeys = ["venus_goddess_of_beauty", "nabel", "inae", "diregie"];
  const contentList = mainContentKeys.map(key => [key, CONTENT_IDS[key]]);

  return (
    <div className="mainMobileBody pb-20">
      {/* 히어로 섹션 */}
      <section className="text-center py-8 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          DunRoot
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          던전앤파이터 파티 & 그룹 관리 서비스
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={() => navigate("/content")}
            className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg active:bg-blue-500 transition-colors"
          >
            시작하기
          </button>
          <button
            onClick={() => navigate("/notice")}
            className="px-5 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg active:bg-gray-50 dark:active:bg-gray-800 transition-colors"
          >
            공지사항
          </button>
        </div>
      </section>

      {/* 주요 기능 소개 */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 text-center">
          주요 기능
        </h2>
        <div className="space-y-3">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex items-center gap-4">
            <div className="text-2xl">👥</div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">그룹 관리</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                캐릭터를 그룹으로 묶어 효율적으로 관리
              </p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex items-center gap-4">
            <div className="text-2xl">🎉</div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">파티 시스템</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                다른 모험단과 함께 파티 구성
              </p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex items-center gap-4">
            <div className="text-2xl">✅</div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">클리어 체크</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                콘텐츠 클리어 현황을 한눈에 확인
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 컨텐츠 바로가기 */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 text-center">
          컨텐츠 바로가기
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {contentList.map(([key, value]) => (
            <button
              key={key}
              onClick={() => navigate(`/content/${key}`)}
              className="flex flex-col min-h-[72px] p-1.5 border border-gray-200 dark:border-gray-700 rounded-lg active:border-blue-400 dark:active:border-blue-500 transition-all"
            >
              <div
                className="flex-1 min-h-0 rounded-lg overflow-hidden w-full relative"
                style={{
                  backgroundImage: CONTENT_BG_IMAGES[key] ? `url(${CONTENT_BG_IMAGES[key]})` : undefined,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <span className="absolute inset-0 bg-black/50 rounded-lg" aria-hidden />
                <span className="relative z-10 flex items-center justify-center min-h-[60px] p-1.5 text-sm font-medium text-white text-center">
                  {value}
                </span>
              </div>
            </button>
          ))}
        </div>
        <div className="text-center mt-3">
          <button
            onClick={() => navigate("/content")}
            className="text-sm text-blue-600 dark:text-blue-400"
          >
            전체 컨텐츠 보기 →
          </button>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="text-center py-6 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          © 2026 DunRoot
        </p>
        <a
          href="http://developers.neople.co.kr"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block"
        >
          <img src={neopleLogo} alt="Neople 오픈 API" className="h-5 mx-auto" />
        </a>
      </footer>
    </div>
  );
}

export default TestPage;
