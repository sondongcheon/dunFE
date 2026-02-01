import React from "react";
import { Link } from "react-router-dom";
import { CONTENT_IDS, CONTENT_BG_IMAGES } from "@/PC/content/constants";

/**
 * 모바일 컨텐츠 메인 페이지
 * - PWA/웹앱: safe-area, 터치 친화적 영역
 */
function MobileContentMain() {
  const contentEntries = Object.entries(CONTENT_IDS);

  return (
    <div className="mainMobileBody pb-20">
      <header
        className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="flex items-center h-12 px-4 max-w-[480px] mx-auto">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">
            컨텐츠
          </h1>
        </div>
      </header>

      <main className="pt-4 pb-6">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 px-1">
          콘텐츠를 선택하세요
        </p>
        <ul className="space-y-2">
          {contentEntries.map(([key, value]) => (
            <li key={key}>
              <Link
                to={`/content/${key}`}
                className="flex flex-col w-full min-h-[64px] p-1.5 rounded-xl border border-gray-200 dark:border-gray-700 font-medium text-white active:opacity-90 transition-opacity touch-manipulation"
              >
                <div
                  className="flex-1 min-h-0 rounded-lg overflow-hidden w-full relative flex items-center justify-between px-3 py-2"
                  style={{
                    backgroundImage: CONTENT_BG_IMAGES[key] ? `url(${CONTENT_BG_IMAGES[key]})` : undefined,
                    backgroundSize: "cover",
                    backgroundPosition: "center 15%",
                  }}
                >
                  <span className="absolute inset-0 bg-black/50 rounded-lg" aria-hidden />
                  <span className="relative z-10 truncate">{value}</span>
                  <span className="relative z-10 text-white/80 ml-2" aria-hidden="true">›</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}

export default MobileContentMain;
