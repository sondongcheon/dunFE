import React from "react";
import { Link } from "react-router-dom";
import ContentSidebar from "./components/ContentSidebar";
import { CONTENT_IDS, CONTENT_BG_IMAGES } from "./constants";

/**
 * content 메인 페이지 (path variable 없을 때)
 */
function ContentMain() {
  const contentEntries = Object.entries(CONTENT_IDS);

  return (
    <div className="mainbody">
      <div className="flex w-full gap-4">
        <ContentSidebar />
        <main className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold mb-6">Content 메인 페이지</h1>
          <div className="grid grid-cols-2 gap-4">
            {contentEntries.map(([key, value]) => (
              <Link
                key={key}
                to={`/content/${key}`}
                className="flex flex-col min-h-[100px] p-1.5 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all"
              >
                <div
                  className="flex-1 min-h-0 rounded-lg overflow-hidden w-full relative flex items-center justify-center"
                  style={{
                    backgroundImage: CONTENT_BG_IMAGES[key] ? `url(${CONTENT_BG_IMAGES[key]})` : undefined,
                    backgroundSize: "cover",
                    backgroundPosition: "center 15%",
                  }}
                >
                  <span className="absolute inset-0 bg-black/50 rounded-lg" aria-hidden />
                  <span className="relative z-10 text-center text-base font-medium text-white px-4 py-2">
                    {value}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

export default ContentMain;
