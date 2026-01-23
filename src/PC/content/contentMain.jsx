import React from "react";
import { Link } from "react-router-dom";
import ContentSidebar from "./components/ContentSidebar";
import { CONTENT_IDS } from "./constants";

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
                className="px-6 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center font-medium text-gray-900 dark:text-white"
              >
                {value}
              </Link>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

export default ContentMain;
